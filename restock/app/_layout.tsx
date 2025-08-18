import React, { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProvider } from '@clerk/clerk-expo';
import { ConvexProviderWithClerk } from './_contexts/ConvexProvider';
import { UnifiedAuthProvider } from './_contexts/UnifiedAuthProvider';
import { BaseLoadingScreen } from './components/loading/BaseLoadingScreen';
import { CLERK_PUBLISHABLE_KEY } from '../backend/config/clerk';
import { SessionManager } from '../backend/services/session-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Create a custom token cache using AsyncStorage
const createTokenCache = () => {
  return {
    getToken: async (key: string): Promise<string | null | undefined> => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (err) {
        return null;
      }
    },
    saveToken: async (key: string, token: string): Promise<void> => {
      try {
        await AsyncStorage.setItem(key, token);
      } catch (err) {
        // Handle error silently
      }
    },
  };
};

// Note: SSO redirect handling is now done in UnifiedAuthProvider to avoid duplicates

export default function RootLayout() {
  const [showFirstRunSplash, setShowFirstRunSplash] = useState(false);
  const [servicesReady, setServicesReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  // Initialize Clerk
  useEffect(() => {
    const initializeClerk = async () => {
      try {
        // Wait for Clerk to be ready
        setLoaded(true);
      } catch (error) {
        console.error('❌ RootLayout: Clerk initialization error:', error);
        setLoaded(true); // Continue anyway
      }
    };

    initializeClerk();
  }, []);

  // Hide splash screen when loaded
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Initialize dependency injection services (now moved to ConvexHooksProvider)
  useEffect(() => {
    console.log('[RootLayout] ✅ Services will be initialized in ConvexHooksProvider');
    setServicesReady(true);
  }, []);

  // First-run splash overlay that reveals auth cleanly
  useEffect(() => {
    const run = async () => {
      try {
        const returning = await SessionManager.isReturningUser();
        if (!returning) {
          setShowFirstRunSplash(true);
          // Keep short and crisp
          setTimeout(() => setShowFirstRunSplash(false), 1000);
        }
      } catch (_) {
        // Fail open
        setShowFirstRunSplash(false);
      }
    };
    run();
  }, []);

  // Handle deep links for OAuth completion
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log("Root layout: Received deep link:", url);
      
      // Check if this is an OAuth redirect
      if (url.includes('/sso-profile-setup') || url.includes('oauth')) {
        console.log("Root layout: OAuth deep link detected, waiting for session hydration");
        
        // Instead of a fixed delay, wait for Clerk to signal session is ready
        // This will be handled by the UnifiedAuthProvider which listens to Clerk's state changes
      }
    };

    // Listen for deep link events
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log("Root layout: Initial URL detected:", url);
        handleDeepLink({ url });
      }
    });

    return () => subscription.remove();
  }, []);

  if (!loaded || !servicesReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider 
        publishableKey={CLERK_PUBLISHABLE_KEY}
        tokenCache={createTokenCache()} // This is crucial for session persistence in React Native
      >
        <ConvexProviderWithClerk>
          <UnifiedAuthProvider>
            {showFirstRunSplash ? (
              <BaseLoadingScreen
                title="Restock"
                subtitle="Preparing your experience..."
                icon="cart"
                color="#6B7F6B"
                showProgress={false}
                progressDuration={1000}
              />
            ) : (
              <Stack
                screenOptions={{
                  headerStyle: {
                    backgroundColor: "#f8f9fa",
                  },
                  headerTintColor: "#2c3e50",
                  headerTitleStyle: {
                    fontWeight: "600",
                  },
                }}
              >
                <Stack.Screen
                  name="(tabs)"
                  options={{  
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="auth"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="welcome"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="sso-profile-setup"
                  options={{
                    headerShown: false,
                  }}
                />
              </Stack>
            )}
          </UnifiedAuthProvider>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}
