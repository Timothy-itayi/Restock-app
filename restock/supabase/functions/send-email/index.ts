// @ts-nocheck
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

interface TestEmailRequest {
  testEmail: string;
  storeName?: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Get Resend API key from environment
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      return createResponse({
        success: false,
        error: "Resend API key not configured",
        instructions: "Add RESEND_API_KEY environment variable in Supabase Edge Functions settings"
      }, 500);
    }
    
    // Route requests
    if (req.method === 'GET' && pathname.includes('/test')) {
      return await handleTest(resendApiKey);
    }
    
    if (req.method === 'POST' && pathname.includes('/test')) {
      return await handleTestEmail(req, resendApiKey);
    }
    
    if (req.method === 'POST' && pathname.includes('/bulk')) {
      return await handleBulkSend(req, resendApiKey);
    }
    
    if (req.method === 'POST') {
      return await handleSingleSend(req, resendApiKey);
    }

    if (req.method === 'GET') {
      return createResponse({
        message: "Resend Email Service",
        status: "running",
        domain: "restockapp.email",
        endpoints: {
          "GET /test": "Test API connection",
          "POST /": "Send single email",
          "POST /bulk": "Send bulk emails",
          "POST /test": "Send test email"
        }
      });
    }

    return createResponse({ error: "Method not allowed" }, 405);

  } catch (error) {
    console.error('Send email function error:', error);
    return createResponse({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Handler Functions
async function handleTest(resendApiKey: string): Promise<Response> {
  try {
    // Test API key by calling Resend domains endpoint
    const testResponse = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (testResponse.ok) {
      const domains = await testResponse.json();
      const restockDomain = domains.data?.find((d: any) => 
        d.name === 'restockapp.email'
      );

      return createResponse({
        success: true,
        message: "Resend API connection successful",
        apiKey: "✅ Valid",
        domain: restockDomain ? {
          name: restockDomain.name,
          status: restockDomain.status,
          verified: restockDomain.status === 'verified'
        } : {
          name: "restockapp.email",
          status: "not found",
          verified: false
        },
        timestamp: new Date().toISOString()
      });
    } else {
      return createResponse({
        success: false,
        error: "Invalid API key or API error",
        status: testResponse.status
      }, 401);
    }
  } catch (error) {
    return createResponse({
      success: false,
      error: "Failed to test API connection",
      details: error.message
    }, 500);
  }
}

async function handleTestEmail(req: Request, resendApiKey: string): Promise<Response> {
  try {
    const { testEmail, storeName = "Restock App Test" }: TestEmailRequest = await req.json();

    if (!testEmail) {
      return createResponse({
        success: false,
        error: "testEmail is required"
      }, 400);
    }

    const testEmailData: SendEmailRequest = {
      to: testEmail,
      replyTo: testEmail,
      subject: `Test Email from ${storeName}`,
      body: `Hello!\n\nThis is a test email from your Restock App.\n\n✅ Email sending is working correctly\n✅ Your domain is configured properly\n✅ Reply-to functionality is active\n\nYou can now send emails to your suppliers.\n\nBest regards,\nThe Restock App Team`,
      storeName,
      supplierName: "Test Recipient"
    };

    const result = await sendSingleEmail(resendApiKey, testEmailData);

    return createResponse({
      success: true,
      message: "Test email sent successfully",
      messageId: result.id,
      to: testEmail,
      from: "noreply@restockapp.email",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createResponse({
      success: false,
      error: "Test email failed",
      details: error.message
    }, 500);
  }
}

// Single email handler - for your app's EmailService
async function handleSingleSend(req: Request, resendApiKey: string): Promise<Response> {
  try {
    const emailData: SendEmailRequest = await req.json();
    
    // Validate required fields
    if (!emailData.to || !emailData.subject || !emailData.body || !emailData.replyTo) {
      return createResponse({
        success: false,
        error: "Missing required fields",
        required: ["to", "subject", "body", "replyTo"],
        received: Object.keys(emailData)
      }, 400);
    }

    const result = await sendSingleEmail(resendApiKey, emailData);
    
    return createResponse({
      success: true,
      messageId: result.id,
      to: emailData.to,
      emailId: emailData.emailId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createResponse({
      success: false,
      error: "Email sending failed",
      details: error.message
    }, 500);
  }
}

// Bulk email handler - for your app's EmailService
async function handleBulkSend(req: Request, resendApiKey: string): Promise<Response> {
  try {
    const { emails, sessionId }: BulkSendEmailRequest = await req.json();
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return createResponse({
        success: false,
        error: "No emails provided for bulk send"
      }, 400);
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

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return createResponse({
      success: true,
      sessionId,
      results,
      totalSent: successCount,
      totalFailed: failureCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return createResponse({
      success: false,
      error: "Bulk send failed",
      details: error.message
    }, 500);
  }
}

// Utility: sanitize tag values to allowed characters [A-Za-z0-9_-]
function sanitizeTagValue(value: string | undefined | null, fallback: string): string {
  try {
    const sanitized = String(value ?? '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_-]/g, '')
      .replace(/_+/g, '_')
      .replace(/^-+|-+$/g, '');
    return sanitized.length > 0 ? sanitized : fallback;
  } catch (_) {
    return fallback;
  }
}

// Core email sending function
async function sendSingleEmail(resendApiKey: string, emailData: SendEmailRequest) {
  const formattedBody = `${emailData.body}\n\n---\nThis email was sent on behalf of ${emailData.storeName}.\nPlease reply directly to this email to contact the store.`;

  const resendPayload = {
    from: 'Restock App <noreply@restockapp.email>',
    to: [emailData.to],
    reply_to: emailData.replyTo,
    subject: emailData.subject,
    text: formattedBody,
    html: formatEmailAsHtml(emailData.body, emailData.storeName),
    tags: [
      { name: 'app', value: 'restock' },
      { name: 'store', value: sanitizeTagValue(emailData.storeName, 'store') },
      { name: 'supplier', value: sanitizeTagValue(emailData.supplierName, 'supplier') },
      ...(emailData.sessionId ? [{ name: 'session', value: sanitizeTagValue(emailData.sessionId, 'session') }] : [])
    ]
  };

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

  return await resendResponse.json();
}

// Utility Functions
function formatEmailAsHtml(body: string, storeName: string): string {
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

function createResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    headers: { 
      "Content-Type": "application/json",
      'Access-Control-Allow-Origin': '*',
    },
    status,
  });
}