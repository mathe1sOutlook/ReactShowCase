import React, {useCallback, useMemo, useRef, useState} from 'react';
import type {ComponentType} from 'react';
import {PanResponder, Pressable, StyleSheet, Text, View} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  FadeInUp,
  FadeOutDown,
  Layout,
  interpolate,
  interpolateColor,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDecay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {SectionWrapper} from '../components/common/SectionWrapper';
import {Colors, Radius, Spacing, fluentShadow} from '../theme';

/*
 * Typed wrappers for Animated components.
 * Works around react-native-reanimated v4 + @types/react@18.3 JSX mismatch
 * where AnimatedComponentType returns ReactNode instead of JSX.Element.
 */
const AView = Animated.View as unknown as ComponentType<any>;
const AText = Animated.Text as unknown as ComponentType<any>;
const AScrollView = Animated.ScrollView as unknown as ComponentType<any>;

/* ─── constants ─── */
const SLIDER_W = 320;
const GRID_SIZE = 60;
const BALL_SIZE = 44;
const GRID_AREA = 240;
const SCROLL_H_MAX = 120;
const SCROLL_H_MIN = 56;
const TRAVEL = 180;
const ACCENT_COLORS = [
  Colors.primary,
  Colors.secondary,
  Colors.success,
  Colors.warning,
  Colors.error,
  '#e74c3c',
];

/* ─── worklet functions ─── */
function snapToStep(value: number, step: number): number {
  'worklet';
  return Math.round(value / step) * step;
}

function customEasing(t: number): number {
  'worklet';
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ════════════════════════════════════════════
   1. Shared Values & useAnimatedStyle
   ════════════════════════════════════════════ */
function SharedValuesDemo() {
  const progress = useSharedValue(0.5);
  const renderCount = useRef(0);
  renderCount.current += 1;

  const boxStyle = useAnimatedStyle(() => ({
    transform: [
      {scale: interpolate(progress.value, [0, 1], [0.4, 1.4])},
      {rotate: `${interpolate(progress.value, [0, 1], [0, 360])}deg`},
    ],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.5, 1],
      [Colors.primary, Colors.secondary, Colors.error],
    ),
    borderRadius: interpolate(progress.value, [0, 1], [Radius.sm, 60]),
  }));

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          progress.value = Math.max(
            0,
            Math.min(1, (gesture.moveX - 40) / SLIDER_W),
          );
        },
      }),
    [progress],
  );

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{translateX: progress.value * (SLIDER_W - 24)}],
  }));

  return (
    <SectionWrapper
      title="Shared Values"
      subtitle="Drag the slider — scale, rotation, color & radius update on the UI thread with zero component re-renders.">
      <View style={s.center}>
        <AView style={[s.sharedBox, boxStyle]} />
      </View>
      <View style={s.sliderTrack} {...panResponder.panHandlers}>
        <AView style={[s.sliderFill, fillStyle]} />
        <AView style={[s.sliderThumb, thumbStyle]} />
      </View>
      <View style={s.badge}>
        <Text style={s.badgeText}>
          Component renders: {renderCount.current} (only on mount)
        </Text>
      </View>
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════
   2. Gesture-Driven Pan + Snap
   ════════════════════════════════════════════ */
function GestureSnapDemo() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const active = useSharedValue(false);
  const offsetRef = useRef({x: 0, y: 0});

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          offsetRef.current.x = translateX.value;
          offsetRef.current.y = translateY.value;
          active.value = true;
        },
        onPanResponderMove: (_, gesture) => {
          translateX.value = offsetRef.current.x + gesture.dx;
          translateY.value = offsetRef.current.y + gesture.dy;
        },
        onPanResponderRelease: () => {
          const max = GRID_AREA - BALL_SIZE;
          const sx =
            Math.round(
              Math.max(0, Math.min(max, translateX.value)) / GRID_SIZE,
            ) * GRID_SIZE;
          const sy =
            Math.round(
              Math.max(0, Math.min(max, translateY.value)) / GRID_SIZE,
            ) * GRID_SIZE;
          translateX.value = withSpring(sx, {damping: 15, stiffness: 150});
          translateY.value = withSpring(sy, {damping: 15, stiffness: 150});
          active.value = false;
        },
      }),
    [translateX, translateY, active],
  );

  const ballStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
    backgroundColor: active.value ? Colors.secondary : Colors.primary,
  }));

  const dots: {x: number; y: number}[] = [];
  for (let gx = 0; gx <= GRID_AREA - BALL_SIZE; gx += GRID_SIZE) {
    for (let gy = 0; gy <= GRID_AREA - BALL_SIZE; gy += GRID_SIZE) {
      dots.push({x: gx + BALL_SIZE / 2, y: gy + BALL_SIZE / 2});
    }
  }

  return (
    <SectionWrapper
      title="Gesture Snap"
      subtitle="Drag the ball — it snaps to the nearest grid point with spring physics.">
      <View style={s.gridWrap}>
        {dots.map((d, i) => (
          <View
            key={i}
            style={[s.dot, {left: d.x - 3, top: d.y - 3}]}
          />
        ))}
        <AView
          {...panResponder.panHandlers}
          style={[s.ball, ballStyle]}
        />
      </View>
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════
   3. Scroll-Driven Animations
   ════════════════════════════════════════════ */
function ScrollDrivenDemo() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: e => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, 100],
      [SCROLL_H_MAX, SCROLL_H_MIN],
      Extrapolation.CLAMP,
    ),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollY.value,
          [0, 100],
          [1, 0.65],
          Extrapolation.CLAMP,
        ),
      },
      {
        translateY: interpolate(
          scrollY.value,
          [0, 100],
          [0, -8],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      scrollY.value,
      [0, 60],
      [1, 0.8],
      Extrapolation.CLAMP,
    ),
  }));

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [0, 200],
          [0, -40],
          Extrapolation.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      scrollY.value,
      [0, 150],
      [0.5, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const ITEMS = Array.from({length: 15}, (_, i) => `Scroll item ${i + 1}`);

  return (
    <SectionWrapper
      title="Scroll-Driven"
      subtitle="Scroll the list — header height, title scale & parallax respond entirely on the UI thread.">
      <View style={s.scrollBox}>
        <AView style={[s.scrollHeader, headerStyle]}>
          <AView style={[s.parallaxCircle, parallaxStyle]} />
          <AText style={[s.scrollTitle, titleStyle]}>
            {'\u2728'} Scroll Me
          </AText>
        </AView>
        <AScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          style={s.scrollList}
          contentContainerStyle={{paddingTop: SCROLL_H_MAX}}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled>
          {ITEMS.map((t, i) => (
            <View key={i} style={s.scrollItem}>
              <View
                style={[
                  s.scrollDot,
                  {backgroundColor: ACCENT_COLORS[i % ACCENT_COLORS.length]},
                ]}
              />
              <Text style={s.scrollItemText}>{t}</Text>
            </View>
          ))}
        </AScrollView>
      </View>
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════
   4. Layout Animations
   ════════════════════════════════════════════ */
let _nextId = 5;

function LayoutAnimationsDemo() {
  const [items, setItems] = useState([
    {id: 1, label: 'React', color: Colors.primary},
    {id: 2, label: 'Native', color: Colors.secondary},
    {id: 3, label: 'Reanimated', color: Colors.success},
    {id: 4, label: 'Worklets', color: Colors.warning},
  ]);

  const addItem = useCallback(() => {
    const id = _nextId++;
    setItems(prev => [
      {
        id,
        label: `Item ${id}`,
        color: ACCENT_COLORS[id % ACCENT_COLORS.length],
      },
      ...prev,
    ]);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems(prev => prev.filter(it => it.id !== id));
  }, []);

  const shuffle = useCallback(() => {
    setItems(prev => [...prev].sort(() => Math.random() - 0.5));
  }, []);

  return (
    <SectionWrapper
      title="Layout Animations"
      subtitle="Items enter with FadeInUp, exit with FadeOutDown, and reorder with Layout.springify().">
      <View style={s.layoutBtns}>
        <Pressable
          style={[s.pillBtn, {backgroundColor: Colors.success + '20'}]}
          onPress={addItem}>
          <Text style={[s.pillText, {color: Colors.success}]}>+ Add</Text>
        </Pressable>
        <Pressable
          style={[s.pillBtn, {backgroundColor: Colors.primary + '20'}]}
          onPress={shuffle}>
          <Text style={[s.pillText, {color: Colors.primary}]}>
            {'\u21C4'} Shuffle
          </Text>
        </Pressable>
      </View>
      {items.map(it => (
        <AView
          key={it.id}
          entering={FadeInUp.springify().damping(15)}
          exiting={FadeOutDown.duration(300)}
          layout={Layout.springify()}
          style={[s.layoutCard, {borderLeftColor: it.color}]}>
          <Text style={s.layoutLabel}>{it.label}</Text>
          <Pressable onPress={() => removeItem(it.id)} hitSlop={8}>
            <Text style={s.removeX}>{'\u2715'}</Text>
          </Pressable>
        </AView>
      ))}
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════
   5. Animation Builders
   ════════════════════════════════════════════ */
function AnimationBuildersDemo() {
  const springY = useSharedValue(0);
  const timingY = useSharedValue(0);
  const decayY = useSharedValue(0);

  const animate = useCallback(() => {
    springY.value = 0;
    timingY.value = 0;
    decayY.value = 0;

    springY.value = withSpring(TRAVEL, {
      damping: 4,
      stiffness: 80,
      mass: 1,
    });
    timingY.value = withTiming(TRAVEL, {
      duration: 1200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
    decayY.value = withDecay({
      velocity: 800,
      deceleration: 0.997,
      clamp: [0, TRAVEL],
    });
  }, [springY, timingY, decayY]);

  const sStyle = useAnimatedStyle(() => ({
    transform: [{translateY: springY.value}],
  }));
  const tStyle = useAnimatedStyle(() => ({
    transform: [{translateY: timingY.value}],
  }));
  const dStyle = useAnimatedStyle(() => ({
    transform: [{translateY: decayY.value}],
  }));

  return (
    <SectionWrapper
      title="Animation Builders"
      subtitle="Same distance, different feel — Spring bounces, Timing glides, Decay coasts to a stop.">
      <Pressable
        style={[
          s.pillBtn,
          {
            backgroundColor: Colors.primary + '20',
            alignSelf: 'center',
            marginBottom: Spacing.md,
          },
        ]}
        onPress={animate}>
        <Text style={[s.pillText, {color: Colors.primary}]}>
          {'\u25B6'} Animate
        </Text>
      </Pressable>
      <View style={s.buildersRow}>
        {[
          {label: 'Spring', anim: sStyle, color: Colors.primary},
          {label: 'Timing', anim: tStyle, color: Colors.secondary},
          {label: 'Decay', anim: dStyle, color: Colors.error},
        ].map(b => (
          <View key={b.label} style={s.builderCol}>
            <Text style={[s.builderLabel, {color: b.color}]}>{b.label}</Text>
            <View style={s.builderTrack}>
              <AView
                style={[s.builderBall, {backgroundColor: b.color}, b.anim]}
              />
            </View>
          </View>
        ))}
      </View>
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════
   6. Interpolation Showcase
   ════════════════════════════════════════════ */
function InterpolationDemo() {
  const progress = useSharedValue(0);
  const startRef = useRef(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startRef.current = progress.value;
        },
        onPanResponderMove: (_, gesture) => {
          progress.value = Math.max(
            0,
            Math.min(1, startRef.current + gesture.dx / SLIDER_W),
          );
        },
      }),
    [progress],
  );

  const boxStyle = useAnimatedStyle(() => ({
    transform: [
      {rotate: `${interpolate(progress.value, [0, 1], [0, 360])}deg`},
      {
        scale: interpolate(progress.value, [0, 0.5, 1], [0.5, 1.3, 0.8]),
      },
    ],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.25, 0.5, 0.75, 1],
      [
        Colors.primary,
        Colors.success,
        Colors.secondary,
        Colors.warning,
        Colors.error,
      ],
    ),
    borderRadius: interpolate(
      progress.value,
      [0, 0.5, 1],
      [Radius.sm, 60, 16],
    ),
    width: interpolate(progress.value, [0, 1], [70, 130]),
    height: interpolate(progress.value, [0, 1], [70, 130]),
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{translateX: progress.value * (SLIDER_W - 32)}],
  }));

  return (
    <SectionWrapper
      title="Interpolation"
      subtitle="Drag horizontally — one shared value drives color, size, rotation & border-radius simultaneously.">
      <View style={s.center}>
        <AView style={[s.interpBox, boxStyle]} />
      </View>
      <View style={s.interpTrack} {...panResponder.panHandlers}>
        <AView style={[s.interpThumb, thumbStyle]} />
      </View>
      <View style={s.interpLabels}>
        <Text style={s.interpLbl}>0.0</Text>
        <Text style={s.interpLbl}>0.5</Text>
        <Text style={s.interpLbl}>1.0</Text>
      </View>
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════
   7. Custom Worklet
   ════════════════════════════════════════════ */
function CustomWorkletDemo() {
  const raw = useSharedValue(0);
  const [pct, setPct] = useState(0);

  const snapped = useDerivedValue(() => snapToStep(raw.value, 0.25));
  const eased = useDerivedValue(() => customEasing(snapped.value));

  useDerivedValue(() => {
    runOnJS(setPct)(Math.round(snapped.value * 100));
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          raw.value = Math.max(
            0,
            Math.min(1, (gesture.moveX - 40) / SLIDER_W),
          );
        },
      }),
    [raw],
  );

  const fillStyle = useAnimatedStyle(() => ({
    height: `${eased.value * 100}%`,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${eased.value * 360}deg`}],
  }));

  return (
    <SectionWrapper
      title="Custom Worklet"
      subtitle="Two worklet functions (snapToStep & customEasing) run on the UI thread — drag to see the snapped circular progress.">
      <View style={s.center}>
        <View style={s.progressOuter}>
          <AView style={[s.progressFill, fillStyle]} />
          <Text style={s.progressPct}>{pct}%</Text>
          <AView style={[s.progressRing, ringStyle]}>
            <View style={s.ringDot} />
          </AView>
        </View>
      </View>
      <View style={s.workletTrack} {...panResponder.panHandlers}>
        {[0, 25, 50, 75, 100].map(p => (
          <View
            key={p}
            style={[s.snapMark, {left: `${p}%`}]}>
            <View style={[s.snapDot, pct === p && s.snapDotActive]} />
            <Text style={s.snapLabel}>{p}</Text>
          </View>
        ))}
      </View>
      <View style={s.workletInfo}>
        <Text style={s.workletFn}>snapToStep(value, 0.25)</Text>
        <Text style={s.workletFn}>customEasing(t) — cubic in-out</Text>
      </View>
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════
   Main Screen
   ════════════════════════════════════════════ */
export default function ReanimatedScreen() {
  return (
    <ScreenContainer>
      <View style={s.hero}>
        <Text style={s.heroIcon}>{'\u26A1'}</Text>
        <Text style={s.heroTitle}>Reanimated Worklets</Text>
        <Text style={s.heroSub}>
          High-performance animations running on the UI thread
        </Text>
      </View>
      <SharedValuesDemo />
      <GestureSnapDemo />
      <ScrollDrivenDemo />
      <LayoutAnimationsDemo />
      <AnimationBuildersDemo />
      <InterpolationDemo />
      <CustomWorkletDemo />
      <View style={s.footer}>
        <View style={s.footerLine} />
        <Text style={s.footerText}>
          Powered by react-native-reanimated {'\u2022'} UI Thread
        </Text>
      </View>
    </ScreenContainer>
  );
}

/* ─── Styles ─── */
const s = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  heroIcon: {fontSize: 36, marginBottom: Spacing.sm},
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  center: {alignItems: 'center', marginVertical: Spacing.lg},
  badge: {
    alignSelf: 'center',
    backgroundColor: Colors.success + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
  },
  badgeText: {fontSize: 11, color: Colors.success, fontWeight: '600'},

  /* Demo 1 */
  sharedBox: {
    width: 100,
    height: 100,
    ...fluentShadow('md'),
  },
  sliderTrack: {
    width: SLIDER_W,
    height: 40,
    backgroundColor: Colors.bgAlt,
    borderRadius: Radius.md,
    alignSelf: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary + '20',
    borderRadius: Radius.md,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    ...fluentShadow('sm'),
  },

  /* Demo 2 */
  gridWrap: {
    width: GRID_AREA,
    height: GRID_AREA,
    alignSelf: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...fluentShadow('sm'),
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.borderMedium,
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    ...fluentShadow('md'),
  },

  /* Demo 3 */
  scrollBox: {
    height: 300,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.bgCard,
    marginVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...fluentShadow('sm'),
  },
  scrollHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  parallaxCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    right: -20,
    top: -10,
  },
  scrollTitle: {fontSize: 20, fontWeight: '700', color: '#ffffff'},
  scrollList: {flex: 1},
  scrollItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scrollDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.md,
  },
  scrollItemText: {fontSize: 14, color: Colors.textPrimary},

  /* Demo 4 */
  layoutBtns: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pillBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  pillText: {fontSize: 13, fontWeight: '600'},
  layoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.sm,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    ...fluentShadow('sm'),
  },
  layoutLabel: {fontSize: 15, fontWeight: '600', color: Colors.textPrimary},
  removeX: {fontSize: 16, color: Colors.textMuted, fontWeight: '600'},

  /* Demo 5 */
  buildersRow: {flexDirection: 'row', justifyContent: 'space-around'},
  builderCol: {alignItems: 'center', width: 80},
  builderLabel: {fontSize: 12, fontWeight: '700', marginBottom: Spacing.sm},
  builderTrack: {
    width: 4,
    height: TRAVEL + BALL_SIZE,
    backgroundColor: Colors.bgAlt,
    borderRadius: 2,
    alignItems: 'center',
  },
  builderBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    ...fluentShadow('sm'),
  },

  /* Demo 6 */
  interpBox: {...fluentShadow('md')},
  interpTrack: {
    width: SLIDER_W,
    height: 44,
    backgroundColor: Colors.bgAlt,
    borderRadius: Radius.lg,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  interpThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    ...fluentShadow('sm'),
  },
  interpLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SLIDER_W,
    alignSelf: 'center',
    marginTop: Spacing.xs,
  },
  interpLbl: {fontSize: 10, color: Colors.textMuted},

  /* Demo 7 */
  progressOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.bgCard,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    ...fluentShadow('md'),
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary + '30',
  },
  progressPct: {fontSize: 28, fontWeight: '900', color: Colors.primary},
  progressRing: {
    position: 'absolute',
    width: 120,
    height: 120,
  },
  ringDot: {
    position: 'absolute',
    top: -4,
    alignSelf: 'center',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  workletTrack: {
    width: SLIDER_W,
    height: 50,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  snapMark: {position: 'absolute', alignItems: 'center', marginLeft: -8},
  snapDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.borderMedium,
    marginBottom: 4,
  },
  snapDotActive: {backgroundColor: Colors.primary},
  snapLabel: {fontSize: 9, color: Colors.textMuted},
  workletInfo: {alignSelf: 'center', marginTop: Spacing.md},
  workletFn: {
    fontSize: 11,
    color: Colors.secondary,
    fontFamily: 'Consolas',
    marginBottom: 2,
  },

  /* Footer */
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    marginTop: Spacing.lg,
  },
  footerLine: {
    width: 40,
    height: 1,
    backgroundColor: Colors.borderMedium,
    marginBottom: Spacing.sm,
  },
  footerText: {fontSize: 12, color: Colors.textMuted},
});
