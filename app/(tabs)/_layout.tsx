import React from 'react';
import { Tabs } from 'expo-router';
import { Car, Navigation, Zap, Settings } from 'lucide-react-native';
import { CustomTabBar } from '@/components/ui/CustomTabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Car color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="drives"
        options={{
          title: 'Drives',
          tabBarIcon: ({ color, size }) => <Navigation color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="charges"
        options={{
          title: 'Charges',
          tabBarIcon: ({ color, size }) => <Zap color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
