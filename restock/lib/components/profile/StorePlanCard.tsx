import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useThemeStore from '../../stores/useThemeStore';
import { getProfileStyles } from '../../../styles/components/profile';
import { useThemedStyles } from '../../../styles/useThemedStyles';

interface StorePlanCardProps {
  storeName?: string;
}

export const StorePlanCard: React.FC<StorePlanCardProps> = ({
  storeName
}) => {
  const { theme } = useThemeStore();
  const profileStyles = useThemedStyles(getProfileStyles);
  return (
    <View style={profileStyles.planCard}>
      <View style={profileStyles.planHeader}>
        <View style={[profileStyles.planIcon, { backgroundColor: theme.brand.accent + '22' }]}>
          <Ionicons 
            name="storefront-outline" 
            size={28} 
            color={theme.brand.accent} 
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