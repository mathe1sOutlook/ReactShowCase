/**
 * SplashScreen - Animated splash screen for the mobile showcase
 *
 * Full-screen animated splash with atom icon, app title, and loading dots.
 */

import React, {useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import {Colors} from '../theme/colors';
import {getShowcaseHeroSubtitle} from '../utils/platformShowcase';

interface SplashScreenProps {
  onFinish: () => void;
}

const {width, height} = Dimensions.get('window');

export default function SplashScreen({
  onFinish,
}: SplashScreenProps): React.JSX.Element {
  // Icon animations
  const iconScale = useRef(new Animated.Value(0.3)).current;
  const glowOpacity = useRef(new Animated.Value(0.5)).current;

  // Text animations
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  // Loading dots
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Icon scale: spring from 0.3 to 1.0
    Animated.spring(iconScale, {
      toValue: 1.0,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Glow pulse: loop opacity between 0.5 and 1.0
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 1.0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.5,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    glowLoop.start();

    // Title fade in with delay 300ms
    Animated.timing(titleOpacity, {
      toValue: 1,
      duration: 500,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Subtitle fade in with delay 500ms
    Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 500,
      delay: 500,
      useNativeDriver: true,
    }).start();

    // Loading dots cycling opacity
    const createDotAnimation = (dotAnim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 1.0,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      );

    const dot1Loop = createDotAnimation(dot1Opacity, 0);
    const dot2Loop = createDotAnimation(dot2Opacity, 200);
    const dot3Loop = createDotAnimation(dot3Opacity, 400);

    dot1Loop.start();
    dot2Loop.start();
    dot3Loop.start();

    // After 2000ms, call onFinish
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => {
      clearTimeout(timer);
      glowLoop.stop();
      dot1Loop.stop();
      dot2Loop.stop();
      dot3Loop.stop();
    };
  }, [
    iconScale,
    glowOpacity,
    titleOpacity,
    subtitleOpacity,
    dot1Opacity,
    dot2Opacity,
    dot3Opacity,
    onFinish,
  ]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.bg}
        translucent={false}
      />

      <View style={styles.content}>
        {/* Atom Icon with glow */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{scale: iconScale}],
            },
          ]}>
          <Animated.Text
            style={[
              styles.atomIcon,
              {
                opacity: glowOpacity,
                textShadowColor: Colors.primary,
                textShadowOffset: {width: 0, height: 0},
                textShadowRadius: 30,
              },
            ]}>
            {'\u269B'}
          </Animated.Text>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, {opacity: titleOpacity}]}>
          React Native
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, {opacity: subtitleOpacity}]}>
          {getShowcaseHeroSubtitle()}
        </Animated.Text>
      </View>

      {/* Loading dots at the bottom */}
      <View style={styles.dotsContainer}>
        <Animated.View style={[styles.dot, {opacity: dot1Opacity}]} />
        <Animated.View style={[styles.dot, {opacity: dot2Opacity}]} />
        <Animated.View style={[styles.dot, {opacity: dot3Opacity}]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  atomIcon: {
    fontSize: 96,
    color: Colors.primary,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    letterSpacing: 4,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 80,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
