import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import useThemeStore from '../../stores/useThemeStore';
import { useUser } from '@clerk/clerk-expo';
import { UserProfileService } from '../../../backend/services/user-profile';
import { SessionService } from '../../../backend/services/sessions';
import { EmailService } from '../../../backend/services/emails';
import { useUnifiedAuth } from '../../_contexts/UnifiedAuthProvider';
import SignOutButton from '../../components/SignOutButton';
import { getProfileStyles } from '../../../styles/components/profile';
import { useThemedStyles } from '../../../styles/useThemedStyles';
import { ProfileSkeleton } from '../../components/skeleton';
import { ProfileHeader, ProfileInfo, StorePlanCard, StatsCards, HistorySection } from './components';

export default function ProfileScreen() {
  const { user } = useUser();
  const { userId } = useUnifiedAuth();
  const { theme } = useThemeStore();
  const profileStyles = useThemedStyles(getProfileStyles); // must be called every render before any early returns
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [minLoadingTime, setMinLoadingTime] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [emailCount, setEmailCount] = useState(0);

  // Show skeleton until both user and profile data are loaded, plus minimum loading time
  // Treat userProfile === null as a valid "ready" state (no profile found)
  const isDataReady = !loading && user !== undefined && !minLoadingTime;

  // Minimum loading time to prevent flicker
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadingTime(false);
    }, 300); // 300ms minimum loading time
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const result = await UserProfileService.verifyUserProfile(user.id);
          if (result.data) {
            setUserProfile(result.data);
          } else {
            setUserProfile(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        } finally {
          setLoading(false);
        }
      } else if (user === null) {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user?.id, user]);

  // Fetch session and email counts
  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        // Get session count
        const sessionsResult = await SessionService.getUserSessions(userId);
        if (sessionsResult.data) {
          setSessionCount(sessionsResult.data.length);
        }

        // Get email count
        const emailsResult = await EmailService.getUserEmails(userId);
        if (emailsResult.data) {
          setEmailCount(emailsResult.data.length);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [userId]);

  if (!isDataReady) {
    return <ProfileSkeleton />;
  }

  return (
    <ScrollView
      style={[
        profileStyles.container,
        { backgroundColor: theme.neutral.lightest },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ProfileHeader />
      
      <ProfileInfo 
        userProfile={userProfile} 
        userEmail={user?.emailAddresses[0]?.emailAddress} 
        userFirstName={user?.firstName} 
      />
         
      <StorePlanCard storeName={userProfile?.store_name} />
     
      <StatsCards sessionCount={sessionCount} emailCount={emailCount} />
      

      
      {/* Sign Out */}
      <View style={profileStyles.signOutSection}>
        <SignOutButton />
      </View>
    </ScrollView>
  );
}