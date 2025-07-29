import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { CLERK_PUBLISHABLE_KEY } from "../backend/config/clerk";
import { AuthProvider } from "./_contexts/AuthContext";
import AuthVerificationGate from "./components/AuthVerificationGate";
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [loaded, error] = useFonts({
    // You can add custom fonts here if needed
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle deep links for OAuth completion
  useEffect(() => {
    const handleDeepLink = async (event: { url: string }) => {
      const url = event.url;
      console.log("Root layout: Received deep link:", url);
      
      // Check if this is an OAuth redirect
      if (url.includes('/sso-profile-setup') || url.includes('oauth')) {
        console.log("Root layout: OAuth deep link detected, attempting to rehydrate session");
        
        // Force a small delay to allow Clerk to process the deep link
        setTimeout(() => {
          console.log("Root layout: Deep link processing complete");
        }, 1000);
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

  // Enhanced OAuth completion detection in root layout
  useEffect(() => {
    const checkOAuthCompletion = async () => {
      try {
        const justCompletedSSO = await AsyncStorage.getItem('justCompletedSSO');
        if (justCompletedSSO === 'true') {
          console.log("Root layout: OAuth completion detected, ensuring session is properly hydrated");
          
          // Force a longer delay to ensure Clerk has time to hydrate the session
          setTimeout(async () => {
            console.log("Root layout: OAuth completion processing complete");
            // The session should now be properly hydrated
          }, 3000);
        }
      } catch (error) {
        console.error("Root layout: Error checking OAuth completion:", error);
      }
    };
    
    // Check for OAuth completion every 2 seconds
    const interval = setInterval(checkOAuthCompletion, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      tokenCache={createTokenCache()} // This is crucial for session persistence in React Native
    >
      <AuthProvider>
        <AuthVerificationGate>
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
              name="profile-setup"
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
            <Stack.Screen
              name="auth/welcome-back"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </AuthVerificationGate>
      </AuthProvider>
    </ClerkProvider>
  );
}
