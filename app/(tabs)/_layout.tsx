import { Tabs, Redirect } from "expo-router";
import { Menu } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import colors from "@/constants/colors";

export default function TabLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: true,

        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: '600' as const,
        },
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: '700' as const,
          color: colors.text,
        },
      }}
    >
      <Tabs.Screen
        name="settings"
        options={{
          title: "Menu",
          headerTitle: "Menu",
          tabBarIcon: ({ color, size }) => <Menu color={color} size={size + 4} />,
        }}
      />
    </Tabs>
  );
}
