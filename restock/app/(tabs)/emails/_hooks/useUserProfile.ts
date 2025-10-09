import { useUnifiedAuth } from '../../../../lib/auth/UnifiedAuthProvider';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';

export interface UserProfile {
  name: string;
  email: string;
  storeName: string;
  userName?: string;
}

export const useUserProfile = () => {
  const { userId, userName, storeName, isProfileLoading, profileError } = useUnifiedAuth();
  const { user } = useUser(); // Get Clerk user data for email fallback

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    storeName: "",
    userName: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) {
        console.log("No userId available yet");
        setIsLoading(false);
        return;
      }

      try {
        setError(null);

        // Use the same fallback pattern as ProfileInfo component
        // 1. First try to get email from database (via UnifiedAuth context if available)
        // 2. Then try Clerk user email as fallback (same as ProfileInfo)
        // 3. Finally use default fallback
        const clerkUserEmail = user?.emailAddresses[0]?.emailAddress;
        const displayEmail = clerkUserEmail || 'manager@store.com';

        const finalProfile: UserProfile = {
          name: userName || 'Store Manager',
          email: displayEmail,
          storeName: storeName || 'Your Store',
          userName: userName || 'Store Manager',
        };

        setUserProfile(finalProfile);

        console.log("📝 useUserProfile: Loaded profile data using same pattern as ProfileInfo:", finalProfile);
        console.log("📝 useUserProfile: Email sources:", { 
          clerkUserEmail: clerkUserEmail,
          finalEmail: displayEmail
        });
        console.log("📝 useUserProfile: Raw UnifiedAuth data:", { userId, userName, storeName, isProfileLoading, profileError });

      } catch (err) {
        console.error("Error loading user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, userName, storeName, user?.emailAddresses]);

  return { userProfile, isLoading, error, userId };
};