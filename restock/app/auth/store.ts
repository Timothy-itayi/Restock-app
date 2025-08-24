import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  AuthState, 
  AuthAction, 
  AuthType, 
  INITIAL_AUTH_STATE,
  authReducer 
} from './state';
import { authLogger } from '../logging/logger';

interface AuthStore extends AuthState {
  // Actions
  dispatch: (action: AuthAction) => void;
  setLoading: (loading: boolean) => void;
  setReady: (ready: boolean) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setUserId: (userId: string | null) => void;
  setAuthType: (authType: AuthType) => void;
  setProfileSetupComplete: (complete: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  resetAuth: () => void;
  
  // Profile actions
  setProfileLoading: (loading: boolean) => void;
  setProfileData: (userName: string, storeName: string) => void;
  setProfileError: (error: string | null) => void;
  clearProfile: () => void;
  fetchProfile: (userId: string) => Promise<void>;
  
  // Computed getters
  canAccessDashboard: () => boolean;
  needsProfileSetup: () => boolean;
  isBlocked: () => boolean;
  hasValidProfile: () => boolean;
}

const authStoreCreator = create<AuthStore>()(
  devtools(
    (set, get) => ({
      ...INITIAL_AUTH_STATE,
      
      // Core dispatch method
      dispatch: (action: AuthAction) => {
        const currentState = get();
        const newState = authReducer(currentState, action);
        
        // 🔒 CRITICAL: Only log in development and only essential info
        if (process.env.NODE_ENV === 'development') {
          // Only log essential state properties, not functions
          const fromState = {
            isReady: currentState.isReady,
            isAuthenticated: currentState.isAuthenticated,
            userId: currentState.userId,
            userName: currentState.userName,
            storeName: currentState.storeName,
            isProfileLoading: currentState.isProfileLoading,
            authType: currentState.authType
          };
          
          const toState = {
            isReady: newState.isReady,
            isAuthenticated: newState.isAuthenticated,
            userId: newState.userId,
            userName: newState.userName,
            storeName: newState.storeName,
            isProfileLoading: newState.isProfileLoading,
            authType: newState.authType
          };

          const logData: any = { 
            action: action.type, 
            from: fromState,
            to: toState 
          };
          
          // Only add payload if it exists and is simple
          if ('payload' in action) {
            const payload = action.payload;
            // Don't log complex objects, just simple values
            if (typeof payload === 'string' || typeof payload === 'boolean' || typeof payload === 'number' || payload === null) {
              logData.payload = payload;
            } else if (payload && typeof payload === 'object') {
              logData.payload = { type: typeof payload };
            }
          }
          
          authLogger.log('State transition', logData);
        }
        
        set(newState);
      },
      
      // Convenience setters
      setLoading: (loading: boolean) => 
        get().dispatch({ type: 'SET_LOADING', payload: loading }),
      
      setReady: (ready: boolean) => 
        get().dispatch({ type: 'SET_READY', payload: ready }),
      
      setAuthenticated: (authenticated: boolean) => 
        get().dispatch({ type: 'SET_AUTHENTICATED', payload: authenticated }),
      
      setUserId: (userId: string | null) => {
        // 🔒 CRITICAL: Validate userId type before setting
        if (typeof userId === 'number') {
          console.error('❌ setUserId: Attempted to set userId to number:', userId);
          throw new Error('userId cannot be a number - must be string or null');
        }
        if (userId !== null && typeof userId !== 'string') {
          console.error('❌ setUserId: Invalid userId type:', typeof userId, userId);
          throw new Error('userId must be string or null');
        }
        get().dispatch({ type: 'SET_USER_ID', payload: userId });
      },
      
      setAuthType: (authType: AuthType) => 
        get().dispatch({ type: 'SET_AUTH_TYPE', payload: authType }),
      
      setProfileSetupComplete: (complete: boolean) => 
        get().dispatch({ type: 'SET_PROFILE_SETUP_COMPLETE', payload: complete }),
      
      setInitialized: (initialized: boolean) => 
        get().dispatch({ type: 'SET_INITIALIZED', payload: initialized }),
      
      resetAuth: () => 
        get().dispatch({ type: 'RESET_AUTH' }),
      
      // Profile actions
      setProfileLoading: (loading: boolean) => 
        get().dispatch({ type: 'SET_PROFILE_LOADING', payload: loading }),
      
      setProfileData: (userName: string, storeName: string) => {
        get().dispatch({ type: 'SET_PROFILE_DATA', payload: { userName, storeName } });
        
        // Automatically update profile completion status when profile data changes
        const state = get();
        const hasValidProfile = state.hasValidProfile();
        if (state.isProfileSetupComplete !== hasValidProfile) {
          console.log('📊 AuthStore: Profile completion status changed', {
            userName,
            storeName,
            hasValidProfile,
            previousStatus: state.isProfileSetupComplete,
            newStatus: hasValidProfile
          });
          get().dispatch({ type: 'SET_PROFILE_SETUP_COMPLETE', payload: hasValidProfile });
        }
      },
      
      setProfileError: (error: string | null) => 
        get().dispatch({ type: 'SET_PROFILE_ERROR', payload: error }),
      
      clearProfile: () => 
        get().dispatch({ type: 'CLEAR_PROFILE' }),
      
      fetchProfile: async (userId: string) => {
        const state = get();
        if (state.isProfileLoading) return; // Prevent multiple simultaneous calls
        
        state.setProfileLoading(true);
        
        try {
          console.log('📊 AuthStore: Fetching profile for userId:', userId);
          
          const { UserProfileService } = await import('../../backend/services/user-profile');
          const result = await UserProfileService.getUserProfileByClerkId(userId);
          
          console.log('📊 AuthStore: Raw result from service:', {
            hasData: !!result.data,
            data: result.data,
            error: result.error,
            resultType: typeof result.data,
            isArray: Array.isArray(result.data),
            dataKeys: result.data ? Object.keys(result.data) : 'no data'
          });
          
          if (result.data) {
            const name = result.data.name || 'there';
            const store = result.data.store_name || '';
            
            console.log('📊 AuthStore: Profile fetched successfully', { name, store });
            state.setProfileData(name, store);
          } else if (result.error) {
            console.error('❌ AuthStore: Service returned error:', result.error);
            state.setProfileError(result.error instanceof Error ? result.error.message : 'Failed to fetch profile');
            // Set default values on error
            state.setProfileData('there', '');
          } else {
            console.log('📊 AuthStore: No profile data found, user profile does not exist');
            state.setProfileData('there', '');
          }
        } catch (error) {
          console.error('❌ AuthStore: Error fetching profile:', error);
          state.setProfileError(error instanceof Error ? error.message : 'Failed to fetch profile');
          state.setProfileData('there', '');
        }
      },
      
      // Computed getters
      canAccessDashboard: () => {
        const state = get();
        // 🔒 CRITICAL: Simple computed value without caching to avoid TypeScript issues
        return state.isAuthenticated && 
               state.isProfileSetupComplete && 
               !state.isBlocked() && 
               state.isReady;
      },
      
      needsProfileSetup: () => {
        const state = get();
        // 🔒 CRITICAL: Simple computed value without caching to avoid TypeScript issues
        return state.isAuthenticated && 
               !state.isProfileSetupComplete && 
               !state.isBlocked();
      },
      
      isBlocked: () => {
        const state = get();
        // 🔒 CRITICAL: Simple computed value without caching to avoid TypeScript issues
        return state.authType.isBlocked;
      },
      
      hasValidProfile: () => {
        const state = get();
        const hasValidUserName = state.userName && state.userName !== '' && state.userName !== 'there';
        const hasValidStoreName = state.storeName && state.storeName !== '';
        
        return !state.isProfileLoading && 
               !state.profileError && 
               hasValidUserName && 
               hasValidStoreName;
      }
    }),
    {
      name: 'auth-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// Export both the hook and the store itself
export const useAuthStore = authStoreCreator;
export const authStore = authStoreCreator;

// 🔒 CRITICAL: Add selective subscription hooks to prevent unnecessary re-renders
export const useAuthStoreSelect = <T>(selector: (state: AuthStore) => T): T => {
  return useAuthStore(selector);
};

// 🔒 CRITICAL: Pre-defined selectors for common use cases
export const useAuthState = () => useAuthStoreSelect(state => ({
  isReady: state.isReady,
  isAuthenticated: state.isAuthenticated,
  isProfileSetupComplete: state.isProfileSetupComplete,
  isLoading: state.isLoading,
  userId: state.userId,
  hasInitialized: state.hasInitialized,
  authType: state.authType,
  // Profile data
  userName: state.userName,
  storeName: state.storeName,
  isProfileLoading: state.isProfileLoading,
  profileError: state.profileError
}));

export const useAuthType = () => useAuthStoreSelect(state => state.authType);

// 🔒 CRITICAL: Only include actions that actually exist on the store
export const useAuthActions = () => useAuthStoreSelect(state => ({
  dispatch: state.dispatch,
  setLoading: state.setLoading,
  setReady: state.setReady,
  setAuthenticated: state.setAuthenticated,
  setUserId: state.setUserId,
  setAuthType: state.setAuthType,
  setProfileSetupComplete: state.setProfileSetupComplete,
  setInitialized: state.setInitialized,
  resetAuth: state.resetAuth,
  // Profile actions
  setProfileLoading: state.setProfileLoading,
  setProfileData: state.setProfileData,
  setProfileError: state.setProfileError,
  clearProfile: state.clearProfile,
  fetchProfile: state.fetchProfile
}));
