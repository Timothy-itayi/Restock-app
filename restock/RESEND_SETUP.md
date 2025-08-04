# Resend Email Service Setup Guide

## Overview
This guide walks through setting up Resend email service integration with the Restock app to enable actual email sending to suppliers.

## Prerequisites
- Supabase project with Edge Functions enabled
- Domain name for email sending (e.g., `restockapp.com`)
- Resend account (free tier available)

## Step 1: Resend Account Setup

### 1.1 Create Resend Account
1. Visit [resend.com](https://resend.com) and create an account
2. Verify your email address
3. Navigate to the dashboard

### 1.2 Domain Verification
1. Go to **Domains** in the Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `emails.restockapp.com` or `restockapp.com`)
4. Configure DNS records as instructed:
   - **SPF Record**: `v=spf1 include:_spf.resend.com ~all`
   - **DKIM Records**: Add the provided DKIM keys
   - **DMARC Record**: `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com`

### 1.3 Get API Key
1. Go to **API Keys** in the Resend dashboard
2. Click **Create API Key**
3. Name it "Restock App Production" or similar
4. Select **Full access** or **Sending access**
5. Copy the API key (starts with `re_`)

## Step 2: Supabase Configuration

### 2.1 Environment Variables
Add the Resend API key to your Supabase project:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Edge Functions**
3. Add environment variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Your Resend API key from Step 1.3

### 2.2 Deploy Edge Function
Deploy the new send-email function to Supabase:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Deploy the send-email function
supabase functions deploy send-email --project-ref YOUR_PROJECT_REF
```

### 2.3 Update Function URL
Update your `.env` file to include the new send-email function URL:

```env
# Add this line to your .env file
EXPO_PUBLIC_SUPABASE_SEND_EMAIL_URL=https://YOUR_PROJECT_REF.functions.supabase.co/send-email
```

## Step 3: Database Schema Updates

Add the new email tracking fields to your `emails_sent` table:

```sql
-- Add new columns for Resend integration
ALTER TABLE emails_sent 
ADD COLUMN delivery_status TEXT,
ADD COLUMN sent_via TEXT DEFAULT 'resend',
ADD COLUMN tracking_id TEXT,
ADD COLUMN resend_webhook_data JSONB,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for tracking_id for webhook lookups
CREATE INDEX idx_emails_sent_tracking_id ON emails_sent(tracking_id);

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_emails_sent_updated_at 
    BEFORE UPDATE ON emails_sent 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## Step 4: Testing the Integration

### 4.1 Test Email Sending
Create a test script to verify the email sending works:

```javascript
// test-resend-integration.js
const response = await fetch('https://YOUR_PROJECT_REF.functions.supabase.co/send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_SUPABASE_ANON_KEY',
    'apikey': 'YOUR_SUPABASE_ANON_KEY',
  },
  body: JSON.stringify({
    to: 'test@example.com',
    replyTo: 'storeowner@example.com',
    subject: 'Test Restock Order',
    body: 'This is a test email from the Restock app.',
    storeName: 'Test Store',
    supplierName: 'Test Supplier'
  })
});

const result = await response.json();
console.log('Email sent:', result);
```

### 4.2 Verify Email Delivery
1. Check your Resend dashboard for sent emails
2. Verify the email appears in the recipient's inbox
3. Test that Reply-To functionality works correctly

## Step 5: Webhook Setup (Optional)

To track email delivery status, set up webhooks:

### 5.1 Create Webhook Endpoint
1. Create a new Supabase Edge Function for webhooks:
   ```bash
   supabase functions new resend-webhook
   ```

2. Implement webhook handling in the function

### 5.2 Configure Resend Webhook
1. In Resend dashboard, go to **Webhooks**
2. Click **Add Webhook**
3. Set URL to: `https://YOUR_PROJECT_REF.functions.supabase.co/resend-webhook`
4. Select events: `email.sent`, `email.delivered`, `email.bounced`, etc.
5. Save the webhook

## Step 6: Update App Configuration

### 6.1 Environment Variables
Update your app's `.env` file with the correct function URLs:

```env
# Update existing
EXPO_PUBLIC_SUPABASE_FUNCTION_URL=https://YOUR_PROJECT_REF.functions.supabase.co/generate-email

# Add new
EXPO_PUBLIC_SUPABASE_SEND_EMAIL_URL=https://YOUR_PROJECT_REF.functions.supabase.co/send-email
```

### 6.2 Update Email Service
The `EmailService` class in `backend/services/emails.ts` has been updated to use the new Resend integration. No additional changes needed.

## Step 7: Production Considerations

### 7.1 Email Limits
- **Resend Free Tier**: 3,000 emails/month, 100 emails/day
- **Paid Plans**: Higher limits available
- Monitor usage through Resend dashboard

### 7.2 Deliverability Best Practices
1. **Domain Reputation**: Use a subdomain like `emails.restockapp.com`
2. **Email Content**: Keep professional, avoid spam trigger words
3. **List Hygiene**: Remove bounced/invalid email addresses
4. **Authentication**: Ensure SPF, DKIM, and DMARC are properly configured

### 7.3 Error Handling
- Monitor failed emails through the app dashboard
- Set up alerts for high bounce rates
- Implement retry logic for temporary failures

## Troubleshooting

### Common Issues
1. **DNS Propagation**: Domain verification can take up to 24 hours
2. **API Key Scope**: Ensure API key has sending permissions
3. **Rate Limits**: Check Resend limits if emails fail
4. **Supabase Function Errors**: Check function logs in Supabase dashboard

### Support Resources
- [Resend Documentation](https://resend.com/docs)
- [Supabase Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Email Deliverability Best Practices](https://resend.com/docs/send-with-nodejs)

## Security Notes
- Never expose API keys in client-side code
- Use environment variables for all sensitive data
- Regularly rotate API keys
- Monitor for unusual sending patterns

---

## Next Steps After Setup
1. Test email sending with real supplier addresses
2. Monitor delivery rates and bounces
3. Implement email analytics dashboard
4. Set up automated follow-up sequences
5. Consider implementing email templates for different scenarios