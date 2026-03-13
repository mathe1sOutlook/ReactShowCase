/**
 * CFD Windows - React Native ShowCase
 *
 * A comprehensive demonstration of React Native's rendering
 * capabilities on Windows Desktop (React Native Windows 0.75).
 */

import React from 'react';
import {NavigationContainer, type LinkingOptions} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import type {RootTabParamList} from './src/navigation/types';

const linking: LinkingOptions<RootTabParamList> = {
  prefixes: ['cfdwindows://', 'https://showcase.cfd.dev/windows'],
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
          Widgets: 'widgets',
          WindowControls: 'window-controls',
        },
      },
      ComponentsTab: 'components',
      AboutTab: 'about',
    },
  },
};

export default function App(): React.JSX.Element {
  return (
    <NavigationContainer linking={linking}>
      <AppNavigator />
    </NavigationContainer>
  );
}
