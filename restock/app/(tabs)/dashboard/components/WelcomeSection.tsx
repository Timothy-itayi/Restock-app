import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useDashboardTheme } from '../../../../styles/components/dashboard';
import { useAppTheme } from '../../../hooks/useResponsiveStyles';
import SkeletonBox from '../../../components/skeleton/SkeletonBox';

interface WelcomeSectionProps {
  profileLoading: boolean;
  userName?: string;
  storeName?: string;
  profileError?: string | null;
  retryProfileLoad?: (userId: string) => Promise<void>;
  userId?: string | null;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  profileLoading,
  userName,
  storeName,
  profileError,
  retryProfileLoad,
  userId
}) => {
  const { styles: dashboardStyles } = useDashboardTheme();
  const appTheme = useAppTheme();
  
  const handleRetry = () => {
    if (userId && retryProfileLoad) {
      retryProfileLoad(userId);
    }
  };
  
  // Show error state if profile failed to load
  if (profileError && !profileLoading) {
    return (
      <View style={dashboardStyles.welcomeSection}>
        <Text style={[dashboardStyles.welcomeTitle, { color: appTheme.colors.status.error }]}>
          Error loading profile
        </Text>
        <Text style={[dashboardStyles.welcomeSubtitle, { color: appTheme.colors.neutral.medium }]}>
          {profileError}
        </Text>
        <TouchableOpacity 
          onPress={handleRetry}
          style={{
            marginTop: 12,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: appTheme.colors.brand.primary,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: appTheme.colors.neutral.lightest, fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Show loading state
  if (profileLoading) {
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