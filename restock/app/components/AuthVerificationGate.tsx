import React from 'react';
import { useClerkAuth } from '../_contexts/ClerkAuthContext';
import { useAuthContext } from '../_contexts/AuthContext';
import { DashboardSkeleton } from './skeleton';
import { AuthenticatingScreen } from './loading';

interface AuthVerificationGateProps {
  children: React.ReactNode;
}

export default function AuthVerificationGate({ children }: AuthVerificationGateProps) {
  const { isLoading: isClerkLoading, isSSOAuthenticating } = useClerkAuth();
  const { isVerifying, isLoading } = useAuthContext();

  // Wait for Clerk to load before showing anything
  if (isClerkLoading) {
    console.log('AuthVerificationGate: Waiting for Clerk to load');
    return <DashboardSkeleton />;
  }

  // Show SSO authenticating screen for Google OAuth users to provide better UX
  if (isSSOAuthenticating) {
    return <AuthenticatingScreen duration={3000} />;
  }

  // Show loading screen while AuthContext is initializing
  if (isLoading) {
    console.log('AuthVerificationGate: AuthContext is loading');
    return <DashboardSkeleton />;
  }

  // Only show skeleton during verification, not during initial loading
  // This eliminates the welcome skeleton step and lets the welcome screen render naturally
  if (isVerifying) {
    return <DashboardSkeleton />;
  }

  return <>{children}</>;
} 