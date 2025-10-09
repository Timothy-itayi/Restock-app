import React from 'react';
import { BaseLoadingScreen } from './BaseLoadingScreen';

interface SettingUpProfileScreenProps {
  onComplete?: () => void;
  duration?: number;
  userName?: string;
}

export function SettingUpProfileScreen({ 
  onComplete, 
  duration = 2000, 
  userName 
}: SettingUpProfileScreenProps) {
  const subtitle = userName 
    ? `Setting up your profile, ${userName}! Almost ready to start managing your inventory.`
    : 'Setting up your profile! Almost ready to start managing your inventory.';

  return (
    <BaseLoadingScreen
      title="Setting up your account"
      subtitle={subtitle}
      icon="person-add"
      color="#6B7F6B"
      showProgress={true}
      progressDuration={duration}
      onComplete={onComplete}
    />
  );
}