# 🔐 Authentication Tests

This directory contains all authentication-related tests for the Restock app, including SSO, email/password, and OAuth flows.

## 📁 Test Files

### Core Authentication Tests
- **`test-auth.js`** - Basic authentication flow testing
- **`test-auth-fix.js`** - Authentication bug fixes and patches
- **`test-auth-ui-update.js`** - UI updates for authentication screens
- **`test-auth-no-confirmation.js`** - Passwordless authentication flow

### SSO & OAuth Tests
- **`test-clerk-integration.js`** - Clerk authentication integration
- **`test-oauth-flow.js`** - OAuth flow testing and validation
- **`test-passwordless-auth.js`** - Passwordless authentication testing

### Email Authentication Tests
- **`test-email-confirmation.js`** - Email verification flow testing
- **`test-email-signup-flow.js`** - Email signup process testing
- **`test-email-signup-name.js`** - Name capture during email signup

### User Flow Tests
- **`test-improved-flow.js`** - Improved user flow testing
- **`test-name-capture.js`** - Name extraction and capture testing
- **`test-name-extraction.js`** - Name extraction from OAuth providers

## 🧪 Test Categories

### 1. **SSO Authentication**
- Google OAuth flow testing
- SSO user detection and routing
- SSO profile setup validation
- Account linking between SSO and email

### 2. **Email/Password Authentication**
- Email signup flow validation
- Password creation and validation
- Email verification process
- Name capture during signup

### 3. **User Profile Management**
- Profile creation for SSO users
- Profile creation for email users
- Name extraction from various sources
- Store name setup validation

### 4. **Authentication Context**
- UnifiedAuthProvider state management
- Authentication flow management
- User session management
- Authentication state persistence

## 🚀 Running Tests

### Run All Auth Tests
```bash
node tests/auth/test-auth.js
node tests/auth/test-clerk-integration.js
node tests/auth/test-email-signup-flow.js
```

### Run Specific Test Categories
```bash
# SSO Tests
node tests/auth/test-clerk-integration.js
node tests/auth/test-oauth-flow.js

# Email Tests
node tests/auth/test-email-signup-flow.js
node tests/auth/test-email-confirmation.js

# User Flow Tests
node tests/auth/test-improved-flow.js
node tests/auth/test-name-capture.js
```

## 📋 Test Scenarios

### SSO User Flow
1. User clicks "Continue with Google"
2. OAuth flow completes in browser
3. App detects Google SSO user
4. Checks Supabase for existing profile
5. If no profile → Redirect to /sso-profile-setup
6. User completes store setup
7. Profile saved to Supabase
8. Redirect to dashboard

### Email/Password User Flow
1. User enters email and password
2. Email verification process
3. User completes profile setup
4. Profile saved to Supabase
5. Redirect to dashboard

### Mixed Authentication
1. Create account with email/password
2. Later sign in with Google (same email)
3. Verify account linking
4. Verify proper routing based on auth method

## 🔧 Test Configuration

### Environment Variables
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Test Data
- Test user accounts for SSO and email flows
- Mock OAuth responses for testing
- Sample user profiles for validation

## 📊 Test Results

### Success Criteria
- ✅ SSO users properly routed to SSO setup
- ✅ Email users properly routed to email setup
- ✅ Name extraction works from Google OAuth
- ✅ Profile creation works for both auth methods
- ✅ Account linking works between auth methods
- ✅ Session management works correctly

### Known Issues
- OAuth redirect handling in development
- Email verification timing in test environment
- Session persistence across app restarts

## 🛠️ Maintenance

### Adding New Tests
1. Create test file in `tests/auth/`
2. Follow naming convention: `test-[feature].js`
3. Add test description to this README
4. Update test categories as needed

### Updating Tests
1. Test changes against both SSO and email flows
2. Verify OAuth redirects work correctly
3. Check name extraction from all sources
4. Validate profile creation in Supabase

## 📚 References

- [Clerk Authentication Documentation](https://clerk.com/docs)
- [Expo Router Testing](https://docs.expo.dev/router/testing/)
- [React Native Testing](https://reactnative.dev/docs/testing)

---

*This directory contains comprehensive tests for all authentication flows in the Restock app, ensuring reliable user authentication and proper routing.* 