import { useEffect, useMemo, useState } from 'react';
import { useUnifiedAuth } from '../../../_contexts/UnifiedAuthProvider';
import { useRestockApplicationService } from '../../restock-sessions/hooks/useService';
import useProfileStore from '../../../stores/useProfileStore';

export interface ProfileData {
  name: string;
  email: string;
  storeName: string;
}

export function useProfileData() {
  const { user, userId, isAuthenticated } = useUnifiedAuth();
  const restockService = useRestockApplicationService();
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

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || !userId) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch profile data first
        await fetchProfile(userId);
        
        // Update local profile state
        setProfile(baseProfile);
        
        // Load session data
        const result = await restockService.getSessions({ userId, includeCompleted: true });
        if (result.success && result.sessions) {
          const total = result.sessions.all.length;
          setSessionCount(total);
          
          // Email count: approximate via sessions with email_generated + sent
          const emailRelated = [...result.sessions.emailGenerated, ...result.sessions.sent].length;
          setEmailCount(emailRelated);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [baseProfile, isAuthenticated, restockService, userId, fetchProfile]);

  return { profile, sessionCount, emailCount, loading: loading || profileLoading, userId };
}


