import React, {useEffect, useState} from 'react';
import {
  Animated,
  Easing,
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

// ─── Flip Card ───────────────────────────────────────────────────────────────

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

// ─── Spinning Cube ───────────────────────────────────────────────────────────

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
    {label: 'Front', color: Colors.primary, tz: 40},
    {label: 'Right', color: Colors.accent, tz: 40},
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

// ─── 3D Transformations ──────────────────────────────────────────────────────

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
          color={Colors.primary}
        />
        <FlipCard
          frontTitle="Perform"
          frontDesc="60 FPS animations"
          backTitle="Native"
          backDesc="Hardware accelerated"
          color={Colors.accent}
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

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ThreeDScreen() {
  return (
    <ScreenContainer>
      <ThreeDTransformations />
    </ScreenContainer>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  threeDRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  flipCardWrapper: {
    width: 150,
    height: 180,
  },
  flipCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: Radius.lg,
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
    borderRadius: Radius.md,
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
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
