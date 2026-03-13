/**
 * CFD Android - React Native Graphical Showcase
 *
 * A comprehensive single-file demonstration of React Native's
 * graphical and animation capabilities on Android.
 *
 * Uses ONLY built-in React Native APIs - zero external dependencies
 * beyond react and react-native.
 */

import React, {useEffect, useRef, useState, useCallback, useMemo} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  GestureResponderEvent,
  PanResponderGestureState,
  LayoutAnimation,
  UIManager,
  NativeModules,
} from 'react-native';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

// ─── Color Palette ───────────────────────────────────────────────────────────

const COLORS = {
  bg: '#0a0a1a',
  bgLight: '#111128',
  bgCard: '#161638',
  bgCardAlt: '#1a1a3e',
  cyan: '#00f0ff',
  magenta: '#ff00c8',
  purple: '#a855f7',
  green: '#39ff14',
  yellow: '#ffe600',
  orange: '#ff6600',
  pink: '#ff6eb4',
  red: '#ff2255',
  white: '#f0f0ff',
  gray: '#666688',
  grayLight: '#8888aa',
  textPrimary: '#e8e8ff',
  textSecondary: '#9999bb',
  border: '#2a2a5a',
};

const NEON = [COLORS.cyan, COLORS.magenta, COLORS.purple, COLORS.green, COLORS.yellow, COLORS.orange, COLORS.pink];

// ─── Utility: Neon Glow Shadow ──────────────────────────────────────────────

function neonShadow(color: string, radius = 12) {
  return {
    shadowColor: color,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: radius,
    elevation: 8,
  };
}

// ─── Section Wrapper ─────────────────────────────────────────────────────────

function Section({title, children}: {title: string; children: React.ReactNode}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionDivider} />
      {children}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. ANIMATED HEADER
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedHeader() {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  const barWidths = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Pulse glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ]),
    ).start();

    // Shimmer across
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ).start();

    // Subtitle fade in
    Animated.timing(subtitleFade, {
      toValue: 1,
      duration: 1500,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Decorative bars
    barWidths.forEach((bw, i) => {
      Animated.timing(bw, {
        toValue: 1,
        duration: 800,
        delay: 300 + i * 200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    });
  }, []);

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const glowScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const titleColor = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [COLORS.cyan, COLORS.magenta, COLORS.cyan],
  });

  return (
    <View style={styles.headerContainer}>
      {/* Background gradient layers */}
      <View style={styles.headerGradientLayer1} />
      <View style={styles.headerGradientLayer2} />
      <View style={styles.headerGradientLayer3} />

      {/* Glow orb behind title */}
      <Animated.View
        style={[
          styles.headerGlowOrb,
          {
            opacity: glowOpacity,
            transform: [{scale: glowScale}],
          },
        ]}
      />

      {/* Second glow orb (magenta) */}
      <Animated.View
        style={[
          styles.headerGlowOrb2,
          {
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 0.2],
            }),
          },
        ]}
      />

      {/* Title */}
      <Animated.Text
        style={[
          styles.headerTitle,
          {
            color: titleColor,
            transform: [{scale: glowScale}],
          },
        ]}>
        CFD Android
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text style={[styles.headerSubtitle, {opacity: subtitleFade}]}>
        React Native Graphical Showcase
      </Animated.Text>

      {/* Decorative bars */}
      {barWidths.map((bw, i) => (
        <Animated.View
          key={i}
          style={[
            styles.headerBar,
            {
              backgroundColor: [COLORS.cyan, COLORS.magenta, COLORS.purple][i],
              width: bw.interpolate({
                inputRange: [0, 1],
                outputRange: [0, SCREEN_WIDTH * (0.6 - i * 0.15)],
              }),
              opacity: bw.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.7 - i * 0.15],
              }),
              marginTop: i === 0 ? 16 : 4,
            },
          ]}
        />
      ))}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 2. ANIMATED CARDS
// ═══════════════════════════════════════════════════════════════════════════════

function AnimatedCard({
  index,
  title,
  description,
  accentColor,
}: {
  index: number;
  title: string;
  description: string;
  accentColor: string;
}) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, index * 150);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.animCard,
        {
          borderLeftColor: accentColor,
          opacity: slideAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [index % 2 === 0 ? -SCREEN_WIDTH : SCREEN_WIDTH, 0],
              }),
            },
            {
              scale: slideAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 1.02, 1],
              }),
            },
          ],
        },
      ]}>
      <View style={[styles.animCardAccent, {backgroundColor: accentColor}]} />
      <Text style={[styles.animCardTitle, {color: accentColor}]}>{title}</Text>
      <Text style={styles.animCardDesc}>{description}</Text>
    </Animated.View>
  );
}

function AnimatedCardsSection() {
  const cards = [
    {title: 'Animations', description: 'Fluid spring and timing animations with native driver', accent: COLORS.cyan},
    {title: 'Touch & Gesture', description: 'PanResponder for complex multi-touch interactions', accent: COLORS.magenta},
    {title: '3D Transforms', description: 'Perspective, rotation and depth effects in real-time', accent: COLORS.purple},
    {title: 'Custom Drawing', description: 'Touch-based canvas drawing with smooth paths', accent: COLORS.green},
    {title: 'Hardware Access', description: 'Camera, Bluetooth, GPS, NFC and sensor APIs', accent: COLORS.yellow},
    {title: 'Data Visualization', description: 'Charts and graphs built with pure Animated Views', accent: COLORS.orange},
  ];

  return (
    <Section title="Animated Cards">
      {cards.map((card, i) => (
        <AnimatedCard
          key={i}
          index={i}
          title={card.title}
          description={card.description}
          accentColor={card.accent}
        />
      ))}
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3. INTERACTIVE ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function InteractiveButton({
  label,
  color,
  animType,
}: {
  label: string;
  color: string;
  animType: 'spring' | 'bounce' | 'rotate' | 'scale' | 'shake';
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [active, setActive] = useState(false);

  const trigger = () => {
    setActive(true);
    switch (animType) {
      case 'spring':
        Animated.sequence([
          Animated.spring(anim, {toValue: 1, tension: 200, friction: 5, useNativeDriver: true}),
          Animated.spring(anim, {toValue: 0, tension: 200, friction: 5, useNativeDriver: true}),
        ]).start(() => setActive(false));
        break;
      case 'bounce':
        Animated.sequence([
          Animated.timing(anim, {toValue: 1, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true}),
          Animated.timing(anim, {toValue: 0, duration: 600, easing: Easing.bounce, useNativeDriver: true}),
        ]).start(() => setActive(false));
        break;
      case 'rotate':
        Animated.timing(anim, {toValue: 1, duration: 800, easing: Easing.out(Easing.back(1.5)), useNativeDriver: true}).start(() => {
          anim.setValue(0);
          setActive(false);
        });
        break;
      case 'scale':
        Animated.sequence([
          Animated.spring(scaleAnim, {toValue: 1.4, tension: 300, friction: 5, useNativeDriver: true}),
          Animated.spring(scaleAnim, {toValue: 1, tension: 300, friction: 5, useNativeDriver: true}),
        ]).start(() => setActive(false));
        break;
      case 'shake':
        Animated.sequence([
          Animated.timing(anim, {toValue: 1, duration: 50, useNativeDriver: true}),
          Animated.timing(anim, {toValue: -1, duration: 50, useNativeDriver: true}),
          Animated.timing(anim, {toValue: 1, duration: 50, useNativeDriver: true}),
          Animated.timing(anim, {toValue: -1, duration: 50, useNativeDriver: true}),
          Animated.timing(anim, {toValue: 1, duration: 50, useNativeDriver: true}),
          Animated.timing(anim, {toValue: -1, duration: 50, useNativeDriver: true}),
          Animated.timing(anim, {toValue: 0, duration: 50, useNativeDriver: true}),
        ]).start(() => setActive(false));
        break;
    }
  };

  const animStyle = (() => {
    switch (animType) {
      case 'spring':
        return {
          transform: [
            {translateY: anim.interpolate({inputRange: [0, 1], outputRange: [0, -30]})},
          ],
        };
      case 'bounce':
        return {
          transform: [
            {translateY: anim.interpolate({inputRange: [0, 1], outputRange: [0, -50]})},
          ],
        };
      case 'rotate':
        return {
          transform: [
            {rotate: anim.interpolate({inputRange: [0, 1], outputRange: ['0deg', '360deg']})},
          ],
        };
      case 'scale':
        return {
          transform: [{scale: scaleAnim}],
        };
      case 'shake':
        return {
          transform: [
            {translateX: anim.interpolate({inputRange: [-1, 0, 1], outputRange: [-12, 0, 12]})},
          ],
        };
    }
  })();

  return (
    <TouchableOpacity onPress={trigger} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.interactiveBtn,
          {borderColor: color},
          active && {backgroundColor: color + '22'},
          animStyle,
        ]}>
        <Text style={[styles.interactiveBtnText, {color}]}>{label}</Text>
        <Text style={styles.interactiveBtnHint}>{animType.toUpperCase()}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function InteractiveAnimationsSection() {
  return (
    <Section title="Interactive Animations">
      <Text style={styles.hintText}>Tap each button to trigger its animation</Text>
      <View style={styles.interactiveRow}>
        <InteractiveButton label="  " color={COLORS.cyan} animType="spring" />
        <InteractiveButton label="  " color={COLORS.magenta} animType="bounce" />
        <InteractiveButton label="  " color={COLORS.purple} animType="rotate" />
      </View>
      <View style={styles.interactiveRow}>
        <InteractiveButton label="  " color={COLORS.green} animType="scale" />
        <InteractiveButton label="  " color={COLORS.yellow} animType="shake" />
      </View>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 4. DRAWING CANVAS
// ═══════════════════════════════════════════════════════════════════════════════

interface DrawPoint {
  x: number;
  y: number;
}

interface DrawLine {
  points: DrawPoint[];
  color: string;
}

function DrawingCanvas() {
  const [lines, setLines] = useState<DrawLine[]>([]);
  const [currentLine, setCurrentLine] = useState<DrawPoint[]>([]);
  const [brushColor, setBrushColor] = useState(COLORS.cyan);
  const brushColors = [COLORS.cyan, COLORS.magenta, COLORS.purple, COLORS.green, COLORS.yellow, COLORS.orange, COLORS.pink, COLORS.white];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const {locationX, locationY} = evt.nativeEvent;
        setCurrentLine([{x: locationX, y: locationY}]);
      },
      onPanResponderMove: (evt) => {
        const {locationX, locationY} = evt.nativeEvent;
        setCurrentLine(prev => [...prev, {x: locationX, y: locationY}]);
      },
      onPanResponderRelease: () => {
        setLines(prev => [...prev, {points: currentLine, color: brushColor}]);
        setCurrentLine([]);
      },
    }),
  ).current;

  const clearCanvas = () => {
    setLines([]);
    setCurrentLine([]);
  };

  const renderLine = (line: DrawLine, lineIndex: number) => {
    return line.points.map((point, i) => {
      if (i === 0) return null;
      const prev = line.points[i - 1];
      const dx = point.x - prev.x;
      const dy = point.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      return (
        <View
          key={`${lineIndex}-${i}`}
          style={{
            position: 'absolute',
            left: prev.x,
            top: prev.y - 1.5,
            width: Math.max(dist, 1),
            height: 3,
            backgroundColor: line.color,
            borderRadius: 1.5,
            transform: [{rotate: `${angle}deg`}],
            transformOrigin: '0% 50%',
          }}
        />
      );
    });
  };

  const renderCurrentLine = () => {
    return currentLine.map((point, i) => {
      if (i === 0) return null;
      const prev = currentLine[i - 1];
      const dx = point.x - prev.x;
      const dy = point.y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      return (
        <View
          key={`current-${i}`}
          style={{
            position: 'absolute',
            left: prev.x,
            top: prev.y - 1.5,
            width: Math.max(dist, 1),
            height: 3,
            backgroundColor: brushColor,
            borderRadius: 1.5,
            transform: [{rotate: `${angle}deg`}],
            transformOrigin: '0% 50%',
          }}
        />
      );
    });
  };

  return (
    <Section title="Drawing Canvas">
      <Text style={styles.hintText}>Draw with your finger on the canvas below</Text>

      {/* Brush color picker */}
      <View style={styles.brushRow}>
        {brushColors.map((c, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => setBrushColor(c)}
            style={[
              styles.brushDot,
              {backgroundColor: c},
              brushColor === c && styles.brushDotActive,
            ]}
          />
        ))}
        <TouchableOpacity onPress={clearCanvas} style={styles.clearBtn}>
          <Text style={styles.clearBtnText}>CLEAR</Text>
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View style={styles.canvas} {...panResponder.panHandlers}>
        {/* Grid lines for visual flair */}
        {Array.from({length: 10}).map((_, i) => (
          <View
            key={`hg-${i}`}
            style={[
              styles.canvasGridH,
              {top: (i + 1) * 20},
            ]}
          />
        ))}
        {Array.from({length: Math.floor((SCREEN_WIDTH - 64) / 20)}).map((_, i) => (
          <View
            key={`vg-${i}`}
            style={[
              styles.canvasGridV,
              {left: (i + 1) * 20},
            ]}
          />
        ))}
        {lines.map((line, i) => renderLine(line, i))}
        {renderCurrentLine()}
        {lines.length === 0 && currentLine.length === 0 && (
          <View style={styles.canvasPlaceholder}>
            <Text style={styles.canvasPlaceholderText}>Touch to draw</Text>
          </View>
        )}
      </View>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 5. 3D TRANSFORMATIONS
// ═══════════════════════════════════════════════════════════════════════════════

function Card3D({
  title,
  color,
  emoji,
}: {
  title: string;
  color: string;
  emoji: string;
}) {
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const autoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(autoRotate, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gs) => {
        rotateY.setValue(gs.dx * 0.5);
        rotateX.setValue(-gs.dy * 0.5);
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(rotateX, {toValue: 0, tension: 40, friction: 7, useNativeDriver: true}),
          Animated.spring(rotateY, {toValue: 0, tension: 40, friction: 7, useNativeDriver: true}),
        ]).start();
      },
    }),
  ).current;

  const autoRotateY = autoRotate.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ['0deg', '8deg', '0deg', '-8deg', '0deg'],
  });

  const rotXStr = rotateX.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-30deg', '30deg'],
    extrapolate: 'clamp',
  });

  const rotYStr = rotateY.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-30deg', '30deg'],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card3d,
        {borderColor: color + '55'},
        {
          transform: [
            {perspective: 800},
            {rotateX: rotXStr},
            {rotateY: Animated.add(
              rotateY.interpolate({
                inputRange: [-180, 180],
                outputRange: [-30, 30],
                extrapolate: 'clamp',
              }),
              autoRotate.interpolate({
                inputRange: [0, 0.25, 0.5, 0.75, 1],
                outputRange: [0, 8, 0, -8, 0],
              }),
            ).interpolate({
              inputRange: [-38, 38],
              outputRange: ['-38deg', '38deg'],
            })},
          ],
        },
      ]}>
      <Text style={styles.card3dEmoji}>{emoji}</Text>
      <Text style={[styles.card3dTitle, {color}]}>{title}</Text>
      <View style={[styles.card3dLine, {backgroundColor: color}]} />
      <Text style={styles.card3dHint}>Drag to rotate</Text>
    </Animated.View>
  );
}

function TransformationsSection() {
  return (
    <Section title="3D Transformations">
      <Text style={styles.hintText}>Drag cards to rotate them in 3D space</Text>
      <View style={styles.card3dRow}>
        <Card3D title="Depth" color={COLORS.cyan} emoji={'\u{1F30A}'} />
        <Card3D title="Space" color={COLORS.magenta} emoji={'\u{1F680}'} />
      </View>
      <View style={styles.card3dRow}>
        <Card3D title="Prism" color={COLORS.purple} emoji={'\u{1F48E}'} />
        <Card3D title="Energy" color={COLORS.green} emoji={'\u{26A1}'} />
      </View>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 6. HARDWARE CAPABILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function HardwareCard({
  name,
  emoji,
  status,
  color,
  index,
}: {
  name: string;
  emoji: string;
  status: string;
  color: string;
  index: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1200 + index * 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200 + index * 200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.hwCard,
        {borderColor: color + '44'},
        {
          opacity: fadeAnim,
          transform: [
            {scale: pulseAnim},
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}>
      <Text style={styles.hwEmoji}>{emoji}</Text>
      <Text style={[styles.hwName, {color}]}>{name}</Text>
      <View style={[styles.hwStatusDot, {backgroundColor: color}]} />
      <Text style={styles.hwStatus}>{status}</Text>
    </Animated.View>
  );
}

function HardwareSection() {
  const capabilities = [
    {name: 'Camera', emoji: '\u{1F4F7}', status: 'Available', color: COLORS.cyan},
    {name: 'Bluetooth', emoji: '\u{1F4E1}', status: 'Ready', color: COLORS.magenta},
    {name: 'GPS', emoji: '\u{1F4CD}', status: 'Active', color: COLORS.green},
    {name: 'Accel.', emoji: '\u{1F3AF}', status: 'Streaming', color: COLORS.purple},
    {name: 'NFC', emoji: '\u{1F4F2}', status: 'Enabled', color: COLORS.yellow},
    {name: 'Gyro', emoji: '\u{1F504}', status: 'Ready', color: COLORS.orange},
    {name: 'Mic', emoji: '\u{1F3A4}', status: 'Available', color: COLORS.pink},
    {name: 'Haptics', emoji: '\u{1F4F3}', status: 'Active', color: COLORS.red},
  ];

  return (
    <Section title="Hardware Capabilities">
      <View style={styles.hwGrid}>
        {capabilities.map((cap, i) => (
          <HardwareCard key={i} index={i} {...cap} />
        ))}
      </View>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 7. CHARTS
// ═══════════════════════════════════════════════════════════════════════════════

function BarChart() {
  const barData = [
    {label: 'Jan', value: 65, color: COLORS.cyan},
    {label: 'Feb', value: 85, color: COLORS.magenta},
    {label: 'Mar', value: 45, color: COLORS.purple},
    {label: 'Apr', value: 95, color: COLORS.green},
    {label: 'May', value: 70, color: COLORS.yellow},
    {label: 'Jun', value: 55, color: COLORS.orange},
    {label: 'Jul', value: 80, color: COLORS.pink},
  ];

  const barAnims = useRef(barData.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      80,
      barAnims.map(anim =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: false,
        }),
      ),
    ).start();
  }, []);

  const maxVal = Math.max(...barData.map(d => d.value));

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>Bar Chart - Monthly Data</Text>
      <View style={styles.barChartArea}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          {[100, 75, 50, 25, 0].map(v => (
            <Text key={v} style={styles.yAxisText}>
              {v}
            </Text>
          ))}
        </View>
        {/* Bars */}
        <View style={styles.barsContainer}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <View
              key={`grid-${i}`}
              style={[styles.chartGridLine, {bottom: `${i * 25}%`}]}
            />
          ))}
          {barData.map((d, i) => (
            <View key={i} style={styles.barWrapper}>
              <Animated.View
                style={[
                  styles.bar,
                  {
                    backgroundColor: d.color,
                    height: barAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', `${(d.value / maxVal) * 100}%`],
                    }),
                  },
                ]}>
                <Text style={styles.barValue}>{d.value}</Text>
              </Animated.View>
              <Text style={styles.barLabel}>{d.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function LineChart() {
  const lineData = [30, 60, 45, 80, 55, 90, 70, 85, 50, 75];
  const dotAnims = useRef(lineData.map(() => new Animated.Value(0))).current;
  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(lineAnim, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    Animated.stagger(
      100,
      dotAnims.map(a =>
        Animated.spring(a, {toValue: 1, tension: 80, friction: 6, useNativeDriver: true}),
      ),
    ).start();
  }, []);

  const chartWidth = SCREEN_WIDTH - 100;
  const chartHeight = 150;
  const maxVal = 100;
  const stepX = chartWidth / (lineData.length - 1);

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>Line Chart - Performance Metrics</Text>
      <View style={[styles.lineChartArea, {height: chartHeight + 30}]}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <View
            key={`lgrid-${i}`}
            style={[
              styles.chartGridLine,
              {
                bottom: (i * chartHeight) / 4,
                position: 'absolute',
                left: 30,
                right: 0,
              },
            ]}
          />
        ))}

        {/* Line segments */}
        {lineData.map((val, i) => {
          if (i === 0) return null;
          const prevVal = lineData[i - 1];
          const x1 = 30 + (i - 1) * stepX;
          const y1 = chartHeight - (prevVal / maxVal) * chartHeight;
          const x2 = 30 + i * stepX;
          const y2 = chartHeight - (val / maxVal) * chartHeight;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);

          return (
            <Animated.View
              key={`line-${i}`}
              style={{
                position: 'absolute',
                left: x1,
                top: y1,
                width: dist,
                height: 2,
                backgroundColor: COLORS.cyan,
                borderRadius: 1,
                transform: [{rotate: `${angle}deg`}],
                transformOrigin: '0% 50%',
                opacity: lineAnim,
              }}
            />
          );
        })}

        {/* Dots */}
        {lineData.map((val, i) => {
          const x = 30 + i * stepX;
          const y = chartHeight - (val / maxVal) * chartHeight;
          return (
            <Animated.View
              key={`dot-${i}`}
              style={{
                position: 'absolute',
                left: x - 5,
                top: y - 5,
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: COLORS.cyan,
                borderWidth: 2,
                borderColor: COLORS.bgCard,
                opacity: dotAnims[i],
                transform: [
                  {
                    scale: dotAnims[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              }}
            />
          );
        })}

        {/* Area fill behind line */}
        {lineData.map((val, i) => {
          if (i === 0) return null;
          const prevVal = lineData[i - 1];
          const x1 = 30 + (i - 1) * stepX;
          const y1 = chartHeight - (prevVal / maxVal) * chartHeight;
          const x2 = 30 + i * stepX;
          const y2 = chartHeight - (val / maxVal) * chartHeight;
          const topY = Math.min(y1, y2);
          const avgHeight = chartHeight - (y1 + y2) / 2;

          return (
            <Animated.View
              key={`area-${i}`}
              style={{
                position: 'absolute',
                left: x1,
                top: Math.min(y1, y2),
                width: stepX,
                height: chartHeight - Math.min(y1, y2),
                backgroundColor: COLORS.cyan + '08',
                opacity: lineAnim,
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

function ChartsSection() {
  return (
    <Section title="Data Visualization">
      <BarChart />
      <View style={{height: 24}} />
      <LineChart />
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 8. PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

function Particle({
  delay,
  color,
  size,
  startX,
  startY,
}: {
  delay: number;
  color: string;
  size: number;
  startX: number;
  startY: number;
}) {
  const posX = useRef(new Animated.Value(startX)).current;
  const posY = useRef(new Animated.Value(startY)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      const targetX = Math.random() * (SCREEN_WIDTH - 64);
      const targetY = Math.random() * 200;
      const duration = 3000 + Math.random() * 4000;

      Animated.parallel([
        Animated.sequence([
          Animated.timing(opacity, {toValue: 0.8, duration: 800, useNativeDriver: true}),
          Animated.timing(opacity, {toValue: 0.2, duration: duration - 800, useNativeDriver: true}),
        ]),
        Animated.timing(posX, {
          toValue: targetX,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(posY, {
          toValue: targetY,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(scale, {toValue: 1, duration: 400, useNativeDriver: true}),
          Animated.timing(scale, {toValue: 0.5 + Math.random() * 0.5, duration: duration - 400, useNativeDriver: true}),
        ]),
      ]).start(() => animate());
    };

    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{translateX: posX}, {translateY: posY}, {scale}],
      }}
    />
  );
}

function ParticleSystem() {
  const particles = useMemo(() => {
    return Array.from({length: 25}).map((_, i) => ({
      id: i,
      delay: i * 120,
      color: NEON[i % NEON.length],
      size: 4 + Math.random() * 8,
      startX: Math.random() * (SCREEN_WIDTH - 64),
      startY: Math.random() * 200,
    }));
  }, []);

  return (
    <Section title="Particle System">
      <Text style={styles.hintText}>Animated particles floating in space</Text>
      <View style={styles.particleContainer}>
        {/* Ambient glow */}
        <View style={styles.particleGlow} />
        {particles.map(p => (
          <Particle key={p.id} {...p} />
        ))}
      </View>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// 9. COLOR PICKER
// ═══════════════════════════════════════════════════════════════════════════════

function ColorPicker() {
  const [selectedColor, setSelectedColor] = useState(COLORS.cyan);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const palette = useMemo(() => {
    const colors: string[] = [];
    // Generate a grid of hues
    for (let h = 0; h < 360; h += 15) {
      for (let s = 100; s >= 40; s -= 30) {
        for (let l = 60; l >= 30; l -= 15) {
          colors.push(`hsl(${h}, ${s}%, ${l}%)`);
        }
      }
    }
    return colors;
  }, []);

  const selectColor = (color: string) => {
    setSelectedColor(color);
    Animated.sequence([
      Animated.spring(scaleAnim, {toValue: 1.2, tension: 300, friction: 5, useNativeDriver: true}),
      Animated.spring(scaleAnim, {toValue: 1, tension: 300, friction: 5, useNativeDriver: true}),
    ]).start();
  };

  return (
    <Section title="Color Picker">
      <Text style={styles.hintText}>Tap to pick a color</Text>

      {/* Selected color preview */}
      <Animated.View
        style={[
          styles.colorPreview,
          {
            backgroundColor: selectedColor,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <Text style={styles.colorPreviewText}>{selectedColor}</Text>
      </Animated.View>

      {/* Color grid */}
      <View style={styles.colorGrid}>
        {palette.slice(0, 120).map((color, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => selectColor(color)}
            style={[
              styles.colorSwatch,
              {backgroundColor: color},
              selectedColor === color && styles.colorSwatchActive,
            ]}
          />
        ))}
      </View>
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════════

function App() {
  const scrollY = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.root}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}
        scrollEventThrottle={16}>
        <AnimatedHeader />
        <AnimatedCardsSection />
        <InteractiveAnimationsSection />
        <DrawingCanvas />
        <TransformationsSection />
        <HardwareSection />
        <ChartsSection />
        <ParticleSystem />
        <ColorPicker />

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.footerText}>
            Built with React Native {'\u{2022}'} Pure Animated API
          </Text>
          <Text style={styles.footerSubText}>
            No external dependencies {'\u{2022}'} Android Optimized
          </Text>
          <View style={styles.footerLine} />
        </View>
      </Animated.ScrollView>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // ─── Root & Scroll ───
  root: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },

  // ─── Section ───
  section: {
    marginHorizontal: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionDivider: {
    height: 2,
    backgroundColor: COLORS.border,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 1,
  },

  // ─── Header ───
  headerContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    paddingTop: StatusBar.currentHeight || 40,
  },
  headerGradientLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0d0d2b',
  },
  headerGradientLayer2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#0a0f3a',
    opacity: 0.7,
  },
  headerGradientLayer3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: COLORS.bg,
  },
  headerGlowOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.cyan,
    opacity: 0.15,
    top: 40,
  },
  headerGlowOrb2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.magenta,
    opacity: 0.1,
    top: 80,
    left: SCREEN_WIDTH * 0.15,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: COLORS.cyan,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 4,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  headerBar: {
    height: 2,
    borderRadius: 1,
    alignSelf: 'center',
  },

  // ─── Animated Cards ───
  animCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  animCardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
    borderRadius: 2,
  },
  animCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  animCardDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // ─── Interactive Animations ───
  hintText: {
    fontSize: 12,
    color: COLORS.grayLight,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  interactiveRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  interactiveBtn: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: COLORS.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactiveBtnText: {
    fontSize: 28,
  },
  interactiveBtnHint: {
    fontSize: 9,
    color: COLORS.grayLight,
    marginTop: 6,
    letterSpacing: 1,
    fontWeight: '600',
  },

  // ─── Drawing Canvas ───
  brushRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  brushDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  brushDotActive: {
    borderColor: COLORS.white,
    transform: [{scale: 1.2}],
  },
  clearBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.red + '33',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.red + '66',
    marginLeft: 'auto',
  },
  clearBtnText: {
    color: COLORS.red,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  canvas: {
    height: 220,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  canvasGridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.border + '33',
  },
  canvasGridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.border + '33',
  },
  canvasPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasPlaceholderText: {
    color: COLORS.gray,
    fontSize: 16,
    fontStyle: 'italic',
  },

  // ─── 3D Cards ───
  card3dRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  card3d: {
    width: SCREEN_WIDTH * 0.4,
    height: 140,
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  card3dEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  card3dTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  card3dLine: {
    width: 30,
    height: 2,
    borderRadius: 1,
    marginTop: 8,
  },
  card3dHint: {
    fontSize: 9,
    color: COLORS.gray,
    marginTop: 8,
    fontStyle: 'italic',
  },

  // ─── Hardware Cards ───
  hwGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  hwCard: {
    width: (SCREEN_WIDTH - 54) / 4,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  hwEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  hwName: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  hwStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 2,
  },
  hwStatus: {
    fontSize: 9,
    color: COLORS.grayLight,
  },

  // ─── Charts ───
  chartContainer: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chartLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  barChartArea: {
    flexDirection: 'row',
    height: 180,
  },
  yAxisLabels: {
    width: 30,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  yAxisText: {
    fontSize: 9,
    color: COLORS.grayLight,
    textAlign: 'right',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: 20,
    position: 'relative',
  },
  chartGridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.border + '44',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  barValue: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
  },
  barLabel: {
    fontSize: 9,
    color: COLORS.grayLight,
    marginTop: 4,
  },
  lineChartArea: {
    position: 'relative',
    marginLeft: 0,
  },

  // ─── Particle System ───
  particleContainer: {
    height: 220,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    position: 'relative',
  },
  particleGlow: {
    position: 'absolute',
    top: '30%',
    left: '30%',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.purple,
    opacity: 0.06,
  },

  // ─── Color Picker ───
  colorPreview: {
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  colorPreviewText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 4,
  },
  colorSwatchActive: {
    borderWidth: 2,
    borderColor: COLORS.white,
    transform: [{scale: 1.3}],
    zIndex: 1,
  },

  // ─── Footer ───
  footer: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  footerLine: {
    width: 60,
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.grayLight,
    letterSpacing: 1,
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

export default App;
