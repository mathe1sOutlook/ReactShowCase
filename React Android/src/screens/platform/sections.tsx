import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {Colors, Radius, Spacing} from '../../theme';

export type PlatformCardProps = {
  title: string;
  subtitle: string;
  tone: string;
  width: number;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
};

export type PlatformMeterProps = {
  label: string;
  value: string;
  progress: number;
  tone: string;
};

export function PlatformCard({
  title,
  subtitle,
  tone,
  width,
  actionLabel,
  onAction,
  children,
}: PlatformCardProps) {
  return (
    <View style={[styles.card, {width, borderColor: tone + '2e'}]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} style={[styles.action, {borderColor: tone + '44'}]}>
            <Text style={[styles.actionText, {color: tone}]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function PlatformMeter({
  label,
  value,
  progress,
  tone,
}: PlatformMeterProps) {
  return (
    <View style={styles.meter}>
      <View style={styles.meterRow}>
        <Text style={styles.meterLabel}>{label}</Text>
        <Text style={[styles.meterValue, {color: tone}]}>{value}</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.max(0, Math.min(progress, 100))}%`,
              backgroundColor: tone,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  cardCopy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  action: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  meter: {
    gap: 8,
  },
  meterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  meterLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  meterValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: Colors.border,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
