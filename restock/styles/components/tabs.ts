import { StyleSheet } from "react-native";
import { typography } from "../typography";

// Tabs styling using the unified semantic color system
export const tabsStyles = StyleSheet.create({
  // Tab bar container styles
  tabBar: {
    backgroundColor: "#FFFFFF", // Pure white background (paper)
    borderTopWidth: 1,
    borderTopColor: "#DEE2E6", // Light grey border
    height: 88,
    paddingBottom: 20,
    paddingTop: 8,
  },
  
  // Header styles
  header: {
    backgroundColor: "#FFFFFF", // Pure white background
    borderBottomWidth: 1,
    borderBottomColor: "#DEE2E6", // Light grey border
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
    backgroundColor: "#22C55E", // Green for navigation
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
    backgroundColor: "#FFFFFF", // Pure white background
  },
  
  // Tab content styles
  tabContent: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});

// Tab bar configuration options for expo-router
export const tabBarOptions = {
  // Active tab color (black for portfolio aesthetic)
  tabBarActiveTintColor: "#000000",
  
  // Inactive tab color (light grey)
  tabBarInactiveTintColor: "#ADB5BD",
  
  // Tab bar container styling
  tabBarStyle: {
    backgroundColor: "#FFFFFF", // Pure white background
    borderTopWidth: 1,
    borderTopColor: "#DEE2E6", // Light grey border
    height: 88,
    paddingBottom: 20,
    paddingTop: 8,
  },
  
  // Header styling
  headerStyle: {
    backgroundColor: "#FFFFFF", // Pure white background
    borderBottomWidth: 1,
    borderBottomColor: "#DEE2E6", // Light grey border
  },
  
  // Header text color
  headerTintColor: "#000000", // Black text
  
  // Header title styling
  headerTitleStyle: {
    ...typography.subsectionHeader,
    fontWeight: "600" as const,
    color: "#000000", // Black text
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
  tabBarPressColor: "#F8F9FA", // Very light grey for press feedback
  
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
      name: "list",
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