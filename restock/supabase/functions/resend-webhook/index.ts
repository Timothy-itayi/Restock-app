// supabase/functions/resend-webhook/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ResendWebhookEvent {
  type: string; // 'email.sent', 'email.delivered', 'email.bounced', etc.
  created_at: string;
  data: {
    created_at: string;
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
    tags?: Array<{ name: string; value: string; }>;
    // Additional fields based on event type
    bounce?: {
      type: string;
      message: string;
    };
    complaint?: {
      type: string;
      message: string;
    };
    delivery?: {
      timestamp: string;
    };
  };
}

interface WebhookPayload {
  type: string;
  data: ResendWebhookEvent;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-resend-signature',
      },
    });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ 
        error: "Method not allowed",
        expected: "POST"
      }), {
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        },
        status: 405,
      });
    }

    // Get webhook signature for verification
    const signature = req.headers.get('x-resend-signature');
    const body = await req.text();
    
    // Verify webhook signature (in production)
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');
    if (webhookSecret && signature) {
      const isValid = await verifyWebhookSignature(body, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(JSON.stringify({ 
          error: "Invalid signature" 
        }), {
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
          },
          status: 401,
        });
      }
    }

    // Parse webhook payload
    const webhookData: WebhookPayload = JSON.parse(body);
    console.log('Received webhook:', webhookData.type, webhookData.data);

    // Process the webhook event
    const result = await processWebhookEvent(webhookData);
    
    if (result.success) {
      return new Response(JSON.stringify({ 
        success: true,
        processed: result.processed,
        timestamp: new Date().toISOString()
      }), {
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false,
        error: result.error,
        timestamp: new Date().toISOString()
      }), {
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        },
        status: 500,
      });
    }

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      success: false,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    });
  }
});

async function processWebhookEvent(webhookData: WebhookPayload) {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const event = webhookData.data;
    
    // Map Resend event types to our delivery status
    const deliveryStatus = mapEventTypeToStatus(webhookData.type);
    
    // Find email record by Resend message ID
    const { data: emailRecord, error: findError } = await supabase
      .from('emails_sent')
      .select('id, status')
      .eq('tracking_id', event.data.email_id)
      .single();

    if (findError) {
      console.log('Email record not found for tracking ID:', event.data.email_id);
      return { 
        success: true, 
        processed: false, 
        reason: 'Email record not found' 
      };
    }

    // Update email record with delivery status
    const updateData = {
      delivery_status: deliveryStatus,
      resend_webhook_data: JSON.stringify(event),
      updated_at: new Date().toISOString()
    };

    // Update status if it's a significant change
    if (deliveryStatus === 'bounced' || deliveryStatus === 'complained') {
      updateData.status = 'failed';
      updateData.error_message = getBounceOrComplaintMessage(event);
    } else if (deliveryStatus === 'delivered' && emailRecord.status === 'sent') {
      // Keep status as 'sent' but update delivery_status
    }

    const { error: updateError } = await supabase
      .from('emails_sent')
      .update(updateData)
      .eq('id', emailRecord.id);

    if (updateError) {
      throw new Error(`Failed to update email record: ${updateError.message}`);
    }

    // Log webhook event for analytics
    await logWebhookEvent(supabase, {
      email_id: emailRecord.id,
      event_type: webhookData.type,
      delivery_status: deliveryStatus,
      resend_message_id: event.data.email_id,
      webhook_data: event,
      timestamp: event.created_at
    });

    console.log(`Updated email ${emailRecord.id} with delivery status: ${deliveryStatus}`);
    
    return { 
      success: true, 
      processed: true,
      emailId: emailRecord.id,
      deliveryStatus 
    };

  } catch (error) {
    console.error('Error processing webhook event:', error);
    return { success: false, error: error.message };
  }
}

function mapEventTypeToStatus(eventType: string): string {
  switch (eventType) {
    case 'email.sent':
      return 'sent';
    case 'email.delivered':
      return 'delivered';
    case 'email.bounced':
      return 'bounced';
    case 'email.complained':
      return 'complained';
    case 'email.clicked':
      return 'clicked';
    case 'email.opened':
      return 'opened';
    default:
      return 'unknown';
  }
}

function getBounceOrComplaintMessage(event: ResendWebhookEvent): string {
  if (event.data.bounce) {
    return `Bounce: ${event.data.bounce.type} - ${event.data.bounce.message}`;
  }
  if (event.data.complaint) {
    return `Complaint: ${event.data.complaint.type} - ${event.data.complaint.message}`;
  }
  return 'Email delivery failed';
}

async function logWebhookEvent(supabase: any, eventData: any) {
  try {
    await supabase
      .from('email_webhook_events')
      .insert([eventData]);
  } catch (error) {
    console.error('Failed to log webhook event:', error);
    // Don't throw error - webhook processing should continue
  }
}

async function verifyWebhookSignature(
  payload: string, 
  signature: string, 
  secret: string
): Promise<boolean> {
  try {
    // Resend uses HMAC SHA-256 for webhook signature verification
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    const expectedHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Resend signature format: "sha256=<hex>"
    const providedHex = signature.replace('sha256=', '');
    
    return expectedHex === providedHex;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}