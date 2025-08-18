import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk as ConvexClerkProvider } from "convex/react-clerk";
import { useAuth } from "@clerk/clerk-expo";
import { ConvexHooksProvider } from "../infrastructure/convex/ConvexHooksProvider";

// Create a Convex client
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

/**
 * Convex Provider with Clerk Authentication
 * 
 * Uses the official Convex + Clerk integration
 * This automatically handles JWT token management and auth state sync
 */
export function ConvexProviderWithClerk({ children }: { children: React.ReactNode }) {
  console.log('✅ ConvexProvider: Using official Convex + Clerk integration');
  
  return (
    <ConvexClerkProvider client={convex} useAuth={useAuth}>
      <ConvexHooksProvider convexClient={convex} isConvexReady={true}>
        {children}
      </ConvexHooksProvider>
    </ConvexClerkProvider>
  );
}
