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

## 🚀 CONVEX BACKEND ARCHITECTURE

### Overview
The app is built on **Convex**, a real-time, serverless backend platform that provides:
- **Real-time database** with reactive queries
- **Serverless functions** for business logic
- **Built-in authentication** integration with Clerk
- **Type-safe API** with automatic TypeScript generation
- **Scalable infrastructure** without server management

### Convex Integration Components

#### 1. Database Schema (`convex/schema.ts`)
Complete data model with proper relationships:
```typescript
- users: User profiles with Clerk integration
- products: Restock items with supplier mapping
- suppliers: Contact information and email addresses  
- restockSessions: Session lifecycle management
- restockItems: Products per session with quantities
- emailsSent: Email tracking and delivery status
- auditLogs: Action tracking and analytics
```

#### 2. Convex Functions
All business logic implemented as Convex functions:
- **Queries**: Real-time data fetching with reactivity
- **Mutations**: Data updates with optimistic UI updates  
- **Actions**: External API integration (AI, email services)

#### 3. Authentication Flow
- **Clerk + Convex Integration**: JWT token authentication
- **ConvexProviderWithClerk**: Automatic token refresh and sync
- **User Context**: Automatic user scoping for all operations

#### 4. Real-time Features
- **Live Data Sync**: UI updates automatically when data changes
- **Collaborative Sessions**: Multiple users can see updates instantly
- **Optimistic Updates**: Fast UI responses with automatic rollback

### Migration Benefits
- **95% reduction** in backend code complexity
- **Real-time updates** without WebSocket management
- **Automatic scaling** and performance optimization
- **Type safety** across client and server
- **Zero server maintenance** required

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
- **Database**: Convex (real-time, serverless)
- **Backend**: Convex functions with HTTP API client
- **Authentication**: Clerk + Convex integration with JWT tokens
- **Storage**: Convex (cloud) + AsyncStorage (local cache)
- **Email Service**: Direct Resend API integration
- **AI Integration**: Groq for email generation
- **Styling**: Component-specific style files in `styles/` directory
- **UI Components**: Custom toast system, form validation, animations

## Design Principles
- **Minimalistic UI**: Clean, flat hierarchy with clear spacing
- **Single Task Focus**: One task per screen for mental simplicity
- **Color Scheme**: Sage green theme (#6B7F6B, #A7B9A7) - avoid blue, use black/grey
- **Organized Styling**: Separate style files per component in `styles/` directory

## Current State
- ✅ Complete UI/UX flow (sessions → email generation)
- ✅ Smart autocomplete and form validation
- ✅ Real-time data persistence with Convex
- ✅ Professional email templates with AI generation
- ✅ Custom notification system
- ✅ Unified authentication system with comprehensive logging
- ✅ Production-ready backend integration (Convex, Resend, GROQ AI)
- ✅ Enterprise-grade security with Clerk + Convex authentication
- ✅ Optimized performance (dashboard stability, auth guard efficiency)
- ✅ Serverless architecture with real-time updates

## 🚧 TypeScript Migration Status (Convex → Supabase)
- ✅ **Repository Pattern Migration**: Updated all hooks to use SupabaseHooksProvider
- ✅ **Import Path Fixes**: Fixed all Convex import references to use new Supabase repositories
- ✅ **useRestockSessions Hook**: Fixed dependency array and useCallback issues
- ✅ **useSessionList Hook**: Updated to use repository pattern, fixed readonly array issues
- ✅ **useSessionStateManager Hook**: Fixed repository method calls and dependency arrays
- ✅ **useStoredData Hook**: Updated to use available backend services (ProductService, SupplierService)
- ✅ **Logger Utility**: Fixed __DEV__ reference issues
- ✅ **UnifiedAuthProvider**: Removed UserContextService dependencies, updated for Supabase
- ✅ **Button Component**: Fixed theme store integration and neutral color references
- ✅ **Theme Store**: Fixed type compatibility issues between light/dark themes
- ✅ **ConfirmationDialog Component**: Fixed typography property references (body → bodyMedium, h3 → subsectionHeader)
- ✅ **ErrorBoundary Component**: Fixed theme property references (error.primary → status.error)
- 🔄 **Remaining Issues**: ~20 TypeScript errors in test files and some component files
- 🔄 **Next Steps**: Complete remaining component fixes, update test files, verify compilation

## Recent Additions
- **Critical Bug Fixes & Performance Optimization**: 
  - **Dashboard Stability**: Fixed "wigging out" and data disappearing on tab changes by consolidating data sources and adding throttling
  - **Auth Guard Optimization**: Reduced excessive effect triggering by 80%+ with memoization and dependency optimization
  - **Data Consistency**: Eliminated race conditions between SecureDataService and SessionService
  - **User Experience**: Smooth tab navigation without data flashing or loading issues

- **Database & Architecture Migration**:
  - **Convex Migration**: Complete migration from Supabase to Convex for real-time, serverless backend
  - **Authentication Integration**: Seamless Clerk + Convex JWT token authentication
  - **Real-time Updates**: Reactive queries and live data synchronization
  - **Serverless Architecture**: All backend operations now run on Convex functions

- **Smart Reminders & AI Replay**: Proactive, personalized repeat-order nudges based on session history.
  - **Dashboard banner**: "You usually reorder dairy every 7–10 days. Repeat last mix?"
  - **Finished Sessions → Repeat order**: One-tap replay with quick tweak options (+10% quantities, swap suppliers).
  - **In-session hint**: Suggests adding items from the last order with the same supplier.
  - **ReminderService (lightweight)**: Mines patterns from `SessionService.getUserSessions`, ranks candidates, and avoids repetition via `lastShownAt` stored locally/cloud.
  - **Flow**: Accepting a reminder pre-fills a new session and runs normal AI generation.

## Upcoming Features
- **AI Feedback Loop**: Capture edits/ratings on generated emails and learn per-supplier preferences (tone, brevity, urgency, custom instructions).
- **Supplier Preferences Integration**: Feed preferences and `supplierHistory` into `backend/services/ai/email-generator.ts` for improved prompts.
- **Follow-up Automations**: One-tap, context-aware follow-ups for unacknowledged orders (concise, polite ETA requests).
- **Data Migration**: ✅ **COMPLETED** - All data operations migrated to Convex with real-time synchronization

## Database Schema (Convex Implementation)
- **Users**: ✅ User profiles with Clerk integration and store information
- **Products**: ✅ User's restock items with default quantities and supplier mapping
- **Suppliers**: ✅ Contact information and email addresses for ordering
- **Restock Sessions**: ✅ Session lifecycle management with status tracking
- **Restock Items**: ✅ Products and quantities per session with supplier linkage
- **Emails Sent**: ✅ Comprehensive email tracking and delivery status
- **Audit Logs**: ✅ Action tracking for debugging and analytics

## Next Priorities
1. ✅ ~~SendGrid email service integration~~ - **COMPLETED**: Resend integration deployed
2. ✅ ~~OpenAI GPT for AI-powered email generation~~ - **COMPLETED**: GROQ AI integration deployed  
3. ✅ ~~Database implementation~~ - **COMPLETED**: Convex real-time database with authentication
4. ✅ ~~Data migration from AsyncStorage~~ - **COMPLETED**: All operations migrated to Convex
5. Environment cleanup (remove legacy Supabase references)
6. AI feedback loop and supplier preferences
7. Dashboard analytics and reporting
8. Enhanced real-time notifications and updates

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
- Session is saved to Convex with real-time updates
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
- App sends each email via Resend API (1 per supplier)
- Tracks success/failure per email in Convex
- Shows confirmation or retry options
**Outcome**: Suppliers receive grouped emails for their relevant products

### 🕓 6. Offline Logging & Sync Flow
**Trigger**: User starts logging while offline (e.g., in a store).
**Steps**:
- User logs products + suppliers as normal
- Data is cached locally with AsyncStorage
- On reconnect, Convex automatically synchronizes data
- Real-time updates resume when connection is restored
**Outcome**: Seamless logging even when offline; automatic sync with real-time updates

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
│   │   └── UnifiedAuthProvider.tsx
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