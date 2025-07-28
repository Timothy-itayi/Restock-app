# Google SSO Implementation Guide

## 🎯 Overview

This document outlines the Google SSO (Single Sign-On) implementation for the Restock App, using Clerk's authentication system with a web browser approach for OAuth flows.

## ✅ Implementation Status

### Current Features
- ✅ **Google SSO on Welcome Screen** - New user onboarding with Google
- ✅ **Google SSO on Sign-In Screen** - Existing user authentication with Google  
- ✅ **Google SSO on Sign-Up Screen** - New user registration with Google
- ✅ **Web Browser OAuth Flow** - Uses Expo WebBrowser for seamless OAuth
- ✅ **Automatic Account Linking** - Existing users are linked to their accounts
- ✅ **Profile Verification** - Checks Supabase for existing user profiles
- ✅ **Graceful Error Handling** - Handles OAuth failures and edge cases
- ✅ **No Deprecated Hooks** - Uses only `useAuth()` and modern Clerk APIs

## 🔄 User Flow Logic

### 1. New User Flow (Google SSO)
```
User clicks "Continue with Google"
    ↓
Web browser opens with Clerk OAuth URL
    ↓
User completes Google OAuth in browser
    ↓
Browser redirects back to app
    ↓
App checks if user exists in Supabase
    ↓
If NEW user → Collect store information → Save profile → Dashboard
If EXISTING user → Direct to dashboard
```

### 2. Existing User Flow (Google SSO)
```
User clicks "Continue with Google" on sign-in
    ↓
Web browser opens with Clerk OAuth URL
    ↓
User completes Google OAuth in browser
    ↓
Browser redirects back to app
    ↓
App checks if user exists in Supabase
    ↓
If user found → Direct to dashboard
If no profile → Redirect to welcome for setup
```

### 3. Account Linking Behavior
- **Same Email**: If a user signs in with Google using an email that already exists in Clerk, the accounts are automatically linked
- **Profile Check**: The app verifies if the user has a complete profile in Supabase
- **Setup Flow**: New users or users without profiles are guided through the store setup process

## 🛠️ Technical Implementation

### Key Components

#### 1. Web Browser OAuth Flow
```typescript
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getOAuthUrl } from '../backend/config/clerk';

const handleGoogleSignIn = async () => {
  const redirectUrl = Linking.createURL('/');
  const oauthUrl = getOAuthUrl('oauth_google', 'sign-in', redirectUrl);
  
  const result = await WebBrowser.openAuthSessionAsync(oauthUrl, redirectUrl);
  
  if (result.type === 'success') {
    // Handle successful OAuth
  }
};
```

#### 2. OAuth URL Configuration
```typescript
// backend/config/clerk.ts
export const getOAuthUrl = (strategy: 'oauth_google', action: 'sign-in' | 'sign-up', redirectUrl: string) => {
  const domain = getClerkDomain();
  return `https://${domain}/${action}?strategy=${strategy}&redirect_url=${encodeURIComponent(redirectUrl)}`;
};
```

#### 3. User Profile Verification
```typescript
const profileResult = await UserProfileService.verifyUserProfile(userId);
if (profileResult.data) {
  // User exists, redirect to dashboard
  router.replace('/(tabs)/dashboard');
} else {
  // New user, complete setup
  setShowStoreNameInput(true);
}
```

### Error Handling

#### OAuth Failures
```typescript
if (result.type === 'success') {
  // Handle success
} else if (result.type === 'cancel') {
  console.log('OAuth cancelled by user');
} else {
  Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
}
```

#### Authentication Delays
```typescript
// Wait for Clerk to process authentication
setTimeout(async () => {
  if (isSignedIn && userId) {
    // User is authenticated
  } else {
    Alert.alert('Authentication Failed', 'Please try again.');
  }
}, 2000);
```

## 📱 UI/UX Design

### Consistent Button Styling
- **Google Button**: White background with border, dark text
- **Primary Button**: Sage green background (#6B7F6B)
- **Divider**: Clean separation between Google and email options

### Loading States
- **Google Loading**: "Signing in..." / "Signing up..."
- **Email Loading**: "Signing in..." / "Creating account..."

### Error Messages
- Clear, user-friendly error messages
- Specific handling for OAuth failures
- Graceful fallbacks for edge cases

## 🔧 Clerk Configuration Requirements

### 1. Enable Google OAuth
In your Clerk Dashboard:
1. Go to **SSO Connections → Social Connections**
2. Enable **Google** for all users or specific domains
3. Configure OAuth credentials (Client ID, Client Secret)

### 2. Environment Variables
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 3. OAuth URL Generation
The app automatically generates correct OAuth URLs based on your Clerk environment (test/production).

## 🎯 Benefits of This Implementation

### For Users
- **Seamless OAuth Experience**: Web browser handles OAuth flow
- **Account Linking**: Existing email/password users can link Google accounts
- **Consistent Experience**: Same flow whether using Google or email
- **No Duplicate Accounts**: Automatic linking prevents account confusion

### For Developers
- **No Deprecated APIs**: Uses only modern Clerk hooks
- **Robust Error Handling**: Comprehensive error management
- **Profile Verification**: Ensures users complete setup before accessing app
- **Type Safety**: Full TypeScript implementation
- **Web Browser Integration**: Uses Expo's WebBrowser for OAuth

## 🚀 Testing Scenarios

### Test Cases to Verify

1. **New User with Google**
   - Sign up with Google via web browser
   - Complete store setup
   - Verify profile creation

2. **Existing User with Google**
   - Sign in with Google using existing email
   - Verify automatic account linking
   - Confirm direct dashboard access

3. **Mixed Authentication**
   - Create account with email/password
   - Later sign in with Google (same email)
   - Verify account linking

4. **Error Scenarios**
   - OAuth cancellation
   - Network failures
   - Authentication delays
   - Browser redirect failures

## 📋 Next Steps

### Potential Enhancements
1. **Deep Linking**: Implement custom URL schemes for better OAuth handling
2. **Web View**: Use embedded web view instead of external browser
3. **Additional Providers**: Extend to other OAuth providers (Apple, Microsoft)
4. **Analytics**: Track OAuth success/failure rates
5. **Offline Support**: Handle OAuth when offline

### Production Considerations
1. **Rate Limiting**: Implement OAuth request throttling
2. **Security**: Add additional verification for sensitive operations
3. **Monitoring**: Log OAuth success/failure rates
4. **Backup Flow**: Ensure email/password always available as fallback

## 📚 References

- [Clerk Google OAuth Documentation](https://clerk.com/docs/authentication/social-connections/google)
- [Expo WebBrowser Documentation](https://docs.expo.dev/versions/latest/sdk/webbrowser/)
- [Expo Linking Documentation](https://docs.expo.dev/versions/latest/sdk/linking/)

---

*This implementation provides a seamless Google SSO experience using modern web browser OAuth flows, eliminating the need for deprecated Clerk hooks.* 