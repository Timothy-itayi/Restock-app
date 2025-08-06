#!/bin/bash

# Simple Resend deployment script for your Restock app
set -e

echo "🚀 Deploying Resend Integration"
echo "==============================="

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Get project reference
if [ -z "$1" ]; then
    echo "📝 Enter your Supabase project reference (found in your Supabase Dashboard URL):"
    read -p "Project ref: " PROJECT_REF
else
    PROJECT_REF=$1
fi

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project reference is required"
    exit 1
fi

echo "📡 Deploying send-email function to project: $PROJECT_REF"

# Deploy the function
if supabase functions deploy send-email --project-ref "$PROJECT_REF"; then
    echo "✅ Function deployed successfully!"
else
    echo "❌ Deployment failed. Check the error above."
    exit 1
fi

echo ""
echo "🔧 Next steps:"
echo "1. Add your Resend API key to Supabase:"
echo "   - Go to Supabase Dashboard → Settings → Edge Functions"
echo "   - Add environment variable: RESEND_API_KEY = re_your_api_key"
echo ""
echo "2. Test the integration:"
echo "   node scripts/test-resend-dev.js"
echo ""
echo "3. Your function URL:"
echo "   https://$PROJECT_REF.functions.supabase.co/send-email"
echo ""
echo "🎉 Ready to test!"