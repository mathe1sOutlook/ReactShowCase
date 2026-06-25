import React, {type ComponentType} from 'react';
import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';
import AnimatedHeader from '../components/common/AnimatedHeader';
import {withScreenQuality} from '../quality/withScreenQuality';
import AnimationsScreen from '../screens/AnimationsScreen';
import AudioScreen from '../screens/AudioScreen';
import AuthScreen from '../screens/AuthScreen';
import CanvasScreen from '../screens/CanvasScreen';
import ChartsScreen from '../screens/ChartsScreen';
import CodesScreen from '../screens/CodesScreen';
import ColorsScreen from '../screens/ColorsScreen';
import DataGridScreen from '../screens/DataGridScreen';
import FilesScreen from '../screens/FilesScreen';
import LayoutsScreen from '../screens/LayoutsScreen';
import ListsScreen from '../screens/ListsScreen';
import MapsScreen from '../screens/MapsScreen';
import MediaScreen from '../screens/MediaScreen';
import NavigationScreen from '../screens/NavigationScreen';
import NetworkScreen from '../screens/NetworkScreen';
import ParticlesScreen from '../screens/ParticlesScreen';
import PlatformScreen from '../screens/PlatformScreen';
import ReanimatedScreen from '../screens/ReanimatedScreen';
import StorageScreen from '../screens/StorageScreen';
import SvgScreen from '../screens/SvgScreen';
import ThemesScreen from '../screens/ThemesScreen';
import ThreeDScreen from '../screens/ThreeDScreen';
import UtilitiesScreen from '../screens/UtilitiesScreen';
import VideoScreen from '../screens/VideoScreen';
import WebScreen from '../screens/WebScreen';
import {
  showcaseRegistry,
  type ShowcaseRouteKey,
} from './showcaseRegistry';

type ShowcaseRouteDefinition = {
  routeKey: ShowcaseRouteKey;
  component: ComponentType;
  options: NativeStackNavigationOptions;
};

const monitoredScreens: Record<ShowcaseRouteKey, ComponentType> = {
  Layouts: withScreenQuality('Layouts', LayoutsScreen),
  Lists: withScreenQuality('Lists', ListsScreen),
  Navigation: withScreenQuality('Navigation', NavigationScreen),
  Animations: withScreenQuality('Animations', AnimationsScreen),
  Canvas: withScreenQuality('Canvas', CanvasScreen),
  ThreeD: withScreenQuality('ThreeD', ThreeDScreen),
  Charts: withScreenQuality('Charts', ChartsScreen),
  Svg: withScreenQuality('Svg', SvgScreen),
  DataGrid: withScreenQuality('DataGrid', DataGridScreen),
  Media: withScreenQuality('Media', MediaScreen),
  Audio: withScreenQuality('Audio', AudioScreen),
  Video: withScreenQuality('Video', VideoScreen),
  Files: withScreenQuality('Files', FilesScreen),
  Platform: withScreenQuality('Platform', PlatformScreen),
  Web: withScreenQuality('Web', WebScreen),
  Network: withScreenQuality('Network', NetworkScreen),
  Storage: withScreenQuality('Storage', StorageScreen),
  Maps: withScreenQuality('Maps', MapsScreen),
  Auth: withScreenQuality('Auth', AuthScreen),
  Themes: withScreenQuality('Themes', ThemesScreen),
  Codes: withScreenQuality('Codes', CodesScreen),
  Utilities: withScreenQuality('Utilities', UtilitiesScreen),
  Particles: withScreenQuality('Particles', ParticlesScreen),
  Colors: withScreenQuality('Colors', ColorsScreen),
  Reanimated: withScreenQuality('Reanimated', ReanimatedScreen),
};

function createShowcaseScreenOptions(
  title: string,
): NativeStackNavigationOptions {
  return {
    title,
    header: ({navigation}) => (
      <AnimatedHeader title={title} onBack={() => navigation.goBack()} />
    ),
  };
}

export const showcaseRoutes: ShowcaseRouteDefinition[] = showcaseRegistry
  .map(screen => ({
    routeKey: screen.routeKey,
    component: monitoredScreens[screen.routeKey],
    options: createShowcaseScreenOptions(
      ('headerTitle' in screen ? screen.headerTitle : undefined) ?? screen.title,
    ),
  }));
