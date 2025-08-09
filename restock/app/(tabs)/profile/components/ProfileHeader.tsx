import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profileStyles } from '../../../../styles/components/profile';

export const ProfileHeader: React.FC = () => {
  const handleSettingsPress = () => {
    Alert.alert(
      'Settings',
      'Settings functionality coming soon!',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={profileStyles.header}>
      <Text style={profileStyles.headerTitle}>Account</Text>
      <TouchableOpacity style={profileStyles.settingsButton} onPress={handleSettingsPress}>
        <Ionicons name="settings-outline" size={24} color="#6C757D" />
      </TouchableOpacity>
    </View>
  );
};