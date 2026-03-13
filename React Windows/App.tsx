/**
 * CFD Windows - React Native Graphical Showcase
 * A comprehensive demonstration of React Native's rendering capabilities
 * on Windows Desktop (React Native Windows 0.75)
 *
 * Uses ONLY built-in React Native APIs - no external dependencies.
 */

import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ─── Constants ───────────────────────────────────────────────────────────────

const ACCENT = '#0078d4';
const ACCENT_LIGHT = '#60cdff';
const ACCENT_DARK = '#005a9e';
const PURPLE = '#8764b8';
const PURPLE_LIGHT = '#b4a0ff';
const SURFACE = '#f3f3f3';
const SURFACE_CARD = '#ffffff';
const SURFACE_SMOKE = 'rgba(255,255,255,0.72)';
const TEXT_PRIMARY = '#1a1a1a';
const TEXT_SECONDARY = '#616161';
const BORDER_SUBTLE = 'rgba(0,0,0,0.06)';
const SHADOW_COLOR = 'rgba(0,0,0,0.08)';
const RADIUS = 8;
const RADIUS_LG = 12;

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Utility: useAnimatedValue ───────────────────────────────────────────────

function useAnimatedValue(initial: number) {
  const ref = useRef(new Animated.Value(initial));
  return ref.current;
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function SectionWrapper({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const fadeAnim = useAnimatedValue(0);
  const slideAnim = useAnimatedValue(30);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.sectionWrapper,
        {opacity: fadeAnim, transform: [{translateY: slideAnim}]},
      ]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? (
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      ) : null}
      {children}
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ANIMATED HEADER
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedHeader() {
  const pulse = useAnimatedValue(0);
  const shimmer = useAnimatedValue(0);
  const morphA = useAnimatedValue(0);
  const morphB = useAnimatedValue(0);
  const titleScale = useAnimatedValue(0.8);
  const titleOpacity = useAnimatedValue(0);

  useEffect(() => {
    // Background pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start();

    // Shimmer sweep
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Morph blobs
    Animated.loop(
      Animated.sequence([
        Animated.timing(morphA, {
          toValue: 1,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(morphA, {
          toValue: 0,
          duration: 5000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(morphB, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(morphB, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Title entrance
    Animated.parallel([
      Animated.spring(titleScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
        delay: 300,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pulse, shimmer, morphA, morphB, titleScale, titleOpacity]);

  const bgColor = pulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [ACCENT, '#6b5ce7', ACCENT_DARK],
  });

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, SCREEN_WIDTH + 300],
  });

  const blobAX = morphA.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 60],
  });
  const blobAY = morphA.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -30],
  });
  const blobAScale = morphA.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.3, 1],
  });

  const blobBX = morphB.interpolate({
    inputRange: [0, 1],
    outputRange: [40, -50],
  });
  const blobBY = morphB.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 40],
  });
  const blobBScale = morphB.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1.2, 0.8, 1.2],
  });

  return (
    <Animated.View style={[styles.header, {backgroundColor: bgColor}]}>
      {/* Floating blobs for depth */}
      <Animated.View
        style={[
          styles.headerBlob,
          styles.headerBlobA,
          {
            transform: [
              {translateX: blobAX},
              {translateY: blobAY},
              {scale: blobAScale},
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.headerBlob,
          styles.headerBlobB,
          {
            transform: [
              {translateX: blobBX},
              {translateY: blobBY},
              {scale: blobBScale},
            ],
          },
        ]}
      />
      {/* Shimmer highlight */}
      <Animated.View
        style={[
          styles.headerShimmer,
          {transform: [{translateX: shimmerTranslate}]},
        ]}
      />
      {/* Title content */}
      <Animated.View
        style={[
          styles.headerContent,
          {
            opacity: titleOpacity,
            transform: [{scale: titleScale}],
          },
        ]}>
        <Text style={styles.headerIcon}>{'{ }'}</Text>
        <Text style={styles.headerTitle}>CFD Windows</Text>
        <Text style={styles.headerTagline}>
          React Native Graphical Showcase
        </Text>
        <View style={styles.headerDivider} />
        <Text style={styles.headerVersion}>
          Built with React Native 0.75 for Windows Desktop
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DESKTOP WIDGETS (Windows 11 Style)
// ═══════════════════════════════════════════════════════════════════════════════

function AcrylicCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.acrylicCard, style]}>
      {/* Noise/frost overlay simulation */}
      <View style={styles.acrylicOverlay} />
      <View style={styles.acrylicContent}>{children}</View>
    </View>
  );
}

function WeatherWidget() {
  const tempAnim = useAnimatedValue(0);
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tempAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(tempAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [tempAnim]);

  const sunRotate = tempAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <AcrylicCard style={styles.widgetCard}>
      <View style={styles.widgetHeader}>
        <Animated.Text
          style={[
            styles.widgetIcon,
            {transform: [{rotate: sunRotate}]},
          ]}>
          {'*'}
        </Animated.Text>
        <Text style={styles.widgetLabel}>Weather</Text>
      </View>
      <Text style={styles.widgetTemp}>22 C</Text>
      <Text style={styles.widgetDesc}>Partly Cloudy</Text>
      <View style={styles.widgetRow}>
        <View style={styles.widgetMiniStat}>
          <Text style={styles.widgetMiniLabel}>Humidity</Text>
          <Text style={styles.widgetMiniValue}>65%</Text>
        </View>
        <View style={styles.widgetMiniStat}>
          <Text style={styles.widgetMiniLabel}>Wind</Text>
          <Text style={styles.widgetMiniValue}>12 km/h</Text>
        </View>
      </View>
    </AcrylicCard>
  );
}

function StocksWidget() {
  const barAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        delay: i * 150,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    );
    Animated.stagger(100, animations).start();
  }, [barAnims]);

  const stockData = [
    {name: 'MSFT', value: 72, change: '+2.4%', up: true},
    {name: 'AAPL', value: 55, change: '+1.1%', up: true},
    {name: 'GOOG', value: 88, change: '-0.3%', up: false},
    {name: 'AMZN', value: 65, change: '+3.2%', up: true},
  ];

  return (
    <AcrylicCard style={styles.widgetCard}>
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetIconText}>$</Text>
        <Text style={styles.widgetLabel}>Markets</Text>
      </View>
      {stockData.map((stock, i) => {
        const barWidth = barAnims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, stock.value * 1.5],
        });
        return (
          <View key={stock.name} style={styles.stockRow}>
            <Text style={styles.stockName}>{stock.name}</Text>
            <View style={styles.stockBarBg}>
              <Animated.View
                style={[
                  styles.stockBar,
                  {
                    width: barWidth,
                    backgroundColor: stock.up ? '#10b981' : '#ef4444',
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.stockChange,
                {color: stock.up ? '#10b981' : '#ef4444'},
              ]}>
              {stock.change}
            </Text>
          </View>
        );
      })}
    </AcrylicCard>
  );
}

function CalendarWidget() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = 13;
  return (
    <AcrylicCard style={styles.widgetCard}>
      <View style={styles.widgetHeader}>
        <Text style={styles.widgetIconText}>#</Text>
        <Text style={styles.widgetLabel}>March 2026</Text>
      </View>
      <View style={styles.calendarGrid}>
        {days.map((d, i) => (
          <Text key={`h-${i}`} style={styles.calendarDayHeader}>
            {d}
          </Text>
        ))}
        {Array.from({length: 31}, (_, i) => i + 1).map(day => (
          <View
            key={day}
            style={[
              styles.calendarDay,
              day === today && styles.calendarDayToday,
            ]}>
            <Text
              style={[
                styles.calendarDayText,
                day === today && styles.calendarDayTextToday,
              ]}>
              {day}
            </Text>
          </View>
        ))}
      </View>
    </AcrylicCard>
  );
}

function DesktopWidgets() {
  return (
    <SectionWrapper
      title="Desktop Widgets"
      subtitle="Windows 11 acrylic-style cards with frosted glass effect">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.widgetScroll}>
        <WeatherWidget />
        <StocksWidget />
        <CalendarWidget />
      </ScrollView>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. INTERACTIVE ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedButton({
  label,
  color,
  icon,
}: {
  label: string;
  color: string;
  icon: string;
}) {
  const scaleAnim = useAnimatedValue(1);
  const bgAnim = useAnimatedValue(0);
  const glowAnim = useAnimatedValue(0);

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.93,
        friction: 4,
        tension: 200,
        useNativeDriver: true,
      }),
      Animated.timing(bgAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bgAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [color, shadeColor(color, -20)],
  });

  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 16],
  });

  return (
    <Pressable onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View
        style={[
          styles.animButton,
          {
            backgroundColor: bgColor,
            transform: [{scale: scaleAnim}],
            shadowRadius: shadowRadius,
            shadowColor: color,
            shadowOpacity: 0.4,
            shadowOffset: {width: 0, height: 2},
            elevation: 6,
          },
        ]}>
        <Text style={styles.animButtonIcon}>{icon}</Text>
        <Text style={styles.animButtonLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function SpringBall() {
  const posX = useAnimatedValue(0);
  const posY = useAnimatedValue(0);
  const scale = useAnimatedValue(1);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(scale, {
          toValue: 1.3,
          friction: 3,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event([null, {dx: posX, dy: posY}], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(posX, {
            toValue: 0,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(posY, {
            toValue: 0,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            friction: 3,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }),
  ).current;

  return (
    <View style={styles.springBallContainer}>
      <Text style={styles.springBallHint}>
        Drag the ball - it springs back!
      </Text>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.springBall,
          {
            transform: [
              {translateX: posX},
              {translateY: posY},
              {scale: scale},
            ],
          },
        ]}>
        <View style={styles.springBallInner}>
          <View style={styles.springBallHighlight} />
        </View>
      </Animated.View>
    </View>
  );
}

function PulseRing() {
  const ring1 = useAnimatedValue(0);
  const ring2 = useAnimatedValue(0);
  const ring3 = useAnimatedValue(0);

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    animate(ring1, 0);
    animate(ring2, 600);
    animate(ring3, 1200);
  }, [ring1, ring2, ring3]);

  const renderRing = (anim: Animated.Value) => {
    const ringScale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2.5],
    });
    const ringOpacity = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    });
    return (
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{scale: ringScale}],
            opacity: ringOpacity,
          },
        ]}
      />
    );
  };

  return (
    <View style={styles.pulseContainer}>
      {renderRing(ring1)}
      {renderRing(ring2)}
      {renderRing(ring3)}
      <View style={styles.pulseDot} />
    </View>
  );
}

function InteractiveAnimations() {
  return (
    <SectionWrapper
      title="Interactive Animations"
      subtitle="Spring physics, touch feedback, and animated effects">
      <View style={styles.animButtonRow}>
        <AnimatedButton label="Primary" color={ACCENT} icon=">" />
        <AnimatedButton label="Success" color="#10b981" icon="+" />
        <AnimatedButton label="Warning" color="#f59e0b" icon="!" />
        <AnimatedButton label="Danger" color="#ef4444" icon="X" />
      </View>
      <View style={styles.animDemoRow}>
        <SpringBall />
        <PulseRing />
      </View>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. DRAWING CANVAS
// ═══════════════════════════════════════════════════════════════════════════════

interface Point {
  x: number;
  y: number;
}
interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

function DrawingCanvas() {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [brushColor, setBrushColor] = useState(ACCENT);
  const [brushWidth, setBrushWidth] = useState(3);

  const colors = [ACCENT, '#ef4444', '#10b981', '#f59e0b', PURPLE, '#1a1a1a'];
  const widths = [2, 3, 5, 8];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: evt => {
        const {locationX, locationY} = evt.nativeEvent;
        const newStroke: Stroke = {
          points: [{x: locationX, y: locationY}],
          color: brushColor,
          width: brushWidth,
        };
        setCurrentStroke(newStroke);
      },
      onPanResponderMove: evt => {
        const {locationX, locationY} = evt.nativeEvent;
        setCurrentStroke(prev => {
          if (!prev) return null;
          return {
            ...prev,
            points: [...prev.points, {x: locationX, y: locationY}],
          };
        });
      },
      onPanResponderRelease: () => {
        setCurrentStroke(prev => {
          if (prev) {
            setStrokes(s => [...s, prev]);
          }
          return null;
        });
      },
    }),
  ).current;

  const allStrokes = currentStroke
    ? [...strokes, currentStroke]
    : strokes;

  return (
    <SectionWrapper
      title="Drawing Canvas"
      subtitle="PanResponder-based drawing with color and brush controls">
      {/* Toolbar */}
      <View style={styles.canvasToolbar}>
        <View style={styles.canvasToolGroup}>
          <Text style={styles.canvasToolLabel}>Color:</Text>
          {colors.map(c => (
            <Pressable
              key={c}
              onPress={() => setBrushColor(c)}
              style={[
                styles.canvasColorBtn,
                {backgroundColor: c},
                brushColor === c && styles.canvasColorBtnActive,
              ]}
            />
          ))}
        </View>
        <View style={styles.canvasToolGroup}>
          <Text style={styles.canvasToolLabel}>Size:</Text>
          {widths.map(w => (
            <Pressable
              key={w}
              onPress={() => setBrushWidth(w)}
              style={[
                styles.canvasSizeBtn,
                brushWidth === w && styles.canvasSizeBtnActive,
              ]}>
              <View
                style={[
                  styles.canvasSizeDot,
                  {
                    width: w * 2 + 4,
                    height: w * 2 + 4,
                    borderRadius: w + 2,
                    backgroundColor:
                      brushWidth === w ? ACCENT : TEXT_SECONDARY,
                  },
                ]}
              />
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={() => {
            setStrokes([]);
            setCurrentStroke(null);
          }}
          style={styles.canvasClearBtn}>
          <Text style={styles.canvasClearText}>Clear</Text>
        </Pressable>
      </View>
      {/* Canvas */}
      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <View style={styles.canvasInner}>
          {/* Grid dots for visual reference */}
          {Array.from({length: 8}, (_, row) =>
            Array.from({length: 12}, (_, col) => (
              <View
                key={`${row}-${col}`}
                style={[
                  styles.canvasGridDot,
                  {
                    left: (col + 1) * (100 / 13) + '%' as any,
                    top: (row + 1) * (100 / 9) + '%' as any,
                  },
                ]}
              />
            )),
          )}
          {/* Render strokes as series of dots */}
          {allStrokes.map((stroke, si) =>
            stroke.points.map((point, pi) => (
              <View
                key={`${si}-${pi}`}
                style={[
                  styles.canvasDot,
                  {
                    left: point.x - stroke.width,
                    top: point.y - stroke.width,
                    width: stroke.width * 2,
                    height: stroke.width * 2,
                    borderRadius: stroke.width,
                    backgroundColor: stroke.color,
                  },
                ]}
              />
            )),
          )}
          {strokes.length === 0 && !currentStroke && (
            <View style={styles.canvasPlaceholder}>
              <Text style={styles.canvasPlaceholderIcon}>~</Text>
              <Text style={styles.canvasPlaceholderText}>
                Draw here with mouse or touch
              </Text>
            </View>
          )}
        </View>
      </View>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. 3D TRANSFORMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function FlipCard({
  frontTitle,
  frontDesc,
  backTitle,
  backDesc,
  color,
}: {
  frontTitle: string;
  frontDesc: string;
  backTitle: string;
  backDesc: string;
  color: string;
}) {
  const flipAnim = useAnimatedValue(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  return (
    <Pressable onPress={handleFlip} style={styles.flipCardWrapper}>
      {/* Front */}
      <Animated.View
        style={[
          styles.flipCard,
          {
            backgroundColor: color,
            opacity: frontOpacity,
            transform: [{perspective: 1000}, {rotateY: frontRotate}],
          },
        ]}>
        <Text style={styles.flipCardTitle}>{frontTitle}</Text>
        <Text style={styles.flipCardDesc}>{frontDesc}</Text>
        <Text style={styles.flipCardHint}>Tap to flip</Text>
      </Animated.View>
      {/* Back */}
      <Animated.View
        style={[
          styles.flipCard,
          styles.flipCardBack,
          {
            backgroundColor: shadeColor(color, -30),
            opacity: backOpacity,
            transform: [{perspective: 1000}, {rotateY: backRotate}],
          },
        ]}>
        <Text style={styles.flipCardTitle}>{backTitle}</Text>
        <Text style={styles.flipCardDesc}>{backDesc}</Text>
      </Animated.View>
    </Pressable>
  );
}

function SpinningCube() {
  const rotateX = useAnimatedValue(0);
  const rotateY = useAnimatedValue(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateY, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateX, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotateX, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [rotateX, rotateY]);

  const yRotation = rotateY.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const xRotation = rotateX.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg'],
  });

  const faces = [
    {label: 'Front', color: ACCENT, tz: 40},
    {label: 'Right', color: PURPLE, tz: 40},
    {label: 'Top', color: '#10b981', tz: 40},
  ];

  return (
    <View style={styles.cubeContainer}>
      <Animated.View
        style={[
          styles.cubeWrapper,
          {
            transform: [
              {perspective: 600},
              {rotateX: xRotation},
              {rotateY: yRotation},
            ],
          },
        ]}>
        {faces.map((face, i) => (
          <View
            key={face.label}
            style={[
              styles.cubeFace,
              {
                backgroundColor: face.color,
                opacity: 0.85,
              },
            ]}>
            <Text style={styles.cubeFaceText}>{face.label}</Text>
          </View>
        ))}
      </Animated.View>
      <Text style={styles.cubeLabel}>3D Rotation</Text>
    </View>
  );
}

function ThreeDTransformations() {
  return (
    <SectionWrapper
      title="3D Transformations"
      subtitle="Perspective rotations, flip cards, and animated cube">
      <View style={styles.threeDRow}>
        <FlipCard
          frontTitle="Design"
          frontDesc="Modern UI with depth"
          backTitle="Windows 11"
          backDesc="Fluent Design System"
          color={ACCENT}
        />
        <FlipCard
          frontTitle="Perform"
          frontDesc="60 FPS animations"
          backTitle="Native"
          backDesc="Hardware accelerated"
          color={PURPLE}
        />
        <FlipCard
          frontTitle="Create"
          frontDesc="Stunning visuals"
          backTitle="React Native"
          backDesc="Cross-platform power"
          color="#10b981"
        />
      </View>
      <View style={styles.cubeSection}>
        <SpinningCube />
      </View>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SYSTEM CAPABILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function CapabilityCard({
  icon,
  title,
  description,
  color,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  const slideAnim = useAnimatedValue(0);
  const scaleAnim = useAnimatedValue(1);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 600,
      delay,
      easing: Easing.out(Easing.back(1.2)),
      useNativeDriver: true,
    }).start();
  }, [slideAnim, delay]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  return (
    <Pressable
      onPressIn={() =>
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          friction: 5,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start()
      }>
      <Animated.View
        style={[
          styles.capCard,
          {
            opacity: slideAnim,
            transform: [{translateY}, {scale: scaleAnim}],
          },
        ]}>
        <View style={[styles.capIconBg, {backgroundColor: color + '18'}]}>
          <Text style={[styles.capIcon, {color}]}>{icon}</Text>
        </View>
        <Text style={styles.capTitle}>{title}</Text>
        <Text style={styles.capDesc}>{description}</Text>
        <View style={[styles.capAccent, {backgroundColor: color}]} />
      </Animated.View>
    </Pressable>
  );
}

function SystemCapabilities() {
  const capabilities = [
    {
      icon: '[F]',
      title: 'File System',
      description: 'Full Win32 FS access, read/write files and directories',
      color: ACCENT,
    },
    {
      icon: '[R]',
      title: 'Registry',
      description: 'Read and write Windows Registry keys and values',
      color: PURPLE,
    },
    {
      icon: '[N]',
      title: 'Notifications',
      description: 'Native Windows toast notifications and action center',
      color: '#f59e0b',
    },
    {
      icon: '[C]',
      title: 'Clipboard',
      description: 'System clipboard with rich content support',
      color: '#10b981',
    },
    {
      icon: '[S]',
      title: 'System Info',
      description: 'CPU, memory, display info and OS version details',
      color: '#ef4444',
    },
    {
      icon: '[W]',
      title: 'Window Mgmt',
      description: 'Control window size, position, and state',
      color: '#6366f1',
    },
  ];

  return (
    <SectionWrapper
      title="System Capabilities"
      subtitle="Windows-specific features available through native modules">
      <View style={styles.capGrid}>
        {capabilities.map((cap, i) => (
          <CapabilityCard key={cap.title} {...cap} delay={i * 100} />
        ))}
      </View>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. DATA VISUALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

function BarChart() {
  const barAnims = useRef(
    Array.from({length: 7}, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 800,
        delay: i * 80,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    );
    Animated.stagger(60, animations).start();
  }, [barAnims]);

  const data = [
    {label: 'Mon', value: 65, color: ACCENT},
    {label: 'Tue', value: 85, color: ACCENT},
    {label: 'Wed', value: 45, color: ACCENT_LIGHT},
    {label: 'Thu', value: 95, color: ACCENT},
    {label: 'Fri', value: 70, color: ACCENT},
    {label: 'Sat', value: 35, color: ACCENT_LIGHT},
    {label: 'Sun', value: 55, color: ACCENT_LIGHT},
  ];

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Weekly Activity</Text>
      <View style={styles.barChartContainer}>
        {/* Y-axis labels */}
        <View style={styles.barChartYAxis}>
          {[100, 75, 50, 25, 0].map(v => (
            <Text key={v} style={styles.barChartYLabel}>
              {v}
            </Text>
          ))}
        </View>
        {/* Bars */}
        <View style={styles.barChartBars}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(v => (
            <View
              key={v}
              style={[
                styles.barChartGridLine,
                {bottom: `${v}%`},
              ]}
            />
          ))}
          {data.map((item, i) => {
            const barHeight = barAnims[i].interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', `${item.value}%`],
            });
            return (
              <View key={item.label} style={styles.barChartBarCol}>
                <View style={styles.barChartBarWrapper}>
                  <Animated.View
                    style={[
                      styles.barChartBar,
                      {
                        height: barHeight,
                        backgroundColor: item.color,
                      },
                    ]}>
                    <Text style={styles.barChartBarValue}>{item.value}</Text>
                  </Animated.View>
                </View>
                <Text style={styles.barChartLabel}>{item.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function PieChartSegment({
  percentage,
  color,
  label,
  animDelay,
}: {
  percentage: number;
  color: string;
  label: string;
  animDelay: number;
}) {
  const anim = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 1000,
      delay: animDelay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim, animDelay]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.pieSegment,
        {transform: [{scale}]},
      ]}>
      <View
        style={[
          styles.pieSegmentBar,
          {
            backgroundColor: color,
            width: `${percentage}%`,
          },
        ]}
      />
      <View style={styles.pieSegmentInfo}>
        <View style={[styles.pieLegendDot, {backgroundColor: color}]} />
        <Text style={styles.pieSegmentLabel}>{label}</Text>
        <Text style={styles.pieSegmentValue}>{percentage}%</Text>
      </View>
    </Animated.View>
  );
}

function DonutChart() {
  const rotateAnim = useAnimatedValue(0);
  const scaleAnim = useAnimatedValue(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [rotateAnim, scaleAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const segments = [
    {pct: 35, color: ACCENT, label: 'React Native'},
    {pct: 25, color: PURPLE, label: 'Native Modules'},
    {pct: 20, color: '#10b981', label: 'UI Components'},
    {pct: 12, color: '#f59e0b', label: 'Animations'},
    {pct: 8, color: '#ef4444', label: 'Other'},
  ];

  // Build donut as stacked arcs represented by colored borders
  let accumulated = 0;

  return (
    <View style={styles.donutContainer}>
      <Animated.View
        style={[
          styles.donutRing,
          {transform: [{rotate: rotation}]},
        ]}>
        {segments.map((seg, i) => {
          const startAngle = (accumulated / 100) * 360;
          accumulated += seg.pct;
          // Represent each segment as a colored arc segment
          return (
            <View
              key={i}
              style={[
                styles.donutSegment,
                {
                  borderColor: seg.color,
                  transform: [{rotate: `${startAngle}deg`}],
                  borderTopWidth: seg.pct > 20 ? 18 : 14,
                },
              ]}
            />
          );
        })}
      </Animated.View>
      <Animated.View
        style={[
          styles.donutCenter,
          {transform: [{scale: scaleAnim}]},
        ]}>
        <Text style={styles.donutCenterValue}>100%</Text>
        <Text style={styles.donutCenterLabel}>Total</Text>
      </Animated.View>
    </View>
  );
}

function LineChart() {
  const lineAnim = useAnimatedValue(0);

  useEffect(() => {
    Animated.timing(lineAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [lineAnim]);

  const dataPoints = [30, 55, 40, 75, 60, 90, 70, 85, 95, 80];
  const maxVal = 100;
  const chartHeight = 120;
  const chartWidth = SCREEN_WIDTH - 100;
  const stepX = chartWidth / (dataPoints.length - 1);

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Performance Trend</Text>
      <View style={[styles.lineChartContainer, {height: chartHeight + 30}]}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => (
          <View
            key={v}
            style={[
              styles.lineChartGrid,
              {bottom: (v / maxVal) * chartHeight + 20},
            ]}
          />
        ))}
        {/* Data points and connectors */}
        {dataPoints.map((val, i) => {
          const x = i * stepX;
          const y = (val / maxVal) * chartHeight;
          const dotOpacity = lineAnim.interpolate({
            inputRange: [
              Math.max(0, (i - 1) / dataPoints.length),
              i / dataPoints.length,
              1,
            ],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
          });
          const dotScale = lineAnim.interpolate({
            inputRange: [
              Math.max(0, (i - 1) / dataPoints.length),
              i / dataPoints.length,
              1,
            ],
            outputRange: [0, 1, 1],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[
                styles.lineChartDot,
                {
                  left: x + 30,
                  bottom: y + 16,
                  opacity: dotOpacity,
                  transform: [{scale: dotScale}],
                },
              ]}>
              <View style={styles.lineChartDotInner} />
              {/* Vertical line to base */}
              <View
                style={[
                  styles.lineChartStem,
                  {height: y},
                ]}
              />
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

function DataVisualization() {
  const pieData = [
    {percentage: 35, color: ACCENT, label: 'Desktop'},
    {percentage: 25, color: PURPLE, label: 'Mobile'},
    {percentage: 20, color: '#10b981', label: 'Tablet'},
    {percentage: 12, color: '#f59e0b', label: 'Watch'},
    {percentage: 8, color: '#ef4444', label: 'Other'},
  ];

  return (
    <SectionWrapper
      title="Data Visualization"
      subtitle="Charts built entirely with Views and Animated APIs">
      <BarChart />
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Distribution Breakdown</Text>
        <View style={styles.pieChartContainer}>
          <DonutChart />
          <View style={styles.pieSegments}>
            {pieData.map((d, i) => (
              <PieChartSegment
                key={d.label}
                percentage={d.percentage}
                color={d.color}
                label={d.label}
                animDelay={i * 150}
              />
            ))}
          </View>
        </View>
      </View>
      <LineChart />
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. WINDOW CONTROLS DEMO
// ═══════════════════════════════════════════════════════════════════════════════

function WindowControlsDemo() {
  const [isMaximized, setIsMaximized] = useState(false);
  const scaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const handleButtonPress = (index: number) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.8,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    if (index === 1) {
      setIsMaximized(!isMaximized);
    }
  };

  return (
    <SectionWrapper
      title="Window Controls"
      subtitle="Windows 11 style title bar with interactive controls">
      <View style={styles.windowFrame}>
        {/* Title bar */}
        <View style={styles.windowTitleBar}>
          <View style={styles.windowTitleLeft}>
            <View style={styles.windowAppIcon}>
              <Text style={styles.windowAppIconText}>{'{ }'}</Text>
            </View>
            <Text style={styles.windowTitleText}>CFD Windows - Showcase</Text>
          </View>
          <View style={styles.windowControls}>
            {/* Minimize */}
            <Pressable
              onPress={() => handleButtonPress(0)}
              style={styles.windowCtrlBtn}>
              <Animated.View
                style={{transform: [{scale: scaleAnims[0]}]}}>
                <View style={styles.windowMinimizeIcon} />
              </Animated.View>
            </Pressable>
            {/* Maximize/Restore */}
            <Pressable
              onPress={() => handleButtonPress(1)}
              style={styles.windowCtrlBtn}>
              <Animated.View
                style={{transform: [{scale: scaleAnims[1]}]}}>
                {isMaximized ? (
                  <View style={styles.windowRestoreIcon}>
                    <View style={styles.windowRestoreBack} />
                    <View style={styles.windowRestoreFront} />
                  </View>
                ) : (
                  <View style={styles.windowMaximizeIcon} />
                )}
              </Animated.View>
            </Pressable>
            {/* Close */}
            <Pressable
              onPress={() => handleButtonPress(2)}
              style={[styles.windowCtrlBtn, styles.windowCloseBtn]}>
              <Animated.View
                style={{transform: [{scale: scaleAnims[2]}]}}>
                <Text style={styles.windowCloseX}>x</Text>
              </Animated.View>
            </Pressable>
          </View>
        </View>
        {/* Window content */}
        <View style={styles.windowContent}>
          <View style={styles.windowSidebar}>
            {['Home', 'Settings', 'About', 'Help'].map((item, i) => (
              <View
                key={item}
                style={[
                  styles.windowNavItem,
                  i === 0 && styles.windowNavItemActive,
                ]}>
                <Text
                  style={[
                    styles.windowNavText,
                    i === 0 && styles.windowNavTextActive,
                  ]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.windowMainArea}>
            <Text style={styles.windowMainTitle}>Welcome</Text>
            <Text style={styles.windowMainText}>
              This simulates a Windows 11 application window with native-style
              title bar, navigation sidebar, and content area. All built with
              React Native Views.
            </Text>
            <View style={styles.windowStatusBar}>
              <View style={styles.windowStatusDot} />
              <Text style={styles.windowStatusText}>Connected</Text>
              <Text style={styles.windowStatusRight}>v0.75.20</Text>
            </View>
          </View>
        </View>
      </View>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. GRID LAYOUT WITH STAGGERED ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function GridTile({
  color,
  label,
  index,
}: {
  color: string;
  label: string;
  index: number;
}) {
  const anim = useAnimatedValue(0);
  const scaleAnim = useAnimatedValue(1);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      delay: index * 60,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [60, 0],
  });

  return (
    <Pressable
      onPressIn={() =>
        Animated.spring(scaleAnim, {
          toValue: 0.9,
          friction: 5,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }).start()
      }>
      <Animated.View
        style={[
          styles.gridTile,
          {
            backgroundColor: color,
            opacity: anim,
            transform: [{translateY}, {scale: scaleAnim}],
          },
        ]}>
        <Text style={styles.gridTileLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function GridLayout() {
  const tiles = [
    {color: ACCENT, label: 'A1'},
    {color: '#6366f1', label: 'B2'},
    {color: PURPLE, label: 'C3'},
    {color: '#10b981', label: 'D4'},
    {color: '#f59e0b', label: 'E5'},
    {color: '#ef4444', label: 'F6'},
    {color: '#ec4899', label: 'G7'},
    {color: '#14b8a6', label: 'H8'},
    {color: '#8b5cf6', label: 'I9'},
    {color: '#06b6d4', label: 'J10'},
    {color: '#84cc16', label: 'K11'},
    {color: '#f97316', label: 'L12'},
    {color: ACCENT_DARK, label: 'M13'},
    {color: '#a855f7', label: 'N14'},
    {color: '#22d3ee', label: 'O15'},
    {color: '#fb923c', label: 'P16'},
    {color: '#4ade80', label: 'Q17'},
    {color: '#f43f5e', label: 'R18'},
  ];

  return (
    <SectionWrapper
      title="Grid Layout"
      subtitle="Responsive tile grid with staggered entrance animations">
      <View style={styles.gridContainer}>
        {tiles.map((tile, i) => (
          <GridTile key={tile.label} {...tile} index={i} />
        ))}
      </View>
    </SectionWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════════

function Footer() {
  const fadeAnim = useAnimatedValue(0);
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.footer, {opacity: fadeAnim}]}>
      <View style={styles.footerDivider} />
      <Text style={styles.footerTitle}>CFD Windows Showcase</Text>
      <Text style={styles.footerText}>
        React Native 0.75 | React Native Windows 0.75.20
      </Text>
      <Text style={styles.footerText}>
        All visuals rendered using built-in React Native APIs only
      </Text>
      <Text style={styles.footerCopy}>
        CalcFund Development - 2026
      </Text>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════

function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <AnimatedHeader />
        <DesktopWidgets />
        <InteractiveAnimations />
        <DrawingCanvas />
        <ThreeDTransformations />
        <SystemCapabilities />
        <DataVisualization />
        <WindowControlsDemo />
        <GridLayout />
        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // ── Global ──
  safeArea: {
    flex: 1,
    backgroundColor: SURFACE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Section Wrapper ──
  sectionWrapper: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginBottom: 16,
    lineHeight: 20,
  },

  // ── 1. Animated Header ──
  header: {
    height: 260,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerBlob: {
    position: 'absolute',
    borderRadius: 100,
  },
  headerBlobA: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -30,
    right: -40,
  },
  headerBlobB: {
    width: 160,
    height: 160,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    left: -30,
  },
  headerShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: 'rgba(255,255,255,0.07)',
    transform: [{skewX: '-15deg'}],
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  headerIcon: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '300',
    marginBottom: 8,
    letterSpacing: 4,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 8,
  },
  headerTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    fontWeight: '400',
    letterSpacing: 1,
  },
  headerDivider: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginVertical: 16,
    borderRadius: 1,
  },
  headerVersion: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },

  // ── 2. Desktop Widgets ──
  widgetScroll: {
    paddingRight: 20,
    paddingBottom: 8,
  },
  acrylicCard: {
    borderRadius: RADIUS_LG,
    overflow: 'hidden',
    backgroundColor: SURFACE_SMOKE,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: SHADOW_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  acrylicOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  acrylicContent: {
    padding: 20,
    position: 'relative',
  },
  widgetCard: {
    width: 220,
    marginRight: 12,
    minHeight: 200,
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  widgetIcon: {
    fontSize: 22,
    marginRight: 8,
    color: '#f59e0b',
  },
  widgetIconText: {
    fontSize: 18,
    marginRight: 8,
    color: ACCENT,
    fontWeight: '700',
  },
  widgetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_SECONDARY,
  },
  widgetTemp: {
    fontSize: 36,
    fontWeight: '200',
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  widgetDesc: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 12,
  },
  widgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER_SUBTLE,
    paddingTop: 10,
  },
  widgetMiniStat: {},
  widgetMiniLabel: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    marginBottom: 2,
  },
  widgetMiniValue: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },

  // Stocks widget
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockName: {
    width: 44,
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_PRIMARY,
  },
  stockBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  stockBar: {
    height: '100%',
    borderRadius: 3,
  },
  stockChange: {
    fontSize: 11,
    fontWeight: '600',
    width: 44,
    textAlign: 'right',
  },

  // Calendar widget
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  calendarDayHeader: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginBottom: 6,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  calendarDayToday: {
    backgroundColor: ACCENT,
    borderRadius: 14,
  },
  calendarDayText: {
    fontSize: 10,
    color: TEXT_PRIMARY,
  },
  calendarDayTextToday: {
    color: '#ffffff',
    fontWeight: '700',
  },

  // ── 3. Interactive Animations ──
  animButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  animButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: RADIUS,
    minWidth: 130,
    justifyContent: 'center',
  },
  animButtonIcon: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
    marginRight: 8,
  },
  animButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  animDemoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
  },

  // Spring ball
  springBallContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
  },
  springBallHint: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    marginBottom: 12,
    textAlign: 'center',
  },
  springBall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: ACCENT,
    shadowColor: ACCENT,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  springBallInner: {
    flex: 1,
    borderRadius: 32,
    overflow: 'hidden',
  },
  springBallHighlight: {
    position: 'absolute',
    top: 6,
    left: 10,
    width: 20,
    height: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },

  // Pulse rings
  pulseContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: ACCENT,
  },
  pulseDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: ACCENT,
  },

  // ── 4. Drawing Canvas ──
  canvasToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  canvasToolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  canvasToolLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginRight: 4,
  },
  canvasColorBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  canvasColorBtnActive: {
    borderColor: TEXT_PRIMARY,
    borderWidth: 3,
  },
  canvasSizeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  canvasSizeBtnActive: {
    backgroundColor: ACCENT + '15',
  },
  canvasSizeDot: {
    borderRadius: 10,
  },
  canvasClearBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ef444415',
    marginLeft: 'auto',
  },
  canvasClearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  canvasContainer: {
    borderRadius: RADIUS_LG,
    overflow: 'hidden',
    backgroundColor: SURFACE_CARD,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    shadowColor: SHADOW_COLOR,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  canvasInner: {
    height: 250,
    position: 'relative',
    overflow: 'hidden',
  },
  canvasGridDot: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  canvasDot: {
    position: 'absolute',
  },
  canvasPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasPlaceholderIcon: {
    fontSize: 40,
    color: 'rgba(0,0,0,0.08)',
    marginBottom: 8,
  },
  canvasPlaceholderText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.2)',
    fontWeight: '500',
  },

  // ── 5. 3D Transformations ──
  threeDRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  flipCardWrapper: {
    width: 150,
    height: 180,
    perspective: 1000,
  },
  flipCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: RADIUS_LG,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  flipCardBack: {
    position: 'absolute',
  },
  flipCardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    textAlign: 'center',
  },
  flipCardDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 16,
  },
  flipCardHint: {
    position: 'absolute',
    bottom: 12,
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  cubeSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cubeContainer: {
    alignItems: 'center',
    width: 120,
    height: 140,
  },
  cubeWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cubeFace: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cubeFaceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  cubeLabel: {
    marginTop: 16,
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },

  // ── 6. System Capabilities ──
  capGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  capCard: {
    width: '31%',
    minWidth: 140,
    backgroundColor: SURFACE_CARD,
    borderRadius: RADIUS_LG,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    shadowColor: SHADOW_COLOR,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  capIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  capIcon: {
    fontSize: 16,
    fontWeight: '800',
  },
  capTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  capDesc: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    lineHeight: 16,
  },
  capAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: RADIUS_LG,
    borderBottomRightRadius: RADIUS_LG,
  },

  // ── 7. Data Visualization ──
  chartCard: {
    backgroundColor: SURFACE_CARD,
    borderRadius: RADIUS_LG,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER_SUBTLE,
    shadowColor: SHADOW_COLOR,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },

  // Bar chart
  barChartContainer: {
    flexDirection: 'row',
    height: 180,
  },
  barChartYAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingBottom: 24,
  },
  barChartYLabel: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    textAlign: 'right',
  },
  barChartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 24,
    position: 'relative',
  },
  barChartGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  barChartBarCol: {
    flex: 1,
    alignItems: 'center',
  },
  barChartBarWrapper: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
  },
  barChartBar: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
    minHeight: 20,
  },
  barChartBarValue: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  barChartLabel: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    marginTop: 6,
    fontWeight: '500',
  },

  // Pie chart / donut
  pieChartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  donutContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 16,
    borderColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutSegment: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 0,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  donutCenter: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: SURFACE_CARD,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  donutCenterValue: {
    fontSize: 16,
    fontWeight: '800',
    color: TEXT_PRIMARY,
  },
  donutCenterLabel: {
    fontSize: 9,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  pieSegments: {
    flex: 1,
    gap: 8,
  },
  pieSegment: {
    marginBottom: 2,
  },
  pieSegmentBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  pieSegmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pieLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pieSegmentLabel: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    flex: 1,
  },
  pieSegmentValue: {
    fontSize: 12,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },

  // Line chart
  lineChartContainer: {
    position: 'relative',
  },
  lineChartGrid: {
    position: 'absolute',
    left: 30,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  lineChartDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    marginLeft: -5,
    marginBottom: -5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineChartDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: ACCENT,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: ACCENT,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 2,
  },
  lineChartStem: {
    position: 'absolute',
    top: 10,
    width: 1,
    backgroundColor: ACCENT + '30',
    left: 4.5,
  },

  // ── 8. Window Controls ──
  windowFrame: {
    borderRadius: RADIUS_LG,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: SURFACE_CARD,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  windowTitleBar: {
    height: 32,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  windowTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    gap: 8,
  },
  windowAppIcon: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: ACCENT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  windowAppIconText: {
    fontSize: 6,
    color: '#ffffff',
    fontWeight: '700',
  },
  windowTitleText: {
    fontSize: 12,
    color: TEXT_PRIMARY,
    fontWeight: '400',
  },
  windowControls: {
    flexDirection: 'row',
    height: '100%',
  },
  windowCtrlBtn: {
    width: 46,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  windowMinimizeIcon: {
    width: 10,
    height: 1,
    backgroundColor: TEXT_PRIMARY,
  },
  windowMaximizeIcon: {
    width: 10,
    height: 10,
    borderWidth: 1,
    borderColor: TEXT_PRIMARY,
    borderRadius: 1,
  },
  windowRestoreIcon: {
    width: 12,
    height: 12,
    position: 'relative',
  },
  windowRestoreBack: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: TEXT_PRIMARY,
    borderRadius: 1,
  },
  windowRestoreFront: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: TEXT_PRIMARY,
    backgroundColor: '#f0f0f0',
    borderRadius: 1,
  },
  windowCloseBtn: {
    backgroundColor: 'transparent',
  },
  windowCloseX: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: '300',
    lineHeight: 16,
  },
  windowContent: {
    flexDirection: 'row',
    minHeight: 180,
  },
  windowSidebar: {
    width: 140,
    backgroundColor: '#fafafa',
    borderRightWidth: 1,
    borderRightColor: BORDER_SUBTLE,
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  windowNavItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 2,
  },
  windowNavItemActive: {
    backgroundColor: ACCENT + '12',
  },
  windowNavText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: '400',
  },
  windowNavTextActive: {
    color: ACCENT,
    fontWeight: '600',
  },
  windowMainArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  windowMainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  windowMainText: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    flex: 1,
  },
  windowStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER_SUBTLE,
    gap: 6,
  },
  windowStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  windowStatusText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '500',
  },
  windowStatusRight: {
    fontSize: 11,
    color: TEXT_SECONDARY,
    marginLeft: 'auto',
  },

  // ── 9. Grid Layout ──
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridTile: {
    width: 80,
    height: 80,
    borderRadius: RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  gridTileLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },

  // ── Footer ──
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerDivider: {
    width: 60,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 1,
    marginBottom: 20,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginBottom: 4,
    textAlign: 'center',
  },
  footerCopy: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.25)',
    marginTop: 12,
    fontWeight: '500',
  },
});

export default App;
