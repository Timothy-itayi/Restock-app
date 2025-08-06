#!/bin/bash

echo "🚀 Deploying send-email function for Resend integration"
echo "======================================================"

# Get project reference from user
if [ -z "$1" ]; then
    echo "Please provide your Supabase project reference."
    echo "You can find this in your Supabase Dashboard URL:"
    echo "https://supabase.com/dashboard/project/[PROJECT_REF]"
    echo ""
    read -p "Enter your project reference: " PROJECT_REF
else
    PROJECT_REF=$1
fi

if [ -z "$PROJECT_REF" ]; then
    echo "❌ Project reference is required"
    exit 1
fi

echo "📡 Deploying to project: $PROJECT_REF"
echo ""

# Deploy the send-email function
echo "🔧 Deploying send-email function..."
if supabase functions deploy send-email --project-ref "$PROJECT_REF"; then
    echo ""
    echo "✅ send-email function deployed successfully!"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Make sure your RESEND_API_KEY is set in Supabase Edge Functions settings"
    echo "2. Test the function with: "
    echo "   curl 'https://$PROJECT_REF.functions.supabase.co/send-email/test'"
    echo ""
    echo "3. Your function URL is:"
    echo "   https://$PROJECT_REF.functions.supabase.co/send-email"
    echo ""
    echo "🎉 Ready to test!"
else
    echo ""
    echo "❌ Deployment failed. Common issues:"
    echo "1. Make sure you're authenticated: supabase auth login"
    echo "2. Check your project reference is correct"
    echo "3. Ensure Edge Functions are enabled in your Supabase project"
    exit 1
fi