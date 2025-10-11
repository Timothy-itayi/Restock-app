import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { getDashboardStyles } from '../../../styles/components/dashboard';
import { useSafeTheme } from '../../stores/useThemeStore';
import colors, { AppColors } from '../../theme/colors';

export const QuickActions: React.FC = () => {
    const t = useSafeTheme();
  const dashboardStyles = getDashboardStyles(t.theme as AppColors);

  return (
    <View style={dashboardStyles.section}>
      <Text style={[dashboardStyles.sectionTitle, { color: colors.neutral.darkest }]}>Quick Actions</Text>
      <View style={dashboardStyles.actionGrid}>
        <TouchableOpacity 
          style={[dashboardStyles.actionCard, { backgroundColor: colors.neutral.lighter }]}
          onPress={() => {
            console.log('[Dashboard] New Restock Session button pressed');
            router.push('/(tabs)/restock-sessions?action=create' as any);
          }}
        >
          <View style={[dashboardStyles.actionIconContainer, { backgroundColor: colors.neutral.lighter }]}>
            <Image 
              source={require('../../../assets/images/new_restock_session.png')}
              style={[dashboardStyles.actionIcon, { tintColor: colors.neutral.darkest }]}
              resizeMode="contain"
              onError={(error) => console.log('Image loading error:', error)}
            />
          </View>
          <Text style={[dashboardStyles.actionText, { color: colors.neutral.darkest }]}>New Restock Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[dashboardStyles.actionCard, { backgroundColor: colors.neutral.lighter }]}
          onPress={() => router.push('/(tabs)/emails' as any)}
        >
          <View style={[dashboardStyles.actionIconContainer, { backgroundColor: colors.neutral.lighter }]}>
            <Image 
              source={require('../../../assets/images/email_sent.png')}
              style={[dashboardStyles.actionIcon, { tintColor: colors.neutral.darkest }]}
              resizeMode="contain"
              onError={(error) => console.log('Image loading error:', error)}
            />
          </View>
          <Text style={[dashboardStyles.actionText, { color: colors.neutral.darkest }]}>View Emails</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};