import React, {useEffect, useRef, useMemo} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors, Neon} from '../theme';
import {Section} from '../components/common/Section';
import {ScreenContainer} from '../components/common/ScreenContainer';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Particle ───────────────────────────────────────────────────────────────

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
  }, [delay, opacity, posX, posY, scale]);

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

// ─── Particle System ────────────────────────────────────────────────────────

function ParticleSystem() {
  const particles = useMemo(() => {
    return Array.from({length: 25}).map((_, i) => ({
      id: i,
      delay: i * 120,
      color: Neon[i % Neon.length],
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

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function ParticlesScreen() {
  return (
    <ScreenContainer>
      <ParticleSystem />
    </ScreenContainer>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  hintText: {
    fontSize: 12,
    color: '#8888aa',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  particleContainer: {
    height: 220,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
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
    backgroundColor: Colors.accent,
    opacity: 0.06,
  },
});
