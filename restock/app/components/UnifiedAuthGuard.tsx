import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { router, useSegments } from 'expo-router';
import { useUnifiedAuth } from '../_contexts/UnifiedAuthProvider';
import { BaseLoadingScreen } from './loading';
import { App_LoadingScreen } from './loading/App_loading_screen';

interface UnifiedAuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireNoAuth?: boolean;
  requireProfileSetup?: boolean;
  redirectTo?: string;
}

export default function UnifiedAuthGuard({ 
  children, 
  requireAuth = false, 
  requireNoAuth = false,
  requireProfileSetup = false,
  redirectTo 
}: UnifiedAuthGuardProps) {
  const { isReady, isAuthenticated, isLoading, authType } = useUnifiedAuth();
  const segments = useSegments();
  const [lastLoadingState, setLastLoadingState] = useState<string | null>(null);
  const [loadingStateTime, setLoadingStateTime] = useState<number>(0);

  // Track loading state changes
  useEffect(() => {
    const currentState = !isReady || isLoading ? 'auth-loading' : 
      (isAuthenticated && authType?.needsProfileSetup) ? 'profile-setup-loading' : 'ready';
    
    if (currentState !== lastLoadingState) {
      console.log('🔄 UnifiedAuthGuard: Loading state changed', {
        from: lastLoadingState,
        to: currentState,
        timestamp: Date.now()
      });
      setLastLoadingState(currentState);
      setLoadingStateTime(Date.now());
    }
  }, [isReady, isLoading, isAuthenticated, authType?.needsProfileSetup, lastLoadingState, loadingStateTime]);

  useEffect(() => {
    console.log('🚨 UnifiedAuthGuard: Effect triggered', {
      isReady,
      isAuthenticated,
      authType,
      requireAuth,
      requireNoAuth,
      requireProfileSetup,
      currentRoute: segments[0],
      segments,
      guardId: Math.random().toString(36).substr(2, 9) // Add unique ID to track different guards
    });

    if (!isReady) {
      console.log('⏳ UnifiedAuthGuard: Auth not ready yet, waiting...');
      return;
    }

    console.log('🔍 UnifiedAuthGuard: Auth is ready, analyzing conditions:', {
      isAuthenticated,
      authType,
      requireAuth,
      requireNoAuth,
      requireProfileSetup,
      currentRoute: segments[0],
      segments,
      needsProfileSetup: authType?.needsProfileSetup,
      timeSinceLastStateChange: Date.now() - loadingStateTime
    });

    // If no auth is required but user is authenticated, redirect to dashboard
    if (requireNoAuth && isAuthenticated) {
      console.log('🚫 UnifiedAuthGuard: No auth required but user is authenticated, redirecting to dashboard');
      router.replace('/(tabs)/dashboard');
      return;
    }

    // If auth is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      console.log('🚫 UnifiedAuthGuard: Auth required but user not authenticated, redirecting to welcome');
      router.replace('/welcome');
      return;
    }

    // If user is authenticated and needs profile setup (regardless of requireProfileSetup flag)
    if (isAuthenticated && authType.needsProfileSetup) {
      console.log('🚫 UnifiedAuthGuard: Profile setup required but not completed', {
        isNewSignUp: authType.isNewSignUp,
        userType: authType.type,
        currentRoute: segments[0]
      });
      
      // Don't redirect if already on profile setup page
      const currentRoute = segments[0];
      if (currentRoute === 'sso-profile-setup' || 
          (segments[0] === 'auth' && segments[1] === 'traditional' && segments[2] === 'profile-setup')) {
        console.log('🔄 UnifiedAuthGuard: Already on profile setup page, allowing render');
        return;
      }
      
      // Handle Google users (both new and returning)
      if (authType.type === 'google') {
        console.log('🚀 UnifiedAuthGuard: Google user needs profile setup, redirecting to SSO profile setup');
        router.replace('/sso-profile-setup');
        return;
      } else {
        console.log('🚀 UnifiedAuthGuard: Email user needs profile setup, redirecting to traditional profile setup');
        router.replace('/auth/traditional/profile-setup');
        return;
      }
    }

    // If user is authenticated and has completed setup, redirect to dashboard if on auth screens
    if (isAuthenticated && !authType.needsProfileSetup) {
      const currentRoute = segments[0];
      const isOnAuthScreen = currentRoute === 'auth' || currentRoute === 'welcome' || currentRoute === 'sso-profile-setup';
      
      if (isOnAuthScreen && !redirectTo) {
        console.log('🚀 UnifiedAuthGuard: User authenticated and setup complete, redirecting to dashboard');
        router.replace('/(tabs)/dashboard');
        return;
      }
    }

    // If redirectTo is specified and user is authenticated
    if (redirectTo && isAuthenticated && !authType.needsProfileSetup) {
      console.log(`🚀 UnifiedAuthGuard: Redirecting to specified route: ${redirectTo}`);
      router.replace(redirectTo as any);
      return;
    }

    console.log('✅ UnifiedAuthGuard: All conditions met, rendering children');
  }, [isReady, isAuthenticated, authType, requireAuth, requireNoAuth, requireProfileSetup, redirectTo, segments]);

  // Add error boundary for auth context
  if (!authType) {
    console.error('❌ UnifiedAuthGuard: AuthType is null/undefined, showing error state');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#DC3545', marginBottom: 10 }}>Authentication Error</Text>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 }}>
          There was an issue with the authentication system. This could happen due to:
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'left', marginBottom: 20 }}>
          • Network connectivity issues{'\n'}
          • Temporary server problems{'\n'}
          • App data corruption
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          Please restart the app and try again. If the problem persists, contact support.
        </Text>
      </View>
    );
  }

  // Show loading screen while auth is not ready
  if (!isReady || isLoading) {
    console.log('⏳ UnifiedAuthGuard: Showing auth loading screen', { 
      isReady, 
      isLoading, 
      timestamp: Date.now(),
      segments: segments
    });
    return <App_LoadingScreen 
      title="Restock"
      subtitle="Streamlining your store operations"
      color="#6B7F6B"
      showProgress={true}
      progressDuration={3000}
    />;
  }

  // Show loading screen for authenticated users who need profile setup
  if (isAuthenticated && authType.needsProfileSetup) {
    const currentRoute = segments[0];
    const isAlreadyOnSetupPage = currentRoute === 'sso-profile-setup' || 
      (segments[0] === 'auth' && segments[1] === 'traditional' && segments[2] === 'profile-setup');
    
    if (!isAlreadyOnSetupPage) {
      console.log('⏳ UnifiedAuthGuard: User needs profile setup, showing redirect loading', {
        authType,
        currentRoute,
        segments,
        timestamp: Date.now()
      });
      return <BaseLoadingScreen 
        title="Setting up profile..."
        subtitle="Redirecting to profile setup"
        icon="person"
        color="#6B7F6B"
      />;
    }
  }

  // Show loading screen for unauthenticated users when auth is required
  if (requireAuth && !isAuthenticated) {
    console.log('⏳ UnifiedAuthGuard: Auth required but not authenticated, showing loading while redirecting');
    return <App_LoadingScreen 
      title="Authentication required"
      subtitle="Redirecting to sign in"
      color="#6B7F6B"
      showProgress={false}
    />;
  }

  // Render children if all conditions are met
  return <>{children}</>;
} 