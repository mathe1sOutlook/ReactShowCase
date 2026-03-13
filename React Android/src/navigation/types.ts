import type {NavigatorScreenParams} from '@react-navigation/native';

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ComponentsTab: undefined;
  AboutTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Animations: undefined;
  Canvas: undefined;
  ThreeD: undefined;
  Charts: undefined;
  Platform: undefined;
  Particles: undefined;
  Colors: undefined;
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
