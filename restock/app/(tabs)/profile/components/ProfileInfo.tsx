import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/theme/colors';
import { profileStyles } from '../../../../styles/components/profile';

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
  return (
    <View style={profileStyles.profileSection}>
      <View style={profileStyles.profileAvatar}>
        <Ionicons 
          name="person" 
          size={40} 
          color={colors.brand.primary} 
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