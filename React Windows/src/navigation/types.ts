import type {NavigatorScreenParams} from '@react-navigation/native';
import type {ShowcaseRouteKey, ShowcaseScreenMeta} from './showcaseRegistry';

export type HomeStackParamList = {
  Home: undefined;
} & Record<ShowcaseRouteKey, undefined>;

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ComponentsTab: undefined;
  AboutTab: undefined;
};

export type ScreenCategory = ShowcaseScreenMeta;
