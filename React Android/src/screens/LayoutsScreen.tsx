import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Section} from '../components/common/Section';
import {Colors, Neon, Radius, Spacing, Typography} from '../theme';

type BreakpointKey = 'phone' | 'tablet' | 'desktop';

type LayoutTile = {
  id: string;
  title: string;
  height: number;
  color: string;
};

const FLEX_ALIGNMENTS = [
  'flex-start',
  'center',
  'flex-end',
  'space-between',
] as const;

const GRID_ITEMS = [
  'Hero',
  'Feature',
  'Stats',
  'Charts',
  'Gallery',
  'CTA',
  'Details',
  'Footer',
];

const LAYOUT_TILES: LayoutTile[] = [
  {id: '1', title: 'Case Study', height: 112, color: Colors.primary},
  {id: '2', title: 'Commerce', height: 156, color: Colors.secondary},
  {id: '3', title: 'Dashboard', height: 136, color: Colors.success},
  {id: '4', title: 'Media', height: 184, color: Colors.warning},
  {id: '5', title: 'Travel', height: 128, color: Colors.accent},
  {id: '6', title: 'Health', height: 168, color: Colors.orange},
  {id: '7', title: 'Finance', height: 144, color: Colors.pink},
  {id: '8', title: 'IoT', height: 192, color: Colors.primary},
];

function getBreakpoint(width: number): BreakpointKey {
  if (width >= 1080) {
    return 'desktop';
  }
  if (width >= 720) {
    return 'tablet';
  }
  return 'phone';
}

function getGridColumns(width: number) {
  if (width >= 1080) {
    return 4;
  }
  if (width >= 720) {
    return 3;
  }
  return 2;
}

function buildColumns(items: LayoutTile[], columnCount: number, balanced: boolean) {
  const columns = Array.from({length: columnCount}, () => [] as LayoutTile[]);
  const heights = Array.from({length: columnCount}, () => 0);

  items.forEach((item, index) => {
    const columnIndex = balanced
      ? heights.indexOf(Math.min(...heights))
      : index % columnCount;

    columns[columnIndex].push(item);
    heights[columnIndex] += item.height + Spacing.md;
  });

  return columns;
}

function FlexRow({
  justifyContent,
  label,
}: {
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  label: string;
}) {
  return (
    <View style={styles.demoCard}>
      <View style={styles.demoHeader}>
        <Text style={styles.demoLabel}>{label}</Text>
        <Text style={styles.demoHint}>justifyContent</Text>
      </View>
      <View style={[styles.flexRow, {justifyContent}]}>
        {Neon.slice(0, 3).map(color => (
          <View key={color} style={[styles.flexDot, {backgroundColor: color}]} />
        ))}
      </View>
    </View>
  );
}

function AlignRow({alignItems}: {alignItems: 'flex-start' | 'center' | 'flex-end'}) {
  return (
    <View style={styles.demoCard}>
      <View style={styles.demoHeader}>
        <Text style={styles.demoLabel}>{alignItems}</Text>
        <Text style={styles.demoHint}>alignItems</Text>
      </View>
      <View style={[styles.alignRow, {alignItems}]}>
        <View style={[styles.alignBar, {height: 24, backgroundColor: Colors.primary}]} />
        <View style={[styles.alignBar, {height: 42, backgroundColor: Colors.secondary}]} />
        <View style={[styles.alignBar, {height: 62, backgroundColor: Colors.success}]} />
      </View>
    </View>
  );
}

export default function LayoutsScreen() {
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const breakpoint = getBreakpoint(width);
  const gridColumns = getGridColumns(width);
  const masonryColumns = buildColumns(LAYOUT_TILES, gridColumns, true);
  const waterfallColumns = buildColumns(LAYOUT_TILES, gridColumns, false);
  const gridGap = Spacing.md;
  const horizontalPadding = Spacing.lg * 2;
  const gridItemWidth =
    (width - horizontalPadding - gridGap * (gridColumns - 1)) / gridColumns;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Phase 2.1</Text>
          <Text style={styles.heroTitle}>Layouts and Responsiveness</Text>
          <Text style={styles.heroBody}>
            Flexbox alignment, adaptive grids, masonry balancing, waterfall flow,
            breakpoint awareness, and safe area telemetry in one screen.
          </Text>
          <View style={styles.heroMetrics}>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Breakpoint</Text>
              <Text style={styles.metricValue}>{breakpoint}</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Grid</Text>
              <Text style={styles.metricValue}>{gridColumns} cols</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Width</Text>
              <Text style={styles.metricValue}>{Math.round(width)} px</Text>
            </View>
          </View>
        </View>

        <Section title="Safe Area">
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Device inset handling</Text>
            <Text style={styles.infoBody}>
              The app is wrapped in `SafeAreaProvider`, and this screen reads the
              active inset values so edge padding can adapt per device.
            </Text>
            <View style={styles.insetGrid}>
              {[
                {label: 'Top', value: insets.top},
                {label: 'Right', value: insets.right},
                {label: 'Bottom', value: insets.bottom},
                {label: 'Left', value: insets.left},
              ].map(item => (
                <View key={item.label} style={styles.insetPill}>
                  <Text style={styles.insetLabel}>{item.label}</Text>
                  <Text style={styles.insetValue}>{Math.round(item.value)} px</Text>
                </View>
              ))}
            </View>
          </View>
        </Section>

        <Section title="Flexbox">
          <View style={styles.sectionGrid}>
            {FLEX_ALIGNMENTS.map(value => (
              <FlexRow key={value} justifyContent={value} label={value} />
            ))}
            <AlignRow alignItems="flex-start" />
            <AlignRow alignItems="center" />
            <AlignRow alignItems="flex-end" />
            <View style={styles.demoCard}>
              <View style={styles.demoHeader}>
                <Text style={styles.demoLabel}>wrap</Text>
                <Text style={styles.demoHint}>flexWrap</Text>
              </View>
              <View style={styles.wrapRow}>
                {Neon.concat(Neon.slice(0, 2)).map((color, index) => (
                  <View
                    key={`${color}-${index}`}
                    style={[styles.wrapChip, {borderColor: color}]}>
                    <Text style={[styles.wrapChipText, {color}]}>Item {index + 1}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Section>

        <Section title="Responsive Grid">
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Adaptive columns</Text>
            <Text style={styles.infoBody}>
              Phones render 2 columns, tablets 3, desktops 4. The cards below use
              the live viewport width to recompute item width.
            </Text>
            <View style={[styles.gridPreview, {gap: gridGap}]}>
              {GRID_ITEMS.map((item, index) => (
                <View
                  key={item}
                  style={[
                    styles.gridTile,
                    {
                      width: gridItemWidth,
                      borderColor: Neon[index % Neon.length] + '66',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.gridTileTitle,
                      {color: Neon[index % Neon.length]},
                    ]}>
                    {item}
                  </Text>
                  <Text style={styles.gridTileBody}>
                    {gridColumns} column responsive card
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Section>

        <Section title="Masonry and Waterfall">
          <View style={styles.sectionGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Masonry / staggered grid</Text>
              <Text style={styles.infoBody}>
                Balanced placement always targets the shortest column for a
                Pinterest-style composition.
              </Text>
              <View style={styles.columnsRow}>
                {masonryColumns.map((column, columnIndex) => (
                  <View key={`masonry-${columnIndex}`} style={styles.column}>
                    {column.map(tile => (
                      <View
                        key={tile.id}
                        style={[
                          styles.stackTile,
                          {
                            height: tile.height,
                            borderColor: tile.color + '55',
                            backgroundColor: tile.color + '14',
                          },
                        ]}>
                        <Text style={[styles.stackTileTitle, {color: tile.color}]}>
                          {tile.title}
                        </Text>
                        <Text style={styles.stackTileBody}>
                          Balanced flow
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Waterfall layout</Text>
              <Text style={styles.infoBody}>
                Sequential distribution keeps visual order deterministic while still
                creating vertical rhythm across columns.
              </Text>
              <View style={styles.columnsRow}>
                {waterfallColumns.map((column, columnIndex) => (
                  <View key={`waterfall-${columnIndex}`} style={styles.column}>
                    {column.map(tile => (
                      <View
                        key={`${tile.id}-wf`}
                        style={[
                          styles.stackTile,
                          {
                            height: tile.height,
                            borderColor: tile.color + '55',
                            backgroundColor: Colors.surface,
                          },
                        ]}>
                        <Text style={[styles.stackTileTitle, {color: tile.color}]}>
                          {tile.title}
                        </Text>
                        <Text style={styles.stackTileBody}>Sequential flow</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Section>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl,
  },
  heroCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  heroEyebrow: {
    ...Typography.label,
    color: Colors.primary,
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.white,
  },
  heroBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  heroMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  metricPill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  metricLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  metricValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  infoCard: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  infoTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  infoBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  insetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  insetPill: {
    minWidth: 92,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: Spacing.sm,
  },
  insetLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  insetValue: {
    ...Typography.h4,
    color: Colors.white,
  },
  sectionGrid: {
    gap: Spacing.md,
  },
  demoCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  demoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoLabel: {
    ...Typography.h4,
    color: Colors.white,
  },
  demoHint: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  flexRow: {
    minHeight: 60,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  flexDot: {
    width: 18,
    height: 18,
    borderRadius: Radius.full,
  },
  alignRow: {
    minHeight: 96,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.sm,
  },
  alignBar: {
    width: 24,
    borderRadius: Radius.md,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  wrapChip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  wrapChipText: {
    ...Typography.caption,
  },
  gridPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridTile: {
    minHeight: 96,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    justifyContent: 'space-between',
  },
  gridTileTitle: {
    ...Typography.h4,
  },
  gridTileBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  columnsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  column: {
    flex: 1,
    gap: Spacing.md,
  },
  stackTile: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  stackTileTitle: {
    ...Typography.h4,
  },
  stackTileBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
