import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Colors, Radius, Spacing, Typography, fluentShadow} from '../theme';

const HEADER_HEIGHT = 212;
const SCROLL_TOP_THRESHOLD = 240;
const LOAD_MORE_THRESHOLD = 240;

type PerfRow = {
  id: string;
  title: string;
  metric: string;
  accent: string;
};

type DemoSection = {
  title: string;
  data: {id: string; label: string; detail: string; accent: string}[];
};

type FeedCard = {
  id: string;
  title: string;
  detail: string;
  accent: string;
  tag: string;
};

type Slide = {
  id: string;
  title: string;
  detail: string;
  accent: string;
};

const ACCENTS = [
  Colors.primary,
  Colors.secondary,
  Colors.success,
  Colors.warning,
  Colors.accentLight,
];

const PERF_DATA: PerfRow[] = Array.from({length: 1200}, (_, index) => ({
  id: `perf-${index + 1}`,
  title: `Desktop row #${index + 1}`,
  metric: `${(index % 18) + 10} ms`,
  accent: ACCENTS[index % ACCENTS.length],
}));

const SECTION_DATA: DemoSection[] = [
  {
    title: 'Pinned',
    data: [
      {
        id: 'pin-1',
        label: 'Executive summary',
        detail: 'Sticky headers keep group labels visible inside the list pane.',
        accent: Colors.primary,
      },
      {
        id: 'pin-2',
        label: 'Client priorities',
        detail: 'Grouped data reads more like a desktop productivity app.',
        accent: Colors.secondary,
      },
    ],
  },
  {
    title: 'Active',
    data: [
      {
        id: 'act-1',
        label: 'Migration board',
        detail: 'Multiple sections mirror inbox, planner, or kanban experiences.',
        accent: Colors.success,
      },
      {
        id: 'act-2',
        label: 'QA review',
        detail: 'Section headers remain pinned while rows underneath move.',
        accent: Colors.warning,
      },
      {
        id: 'act-3',
        label: 'Design sign-off',
        detail: 'Useful for larger windowed surfaces and dense content.',
        accent: Colors.accentLight,
      },
    ],
  },
  {
    title: 'Archive',
    data: [
      {
        id: 'arc-1',
        label: 'Release notes',
        detail: 'Archived groups stay anchored during long scroll sessions.',
        accent: Colors.primaryDark,
      },
      {
        id: 'arc-2',
        label: 'Legacy backlog',
        detail: 'This pattern scales well for desktop admin tools.',
        accent: Colors.accent,
      },
    ],
  },
];

const SLIDES: Slide[] = [
  {
    id: 'slide-1',
    title: 'Snap Rail',
    detail: 'Horizontal panels snap cleanly to the viewport for gallery-style browsing.',
    accent: Colors.primary,
  },
  {
    id: 'slide-2',
    title: 'Swiper State',
    detail: 'Indicator dots track the active panel and reinforce progress.',
    accent: Colors.secondary,
  },
  {
    id: 'slide-3',
    title: 'Preview Mode',
    detail: 'Works well for featured modules, showcases, and desktop widget rails.',
    accent: Colors.success,
  },
];

function createFeedCards(count: number, startAt = 1): FeedCard[] {
  return Array.from({length: count}, (_, index) => {
    const order = startAt + index;
    const accent = ACCENTS[(order - 1) % ACCENTS.length];

    return {
      id: `feed-${order}`,
      title: `Scrollable desktop card #${order}`,
      detail:
        order % 2 === 0
          ? 'Infinite loading appends more cards near the bottom of the screen.'
          : 'Pull-to-refresh resets the feed while sticky section headers remain available above.',
      accent,
      tag: order % 3 === 0 ? 'LIVE' : 'NEW',
    };
  });
}

function StickyHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.stickyHeader}>
      <Text style={styles.stickyHeaderTitle}>{title}</Text>
      <Text style={styles.stickyHeaderSubtitle}>{subtitle}</Text>
    </View>
  );
}

export default function ListsScreen() {
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<any>(null);
  const {width} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [activeSlide, setActiveSlide] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [feedCards, setFeedCards] = useState<FeedCard[]>(() => createFeedCards(6));

  const sidePadding = 20;
  const slideGap = Spacing.md;
  const slideWidth = width - sidePadding * 2;

  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT * 0.3],
    extrapolate: 'clamp',
  });

  const heroScale = scrollY.interpolate({
    inputRange: [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
    outputRange: [1.08, 1, 1],
    extrapolate: 'clamp',
  });

  const heroOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT * 0.8],
    outputRange: [1, 0.15],
    extrapolate: 'clamp',
  });

  const compactHeaderOpacity = scrollY.interpolate({
    inputRange: [70, 140],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const compactHeaderTranslateY = scrollY.interpolate({
    inputRange: [70, 140],
    outputRange: [-14, 0],
    extrapolate: 'clamp',
  });

  const loadMore = () => {
    if (loadingMore) {
      return;
    }

    setLoadingMore(true);
    setTimeout(() => {
      setFeedCards(current => [
        ...current,
        ...createFeedCards(4, current.length + 1),
      ]);
      setLoadingMore(false);
    }, 650);
  };

  const handleOuterScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const nextShowScrollTop = contentOffset.y > SCROLL_TOP_THRESHOLD;

    setShowScrollTop(current =>
      current === nextShowScrollTop ? current : nextShowScrollTop,
    );

    const reachedBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - LOAD_MORE_THRESHOLD;

    if (reachedBottom) {
      loadMore();
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setFeedCards(createFeedCards(6));
      setActiveSlide(0);
      setRefreshing(false);
    }, 700);
  };

  return (
    <View style={styles.root}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.hero,
          {
            paddingTop: insets.top + Spacing.xl,
            opacity: heroOpacity,
            transform: [{translateY: heroTranslateY}, {scale: heroScale}],
          },
        ]}>
        <View style={styles.heroGlowPrimary} />
        <View style={styles.heroGlowSecondary} />
        <Text style={styles.heroEyebrow}>Phase 2.2</Text>
        <Text style={styles.heroTitle}>Lists and Scroll Systems</Text>
        <Text style={styles.heroBody}>
          Virtualized rows, sticky headers, snapping rails, parallax motion,
          refresh controls, and infinite feed loading for desktop layouts.
        </Text>
        <View style={styles.heroMetrics}>
          <View style={styles.metricPill}>
            <Text style={styles.metricLabel}>Rows</Text>
            <Text style={styles.metricValue}>1200</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricLabel}>Sticky zones</Text>
            <Text style={styles.metricValue}>4</Text>
          </View>
          <View style={styles.metricPill}>
            <Text style={styles.metricLabel}>Slides</Text>
            <Text style={styles.metricValue}>{SLIDES.length}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.compactHeader,
          {
            paddingTop: insets.top + Spacing.sm,
            opacity: compactHeaderOpacity,
            transform: [{translateY: compactHeaderTranslateY}],
          },
        ]}>
        <Text style={styles.compactHeaderTitle}>Lists & Scroll</Text>
        <Text style={styles.compactHeaderSubtitle}>Desktop sticky sections</Text>
      </Animated.View>

      <Animated.ScrollView
        ref={ref => {
          scrollRef.current = ref;
        }}
        stickyHeaderIndices={[1, 3, 5, 7]}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 96},
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
            progressBackgroundColor={Colors.bgCard}
          />
        }
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {
            useNativeDriver: true,
            listener: handleOuterScroll,
          },
        )}>
        <View style={{height: HEADER_HEIGHT + insets.top + Spacing.xl}} />

        <StickyHeader
          title="Performance"
          subtitle="Optimized FlatList with 1000+ items"
        />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>FlatList virtualization</Text>
          <Text style={styles.cardBody}>
            The nested list is tuned with `windowSize`, `maxToRenderPerBatch`,
            `initialNumToRender`, `getItemLayout`, and `removeClippedSubviews`.
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>initialNumToRender: 12</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>windowSize: 9</Text>
            </View>
          </View>
          <View style={styles.listFrame}>
            <FlatList
              data={PERF_DATA}
              keyExtractor={item => item.id}
              nestedScrollEnabled
              removeClippedSubviews
              initialNumToRender={12}
              maxToRenderPerBatch={10}
              windowSize={9}
              getItemLayout={(_, index) => ({
                length: 54,
                offset: 54 * index,
                index,
              })}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => (
                <View style={styles.perfRow}>
                  <View
                    style={[
                      styles.perfDot,
                      {backgroundColor: item.accent},
                    ]}
                  />
                  <View style={styles.perfCopy}>
                    <Text style={styles.perfTitle}>{item.title}</Text>
                    <Text style={styles.perfSubtitle}>Windowed rendering</Text>
                  </View>
                  <Text style={[styles.perfMetric, {color: item.accent}]}>
                    {item.metric}
                  </Text>
                </View>
              )}
            />
          </View>
        </View>

        <StickyHeader
          title="Sections"
          subtitle="SectionList with sticky group headers"
        />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sticky section headers</Text>
          <Text style={styles.cardBody}>
            This grouped list keeps labels pinned while its rows move, which is a
            common pattern for desktop inboxes, planners, and admin panels.
          </Text>
          <View style={styles.listFrame}>
            <SectionList
              sections={SECTION_DATA}
              keyExtractor={item => item.id}
              nestedScrollEnabled
              stickySectionHeadersEnabled
              showsVerticalScrollIndicator={false}
              renderSectionHeader={({section}) => (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>{section.title}</Text>
                </View>
              )}
              renderItem={({item}) => (
                <View style={styles.sectionRow}>
                  <View
                    style={[
                      styles.sectionAccent,
                      {backgroundColor: item.accent},
                    ]}
                  />
                  <View style={styles.sectionCopy}>
                    <Text style={styles.sectionTitle}>{item.label}</Text>
                    <Text style={styles.sectionBody}>{item.detail}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>

        <StickyHeader
          title="Horizontal"
          subtitle="Snap scroll + carousel indicators"
        />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Horizontal rail with snap</Text>
          <Text style={styles.cardBody}>
            Each panel snaps to the viewport and updates an indicator row to mimic
            a swiper or carousel.
          </Text>
          <Animated.ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={slideWidth + slideGap}
            snapToAlignment="start"
            contentContainerStyle={{paddingRight: slideGap}}
            onMomentumScrollEnd={event => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / (slideWidth + slideGap),
              );
              setActiveSlide(index);
            }}>
            {SLIDES.map(slide => (
              <View
                key={slide.id}
                style={[
                  styles.slide,
                  {
                    width: slideWidth,
                    marginRight: slideGap,
                    borderColor: slide.accent + '33',
                  },
                ]}>
                <View
                  style={[
                    styles.slideAccent,
                    {backgroundColor: slide.accent},
                  ]}
                />
                <Text style={[styles.slideTitle, {color: slide.accent}]}>
                  {slide.title}
                </Text>
                <Text style={styles.slideBody}>{slide.detail}</Text>
              </View>
            ))}
          </Animated.ScrollView>
          <View style={styles.indicatorRow}>
            {SLIDES.map((slide, index) => {
              const active = index === activeSlide;
              return (
                <View
                  key={slide.id}
                  style={[
                    styles.indicator,
                    active && {
                      width: 26,
                      backgroundColor: slide.accent,
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>

        <StickyHeader
          title="Feed"
          subtitle="Pull-to-refresh, infinite loading, and scroll-to-top"
        />
        <View style={styles.feedGroup}>
          <View style={styles.feedIntro}>
            <Text style={styles.cardTitle}>Outer scroll interaction</Text>
            <Text style={styles.cardBody}>
              Pull the screen to refresh. Scroll near the bottom to append more
              content. A floating button appears after enough vertical travel to
              return the viewport to the top.
            </Text>
          </View>
          {feedCards.map(item => (
            <View key={item.id} style={styles.feedCard}>
              <View
                style={[
                  styles.feedStripe,
                  {backgroundColor: item.accent},
                ]}
              />
              <View style={styles.feedHeader}>
                <Text style={styles.feedTitle}>{item.title}</Text>
                <View style={[styles.feedTag, {backgroundColor: item.accent + '18'}]}>
                  <Text style={[styles.feedTagText, {color: item.accent}]}>
                    {item.tag}
                  </Text>
                </View>
              </View>
              <Text style={styles.feedBody}>{item.detail}</Text>
            </View>
          ))}
          {loadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={Colors.primary} />
              <Text style={styles.loadingMoreText}>Loading more cards...</Text>
            </View>
          ) : null}
        </View>
      </Animated.ScrollView>

      {showScrollTop ? (
        <Pressable
          onPress={() => scrollRef.current?.scrollTo({x: 0, y: 0, animated: true})}
          style={[styles.scrollTopButton, {bottom: insets.bottom + Spacing.xl}]}>
          <Text style={styles.scrollTopIcon}>{'\u2191'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  hero: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT + 72,
    paddingHorizontal: 20,
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: Colors.primaryDark,
  },
  heroGlowPrimary: {
    position: 'absolute',
    top: -30,
    right: -10,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroGlowSecondary: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroEyebrow: {
    ...Typography.label,
    color: Colors.white,
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.white,
    marginTop: Spacing.xs,
  },
  heroBody: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.82)',
    marginTop: Spacing.sm,
    maxWidth: 520,
  },
  heroMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  metricPill: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  metricLabel: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  metricValue: {
    ...Typography.h4,
    color: Colors.white,
  },
  compactHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 5,
  },
  compactHeaderTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  compactHeaderSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  stickyHeader: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stickyHeaderTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  stickyHeaderSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  card: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...fluentShadow('sm'),
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  cardBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.bgCardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  listFrame: {
    height: 260,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    overflow: 'hidden',
  },
  perfRow: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  perfDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  perfCopy: {
    flex: 1,
  },
  perfTitle: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  perfSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  perfMetric: {
    ...Typography.caption,
    fontWeight: '700',
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeaderText: {
    ...Typography.label,
    color: Colors.primary,
  },
  sectionRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  sectionAccent: {
    width: 4,
    borderRadius: Radius.full,
  },
  sectionCopy: {
    flex: 1,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  sectionBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  slide: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.lg,
    minHeight: 176,
    justifyContent: 'space-between',
    ...fluentShadow('sm'),
  },
  slideAccent: {
    width: 42,
    height: 4,
    borderRadius: Radius.full,
  },
  slideTitle: {
    ...Typography.h4,
    marginTop: Spacing.md,
  },
  slideBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderMedium,
  },
  feedGroup: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  feedIntro: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...fluentShadow('sm'),
  },
  feedCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
    overflow: 'hidden',
    ...fluentShadow('sm'),
  },
  feedStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  feedTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    flex: 1,
  },
  feedTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  feedTagText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  feedBody: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  loadingMoreText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  scrollTopButton: {
    position: 'absolute',
    right: 20,
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...fluentShadow('lg'),
  },
  scrollTopIcon: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '800',
  },
});
