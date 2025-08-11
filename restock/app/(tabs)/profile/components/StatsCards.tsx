import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@/app/theme/colors';
import { profileStyles } from '../../../../styles/components/profile';

interface StatsCardsProps {
  sessionCount: number;
  emailCount: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  sessionCount,
  emailCount
}) => {
  return (
    <View style={profileStyles.statsContainer}>
      <View style={profileStyles.statCard}>
        <View style={[profileStyles.statIconRestock, { backgroundColor: colors.brand.primary + '22' }]}>
          <Ionicons 
            name="layers-outline" 
            size={24} 
            color={colors.brand.primary} 
          />
        </View>
        <Text style={profileStyles.statTitle}>Restock Sessions</Text>
        <Text style={profileStyles.statValue}>{sessionCount}</Text>
        <Text style={profileStyles.statDescription}>Total sessions</Text>
      </View>
      
      <View style={profileStyles.statCard}>
        <View style={[profileStyles.statIconEmail, { backgroundColor: colors.status.success + '22' }]}>
          <Ionicons 
            name="mail-outline" 
            size={24} 
            color={colors.status.success} 
          />
        </View>
        <Text style={profileStyles.statTitle}>Emails Sent</Text>
        <Text style={profileStyles.statValue}>{emailCount}</Text>
        <Text style={profileStyles.statDescription}>Total emails</Text>
      </View>
    </View>
  );
};