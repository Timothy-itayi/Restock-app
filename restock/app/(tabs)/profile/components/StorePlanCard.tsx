import React from 'react';
import { View, Text, Image } from 'react-native';
import { profileStyles } from '../../../../styles/components/profile';

interface StorePlanCardProps {
  storeName?: string;
}

export const StorePlanCard: React.FC<StorePlanCardProps> = ({
  storeName
}) => {
  return (
    <View style={profileStyles.planCard}>
      <View style={profileStyles.planHeader}>
        <View style={profileStyles.planIcon}>
          <Image 
            source={require('../../../../assets/images/keys.png')}
            style={profileStyles.planIconImage}
            resizeMode="contain"
          />
        </View>
        <View style={profileStyles.planInfo}>
          <Text style={profileStyles.planLabel}>Your store</Text>
          <Text style={profileStyles.planName}>
            {storeName || 'Not set'}
          </Text>
        </View>
      </View>
    </View>
  );
};