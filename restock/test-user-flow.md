# 🧪 User Flow Test Guide

## Current Issue
- User profile is being saved but name is null
- User is being redirected to dashboard before completing setup
- Profile verification is failing with "0 rows" error

## Test Steps

### 1. Clear App Data
```bash
# Clear AsyncStorage and restart app
npx expo start --clear
```

### 2. Test New User Flow
1. Open app
2. Tap "Continue with Google"
3. Complete Google OAuth
4. **Check console logs for:**
   - User object structure from Google
   - Name extraction results
   - Profile saving data
   - Verification results

### 3. Expected Console Logs
```
LOG  User email from Google: [email]
LOG  User name from Google: [name]
LOG  User object for debugging: { firstName, lastName, fullName, username }
LOG  saveUserProfile called with: { clerkUserId, email, storeName, name, nameType, nameLength, nameIsEmpty }
LOG  Profile saved successfully: { data }
LOG  User profile verified in Supabase: { data }
LOG  Name in verified profile: [name]
```

### 4. Debugging Points

#### A. Name Extraction
- Check if `user?.firstName` exists
- Check if `user?.lastName` exists
- Check if `user?.fullName` exists
- Check if `user?.username` exists

#### B. Profile Saving
- Check if name parameter is being passed correctly
- Check if name is empty or undefined
- Check if database is receiving the name

#### C. Profile Verification
- Check if profile exists in Supabase
- Check if name field is populated
- Check if redirect logic is working

## Expected Behavior

### New User (No Profile in Supabase)
1. User signs in with Google
2. App checks Supabase - no profile found
3. User is redirected to welcome screen
4. User completes store setup
5. Profile is saved with name and store name
6. User is redirected to dashboard

### Existing User (Profile in Supabase)
1. User signs in with Google
2. App checks Supabase - profile found
3. User is redirected directly to dashboard

## Current Issues to Fix

1. **Name is null** - Need to capture name from Google OAuth
2. **Wrong redirect** - User going to dashboard before setup
3. **Profile verification failing** - "0 rows" error

## Debugging Commands

```bash
# Check Supabase directly
# Run this in Supabase SQL editor:
SELECT * FROM users WHERE id = 'user_30VF9iyjJiN9xXWslRvCFswn1BY';

# Check if name field exists
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'name';
``` 