import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {Colors, Spacing, Radius} from '../theme';
import {ScreenContainer} from '../components/common/ScreenContainer';

const TECH_STACK = [
  {label: 'React Native Windows', value: '0.75.20'},
  {label: 'React Native', value: '0.75.5'},
  {label: 'React', value: '18.3.1'},
  {label: 'TypeScript', value: '5.0'},
  {label: 'Platform', value: 'Windows (UWP)'},
  {label: 'Navigation', value: 'React Navigation 7'},
  {label: 'Animations', value: 'Animated API (built-in)'},
  {label: 'Design System', value: 'Fluent Design'},
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
          <Text style={styles.logo}>{'\u2B22'}</Text>
          <Text style={styles.title}>React Native ShowCase</Text>
          <Text style={styles.subtitle}>Windows Desktop Edition</Text>
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
            This application demonstrates the full spectrum of React Native's
            capabilities on Windows Desktop. Every animation, chart, and UI
            component showcases what's possible with React Native Windows
            and Fluent Design.
          </Text>
          <Text style={styles.description}>
            Designed as a comprehensive portfolio to demonstrate cross-platform
            desktop development capabilities.
          </Text>
        </View>

        <Pressable
          style={styles.linkButton}
          onPress={() => Linking.openURL('https://microsoft.github.io/react-native-windows/')}>
          <Text style={styles.linkText}>
            {'\u{1F517}'} React Native Windows Documentation
          </Text>
        </Pressable>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
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
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.md,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
    color: Colors.textPrimary,
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
