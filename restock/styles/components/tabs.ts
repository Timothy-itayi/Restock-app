import { StyleSheet } from "react-native";
import { typography } from "../typography";
import colors, { type AppColors } from '../../lib/theme/colors';

// Tabs styling using the unified semantic color system
export const getTabsStyles = (t: AppColors) => StyleSheet.create({
  // Tab bar container styles
  tabBar: {
    backgroundColor: appTheme.colors.neutral.lightest, // Pure white background (paper)
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.neutral.light, // Light grey border
    height: appTheme.layout.tabBarHeight,
    paddingBottom: appTheme.device.isTablet ? appTheme.spacing.md : appTheme.spacing.lg,
    paddingTop: appTheme.device.isTablet ? appTheme.spacing.md : appTheme.spacing.sm,
    maxWidth: appTheme.layout.maxContentWidth as any,
    alignSelf: 'center',
    // Enhanced iPad spacing for better touch targets
    paddingHorizontal: appTheme.device.isTablet ? appTheme.spacing.xl : appTheme.spacing.md,
  },
  
  // Header styles - Enhanced for iPad
  header: {
    backgroundColor: appTheme.colors.neutral.lightest, // Pure white background
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.neutral.light, // Light grey border
    paddingHorizontal: appTheme.layout.paddingHorizontal,
  },
  
  // Tab icon styles - Larger touch targets for iPad
  tabIcon: {
    width: appTheme.device.isTablet ? 32 : 24,
    height: appTheme.device.isTablet ? 32 : 24,
    // Ensure adequate touch target size
    minHeight: appTheme.layout.touchTargetMin,
    minWidth: appTheme.layout.touchTargetMin,
  },
  
  // Tab label styles - Better typography for iPad viewing distances
  tabLabel: {
    fontFamily: fontFamily.satoshi,
    fontSize: appTheme.typography.caption,
    fontWeight: "500",
    marginTop: appTheme.spacing.xs,
    // Better contrast for tablet viewing
    letterSpacing: appTheme.device.isTablet ? 0.3 : 0,
  },
  
  // Floating action button styles - Larger for iPad
  floatingButton: {
    width: appTheme.device.isTablet ? 64 : 56,
    height: appTheme.device.isTablet ? 64 : 56,
    borderRadius: appTheme.device.isTablet ? 32 : 28,
    backgroundColor: appTheme.colors.brand.primary, // Brand green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: appTheme.spacing.sm,
    // Better positioning for iPad
    marginRight: appTheme.device.isTablet ? appTheme.spacing.xl : appTheme.spacing.md,
  },
  
  // Tab screen specific styles - Responsive container for iPad
  tabScreen: {
    flex: 1,
    backgroundColor: appTheme.colors.neutral.lightest, // Pure white background
    maxWidth: appTheme.layout.maxContentWidth as any,
    alignSelf: 'center',
    width: '100%',
  },
  
  // Tab content styles - Better content organization for tablet
  tabContent: {
    flex: 1,
    backgroundColor: appTheme.colors.neutral.lightest,
    paddingHorizontal: appTheme.layout.paddingHorizontal,
    maxWidth: appTheme.layout.maxContentWidth as any,
    alignSelf: 'center',
    width: '100%',
  },
});
};

// Enhanced tab bar configuration for expo-router with iPad optimization
export const getTabBarOptions = (appTheme: ReturnType<typeof useAppTheme>) => {
  // Defensive check for undefined theme with enhanced logging
  if (!appTheme || !appTheme.layout || !appTheme.colors) {
    console.warn('⚠️ getTabBarOptions: appTheme is undefined, using fallback options', {
      hasAppTheme: !!appTheme,
      hasLayout: !!(appTheme?.layout),
      hasColors: !!(appTheme?.colors)
    });
    return {
      tabBarActiveTintColor: '#1A1D20',
      tabBarInactiveTintColor: '#6C757D',
      tabBarStyle: { backgroundColor: '#FFFFFF', height: 60 },
    };
  }
  
  console.log('🎯 Generating Tab Bar Options:', {
    deviceType: appTheme.device.deviceType,
    isTablet: appTheme.device.isTablet,
    tabBarHeight: appTheme.layout.tabBarHeight,
    iconSize: appTheme.device.isTablet ? 32 : 24,
    paddingHorizontal: appTheme.device.isTablet ? appTheme.spacing.xl : appTheme.spacing.md
  });
  
  return {
  // Active tab color (black for portfolio aesthetic)
  tabBarActiveTintColor: appTheme.colors.neutral.darkest,
  
  // Inactive tab color (light grey)
  tabBarInactiveTintColor: appTheme.colors.neutral.medium,
  
  // Enhanced tab bar container styling for iPad
  tabBarStyle: {
    backgroundColor: appTheme.colors.neutral.lightest, // Pure white background
    borderTopWidth: 1,
    borderTopColor: appTheme.colors.neutral.light, // Light grey border
    height: appTheme.layout.tabBarHeight,
    paddingBottom: appTheme.device.isTablet ? appTheme.spacing.md : appTheme.spacing.lg,
    paddingTop: appTheme.device.isTablet ? appTheme.spacing.md : appTheme.spacing.sm,
    maxWidth: appTheme.layout.maxContentWidth as any,
    alignSelf: 'center',
    // Enhanced iPad spacing and touch targets
    paddingHorizontal: appTheme.device.isTablet ? appTheme.spacing.xl : appTheme.spacing.md,
  },
  
  // Header styling with responsive padding
  headerStyle: {
    backgroundColor: appTheme.colors.neutral.lightest, // Pure white background
    borderBottomWidth: 1,
    borderBottomColor: appTheme.colors.neutral.light, // Light grey border
    paddingHorizontal: appTheme.layout.paddingHorizontal,
  },
  
  // Header text color
  headerTintColor: appTheme.colors.neutral.darkest, // Dark text
  
  // Header title styling with responsive typography
  headerTitleStyle: {
    fontFamily: fontFamily.satoshi,
    fontSize: appTheme.typography.subsectionHeader,
    fontWeight: "600" as const,
    color: appTheme.colors.neutral.darkest, // Dark text
    letterSpacing: appTheme.device.isTablet ? 0.2 : 0,
  },
  
  // Tab label styling with responsive typography for iPad
  tabBarLabelStyle: {
    fontFamily: fontFamily.satoshi,
    fontSize: appTheme.typography.caption,
    fontWeight: "500" as const,
    marginTop: appTheme.spacing.xs,
    letterSpacing: appTheme.device.isTablet ? 0.3 : 0,
  },
  
  // Tab icon styling with enhanced touch targets for iPad
  tabBarIconStyle: {
    width: appTheme.device.isTablet ? 32 : 24,
    height: appTheme.device.isTablet ? 32 : 24,
    marginBottom: appTheme.device.isTablet ? appTheme.spacing.xs : 0,
  },
  
  // Tab press animation
  tabBarPressColor: appTheme.colors.neutral.lighter, // Very light grey for press feedback
  
  // Tab press opacity
  tabBarPressOpacity: 0.8,
  
  // Enhanced tab button style for iPad
  tabBarItemStyle: {
    paddingVertical: appTheme.device.isTablet ? appTheme.spacing.sm : appTheme.spacing.xs,
    minHeight: appTheme.layout.touchTargetMin,
    minWidth: appTheme.layout.touchTargetMin,
  },
  };
};

// Utility hook for components that need both styles and options
export const useTabsTheme = () => {
  const appTheme = useAppTheme();
  return {
    styles: getTabsStyles(appTheme),
    options: getTabBarOptions(appTheme),
    appTheme,
  };
};

// Individual tab screen options (for customization per tab)
export const tabScreenOptions = {
  dashboard: {
    title: "Dashboard",
    tabBarIcon: {
      name: "home",
    },
  },
  
  restockSessions: {
    title: "Restock Sessions",
    tabBarIcon: {
      name: "cube-outline",
    },
  },
  
  emails: {
    title: "Emails",
    tabBarIcon: {
      name: "mail",
    },
  },
  
  profile: {
    title: "Profile",
    tabBarIcon: {
      name: "person",
    },
  },
};