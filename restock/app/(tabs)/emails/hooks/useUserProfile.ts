import { useState, useEffect } from 'react';
import { useAuth } from "@clerk/clerk-expo";

export interface UserProfile {
  name: string;
  email: string;
  storeName: string;
}

export function useUserProfile() {
  const { userId } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    email: "",
    storeName: ""
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        setError(null);
        // Use Clerk data for now; avoid direct backend service
        // This keeps UI decoupled and relies on authenticated user context
        setUserProfile((prev) => ({ ...prev }));
      } catch (error) {
        console.error('Error loading user profile:', error);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

  return {
    userProfile,
    isLoading,
    error,
    userId
  };
}