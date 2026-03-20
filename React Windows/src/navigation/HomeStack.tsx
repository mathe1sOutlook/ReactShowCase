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
import WidgetsScreen from '../screens/WidgetsScreen';
import WindowControlsScreen from '../screens/WindowControlsScreen';
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
const WidgetsScreenMonitored = withScreenQuality('Widgets', WidgetsScreen);
const WindowControlsScreenMonitored = withScreenQuality(
  'WindowControls',
  WindowControlsScreen,
);
const ReanimatedScreenMonitored = withScreenQuality(
  'Reanimated',
  ReanimatedScreen,
);

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
        component={HomeScreenMonitored}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Layouts"
        component={LayoutsScreenMonitored}
        options={{title: 'Layouts'}}
      />
      <Stack.Screen
        name="Lists"
        component={ListsScreenMonitored}
        options={{title: 'Lists & Scroll'}}
      />
      <Stack.Screen
        name="Navigation"
        component={NavigationScreenMonitored}
        options={{title: 'Advanced Navigation'}}
      />
      <Stack.Screen
        name="Animations"
        component={AnimationsScreenMonitored}
        options={{title: 'Animations'}}
      />
      <Stack.Screen
        name="Canvas"
        component={CanvasScreenMonitored}
        options={{title: 'Canvas 2D'}}
      />
      <Stack.Screen
        name="ThreeD"
        component={ThreeDScreenMonitored}
        options={{title: '3D Transforms'}}
      />
      <Stack.Screen
        name="Charts"
        component={ChartsScreenMonitored}
        options={{title: 'Charts & Data'}}
      />
      <Stack.Screen
        name="Svg"
        component={SvgScreenMonitored}
        options={{title: 'SVG & Vector'}}
      />
      <Stack.Screen
        name="DataGrid"
        component={DataGridScreenMonitored}
        options={{title: 'DataGrid Studio'}}
      />
      <Stack.Screen
        name="Media"
        component={MediaScreenMonitored}
        options={{title: 'Camera & Photos'}}
      />
      <Stack.Screen
        name="Audio"
        component={AudioScreenMonitored}
        options={{title: 'Audio Studio'}}
      />
      <Stack.Screen
        name="Video"
        component={VideoScreenMonitored}
        options={{title: 'Video Studio'}}
      />
      <Stack.Screen
        name="Files"
        component={FilesScreenMonitored}
        options={{title: 'Files & Documents'}}
      />
      <Stack.Screen
        name="Platform"
        component={PlatformScreenMonitored}
        options={{title: 'Device & System'}}
      />
      <Stack.Screen
        name="Web"
        component={WebScreenMonitored}
        options={{title: 'WebView & Browser'}}
      />
      <Stack.Screen
        name="Network"
        component={NetworkScreenMonitored}
        options={{title: 'Networking & APIs'}}
      />
      <Stack.Screen
        name="Storage"
        component={StorageScreenMonitored}
        options={{title: 'Local Storage'}}
      />
      <Stack.Screen
        name="Maps"
        component={MapsScreenMonitored}
        options={{title: 'Maps & Geospatial'}}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreenMonitored}
        options={{title: 'Auth Demo'}}
      />
      <Stack.Screen
        name="Themes"
        component={ThemesScreenMonitored}
        options={{title: 'Themes & Appearance'}}
      />
      <Stack.Screen
        name="Codes"
        component={CodesScreenMonitored}
        options={{title: 'QR & Barcode'}}
      />
      <Stack.Screen
        name="Utilities"
        component={UtilitiesScreenMonitored}
        options={{title: 'Advanced Utilities'}}
      />
      <Stack.Screen
        name="Widgets"
        component={WidgetsScreenMonitored}
        options={{title: 'Desktop Widgets'}}
      />
      <Stack.Screen
        name="WindowControls"
        component={WindowControlsScreenMonitored}
        options={{title: 'Window & Grid'}}
      />
      <Stack.Screen
        name="Reanimated"
        component={ReanimatedScreenMonitored}
        options={{title: 'Reanimated Worklets'}}
      />
    </Stack.Navigator>
  );
}
