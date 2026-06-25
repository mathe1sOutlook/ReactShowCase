import {describe, expect, it} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {
  ANDROID_CUSTOM_SCHEME,
  ANDROID_HTTPS_HOST,
  ANDROID_HTTPS_PATH_PREFIX,
  IOS_HTTPS_HOST,
  IOS_HTTPS_PATH_PREFIX,
  IOS_CUSTOM_SCHEME,
  androidAppLinking,
  iosAppLinking,
} from '../src/navigation/linking';
import {
  showcaseLinkingScreens,
  showcaseRegistry,
} from '../src/navigation/showcaseRegistry';

function getHomeScreens(
  linking: typeof androidAppLinking,
) {
  const homeTabConfig = linking.config?.screens?.HomeTab;
  return typeof homeTabConfig === 'string' ? {} : homeTabConfig?.screens ?? {};
}

describe('mobile linking', () => {
  it('keeps the registry and JS linking config in sync for Android and iOS', () => {
    const androidHomeScreens = getHomeScreens(androidAppLinking);
    const iosHomeScreens = getHomeScreens(iosAppLinking);

    expect(androidAppLinking.prefixes).toContain(`${ANDROID_CUSTOM_SCHEME}://`);
    expect(androidAppLinking.prefixes).toContain(
      `https://${ANDROID_HTTPS_HOST}${ANDROID_HTTPS_PATH_PREFIX}`,
    );
    expect(androidHomeScreens).toMatchObject({
      Home: '',
      ...showcaseLinkingScreens,
    });

    expect(iosAppLinking.prefixes).toContain(`${IOS_CUSTOM_SCHEME}://`);
    expect(iosAppLinking.prefixes).not.toContain(
      `https://${IOS_HTTPS_HOST}${IOS_HTTPS_PATH_PREFIX}`,
    );
    expect(iosHomeScreens).toMatchObject({
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

  it('declares the iOS scheme and forwards URL opens to React Native', () => {
    const infoPlistPath = join(
      __dirname,
      '..',
      'ios',
      'CFDAndroid',
      'Info.plist',
    );
    const appDelegatePath = join(
      __dirname,
      '..',
      'ios',
      'CFDAndroid',
      'AppDelegate.swift',
    );
    const infoPlist = readFileSync(infoPlistPath, 'utf8');
    const appDelegate = readFileSync(appDelegatePath, 'utf8');

    expect(infoPlist).toContain('<string>CFDiOS</string>');
    expect(infoPlist).toContain(`<string>${IOS_CUSTOM_SCHEME}</string>`);
    expect(infoPlist).toContain(
      '<string>UIInterfaceOrientationLandscapeLeft</string>',
    );
    expect(infoPlist).toContain(
      '<string>UIInterfaceOrientationLandscapeRight</string>',
    );
    expect(appDelegate).toContain('import React_RCTLinking');
    expect(appDelegate).toContain('RCTLinkingManager.application(app, open: url, options: options)');
    expect(appDelegate).toContain('continue userActivity: NSUserActivity');
  });
});
