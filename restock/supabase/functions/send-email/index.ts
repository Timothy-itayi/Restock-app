// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

interface SendEmailRequest {
  to: string; // Supplier email
  replyTo: string; // Store owner email
  subject: string;
  body: string;
  storeName: string;
  supplierName: string;
  sessionId?: string;
  emailId?: string; // For tracking in database
}

interface BulkSendEmailRequest {
  emails: SendEmailRequest[];
  sessionId: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const isBulkSend = url.pathname.includes('/bulk');
    
    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ 
        error: "Resend API key not configured" 
      }), {
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        },
        status: 500,
      });
    }

    if (isBulkSend) {
      // Handle bulk email sending
      const { emails, sessionId }: BulkSendEmailRequest = await req.json();
      
      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return new Response(JSON.stringify({ 
          error: "No emails provided for bulk send" 
        }), {
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
          },
          status: 400,
        });
      }

      const results = [];
      
      for (const emailData of emails) {
        try {
          const result = await sendSingleEmail(resendApiKey, emailData);
          results.push({
            emailId: emailData.emailId,
            success: true,
            messageId: result.id,
            to: emailData.to
          });
        } catch (error) {
          results.push({
            emailId: emailData.emailId,
            success: false,
            error: error.message,
            to: emailData.to
          });
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        sessionId,
        results,
        totalSent: results.filter(r => r.success).length,
        totalFailed: results.filter(r => !r.success).length
      }), {
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        },
        status: 200,
      });

    } else {
      // Handle single email sending
      const emailData: SendEmailRequest = await req.json();
      
      // Validate required fields
      if (!emailData.to || !emailData.subject || !emailData.body || !emailData.replyTo) {
        return new Response(JSON.stringify({ 
          error: "Missing required fields: to, subject, body, replyTo" 
        }), {
          headers: { 
            "Content-Type": "application/json",
            'Access-Control-Allow-Origin': '*',
          },
          status: 400,
        });
      }

      const result = await sendSingleEmail(resendApiKey, emailData);
      
      return new Response(JSON.stringify({ 
        success: true,
        messageId: result.id,
        to: emailData.to,
        emailId: emailData.emailId
      }), {
        headers: { 
          "Content-Type": "application/json",
          'Access-Control-Allow-Origin': '*',
        },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Send email function error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error',
      success: false
    }), {
      headers: { 
        "Content-Type": "application/json",
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    });
  }
});

async function sendSingleEmail(resendApiKey: string, emailData: SendEmailRequest) {
  // Format the email body with proper styling
  const formattedBody = `
    ${emailData.body}
    
    ---
    This email was sent on behalf of ${emailData.storeName}.
    Please reply directly to this email to contact the store.
  `;

  // Prepare Resend API request
  const resendPayload = {
    from: 'Restock App <noreply@emails.restockapp.com>', // This will be updated with your actual domain
    to: [emailData.to],
    reply_to: emailData.replyTo,
    subject: emailData.subject,
    text: formattedBody,
    html: formatEmailAsHtml(emailData.body, emailData.storeName),
    tags: [
      { name: 'app', value: 'restock' },
      { name: 'store', value: emailData.storeName },
      { name: 'supplier', value: emailData.supplierName },
      ...(emailData.sessionId ? [{ name: 'session', value: emailData.sessionId }] : [])
    ]
  };

  // Send email via Resend API
  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resendPayload),
  });

  if (!resendResponse.ok) {
    const errorData = await resendResponse.text();
    console.error('Resend API error:', errorData);
    throw new Error(`Resend API error: ${resendResponse.status} - ${errorData}`);
  }

  const result = await resendResponse.json();
  return result;
}

function formatEmailAsHtml(body: string, storeName: string): string {
  // Convert plain text body to HTML with basic formatting
  const htmlBody = body
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/•\s*/g, '&bull; ');

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Restock Order</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px;">${htmlBody}</p>
        </div>
        
        <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 20px; font-size: 14px; color: #6c757d;">
            <p>This email was sent on behalf of <strong>${storeName}</strong> using Restock App.</p>
            <p>Please reply directly to this email to contact the store.</p>
        </div>
    </body>
    </html>
  `;
}