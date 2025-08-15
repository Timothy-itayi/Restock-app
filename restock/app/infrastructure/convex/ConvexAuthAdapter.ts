import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { ConvexReactClient } from "convex/react";

/**
 * ConvexAuthAdapter
 * 
 * Handles Clerk → Convex authentication synchronization
 * Provides fresh JWT tokens to Convex for WebSocket authentication
 * Maintains clean architecture by isolating auth concerns
 */
export const useConvexAuthAdapter = (convexClient: ConvexReactClient) => {
  const { getToken, isSignedIn } = useAuth();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let authInterval: NodeJS.Timeout;

    const syncAuth = async () => {
      if (!isSignedIn) {
        console.log('🔧 ConvexAuthAdapter: Clearing Convex auth - user not signed in');
        await convexClient.clearAuth();
        return;
      }

      try {
        console.log('🔧 ConvexAuthAdapter: Syncing Clerk auth with Convex');
        
        // Get fresh JWT token from Clerk with "convex" template
        const token = await getToken({ template: "convex" });
        if (!token) {
          throw new Error('No JWT token available from Clerk');
        }

        if (isMounted.current) {
          // Set the auth token on the Convex client
          await convexClient.setAuth(token);
          console.log('✅ ConvexAuthAdapter: Auth token set successfully');
        }
      } catch (error) {
        console.error('❌ ConvexAuthAdapter: Error syncing auth:', error);
        if (isMounted.current) {
          await convexClient.clearAuth();
        }
      }
    };

    // Initial auth sync
    syncAuth();

    // Refresh token every 5 minutes to ensure freshness
    authInterval = setInterval(syncAuth, 5 * 60 * 1000);

    return () => {
      clearInterval(authInterval);
    };
  }, [getToken, isSignedIn, convexClient]);
};
