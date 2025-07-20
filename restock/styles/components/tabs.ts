import { StyleSheet } from "react-native";

export const tabsStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  header: {
    backgroundColor: "#F8F9FA",
  },
});

export const tabBarOptions = {
  tabBarActiveTintColor: "#2C3E50",
  tabBarInactiveTintColor: "#8E8E93",
  tabBarStyle: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
  },
  headerStyle: {
    backgroundColor: "#F8F9FA",
  },
  headerTintColor: "#2C3E50",
  headerTitleStyle: {
    fontWeight: "600" as const,
  },
}; 