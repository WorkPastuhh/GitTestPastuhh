import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { GameScreen } from '../screens/GameScreen';
import { TournamentsScreen } from '../screens/TournamentsScreen';
import { ThemesScreen } from '../screens/ThemesScreen';
import { StatisticsScreen } from '../screens/StatisticsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { useThemeStore } from '../store/themeStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    HomeTab: '🎮',
    TournamentsTab: '🏆',
    ProfileTab: '👤',
    SettingsTab: '⚙️',
  };

  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '•'}
    </Text>
  );
}

function MainTabs() {
  const theme = useThemeStore((state) => state.getCurrentTheme());
  const { colors } = theme;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.gridLine,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen as any}
        options={{ tabBarLabel: 'Игра' }}
      />
      <Tab.Screen
        name="TournamentsTab"
        component={TournamentsScreen as any}
        options={{ tabBarLabel: 'Турниры' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen as any}
        options={{ tabBarLabel: 'Профиль' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen as any}
        options={{ tabBarLabel: 'Настройки' }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const theme = useThemeStore((state) => state.getCurrentTheme());
  const { colors } = theme;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Game"
          component={GameScreen as any}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="Themes" component={ThemesScreen as any} />
        <Stack.Screen name="Statistics" component={StatisticsScreen as any} />
        <Stack.Screen name="Tournaments" component={TournamentsScreen as any} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen as any} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
