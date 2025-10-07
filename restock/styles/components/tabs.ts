import { StyleSheet } from "react-native";
import { fontFamily } from "../typography";
import colors, { type AppColors } from '@/app/theme/colors';

// Tab styles with simple theme
export const getTabsStyles = (theme: AppColors) => {
  return StyleSheet.create({
    tabBar: {
      backgroundColor: theme.neutral.lightest,
      borderTopWidth: 1,
      borderTopColor: theme.neutral.light,
      height: 60,
      paddingBottom: 16,
      paddingTop: 8,
      paddingHorizontal: 12,
    },
    header: {
      backgroundColor: theme.neutral.lightest,
      borderBottomWidth: 1,
      borderBottomColor: theme.neutral.light,
      paddingHorizontal: 20,
    },
    tabIcon: {
      width: 24,
      height: 24,
    },
    tabLabel: {
      fontFamily: fontFamily.satoshi,
      fontSize: 11,
      fontWeight: "500",
      marginTop: 4,
    },
    floatingButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.brand.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      marginBottom: 8,
      marginRight: 12,
    },
    tabScreen: {
      flex: 1,
      backgroundColor: theme.neutral.lightest,
      width: '100%',
    },
    tabContent: {
      flex: 1,
      backgroundColor: theme.neutral.lightest,
      paddingHorizontal: 20,
      width: '100%',
    },
  });
};

// Tab bar options
export const getTabBarOptions = (theme: AppColors) => {
  return {
    tabBarActiveTintColor: theme.neutral.darkest,
    tabBarInactiveTintColor: theme.neutral.medium,
    tabBarStyle: {
      backgroundColor: theme.neutral.lightest,
      borderTopWidth: 1,
      borderTopColor: theme.neutral.light,
      height: 60,
      paddingBottom: 16,
      paddingTop: 8,
      paddingHorizontal: 12,
    },
    headerStyle: {
      backgroundColor: theme.neutral.lightest,
      borderBottomWidth: 1,
      borderBottomColor: theme.neutral.light,
      paddingHorizontal: 20,
    },
    headerTintColor: theme.neutral.darkest,
    headerTitleStyle: {
      fontFamily: fontFamily.satoshi,
      fontSize: 18,
      fontWeight: "600" as const,
      color: theme.neutral.darkest,
    },
    tabBarLabelStyle: {
      fontFamily: fontFamily.satoshi,
      fontSize: 11,
      fontWeight: "500" as const,
      marginTop: 4,
    },
    tabBarIconStyle: {
      width: 24,
      height: 24,
    },
    tabBarPressColor: theme.neutral.lighter,
    tabBarPressOpacity: 0.8,
    tabBarItemStyle: {
      paddingVertical: 4,
      minHeight: 44,
      minWidth: 44,
    },
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
