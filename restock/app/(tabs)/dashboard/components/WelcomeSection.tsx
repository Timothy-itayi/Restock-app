import React from 'react';
import { View, Text } from 'react-native';
import { dashboardStyles } from '../../../../styles/components/dashboard';
import SkeletonBox from '../../../components/skeleton/SkeletonBox';

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
  return (
    <View style={dashboardStyles.welcomeSection}>
      {profileLoading ? (
        <>
          <SkeletonBox width="60%" height={36} />
          <SkeletonBox width="80%" height={22} style={{ marginTop: 8 }} />
        </>
      ) : (
        <>
          <Text style={dashboardStyles.welcomeTitle}>
            Hello, <Text style={dashboardStyles.userName}>{userName || 'there'}</Text>!
          </Text>
          <Text style={dashboardStyles.welcomeSubtitle}>
            Welcome to your restocking dashboard{storeName ? ` for ${storeName}` : ''}
          </Text>
        </>
      )}
    </View>
  );
};