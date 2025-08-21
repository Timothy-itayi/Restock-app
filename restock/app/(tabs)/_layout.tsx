import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { tabBarOptions, tabScreenOptions } from "../../styles/components/tabs";
import useThemeStore from "../stores/useThemeStore";
import UnifiedAuthGuard from "../components/UnifiedAuthGuard";

export default function TabLayout() {
  const { theme } = useThemeStore();
  return (
    <UnifiedAuthGuard requireAuth={true} requireProfileSetup={true}>
        <Tabs 
          screenOptions={{
            ...tabBarOptions,
            tabBarStyle: {
              ...tabBarOptions.tabBarStyle,
              backgroundColor: theme.neutral.lightest,
              borderTopColor: theme.neutral.light,
            },
            headerStyle: {
              ...tabBarOptions.headerStyle,
              backgroundColor: theme.neutral.lightest,
              borderBottomColor: theme.neutral.light,
            },
            headerTintColor: theme.neutral.darkest,
            tabBarActiveTintColor: theme.neutral.darkest,
            tabBarInactiveTintColor: theme.neutral.medium,
          }}
          screenListeners={{
            tabPress: (e) => {
              console.log('🔄 Tab Pressed:', e.target);
            },
            focus: (e) => {
              console.log('🎯 Tab Focused:', e.target);
            },
            blur: (e) => {
              console.log('👁️ Tab Blurred:', e.target);
            },
          }}
        >
          {/* Dashboard - Overview and quick actions */}
          <Tabs.Screen
            name="dashboard/index"
            options={{
              title: tabScreenOptions.dashboard.title,
              tabBarIcon: ({ color, size }) => (
                <Ionicons 
                  name={tabScreenOptions.dashboard.tabBarIcon({ color, size }).name as any} 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          
          {/* Restock Sessions - Main workflow for creating sessions */}
          <Tabs.Screen
            name="restock-sessions"
            options={{
              title: tabScreenOptions.restockSessions.title,
              tabBarIcon: ({ color, size }) => (
                <Ionicons 
                  name={tabScreenOptions.restockSessions.tabBarIcon({ color, size }).name as any} 
                  size={size} 
                  color={color} 
                />
              ),
              headerShown: false,
            }}
          />
          
          {/* Emails - Review and send generated emails */}
          <Tabs.Screen
            name="emails/index"
            options={{
              title: tabScreenOptions.emails.title,
              tabBarIcon: ({ color, size }) => (
                <Ionicons 
                  name={tabScreenOptions.emails.tabBarIcon({ color, size }).name as any} 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
          
          {/* Profile - User settings and account management */}
          <Tabs.Screen
            name="profile/index"
            options={{
              title: tabScreenOptions.profile.title,
              tabBarIcon: ({ color, size }) => (
                <Ionicons 
                  name={tabScreenOptions.profile.tabBarIcon({ color, size }).name as any} 
                  size={size} 
                  color={color} 
                />
              ),
            }}
          />
        </Tabs>
    </UnifiedAuthGuard>
  );
} 