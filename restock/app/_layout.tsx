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
