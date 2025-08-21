import { create } from 'zustand';
import { UserProfileService } from '../../backend/services/user-profile';

interface ProfileState {
  // Profile data
  userName: string;
  storeName: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProfile: (userId: string) => Promise<void>;
  retryProfileLoad: (userId: string) => Promise<void>;
  setProfile: (name: string, storeName: string) => void;
  setProfileFromData: (profileData: any) => void;
  clearProfile: () => void;
  reset: () => void;
  
  // Computed properties
  isProfileLoaded: boolean;
  hasValidProfile: boolean;
}

const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  userName: '',
  storeName: '',
  isLoading: false,
  error: null,

  // Actions
  fetchProfile: async (userId: string) => {
    const currentState = get();
    if (currentState.isLoading) return; // Prevent multiple simultaneous calls
    
    set({ isLoading: true, error: null });
    
    try {
      console.log('📊 ProfileStore: Fetching profile for userId:', userId);
      
      // Use Clerk ID-based method to avoid session context issues
      console.log('📊 ProfileStore: Using Clerk ID-based profile fetch');
      
      const result = await UserProfileService.getUserProfileByClerkId(userId);
      
      console.log('📊 ProfileStore: Raw result from service:', {
        hasData: !!result.data,
        data: result.data,
        error: result.error,
        resultType: typeof result.data,
        isArray: Array.isArray(result.data),
        dataKeys: result.data ? Object.keys(result.data) : 'no data'
      });
      
      if (result.data) {
        const name = result.data.name || 'there';
        const store = result.data.store_name || ''; // Note: database uses store_name
        
        console.log('📊 ProfileStore: Profile fetched successfully', { 
          name, 
          store,
          rawData: result.data,
          hasName: !!result.data.name,
          hasStoreName: !!result.data.store_name
        });
        set({
          userName: name,
          storeName: store,
          isLoading: false,
          error: null,
        });
      } else if (result.error) {
        // Handle service-level errors
        console.error('❌ ProfileStore: Service returned error:', result.error);
        set({
          userName: 'there',
          storeName: '',
          isLoading: false,
          error: result.error instanceof Error ? result.error.message : 'Failed to fetch profile',
        });
      } else {
        // No data and no error - user profile doesn't exist
        console.log('📊 ProfileStore: No profile data found, user profile does not exist');
        set({
          userName: 'there',
          storeName: '',
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('❌ ProfileStore: Error fetching profile:', error);
      set({
        userName: 'there',
        storeName: '',
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      });
    }
  },

  // Retry profile loading
  retryProfileLoad: async (userId: string) => {
    console.log('📊 ProfileStore: Retrying profile load for userId:', userId);
    await get().fetchProfile(userId);
  },

  setProfile: (name: string, storeName: string) => {
    console.log('📊 ProfileStore: Setting profile', { name, storeName });
    set({
      userName: name,
      storeName: storeName,
      error: null,
    });
  },

  setProfileFromData: (profileData: any) => {
    console.log('📊 ProfileStore: Setting profile from RPC data', { profileData });
    
    if (!profileData) {
      console.warn('📊 ProfileStore: No profile data provided, using defaults');
      set({
        userName: 'there',
        storeName: '',
        isLoading: false,
        error: null,
      });
      return;
    }

    const name = profileData.name || 'there';
    const store = profileData.store_name || '';
    
    console.log('📊 ProfileStore: Profile set from data successfully', { name, store });
    set({
      userName: name,
      storeName: store,
      isLoading: false,
      error: null,
    });
  },

  clearProfile: () => {
    console.log('📊 ProfileStore: Clearing profile');
    set({
      userName: '',
      storeName: '',
      isLoading: false,
      error: null,
    });
  },

  reset: () => {
    console.log('📊 ProfileStore: Resetting store');
    set({
      userName: '',
      storeName: '',
      isLoading: false,
      error: null,
    });
  },

  // Computed properties
  get isProfileLoaded() {
    return !this.isLoading && !this.error;
  },

  get hasValidProfile() {
    return this.isProfileLoaded && (this.userName !== 'there' || this.storeName !== '');
  },
}));

export default useProfileStore;