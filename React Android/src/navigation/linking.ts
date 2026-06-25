import {Platform} from 'react-native';
import type {LinkingOptions} from '@react-navigation/native';
import {showcaseLinkingScreens} from './showcaseRegistry';
import type {RootTabParamList} from './types';
import {
  CURRENT_SHOWCASE_PLATFORM,
  SHOWCASE_HOST,
  getShowcasePathPrefix,
  getShowcaseScheme,
  type ShowcaseMobilePlatform,
} from '../utils/platformShowcase';

export const ANDROID_CUSTOM_SCHEME = 'cfdandroid';
export const IOS_CUSTOM_SCHEME = 'cfdios';
export const ANDROID_HTTPS_HOST = SHOWCASE_HOST;
export const ANDROID_HTTPS_PATH_PREFIX = '/android';
export const IOS_HTTPS_HOST = SHOWCASE_HOST;
export const IOS_HTTPS_PATH_PREFIX = '/ios';

export function createAppLinking(
  platform: ShowcaseMobilePlatform,
): LinkingOptions<RootTabParamList> {
  const prefixes =
    platform === 'android'
      ? [
          `${ANDROID_CUSTOM_SCHEME}://`,
          `https://${ANDROID_HTTPS_HOST}${ANDROID_HTTPS_PATH_PREFIX}`,
        ]
      : [`${IOS_CUSTOM_SCHEME}://`];

  return {
    prefixes,
    config: {
      screens: {
        HomeTab: {
          screens: {
            Home: '',
            ...showcaseLinkingScreens,
          },
        },
        ComponentsTab: 'components',
        AboutTab: 'about',
      },
    },
  };
}

export const androidAppLinking = createAppLinking('android');
export const iosAppLinking = createAppLinking('ios');
export const appLinking = createAppLinking(
  Platform.OS === 'ios' ? 'ios' : CURRENT_SHOWCASE_PLATFORM,
);

export const CURRENT_CUSTOM_SCHEME = getShowcaseScheme(CURRENT_SHOWCASE_PLATFORM);
export const CURRENT_HTTPS_HOST = SHOWCASE_HOST;
export const CURRENT_HTTPS_PATH_PREFIX = getShowcasePathPrefix(
  CURRENT_SHOWCASE_PLATFORM,
);
