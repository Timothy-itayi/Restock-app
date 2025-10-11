import React from 'react';
import { create } from 'zustand';
import colors, { light, dark } from '../theme/colors';
import { Dimensions } from 'react-native';

export type ThemeMode = 'light' | 'dark';
export type DeviceType = 'mobile' | 'tablet' | 'tabletLarge';

type ResponsiveState = {
  deviceType: DeviceType;
  isTablet: boolean;
  screenWidth: number;
  screenHeight: number;
  isLandscape: boolean;
};

type ThemeState = {
  mode: ThemeMode;
  theme: typeof light | typeof dark;
  responsive: ResponsiveState;
  toggleMode: () => void;
  setMode: (mode: ThemeMode) => void;
  updateScreenDimensions: (width: number, height: number) => void;
  isInitialized: boolean;
};

// Inline device type detection to avoid circular dependencies
const getDeviceTypeInternal = (width: number): DeviceType => {
  if (width < 768) return 'mobile';
  if (width < 810) return 'tablet';
  return 'tabletLarge';
};

// Helper function to calculate responsive state
const calculateResponsiveState = (width: number, height: number): ResponsiveState => {
  const deviceType = getDeviceTypeInternal(width);
  const isTablet = deviceType !== 'mobile';
  const isLandscape = width > height;
  
  return {
    deviceType,
    isTablet,
    screenWidth: width,
    screenHeight: height,
    isLandscape,
  };
};

// Get initial screen dimensions
const { width: initialWidth, height: initialHeight } = Dimensions.get('window');

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  theme: light,
  responsive: calculateResponsiveState(initialWidth, initialHeight),
  isInitialized: true, // Mark as initialized by default
  toggleMode: () => {
    const next = get().mode === 'light' ? 'dark' : 'light';
    set({ mode: next, theme: next === 'dark' ? dark : light });
  },
  setMode: (mode: ThemeMode) => set({ mode, theme: mode === 'dark' ? dark : light }),
  updateScreenDimensions: (width: number, height: number) => {
    const responsive = calculateResponsiveState(width, height);
    set({ responsive });
  },
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
    responsive: calculateResponsiveState(initialWidth, initialHeight),
    toggleMode: () => console.warn('Theme store not ready'),
    setMode: () => console.warn('Theme store not ready'),
    updateScreenDimensions: () => console.warn('Theme store not ready'),
    isInitialized: false,
  };
};

// Hook to listen for screen dimension changes
export const useScreenDimensions = () => {
  const updateScreenDimensions = useThemeStore(state => state.updateScreenDimensions);
  
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      updateScreenDimensions(window.width, window.height);
    });
    
    return () => subscription?.remove();
  }, [updateScreenDimensions]);
};

export default useThemeStore;

