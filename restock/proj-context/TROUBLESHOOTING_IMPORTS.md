# 🔧 Troubleshooting Import & Module Issues

## 🚨 Current Error
```
ERROR  Error: Requiring unknown module "1304". If you are sure the module exists, try restarting Metro. You may also want to run `yarn` or `npm install`., js engine: hermes
ERROR  React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s undefined  You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.
```

## 🔍 Root Cause Analysis

### 1. Metro Bundler Cache Issue
The "unknown module 1304" error typically indicates a Metro bundler cache corruption.

### 2. Circular Import Dependencies
The backend index file might be causing circular import issues.

### 3. TypeScript Compilation Issues
Component exports might not be properly typed.

## ✅ Solutions Applied

### 1. Fixed Import Paths
**Before:**
```typescript
import { UserProfileService } from '../../backend';
import { CLERK_PUBLISHABLE_KEY } from '../backend';
```

**After:**
```typescript
import { UserProfileService } from '../../backend/services/user-profile';
import { CLERK_PUBLISHABLE_KEY } from '../backend/config/clerk';
```

### 2. Simplified AuthProvider
- Removed complex backend imports from AuthContext
- Used direct service imports instead of backend index

### 3. Updated Component Exports
- Ensured all components use default exports
- Fixed import/export mismatches

## 🛠️ Manual Fixes Required

### Step 1: Clear Metro Cache
```bash
# Stop the development server
# Then run:
npx expo start --clear
```

### Step 2: Clear Node Modules Cache
```bash
rm -rf node_modules/.cache
rm -rf .expo
```

### Step 3: Reinstall Dependencies
```bash
npm install
# or
yarn install
```

### Step 4: Restart Development Server
```bash
npm start
```

## 🔍 Debugging Steps

### 1. Check Import Resolution
```bash
# Run TypeScript check
npx tsc --noEmit
```

### 2. Verify Component Exports
Check these files for proper exports:
- `restock/app/contexts/AuthContext.tsx`
- `restock/app/components/SignOutButton.tsx`
- `restock/app/auth/sign-in.tsx`
- `restock/app/welcome.tsx`

### 3. Check Metro Configuration
Ensure `metro.config.js` is properly configured for Expo Router.

## 📁 Files Modified

### Core Files
- `restock/app/_layout.tsx` - Fixed imports
- `restock/app/contexts/AuthContext.tsx` - Direct service imports
- `restock/app/auth/sign-in.tsx` - Updated imports
- `restock/app/welcome.tsx` - Updated imports

### Service Files
- `restock/backend/services/session-manager.ts` - New session management
- `restock/backend/config/clerk.ts` - Fixed OAuth redirects

## 🚀 Next Steps

1. **Clear cache and restart**:
   ```bash
   npx expo start --clear
   ```

2. **Test the app**:
   - Check if the app loads without errors
   - Test OAuth flow
   - Verify returning user functionality

3. **Monitor for errors**:
   - Watch console for any remaining import issues
   - Check Metro bundler output

## 🔧 Alternative Solutions

### If Issues Persist

1. **Temporary AuthProvider Removal**:
   ```typescript
   // In _layout.tsx, temporarily remove AuthProvider
   return (
     <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
       <Stack>...</Stack>
     </ClerkProvider>
   );
   ```

2. **Simplified Imports**:
   ```typescript
   // Use only essential imports
   import { CLERK_PUBLISHABLE_KEY } from "../backend/config/clerk";
   ```

3. **Manual Component Testing**:
   - Test each component individually
   - Isolate problematic imports

## 📝 Notes

- **Metro cache** is the most common cause of "unknown module" errors
- **Circular imports** can cause component resolution issues
- **TypeScript strict mode** may reveal hidden import problems
- **Expo Router** requires specific import patterns

## 🆘 Emergency Fix

If the app still won't start:

1. **Reset to working state**:
   ```bash
   git stash
   npm start
   ```

2. **Gradual re-implementation**:
   - Add features one by one
   - Test after each addition

3. **Alternative approach**:
   - Use simpler authentication flow
   - Implement session management later 