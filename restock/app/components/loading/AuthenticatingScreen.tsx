import React from 'react';
import { BaseLoadingScreen } from './BaseLoadingScreen';

interface AuthenticatingScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export function AuthenticatingScreen({ onComplete, duration = 2500 }: AuthenticatingScreenProps) {
  return (
    <BaseLoadingScreen
      title="Authenticating with Google"
      subtitle="Securely logging you in and setting up your account..."
      icon="shield-checkmark"
      color="#4285F4"
      showProgress={true}
      progressDuration={duration}
      onComplete={onComplete}
    />
  );
}