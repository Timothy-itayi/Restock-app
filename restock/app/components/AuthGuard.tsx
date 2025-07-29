import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthContext } from '../_contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireNoAuth?: boolean;
}

export default function AuthGuard({ children, requireAuth = false, requireNoAuth = false }: AuthGuardProps) {
  const { isAuthenticated, isLoading, isVerifying } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // Don't do anything while loading or verifying
    if (isLoading || isVerifying) return;

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
  }, [isAuthenticated, isLoading, isVerifying, requireAuth, requireNoAuth, router]);

  // Show children while loading or verifying (let AuthVerificationGate handle loading screen)
  if (isLoading || isVerifying) {
    return <>{children}</>;
  }

  return <>{children}</>;
} 