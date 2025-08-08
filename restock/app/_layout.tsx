import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { CLERK_PUBLISHABLE_KEY } from "../backend/config/clerk";
import { UnifiedAuthProvider } from "./_contexts/UnifiedAuthProvider";
import UnifiedAuthGuard from "./components/UnifiedAuthGuard";
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import '../global.css';
import { BaseLoadingScreen } from './components/loading/BaseLoadingScreen';
import { SessionManager } from '../backend/services/session-manager';

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

export default function RootLayout() {
  const [showFirstRunSplash, setShowFirstRunSplash] = useState(false);
  const [loaded, error] = useFonts({
    'Satoshi-Black': require('../assets/fonts/Satoshi/Satoshi-Black.otf'),
    'Satoshi-BlackItalic': require('../assets/fonts/Satoshi/Satoshi-BlackItalic.otf'),
    'Satoshi-Bold': require('../assets/fonts/Satoshi/Satoshi-Bold.otf'),
    'Satoshi-BoldItalic': require('../assets/fonts/Satoshi/Satoshi-BoldItalic.otf'),
    'Satoshi-Medium': require('../assets/fonts/Satoshi/Satoshi-Medium.otf'),
    'Satoshi-MediumItalic': require('../assets/fonts/Satoshi/Satoshi-MediumItalic.otf'),
    'Satoshi-Regular': require('../assets/fonts/Satoshi/Satoshi-Regular.otf'),
    'Satoshi-Italic': require('../assets/fonts/Satoshi/Satoshi-Italic.otf'),
    'Satoshi-Light': require('../assets/fonts/Satoshi/Satoshi-Light.otf'),
    'Satoshi-LightItalic': require('../assets/fonts/Satoshi/Satoshi-LightItalic.otf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

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
        // This will be handled by the AuthContext which listens to Clerk's state changes
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

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={createTokenCache()} // This is crucial for session persistence in React Native
    >
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
          <UnifiedAuthGuard requireAuth={false}>
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
          </UnifiedAuthGuard>
        )}
      </UnifiedAuthProvider>
    </ClerkProvider>
  );
}
