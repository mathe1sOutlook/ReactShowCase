import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from '../theme';
import {Section} from '../components/common/Section';
import {ScreenContainer} from '../components/common/ScreenContainer';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Animated Header ────────────────────────────────────────────────────────

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
    outputRange: [Colors.primary, Colors.secondary, Colors.primary],
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
              backgroundColor: [Colors.primary, Colors.secondary, Colors.accent][i],
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

// ─── Animated Card ──────────────────────────────────────────────────────────

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
    {title: 'Animations', description: 'Fluid spring and timing animations with native driver', accent: Colors.primary},
    {title: 'Touch & Gesture', description: 'PanResponder for complex multi-touch interactions', accent: Colors.secondary},
    {title: '3D Transforms', description: 'Perspective, rotation and depth effects in real-time', accent: Colors.accent},
    {title: 'Custom Drawing', description: 'Touch-based canvas drawing with smooth paths', accent: Colors.success},
    {title: 'Hardware Access', description: 'Camera, Bluetooth, GPS, NFC and sensor APIs', accent: Colors.warning},
    {title: 'Data Visualization', description: 'Charts and graphs built with pure Animated Views', accent: Colors.orange},
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

// ─── Interactive Animations ─────────────────────────────────────────────────

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
        <InteractiveButton label="  " color={Colors.primary} animType="spring" />
        <InteractiveButton label="  " color={Colors.secondary} animType="bounce" />
        <InteractiveButton label="  " color={Colors.accent} animType="rotate" />
      </View>
      <View style={styles.interactiveRow}>
        <InteractiveButton label="  " color={Colors.success} animType="scale" />
        <InteractiveButton label="  " color={Colors.warning} animType="shake" />
      </View>
    </Section>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function AnimationsScreen() {
  return (
    <ScreenContainer>
      <AnimatedHeader />
      <AnimatedCardsSection />
      <InteractiveAnimationsSection />
    </ScreenContainer>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
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
    backgroundColor: Colors.bg,
  },
  headerGlowOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary,
    opacity: 0.15,
    top: 40,
  },
  headerGlowOrb2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.secondary,
    opacity: 0.1,
    top: 80,
    left: SCREEN_WIDTH * 0.15,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowColor: Colors.primary,
    textShadowOffset: {width: 0, height: 0},
    textShadowRadius: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 4,
    marginTop: 8,
    textTransform: 'uppercase',
  },
  headerBar: {
    height: 2,
    borderRadius: 1,
    alignSelf: 'center',
  },

  // Animated Cards
  animCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Interactive Animations
  hintText: {
    fontSize: 12,
    color: '#8888aa',
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
    backgroundColor: Colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactiveBtnText: {
    fontSize: 28,
  },
  interactiveBtnHint: {
    fontSize: 9,
    color: '#8888aa',
    marginTop: 6,
    letterSpacing: 1,
    fontWeight: '600',
  },
});
