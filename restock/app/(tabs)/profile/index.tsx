import React, { useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import useThemeStore from '../../stores/useThemeStore';
import { useUser } from '@clerk/clerk-expo';
import { useUnifiedAuth } from '../../_contexts/UnifiedAuthProvider';
import SignOutButton from '../../components/SignOutButton';
import { getProfileStyles } from '../../../styles/components/profile';
import { useThemedStyles } from '../../../styles/useThemedStyles';
import { ProfileSkeleton } from '../../components/skeleton';
import { ProfileHeader, ProfileInfo, StorePlanCard, StatsCards, HistorySection } from './components';
import { useProfileData } from './hooks/useProfileData';

export default function ProfileScreen() {
  const { user } = useUser();
 
  const { theme } = useThemeStore();
  const profileStyles = useThemedStyles(getProfileStyles); // must be called every render before any early returns
  const [minLoadingTime, setMinLoadingTime] = useState(true);
  const { profile: userProfile, sessionCount, emailCount, loading, userId } = useProfileData();

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

  // Stats are provided by useProfileData

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
         
      <StorePlanCard storeName={userProfile?.storeName} />
     
      <StatsCards sessionCount={sessionCount} emailCount={emailCount} />
      

      
      {/* Sign Out */}
      <View style={profileStyles.signOutSection}>
        <SignOutButton />
      </View>
    </ScrollView>
  );
}