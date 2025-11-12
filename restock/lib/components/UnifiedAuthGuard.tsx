import React from 'react';
import { usePathname } from 'expo-router';
import { useUnifiedAuth } from '../auth/UnifiedAuthProvider';
import { traceRender } from '../utils/renderTrace';

interface UnifiedAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;     // defaults to false now
  requireNoAuth?: boolean;
}

export const UnifiedAuthGuard: React.FC<UnifiedAuthGuardProps> = ({
  children,
  requireAuth = false,
  requireNoAuth = false,
}) => {
  traceRender('UnifiedAuthGuard', {});
  const { isReady, isLoading, isAuthenticated, userId, hasValidProfile, isProfileLoading } = useUnifiedAuth();
  const pathname = usePathname();

  // No guard → just render children
  if (!requireAuth && !requireNoAuth) {
    return <>{children}</>;
  }

  // Allow rendering while auth hydrates (avoid “Loading...” flash)
  if (!isReady || isLoading) {
    return <>{children}</>;
  }

  // Never block auth / welcome / profile-setup routes
  const isAuthRoute = pathname?.includes('/auth') || pathname?.includes('/welcome') || pathname?.includes('profile-setup');
  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (requireNoAuth) {
    // Logged-in user on unauth-only route → render nothing; AuthRouter handles redirect
    if (isAuthenticated && userId) {
      return null;
    }
    return <>{children}</>;
  }

  if (requireAuth) {
    // Keep screen blank until auth conditions are satisfied; no loader fallback
    if (!isAuthenticated || !userId || isProfileLoading || !hasValidProfile) {
      return null;
    }
  }

  return <>{children}</>;
};

UnifiedAuthGuard.displayName = 'UnifiedAuthGuard';