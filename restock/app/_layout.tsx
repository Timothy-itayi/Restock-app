import { ClerkProvider } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, DeviceEventEmitter, Text, View } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { UnifiedAuthProvider } from '../lib/auth/UnifiedAuthProvider';
import { AuthRouter } from '../lib/components/AuthRouter';
import { ErrorBoundary } from '../lib/components/ErrorBoundary';
import { BaseLoadingScreen } from '../lib/components/loading/BaseLoadingScreen';
import { SupabaseHooksProvider } from '../lib/infrastructure/_supabase/SupabaseHooksProvider';
import { traceRender } from '../lib/utils/renderTrace';

WebBrowser.maybeCompleteAuthSession();

export const unstable_settings = { initialRouteName: 'welcome' };

// ---- Environment variables (direct, Metro-safe references)
const EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
const EXPO_PUBLIC_CLERK_JWT_ISSUER_DOMAIN = process.env.EXPO_PUBLIC_CLERK_JWT_ISSUER_DOMAIN;
const EXPO_PUBLIC_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const EXPO_PUBLIC_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;


// ---- Validate environment
function validateEnvironment() {
  const requiredVars = {
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    EXPO_PUBLIC_CLERK_JWT_ISSUER_DOMAIN,
    EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY,
  };

  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  console.log('🔍 [ENV DEBUG] Validation results:');
  Object.entries(requiredVars).forEach(([key, value]) =>
    console.log(`  - ${key}: ${value ? '✅ set' : '❌ missing'}`)
  );

  if (missing.length > 0) {
    console.error('❌ [ENV DEBUG] Missing environment variables:', missing.join(', '));
  } else {
    console.log('✅ [ENV DEBUG] All required environment variables are set');
  }

  return { isValid: missing.length === 0, missing };
}

// ---- Splash handling
SplashScreen.preventAutoHideAsync().catch(err => {
  console.error('❌ [RootLayout] Failed to prevent splash auto-hide:', err);
});

console.log('🧭 [RootLayout] Module loaded - setting splash failsafe');
let __splashFailsafeTimer: any;
try {
  __splashFailsafeTimer = setTimeout(() => {
    console.log('🧭 [RootLayout] Splash failsafe firing - forcing hide');
    SplashScreen.hideAsync().catch(e => console.error('❌ [RootLayout] Failsafe hide error:', e));
  }, 5000);
} catch {}

// ---- Token cache
const createTokenCache = () => ({
  getToken: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  saveToken: async (key: string, token: string) => {
    try {
      await AsyncStorage.setItem(key, token);
    } catch {}
  },
});

export default function RootLayout() {
  traceRender('RootLayout', {});
  console.log('🏗️ [RootLayout] Component initialized');

  const [loaded, setLoaded] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [showFirstRunSplash, setShowFirstRunSplash] = useState(false);
  const [initError, setInitError] = useState<Error | null>(null);

  // ---- Validate env on mount
// ---- Validate env on mount
useEffect(() => {
  const { isValid, missing } = validateEnvironment();
  if (!isValid) {
    const message = `Missing environment variables: ${missing.join(', ')}`;
    
    // Use console.warn to ensure it appears in Mac Console logs
    console.warn('🚨 [RESTOCK_ENV_ERROR]', message);
    console.warn('🚨 [RESTOCK_ENV_ERROR] Required vars:', missing);
    
    // Only show alert in development
    if (__DEV__) {
      Alert.alert('⚠️ Configuration Error', message, [{ text: 'OK' }]);
    }
  } else {
    // Success log also uses warn to appear in native logs
    console.warn('✅ [RESTOCK_ENV_SUCCESS] All environment variables configured');
  }
}, []);
  // ---- Initialize app
  useEffect(() => {
    const init = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
        setLoaded(true);
      } catch (error: any) {
        console.error('❌ [RootLayout] Initialization error:', error);
        setInitError(error);
        setLoaded(true);
      }
    };
    init();
  }, []);

  // ---- Hide splash screen when ready
  useEffect(() => {
    if (loaded && appReady) {
      const hideSplash = async () => {
        try {
          await SplashScreen.hideAsync();
          console.log('✅ [RootLayout] Splash screen hidden');
        } catch (err) {
          console.error('❌ [RootLayout] Failed to hide splash:', err);
        }
      };
      hideSplash();
      if (__splashFailsafeTimer) clearTimeout(__splashFailsafeTimer);
    }
  }, [loaded, appReady]);

  // ---- App ready event
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('app:ready', () => {
      console.log('🟢 [RootLayout] app:ready event');
      setAppReady(true);
    });
    return () => sub.remove();
  }, []);

  // ---- Deep link handling
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) =>
      console.log('🔗 [RootLayout] Deep link received:', url);
    const sub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });
    return () => sub.remove();
  }, []);

  // ---- Prefetch routes
  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          import('./welcome'),
          import('./(tabs)/_layout'),
          import('./(tabs)/dashboard'),
          import('./(tabs)/dashboard/index'),
          import('./(tabs)/restock-sessions/_layout'),
          import('./(tabs)/restock-sessions/index'),
          import('./(tabs)/restock-sessions/add-product').catch(() => undefined),
          import('./(tabs)/restock-sessions/edit-product').catch(() => undefined),
          import('./(tabs)/restock-sessions/session-list').catch(() => undefined),
          import('./(tabs)/restock-sessions/upload-catalog').catch(() => undefined),
          import('./auth/_layout').catch(() => undefined),
          import('./auth/traditional/sign-in').catch(() => undefined),
          import('./auth/traditional/sign-up').catch(() => undefined),
          import('./auth/traditional/verify-email').catch(() => undefined),
          import('./auth/traditional/profile-setup').catch(() => undefined),
          import('./sso-profile-setup').catch(() => undefined),
        ]);
        console.log('🧭 [RootLayout] Prefetch complete');
      } catch (e) {
        console.warn('🧭 [RootLayout] Prefetch partial:', e);
      }
    })();
  }, []);

  // ---- Loading state
  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#6B7F6B" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>Initializing...</Text>
      </View>
    );
  }

  // ---- Error state
  if (initError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#DC3545', marginBottom: 12 }}>Initialization Error</Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>{initError.message}</Text>
        <Text style={{ fontSize: 12, color: '#999', marginTop: 20, textAlign: 'center' }}>
          Please restart the app. If the problem persists, try clearing the app data.
        </Text>
      </View>
    );
  }

  // ---- Missing Clerk key fallback
  if (!EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    console.warn('⚠️ [RootLayout] Missing Clerk key - rendering minimal router');
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

  // ---- Main layout
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <ErrorBoundary onError={(error, errorInfo) => console.error('🚨 [RootLayout] Error:', error, errorInfo)}>
        <ClerkProvider publishableKey={EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY} tokenCache={createTokenCache()}>
          <UnifiedAuthProvider>
            <SupabaseHooksProvider>
              <ErrorBoundary onError={(error, errorInfo) => console.error('🚨 [AuthRouter] Error:', error, errorInfo)}>
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
