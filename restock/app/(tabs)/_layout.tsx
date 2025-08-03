import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SignedIn } from "@clerk/clerk-expo";
import { tabBarOptions, tabScreenOptions } from "../../styles/components/tabs";

export default function TabLayout() {
  return (
    <SignedIn>
      <Tabs 
        screenOptions={tabBarOptions}
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
          name="dashboard"
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
          name="restock-sessions/index"
          options={{
            title: tabScreenOptions.restockSessions.title,
            tabBarIcon: ({ color, size }) => (
              <Ionicons 
                name={tabScreenOptions.restockSessions.tabBarIcon({ color, size }).name as any} 
                size={size} 
                color={color} 
              />
            ),
          }}
        />
        
        {/* Emails - Review and send generated emails */}
        <Tabs.Screen
          name="emails"
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
          name="profile"
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
    </SignedIn>
  );
} 