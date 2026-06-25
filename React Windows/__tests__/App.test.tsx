import {describe, expect, it, jest} from '@jest/globals';
import React, {type ReactNode} from 'react';
import renderer from 'react-test-renderer';

jest.mock('../src/navigation/AppNavigator', () => {
  const {Text} = require('react-native');

  return function MockAppNavigator() {
    return <Text testID="mock-app-navigator">Navigator</Text>;
  };
});

jest.mock('../src/quality/PerformanceOverlay', () => {
  return function MockPerformanceOverlay() {
    return null;
  };
});

jest.mock('@react-navigation/native', () => {
  return {
    NavigationContainer: ({children}: {children: ReactNode}) => children,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: {children: ReactNode}) => children,
}));

jest.mock('react-native-screens', () => ({
  enableFreeze: jest.fn(),
}));

import App from '../App';

describe('App shell', () => {
  it('renders the navigation container shell', () => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(<App />);
    });

    expect(tree!.toJSON()).toMatchSnapshot();
  });
});
