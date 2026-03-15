import React, {useRef, useState} from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Neon, Radius, Spacing, Typography} from '../theme';

const TABS = [
  {
    key: 'studio',
    title: 'Studio',
    accent: Colors.primary,
    summary: 'Design previews and live routes',
  },
  {
    key: 'orders',
    title: 'Orders',
    accent: Colors.secondary,
    summary: 'Checkout and delivery flow',
  },
  {
    key: 'profile',
    title: 'Profile',
    accent: Colors.success,
    summary: 'Account and settings flow',
  },
] as const;

type TabKey = (typeof TABS)[number]['key'];

const TAB_ROUTES: Record<
  TabKey,
  {title: string; body: string; metric: string}[]
> = {
  studio: [
    {
      title: 'Overview',
      body: 'Top tabs host a swipeable pager while preserving the stack state for each tab.',
      metric: 'Tabs + swipe',
    },
    {
      title: 'Showcase',
      body: 'Pushing a detail route simulates a stack inside the selected tab without leaving the pager.',
      metric: 'Nested push',
    },
    {
      title: 'Prototype',
      body: 'A second push demonstrates deeper flow state before returning to the root screen.',
      metric: 'Depth 3',
    },
  ],
  orders: [
    {
      title: 'Cart',
      body: 'The orders tab keeps its own route depth even if the user switches to another tab.',
      metric: 'State kept',
    },
    {
      title: 'Tracking',
      body: 'This mirrors a common tabs + stack setup where each root tab owns an internal detail flow.',
      metric: 'Per-tab stack',
    },
    {
      title: 'Receipt',
      body: 'The final route closes the flow and can be popped back independently from the other tabs.',
      metric: 'Independent flow',
    },
  ],
  profile: [
    {
      title: 'Summary',
      body: 'Profile screens are often launched from drawers and bottom sheets while keeping the current tab visible.',
      metric: 'Drawer entry',
    },
    {
      title: 'Security',
      body: 'Bottom sheet navigation can jump directly into deeper routes without rebuilding the whole stack.',
      metric: 'Sheet route',
    },
    {
      title: 'Preferences',
      body: 'Pagination dots below the pager reinforce route progress while tabs remain visible above.',
      metric: 'Dots indicator',
    },
  ],
};

type DrawerAction = {
  label: string;
  detail: string;
  accent: string;
  onPress: () => void;
};

export default function NavigationScreen() {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const pagerRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const drawerProgress = useRef(new Animated.Value(0)).current;
  const sheetProgress = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);
  const [pagerWidth, setPagerWidth] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectionLabel, setSelectionLabel] = useState('Studio / Overview');
  const [stackDepth, setStackDepth] = useState<Record<TabKey, number>>({
    studio: 0,
    orders: 0,
    profile: 0,
  });

  const safePagerWidth = pagerWidth || width - Spacing.lg * 2 - Spacing.xl;
  const tabWidth = safePagerWidth / TABS.length;
  const inputRange = TABS.map((_, index) => index * safePagerWidth);
  const outputRange = TABS.map((_, index) => index * tabWidth);
  const indicatorTranslateX = scrollX.interpolate({
    inputRange,
    outputRange,
    extrapolate: 'clamp',
  });

  const currentTab = TABS[activeIndex];

  const jumpToTab = (index: number) => {
    pagerRef.current?.scrollTo({
      x: index * safePagerWidth,
      y: 0,
      animated: true,
    });
    setActiveIndex(index);
  };

  const setRoute = (index: number, depth: number) => {
    const tab = TABS[index];
    setStackDepth(current => ({
      ...current,
      [tab.key]: Math.min(depth, TAB_ROUTES[tab.key].length - 1),
    }));
  };

  const pushNext = (key: TabKey) => {
    setStackDepth(current => ({
      ...current,
      [key]: Math.min(current[key] + 1, TAB_ROUTES[key].length - 1),
    }));
  };

  const popCurrent = (key: TabKey) => {
    setStackDepth(current => ({
      ...current,
      [key]: Math.max(current[key] - 1, 0),
    }));
  };

  const resetCurrent = (key: TabKey) => {
    setStackDepth(current => ({
      ...current,
      [key]: 0,
    }));
  };

  const openDrawer = () => {
    setSheetOpen(false);
    Animated.timing(sheetProgress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
    setDrawerOpen(true);
    Animated.spring(drawerProgress, {
      toValue: 1,
      damping: 18,
      stiffness: 180,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    Animated.timing(drawerProgress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const openSheet = () => {
    setDrawerOpen(false);
    Animated.timing(drawerProgress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
    setSheetOpen(true);
    Animated.spring(sheetProgress, {
      toValue: 1,
      damping: 18,
      stiffness: 190,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    setSheetOpen(false);
    Animated.timing(sheetProgress, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const applySelection = (
    index: number,
    depth: number,
    label: string,
    source: 'drawer' | 'sheet',
  ) => {
    setRoute(index, depth);
    jumpToTab(index);
    setSelectionLabel(`${label} via ${source}`);
    if (source === 'drawer') {
      closeDrawer();
    } else {
      closeSheet();
    }
  };

  const drawerActions: DrawerAction[] = [
    {
      label: 'Open Studio',
      detail: 'Jump to the Studio root route',
      accent: Colors.primary,
      onPress: () => applySelection(0, 0, 'Studio / Overview', 'drawer'),
    },
    {
      label: 'Orders Tracking',
      detail: 'Jump to a deeper route in the Orders tab',
      accent: Colors.secondary,
      onPress: () => applySelection(1, 1, 'Orders / Tracking', 'drawer'),
    },
    {
      label: 'Profile Security',
      detail: 'Open a nested route from the drawer',
      accent: Colors.success,
      onPress: () => applySelection(2, 1, 'Profile / Security', 'drawer'),
    },
    {
      label: 'Quick Sheet',
      detail: 'Swap from drawer into the bottom sheet',
      accent: Colors.warning,
      onPress: () => {
        closeDrawer();
        setSelectionLabel('Quick Sheet opened via drawer');
        setTimeout(openSheet, 160);
      },
    },
  ];

  const sheetActions = [
    {
      label: 'Prototype Review',
      detail: 'Open Studio depth 3',
      accent: Colors.primary,
      onPress: () => applySelection(0, 2, 'Studio / Prototype', 'sheet'),
    },
    {
      label: 'Receipt Route',
      detail: 'Open Orders depth 3',
      accent: Colors.secondary,
      onPress: () => applySelection(1, 2, 'Orders / Receipt', 'sheet'),
    },
    {
      label: 'Preferences',
      detail: 'Open Profile depth 3',
      accent: Colors.success,
      onPress: () => applySelection(2, 2, 'Profile / Preferences', 'sheet'),
    },
    {
      label: 'Reset Current Tab',
      detail: 'Pop back to the root route',
      accent: Colors.warning,
      onPress: () => {
        resetCurrent(currentTab.key);
        setSelectionLabel(`${currentTab.title} reset via sheet`);
        closeSheet();
      },
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 80, paddingTop: insets.top + Spacing.lg},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Phase 2.3</Text>
          <Text style={styles.heroTitle}>Advanced Navigation</Text>
          <Text style={styles.heroBody}>
            Swipe tabs, top-tab indicator, nested tabs plus stack state, animated
            drawer items, bottom-sheet navigation, and dots pagination in one lab.
          </Text>
          <View style={styles.heroMetrics}>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Tabs</Text>
              <Text style={styles.metricValue}>{TABS.length}</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Drawer items</Text>
              <Text style={styles.metricValue}>{drawerActions.length}</Text>
            </View>
            <View style={styles.metricPill}>
              <Text style={styles.metricLabel}>Routes</Text>
              <Text style={styles.metricValue}>9</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tab View, Swipe and Nested Stack</Text>
          <Text style={styles.sectionBody}>
            Tap the top tabs or swipe horizontally. Each tab keeps its own stack
            depth, so switching between routes does not reset the previous tab.
          </Text>

          <View style={styles.topTabs}>
            <Animated.View
              style={[
                styles.topTabIndicator,
                {
                  width: tabWidth - 10,
                  transform: [{translateX: indicatorTranslateX}],
                },
              ]}
            />
            {TABS.map((tab, index) => {
              const focused = activeIndex === index;
              return (
                <Pressable
                  key={tab.key}
                  style={styles.topTabButton}
                  onPress={() => jumpToTab(index)}>
                  <Text
                    style={[
                      styles.topTabTitle,
                      focused && {color: tab.accent},
                    ]}>
                    {tab.title}
                  </Text>
                  <Text
                    style={[
                      styles.topTabSubtitle,
                      focused && styles.topTabSubtitleFocused,
                    ]}>
                    {tab.summary}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View
            style={styles.pagerViewport}
            onLayout={event => setPagerWidth(event.nativeEvent.layout.width)}>
            <Animated.ScrollView
              ref={pagerRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              decelerationRate="fast"
              scrollEventThrottle={16}
              onMomentumScrollEnd={event => {
                const index = Math.round(
                  event.nativeEvent.contentOffset.x / safePagerWidth,
                );
                setActiveIndex(index);
              }}
              onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {x: scrollX}}}],
                {useNativeDriver: false},
              )}>
              {TABS.map(tab => {
                const activeDepth = stackDepth[tab.key];
                const trail = TAB_ROUTES[tab.key].slice(0, activeDepth + 1);
                const activeRoute = TAB_ROUTES[tab.key][activeDepth];

                return (
                  <View
                    key={tab.key}
                    style={[
                      styles.page,
                      {width: safePagerWidth, borderColor: tab.accent + '55'},
                    ]}>
                    <View style={styles.pageHeader}>
                      <View
                        style={[
                          styles.pagePill,
                          {backgroundColor: tab.accent + '22'},
                        ]}>
                        <Text style={[styles.pagePillText, {color: tab.accent}]}>
                          {tab.title}
                        </Text>
                      </View>
                      <Text style={[styles.pageMetric, {color: tab.accent}]}>
                        {activeRoute.metric}
                      </Text>
                    </View>

                    <Text style={styles.pageTitle}>{activeRoute.title}</Text>
                    <Text style={styles.pageBody}>{activeRoute.body}</Text>

                    <View style={styles.breadcrumbRow}>
                      {trail.map(route => (
                        <View key={`${tab.key}-${route.title}`} style={styles.breadcrumbChip}>
                          <Text style={styles.breadcrumbText}>{route.title}</Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.metaRow}>
                      <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Depth</Text>
                        <Text style={styles.metaValue}>{activeDepth + 1}</Text>
                      </View>
                      <View style={styles.metaCard}>
                        <Text style={styles.metaLabel}>Pattern</Text>
                        <Text style={styles.metaValue}>Tabs + Stack</Text>
                      </View>
                    </View>

                    <View style={styles.actionRow}>
                      <Pressable
                        style={[
                          styles.actionButton,
                          activeDepth === 0 && styles.actionButtonDisabled,
                        ]}
                        disabled={activeDepth === 0}
                        onPress={() => popCurrent(tab.key)}>
                        <Text style={styles.actionButtonText}>Back</Text>
                      </Pressable>
                      <Pressable
                        style={[
                          styles.actionButton,
                          {backgroundColor: tab.accent + '22', borderColor: tab.accent},
                          activeDepth === TAB_ROUTES[tab.key].length - 1 &&
                            styles.actionButtonDisabled,
                        ]}
                        disabled={activeDepth === TAB_ROUTES[tab.key].length - 1}
                        onPress={() => pushNext(tab.key)}>
                        <Text style={[styles.actionButtonText, {color: tab.accent}]}>
                          Push Next
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </Animated.ScrollView>
          </View>

          <View style={styles.paginationRow}>
            {TABS.map((tab, index) => {
              const dotWidth = scrollX.interpolate({
                inputRange: [
                  (index - 1) * safePagerWidth,
                  index * safePagerWidth,
                  (index + 1) * safePagerWidth,
                ],
                outputRange: [10, 28, 10],
                extrapolate: 'clamp',
              });

              const dotOpacity = scrollX.interpolate({
                inputRange: [
                  (index - 1) * safePagerWidth,
                  index * safePagerWidth,
                  (index + 1) * safePagerWidth,
                ],
                outputRange: [0.35, 1, 0.35],
                extrapolate: 'clamp',
              });

              return (
                <Animated.View
                  key={tab.key}
                  style={[
                    styles.paginationDot,
                    {
                      width: dotWidth,
                      opacity: dotOpacity,
                      backgroundColor: tab.accent,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Drawer and Bottom Sheet</Text>
          <Text style={styles.sectionBody}>
            The drawer exposes animated destinations from the left. The bottom
            sheet offers quick routes and reset actions from the bottom edge.
          </Text>
          <View style={styles.surfaceRow}>
            <Pressable style={styles.primaryButton} onPress={openDrawer}>
              <Text style={styles.primaryButtonText}>Open Drawer</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={openSheet}>
              <Text style={styles.secondaryButtonText}>Open Bottom Sheet</Text>
            </Pressable>
          </View>
          <View style={styles.selectionCard}>
            <Text style={styles.selectionLabel}>Last navigation action</Text>
            <Text style={styles.selectionValue}>{selectionLabel}</Text>
          </View>
        </View>
      </ScrollView>

      <Animated.View
        pointerEvents={drawerOpen ? 'auto' : 'none'}
        style={[
          styles.overlay,
          {
            opacity: drawerProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.45],
            }),
          },
        ]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={closeDrawer} />
      </Animated.View>

      <Animated.View
        pointerEvents={drawerOpen ? 'auto' : 'none'}
        style={[
          styles.drawer,
          {
            paddingTop: insets.top + Spacing.lg,
            transform: [
              {
                translateX: drawerProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-320, 0],
                }),
              },
            ],
          },
        ]}>
        <Text style={styles.drawerTitle}>Animated Drawer</Text>
        <Text style={styles.drawerBody}>
          Each item drives a different navigation action inside the demo.
        </Text>
        <View style={styles.drawerList}>
          {drawerActions.map((item, index) => (
            <Animated.View
              key={item.label}
              style={{
                opacity: drawerProgress.interpolate({
                  inputRange: [index * 0.12, 1],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
                transform: [
                  {
                    translateX: drawerProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [28 + index * 4, 0],
                    }),
                  },
                ],
              }}>
              <Pressable
                style={[styles.drawerItem, {borderColor: item.accent + '44'}]}
                onPress={item.onPress}>
                <Text style={[styles.drawerItemTitle, {color: item.accent}]}>
                  {item.label}
                </Text>
                <Text style={styles.drawerItemBody}>{item.detail}</Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      <Animated.View
        pointerEvents={sheetOpen ? 'auto' : 'none'}
        style={[
          styles.overlay,
          {
            opacity: sheetProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.45],
            }),
          },
        ]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={closeSheet} />
      </Animated.View>

      <Animated.View
        pointerEvents={sheetOpen ? 'auto' : 'none'}
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + Spacing.lg,
            transform: [
              {
                translateY: sheetProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [380, 0],
                }),
              },
            ],
          },
        ]}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Bottom Sheet Navigation</Text>
        <Text style={styles.sheetBody}>
          Quick destinations can jump directly into deeper routes or reset the
          active tab state.
        </Text>
        <View style={styles.sheetList}>
          {sheetActions.map(item => (
            <Pressable
              key={item.label}
              style={[styles.sheetItem, {borderColor: item.accent + '44'}]}
              onPress={item.onPress}>
              <Text style={[styles.sheetItemTitle, {color: item.accent}]}>
                {item.label}
              </Text>
              <Text style={styles.sheetItemBody}>{item.detail}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  heroCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
    overflow: 'hidden',
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
    maxWidth: 460,
  },
  heroMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  metricPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  metricLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  metricValue: {
    ...Typography.h4,
    color: Colors.white,
  },
  sectionCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.white,
  },
  sectionBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  topTabs: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 4,
  },
  topTabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    borderRadius: Radius.md,
    backgroundColor: Colors.bgLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  topTabButton: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    gap: 2,
  },
  topTabTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  topTabSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  topTabSubtitleFocused: {
    color: Colors.textSecondary,
  },
  pagerViewport: {
    minHeight: 320,
    overflow: 'hidden',
  },
  page: {
    minHeight: 320,
    borderRadius: Radius.xl,
    borderWidth: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    gap: Spacing.md,
    marginRight: Spacing.md,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pagePill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  pagePillText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  pageMetric: {
    ...Typography.caption,
    fontWeight: '700',
  },
  pageTitle: {
    ...Typography.h3,
    color: Colors.white,
  },
  pageBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  breadcrumbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  breadcrumbChip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  breadcrumbText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  metaCard: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
    padding: Spacing.md,
  },
  metaLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  metaValue: {
    ...Typography.h4,
    color: Colors.white,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 'auto',
  },
  actionButton: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.bgCard,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionButtonText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  paginationDot: {
    height: 10,
    borderRadius: Radius.full,
  },
  surfaceRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    ...Typography.label,
    color: Colors.bg,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.secondary,
    backgroundColor: Colors.secondary + '18',
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    ...Typography.label,
    color: Colors.secondary,
  },
  selectionCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: 4,
  },
  selectionLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  selectionValue: {
    ...Typography.h4,
    color: Colors.white,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 300,
    backgroundColor: Colors.bgCard,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  drawerTitle: {
    ...Typography.h3,
    color: Colors.white,
  },
  drawerBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  drawerList: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  drawerItem: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: 4,
  },
  drawerItemTitle: {
    ...Typography.h4,
  },
  drawerItemBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    ...Typography.h3,
    color: Colors.white,
  },
  sheetBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  sheetList: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  sheetItem: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    gap: 4,
  },
  sheetItemTitle: {
    ...Typography.h4,
  },
  sheetItemBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
