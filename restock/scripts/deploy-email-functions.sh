#!/bin/bash

# Deploy Email Functions to Supabase
# Usage: ./scripts/deploy-email-functions.sh [project-ref]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Get project ref from argument or prompt
PROJECT_REF=$1
if [ -z "$PROJECT_REF" ]; then
    echo -n "Enter your Supabase project reference: "
    read PROJECT_REF
fi

if [ -z "$PROJECT_REF" ]; then
    print_error "Project reference is required"
    exit 1
fi

print_status "Starting deployment of email functions to project: $PROJECT_REF"
echo

# Deploy functions
FUNCTIONS=("send-email" "resend-webhook" "email-analytics")

for func in "${FUNCTIONS[@]}"; do
    print_step "Deploying $func function..."
    
    if supabase functions deploy $func --project-ref $PROJECT_REF; then
        print_status "✅ $func deployed successfully"
    else
        print_error "❌ Failed to deploy $func"
        exit 1
    fi
    echo
done

print_status "🎉 All email functions deployed successfully!"
echo

# Print next steps
print_step "Next Steps:"
echo "1. Configure environment variables in Supabase Dashboard:"
echo "   - RESEND_API_KEY (required)"
echo "   - RESEND_WEBHOOK_SECRET (optional, for webhook verification)"
echo
echo "2. Test the deployment:"
echo "   GET  https://$PROJECT_REF.functions.supabase.co/send-email/status"
echo "   POST https://$PROJECT_REF.functions.supabase.co/send-email/test"
echo
echo "3. Update your app's environment variables:"
echo "   EXPO_PUBLIC_SUPABASE_SEND_EMAIL_URL=https://$PROJECT_REF.functions.supabase.co/send-email"
echo
echo "4. Set up Resend webhook (optional):"
echo "   Webhook URL: https://$PROJECT_REF.functions.supabase.co/resend-webhook"
echo
print_status "Deployment complete! 🚀"