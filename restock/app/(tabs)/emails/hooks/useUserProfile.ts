import { useUnifiedAuth } from '../../../auth';

import {  useEffect, useState } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  storeName: string;
  userName?: string; // Backward compatibility alias for name
}

export const useUserProfile = () => {
  const { userId, userName, storeName, isProfileLoading, profileError } = useUnifiedAuth();
  
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
        setIsLoading(false);
        return;
      }
      
      try {
        setError(null);
        
        // Get user email from SessionManager
        let userEmail = 'manager@store.com'; // Default fallback
        try {
          const { SessionManager } = await import('../../../../backend/services/session-manager');
          const session = await SessionManager.getUserSession();
          if (session?.email) {
            userEmail = session.email;
          }
        } catch (error) {
          console.warn('Could not get email from SessionManager, using default');
        }
        
        // Use data from UnifiedAuth system
        const finalProfile = {
          name: userName || 'Store Manager',
          email: userEmail,
          storeName: storeName || 'Your Store',
          userName: userName || 'Store Manager'
        };
        
        setUserProfile(finalProfile);
        
        console.log('📝 useUserProfile: Loaded profile data:', finalProfile);
        console.log('📝 useUserProfile: Raw UnifiedAuth data:', { userId, userName, storeName, isProfileLoading, profileError });
        
      } catch (error) {
        console.error('Error loading user profile:', error);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [userId, userName, storeName]);

  return {
    userProfile,
    isLoading,
    error,
    userId
  };
}