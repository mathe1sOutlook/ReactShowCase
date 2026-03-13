import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Colors} from '../theme';
import type {HomeStackParamList} from './types';
import AnimatedHeader from '../components/common/AnimatedHeader';

import HomeScreen from '../screens/HomeScreen';
import AnimationsScreen from '../screens/AnimationsScreen';
import CanvasScreen from '../screens/CanvasScreen';
import ThreeDScreen from '../screens/ThreeDScreen';
import ChartsScreen from '../screens/ChartsScreen';
import PlatformScreen from '../screens/PlatformScreen';
import WidgetsScreen from '../screens/WidgetsScreen';
import WindowControlsScreen from '../screens/WindowControlsScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: {backgroundColor: Colors.bg},
        animation: 'slide_from_right',
        header: ({navigation, route, options}) => {
          const title =
            (options.title as string) || (route.name as string);
          return (
            <AnimatedHeader
              title={title}
              onBack={() => navigation.goBack()}
              breadcrumb={['Home', title]}
            />
          );
        },
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Animations"
        component={AnimationsScreen}
        options={{title: 'Animations'}}
      />
      <Stack.Screen
        name="Canvas"
        component={CanvasScreen}
        options={{title: 'Canvas 2D'}}
      />
      <Stack.Screen
        name="ThreeD"
        component={ThreeDScreen}
        options={{title: '3D Transforms'}}
      />
      <Stack.Screen
        name="Charts"
        component={ChartsScreen}
        options={{title: 'Charts & Data'}}
      />
      <Stack.Screen
        name="Platform"
        component={PlatformScreen}
        options={{title: 'System Capabilities'}}
      />
      <Stack.Screen
        name="Widgets"
        component={WidgetsScreen}
        options={{title: 'Desktop Widgets'}}
      />
      <Stack.Screen
        name="WindowControls"
        component={WindowControlsScreen}
        options={{title: 'Window & Grid'}}
      />
    </Stack.Navigator>
  );
}
