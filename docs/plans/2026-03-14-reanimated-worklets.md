# Reanimated Worklets Showcase — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a new `ReanimatedScreen` to both Android and Windows apps showcasing 7 Reanimated demos (shared values, gesture snap, scroll-driven, layout animations, animation builders, interpolation, custom worklets).

**Architecture:** New screen file per platform, registered in navigation stack and home grid. Android uses RNGH `Gesture.Pan()` for gesture demos; Windows uses `PanResponder` fallback since RNGH has limited Windows support. Both use `react-native-reanimated` for animated styles and worklets.

**Tech Stack:** `react-native-reanimated@^3`, `react-native-gesture-handler@^2` (Android), `PanResponder` (Windows fallback)

---

## Task 1: Install and configure dependencies (Android)

**Files:**
- Modify: `React Android/package.json`
- Modify: `React Android/babel.config.js`
- Modify: `React Android/App.tsx`

**Step 1: Install packages**

```bash
cd "c:/Dev/ReactShowCase/React Android"
npm install react-native-reanimated react-native-gesture-handler
```

**Step 2: Add Reanimated Babel plugin (must be LAST)**

In `React Android/babel.config.js`:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

**Step 3: Wrap App.tsx in GestureHandlerRootView + add deep link**

In `React Android/App.tsx`, add import and wrapper:

```tsx
import {GestureHandlerRootView} from 'react-native-gesture-handler';
```

Wrap the return JSX:

```tsx
return (
  <GestureHandlerRootView style={{flex: 1}}>
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);
```

Add `Reanimated: 'reanimated'` to the deep linking config inside `HomeTab.screens`.

**Step 4: Verify build**

```bash
cd "c:/Dev/ReactShowCase/React Android"
npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add package.json package-lock.json babel.config.js App.tsx
git commit -m "chore(android): install reanimated + gesture-handler, configure babel"
```

---

## Task 2: Install and configure dependencies (Windows)

**Files:**
- Modify: `React Windows/package.json`
- Modify: `React Windows/babel.config.js`
- Modify: `React Windows/App.tsx`

**Step 1: Install Reanimated**

```bash
cd "c:/Dev/ReactShowCase/React Windows"
npm install react-native-reanimated
```

> **Note:** `react-native-gesture-handler` may not fully support RN Windows 0.75. The Windows screen uses `PanResponder` for gesture demos instead.

**Step 2: Add Reanimated Babel plugin**

In `React Windows/babel.config.js`:

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

**Step 3: Add deep link in App.tsx**

Add `Reanimated: 'reanimated'` to the deep linking config inside `HomeTab.screens` in `React Windows/App.tsx`. No GestureHandlerRootView needed (no RNGH on Windows).

**Step 4: Verify build**

```bash
cd "c:/Dev/ReactShowCase/React Windows"
npx tsc --noEmit
```

**Step 5: Commit**

```bash
git add package.json package-lock.json babel.config.js App.tsx
git commit -m "chore(windows): install reanimated, configure babel"
```

---

## Task 3: Register ReanimatedScreen in navigation (Android)

**Files:**
- Modify: `React Android/src/navigation/types.ts`
- Modify: `React Android/src/navigation/HomeStack.tsx`
- Modify: `React Android/src/screens/HomeScreen.tsx`
- Create: `React Android/src/screens/ReanimatedScreen.tsx` (placeholder)

**Step 1: Add `Reanimated` to `HomeStackParamList`**

In `React Android/src/navigation/types.ts`, add to the type:

```ts
export type HomeStackParamList = {
  Home: undefined;
  Layouts: undefined;
  Lists: undefined;
  Navigation: undefined;
  Animations: undefined;
  Canvas: undefined;
  ThreeD: undefined;
  Charts: undefined;
  Platform: undefined;
  Particles: undefined;
  Colors: undefined;
  Reanimated: undefined;
};
```

**Step 2: Add screen to HomeStack.tsx**

Add import and Stack.Screen in `React Android/src/navigation/HomeStack.tsx`:

```tsx
import ReanimatedScreen from '../screens/ReanimatedScreen';
```

Add before the closing `</Stack.Navigator>`:

```tsx
<Stack.Screen
  name="Reanimated"
  component={ReanimatedScreen}
  options={{
    title: 'Reanimated Worklets',
    header: ({navigation, options}) => (
      <AnimatedHeader
        title={options.title || 'Reanimated Worklets'}
        onBack={() => navigation.goBack()}
      />
    ),
  }}
/>
```

**Step 3: Add card to HomeScreen.tsx**

Add to the `CATEGORIES` array in `React Android/src/screens/HomeScreen.tsx`:

```ts
{
  key: 'Reanimated',
  title: 'Reanimated',
  subtitle: 'Worklets, shared values & UI thread animations',
  icon: '\u26A1',
  color: Colors.warning,
  demoCount: 7,
  isNew: true,
},
```

**Step 4: Create placeholder screen**

Create `React Android/src/screens/ReanimatedScreen.tsx`:

```tsx
import React from 'react';
import {Text, View} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Section} from '../components/common/Section';
import {Colors} from '../theme';

export default function ReanimatedScreen() {
  return (
    <ScreenContainer>
      <Section title="Reanimated Worklets">
        <Text style={{color: Colors.textSecondary}}>Coming soon...</Text>
      </Section>
    </ScreenContainer>
  );
}
```

**Step 5: Verify build**

```bash
cd "c:/Dev/ReactShowCase/React Android"
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add src/navigation/types.ts src/navigation/HomeStack.tsx src/screens/HomeScreen.tsx src/screens/ReanimatedScreen.tsx
git commit -m "feat(android): register ReanimatedScreen in navigation"
```

---

## Task 4: Register ReanimatedScreen in navigation (Windows)

**Files:**
- Modify: `React Windows/src/navigation/types.ts`
- Modify: `React Windows/src/navigation/HomeStack.tsx`
- Modify: `React Windows/src/screens/HomeScreen.tsx`
- Create: `React Windows/src/screens/ReanimatedScreen.tsx` (placeholder)

**Step 1: Add `Reanimated` to `HomeStackParamList`**

In `React Windows/src/navigation/types.ts`, add to the type:

```ts
export type HomeStackParamList = {
  Home: undefined;
  Layouts: undefined;
  Lists: undefined;
  Navigation: undefined;
  Animations: undefined;
  Canvas: undefined;
  ThreeD: undefined;
  Charts: undefined;
  Platform: undefined;
  Widgets: undefined;
  WindowControls: undefined;
  Reanimated: undefined;
};
```

**Step 2: Add screen to HomeStack.tsx**

Add import and Stack.Screen in `React Windows/src/navigation/HomeStack.tsx`:

```tsx
import ReanimatedScreen from '../screens/ReanimatedScreen';
```

Add before `</Stack.Navigator>`:

```tsx
<Stack.Screen
  name="Reanimated"
  component={ReanimatedScreen}
  options={{title: 'Reanimated Worklets'}}
/>
```

**Step 3: Add card to HomeScreen.tsx**

Add to the `CATEGORIES` array in `React Windows/src/screens/HomeScreen.tsx`:

```ts
{
  key: 'Reanimated',
  title: 'Reanimated',
  subtitle: 'Worklets, shared values & UI thread animations',
  icon: '\u26A1',
  color: Colors.warning,
  demoCount: 7,
  isNew: true,
},
```

**Step 4: Create placeholder screen**

Create `React Windows/src/screens/ReanimatedScreen.tsx`:

```tsx
import React from 'react';
import {Text} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {SectionWrapper} from '../components/common/SectionWrapper';

export default function ReanimatedScreen() {
  return (
    <ScreenContainer>
      <SectionWrapper title="Reanimated Worklets" subtitle="Coming soon...">
        <Text>Placeholder</Text>
      </SectionWrapper>
    </ScreenContainer>
  );
}
```

**Step 5: Verify build**

```bash
cd "c:/Dev/ReactShowCase/React Windows"
npx tsc --noEmit
```

**Step 6: Commit**

```bash
git add src/navigation/types.ts src/navigation/HomeStack.tsx src/screens/HomeScreen.tsx src/screens/ReanimatedScreen.tsx
git commit -m "feat(windows): register ReanimatedScreen in navigation"
```

---

## Task 5: Implement ReanimatedScreen (Android)

**Files:**
- Replace: `React Android/src/screens/ReanimatedScreen.tsx`

**Step 1: Write the complete screen**

Replace the placeholder with the full implementation below. This file contains all 7 demos using Reanimated + RNGH Gesture API, following the neon dark theme of the Android app.

```tsx
import React, {useCallback, useRef, useState} from 'react';
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
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Section} from '../components/common/Section';
import {Colors, Neon, Radius, Spacing} from '../theme';

/* ─── constants ─── */
const SLIDER_W = 280;
const GRID_SIZE = 56;
const BALL_SIZE = 44;
const GRID_AREA = 224;
const SCROLL_H_MAX = 120;
const SCROLL_H_MIN = 56;
const TRAVEL = 180;

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
      [Colors.primary, Colors.accent, Colors.secondary],
    ),
    borderRadius: interpolate(progress.value, [0, 1], [Radius.sm, 60]),
  }));

  const gesture = Gesture.Pan().onUpdate(e => {
    'worklet';
    progress.value = Math.max(0, Math.min(1, e.x / SLIDER_W));
  });

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{translateX: progress.value * (SLIDER_W - 24)}],
  }));

  return (
    <Section title="Shared Values">
      <Text style={s.desc}>
        Drag the slider — scale, rotation, color & radius update on the UI
        thread with zero component re-renders.
      </Text>
      <View style={s.center}>
        <Animated.View style={[s.sharedBox, boxStyle]} />
      </View>
      <GestureDetector gesture={gesture}>
        <View style={s.sliderTrack}>
          <Animated.View style={[s.sliderFill, fillStyle]} />
          <Animated.View style={[s.sliderThumb, thumbStyle]} />
        </View>
      </GestureDetector>
      <View style={s.badge}>
        <Text style={s.badgeText}>
          Component renders: {renderCount.current} (only on mount)
        </Text>
      </View>
    </Section>
  );
}

/* ════════════════════════════════════════════
   2. Gesture-Driven Pan + Snap
   ════════════════════════════════════════════ */
function GestureSnapDemo() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const active = useSharedValue(false);

  const gesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startX.value = translateX.value;
      startY.value = translateY.value;
      active.value = true;
    })
    .onUpdate(e => {
      'worklet';
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    })
    .onEnd(() => {
      'worklet';
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
    });

  const ballStyle = useAnimatedStyle(() => ({
    transform: [
      {translateX: translateX.value},
      {translateY: translateY.value},
    ],
    backgroundColor: active.value ? Colors.secondary : Colors.primary,
    shadowColor: active.value ? Colors.secondary : Colors.primary,
  }));

  const dots: {x: number; y: number}[] = [];
  for (let gx = 0; gx <= GRID_AREA - BALL_SIZE; gx += GRID_SIZE) {
    for (let gy = 0; gy <= GRID_AREA - BALL_SIZE; gy += GRID_SIZE) {
      dots.push({x: gx + BALL_SIZE / 2, y: gy + BALL_SIZE / 2});
    }
  }

  return (
    <Section title="Gesture Snap">
      <Text style={s.desc}>
        Drag the ball — it snaps to the nearest grid point with spring physics.
      </Text>
      <View style={s.gridWrap}>
        {dots.map((d, i) => (
          <View
            key={i}
            style={[s.dot, {left: d.x - 3, top: d.y - 3}]}
          />
        ))}
        <GestureDetector gesture={gesture}>
          <Animated.View style={[s.ball, ballStyle]} />
        </GestureDetector>
      </View>
    </Section>
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
    <Section title="Scroll-Driven">
      <Text style={s.desc}>
        Scroll the list — header height, title scale & parallax respond
        entirely on the UI thread.
      </Text>
      <View style={s.scrollBox}>
        <Animated.View style={[s.scrollHeader, headerStyle]}>
          <Animated.View style={[s.parallaxCircle, parallaxStyle]} />
          <Animated.Text style={[s.scrollTitle, titleStyle]}>
            {'\u2728'} Scroll Me
          </Animated.Text>
        </Animated.View>
        <Animated.ScrollView
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
                  {backgroundColor: Neon[i % Neon.length]},
                ]}
              />
              <Text style={s.scrollItemText}>{t}</Text>
            </View>
          ))}
        </Animated.ScrollView>
      </View>
    </Section>
  );
}

/* ════════════════════════════════════════════
   4. Layout Animations
   ════════════════════════════════════════════ */
let _nextId = 5;
const LAY_COLORS = [
  Colors.primary,
  Colors.secondary,
  Colors.accent,
  Colors.success,
  Colors.warning,
  Colors.orange,
];

function LayoutAnimationsDemo() {
  const [items, setItems] = useState([
    {id: 1, label: 'React', color: Colors.primary},
    {id: 2, label: 'Native', color: Colors.secondary},
    {id: 3, label: 'Reanimated', color: Colors.accent},
    {id: 4, label: 'Worklets', color: Colors.success},
  ]);

  const addItem = useCallback(() => {
    const id = _nextId++;
    setItems(prev => [
      {id, label: `Item ${id}`, color: LAY_COLORS[id % LAY_COLORS.length]},
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
    <Section title="Layout Animations">
      <Text style={s.desc}>
        Items enter with FadeInUp, exit with FadeOutDown, and reorder with
        Layout.springify().
      </Text>
      <View style={s.layoutBtns}>
        <Pressable
          style={[s.pillBtn, {backgroundColor: Colors.success + '30'}]}
          onPress={addItem}>
          <Text style={[s.pillText, {color: Colors.success}]}>+ Add</Text>
        </Pressable>
        <Pressable
          style={[s.pillBtn, {backgroundColor: Colors.accent + '30'}]}
          onPress={shuffle}>
          <Text style={[s.pillText, {color: Colors.accent}]}>
            {'\u21C4'} Shuffle
          </Text>
        </Pressable>
      </View>
      {items.map(it => (
        <Animated.View
          key={it.id}
          entering={FadeInUp.springify().damping(15)}
          exiting={FadeOutDown.duration(300)}
          layout={Layout.springify()}
          style={[s.layoutCard, {borderLeftColor: it.color}]}>
          <Text style={s.layoutLabel}>{it.label}</Text>
          <Pressable onPress={() => removeItem(it.id)} hitSlop={8}>
            <Text style={s.removeX}>{'\u2715'}</Text>
          </Pressable>
        </Animated.View>
      ))}
    </Section>
  );
}

/* ════════════════════════════════════════════
   5. Animation Builders — Spring vs Timing vs Decay
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
    <Section title="Animation Builders">
      <Text style={s.desc}>
        Same distance, different feel — Spring bounces, Timing glides, Decay
        coasts to a stop.
      </Text>
      <Pressable
        style={[
          s.pillBtn,
          {
            backgroundColor: Colors.primary + '30',
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
          {label: 'Timing', anim: tStyle, color: Colors.accent},
          {label: 'Decay', anim: dStyle, color: Colors.secondary},
        ].map(b => (
          <View key={b.label} style={s.builderCol}>
            <Text style={[s.builderLabel, {color: b.color}]}>{b.label}</Text>
            <View style={s.builderTrack}>
              <Animated.View
                style={[
                  s.builderBall,
                  {backgroundColor: b.color, shadowColor: b.color},
                  b.anim,
                ]}
              />
            </View>
          </View>
        ))}
      </View>
    </Section>
  );
}

/* ════════════════════════════════════════════
   6. Interpolation Showcase
   ════════════════════════════════════════════ */
function InterpolationDemo() {
  const progress = useSharedValue(0);
  const startVal = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      startVal.value = progress.value;
    })
    .onUpdate(e => {
      'worklet';
      progress.value = Math.max(
        0,
        Math.min(1, startVal.value + e.translationX / SLIDER_W),
      );
    });

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
        Colors.accent,
        Colors.warning,
        Colors.secondary,
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
    <Section title="Interpolation">
      <Text style={s.desc}>
        Drag horizontally — one shared value drives color, size, rotation &
        border-radius simultaneously.
      </Text>
      <View style={s.center}>
        <Animated.View style={[s.interpBox, boxStyle]} />
      </View>
      <GestureDetector gesture={gesture}>
        <View style={s.interpTrack}>
          <Animated.View style={[s.interpThumb, thumbStyle]} />
        </View>
      </GestureDetector>
      <View style={s.interpLabels}>
        <Text style={s.interpLbl}>0.0</Text>
        <Text style={s.interpLbl}>0.5</Text>
        <Text style={s.interpLbl}>1.0</Text>
      </View>
    </Section>
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

  const gesture = Gesture.Pan().onUpdate(e => {
    'worklet';
    raw.value = Math.max(0, Math.min(1, e.x / SLIDER_W));
  });

  const fillStyle = useAnimatedStyle(() => ({
    height: `${eased.value * 100}%`,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${eased.value * 360}deg`}],
  }));

  return (
    <Section title="Custom Worklet">
      <Text style={s.desc}>
        Two worklet functions (snapToStep & customEasing) run on the UI thread
        — drag to see the snapped circular progress.
      </Text>
      <View style={s.center}>
        <View style={s.progressOuter}>
          <Animated.View style={[s.progressFill, fillStyle]} />
          <Text style={s.progressPct}>{pct}%</Text>
          <Animated.View style={[s.progressRing, ringStyle]}>
            <View style={s.ringDot} />
          </Animated.View>
        </View>
      </View>
      <GestureDetector gesture={gesture}>
        <View style={s.workletTrack}>
          {[0, 25, 50, 75, 100].map(p => (
            <View
              key={p}
              style={[s.snapMark, {left: `${p}%`}]}>
              <View style={[s.snapDot, pct === p && s.snapDotActive]} />
              <Text style={s.snapLabel}>{p}</Text>
            </View>
          ))}
        </View>
      </GestureDetector>
      <View style={s.workletInfo}>
        <Text style={s.workletFn}>snapToStep(value, 0.25)</Text>
        <Text style={s.workletFn}>customEasing(t) — cubic in-out</Text>
      </View>
    </Section>
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
    paddingHorizontal: Spacing.lg,
  },
  heroIcon: {fontSize: 36, marginBottom: Spacing.sm},
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.white,
    letterSpacing: 1,
  },
  heroSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  desc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  center: {alignItems: 'center', marginVertical: Spacing.lg},
  badge: {
    alignSelf: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginTop: Spacing.md,
  },
  badgeText: {fontSize: 11, color: Colors.success, fontWeight: '600'},

  /* Demo 1 */
  sharedBox: {width: 100, height: 100, elevation: 8},
  sliderTrack: {
    width: SLIDER_W,
    height: 40,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    alignSelf: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.primary + '30',
    borderRadius: Radius.md,
  },
  sliderThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  /* Demo 2 */
  gridWrap: {
    width: GRID_AREA,
    height: GRID_AREA,
    alignSelf: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginVertical: Spacing.md,
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  ball: {
    position: 'absolute',
    width: BALL_SIZE,
    height: BALL_SIZE,
    borderRadius: BALL_SIZE / 2,
    elevation: 8,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },

  /* Demo 3 */
  scrollBox: {
    height: 300,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
    marginVertical: Spacing.md,
  },
  scrollHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: Colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  parallaxCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    right: -20,
    top: -10,
  },
  scrollTitle: {fontSize: 20, fontWeight: '700', color: Colors.white},
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
    backgroundColor: Colors.surface,
    borderRadius: 2,
    alignItems: 'center',
  },
  builderBall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    elevation: 6,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },

  /* Demo 6 */
  interpBox: {elevation: 8},
  interpTrack: {
    width: SLIDER_W,
    height: 44,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  interpThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    elevation: 4,
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
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.border,
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.primary + '40',
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
    backgroundColor: Colors.border,
    marginBottom: 4,
  },
  snapDotActive: {backgroundColor: Colors.primary},
  snapLabel: {fontSize: 9, color: Colors.textMuted},
  workletInfo: {alignSelf: 'center', marginTop: Spacing.md},
  workletFn: {
    fontSize: 11,
    color: Colors.accent,
    fontFamily: 'monospace',
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
    backgroundColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  footerText: {fontSize: 12, color: Colors.textMuted},
});
```

**Step 2: Verify build**

```bash
cd "c:/Dev/ReactShowCase/React Android"
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/screens/ReanimatedScreen.tsx
git commit -m "feat(android): implement ReanimatedScreen with 7 worklet demos"
```

---

## Task 6: Implement ReanimatedScreen (Windows)

**Files:**
- Replace: `React Windows/src/screens/ReanimatedScreen.tsx`

**Step 1: Write the complete screen**

The Windows version uses the same Reanimated APIs but:
- Uses `SectionWrapper` instead of `Section`
- Uses `PanResponder` instead of RNGH `GestureDetector` (RNGH has limited Windows support)
- Uses the light Fluent Design theme
- Uses `fluentShadow` for elevation

```tsx
import React, {useCallback, useMemo, useRef, useState} from 'react';
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
        <Animated.View style={[s.sharedBox, boxStyle]} />
      </View>
      <View style={s.sliderTrack} {...panResponder.panHandlers}>
        <Animated.View style={[s.sliderFill, fillStyle]} />
        <Animated.View style={[s.sliderThumb, thumbStyle]} />
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
        <Animated.View
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
        <Animated.View style={[s.scrollHeader, headerStyle]}>
          <Animated.View style={[s.parallaxCircle, parallaxStyle]} />
          <Animated.Text style={[s.scrollTitle, titleStyle]}>
            {'\u2728'} Scroll Me
          </Animated.Text>
        </Animated.View>
        <Animated.ScrollView
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
        <Animated.View
          key={it.id}
          entering={FadeInUp.springify().damping(15)}
          exiting={FadeOutDown.duration(300)}
          layout={Layout.springify()}
          style={[s.layoutCard, {borderLeftColor: it.color}]}>
          <Text style={s.layoutLabel}>{it.label}</Text>
          <Pressable onPress={() => removeItem(it.id)} hitSlop={8}>
            <Text style={s.removeX}>{'\u2715'}</Text>
          </Pressable>
        </Animated.View>
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
              <Animated.View
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
        <Animated.View style={[s.interpBox, boxStyle]} />
      </View>
      <View style={s.interpTrack} {...panResponder.panHandlers}>
        <Animated.View style={[s.interpThumb, thumbStyle]} />
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
          <Animated.View style={[s.progressFill, fillStyle]} />
          <Text style={s.progressPct}>{pct}%</Text>
          <Animated.View style={[s.progressRing, ringStyle]}>
            <View style={s.ringDot} />
          </Animated.View>
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
```

**Step 2: Verify build**

```bash
cd "c:/Dev/ReactShowCase/React Windows"
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add src/screens/ReanimatedScreen.tsx
git commit -m "feat(windows): implement ReanimatedScreen with 7 worklet demos"
```

---

## Task 7: Update SHOWCASE_PLAN.md and final commit

**Files:**
- Modify: `SHOWCASE_PLAN.md`

**Step 1: Mark the item as done**

Change line 204 from:

```
- [ ] Reanimated 2/3 worklets para animações de alta performance
```

to:

```
- [x] Reanimated 2/3 worklets para animações de alta performance
```

**Step 2: Commit**

```bash
git add SHOWCASE_PLAN.md
git commit -m "docs: mark Reanimated worklets as completed in showcase plan"
```
