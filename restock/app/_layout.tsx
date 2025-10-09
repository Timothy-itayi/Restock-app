import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
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
SplashScreen.preventAutoHideAsync();

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
  
  const [loaded, setLoaded] = useState(false);
  const [showFirstRunSplash, setShowFirstRunSplash] = useState(false);

  console.log('🏗️ [RootLayout] State initialized, loaded =', loaded);

  useEffect(() => { 
    console.log('🏗️ [RootLayout] useEffect setting loaded to true');
    setLoaded(true); 
  }, []);

  useEffect(() => { 
    console.log('🏗️ [RootLayout] loaded changed to:', loaded);
    if (loaded) {
      console.log('🏗️ [RootLayout] Hiding splash screen');
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => { 
    console.log('🏗️ [RootLayout] Setting showFirstRunSplash to false');
    setShowFirstRunSplash(false); 
  }, []);

  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => console.log('RootLayout: Deep link received:', url);
    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => { if (url) handleDeepLink({ url }); });
    return () => subscription.remove();
  }, []);

  console.log('🏗️ [RootLayout] About to check loaded state, loaded =', loaded);
  
  if (!loaded) {
    console.log('🏗️ [RootLayout] Not loaded yet, returning null');
    return null;
  }

  console.log('🏗️ [RootLayout] Rendering root layout, about to render AuthRouter');

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
