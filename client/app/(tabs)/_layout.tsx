import { Tabs } from "expo-router";
import React from "react";
import {
  Home,
  LayoutGrid,
  Settings,
  SlidersHorizontal,
} from "lucide-react-native";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: colorScheme === "dark" ? "#6b7280" : "#9ca3af",
        tabBarShowLabel: true,
        tabBarAllowFontScaling: false,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          textAlign: "center",
        },
        tabBarItemStyle: {
          flex: 1,
          paddingHorizontal: 0,
        },
        tabBarStyle: {
          backgroundColor: colorScheme === "dark" ? "#1c1c1e" : "#ffffff",
          borderTopWidth: 1,
          borderTopColor: colorScheme === "dark" ? "#2c2c2e" : "#e5e7eb",
          height: 60,
          paddingTop: 6,
          paddingBottom: 6,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Home size={size ?? 24} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: "Browse",
          tabBarIcon: ({ color, size }) => (
            <LayoutGrid size={size ?? 24} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="configurations"
        options={{
          title: "Config",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size ?? 24} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <SlidersHorizontal
              size={size ?? 24}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />
    </Tabs>
  );
}
