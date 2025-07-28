# Tests Directory

This directory contains various test files for the Restock app backend and authentication system.

## Test Files

### 🔐 Authentication Tests

#### `test-auth.js`
- **Purpose**: Basic authentication flow testing
- **Tests**: Sign up, sign in, sign out functionality
- **Run**: `node tests/test-auth.js`

#### `test-auth-fix.js`
- **Purpose**: Tests the authentication fix for invalid email addresses
- **Tests**: Email validation, error handling for test domains
- **Run**: `node tests/test-auth-fix.js`

#### `test-email-confirmation.js`
- **Purpose**: Tests email confirmation flow
- **Tests**: Sign up with confirmation, blocked sign-in, resend confirmation
- **Run**: `node tests/test-email-confirmation.js`

#### `test-deep-linking.js`
- **Purpose**: Tests deep linking configuration for email confirmation
- **Tests**: Signup with redirect URL, resend confirmation with redirect
- **Run**: `node tests/test-deep-linking.js`

#### `test-auth-no-confirmation.js`
- **Purpose**: Tests authentication without email confirmation
- **Tests**: Signup and immediate sign-in without email confirmation
- **Run**: `node tests/test-auth-no-confirmation.js`

#### `test-auth-ui-update.js`
- **Purpose**: Tests updated auth UI with store name and social sign-in
- **Tests**: Signup with store name, social buttons, UI flow
- **Run**: `node tests/test-auth-ui-update.js`

#### `test-passwordless-auth.js`
- **Purpose**: Tests passwordless authentication flow
- **Tests**: Email-only sign-in, magic link flow, UI simplification
- **Run**: `node tests/test-passwordless-auth.js`

#### `test-clerk-integration.js`
- **Purpose**: Tests Clerk integration and Supabase sync
- **Tests**: Clerk auth, user sync, store name collection
- **Run**: `node tests/test-clerk-integration.js`

### 🔧 Backend Tests

#### `test-backend.js`
- **Purpose**: Tests backend service exports and configuration
- **Tests**: Service availability, configuration loading
- **Run**: `node tests/test-backend.js`

#### `test-env.js`
- **Purpose**: Tests environment variable configuration
- **Tests**: Supabase URL and key availability
- **Run**: `node tests/test-env.js`

### 🗄️ Database Tests

#### `test-supabase.js`
- **Purpose**: Basic Supabase connection testing
- **Tests**: Database connection, table access
- **Run**: `node tests/test-supabase.js`

#### `test-supabase-simple.js`
- **Purpose**: Simplified Supabase connection test
- **Tests**: Basic client creation and connection
- **Run**: `node tests/test-supabase-simple.js`

## Running Tests

To run all tests:
```bash
cd restock
node tests/test-env.js
node tests/test-supabase.js
node tests/test-auth.js
```

To run specific test categories:
```bash
# Authentication tests
node tests/test-auth.js
node tests/test-auth-fix.js
node tests/test-email-confirmation.js
node tests/test-deep-linking.js
node tests/test-auth-no-confirmation.js
node tests/test-auth-ui-update.js
node tests/test-passwordless-auth.js
node tests/test-clerk-integration.js

# Backend tests
node tests/test-backend.js
node tests/test-env.js

# Database tests
node tests/test-supabase.js
node tests/test-supabase-simple.js
```

To run tests from the tests directory:
```bash
cd restock/tests
node test-env.js
node test-supabase.js
node test-auth.js
```

## Test Environment

Make sure you have the following environment variables set in your `.env` file:
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Notes

- Some tests require a valid Supabase connection
- Email confirmation tests require actual email delivery
- Test domains like `@email.com` are blocked by Supabase
- Use real email addresses for authentication tests 