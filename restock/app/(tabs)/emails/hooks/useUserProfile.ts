import { useState, useEffect } from 'react';
import { useAuth } from "@clerk/clerk-expo";
import { UserProfileService } from "../../../../backend/services/user-profile";

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
        const result = await UserProfileService.getUserProfile(userId);
        if (result.data) {
          setUserProfile({
            name: result.data.name || "",
            email: result.data.email || "",
            storeName: result.data.store_name || ""
          });
        }
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