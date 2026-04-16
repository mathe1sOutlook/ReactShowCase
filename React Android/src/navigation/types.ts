import type {NavigatorScreenParams} from '@react-navigation/native';
import type {
  ShowcaseRouteKey,
  ShowcaseScreenMeta,
  ShowcaseStatus,
} from './showcaseRegistry';

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ComponentsTab: undefined;
  AboutTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
} & {
  [Key in ShowcaseRouteKey]: undefined;
};

export type ScreenCategory = ShowcaseScreenMeta;
export type {ShowcaseRouteKey, ShowcaseScreenMeta, ShowcaseStatus};
