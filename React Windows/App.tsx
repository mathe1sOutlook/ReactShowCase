/**
 * CFD Windows - React Native ShowCase
 *
 * A comprehensive demonstration of React Native's rendering
 * capabilities on Windows Desktop (React Native Windows 0.75).
 */

import React from 'react';
import {NavigationContainer, type LinkingOptions} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {enableFreeze} from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';
import {showcaseLinkingScreens} from './src/navigation/showcaseRegistry';
import type {RootTabParamList} from './src/navigation/types';
import PerformanceOverlay from './src/quality/PerformanceOverlay';

enableFreeze(true);

const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ['cfdwindows://', 'https://showcase.cfd.dev/windows'],
  config: {
    screens: {
      HomeTab: {
        screens: {
          Home: '',
          ...showcaseLinkingScreens,
        },
      },
      ComponentsTab: 'components',
      AboutTab: 'about',
    },
  },
};

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
      <PerformanceOverlay />
    </SafeAreaProvider>
  );
}
