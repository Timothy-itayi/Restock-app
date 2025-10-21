import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProvider } from '@clerk/clerk-expo';

import { UnifiedAuthProvider } from '../lib/auth/UnifiedAuthProvider';
import { SupabaseHooksProvider } from '../lib/infrastructure/_supabase/SupabaseHooksProvider';
import { BaseLoadingScreen } from '../lib/components/loading/BaseLoadingScreen';
import { AuthRouter } from '../lib/components/AuthRouter';
import { ErrorBoundary } from '../lib/components/ErrorBoundary';
import { CLERK_PUBLISHABLE_KEY } from '../backend/_config/clerk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';

// Keep splash screen visible
SplashScreen.preventAutoHideAsync().catch(err => {
  console.error('❌ [RootLayout] Failed to prevent splash auto-hide:', err);
});

// Debug: confirm module loading and ensure splash eventually hides
console.log('🧭 [RootLayout] Module loaded - setting splash failsafe');
let __splashFailsafeTimer: any;
try {
  __splashFailsafeTimer = setTimeout(() => {
    console.log('🧭 [RootLayout] Splash failsafe firing - forcing hide');
    SplashScreen.hideAsync().catch(e => console.error('❌ [RootLayout] Failsafe hide error:', e));
  }, 5000);
} catch (e) {
  // ignore
}

const createTokenCache = () => ({
  getToken: async (key: string) => {
    try { return await AsyncStorage.getItem(key); } 
    catch { return null; }
  },
  saveToken: async (key: string, token: string) => {
    try { await AsyncStorage.setItem(key, token); } 
    catch {}
  },
});

export default function RootLayout() {
  console.log('🏗️ [RootLayout] Component function called');
  // Marker to confirm this function executed
  (global as any).__ROOT_LAYOUT_CALLED__ = true;
  
  const [loaded, setLoaded] = useState(false);
  const [showFirstRunSplash, setShowFirstRunSplash] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  console.log('🏗️ [RootLayout] State initialized, loaded =', loaded);

  // Initialize app
  useEffect(() => { 
    console.log('🏗️ [RootLayout] Initializing app...');
    const init = async () => {
      try {
        // Add a small delay to ensure everything is ready
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('🏗️ [RootLayout] Setting loaded to true');
        setLoaded(true);
      } catch (error: any) {
        console.error('❌ [RootLayout] Initialization error:', error);
        setInitError(error);
        // Still set loaded to true to show error UI
        setLoaded(true);
      }
    };
    init();
  }, []);

  // Hide splash screen when loaded
  useEffect(() => { 
    console.log('🏗️ [RootLayout] loaded changed to:', loaded);
    if (loaded) {
      console.log('🏗️ [RootLayout] Hiding splash screen...');
      // Add timeout to ensure splash hides even if there's an issue
      const hideTimer = setTimeout(() => {
        SplashScreen.hideAsync()
          .then(() => console.log('✅ [RootLayout] Splash screen hidden'))
          .catch(err => console.error('❌ [RootLayout] Failed to hide splash:', err));
      }, 500);
      
      // Clear the module-level failsafe if present
      if (__splashFailsafeTimer) {
        try { clearTimeout(__splashFailsafeTimer); } catch {}
        __splashFailsafeTimer = null as any;
      }

      return () => clearTimeout(hideTimer);
    }
  }, [loaded]);

  // Reset first run splash
  useEffect(() => { 
    console.log('🏗️ [RootLayout] Setting showFirstRunSplash to false');
    setShowFirstRunSplash(false); 
  }, []);

  // Deep link handling with safe fallback
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      try {
        console.log('RootLayout: Deep link received:', url);
        // No-op; AuthRouter will handle redirects after hydration
      } catch (e) {
        console.warn('RootLayout: Deep link handling error', e);
      }
    };
    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => { if (url) handleDeepLink({ url }); });
    return () => subscription.remove();
  }, []);

  console.log('🏗️ [RootLayout] About to check loaded state, loaded =', loaded);
  
  // Show loading state
  if (!loaded) {
    console.log('🏗️ [RootLayout] Not loaded yet, showing loading...');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6B7F6B" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Initializing...</Text>
      </View>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    console.error('🏗️ [RootLayout] Showing error state:', initError);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#DC3545', marginBottom: 12 }}>
          Initialization Error
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          {initError.message}
        </Text>
        <Text style={{ fontSize: 12, color: '#999', marginTop: 20, textAlign: 'center' }}>
          Please restart the app. If the problem persists, try clearing the app data.
        </Text>
      </View>
    );
  }

  console.log('🏗️ [RootLayout] Rendering root layout, about to render providers');

  const hasClerkConfig = !!CLERK_PUBLISHABLE_KEY;
  if (!hasClerkConfig) {
    console.warn('⚠️ [RootLayout] Missing Clerk key - rendering minimal router to avoid blank screen');
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="sso-profile-setup" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary onError={(error, errorInfo) => {
        console.error('🚨 [RootLayout] Caught error in app:', error, errorInfo);
      }}>
        <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={createTokenCache()}>
          <UnifiedAuthProvider>
            <SupabaseHooksProvider>
              <ErrorBoundary onError={(error, errorInfo) => {
                console.error('🚨 [AuthRouter Boundary] Caught error:', error, errorInfo);
              }}>
                <AuthRouter>
                  {showFirstRunSplash ? (
                    <BaseLoadingScreen
                      title="Restock"
                      subtitle="Smart restocking for small businesses"
                      showProgress={false}
                      progressDuration={1000}
                    />
                  ) : (
                    <Stack>
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="auth" options={{ headerShown: false }} />
                      <Stack.Screen name="sso-profile-setup" options={{ headerShown: false }} />
                      <Stack.Screen name="welcome" options={{ headerShown: false }} />
                    </Stack>
                  )}
                </AuthRouter>
              </ErrorBoundary>
            </SupabaseHooksProvider>
          </UnifiedAuthProvider>
        </ClerkProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
