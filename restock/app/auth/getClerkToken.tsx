// app/_auth/getClerkToken.ts
import { useAuth } from '@clerk/clerk-expo'; // or clerk-sdk-browser for web

/**
 * Returns the current user's JWT token to authenticate with Supabase.
 * Returns `null` if no user is logged in.
 */

export async function getClerkToken(): Promise<string | null> {
    const { getToken } = useAuth();
  try {
    // This returns the JWT token string, or undefined if user not signed in
    const token = await getToken();
    return token || null;
  } catch (err) {
    console.error('[getClerkToken] Error fetching token:', err);
    return null;
  }
}
