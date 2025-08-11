import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '@/app/stores/useThemeStore';
import { getProfileStyles } from '../../../../styles/components/profile';
import { useThemedStyles } from '../../../../styles/useThemedStyles';

interface ProfileInfoProps {
  userProfile?: any;
  userEmail?: string;
  userFirstName?: string | null;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({
  userProfile,
  userEmail,
  userFirstName
}) => {
  const { theme } = useThemeStore();
  const profileStyles = useThemedStyles(getProfileStyles);
  return (
    <View style={profileStyles.profileSection}>
      <View style={profileStyles.profileAvatar}>
        <Ionicons 
          name="person" 
          size={40} 
          color={theme.brand.primary} 
        />
      </View>
      
      <View style={profileStyles.profileInfo}>
        <Text style={profileStyles.userName}>
          {userProfile?.name || userFirstName || 'Welcome!'}
        </Text>
        <Text style={profileStyles.userEmail}>
          {userEmail || 'Email not available'}
        </Text>
        {userProfile?.store_name && (
          <Text style={profileStyles.storeTag}>
            {userProfile.store_name}
          </Text>
        )}
      </View>
    </View>
  );
};