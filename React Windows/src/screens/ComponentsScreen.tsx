import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text, View} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {ControlsShowcase} from '../components/showcase/ControlsShowcase';
import {DataDisplayShowcase} from '../components/showcase/DataDisplayShowcase';
import {FeedbackShowcase} from '../components/showcase/FeedbackShowcase';
import {FormsShowcase} from '../components/showcase/FormsShowcase';
import {PickersShowcase} from '../components/showcase/PickersShowcase';
import {Colors, Radius, Spacing, Typography, fluentShadow} from '../theme';

const UPCOMING = [
  {
    title: '9.1 Quality Pass',
    detail: 'Performance, tests, accessibility and error boundary hardening.',
  },
];

export default function ComponentsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <ScreenContainer>
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0],
                }),
              },
            ],
          },
        ]}>
        <Text style={styles.title}>UI Components</Text>
        <Text style={styles.subtitle}>
          Phases 1.1 through 1.5 are live. Buttons, forms, pickers, feedback, avatars, cards, timelines, and data display components.
        </Text>

        <ControlsShowcase />
        <FormsShowcase />
        <PickersShowcase />
        <FeedbackShowcase />
        <DataDisplayShowcase />

        <View style={styles.roadmapCard}>
          <Text style={styles.roadmapTitle}>Coming Next</Text>
          <View style={styles.list}>
            {UPCOMING.map(item => (
              <View key={item.title} style={styles.listItem}>
                <View style={styles.itemCopy}>
                  <Text style={styles.itemLabel}>{item.title}</Text>
                  <Text style={styles.itemDetail}>{item.detail}</Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>NEXT</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Animated.View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  roadmapCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...fluentShadow('md'),
  },
  roadmapTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  list: {
    gap: Spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.bgSmoke,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  itemCopy: {
    flex: 1,
    gap: 2,
  },
  itemLabel: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  itemDetail: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  badge: {
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: {
    ...Typography.label,
    color: Colors.primary,
  },
});
