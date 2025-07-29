import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { SignedIn } from "@clerk/clerk-expo";
import { tabBarOptions } from "../../styles/components/tabs";
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
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="restock-sessions"
          options={{
            title: "Restock Sessions",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="emails"
          options={{
            title: "Emails",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="mail" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SignedIn>
  );
} 