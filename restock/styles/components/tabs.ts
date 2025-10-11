import { StyleSheet } from "react-native";
import typography, { fontFamily } from "../typography";
import colors, { type AppColors } from '../../lib/theme/colors';

export const getTabsStyles = (t: AppColors) => StyleSheet.create({
  tabBar: {
    backgroundColor: colors.neutral.lightest,
    borderTopWidth: 1,
    borderTopColor: colors.neutral.light,
    height: 60,
    paddingBottom: 16,
    paddingTop: 8,
    maxWidth: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
  },
  
  header: {
    backgroundColor: colors.neutral.lightest,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.light,
    paddingHorizontal: 20,
  },
  tabIcon: {
    width: 24,
    height: 24,
    minHeight: 44,
    minWidth: 44,
  },
  tabLabel: {
    fontFamily: fontFamily.satoshi,
    fontSize: typography.caption.fontSize,
    fontWeight: "500",
    marginTop: 4,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 8,
    marginRight: 16,
  },
  tabScreen: {
    flex: 1,
    backgroundColor: colors.neutral.lightest,
    maxWidth: "100%",
    alignSelf: 'center',
    width: '100%',
  },
  tabContent: {
    flex: 1,
    backgroundColor: colors.neutral.lightest,
    paddingHorizontal: 20,
    maxWidth: "100%",
    alignSelf: 'center',
    width: '100%',
  },
});
export const tabBarOptions = {
  tabBarActiveTintColor: colors.neutral.darkest,
  tabBarInactiveTintColor: colors.neutral.medium,
  tabBarStyle: getTabsStyles(colors).tabBar,
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