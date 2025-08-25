import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { tabBarOptions, tabScreenOptions } from "../../styles/components/tabs";
import { useSafeTheme } from "../stores/useThemeStore";
import { UnifiedAuthGuard } from "../components/UnifiedAuthGuard";
import { SessionProvider } from "./restock-sessions/context/SessionContext";
import { useMemo } from "react";

export default function TabLayout() {
  const { theme } = useSafeTheme();

  // ✅ Memoize theme to avoid unnecessary re-renders
  const stableTheme = useMemo(() => theme, [theme]);

  // ✅ Memoize screen options for Tabs
  const screenOptions = useMemo(
    () => ({
      ...tabBarOptions,
      tabBarStyle: {
        ...tabBarOptions.tabBarStyle,
        backgroundColor: stableTheme.neutral.lightest,
        borderTopColor: stableTheme.neutral.light,
      },
      headerStyle: {
        ...tabBarOptions.headerStyle,
        backgroundColor: stableTheme.neutral.lightest,
        borderBottomColor: stableTheme.neutral.light,
      },
      headerTintColor: stableTheme.neutral.darkest,
      tabBarActiveTintColor: stableTheme.neutral.darkest,
      tabBarInactiveTintColor: stableTheme.neutral.medium,
    }),
    [stableTheme]
  );

  // ✅ Helper to safely render Ionicons
  const renderIcon = (iconName: string) => ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={iconName as any} size={size} color={color} />
  );

  return (
    <UnifiedAuthGuard>
      <SessionProvider>
        <Tabs screenOptions={screenOptions}>
          {/* Dashboard */}
          <Tabs.Screen
            name="dashboard/index"
            options={{
              title: tabScreenOptions.dashboard.title,
              tabBarIcon: renderIcon(tabScreenOptions.dashboard.tabBarIcon.name),
            }}
          />

          {/* Restock Sessions */}
          <Tabs.Screen
            name="restock-sessions"
            options={{
              title: tabScreenOptions.restockSessions.title,
              tabBarIcon: renderIcon(tabScreenOptions.restockSessions.tabBarIcon.name),
              headerShown: false,
            }}
          />

          {/* Emails */}
          <Tabs.Screen
            name="emails/index"
            options={{
              title: tabScreenOptions.emails.title,
              tabBarIcon: renderIcon(tabScreenOptions.emails.tabBarIcon.name),
            }}
          />

          {/* Profile */}
          <Tabs.Screen
            name="profile/index"
            options={{
              title: tabScreenOptions.profile.title,
              tabBarIcon: renderIcon(tabScreenOptions.profile.tabBarIcon.name),
            }}
          />
        </Tabs>
      </SessionProvider>
    </UnifiedAuthGuard>
  );
}
