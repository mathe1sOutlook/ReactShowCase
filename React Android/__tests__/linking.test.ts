import {describe, expect, it} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {
  ANDROID_CUSTOM_SCHEME,
  ANDROID_HTTPS_HOST,
  ANDROID_HTTPS_PATH_PREFIX,
  androidAppLinking,
} from '../src/navigation/linking';
import {
  showcaseLinkingScreens,
  showcaseRegistry,
} from '../src/navigation/showcaseRegistry';

describe('android linking', () => {
  it('keeps the registry and JS linking config in sync', () => {
    const homeTabConfig = androidAppLinking.config?.screens?.HomeTab;
    const homeScreens =
      typeof homeTabConfig === 'string' ? {} : homeTabConfig?.screens ?? {};

    expect(androidAppLinking.prefixes).toContain(`${ANDROID_CUSTOM_SCHEME}://`);
    expect(androidAppLinking.prefixes).toContain(
      `https://${ANDROID_HTTPS_HOST}${ANDROID_HTTPS_PATH_PREFIX}`,
    );
    expect(homeScreens).toMatchObject({
      Home: '',
      ...showcaseLinkingScreens,
    });

    showcaseRegistry.forEach(screen => {
      expect(showcaseLinkingScreens[screen.routeKey]).toBe(screen.deepLinkSlug);
    });
  });

  it('declares the Android intent filters required by the JS linking config', () => {
    const manifestPath = join(
      __dirname,
      '..',
      'android',
      'app',
      'src',
      'main',
      'AndroidManifest.xml',
    );
    const manifest = readFileSync(manifestPath, 'utf8');

    expect(manifest).toContain(`android:scheme="${ANDROID_CUSTOM_SCHEME}"`);
    expect(manifest).toContain('android.intent.category.BROWSABLE');
    expect(manifest).toContain(`android:host="${ANDROID_HTTPS_HOST}"`);
    expect(manifest).toContain(
      `android:pathPrefix="${ANDROID_HTTPS_PATH_PREFIX}"`,
    );
  });
});
