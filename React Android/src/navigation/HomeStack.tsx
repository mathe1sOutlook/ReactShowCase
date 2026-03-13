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
import ParticlesScreen from '../screens/ParticlesScreen';
import ColorsScreen from '../screens/ColorsScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: Colors.bgLight},
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: '700',
          color: Colors.white,
        },
        contentStyle: {backgroundColor: Colors.bg},
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Animations"
        component={AnimationsScreen}
        options={{
          title: 'Animations',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Animations'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Canvas"
        component={CanvasScreen}
        options={{
          title: 'Canvas 2D',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Canvas 2D'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="ThreeD"
        component={ThreeDScreen}
        options={{
          title: '3D Transforms',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || '3D Transforms'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Charts"
        component={ChartsScreen}
        options={{
          title: 'Charts & Data',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Charts & Data'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Platform"
        component={PlatformScreen}
        options={{
          title: 'Platform',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Platform'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Particles"
        component={ParticlesScreen}
        options={{
          title: 'Particles',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Particles'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Colors"
        component={ColorsScreen}
        options={{
          title: 'Color Picker',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Color Picker'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}
