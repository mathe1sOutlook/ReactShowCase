/**
 * CFD Mobile - React Native ShowCase
 *
 * A comprehensive demonstration of React Native's graphical,
 * animation, and interactive capabilities on mobile platforms.
 */

import React, {useState} from 'react';
import {Platform, StyleSheet, UIManager} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {enableFreeze} from 'react-native-screens';
import AppNavigator from './src/navigation/AppNavigator';
import {appLinking} from './src/navigation/linking';
import SplashScreen from './src/screens/SplashScreen';
import PerformanceOverlay from './src/quality/PerformanceOverlay';
import {withScreenQuality} from './src/quality/withScreenQuality';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

enableFreeze(true);

const MonitoredSplashScreen = withScreenQuality('Splash', SplashScreen);

export default function App(): React.JSX.Element {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <MonitoredSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer linking={appLinking}>
          <AppNavigator />
        </NavigationContainer>
        <PerformanceOverlay />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
