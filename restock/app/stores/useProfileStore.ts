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
  setProfile: (name: string, storeName: string) => void;
  clearProfile: () => void;
  reset: () => void;
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
      
      // User context is handled automatically by Convex with Clerk authentication
      console.log('📊 ProfileStore: Using Convex with Clerk auth for profile fetch');
      
      const result = await UserProfileService.getUserProfile(userId);
      
      if (result.data) {
        const name = result.data.name || 'there';
        const store = result.data.storeName || '';
        
        console.log('📊 ProfileStore: Profile fetched successfully', { name, store });
        set({
          userName: name,
          storeName: store,
          isLoading: false,
          error: null,
        });
      } else {
        console.log('📊 ProfileStore: No profile data found, using defaults');
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

  setProfile: (name: string, storeName: string) => {
    console.log('📊 ProfileStore: Setting profile', { name, storeName });
    set({
      userName: name,
      storeName: storeName,
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
}));

export default useProfileStore;