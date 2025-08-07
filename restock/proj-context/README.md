# Restock App - AI Assistant Context

## Project Overview
This is a React Native + Expo Router application for managing store restocking operations. The app helps users track products, manage suppliers, create restock sessions, and generate professional emails to suppliers.

## 🚨 PROBLEM STATEMENT

### Title: Problem — Manual Restocking is Broken

**Overview**: Small grocery store owners spend over 3 hours daily on restocking and supplier communication — a repetitive and inefficient process that is mentally draining and hard to scale.

**Current Workflow**:
- Walk around the store with pen and paper to check stock
- Write lists by hand for each product
- Mentally group items by supplier
- Go home or to the office to type up orders
- Manually compose and send separate emails
- Follow up on delivery timelines and responses

**Key Pain Points**:
- (╯°□°）╯ **Time-consuming**: Owners lose multiple hours each day
- (；￣Д￣） **Mentally exhausting**: Requires memory across dozens of products and suppliers
- (︶︹︺) **Error-prone**: Manual entry leads to missed or incorrect orders
- (>人<) **Not scalable**: Doing this across multiple stores quickly becomes chaos
- (¬_¬") **Unprofessional**: Rushed, inconsistent emails affect supplier relationships

**Business Impact**:
- Reduced productivity
- Missed or delayed deliveries
- Higher operational stress
- Lowered service quality

**Solution**: Digitize the analog restock process with smart suggestions, automatic grouping, and professional email generation.

## 🔐 UNIFIED AUTHENTICATION SYSTEM

### Architecture Overview
The app uses a **Unified Authentication System** that consolidates multiple auth contexts into a single, comprehensive solution:

- **UnifiedAuthProvider**: Main auth context that handles all authentication logic
- **UnifiedAuthGuard**: Route protection component with comprehensive logging
- **Clerk Integration**: OAuth (Google) and traditional email authentication
- **Profile Setup Flow**: Separate flows for SSO and email users

### Auth Flow Components

#### 1. UnifiedAuthProvider (`app/_contexts/UnifiedAuthProvider.tsx`)
- **Purpose**: Central auth state management
- **Features**:
  - Handles both Google OAuth and email authentication
  - Manages profile setup requirements
  - Provides comprehensive logging for debugging
  - Tracks new sign-ups vs returning users
  - Integrates with backend services for profile verification

#### 2. UnifiedAuthGuard (`app/components/UnifiedAuthGuard.tsx`)
- **Purpose**: Route protection and navigation logic
- **Features**:
  - Protects routes based on auth requirements
  - Handles redirects for unauthenticated users
  - Manages profile setup navigation
  - Provides loading states with custom messages
  - Comprehensive logging for debugging auth flow

#### 3. Auth Types & States
```typescript
interface AuthType {
  type: 'google' | 'email' | null;
  isNewSignUp: boolean;
  needsProfileSetup: boolean;
}
```

### Authentication Flows

#### 🔄 SSO (Google) Flow
1. **Sign Up**: New Google users → SSO profile setup
2. **Sign In**: Returning Google users → Dashboard (if profile complete)
3. **Profile Setup**: Redirects to `/sso-profile-setup`

#### 📧 Email Flow  
1. **Sign Up**: New email users → Traditional profile setup
2. **Sign In**: Returning email users → Dashboard (if profile complete)
3. **Profile Setup**: Redirects to `/auth/traditional/profile-setup`

### Debugging & Logging
The auth system includes comprehensive logging with emojis for easy identification:
- 🚨 Main auth effect triggers
- 🔍 User type detection and verification
- ⏳ Loading states and waiting conditions
- ✅ Successful operations
- ❌ Errors and failures
- 🔧 Manual triggers and state changes

### Loading States
The UnifiedAuthGuard provides contextual loading screens:
- **General Loading**: "Loading..." with sync icon
- **Profile Setup**: "Setting up profile..." with person icon  
- **Auth Required**: "Authentication required" with lock icon

## Key Features
- **Restock Sessions**: Create and manage restocking sessions with product tracking
- **Smart Autocomplete**: Intelligent suggestions for products and suppliers based on usage history
- **Email Generation**: Automatically generate professional emails grouped by supplier
- **Data Persistence**: Local storage with AsyncStorage (ready for cloud migration)
- **Custom UI**: Sage green theme with minimalistic design and smooth animations

## Technical Stack
- **Frontend**: React Native + Expo Router
- **Language**: TypeScript
- **Navigation**: File-based routing with tab navigation
- **Storage**: AsyncStorage (local) → Supabase (planned)
- **Styling**: Component-specific style files in `styles/` directory
- **UI Components**: Custom toast system, form validation, animations
- **Authentication**: Clerk (OAuth + Email) with unified management

## Design Principles
- **Minimalistic UI**: Clean, flat hierarchy with clear spacing
- **Single Task Focus**: One task per screen for mental simplicity
- **Color Scheme**: Sage green theme (#6B7F6B, #A7B9A7) - avoid blue, use black/grey
- **Organized Styling**: Separate style files per component in `styles/` directory

## Current State
- ✅ Complete UI/UX flow (sessions → email generation)
- ✅ Smart autocomplete and form validation
- ✅ Data persistence with AsyncStorage
- ✅ Professional email templates
- ✅ Custom notification system
- ✅ Unified authentication system with comprehensive logging
- 🔄 Ready for backend integration (SendGrid, OpenAI, Supabase)

## Database Schema (Planned)
- **Users**: Authentication and user management
- **Products**: User's restock items with default quantities/suppliers
- **Suppliers**: Contact information for product ordering
- **Restock Sessions**: Session tracking with status management
- **Restock Items**: Products and quantities per session
- **Emails Sent**: Email tracking and delivery status

## Next Priorities
1. SendGrid email service integration
2. OpenAI GPT for AI-powered email generation
3. Supabase database implementation
4. Dashboard analytics and reporting

## 🔄 User Flows & Workflows

### 🔐 1. User Onboarding & Authentication Flow
**Trigger**: User opens the app for the first time or returns later.
**Steps**:
- User sees onboarding screen (brief intro)
- Chooses to sign up or log in
- Enters email/password or uses Google OAuth
- Auth is handled by UnifiedAuthProvider
- On success, user is taken to dashboard or profile setup
**Outcome**: User is securely logged in and ready to use the app

### 📦 2. Product & Supplier Logging Flow
**Trigger**: User wants to add or edit stockable items.
**Steps**:
- User taps "Add Product"
- Enters product name, quantity, and selects or creates a supplier
- App saves product with supplier mapping in DB
- App starts auto-suggesting previously entered products & suppliers
**Outcome**: Product and supplier are linked and saved for future use

### 📝 3. Restock Session Creation Flow
**Trigger**: User wants to initiate a new restock event.
**Steps**:
- User taps "New Restock"
- Adds multiple products and their quantities
- Each item gets mapped to a supplier (auto or manual)
- Session is saved as a draft
**Outcome**: A restock session is prepared and ready for AI email generation

### 🤖 4. AI Email Generation Flow
**Trigger**: User taps "Generate Emails" on a restock session.
**Steps**:
- App groups products by supplier
- For each supplier, LLM generates a professional email:
  - Uses user's mapped product list + quantities
  - Includes tone formatting + contact personalization
- User previews each email
- User can edit email content if needed
**Outcome**: AI-generated, editable supplier emails are ready to send

### 📤 5. Email Sending Flow
**Trigger**: User confirms and taps "Send All".
**Steps**:
- App sends each email via SendGrid (1 per supplier)
- Tracks success/failure per email
- Shows confirmation or retry options
**Outcome**: Suppliers receive grouped emails for their relevant products

### 🕓 6. Offline Logging & Sync Flow
**Trigger**: User starts logging while offline (e.g., in a store).
**Steps**:
- User logs products + suppliers as normal
- Data is saved locally (IndexedDB / AsyncStorage)
- On reconnect, data syncs with Supabase
**Outcome**: Seamless logging even when offline; synced when online

### 📂 7. History & Reuse Flow
**Trigger**: User wants to view or repeat a past restock.
**Steps**:
- User navigates to "History"
- Sees list of past sessions
- Can duplicate a session or update items
- Can view which supplier was linked to each product
**Outcome**: Faster repeat orders, better learning from past behavior

### ⚙️ 8. Supplier & Product Management Flow
**Trigger**: User wants to update or fix product/supplier info.
**Steps**:
- User navigates to "Manage Suppliers" or "My Products"
- Can update supplier emails, names, or contact info
- Can reassign a product to a different supplier
- Can delete or correct bad entries
**Outcome**: Clean, up-to-date database that improves automation accuracy

## File Structure
```
restock/
├── app/
│   ├── _contexts/          # Auth contexts
│   │   ├── UnifiedAuthProvider.tsx
│   │   ├── AuthContext.tsx
│   │   └── ClerkAuthContext.tsx
│   ├── (tabs)/            # Main tab screens
│   ├── components/         # Reusable components
│   │   └── UnifiedAuthGuard.tsx
│   └── _layout.tsx        # Root layout
├── styles/                # Component-specific styles
├── assets/                # Images and fonts
└── [configuration files]
```

## Code Style
- TypeScript for type safety
- Component-specific style files
- Consistent naming conventions
- Proper error handling and validation
- Animated UI feedback with custom toast system
- Comprehensive logging for debugging auth flows 