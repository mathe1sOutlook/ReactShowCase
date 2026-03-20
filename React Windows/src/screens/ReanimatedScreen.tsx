import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  LayoutAnimation,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {SectionWrapper} from '../components/common/SectionWrapper';
import {Colors, Radius, Spacing, fluentShadow} from '../theme';

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

/* ─── helper: snap to nearest step ─── */
function snapToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/* ─── helper: custom cubic ease in-out ─── */
function customEasing(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ─── helper: linear interpolation ─── */
function lerp(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

/* ─── helper: interpolate color (hex) ─── */
function lerpColor(
  value: number,
  stops: number[],
  colors: string[],
): string {
  let i = 0;
  for (let s = 0; s < stops.length - 1; s++) {
    if (value >= stops[s] && value <= stops[s + 1]) {
      i = s;
      break;
    }
    if (value > stops[s + 1]) {
      i = s + 1;
    }
  }
  i = Math.min(i, colors.length - 2);
  const t = Math.max(
    0,
    Math.min(1, (value - stops[i]) / (stops[i + 1] - stops[i])),
  );
  const c1 = hexToRgb(colors[i]);
  const c2 = hexToRgb(colors[i + 1]);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r},${g},${b})`;
}

function hexToRgb(hex: string): {r: number; g: number; b: number} {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

/* ════════════════════════════════════════════
   1. Shared Values & Animated Style
   ════════════════════════════════════════════ */
function SharedValuesDemo() {
  const progress = useRef(new Animated.Value(0.5)).current;
  const renderCount = useRef(0);
  renderCount.current += 1;

  const [progressVal, setProgressVal] = useState(0.5);

  useEffect(() => {
    const id = progress.addListener(({value}) => setProgressVal(value));
    return () => progress.removeListener(id);
  }, [progress]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          const v = Math.max(0, Math.min(1, (gesture.moveX - 40) / SLIDER_W));
          progress.setValue(v);
        },
      }),
    [progress],
  );

  const boxBg = lerpColor(
    progressVal,
    [0, 0.5, 1],
    [Colors.primary, Colors.secondary, Colors.error],
  );
  const boxRadius = lerp(progressVal, 0, 1, Radius.sm, 60);
  const boxScale = lerp(progressVal, 0, 1, 0.4, 1.4);
  const boxRotate = `${lerp(progressVal, 0, 1, 0, 360)}deg`;

  return (
    <SectionWrapper
      title="Shared Values"
      subtitle="Drag the slider — scale, rotation, color & radius update reactively.">
      <View style={s.center}>
        <View
          style={[
            s.sharedBox,
            {
              backgroundColor: boxBg,
              borderRadius: boxRadius,
              transform: [{scale: boxScale}, {rotate: boxRotate}],
            },
          ]}
        />
      </View>
      <View style={s.sliderTrack} {...panResponder.panHandlers}>
        <View
          style={[s.sliderFill, {width: `${progressVal * 100}%`}]}
        />
        <View
          style={[
            s.sliderThumb,
            {transform: [{translateX: progressVal * (SLIDER_W - 24)}]},
          ]}
        />
      </View>
      <View style={s.badge}>
        <Text style={s.badgeText}>
          Drag to control — built with RN Animated
        </Text>
      </View>
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════
   2. Gesture-Driven Pan + Snap
   ════════════════════════════════════════════ */
function GestureSnapDemo() {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const [isActive, setIsActive] = useState(false);
  const offsetRef = useRef({x: 0, y: 0});

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          offsetRef.current.x = (translateX as any).__getValue();
          offsetRef.current.y = (translateY as any).__getValue();
          setIsActive(true);
        },
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(offsetRef.current.x + gesture.dx);
          translateY.setValue(offsetRef.current.y + gesture.dy);
        },
        onPanResponderRelease: () => {
          const curX = (translateX as any).__getValue();
          const curY = (translateY as any).__getValue();
          const max = GRID_AREA - BALL_SIZE;
          const sx =
            Math.round(Math.max(0, Math.min(max, curX)) / GRID_SIZE) *
            GRID_SIZE;
          const sy =
            Math.round(Math.max(0, Math.min(max, curY)) / GRID_SIZE) *
            GRID_SIZE;
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: sx,
              damping: 15,
              stiffness: 150,
              mass: 1,
              useNativeDriver: true,
            }),
            Animated.spring(translateY, {
              toValue: sy,
              damping: 15,
              stiffness: 150,
              mass: 1,
              useNativeDriver: true,
            }),
          ]).start();
          setIsActive(false);
        },
      }),
    [translateX, translateY],
  );

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
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            s.ball,
            {
              backgroundColor: isActive ? Colors.secondary : Colors.primary,
              transform: [{translateX}, {translateY}],
            },
          ]}
        />
      </View>
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════
   3. Scroll-Driven Animations
   ════════════════════════════════════════════ */
function ScrollDrivenDemo() {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [SCROLL_H_MAX, SCROLL_H_MIN],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.65],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -8],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });

  const parallaxTranslateY = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  const parallaxOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0.5, 0],
    extrapolate: 'clamp',
  });

  const ITEMS = Array.from({length: 15}, (_, i) => `Scroll item ${i + 1}`);

  return (
    <SectionWrapper
      title="Scroll-Driven"
      subtitle="Scroll the list — header height, title scale & parallax respond to scroll position.">
      <View style={s.scrollBox}>
        <Animated.View style={[s.scrollHeader, {height: headerHeight}]}>
          <Animated.View
            style={[
              s.parallaxCircle,
              {
                opacity: parallaxOpacity,
                transform: [{translateY: parallaxTranslateY}],
              },
            ]}
          />
          <Animated.Text
            style={[
              s.scrollTitle,
              {
                opacity: titleOpacity,
                transform: [{scale: titleScale}, {translateY: titleTranslateY}],
              },
            ]}>
            {'\u2728'} Scroll Me
          </Animated.Text>
        </Animated.View>
        <Animated.ScrollView
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {useNativeDriver: false},
          )}
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
        </Animated.ScrollView>
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
    {id: 3, label: 'Animated', color: Colors.success},
    {id: 4, label: 'API', color: Colors.warning},
  ]);

  const addItem = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setItems(prev => prev.filter(it => it.id !== id));
  }, []);

  const shuffle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    setItems(prev => [...prev].sort(() => Math.random() - 0.5));
  }, []);

  return (
    <SectionWrapper
      title="Layout Animations"
      subtitle="Items enter, exit, and reorder with LayoutAnimation transitions.">
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
        <View
          key={it.id}
          style={[s.layoutCard, {borderLeftColor: it.color}]}>
          <Text style={s.layoutLabel}>{it.label}</Text>
          <Pressable onPress={() => removeItem(it.id)} hitSlop={8}>
            <Text style={s.removeX}>{'\u2715'}</Text>
          </Pressable>
        </View>
      ))}
    </SectionWrapper>
  );
}

/* ════════════════════════════════════════════
   5. Animation Builders
   ════════════════════════════════════════════ */
function AnimationBuildersDemo() {
  const springY = useRef(new Animated.Value(0)).current;
  const timingY = useRef(new Animated.Value(0)).current;
  const decayY = useRef(new Animated.Value(0)).current;

  const animate = useCallback(() => {
    springY.setValue(0);
    timingY.setValue(0);
    decayY.setValue(0);

    Animated.spring(springY, {
      toValue: TRAVEL,
      damping: 4,
      stiffness: 80,
      mass: 1,
      useNativeDriver: true,
    }).start();

    Animated.timing(timingY, {
      toValue: TRAVEL,
      duration: 1200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();

    Animated.decay(decayY, {
      velocity: 1.5,
      deceleration: 0.997,
      useNativeDriver: true,
    }).start();
  }, [springY, timingY, decayY]);

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
          {label: 'Spring', anim: springY, color: Colors.primary},
          {label: 'Timing', anim: timingY, color: Colors.secondary},
          {label: 'Decay', anim: decayY, color: Colors.error},
        ].map(b => (
          <View key={b.label} style={s.builderCol}>
            <Text style={[s.builderLabel, {color: b.color}]}>{b.label}</Text>
            <View style={s.builderTrack}>
              <Animated.View
                style={[
                  s.builderBall,
                  {
                    backgroundColor: b.color,
                    transform: [{translateY: b.anim}],
                  },
                ]}
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
  const progress = useRef(new Animated.Value(0)).current;
  const startRef = useRef(0);
  const [progressVal, setProgressVal] = useState(0);

  useEffect(() => {
    const id = progress.addListener(({value}) => setProgressVal(value));
    return () => progress.removeListener(id);
  }, [progress]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          startRef.current = (progress as any).__getValue();
        },
        onPanResponderMove: (_, gesture) => {
          const v = Math.max(
            0,
            Math.min(1, startRef.current + gesture.dx / SLIDER_W),
          );
          progress.setValue(v);
        },
      }),
    [progress],
  );

  const boxBg = lerpColor(
    progressVal,
    [0, 0.25, 0.5, 0.75, 1],
    [Colors.primary, Colors.success, Colors.secondary, Colors.warning, Colors.error],
  );
  const boxRotate = `${lerp(progressVal, 0, 1, 0, 360)}deg`;
  const boxScale =
    progressVal <= 0.5
      ? lerp(progressVal, 0, 0.5, 0.5, 1.3)
      : lerp(progressVal, 0.5, 1, 1.3, 0.8);
  const boxRadius =
    progressVal <= 0.5
      ? lerp(progressVal, 0, 0.5, Radius.sm, 60)
      : lerp(progressVal, 0.5, 1, 60, 16);
  const boxW = lerp(progressVal, 0, 1, 70, 130);
  const boxH = lerp(progressVal, 0, 1, 70, 130);

  return (
    <SectionWrapper
      title="Interpolation"
      subtitle="Drag horizontally — one value drives color, size, rotation & border-radius simultaneously.">
      <View style={s.center}>
        <View
          style={[
            s.interpBox,
            {
              backgroundColor: boxBg,
              borderRadius: boxRadius,
              width: boxW,
              height: boxH,
              transform: [{rotate: boxRotate}, {scale: boxScale}],
            },
          ]}
        />
      </View>
      <View style={s.interpTrack} {...panResponder.panHandlers}>
        <View
          style={[
            s.interpThumb,
            {transform: [{translateX: progressVal * (SLIDER_W - 32)}]},
          ]}
        />
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
   7. Custom Easing Demo
   ════════════════════════════════════════════ */
function CustomWorkletDemo() {
  const raw = useRef(new Animated.Value(0)).current;
  const [pct, setPct] = useState(0);
  const [easedVal, setEasedVal] = useState(0);

  useEffect(() => {
    const id = raw.addListener(({value}) => {
      const snapped = snapToStep(value, 0.25);
      const eased = customEasing(snapped);
      setPct(Math.round(snapped * 100));
      setEasedVal(eased);
    });
    return () => raw.removeListener(id);
  }, [raw]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gesture) => {
          raw.setValue(
            Math.max(0, Math.min(1, (gesture.moveX - 40) / SLIDER_W)),
          );
        },
      }),
    [raw],
  );

  return (
    <SectionWrapper
      title="Custom Easing"
      subtitle="Two functions (snapToStep & customEasing) transform the value — drag to see the snapped circular progress.">
      <View style={s.center}>
        <View style={s.progressOuter}>
          <View
            style={[s.progressFill, {height: `${easedVal * 100}%`}]}
          />
          <Text style={s.progressPct}>{pct}%</Text>
          <View
            style={[
              s.progressRing,
              {transform: [{rotate: `${easedVal * 360}deg`}]},
            ]}>
            <View style={s.ringDot} />
          </View>
        </View>
      </View>
      <View style={s.workletTrack} {...panResponder.panHandlers}>
        {[0, 25, 50, 75, 100].map(p => (
          <View key={p} style={[s.snapMark, {left: `${p}%`}]}>
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
        <Text style={s.heroTitle}>Animation Showcase</Text>
        <Text style={s.heroSub}>
          High-performance animations using React Native Animated API
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
          Powered by React Native Animated {'\u2022'} Cross-Platform
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
