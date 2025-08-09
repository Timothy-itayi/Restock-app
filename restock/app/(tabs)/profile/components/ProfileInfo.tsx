import React from 'react';
import { View, Text, Image } from 'react-native';
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
      <Image 
        source={require('../../../../assets/images/user_name.png')}
        style={profileStyles.profileImage}
        resizeMode="contain"
      />
      
      <View style={profileStyles.profileInfo}>
        <Text style={profileStyles.userName}>
          {userProfile?.name || userFirstName || 'Not set'}
        </Text>
        <Text style={profileStyles.userEmail}>
          {userEmail || 'Not available'}
        </Text>
      </View>
    </View>
  );
};