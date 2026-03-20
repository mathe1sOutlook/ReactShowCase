import {describe, expect, it, jest} from '@jest/globals';
import renderer from 'react-test-renderer';

jest.mock('../src/navigation/AppNavigator', () => {
  const React = require('react');
  const {Text} = require('react-native');

  return function MockAppNavigator() {
    return <Text testID="mock-app-navigator">Navigator</Text>;
  };
});

jest.mock('../src/screens/SplashScreen', () => {
  const React = require('react');
  const {Text} = require('react-native');

  return function MockSplashScreen({
    onFinish,
  }: {
    onFinish: () => void;
  }) {
    return (
      <Text testID="mock-splash-screen" onPress={onFinish}>
        Splash
      </Text>
    );
  };
});

jest.mock('../src/quality/PerformanceOverlay', () => {
  return function MockPerformanceOverlay() {
    return null;
  };
});

jest.mock('@react-navigation/native', () => {
  const React = require('react');

  return {
    NavigationContainer: ({children}: {children: React.ReactNode}) => children,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
}));

jest.mock('react-native-screens', () => ({
  enableFreeze: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({children}: {children: React.ReactNode}) => children,
}));

import React from 'react';
import App from '../App';

describe('App shell', () => {
  it('renders splash first and then the navigation shell', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(<App />);
    });

    expect(tree!.toJSON()).toMatchSnapshot('splash');

    const splash = tree!.root.findByProps({testID: 'mock-splash-screen'});

    renderer.act(() => {
      splash.props.onPress();
    });

    expect(tree!.toJSON()).toMatchSnapshot('navigator');
  });
});
