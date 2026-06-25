import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Colors} from '../theme';
import type {HomeStackParamList} from './types';
import {withScreenQuality} from '../quality/withScreenQuality';
import HomeScreen from '../screens/HomeScreen';
import {showcaseRoutes} from './showcaseRoutes';

const Stack = createNativeStackNavigator<HomeStackParamList>();
const HomeScreenMonitored = withScreenQuality('Home', HomeScreen);

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: Colors.bg},
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreenMonitored}
        options={{headerShown: false}}
      />
      {showcaseRoutes.map(route => (
        <Stack.Screen
          key={route.routeKey}
          name={route.routeKey}
          component={route.component}
          options={route.options}
        />
      ))}
    </Stack.Navigator>
  );
}
