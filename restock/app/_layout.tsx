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
import { registerServices, initializeServices } from './infrastructure/di/ServiceRegistry';
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

// Component to handle new SSO user redirects
function NewSSOUserRedirectHandler() {
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    const checkAndRedirectNewSSOUser = async () => {
      if (hasChecked) return;
      
      try {
        // Check if this is a new SSO sign-up
        const newSSOSignUp = await AsyncStorage.getItem('newSSOSignUp');
        const isNewSignUp = newSSOSignUp === 'true';

        if (isNewSignUp) {
          console.log('🚨 NewSSOUserRedirectHandler: New SSO user detected, redirecting to profile setup');
          
          // Small delay to ensure navigation is ready
          setTimeout(() => {
            try {
              const { router } = require('expo-router');
              router.replace('/sso-profile-setup');
              console.log('✅ NewSSOUserRedirectHandler: Successfully redirected new SSO user to profile setup');
            } catch (error) {
              console.error('❌ NewSSOUserRedirectHandler: Failed to redirect to profile setup:', error);
              // Fallback: try to navigate to welcome
              try {
                const { router } = require('expo-router');
                router.replace('/welcome');
              } catch (fallbackError) {
                console.error('❌ NewSSOUserRedirectHandler: Fallback navigation also failed:', fallbackError);
              }
            }
          }, 100);
        }
        
        setHasChecked(true);
      } catch (error) {
        console.error('❌ NewSSOUserRedirectHandler: Error checking SSO status:', error);
        setHasChecked(true);
      }
    };

    checkAndRedirectNewSSOUser();
  }, [hasChecked]);

  return null; // This component doesn't render anything
}

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

  // Initialize dependency injection services
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[RootLayout] Registering services...');
        registerServices();
        
        console.log('[RootLayout] Initializing services...');
        await initializeServices();
        
        console.log('[RootLayout] ✅ Services ready');
        setServicesReady(true);
      } catch (error) {
        console.error('[RootLayout] ❌ Failed to initialize services:', error);
        // Continue anyway - app can work without some services
        setServicesReady(true);
      }
    };

    initializeApp();
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
      <ConvexProviderWithClerk>
        <ClerkProvider 
          publishableKey={CLERK_PUBLISHABLE_KEY}
          tokenCache={createTokenCache()} // This is crucial for session persistence in React Native
        >
          <UnifiedAuthProvider>
            {/* Add the new SSO user redirect handler */}
            <NewSSOUserRedirectHandler />
            
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
        </ClerkProvider>
      </ConvexProviderWithClerk>
    </GestureHandlerRootView>
  );
}
