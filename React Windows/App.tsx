/**
 * CFD Windows - React Native ShowCase
 *
 * A comprehensive demonstration of React Native's rendering
 * capabilities on Windows Desktop (React Native Windows 0.75).
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {enableFreeze} from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';
import {windowsAppLinking} from './src/navigation/linking';
import PerformanceOverlay from './src/quality/PerformanceOverlay';

enableFreeze(true);

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={windowsAppLinking}>
        <AppNavigator />
      </NavigationContainer>
      <PerformanceOverlay />
    </SafeAreaProvider>
  );
}
