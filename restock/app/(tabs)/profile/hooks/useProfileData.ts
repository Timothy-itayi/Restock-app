import { useEffect, useMemo, useState } from 'react';
import { useUnifiedAuth } from '../../../_contexts/UnifiedAuthProvider';
import { useSessionRepository, useProductRepository, useSupplierRepository, useEmailRepository } from '../../../infrastructure/repositories/SupabaseHooksProvider';
import useProfileStore from '../../../stores/useProfileStore';

export interface ProfileData {
  name: string;
  email: string;
  storeName: string;
}

export function useProfileData() {
  const { user, userId, isAuthenticated } = useUnifiedAuth();
  const { create, findById, findByUserId, addItem, removeItem, updateName, updateStatus } = useSessionRepository();
  const { userName, storeName, fetchProfile, isLoading: profileLoading } = useProfileStore();

  const [profile, setProfile] = useState<ProfileData>({ name: '', email: '', storeName: '' });
  const [sessionCount, setSessionCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const baseProfile = useMemo(() => ({
    name: userName || user?.firstName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    storeName: storeName || '',
  }), [userName, storeName, user?.firstName, user?.primaryEmailAddress?.emailAddress]);

  // Update local profile state when store data changes
  useEffect(() => {
    setProfile(baseProfile);
  }, [baseProfile]);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || !userId) {
        setLoading(false);
        return;
      }
      
      try {
        // Only fetch profile if we don't already have data in the store
        if (!userName || !storeName) {
          console.log('📊 useProfileData: Profile data missing, fetching from database');
          await fetchProfile(userId);
        } else {
          console.log('📊 useProfileData: Using existing profile data from store');
        }
        
        // Load session data
        const sessions = await findByUserId(userId);
        if (sessions) {
          const total = sessions.length;
          setSessionCount(total);
          
          // Email count: approximate via sessions with email_generated + sent
          const emailRelated = sessions.filter((s: any) => s.status === 'email_generated' || s.status === 'sent').length;
          setEmailCount(emailRelated);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated, userId, fetchProfile, userName, storeName]);

  return { profile, sessionCount, emailCount, loading: loading || profileLoading, userId };
}