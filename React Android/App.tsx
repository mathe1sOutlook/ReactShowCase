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
import {GestureHandlerRootView} from 'react-native-gesture-handler';
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
          Layouts: 'layouts',
          Lists: 'lists',
          Navigation: 'navigation',
          Animations: 'animations',
          Canvas: 'canvas',
          ThreeD: '3d',
          Charts: 'charts',
          Svg: 'svg',
          DataGrid: 'datagrid',
          Media: 'media',
          Audio: 'audio',
          Video: 'video',
          Files: 'files',
          Platform: 'platform',
          Web: 'web',
          Network: 'network',
          Storage: 'storage',
          Maps: 'maps',
          Auth: 'auth',
          Themes: 'themes',
          Codes: 'codes',
          Utilities: 'utilities',
          Particles: 'particles',
          Colors: 'colors',
          Reanimated: 'reanimated',
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
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <NavigationContainer linking={linking}>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
