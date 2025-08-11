import { StyleSheet } from "react-native";
import { typography } from "../typography";
import colors from '@/app/theme/colors';

// Tabs styling using the unified semantic color system
export const tabsStyles = StyleSheet.create({
  // Tab bar container styles
  tabBar: {
    backgroundColor: colors.neutral.lightest, // Pure white background (paper)
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light, // Light grey border
    height: 88,
    paddingBottom: 20,
    paddingTop: 8,
  },
  
  // Header styles
  header: {
    backgroundColor: colors.neutral.lightest, // Pure white background
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light, // Light grey border
  },
  
  // Tab icon styles
  tabIcon: {
    width: 24,
    height: 24,
  },
  
  // Tab label styles
  tabLabel: {
    ...typography.caption,
    fontWeight: "500",
    marginTop: 4,
  },
  
  // Floating action button styles
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.primary, // Brand green
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
  },
  
  // Tab screen specific styles
  tabScreen: {
    backgroundColor: colors.neutral.lightest, // Pure white background
  },
  
  // Tab content styles
  tabContent: {
    flex: 1,
    backgroundColor: colors.neutral.lightest,
  },
});

// Tab bar configuration options for expo-router
export const tabBarOptions = {
  // Active tab color (black for portfolio aesthetic)
  tabBarActiveTintColor: colors.neutral.darkest,
  
  // Inactive tab color (light grey)
  tabBarInactiveTintColor: colors.neutral.medium,
  
  // Tab bar container styling
  tabBarStyle: {
    backgroundColor: colors.neutral.lightest, // Pure white background
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light, // Light grey border
    height: 88,
    paddingBottom: 20,
    paddingTop: 8,
  },
  
  // Header styling
  headerStyle: {
    backgroundColor: colors.neutral.lightest, // Pure white background
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light, // Light grey border
  },
  
  // Header text color
  headerTintColor: colors.neutral.darkest, // Dark text
  
  // Header title styling
  headerTitleStyle: {
    ...typography.subsectionHeader,
    fontWeight: "600" as const,
    color: colors.neutral.darkest, // Dark text
  },
  
  // Tab label styling
  tabBarLabelStyle: {
    ...typography.caption,
    fontWeight: "500" as const,
    marginTop: 4,
  },
  
  // Tab icon styling
  tabBarIconStyle: {
    width: 24,
    height: 24,
  },
  
  // Tab press animation
  tabBarPressColor: colors.neutral.lighter, // Very light grey for press feedback
  
  // Tab press opacity
  tabBarPressOpacity: 0.8,
};

// Individual tab screen options (for customization per tab)
export const tabScreenOptions = {
  dashboard: {
    title: "Dashboard",
    tabBarIcon: ({ color, size }: { color: string; size: number }) => ({
      name: "home",
      color,
      size,
    }),
  },
  
  restockSessions: {
    title: "Restock Sessions",
    tabBarIcon: ({ color, size }: { color: string; size: number }) => ({
      name: "cube-outline",
      color,
      size,
    }),
  },
  
  emails: {
    title: "Emails",
    tabBarIcon: ({ color, size }: { color: string; size: number }) => ({
      name: "mail",
      color,
      size,
    }),
  },
  
  profile: {
    title: "Profile",
    tabBarIcon: ({ color, size }: { color: string; size: number }) => ({
      name: "person",
      color,
      size,
    }),
  },
}; 