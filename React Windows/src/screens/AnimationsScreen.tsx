import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors, Radius} from '../theme';
import {useAnimatedValue} from '../hooks/useAnimatedValue';
import {shadeColor} from '../utils';
import {SectionWrapper} from '../components/common/SectionWrapper';
import {ScreenContainer} from '../components/common/ScreenContainer';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Animated Header ─────────────────────────────────────────────────────────

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
    outputRange: [Colors.primary, '#6b5ce7', Colors.primaryDark],
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

// ─── Animated Button ─────────────────────────────────────────────────────────

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

// ─── Spring Ball ─────────────────────────────────────────────────────────────

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

// ─── Pulse Ring ──────────────────────────────────────────────────────────────

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

// ─── Interactive Animations ──────────────────────────────────────────────────

function InteractiveAnimations() {
  return (
    <SectionWrapper
      title="Interactive Animations"
      subtitle="Spring physics, touch feedback, and animated effects">
      <View style={styles.animButtonRow}>
        <AnimatedButton label="Primary" color={Colors.primary} icon=">" />
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

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AnimationsScreen() {
  return (
    <ScreenContainer>
      <AnimatedHeader />
      <InteractiveAnimations />
    </ScreenContainer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Animated Header
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

  // Interactive Animations
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
    borderRadius: Radius.md,
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
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  springBall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
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
    borderColor: Colors.primary,
  },
  pulseDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
});
