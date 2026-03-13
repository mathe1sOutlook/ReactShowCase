import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {Colors, Spacing} from '../theme';
import {ScreenContainer} from '../components/common/ScreenContainer';

const TECH_STACK = [
  {label: 'React Native', value: '0.84.1'},
  {label: 'React', value: '19.2.3'},
  {label: 'TypeScript', value: '5.8'},
  {label: 'Platform', value: 'Android'},
  {label: 'Navigation', value: 'React Navigation 7'},
  {label: 'Animations', value: 'Animated API (built-in)'},
];

export default function AboutScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ScreenContainer>
      <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>{'\u269B'}</Text>
          <Text style={styles.title}>React Native ShowCase</Text>
          <Text style={styles.subtitle}>Android Edition</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tech Stack</Text>
          {TECH_STACK.map(item => (
            <View key={item.label} style={styles.row}>
              <Text style={styles.rowLabel}>{item.label}</Text>
              <Text style={styles.rowValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.description}>
            This app demonstrates the full spectrum of React Native's graphical
            and interactive capabilities on Android. Every animation, chart,
            and UI component showcases what's possible with this technology.
          </Text>
          <Text style={styles.description}>
            Designed as a comprehensive portfolio to demonstrate cross-platform
            mobile development capabilities.
          </Text>
        </View>

        <Pressable
          style={styles.linkButton}
          onPress={() => Linking.openURL('https://reactnative.dev')}>
          <Text style={styles.linkText}>
            {'\u{1F517}'} reactnative.dev
          </Text>
        </Pressable>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  logo: {
    fontSize: 56,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  linkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
