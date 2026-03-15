import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {SectionWrapper} from '../components/common/SectionWrapper';
import {Colors, Radius, Spacing, Typography, fluentShadow} from '../theme';

type BreakpointKey = 'phone' | 'tablet' | 'desktop';

type LayoutTile = {
  id: string;
  title: string;
  height: number;
  color: string;
};

const ACCENTS = [
  Colors.primary,
  Colors.secondary,
  Colors.success,
  Colors.warning,
  Colors.accentLight,
];

const FLEX_ALIGNMENTS = [
  'flex-start',
  'center',
  'flex-end',
  'space-between',
] as const;

const GRID_ITEMS = [
  'Analytics',
  'CRM',
  'Inventory',
  'Media',
  'Finance',
  'Support',
  'Profile',
  'Settings',
];

const LAYOUT_TILES: LayoutTile[] = [
  {id: '1', title: 'Briefing', height: 116, color: Colors.primary},
  {id: '2', title: 'Retail', height: 150, color: Colors.secondary},
  {id: '3', title: 'Insights', height: 134, color: Colors.success},
  {id: '4', title: 'Studio', height: 176, color: Colors.warning},
  {id: '5', title: 'Travel', height: 124, color: Colors.accent},
  {id: '6', title: 'Medical', height: 166, color: Colors.primaryDark},
  {id: '7', title: 'Banking', height: 142, color: Colors.accentLight},
  {id: '8', title: 'Devices', height: 188, color: Colors.primary},
];

function getBreakpoint(width: number): BreakpointKey {
  if (width >= 1200) {
    return 'desktop';
  }
  if (width >= 760) {
    return 'tablet';
  }
  return 'phone';
}

function getGridColumns(width: number) {
  if (width >= 1200) {
    return 4;
  }
  if (width >= 760) {
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
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{label}</Text>
        <Text style={styles.cardMeta}>justifyContent</Text>
      </View>
      <View style={[styles.flexRow, {justifyContent}]}>
        {ACCENTS.slice(0, 3).map(color => (
          <View key={color} style={[styles.flexDot, {backgroundColor: color}]} />
        ))}
      </View>
    </View>
  );
}

function AlignRow({alignItems}: {alignItems: 'flex-start' | 'center' | 'flex-end'}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{alignItems}</Text>
        <Text style={styles.cardMeta}>alignItems</Text>
      </View>
      <View style={[styles.alignRow, {alignItems}]}>
        <View style={[styles.alignBar, {height: 24, backgroundColor: Colors.primary}]} />
        <View style={[styles.alignBar, {height: 42, backgroundColor: Colors.secondary}]} />
        <View style={[styles.alignBar, {height: 64, backgroundColor: Colors.success}]} />
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
  const horizontalPadding = 40;
  const gridItemWidth =
    (width - horizontalPadding - gridGap * (gridColumns - 1)) / gridColumns;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <SectionWrapper
          title="Layouts and Responsiveness"
          subtitle="Flexbox alignment, adaptive grids, masonry balancing, waterfall sequencing, live breakpoints, and safe area measurements for desktop surfaces.">
          <View style={styles.heroPanel}>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricLabel}>Breakpoint</Text>
              <Text style={styles.heroMetricValue}>{breakpoint}</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricLabel}>Columns</Text>
              <Text style={styles.heroMetricValue}>{gridColumns}</Text>
            </View>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricLabel}>Viewport</Text>
              <Text style={styles.heroMetricValue}>{Math.round(width)} px</Text>
            </View>
          </View>
        </SectionWrapper>

        <SectionWrapper
          title="Safe Area"
          subtitle="This desktop build now uses SafeAreaProvider as well, so inset-aware spacing stays explicit and measurable across windowed environments.">
          <View style={styles.card}>
            <View style={styles.insetsRow}>
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
        </SectionWrapper>

        <SectionWrapper
          title="Flexbox Showcase"
          subtitle="The cards below expose the main justify, align, and wrap combinations called out in phase 2.1.">
          <View style={styles.stack}>
            {FLEX_ALIGNMENTS.map(value => (
              <FlexRow key={value} justifyContent={value} label={value} />
            ))}
            <AlignRow alignItems="flex-start" />
            <AlignRow alignItems="center" />
            <AlignRow alignItems="flex-end" />
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>wrap</Text>
                <Text style={styles.cardMeta}>flexWrap</Text>
              </View>
              <View style={styles.wrapRow}>
                {ACCENTS.concat(ACCENTS.slice(0, 2)).map((color, index) => (
                  <View
                    key={`${color}-${index}`}
                    style={[styles.wrapChip, {borderColor: color}]}>
                    <Text style={[styles.wrapChipText, {color}]}>Item {index + 1}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </SectionWrapper>

        <SectionWrapper
          title="Responsive Grid"
          subtitle="Grid density adapts live: 2 columns for phone width, 3 for tablet, and 4 for desktop.">
          <View style={[styles.grid, {gap: gridGap}]}>
            {GRID_ITEMS.map((item, index) => (
              <View
                key={item}
                style={[
                  styles.gridTile,
                  {
                    width: gridItemWidth,
                    borderColor: ACCENTS[index % ACCENTS.length] + '33',
                  },
                ]}>
                <Text
                  style={[
                    styles.gridTileTitle,
                    {color: ACCENTS[index % ACCENTS.length]},
                  ]}>
                  {item}
                </Text>
                <Text style={styles.gridTileBody}>
                  {gridColumns} column responsive layout
                </Text>
              </View>
            ))}
          </View>
        </SectionWrapper>

        <SectionWrapper
          title="Masonry and Waterfall"
          subtitle="Both stacked patterns are represented: one balances columns, the other preserves sequential order.">
          <View style={styles.stack}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Masonry / staggered grid</Text>
                <Text style={styles.cardMeta}>balanced</Text>
              </View>
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
                            borderColor: tile.color + '33',
                            backgroundColor: tile.color + '10',
                          },
                        ]}>
                        <Text style={[styles.stackTileTitle, {color: tile.color}]}>
                          {tile.title}
                        </Text>
                        <Text style={styles.stackTileBody}>Balanced flow</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Waterfall layout</Text>
                <Text style={styles.cardMeta}>sequential</Text>
              </View>
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
                            borderColor: tile.color + '33',
                            backgroundColor: Colors.bgCardAlt,
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
        </SectionWrapper>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xxl,
  },
  heroPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  heroMetric: {
    minWidth: 120,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    ...fluentShadow('sm'),
  },
  heroMetricLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  heroMetricValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  stack: {
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...fluentShadow('sm'),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  cardMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  insetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  insetPill: {
    minWidth: 92,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.bgCardAlt,
  },
  insetLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  insetValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  flexRow: {
    minHeight: 60,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  flexDot: {
    width: 18,
    height: 18,
    borderRadius: Radius.full,
  },
  alignRow: {
    minHeight: 98,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.bgCardAlt,
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
    backgroundColor: Colors.bgCardAlt,
  },
  wrapChipText: {
    ...Typography.caption,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  gridTile: {
    minHeight: 96,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    backgroundColor: Colors.bgCard,
    justifyContent: 'space-between',
    ...fluentShadow('sm'),
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
