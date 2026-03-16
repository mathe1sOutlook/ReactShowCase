import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Colors} from '../theme';
import type {HomeStackParamList} from './types';
import AnimatedHeader from '../components/common/AnimatedHeader';

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
        name="Layouts"
        component={LayoutsScreen}
        options={{title: 'Layouts'}}
      />
      <Stack.Screen
        name="Lists"
        component={ListsScreen}
        options={{title: 'Lists & Scroll'}}
      />
      <Stack.Screen
        name="Navigation"
        component={NavigationScreen}
        options={{title: 'Advanced Navigation'}}
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
        name="Svg"
        component={SvgScreen}
        options={{title: 'SVG & Vector'}}
      />
      <Stack.Screen
        name="DataGrid"
        component={DataGridScreen}
        options={{title: 'DataGrid Studio'}}
      />
      <Stack.Screen
        name="Media"
        component={MediaScreen}
        options={{title: 'Camera & Photos'}}
      />
      <Stack.Screen
        name="Audio"
        component={AudioScreen}
        options={{title: 'Audio Studio'}}
      />
      <Stack.Screen
        name="Video"
        component={VideoScreen}
        options={{title: 'Video Studio'}}
      />
      <Stack.Screen
        name="Files"
        component={FilesScreen}
        options={{title: 'Files & Documents'}}
      />
      <Stack.Screen
        name="Platform"
        component={PlatformScreen}
        options={{title: 'Device & System'}}
      />
      <Stack.Screen
        name="Web"
        component={WebScreen}
        options={{title: 'WebView & Browser'}}
      />
      <Stack.Screen
        name="Network"
        component={NetworkScreen}
        options={{title: 'Networking & APIs'}}
      />
      <Stack.Screen
        name="Storage"
        component={StorageScreen}
        options={{title: 'Local Storage'}}
      />
      <Stack.Screen
        name="Maps"
        component={MapsScreen}
        options={{title: 'Maps & Geospatial'}}
      />
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{title: 'Auth Demo'}}
      />
      <Stack.Screen
        name="Themes"
        component={ThemesScreen}
        options={{title: 'Themes & Appearance'}}
      />
      <Stack.Screen
        name="Codes"
        component={CodesScreen}
        options={{title: 'QR & Barcode'}}
      />
      <Stack.Screen
        name="Utilities"
        component={UtilitiesScreen}
        options={{title: 'Advanced Utilities'}}
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
      <Stack.Screen
        name="Reanimated"
        component={ReanimatedScreen}
        options={{title: 'Reanimated Worklets'}}
      />
    </Stack.Navigator>
  );
}
