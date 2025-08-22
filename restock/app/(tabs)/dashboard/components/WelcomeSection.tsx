import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getDashboardStyles } from '../../../../styles/components/dashboard';
import { useThemedStyles } from '../../../../styles/useThemedStyles';
import SkeletonBox from '../../../components/skeleton/SkeletonBox';
import useProfileStore from '../../../stores/useProfileStore';
import { useClientSideAuth } from '../../../hooks/useClientSideAuth';

interface WelcomeSectionProps {
  profileLoading: boolean;
  userName?: string;
  storeName?: string;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  profileLoading,
  userName,
  storeName
}) => {
  const dashboardStyles = useThemedStyles(getDashboardStyles);
  const { error: profileError, isProfileLoaded, retryProfileLoad } = useProfileStore();
  const { userId } = useClientSideAuth();
  
  const handleRetry = () => {
    if (userId) {
      retryProfileLoad(userId);
    }
  };
  
  // Show error state if profile failed to load
  if (profileError && !profileLoading) {
    return (
      <View style={dashboardStyles.welcomeSection}>
        <Text style={[dashboardStyles.welcomeTitle, { color: '#DC3545' }]}>
          Error loading profile
        </Text>
        <Text style={[dashboardStyles.welcomeSubtitle, { color: '#666' }]}>
          {profileError}
        </Text>
        <TouchableOpacity 
          onPress={handleRetry}
          style={{
            marginTop: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: '#007AFF',
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Show loading state
  if (profileLoading || !isProfileLoaded) {
    return (
      <View style={dashboardStyles.welcomeSection}>
        <SkeletonBox width="60%" height={36} />
        <SkeletonBox width="80%" height={22} style={{ marginTop: 8 }} />
      </View>
    );
  }
  
  // Show profile data
  return (
    <View style={dashboardStyles.welcomeSection}>
      <Text style={dashboardStyles.welcomeTitle}>
        Hello, <Text style={dashboardStyles.userName}>{userName || 'there'}</Text>!
      </Text>
      <Text style={dashboardStyles.welcomeSubtitle}>
        Welcome to your restocking dashboard{storeName ? ` for ${storeName}` : ''}
      </Text>
    </View>
  );
};