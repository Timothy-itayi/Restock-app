import React from 'react';

import { useAuthContext } from '../_contexts/AuthContext';
import { DashboardSkeleton } from './skeleton';

interface AuthVerificationGateProps {
  children: React.ReactNode;
}

export default function AuthVerificationGate({ children }: AuthVerificationGateProps) {
  const { isVerifying } = useAuthContext();

  // Only show skeleton during verification, not during initial loading
  // This eliminates the welcome skeleton step and lets the welcome screen render naturally
  if (isVerifying) {
    return <DashboardSkeleton />;
  }

  return <>{children}</>;
} 