import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { ConvexHooksProvider } from "../infrastructure/convex/ConvexHooksProvider";

// Create a Convex client
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

/**
 * Hook to sync Clerk auth state with Convex
 * This ensures fresh JWT tokens are passed to Convex for WebSocket authentication
 */
function useConvexAuthSync() {
  const { isSignedIn, getToken } = useAuth();
  const [isConvexReady, setIsConvexReady] = useState(false);
  
  useEffect(() => {
    const syncAuth = async () => {
      if (isSignedIn) {
        try {
          console.log('🔧 ConvexProvider: Setting auth token for Convex');
          
          // Get fresh JWT token from Clerk with "convex" template
          const token = await getToken({ template: "convex" });
          if (!token) {
            throw new Error('No JWT token available from Clerk');
          }
          
          console.log('🔧 ConvexProvider: JWT token obtained, setting Convex auth');
          
          // Set the auth token on the Convex client as a function
          await convex.setAuth(async () => {
            const freshToken = await getToken({ template: "convex" });
            if (!freshToken) {
              throw new Error('No JWT token available from Clerk');
            }
            return freshToken;
          });
          
          console.log('✅ ConvexProvider: Auth token set successfully');
          setIsConvexReady(true);
          
        } catch (error) {
          console.error('❌ ConvexProvider: Error setting auth token:', error);
          await convex.clearAuth();
          setIsConvexReady(false);
        }
      } else {
        console.log('🔧 ConvexProvider: Clearing Convex auth - user not signed in');
        await convex.clearAuth();
        setIsConvexReady(false);
      }
    };
    
    syncAuth();
  }, [isSignedIn, getToken]);
  
  return { isConvexReady };
}

/**
 * Convex Provider with Clerk Authentication
 * 
 * Wraps the app with Convex client and syncs Clerk auth state
 * This ensures Convex functions can access Clerk's auth context via WebSocket
 */
export function ConvexProviderWithClerk({ children }: { children: React.ReactNode }) {
  // Sync Clerk auth with Convex
  const { isConvexReady } = useConvexAuthSync();
  
  // Show loading state while Convex auth is being established
  if (!isConvexReady) {
    console.log('⏳ ConvexProvider: Waiting for Convex authentication...');
    return null; // or a loading spinner
  }
  
  console.log('✅ ConvexProvider: Convex is ready and authenticated');
  
  return (
    <ConvexProvider client={convex}>
      <ConvexHooksProvider convexClient={convex}>
        {children}
      </ConvexHooksProvider>
    </ConvexProvider>
  );
}
