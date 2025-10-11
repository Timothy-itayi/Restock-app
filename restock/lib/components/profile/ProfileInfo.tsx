import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../stores/useThemeStore';
import { getProfileStyles } from '../../../styles/components/profile';
import { useThemedStyles } from '../../../styles/useThemedStyles';

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
  
  // Use the profile data from the hook, with fallbacks
  const displayName = userProfile?.name || userFirstName || 'Welcome!';
  const displayEmail = userProfile?.email || userEmail || 'Email not available';
  const displayStoreName = userProfile?.storeName || '';
  
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
          {displayName}
        </Text>
        <Text style={profileStyles.userEmail}>
          {displayEmail}
        </Text>
        {displayStoreName && (
          <Text style={profileStyles.storeTag}>
            {displayStoreName}
          </Text>
        )}
      </View>
    </View>
  );
};