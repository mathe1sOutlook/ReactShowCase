import {Platform} from 'react-native';

export type ShowcaseMobilePlatform = 'android' | 'ios';

export const SHOWCASE_HOST = 'showcase.cfd.dev';

export function normalizeShowcasePlatform(
  platform: string | undefined,
): ShowcaseMobilePlatform {
  return platform === 'ios' ? 'ios' : 'android';
}

export const CURRENT_SHOWCASE_PLATFORM = normalizeShowcasePlatform(Platform.OS);

export function getShowcasePlatformLabel(
  platform: ShowcaseMobilePlatform = CURRENT_SHOWCASE_PLATFORM,
) {
  return platform === 'ios' ? 'iOS' : 'Android';
}

export function getShowcaseScheme(
  platform: ShowcaseMobilePlatform = CURRENT_SHOWCASE_PLATFORM,
) {
  return platform === 'ios' ? 'cfdios' : 'cfdandroid';
}

export function getShowcasePathPrefix(
  platform: ShowcaseMobilePlatform = CURRENT_SHOWCASE_PLATFORM,
) {
  return platform === 'ios' ? '/ios' : '/android';
}

export function createShowcaseDeepLink(
  route: string,
  platform: ShowcaseMobilePlatform = CURRENT_SHOWCASE_PLATFORM,
) {
  return `${getShowcaseScheme(platform)}://${route}`;
}

export function createShowcaseReferenceUrl(
  route: string,
  platform: ShowcaseMobilePlatform = CURRENT_SHOWCASE_PLATFORM,
) {
  return `https://${SHOWCASE_HOST}${getShowcasePathPrefix(platform)}/${route}`;
}

export function supportsShowcaseHttpsLinks(
  platform: ShowcaseMobilePlatform = CURRENT_SHOWCASE_PLATFORM,
) {
  return platform === 'android';
}

export function createShowcaseExternalRouteUrl(
  route: string,
  platform: ShowcaseMobilePlatform = CURRENT_SHOWCASE_PLATFORM,
) {
  return supportsShowcaseHttpsLinks(platform)
    ? createShowcaseReferenceUrl(route, platform)
    : createShowcaseDeepLink(route, platform);
}

export function getShowcaseEditionLabel(
  platform: ShowcaseMobilePlatform = CURRENT_SHOWCASE_PLATFORM,
) {
  return `${getShowcasePlatformLabel(platform)} Edition`;
}

export function getShowcaseHeroSubtitle(
  platform: ShowcaseMobilePlatform = CURRENT_SHOWCASE_PLATFORM,
) {
  return `${getShowcasePlatformLabel(platform)} ShowCase`;
}

export function getShowcaseCurationCopy(
  platform: ShowcaseMobilePlatform = CURRENT_SHOWCASE_PLATFORM,
) {
  return `Ready-to-demo ${getShowcasePlatformLabel(platform)} features curated for the main walkthrough`;
}

export function getShowcaseEmptySearchCopy(
  platform: ShowcaseMobilePlatform = CURRENT_SHOWCASE_PLATFORM,
) {
  return `Try a broader term or clear the search field to see the curated ${getShowcasePlatformLabel(platform)} showcase.`;
}

export function getShowcaseOptimizedLabel(
  platform: ShowcaseMobilePlatform = CURRENT_SHOWCASE_PLATFORM,
) {
  return `${getShowcasePlatformLabel(platform)} Optimized`;
}
