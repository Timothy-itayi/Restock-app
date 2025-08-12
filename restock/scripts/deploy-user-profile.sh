#!/bin/bash

# Deploy user profile creation Edge Function to Supabase

echo "🚀 Deploying user profile creation Edge Function..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if we're in the correct directory
if [[ ! -f "supabase/functions/create-user-profile/index.ts" ]]; then
    echo "❌ create-user-profile function not found. Make sure you're in the restock directory."
    exit 1
fi

# Deploy the function
echo "📦 Deploying create-user-profile function..."
supabase functions deploy create-user-profile

if [ $? -eq 0 ]; then
    echo "✅ create-user-profile function deployed successfully!"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Set the SUPABASE_SERVICE_ROLE_KEY environment variable in your Supabase dashboard"
    echo "2. Test the function with: curl -X POST your-supabase-url/functions/v1/create-user-profile"
    echo "3. Update your app to use the new backend profile creation"
else
    echo "❌ Deployment failed. Check the error messages above."
    exit 1
fi
