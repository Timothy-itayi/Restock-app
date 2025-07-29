import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SignedIn } from "@clerk/clerk-expo";
import { tabBarOptions, tabScreenOptions } from "../../styles/components/tabs";
import { useEffect } from "react";

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
          }}
        />
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