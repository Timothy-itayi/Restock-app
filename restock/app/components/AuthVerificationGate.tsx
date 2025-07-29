import React from 'react';
import { View } from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

interface AuthVerificationGateProps {
  children: React.ReactNode;
}

export default function AuthVerificationGate({ children }: AuthVerificationGateProps) {
  const { isVerifying, isLoading } = useAuthContext();

  // Show loading screen while Clerk is loading or while we're verifying authentication
  if (isLoading || isVerifying) {
    return (
      <LoadingScreen 
        message={isVerifying ? "Setting up your dashboard..." : "Loading..."} 
      />
    );
  }

  return <>{children}</>;
} 