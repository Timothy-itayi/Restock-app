import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProvider } from '@clerk/clerk-expo';
import { SupabaseProvider } from './_contexts/SupabaseProvider';
import { UnifiedAuthProvider } from './auth/UnifiedAuthProvider';
import { SupabaseHooksProvider } from './infrastructure/supabase/SupabaseHooksProvider';
import { BaseLoadingScreen } from './components/loading/BaseLoadingScreen';
import { AuthRouter } from './components/AuthRouter';
import { CLERK_PUBLISHABLE_KEY } from '../backend/config/clerk';
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
  const [loaded, setLoaded] = useState(false);
  const [showFirstRunSplash, setShowFirstRunSplash] = useState(false);

  useEffect(() => { setLoaded(true); }, []);

  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);

  useEffect(() => { setShowFirstRunSplash(false); }, []);

  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => console.log('RootLayout: Deep link received:', url);
    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => { if (url) handleDeepLink({ url }); });
    return () => subscription.remove();
  }, []);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={createTokenCache()}>
        <UnifiedAuthProvider>
          <SupabaseHooksProvider>
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
          </SupabaseHooksProvider>
        </UnifiedAuthProvider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
