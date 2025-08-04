# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm start` or `expo start` - Start the Expo development server
- `npm run android` - Start on Android device/emulator
- `npm run ios` - Start on iOS device/simulator
- `npm run web` - Start web version
- `npm run lint` - Run ESLint for code quality checks
- `npm run test-email-generation` - Test AI email generation functionality
- `npm run test-groq-email` - Test Groq AI integration for emails
- `npm run test-app-integration` - Test full app integration

## Project Architecture

This is a React Native mobile app built with Expo Router for a restocking management system for small retailers.

### Technology Stack
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand for global state
- **Authentication**: Clerk for user authentication with email/password and SSO
- **Backend**: Supabase for database and backend services
- **Data Fetching**: TanStack React Query
- **Styling**: NativeWind (Tailwind CSS) with custom component styling
- **AI Integration**: Groq for email generation
- **Local Storage**: AsyncStorage

### Key Directory Structure
- `app/` - Main application code with file-based routing
  - `(tabs)/` - Tab navigation screens (dashboard, emails, profile, restock-sessions)
  - `auth/` - Authentication screens (sign-in, sign-up, verify-email)
  - `_contexts/` - React contexts for authentication
  - `components/` - Reusable UI components
- `backend/` - Backend services and API integration
  - `services/` - Business logic services (auth, emails, sessions, AI)
  - `config/` - Clerk and Supabase configuration
- `styles/` - Component-specific styling using TypeScript objects
- `scripts/` - Testing and setup scripts

### Authentication Flow
The app uses Clerk for authentication with a dual context setup:
1. `ClerkAuthContext` - Handles Clerk authentication state
2. `AuthContext` - Manages user profile and session data from Supabase

Users can authenticate via:
- Email/password with verification
- Google SSO
- Profile setup flow for new users

### Core Features
- **Restock Sessions**: Create and manage product restocking workflows
- **AI Email Generation**: Automatically generate supplier emails using Groq
- **Product Management**: Track products and supplier relationships
- **Session History**: View past restocking sessions

### Development Notes
- Uses TypeScript with strict mode enabled
- Custom fonts (Satoshi family) loaded via Expo plugins
- Path alias `@/*` for imports from root directory
- Expo Router with typed routes enabled
- New Architecture enabled for React Native

### AI Integration
The app includes AI-powered email generation using Groq:
- Located in `backend/services/ai/`
- Generates professional emails to suppliers based on restock data
- Uses structured prompts and model management

## Email Service Implementation Plan

### Overview
The app implements a comprehensive email sending system using **Resend + Supabase integration** to allow store owners to send professional restock emails to suppliers.

### Email Service Architecture
- **Email Provider**: Resend API integrated via Supabase Edge Functions
- **Sending Method**: "On behalf of" approach with Reply-To headers
- **Email Flow**: `[Store Owner Email] → [App Domain] → [Supplier Email]`
- **Display Format**: "From: noreply@emails.restockapp.com on behalf of owner@store.com"
- **Reply Handling**: Reply-To header ensures supplier responses go to store owner

### Implementation Components

#### 1. Supabase Edge Function
- **Location**: `supabase/functions/send-email/index.ts`
- **Purpose**: Handles actual email sending via Resend API
- **Integration**: Works with existing AI email generation system
- **Features**: Error handling, delivery tracking, bulk email support

#### 2. Backend Email Service Enhancement
- **File**: `backend/services/emails.ts`
- **New Methods**:
  - `sendEmail()` - Send individual emails
  - `sendBulkEmails()` - Send multiple emails for a session
  - `trackDelivery()` - Monitor email delivery status
- **Integration**: Connects with existing email generation workflow

#### 3. Database Schema Updates
- **Table**: `emails_sent` (existing)
- **New Fields**:
  - `delivery_status` - Track email delivery (sent, delivered, failed, bounced)
  - `sent_via` - Email service provider used
  - `tracking_id` - Resend message ID for tracking
  - `resend_webhook_data` - Store delivery webhook information

#### 4. UI/UX Enhancements
- **Email Screen**: Add functional "Send All Emails" button
- **Status Tracking**: Real-time email status updates
- **Error Handling**: User feedback for failed deliveries
- **Delivery Confirmation**: Visual confirmation of successful sends

### Benefits for Store Owners
- ✅ Suppliers see emails as coming from their store
- ✅ Replies come directly to store owner's email inbox
- ✅ Professional appearance with proper signatures
- ✅ No manual email service setup required
- ✅ Scalable solution for unlimited store owners

### Email Composition Format
```
From: noreply@emails.restockapp.com
Reply-To: {user.email} (store owner's actual email)
Subject: {AI-generated subject with store name}
Body: {AI-generated content with proper signature}
```

### Implementation Status
- [x] AI email generation system completed
- [x] User identity integration completed
- [ ] Resend account setup and domain verification (user setup required)
- [ ] Supabase Edge Function for email sending
- [ ] Backend service integration for actual sending
- [ ] UI updates for email sending functionality
- [ ] Delivery tracking and webhook integration