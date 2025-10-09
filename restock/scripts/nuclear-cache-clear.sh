#!/bin/bash

echo "🧹 Starting NUCLEAR cache clear..."

# 1. Stop any running Metro bundler
echo "1️⃣ Killing Metro bundler..."
pkill -f "react-native" || true
pkill -f "metro" || true

# 2. Clear React Native cache
echo "2️⃣ Clearing React Native cache..."
rm -rf $TMPDIR/react-* || true
rm -rf $TMPDIR/metro-* || true
rm -rf $TMPDIR/haste-* || true

# 3. Clear Watchman
echo "3️⃣ Clearing Watchman..."
watchman watch-del-all || true

# 4. Clear node_modules and reinstall
echo "4️⃣ Clearing node_modules..."
rm -rf node_modules
rm -rf package-lock.json

# 5. Clear Expo cache
echo "5️⃣ Clearing Expo cache..."
rm -rf .expo
rm -rf ~/.expo/cache

# 6. Clear Metro bundler cache
echo "6️⃣ Clearing Metro cache..."
npx expo start --clear &
sleep 2
pkill -f "expo" || true

# 7. Clean npm cache
echo "7️⃣ Clearing npm cache..."
npm cache clean --force

echo "✅ Nuclear cache clear complete!"
echo ""
echo "Now run:"
echo "  npm install"
echo "  npx expo start --clear"
echo ""
echo "⚠️  IMPORTANT: Also clear your app data:"
echo "  - iOS: Delete the app and reinstall"
echo "  - Android: Settings → Apps → Expo Go → Clear Data"

