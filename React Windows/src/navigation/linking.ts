import type {LinkingOptions} from '@react-navigation/native';
import {showcaseLinkingScreens} from './showcaseRegistry';
import type {RootTabParamList} from './types';

export const WINDOWS_CUSTOM_SCHEME = 'cfdwindows';
export const WINDOWS_HTTPS_HOST = 'showcase.cfd.dev';
export const WINDOWS_HTTPS_PATH_PREFIX = '/windows';

export const windowsAppLinking: LinkingOptions<RootTabParamList> = {
  prefixes: [
    `${WINDOWS_CUSTOM_SCHEME}://`,
    `https://${WINDOWS_HTTPS_HOST}${WINDOWS_HTTPS_PATH_PREFIX}`,
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
