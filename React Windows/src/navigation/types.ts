import type {NavigatorScreenParams} from '@react-navigation/native';

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ComponentsTab: undefined;
  AboutTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Layouts: undefined;
  Lists: undefined;
  Navigation: undefined;
  Animations: undefined;
  Canvas: undefined;
  ThreeD: undefined;
  Charts: undefined;
  Svg: undefined;
  DataGrid: undefined;
  Media: undefined;
  Audio: undefined;
  Video: undefined;
  Files: undefined;
  Platform: undefined;
  Web: undefined;
  Network: undefined;
  Storage: undefined;
  Maps: undefined;
  Auth: undefined;
  Themes: undefined;
  Codes: undefined;
  Utilities: undefined;
  Widgets: undefined;
  WindowControls: undefined;
  Reanimated: undefined;
};

export type ScreenCategory = {
  key: keyof HomeStackParamList;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  demoCount: number;
  isNew?: boolean;
};
