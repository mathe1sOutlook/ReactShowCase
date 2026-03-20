import React, {useEffect} from 'react';
import {Animated, Easing, StyleSheet, Text} from 'react-native';
import {Colors} from '../../theme';
import {useAnimatedValue} from '../../hooks/useAnimatedValue';

type SectionWrapperProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function SectionWrapper({title, subtitle, children}: SectionWrapperProps) {
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
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sectionWrapper: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
});
