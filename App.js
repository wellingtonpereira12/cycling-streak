import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { RideProvider } from './src/context/RideContext';
import { AuthProvider } from './src/context/AuthContext';
import { theme } from './src/styles/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RideProvider>
          <StatusBar style="light" backgroundColor={theme.colors.background} />
          <AppNavigator />
        </RideProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
