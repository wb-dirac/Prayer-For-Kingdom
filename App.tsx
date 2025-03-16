import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { PrayerProvider } from './src/contexts/PrayerContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <PrayerProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </PrayerProvider>
    </SafeAreaProvider>
  );
}
