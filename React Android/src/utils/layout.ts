import {Spacing} from '../theme';

export function getHomeGridMetrics(windowWidth: number) {
  const safeWidth = Math.max(windowWidth, 320);
  const columns = safeWidth >= 960 ? 3 : 2;
  const horizontalPadding = Spacing.lg * 2;
  const gaps = Spacing.md * (columns - 1);
  const cardWidth = Math.max(
    148,
    Math.floor((safeWidth - horizontalPadding - gaps) / columns),
  );

  return {
    columns,
    cardWidth,
  };
}

