import { useEffect, useMemo, useState } from 'react';
import { useUnifiedAuth } from '../../../_contexts/UnifiedAuthProvider';
import { useRestockApplicationService } from '../../restock-sessions/hooks/useService';

export interface ProfileData {
  name: string;
  email: string;
  storeName: string;
}

export function useProfileData() {
  const { user, userId, isAuthenticated } = useUnifiedAuth();
  const restockService = useRestockApplicationService();

  const [profile, setProfile] = useState<ProfileData>({ name: '', email: '', storeName: '' });
  const [sessionCount, setSessionCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const baseProfile = useMemo(() => ({
    name: user?.firstName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    storeName: '',
  }), [user?.firstName, user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || !userId) {
        setLoading(false);
        return;
      }
      try {
        setProfile(baseProfile);
        const result = await restockService.getSessions({ userId, includeCompleted: true });
        if (result.success && result.sessions) {
          const total = result.sessions.all.length;
          setSessionCount(total);
        }
        // Email count: approximate via sessions with email_generated + sent
        if (result.success && result.sessions) {
          const emailRelated = [...result.sessions.emailGenerated, ...result.sessions.sent].length;
          setEmailCount(emailRelated);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [baseProfile, isAuthenticated, restockService, userId]);

  return { profile, sessionCount, emailCount, loading, userId };
}


