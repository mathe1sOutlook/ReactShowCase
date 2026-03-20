import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Colors} from '../theme';
import type {HomeStackParamList} from './types';
import AnimatedHeader from '../components/common/AnimatedHeader';
import {withScreenQuality} from '../quality/withScreenQuality';

import HomeScreen from '../screens/HomeScreen';
import LayoutsScreen from '../screens/LayoutsScreen';
import ListsScreen from '../screens/ListsScreen';
import NavigationScreen from '../screens/NavigationScreen';
import AnimationsScreen from '../screens/AnimationsScreen';
import CanvasScreen from '../screens/CanvasScreen';
import ThreeDScreen from '../screens/ThreeDScreen';
import ChartsScreen from '../screens/ChartsScreen';
import SvgScreen from '../screens/SvgScreen';
import DataGridScreen from '../screens/DataGridScreen';
import MediaScreen from '../screens/MediaScreen';
import AudioScreen from '../screens/AudioScreen';
import VideoScreen from '../screens/VideoScreen';
import FilesScreen from '../screens/FilesScreen';
import PlatformScreen from '../screens/PlatformScreen';
import WebScreen from '../screens/WebScreen';
import NetworkScreen from '../screens/NetworkScreen';
import StorageScreen from '../screens/StorageScreen';
import MapsScreen from '../screens/MapsScreen';
import AuthScreen from '../screens/AuthScreen';
import ThemesScreen from '../screens/ThemesScreen';
import CodesScreen from '../screens/CodesScreen';
import UtilitiesScreen from '../screens/UtilitiesScreen';
import ParticlesScreen from '../screens/ParticlesScreen';
import ColorsScreen from '../screens/ColorsScreen';
import ReanimatedScreen from '../screens/ReanimatedScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();
const HomeScreenMonitored = withScreenQuality('Home', HomeScreen);
const LayoutsScreenMonitored = withScreenQuality('Layouts', LayoutsScreen);
const ListsScreenMonitored = withScreenQuality('Lists', ListsScreen);
const NavigationScreenMonitored = withScreenQuality(
  'Navigation',
  NavigationScreen,
);
const AnimationsScreenMonitored = withScreenQuality(
  'Animations',
  AnimationsScreen,
);
const CanvasScreenMonitored = withScreenQuality('Canvas', CanvasScreen);
const ThreeDScreenMonitored = withScreenQuality('ThreeD', ThreeDScreen);
const ChartsScreenMonitored = withScreenQuality('Charts', ChartsScreen);
const SvgScreenMonitored = withScreenQuality('Svg', SvgScreen);
const DataGridScreenMonitored = withScreenQuality(
  'DataGrid',
  DataGridScreen,
);
const MediaScreenMonitored = withScreenQuality('Media', MediaScreen);
const AudioScreenMonitored = withScreenQuality('Audio', AudioScreen);
const VideoScreenMonitored = withScreenQuality('Video', VideoScreen);
const FilesScreenMonitored = withScreenQuality('Files', FilesScreen);
const PlatformScreenMonitored = withScreenQuality('Platform', PlatformScreen);
const WebScreenMonitored = withScreenQuality('Web', WebScreen);
const NetworkScreenMonitored = withScreenQuality('Network', NetworkScreen);
const StorageScreenMonitored = withScreenQuality('Storage', StorageScreen);
const MapsScreenMonitored = withScreenQuality('Maps', MapsScreen);
const AuthScreenMonitored = withScreenQuality('Auth', AuthScreen);
const ThemesScreenMonitored = withScreenQuality('Themes', ThemesScreen);
const CodesScreenMonitored = withScreenQuality('Codes', CodesScreen);
const UtilitiesScreenMonitored = withScreenQuality(
  'Utilities',
  UtilitiesScreen,
);
const ParticlesScreenMonitored = withScreenQuality(
  'Particles',
  ParticlesScreen,
);
const ColorsScreenMonitored = withScreenQuality('Colors', ColorsScreen);
const ReanimatedScreenMonitored = withScreenQuality(
  'Reanimated',
  ReanimatedScreen,
);

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
        component={HomeScreenMonitored}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Layouts"
        component={LayoutsScreenMonitored}
        options={{
          title: 'Layouts',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Layouts'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Lists"
        component={ListsScreenMonitored}
        options={{
          title: 'Lists & Scroll',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Lists & Scroll'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Navigation"
        component={NavigationScreenMonitored}
        options={{
          title: 'Advanced Navigation',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Advanced Navigation'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Animations"
        component={AnimationsScreenMonitored}
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
        component={CanvasScreenMonitored}
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
        component={ThreeDScreenMonitored}
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
        component={ChartsScreenMonitored}
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
        name="Svg"
        component={SvgScreenMonitored}
        options={{
          title: 'SVG & Vector',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'SVG & Vector'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="DataGrid"
        component={DataGridScreenMonitored}
        options={{
          title: 'DataGrid Studio',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'DataGrid Studio'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Media"
        component={MediaScreenMonitored}
        options={{
          title: 'Camera & Photos',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Camera & Photos'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Audio"
        component={AudioScreenMonitored}
        options={{
          title: 'Audio Studio',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Audio Studio'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Video"
        component={VideoScreenMonitored}
        options={{
          title: 'Video Studio',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Video Studio'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Files"
        component={FilesScreenMonitored}
        options={{
          title: 'Files & Documents',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Files & Documents'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Platform"
        component={PlatformScreenMonitored}
        options={{
          title: 'Device & System',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Device & System'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Web"
        component={WebScreenMonitored}
        options={{
          title: 'WebView & Browser',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'WebView & Browser'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Network"
        component={NetworkScreenMonitored}
        options={{
          title: 'Networking & APIs',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Networking & APIs'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Storage"
        component={StorageScreenMonitored}
        options={{
          title: 'Local Storage',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Local Storage'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Maps"
        component={MapsScreenMonitored}
        options={{
          title: 'Maps & Geospatial',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Maps & Geospatial'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreenMonitored}
        options={{
          title: 'Auth Demo',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Auth Demo'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Themes"
        component={ThemesScreenMonitored}
        options={{
          title: 'Themes & Appearance',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Themes & Appearance'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Codes"
        component={CodesScreenMonitored}
        options={{
          title: 'QR & Barcode',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'QR & Barcode'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Utilities"
        component={UtilitiesScreenMonitored}
        options={{
          title: 'Advanced Utilities',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Advanced Utilities'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
      <Stack.Screen
        name="Particles"
        component={ParticlesScreenMonitored}
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
        component={ColorsScreenMonitored}
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
      <Stack.Screen
        name="Reanimated"
        component={ReanimatedScreenMonitored}
        options={{
          title: 'Reanimated Worklets',
          header: ({navigation, options}) => (
            <AnimatedHeader
              title={options.title || 'Reanimated Worklets'}
              onBack={() => navigation.goBack()}
            />
          ),
        }}
      />
    </Stack.Navigator>
  );
}
