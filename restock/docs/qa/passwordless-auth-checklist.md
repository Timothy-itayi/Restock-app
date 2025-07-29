# Authentication QA Checklist

This checklist covers the testing of authentication features in the Restock app, including traditional email/password authentication and Google OAuth SSO.

## Authentication Methods

### Traditional Email/Password Authentication
- [ ] Users can create accounts with email and password
- [ ] Password validation enforces security requirements
- [ ] Email verification is required for new accounts
- [ ] Users can sign in with email and password

### Google OAuth SSO
- [ ] Users can sign in with Google accounts
- [ ] OAuth flow works in web browser
- [ ] Google users are properly detected and routed
- [ ] Account linking works for existing users

## UI Components

### Sign-up Screen
- [ ] Email input field is present
- [ ] Password input field is present with validation
- [ ] Password confirmation field is present
- [ ] "Continue with Google" button is present
- [ ] "Create Account" button is present
- [ ] Password requirements are clearly displayed

### Sign-in Screen
- [ ] Email input field is present
- [ ] Password input field is present
- [ ] "Continue with Google" button is present
- [ ] "Sign In" button is present
- [ ] "Returning SSO user" link is present

### Welcome Screen
- [ ] "Continue with Google" button is present
- [ ] Email signup form is available
- [ ] Store name input is required for email signup
- [ ] Name input is required for email signup

## Form Validation

### Email Validation
- [ ] Real email addresses are accepted
- [ ] Invalid email formats are rejected
- [ ] Empty email field shows validation error
- [ ] Email format validation provides clear feedback

### Password Validation (Email Signup)
- [ ] Password must be at least 8 characters
- [ ] Password must contain uppercase letter
- [ ] Password must contain lowercase letter
- [ ] Password must contain number
- [ ] Password must contain special character
- [ ] Password confirmation must match
- [ ] Validation errors are displayed in real-time

### Store Name Validation (Email Signup)
- [ ] Store name is required for email signup
- [ ] Empty store name shows validation error
- [ ] Store name validation provides clear feedback

### Name Validation (Email Signup)
- [ ] Name is required for email signup
- [ ] Empty name shows validation error
- [ ] Name validation provides clear feedback

## User Experience

### Email/Password Flow
- [ ] Sign-up process collects all required information
- [ ] Email verification is sent after signup
- [ ] Users can verify email and complete setup
- [ ] Sign-in process is straightforward
- [ ] Clear error messages for invalid credentials

### Google OAuth Flow
- [ ] OAuth flow opens in web browser
- [ ] Users can complete Google authentication
- [ ] App properly handles OAuth completion
- [ ] Google users are routed to appropriate setup screen
- [ ] Account linking works seamlessly

### Profile Setup
- [ ] Email users are routed to `/profile-setup`
- [ ] Google users are routed to `/sso-profile-setup`
- [ ] Store name is collected for both flows
- [ ] Profile data is saved to Supabase
- [ ] Users are redirected to dashboard after setup

## Security

### Password Security
- [ ] Passwords meet minimum security requirements
- [ ] Passwords are properly hashed and stored
- [ ] Password confirmation prevents typos
- [ ] No plain text passwords in logs

### OAuth Security
- [ ] OAuth flow uses secure redirect URLs
- [ ] Google OAuth tokens are properly handled
- [ ] Account linking is secure
- [ ] No sensitive data exposed in OAuth flow

### Session Management
- [ ] Sessions are properly created and managed
- [ ] Users stay signed in appropriately
- [ ] Sign-out properly clears sessions
- [ ] Session data is stored securely

## Integration Testing

### Complete Email Signup Flow
1. [ ] Navigate to sign-up screen
2. [ ] Enter valid email, password, and confirm password
3. [ ] Verify password validation works
4. [ ] Click "Create Account"
5. [ ] Verify email verification is sent
6. [ ] Complete email verification
7. [ ] Complete profile setup
8. [ ] Verify user is redirected to dashboard

### Complete Google OAuth Flow
1. [ ] Navigate to welcome screen
2. [ ] Click "Continue with Google"
3. [ ] Complete OAuth in web browser
4. [ ] Verify app handles OAuth completion
5. [ ] Complete profile setup (if new user)
6. [ ] Verify user is redirected to dashboard

### Complete Email Signin Flow
1. [ ] Navigate to sign-in screen
2. [ ] Enter valid email and password
3. [ ] Click "Sign In"
4. [ ] Verify user is redirected to dashboard

### Account Linking
1. [ ] Create account with email/password
2. [ ] Sign out
3. [ ] Sign in with Google using same email
4. [ ] Verify accounts are properly linked
5. [ ] Verify user data is preserved

## Error Handling

### Network Errors
- [ ] Network failures are handled gracefully
- [ ] User receives clear error message
- [ ] Retry functionality is available

### Invalid Credentials
- [ ] Invalid email/password shows clear error
- [ ] Invalid OAuth attempts are handled
- [ ] Clear error messages for all failure cases

### Email Verification
- [ ] Unverified users cannot access app
- [ ] Verification email can be resent
- [ ] Expired verification links are handled

### OAuth Errors
- [ ] OAuth failures are handled gracefully
- [ ] User can retry OAuth flow
- [ ] Clear error messages for OAuth issues

## Performance

### Response Times
- [ ] Sign-up process is reasonably fast
- [ ] Sign-in process is fast
- [ ] OAuth flow completes quickly
- [ ] No noticeable delays in UI

### Reliability
- [ ] Authentication works consistently
- [ ] No failed authentication attempts
- [ ] System handles concurrent requests
- [ ] OAuth flow is reliable

## Accessibility

### Screen Reader Support
- [ ] All form fields are properly labeled
- [ ] Error messages are announced
- [ ] Success messages are announced
- [ ] OAuth buttons are accessible

### Keyboard Navigation
- [ ] All elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Enter key submits forms
- [ ] OAuth flow is keyboard accessible

## Cross-Platform Testing

### iOS
- [ ] Email/password auth works on iOS
- [ ] Google OAuth works on iOS
- [ ] Deep linking back to app works
- [ ] No issues with iOS keyboard handling

### Android
- [ ] Email/password auth works on Android
- [ ] Google OAuth works on Android
- [ ] Deep linking back to app works
- [ ] No issues with Android keyboard handling

### Web
- [ ] Email/password auth works in browser
- [ ] Google OAuth works in browser
- [ ] Responsive design works properly
- [ ] No issues with different browsers

## Edge Cases

### Multiple Devices
- [ ] User can sign in on multiple devices
- [ ] Sessions work independently
- [ ] No conflicts between devices
- [ ] OAuth works across devices

### Email Variations
- [ ] Works with Gmail
- [ ] Works with Outlook
- [ ] Works with Apple Mail
- [ ] Works with other email providers

### Network Conditions
- [ ] Works on slow connections
- [ ] Works on mobile data
- [ ] Handles intermittent connectivity
- [ ] OAuth works in poor network conditions

### Returning Users
- [ ] Returning users are properly detected
- [ ] Last auth method is remembered
- [ ] Quick sign-in options are shown
- [ ] OAuth returning user flow works

## Database Integration

### User Profile Storage
- [ ] User profiles are saved to Supabase
- [ ] Profile data is correctly structured
- [ ] Profile verification works
- [ ] Profile updates work properly

### Session Management
- [ ] Session data is stored locally
- [ ] Session persistence works
- [ ] Session cleanup on sign-out
- [ ] Session refresh works

## Documentation

### User Instructions
- [ ] Clear instructions for email signup
- [ ] Clear instructions for Google OAuth
- [ ] Help text explains the processes
- [ ] FAQ covers common questions

### Developer Documentation
- [ ] Authentication implementation is documented
- [ ] OAuth configuration is documented
- [ ] Database schema is documented
- [ ] Troubleshooting guide exists

## Notes

- **Test Environment**: Development mode
- **Test Accounts**: Use real email addresses and Google accounts for testing
- **OAuth Testing**: Requires valid Google OAuth configuration
- **Database**: Requires Supabase connection
- **Session Management**: Verify sessions persist correctly
- **Error Logging**: Check console for any errors during testing

## Sign-off

- [ ] All UI components tested and working
- [ ] All validation rules tested and working
- [ ] Complete user flows tested and working
- [ ] OAuth integration verified
- [ ] Security measures verified
- [ ] Performance requirements met
- [ ] Accessibility requirements met
- [ ] Cross-platform compatibility verified
- [ ] Edge cases handled properly
- [ ] Database integration verified
- [ ] Documentation is complete and accurate

**Tester**: _________________  
**Date**: _________________  
**Version**: _________________ 