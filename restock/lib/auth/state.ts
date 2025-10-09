export interface AuthType {
  type: 'google' | 'email' | null;
  isNewSignUp: boolean;
  needsProfileSetup: boolean;
  isBlocked: boolean;
}

export interface AuthState {
  isReady: boolean;
  isProfileSetupComplete: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  authType: AuthType;
  hasInitialized: boolean;
  // Profile data (merged from ProfileStore)
  userName: string;
  storeName: string;
  isProfileLoading: boolean;
  profileError: string | null;
}

export interface AuthContext {
  user: any;
  email: string | null;
  storeName: string | null;
}

export const INITIAL_AUTH_TYPE: AuthType = {
  type: null,
  isNewSignUp: false,
  needsProfileSetup: false,
  isBlocked: false
};

export const INITIAL_AUTH_STATE: AuthState = {
  isReady: false,
  isProfileSetupComplete: false,
  isAuthenticated: false,
  isLoading: true,
  userId: null,
  authType: INITIAL_AUTH_TYPE,
  hasInitialized: false,
  // Profile data defaults
  userName: '',
  storeName: '',
  isProfileLoading: false,
  profileError: null
};

// Auth state transitions for predictable behavior
export type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_READY'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_USER_ID'; payload: string | null }
  | { type: 'SET_AUTH_TYPE'; payload: AuthType }
  | { type: 'SET_PROFILE_SETUP_COMPLETE'; payload: boolean }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_PROFILE_LOADING'; payload: boolean }
  | { type: 'SET_PROFILE_DATA'; payload: { userName: string; storeName: string } }
  | { type: 'SET_PROFILE_ERROR'; payload: string | null }
  | { type: 'CLEAR_PROFILE' }
  | { type: 'RESET_AUTH' };

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_READY':
      return { ...state, isReady: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_USER_ID':
      // 🔒 CRITICAL: Validate userId type in reducer
      if (typeof action.payload === 'number') {
        console.error('❌ authReducer: SET_USER_ID payload is number:', action.payload);
        throw new Error('userId cannot be a number - must be string or null');
      }
      if (action.payload !== null && typeof action.payload !== 'string') {
        console.error('❌ authReducer: SET_USER_ID payload has invalid type:', typeof action.payload, action.payload);
        throw new Error('userId must be string or null');
      }
      return { ...state, userId: action.payload };
    case 'SET_AUTH_TYPE':
      return { ...state, authType: action.payload };
    case 'SET_PROFILE_SETUP_COMPLETE':
      return { ...state, isProfileSetupComplete: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, hasInitialized: action.payload };
    case 'SET_PROFILE_LOADING':
      return { ...state, isProfileLoading: action.payload };
    case 'SET_PROFILE_DATA':
      return { 
        ...state, 
        userName: action.payload.userName,
        storeName: action.payload.storeName,
        isProfileLoading: false,
        profileError: null
      };
    case 'SET_PROFILE_ERROR':
      return { 
        ...state, 
        profileError: action.payload,
        isProfileLoading: false
      };
    case 'CLEAR_PROFILE':
      return { 
        ...state, 
        userName: '',
        storeName: '',
        isProfileLoading: false,
        profileError: null
      };
    case 'RESET_AUTH':
      return INITIAL_AUTH_STATE;
    default:
      return state;
  }
};
