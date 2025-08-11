import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/theme/colors';
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
        <View style={[profileStyles.planIcon, { backgroundColor: colors.brand.accent + '22' }]}>
          <Ionicons 
            name="storefront-outline" 
            size={28} 
            color={colors.brand.accent} 
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