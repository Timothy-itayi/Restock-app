import { useEffect, useMemo, useState } from 'react';
import { useUnifiedAuth } from "../../../auth/UnifiedAuthProvider";
import { useSessionRepository, useProductRepository, useSupplierRepository, useEmailRepository } from '../../../infrastructure/repositories/SupabaseHooksProvider';

export interface ProfileData {
  name: string;
  email: string;
  storeName: string;
}

export function useProfileData() {
  // Get all data from unified auth
  const { 
    userName, 
    storeName, 
    userId, 
    isAuthenticated, 
    isProfileLoading 
  } = useUnifiedAuth();
  
  const { create, findById, findByUserId, addItem, removeItem, updateName, updateStatus } = useSessionRepository();

  const [profile, setProfile] = useState<ProfileData>({ name: '', email: '', storeName: '' });
  const [sessionCount, setSessionCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const baseProfile = useMemo(() => ({
    name: userName || '',
    email: '', // We can get this from Clerk user if needed
    storeName: storeName || '',
  }), [userName, storeName]);

  // Update local profile state when unified auth data changes
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
        // Profile data is now handled by UnifiedAuthProvider automatically
        // Just load session data
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
  }, [isAuthenticated, userId, userName, storeName]);

  return { profile, sessionCount, emailCount, loading: loading || isProfileLoading, userId };
}