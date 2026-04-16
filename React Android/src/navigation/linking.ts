import type {LinkingOptions} from '@react-navigation/native';
import {showcaseLinkingScreens} from './showcaseRegistry';
import type {RootTabParamList} from './types';

export const ANDROID_CUSTOM_SCHEME = 'cfdandroid';
export const ANDROID_HTTPS_HOST = 'showcase.cfd.dev';
export const ANDROID_HTTPS_PATH_PREFIX = '/android';

export const androidAppLinking: LinkingOptions<RootTabParamList> = {
  prefixes: [
    `${ANDROID_CUSTOM_SCHEME}://`,
    `https://${ANDROID_HTTPS_HOST}${ANDROID_HTTPS_PATH_PREFIX}`,
  ],
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
