import React from 'react';
import { View } from 'react-native';
import { useAuthContext } from '../_contexts/AuthContext';
import { DashboardSkeleton, WelcomeSkeleton } from './skeleton';

interface AuthVerificationGateProps {
  children: React.ReactNode;
}

export default function AuthVerificationGate({ children }: AuthVerificationGateProps) {
  const { isVerifying, isLoading } = useAuthContext();

  // Show loading screen while Clerk is loading or while we're verifying authentication
  if (isLoading || isVerifying) {
    // Use DashboardSkeleton for dashboard setup, WelcomeSkeleton for initial loading
    return isVerifying ? <DashboardSkeleton /> : <WelcomeSkeleton />;
  }

  return <>{children}</>;
} 