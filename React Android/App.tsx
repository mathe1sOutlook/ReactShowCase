/**
 * CFD Android - React Native ShowCase
 *
 * A comprehensive demonstration of React Native's graphical,
 * animation, and interactive capabilities on Android.
 */

import React, {useState} from 'react';
import {Platform, UIManager} from 'react-native';
import {NavigationContainer, type LinkingOptions} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import type {RootTabParamList} from './src/navigation/types';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ['cfdandroid://', 'https://showcase.cfd.dev/android'],
  config: {
    screens: {
      HomeTab: {
        screens: {
          Home: '',
          Animations: 'animations',
          Canvas: 'canvas',
          ThreeD: '3d',
          Charts: 'charts',
          Platform: 'platform',
          Particles: 'particles',
          Colors: 'colors',
        },
      },
      ComponentsTab: 'components',
      AboutTab: 'about',
    },
  },
};

export default function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
