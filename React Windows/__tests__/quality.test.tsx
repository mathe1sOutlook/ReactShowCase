import React from 'react';
import {Text} from 'react-native';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import renderer from 'react-test-renderer';
import {withScreenQuality} from '../src/quality/withScreenQuality';
import {
  getPerformanceStats,
  resetPerformanceStats,
} from '../src/quality/performanceStore';

describe('withScreenQuality', () => {
  beforeEach(() => {
    resetPerformanceStats();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders wrapped content and records a render sample', () => {
    const HealthyScreen = withScreenQuality('Healthy', () => <Text>Healthy</Text>);
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(<HealthyScreen />);
    });

    expect(tree!.root.findByType(Text).props.children).toBe('Healthy');
    expect(getPerformanceStats().lastScreenName).toBe('Healthy');
    expect(getPerformanceStats().sampleCount).toBeGreaterThan(0);
  });

  it('shows a recovery fallback and retries the screen', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let shouldThrow = true;

    const FlakyScreen = withScreenQuality('Flaky', () => {
      if (shouldThrow) {
        throw new Error('boom');
      }

      return <Text>Recovered</Text>;
    });

    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(<FlakyScreen />);
    });

    expect(tree!.toJSON()).toMatchSnapshot();

    const retry = tree!.root.findByProps({testID: 'screen-error-retry'});

    shouldThrow = false;

    renderer.act(() => {
      retry.props.onPress();
    });

    expect(tree!.root.findByType(Text).props.children).toBe('Recovered');
    errorSpy.mockRestore();
  });
});
