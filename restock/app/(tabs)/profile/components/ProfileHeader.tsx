import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profileStyles } from '../../../../styles/components/profile';
import colors from '@/app/theme/colors';
import useThemeStore from '@/app/stores/useThemeStore';

export const ProfileHeader: React.FC = () => {
  const { mode, theme, toggleMode } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <View style={profileStyles.header}>
      <View style={profileStyles.headerContent}>
        <Text style={profileStyles.headerTitle}>Profile</Text>
        <Text style={profileStyles.headerSubtitle}>Manage your account and preferences</Text>
      </View>
      <TouchableOpacity
        style={[
          profileStyles.settingsButton,
          { backgroundColor: theme.neutral.lighter },
        ]}
        onPress={toggleMode}
        accessibilityRole="button"
        accessibilityLabel="Toggle dark mode"
      >
        <Ionicons
          name={isDark ? 'moon' : 'sunny-outline'}
          size={22}
          color={isDark ? colors.dark.brand.primary : colors.light.brand.primary}
        />
      </TouchableOpacity>
    </View>
  );
};