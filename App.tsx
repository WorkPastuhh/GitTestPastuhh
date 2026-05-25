import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/themeStore';

export default function App() {
  const theme = useThemeStore((state) => state.getCurrentTheme());
  const isDark = theme.colors.background === '#121212' || theme.colors.background === '#0D0D1A';

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}
