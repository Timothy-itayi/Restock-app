// app/_contexts/index.ts

// --- Unified Auth Provider & Hooks ---
export { 
  UnifiedAuthProvider,
  useUnifiedAuth
} from './UnifiedAuthProvider';

// --- Auth Components ---
export { ClerkDebugger } from '../components/ClerkDebugger';
export { default as SignOutButton } from '../components/SignOutButton';
export { default as AuthLayout } from '../components/AuthLayout';
export { UnifiedAuthGuard } from '../components/UnifiedAuthGuard';

// --- Auth Hooks / State ---
export { useAuthGuardState } from '../hooks/useAuthGuardState';

// --- Auth Services ---
export { ClerkClientService } from '../../backend/services/clerk-client';
export { UserProfileService } from '../../backend/services/user-profile';

// --- Deprecated: Only include if old store is still used by legacy code ---
// export { useAuthStore, useAuthState, useAuthType, useAuthActions } from './store';

// --- Auth Types ---
export type { AuthState, AuthAction, AuthType } from './state';
