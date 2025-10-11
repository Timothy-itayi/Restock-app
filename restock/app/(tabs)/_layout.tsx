import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import {  tabScreenOptions, tabBarOptions } from '../../styles/components/tabs';
import { UnifiedAuthGuard } from '../../lib/components/UnifiedAuthGuard';
import { SessionProvider } from './restock-sessions/_context/SessionContext';
import { ErrorBoundaryWrapper } from '../../lib/components/ErrorBoundaryWrapper';

export default function TabLayout() {
  return (
    <ErrorBoundaryWrapper>
      <TabLayoutContent />
    </ErrorBoundaryWrapper>
  );
}

function TabLayoutContent() {
  return (
    <UnifiedAuthGuard>
      <SessionProvider>
        <Tabs screenOptions={tabBarOptions}>
          <Tabs.Screen
            name="dashboard/index"
            options={{
              title: tabScreenOptions.dashboard.title,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name={tabScreenOptions.dashboard.tabBarIcon.name as any} size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="restock-sessions"
            options={{
              title: tabScreenOptions.restockSessions.title,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name={tabScreenOptions.restockSessions.tabBarIcon.name as any} size={size} color={color} />
              ),
              headerShown: false,
            }}
          />

          <Tabs.Screen
            name="emails/index"
            options={{
              title: tabScreenOptions.emails.title,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name={tabScreenOptions.emails.tabBarIcon.name as any} size={size} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="profile/index"
            options={{
              title: tabScreenOptions.profile.title,
              tabBarIcon: ({ color, size }) => (
                <Ionicons name={tabScreenOptions.profile.tabBarIcon.name as any} size={size} color={color} />
              ),
            }}
          />
        </Tabs>
      </SessionProvider>
    </UnifiedAuthGuard>
  );
}