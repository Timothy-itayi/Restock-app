# Groq Email Generation Implementation

## Overview

This implementation uses **Groq's Mixtral-8x7b-32768 model** via a **Supabase Edge Function** to generate professional restock order emails. This approach provides:

- ✅ **Fast inference** (Groq is optimized for speed)
- ✅ **No local model downloads** (cloud-based)
- ✅ **Secure API key management** (stored in Supabase secrets)
- ✅ **Scalable architecture** (Edge Function handles the load)
- ✅ **Professional email quality** (state-of-the-art model)

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Native  │───▶│  Supabase Edge   │───▶│   Groq API      │
│      App        │    │    Function      │    │   (Mixtral)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Files Structure

```
restock/
├── supabase/
│   └── functions/
│       └── generate-email/
│           └── index.ts              # Edge Function
├── backend/services/ai/
│   ├── groq-email-client.ts          # Groq client
│   ├── email-generator.ts            # Main orchestrator
│   └── types.ts                      # TypeScript types
├── scripts/
│   ├── setup-groq-email.js           # Setup script
│   └── test-groq-email.js            # Test script
└── package.json                      # Scripts added
```

## Setup Instructions

### 1. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or download from: https://supabase.com/docs/guides/cli
```

### 2. Initialize Supabase (if not already done)

```bash
supabase init
```

### 3. Set Your Groq API Key

```bash
supabase secrets set GROQ_API_KEY=your_actual_groq_api_key
```

### 4. Deploy the Edge Function

```bash
supabase functions deploy generate-email
```

### 5. Get Your Function URL

```bash
supabase functions list
```

### 6. Update Environment Variables

Add to your `.env` file:
```
EXPO_PUBLIC_SUPABASE_FUNCTION_URL=https://your-project-id.functions.supabase.co/generate-email
```

### 7. Test the Implementation

```bash
npm run test-groq-email
```

## Usage in the App

### Email Generation Flow

1. **User completes restock session**
2. **Clicks "Generate Emails"**
3. **App calls Supabase Edge Function**
4. **Function calls Groq API**
5. **Returns professional emails**
6. **User reviews and sends**

### Code Example

```typescript
import { EmailGenerator } from '../backend/services/ai';

const emailGenerator = new EmailGenerator();
await emailGenerator.initialize();

const emails = await emailGenerator.generateEmailsForSession(
  sessionId, 
  userId,
  { tone: 'professional', urgency: 'normal' },
  (progress) => {
    // Update UI with progress
    console.log(`${progress.message} - ${progress.progress}%`);
  }
);
```

## Edge Function Details

### Input Format

```typescript
interface EmailRequest {
  supplier: string;           // Supplier name
  email: string;              // Supplier email
  products: Array<{           // Product list
    name: string;
    quantity: number;
  }>;
  user: string;               // User name
  storeName: string;          // Store name
  urgency?: 'normal' | 'urgent' | 'rush';
  tone?: 'professional' | 'friendly' | 'formal';
}
```

### Output Format

```typescript
{
  subject: string;            // Email subject
  body: string;               // Full email content
  emailText: string;          // Same as body
  confidence: number;         // Generation confidence
  generationTime: number;     // Timestamp
}
```

### Prompt Engineering

The Edge Function uses a structured prompt:

```
You are a professional grocery store manager writing a restock order email.

STORE: [Store Name]
SUPPLIER: [Supplier Name]
SUPPLIER EMAIL: [Email]

PRODUCTS NEEDED:
• [Quantity]x [Product Name]
• [Quantity]x [Product Name]

TONE: [Tone] and courteous, maintaining business relationship
URGENCY: [Urgency level]
MAX LENGTH: 300 words

Generate a professional restock order email with:
1. Appropriate greeting using supplier name
2. Clear product list with quantities
3. Professional closing with store contact
4. No pricing discussion needed
5. Include a subject line at the beginning

Format the response as:
Subject: [Subject Line]

[Email Body]
```

## Features

### ✅ Implemented

- **Multi-supplier email generation**
- **Progress tracking and UI updates**
- **Error handling and fallbacks**
- **Tone customization** (professional, friendly, formal)
- **Urgency levels** (normal, urgent, rush)
- **CORS support** for cross-origin requests
- **Input validation** and error responses
- **Professional email templates**

### 🔄 Planned Enhancements

- **Email history tracking**
- **Supplier relationship context**
- **Custom email templates**
- **Batch email sending**
- **Email analytics**

## Testing

### Manual Testing

```bash
# Test the Edge Function directly
npm run test-groq-email

# Test the full app flow
npm run test-email-generation
```

### Test Cases

1. **Basic email generation** - Single supplier, normal urgency
2. **Multi-supplier generation** - Multiple suppliers in one session
3. **Urgent orders** - Rush delivery requests
4. **Different tones** - Professional vs friendly
5. **Error handling** - Invalid inputs, API failures
6. **Progress tracking** - UI updates during generation

## Troubleshooting

### Common Issues

1. **"Function not accessible"**
   - Check if function is deployed: `supabase functions list`
   - Verify function URL in environment variables

2. **"Groq API error"**
   - Verify API key is set: `supabase secrets list`
   - Check Groq account status and credits

3. **"CORS error"**
   - Edge Function includes CORS headers
   - Check if calling from allowed origin

4. **"Missing required fields"**
   - Ensure all required fields are provided
   - Check data structure matches interface

### Debug Commands

```bash
# Check function status
supabase functions list

# View function logs
supabase functions logs generate-email

# Test function locally
supabase functions serve generate-email

# Check secrets
supabase secrets list
```

## Performance

### Benchmarks

- **Model**: Mixtral-8x7b-32768
- **Average response time**: ~2-5 seconds
- **Token limit**: 32,768 tokens
- **Cost**: ~$0.50 per 1M tokens

### Optimization

- **Prompt optimization** for faster responses
- **Caching** for repeated requests
- **Batch processing** for multiple emails
- **Async processing** with progress updates

## Security

### API Key Management

- ✅ Stored in Supabase secrets (encrypted)
- ✅ Never exposed to client-side code
- ✅ Rotatable via Supabase CLI
- ✅ Environment-specific keys

### Input Validation

- ✅ Required field validation
- ✅ Email format validation
- ✅ Product data validation
- ✅ Rate limiting (via Supabase)

## Migration from Local Model

### Changes Made

1. **Replaced** `LocalModelClient` with `GroqEmailClient`
2. **Updated** `EmailGenerator` to use Groq
3. **Removed** local model dependencies
4. **Added** Edge Function infrastructure
5. **Enhanced** error handling and progress tracking

### Benefits

- **No device storage** required for models
- **Better performance** with Groq's optimized inference
- **More reliable** cloud-based processing
- **Easier maintenance** and updates
- **Professional quality** emails

## Next Steps

1. **Deploy Edge Function** to your Supabase project
2. **Set Groq API key** in Supabase secrets
3. **Update environment variables** with function URL
4. **Test the implementation** with sample data
5. **Integrate with app** and test full flow

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Supabase Edge Function logs
- Verify Groq API key and account status
- Test with the provided test scripts 