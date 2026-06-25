import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Colors} from '../theme';
import type {HomeStackParamList} from './types';
import {withScreenQuality} from '../quality/withScreenQuality';
import HomeScreen from '../screens/HomeScreen';
import {showcaseRoutes} from './showcaseRoutes';

const Stack = createNativeStackNavigator<HomeStackParamList>();
const HomeScreenMonitored = withScreenQuality('Home', HomeScreen);

const HOME_STACK_OPTIONS = {
  headerStyle: {backgroundColor: Colors.bgLight},
  headerTintColor: Colors.primary,
  headerTitleStyle: {
    fontWeight: '700' as const,
    color: Colors.white,
  },
  contentStyle: {backgroundColor: Colors.bg},
  animation: 'slide_from_right' as const,
};

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={HOME_STACK_OPTIONS}>
      <Stack.Screen
        name="Home"
        component={HomeScreenMonitored}
        options={{headerShown: false}}
      />
      {showcaseRoutes.map(screen => (
        <Stack.Screen
          key={screen.routeKey}
          name={screen.routeKey}
          component={screen.component}
          options={screen.options}
        />
      ))}
    </Stack.Navigator>
  );
}
