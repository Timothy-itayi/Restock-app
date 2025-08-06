import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../_contexts/AuthContext';
import { useClerkAuth } from '../_contexts/ClerkAuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireNoAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = false, requireNoAuth = false }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isVerifying } = useAuthContext();
  const { isSSOFlowActive } = useClerkAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while loading or verifying
    if (isLoading || isVerifying) return;

    // CRITICAL FIX: Don't redirect if SSO flow is active
    if (isSSOFlowActive) {
      console.log('AuthGuard: SSO flow is active, skipping redirects to allow flow completion');
      return;
    }

    if (requireAuth && !isAuthenticated) {
      // User needs to be authenticated but isn't
      console.log('AuthGuard: User not authenticated, redirecting to welcome');
      router.replace('/welcome');
      return;
    }

    if (requireNoAuth && isAuthenticated) {
      // User shouldn't be authenticated but is
      console.log('AuthGuard: User is authenticated, redirecting to dashboard');
      router.replace('/(tabs)/dashboard');
      return;
    }
  }, [isAuthenticated, isLoading, isVerifying, requireAuth, requireNoAuth, router, isSSOFlowActive]);

  // Show children while loading or verifying (let AuthVerificationGate handle loading screen)
  if (isLoading || isVerifying) {
    return <>{children}</>;
  }

  return <>{children}</>;
} 