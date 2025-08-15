import { ConvexProvider, ConvexReactClient } from "convex/react";


// Create a Convex client
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

/**
 * Convex Provider with Clerk Authentication
 * 
 * Wraps the app with Convex client and handles authentication
 * This ensures Convex functions can access Clerk's auth context
 */
export function ConvexProviderWithClerk({ children }: { children: React.ReactNode }) {
  return (
    <ConvexProvider client={convex}>
      {children}
    </ConvexProvider>
  );
}
