import { Dimensions, Platform } from 'react-native';

// iPad generation specifications (5th gen to 10th gen)
const IPAD_SPECS = {
  // iPad (5th generation) - 2017
  'iPad (5th generation)': { width: 768, height: 1024, ppi: 264 },
  // iPad (6th generation) - 2018  
  'iPad (6th generation)': { width: 768, height: 1024, ppi: 264 },
  // iPad (7th generation) - 2019
  'iPad (7th generation)': { width: 810, height: 1080, ppi: 264 },
  // iPad (8th generation) - 2020
  'iPad (8th generation)': { width: 810, height: 1080, ppi: 264 },
  // iPad (9th generation) - 2021
  'iPad (9th generation)': { width: 810, height: 1080, ppi: 264 },
  // iPad (10th generation) - 2022
  'iPad (10th generation)': { width: 820, height: 1180, ppi: 264 },
  // iPad Pro variants for reference
  'iPad Pro (11-inch)': { width: 834, height: 1194, ppi: 264 },
  'iPad Pro (12.9-inch)': { width: 1024, height: 1366, ppi: 264 },
} as const;

// Breakpoint system for responsive design
export const BREAKPOINTS = {
  // Mobile breakpoints
  mobile: 0,
  mobileLarge: 414,
  
  // Tablet breakpoints
  tablet: 768,        // iPad 5th-6th gen
  tabletLarge: 810,   // iPad 7th-9th gen  
  tabletXLarge: 820,  // iPad 10th gen
  
  // Desktop breakpoints (for future web support)
  desktop: 1024,
  desktopLarge: 1440,
} as const;

// Device type detection
export const getDeviceType = (width: number, height: number) => {
  const isLandscape = width > height;
  const screenWidth = isLandscape ? height : width;
  const screenHeight = isLandscape ? width : height;
  
  if (screenWidth < BREAKPOINTS.tablet) {
    return 'mobile';
  } else if (screenWidth < BREAKPOINTS.tabletLarge) {
    return 'tablet';
  } else if (screenWidth < BREAKPOINTS.desktop) {
    return 'tabletLarge';
  } else {
    return 'desktop';
  }
};

// Responsive spacing system
export const getResponsiveSpacing = (deviceType: string) => {
  const spacing = {
    mobile: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    tablet: {
      xs: 6,
      sm: 12,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 32,
      xxxl: 40,
    },
    tabletLarge: {
      xs: 8,
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
      xxl: 40,
      xxxl: 48,
    },
    desktop: {
      xs: 8,
      sm: 16,
      md: 24,
      lg: 32,
      xl: 40,
      xxl: 48,
      xxxl: 64,
    },
  };
  
  return spacing[deviceType as keyof typeof spacing] || spacing.tablet;
};

// Responsive typography system
export const getResponsiveTypography = (deviceType: string) => {
  const typography = {
    mobile: {
      appTitle: 28,
      sectionHeader: 20,
      subsectionHeader: 18,
      productName: 16,
      buttonText: 16,
      bodyLarge: 16,
      bodyMedium: 14,
      bodySmall: 12,
      caption: 11,
    },
    tablet: {
      appTitle: 32,
      sectionHeader: 24,
      subsectionHeader: 20,
      productName: 18,
      buttonText: 18,
      bodyLarge: 18,
      bodyMedium: 16,
      bodySmall: 14,
      caption: 12,
    },
    tabletLarge: {
      appTitle: 36,
      sectionHeader: 28,
      subsectionHeader: 22,
      productName: 18,
      buttonText: 18,
      bodyLarge: 20,
      bodyMedium: 18,
      bodySmall: 16,
      caption: 13,
    },
    desktop: {
      appTitle: 40,
      sectionHeader: 32,
      subsectionHeader: 24,
      productName: 20,
      buttonText: 20,
      bodyLarge: 22,
      bodyMedium: 20,
      bodySmall: 18,
      caption: 14,
    },
  };
  
  return typography[deviceType as keyof typeof typography] || typography.tablet;
};

// Layout configuration for different devices
export const getLayoutConfig = (deviceType: string) => {
  const configs = {
    mobile: {
      maxContentWidth: '100%',
      paddingHorizontal: 20,
      columns: 1,
      actionGridColumns: 2,
      cardMinWidth: 0,
      tabBarHeight: 60,
    },
    tablet: {
      maxContentWidth: 768,
      paddingHorizontal: 32,
      columns: 2,
      actionGridColumns: 3,
      cardMinWidth: 200,
      tabBarHeight: 70,
    },
    tabletLarge: {
      maxContentWidth: 900,
      paddingHorizontal: 40,
      columns: 3,
      actionGridColumns: 4,
      cardMinWidth: 220,
      tabBarHeight: 80,
    },
    desktop: {
      maxContentWidth: 1200,
      paddingHorizontal: 48,
      columns: 4,
      actionGridColumns: 5,
      cardMinWidth: 240,
      tabBarHeight: 80,
    },
  };
  
  return configs[deviceType as keyof typeof configs] || configs.tablet;
};

// Main responsive hook
export const useResponsive = () => {
  const { width, height } = Dimensions.get('window');
  const isLandscape = width > height;
  const deviceType = getDeviceType(width, height);
  const isTablet = deviceType.startsWith('tablet');
  const isMobile = deviceType === 'mobile';
  
  return {
    // Screen dimensions
    screenWidth: width,
    screenHeight: height,
    isLandscape,
    
    // Device classification
    deviceType,
    isTablet,
    isMobile,
    
    // Responsive values
    spacing: getResponsiveSpacing(deviceType),
    typography: getResponsiveTypography(deviceType),
    layout: getLayoutConfig(deviceType),
    
    // Convenience methods
    isIPad: Platform.OS === 'ios' && isTablet,
    isIPhone: Platform.OS === 'ios' && isMobile,
  };
};

// Utility functions for responsive values
export const getResponsiveValue = <T>(
  values: Partial<Record<string, T>>,
  deviceType: string,
  fallback: T
): T => {
  return values[deviceType] || values.tablet || fallback;
};

// Grid system utilities
export const getGridColumns = (deviceType: string, baseColumns: number = 1) => {
  const multiplier = deviceType === 'tablet' ? 1.5 : 
                   deviceType === 'tabletLarge' ? 2 : 
                   deviceType === 'desktop' ? 2.5 : 1;
  return Math.max(1, Math.floor(baseColumns * multiplier));
};

// Safe area utilities for iPad
export const getSafeAreaPadding = (deviceType: string) => {
  if (deviceType === 'mobile') {
    return { top: 44, bottom: 34 }; // iPhone X+ safe areas
  } else if (deviceType.startsWith('tablet')) {
    return { top: 20, bottom: 20 }; // iPad safe areas
  }
  return { top: 0, bottom: 0 };
};
