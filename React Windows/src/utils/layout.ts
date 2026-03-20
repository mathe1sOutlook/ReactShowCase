import {Spacing} from '../theme';

export function getHomeGridMetrics(windowWidth: number) {
  const safeWidth = Math.max(windowWidth, 640);
  const columns = safeWidth >= 1360 ? 4 : safeWidth >= 960 ? 3 : 2;
  const horizontalPadding = Spacing.xl * 2;
  const gaps = Spacing.md * (columns - 1);
  const cardWidth = Math.max(
    220,
    Math.floor((safeWidth - horizontalPadding - gaps) / columns),
  );

  return {
    columns,
    cardWidth,
  };
}
