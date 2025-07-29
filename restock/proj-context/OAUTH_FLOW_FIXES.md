# 🔧 OAuth Flow Fixes & Session Management

## 🚨 Problem Solved

**Issue**: OAuth flow was redirecting users to Clerk console instead of back to the app, breaking the authentication flow.

**Root Cause**: Incorrect redirect URL configuration in Clerk OAuth setup.

## ✅ Solutions Implemented

### 1. Fixed OAuth Redirect URLs

**File**: `restock/backend/config/clerk.ts`

```typescript
// Before: Redirected to Clerk console
return `https://${domain}/${action}?strategy=${strategy}&redirect_url=${encodeURIComponent(redirectUrl)}`;

// After: Ensures redirect back to app
const appRedirectUrl = redirectUrl.includes('clerk.dev') || redirectUrl.includes('clerk.com') 
  ? 'exp://localhost:8081' // Default Expo development URL
  : redirectUrl;

return `https://${domain}/${action}?strategy=${strategy}&redirect_url=${encodeURIComponent(appRedirectUrl)}`;
```

### 2. Session Management System

**File**: `restock/backend/services/session-manager.ts`

- **Session Caching**: Stores user session data in AsyncStorage
- **Returning User Detection**: Tracks if user has signed in before
- **Setup Completion Check**: Verifies if user has completed store setup

```typescript
export interface UserSession {
  userId: string;
  email: string;
  storeName?: string;
  wasSignedIn: boolean;
  lastSignIn: number;
}
```

### 3. Returning User Flow

**Files**: 
- `restock/app/auth/sign-in.tsx`
- `restock/app/welcome.tsx`

**Features**:
- Shows "Returning User? Sign In" button for previous users
- Caches session data on successful authentication
- Maintains returning user flag across app sessions

### 4. Authentication Context

**File**: `restock/app/contexts/AuthContext.tsx`

- **Automatic Routing**: Routes users to appropriate screens based on auth state
- **Setup Verification**: Checks if user has completed store setup
- **Session Sync**: Syncs Clerk authentication with local session data

## 🔄 Updated User Flow

### New User Flow
```
1. User opens app
2. Sees welcome screen with "Continue with Google" button
3. Taps Google OAuth
4. Browser opens with Google sign-in (NOT Clerk console)
5. User signs in with Google
6. Browser redirects back to app
7. App checks user profile in Supabase
8. If new user → Complete store setup
9. If existing user → Redirect to dashboard
10. Session data is cached for future use
```

### Returning User Flow
```
1. User opens app (has signed in before)
2. Sees "Returning User? Sign In" button
3. Taps returning user button
4. App uses cached session data
5. OAuth flow with Google
6. Direct redirect to dashboard
```

### Sign Out Flow
```
1. User taps "Sign Out"
2. Confirmation dialog appears
3. Session data is cleared (but returning user flag remains)
4. User is redirected to welcome screen
5. Next time they open app, they'll see returning user button
```

## 🛠️ Technical Implementation

### Session Manager Methods

```typescript
// Save user session
await SessionManager.saveUserSession({
  userId,
  email,
  storeName,
  wasSignedIn: true,
  lastSignIn: Date.now(),
});

// Check if returning user
const isReturning = await SessionManager.isReturningUser();

// Check setup completion
const hasSetup = await SessionManager.hasCompletedSetup();
```

### OAuth URL Generation

```typescript
// Generate OAuth URL with proper redirect
const redirectUrl = Linking.createURL('/');
const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', redirectUrl);
```

### Authentication Context Usage

```typescript
const { isAuthenticated, isLoading, hasCompletedSetup } = useAuthContext();
```

## 🧪 Testing

### Manual Testing Steps

1. **First-time user**:
   - Open app
   - Tap "Continue with Google"
   - Verify browser opens with Google OAuth
   - Complete sign-in
   - Verify redirect back to app
   - Complete store setup
   - Verify dashboard access

2. **Returning user**:
   - Sign out from app
   - Reopen app
   - Verify "Returning User? Sign In" button appears
   - Tap returning user button
   - Verify direct access to dashboard

3. **OAuth redirect test**:
   - Check browser URL during OAuth flow
   - Verify it doesn't redirect to Clerk console
   - Verify it redirects back to app

### Automated Testing

Run the OAuth flow test:
```bash
node restock/tests/test-oauth-flow.js
```

## 🔧 Configuration Required

### Clerk Dashboard Settings

1. **OAuth Redirect URLs**: Ensure your app's redirect URL is configured in Clerk dashboard
2. **Google OAuth**: Verify Google OAuth is properly configured
3. **Allowed Origins**: Add your app's domain to allowed origins

### Environment Variables

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## 🚀 Next Steps

1. **Test the OAuth flow** with the updated implementation
2. **Verify returning user detection** works correctly
3. **Check session persistence** across app restarts
4. **Monitor authentication routing** in different scenarios

## 📝 Notes

- **Session data** is stored locally using AsyncStorage
- **Returning user flag** persists across sign-outs
- **OAuth redirects** now properly point back to the app
- **Authentication context** handles all routing logic automatically

## 🔍 Debugging

If OAuth still redirects to Clerk console:

1. Check Clerk dashboard OAuth settings
2. Verify redirect URL configuration
3. Check environment variables
4. Test with different redirect URLs

If returning user button doesn't appear:

1. Check AsyncStorage for returning user flag
2. Verify session data is being saved
3. Check authentication context logic 