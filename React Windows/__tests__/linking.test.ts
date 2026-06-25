import {describe, expect, it} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {
  WINDOWS_CUSTOM_SCHEME,
  WINDOWS_HTTPS_HOST,
  WINDOWS_HTTPS_PATH_PREFIX,
  windowsAppLinking,
} from '../src/navigation/linking';
import {
  showcaseLinkingScreens,
  showcaseRegistry,
} from '../src/navigation/showcaseRegistry';

describe('windows linking', () => {
  it('keeps the registry and JS linking config in sync', () => {
    const homeTabConfig = windowsAppLinking.config?.screens?.HomeTab;
    const homeScreens =
      typeof homeTabConfig === 'string' ? {} : homeTabConfig?.screens ?? {};

    expect(windowsAppLinking.prefixes).toContain(`${WINDOWS_CUSTOM_SCHEME}://`);
    expect(windowsAppLinking.prefixes).toContain(
      `https://${WINDOWS_HTTPS_HOST}${WINDOWS_HTTPS_PATH_PREFIX}`,
    );
    expect(homeScreens).toMatchObject({
      Home: '',
      ...showcaseLinkingScreens,
    });

    showcaseRegistry.forEach(screen => {
      expect(showcaseLinkingScreens[screen.routeKey]).toBe(screen.deepLinkSlug);
    });
  });

  it('declares the Windows protocol and app URI handlers required by the JS linking config', () => {
    const manifestPath = join(
      __dirname,
      '..',
      'windows',
      'CFDWindows',
      'Package.appxmanifest',
    );
    const manifest = readFileSync(manifestPath, 'utf8');

    expect(manifest).toContain('Category="windows.protocol"');
    expect(manifest).toContain(`Name="${WINDOWS_CUSTOM_SCHEME}"`);
    expect(manifest).toContain('Category="windows.appUriHandler"');
    expect(manifest).toContain(`Host Name="${WINDOWS_HTTPS_HOST}"`);
  });
});
