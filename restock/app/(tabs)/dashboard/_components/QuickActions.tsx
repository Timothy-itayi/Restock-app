import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { getDashboardStyles } from '../../../../styles/components/dashboard';
import useThemeStore from '../../../../lib/stores/useThemeStore';
import { useThemedStyles } from '../../../../styles/useThemedStyles';

export const QuickActions: React.FC = () => {
  const dashboardStyles = useThemedStyles(getDashboardStyles);
  const { theme } = useThemeStore();
  return (
    <View style={dashboardStyles.section}>
      <Text style={[dashboardStyles.sectionTitle, { color: theme.neutral.darkest }]}>Quick Actions</Text>
      <View style={dashboardStyles.actionGrid}>
        <TouchableOpacity 
          style={[dashboardStyles.actionCard, { backgroundColor: theme.neutral.lighter }]}
          onPress={() => {
            console.log('[Dashboard] New Restock Session button pressed');
            router.push('/(tabs)/restock-sessions?action=create' as any);
          }}
        >
          <View style={[dashboardStyles.actionIconContainer, { backgroundColor: theme.neutral.lighter }]}>
            <Image 
              source={require('../../../../assets/images/new_restock_session.png')}
              style={[dashboardStyles.actionIcon, { tintColor: theme.neutral.darkest }]}
              resizeMode="contain"
              onError={(error) => console.log('Image loading error:', error)}
            />
          </View>
          <Text style={[dashboardStyles.actionText, { color: theme.neutral.darkest }]}>New Restock Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[dashboardStyles.actionCard, { backgroundColor: theme.neutral.lighter }]}
          onPress={() => router.push('/(tabs)/emails' as any)}
        >
          <View style={[dashboardStyles.actionIconContainer, { backgroundColor: theme.neutral.lighter }]}>
            <Image 
              source={require('../../../../assets/images/email_sent.png')}
              style={[dashboardStyles.actionIcon, { tintColor: theme.neutral.darkest }]}
              resizeMode="contain"
              onError={(error) => console.log('Image loading error:', error)}
            />
          </View>
          <Text style={[dashboardStyles.actionText, { color: theme.neutral.darkest }]}>View Emails</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};