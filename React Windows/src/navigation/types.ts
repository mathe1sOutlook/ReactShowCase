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
  Platform: undefined;
  Widgets: undefined;
  WindowControls: undefined;
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
