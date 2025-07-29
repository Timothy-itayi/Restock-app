# Restock App Setup Guide

## 🚀 Quick Start

### 1. Environment Variables
Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Development Flow

#### Option A: Use Dev Mode (Recommended for Development)
1. Start the development server: `npm start`
2. Open the app
3. Click "🚀 Dev Mode (Skip Auth)" button
4. You'll be taken directly to the main app

#### Option B: Test Full Authentication Flow
1. Start the development server: `npm start`
2. Open the app
3. Click "Sign In" to go to authentication
4. Use "🚀 Dev Mode (Skip Auth)" button on auth screens for quick testing
5. Or create a real account with sign up

### 3. Testing Authentication

#### Test Backend Services
```bash
# Test all backend services
node test-backend.js

# Test authentication specifically
node test-auth.js
```

#### Test in App
1. Use dev mode buttons for quick testing
2. Test sign up with real email
3. Test sign in with created account
4. Test sign out from profile screen

## 🔧 Development Features

### Dev Mode Buttons
- **Home Screen**: "🚀 Dev Mode (Skip Auth)" - Skip to main app
- **Sign In Screen**: "🚀 Dev Mode (Skip Auth)" - Skip authentication
- **Sign Up Screen**: "🚀 Dev Mode (Skip Auth)" - Skip authentication

### Authentication Flow
1. **App Launch** → Check authentication
2. **Not Authenticated** → Redirect to sign in
3. **Sign In/Sign Up** → Create account or authenticate
4. **Authenticated** → Access main app
5. **Profile** → View account info and sign out

## 📱 App Structure

```
app/
├── index.tsx              # Welcome screen with auth/dev options
├── _layout.tsx            # Root layout with auth check
├── auth/
│   ├── _layout.tsx        # Auth layout
│   ├── sign-in.tsx        # Sign in screen
│   └── sign-up.tsx        # Sign up screen
└── (tabs)/
    ├── dashboard.tsx      # Main dashboard
    ├── restock-sessions.tsx # Restock management
    ├── emails.tsx         # Email generation
    └── profile.tsx        # User profile & sign out
```

## 🧪 Testing Checklist

- [ ] App launches and shows welcome screen
- [ ] Dev mode button appears in development
- [ ] Sign in screen loads correctly
- [ ] Sign up screen loads correctly
- [ ] Dev mode skips authentication
- [ ] Profile screen shows user info
- [ ] Sign out works correctly
- [ ] Backend services connect properly

## 🐛 Troubleshooting

### Common Issues
1. **Environment variables not set** → Check `.env` file
2. **Supabase connection failed** → Verify URL and key
3. **Authentication not working** → Check Supabase Auth settings
4. **Dev mode not showing** → Ensure `__DEV__` is true

### Debug Commands
```bash
# Check if backend is working
node test-backend.js

# Check authentication
node test-auth.js

# Clear cache and restart
npx expo start --clear
``` 