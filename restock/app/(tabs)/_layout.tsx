import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { UnifiedAuthGuard } from "../components/UnifiedAuthGuard";
import { SessionProvider } from "./restock-sessions/context/SessionContext";
import { ErrorBoundaryWrapper } from "../components/ErrorBoundaryWrapper";
import { useThemedStyles } from "../../styles/useThemedStyles";
import { StyleSheet } from "react-native";
import { fontFamily } from "../../styles/typography";

export default function TabLayout() {
  return (
    <ErrorBoundaryWrapper>
      <TabLayoutContent />
    </ErrorBoundaryWrapper>
  );
}

function TabLayoutContent() {
  const styles = useThemedStyles((theme) => StyleSheet.create({
    tabBar: {
      backgroundColor: theme.neutral.lightest,
      borderTopColor: theme.neutral.light,
      borderTopWidth: 1,
      height: 60,
      paddingBottom: 16,
      paddingTop: 8,
      paddingHorizontal: 12,
    },
    header: {
      backgroundColor: theme.neutral.lightest,
      borderBottomColor: theme.neutral.light,
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontFamily: fontFamily.satoshi,
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.neutral.darkest,
    },
    tabLabel: {
      fontFamily: fontFamily.satoshi,
      fontSize: 11,
      fontWeight: '500' as const,
      marginTop: 4,
    },
  }));

  const theme = useThemedStyles((t) => t);

  const screenOptions = {
    tabBarActiveTintColor: theme.neutral.darkest,
    tabBarInactiveTintColor: theme.neutral.medium,
    headerTintColor: theme.neutral.darkest,
    tabBarStyle: styles.tabBar,
    headerStyle: styles.header,
    headerTitleStyle: styles.headerTitle,
    tabBarLabelStyle: styles.tabLabel,
    tabBarPressColor: theme.neutral.lighter,
    tabBarPressOpacity: 0.8,
  };

  const renderIcon = (iconName: string) => ({ color, size }: { color: string; size: number }) => {
    return <Ionicons name={iconName as any} size={24} color={color} />;
  };

  return (
    <UnifiedAuthGuard>
      <SessionProvider>
        <Tabs screenOptions={screenOptions}>
          <Tabs.Screen
            name="dashboard/index"
            options={{
              title: "Dashboard",
              tabBarIcon: renderIcon("home"),
            }}
          />

          <Tabs.Screen
            name="restock-sessions"
            options={{
              title: "Restock Sessions",
              tabBarIcon: renderIcon("cube-outline"),
              headerShown: false,
            }}
          />

          <Tabs.Screen
            name="emails/index"
            options={{
              title: "Emails",
              tabBarIcon: renderIcon("mail"),
            }}
          />

          <Tabs.Screen
            name="profile/index"
            options={{
              title: "Profile",
              tabBarIcon: renderIcon("person"),
            }}
          />
        </Tabs>
      </SessionProvider>
    </UnifiedAuthGuard>
  );
}
