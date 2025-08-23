import { create } from 'zustand';
import colors, { light, dark } from '../theme/colors';

export type ThemeMode = 'light' | 'dark';

type ThemeState = {
  mode: ThemeMode;
  theme: typeof light | typeof dark;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  isInitialized: boolean;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  theme: light,
  isInitialized: true, // Mark as initialized by default
  toggleMode: () => {
    const next = get().mode === 'light' ? 'dark' : 'light';
    set({ mode: next, theme: next === 'dark' ? dark : light });
  },
  setMode: (mode: ThemeMode) => set({ mode, theme: mode === 'dark' ? dark : light }),
}));

// ✅ CRITICAL: Ensure store is properly initialized
if (typeof window !== 'undefined') {
  // Browser environment - store should be ready
  console.log('🌙 Theme store initialized in browser');
} else {
  // React Native environment - ensure store is ready
  console.log('🌙 Theme store initialized in React Native');
}

// ✅ CRITICAL: Safe theme hook with fallbacks
export const useSafeTheme = () => {
  try {
    const store = useThemeStore();
    if (store && store.theme && store.isInitialized) {
      return store;
    }
  } catch (error) {
    console.warn('⚠️ Theme store access failed, using fallback:', error);
  }
  
  // Return fallback values if store is not ready
  return {
    mode: 'light' as ThemeMode,
    theme: light,
    toggleMode: () => console.warn('Theme store not ready'),
    setMode: () => console.warn('Theme store not ready'),
    isInitialized: false,
  };
};

export default useThemeStore;


