import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { getDashboardStyles } from '../../../../styles/components/dashboard';

export const QuickActions: React.FC = () => {
  const theme = useThemedStyles((t) => t);
  const dashboardStyles = getDashboardStyles(theme);
  return (
    <View style={dashboardStyles.section}>
      <Text style={dashboardStyles.sectionTitle}>Quick Actions</Text>
      <View style={dashboardStyles.actionGrid}>
        <TouchableOpacity 
          style={dashboardStyles.actionCard}
          onPress={() => {
            console.log('[Dashboard] New Restock Session button pressed');
            router.push('/(tabs)/restock-sessions?action=create');
          }}
        >
          <View style={dashboardStyles.actionIconContainer}>
            <Image 
              source={require('../../../../assets/images/new_restock_session.png')}
              style={dashboardStyles.actionIcon}
              resizeMode="contain"
              onError={(error) => console.log('Image loading error:', error)}
            />
          </View>
          <Text style={dashboardStyles.actionText}>New Restock Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={dashboardStyles.actionCard}
          onPress={() => router.push('/(tabs)/emails')}
        >
          <View style={dashboardStyles.actionIconContainer}>
            <Image 
              source={require('../../../../assets/images/email_sent.png')}
              style={dashboardStyles.actionIcon}
              resizeMode="contain"
              onError={(error) => console.log('Image loading error:', error)}
            />
          </View>
          <Text style={dashboardStyles.actionText}>View Emails</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};