import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {Colors} from '../theme';
import {Section} from '../components/common/Section';
import {ScreenContainer} from '../components/common/ScreenContainer';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

// ─── Card3D ─────────────────────────────────────────────────────────────────

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

  const rotXStr = rotateX.interpolate({
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

// ─── Transformations Section ────────────────────────────────────────────────

function TransformationsSection() {
  return (
    <Section title="3D Transformations">
      <Text style={styles.hintText}>Drag cards to rotate them in 3D space</Text>
      <View style={styles.card3dRow}>
        <Card3D title="Depth" color={Colors.primary} emoji={'\u{1F30A}'} />
        <Card3D title="Space" color={Colors.secondary} emoji={'\u{1F680}'} />
      </View>
      <View style={styles.card3dRow}>
        <Card3D title="Prism" color={Colors.accent} emoji={'\u{1F48E}'} />
        <Card3D title="Energy" color={Colors.success} emoji={'\u{26A1}'} />
      </View>
    </Section>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function ThreeDScreen() {
  return (
    <ScreenContainer>
      <TransformationsSection />
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
  card3dRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  card3d: {
    width: SCREEN_WIDTH * 0.4,
    height: 140,
    backgroundColor: Colors.bgCard,
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
    color: Colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
