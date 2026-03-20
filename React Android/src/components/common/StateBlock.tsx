import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {Colors, Radius, Spacing} from '../../theme';
import IconSymbol, {type IconName} from './IconSymbol';

type StateVariant = 'loading' | 'empty' | 'error' | 'info' | 'success';

type StateBlockProps = {
  variant: StateVariant;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  iconName?: IconName;
  style?: StyleProp<ViewStyle>;
};

const VARIANT_COLORS: Record<StateVariant, string> = {
  loading: Colors.primary,
  empty: Colors.textSecondary,
  error: Colors.error,
  info: Colors.secondary,
  success: Colors.success,
};

const VARIANT_ICONS: Record<StateVariant, IconName> = {
  loading: 'spark',
  empty: 'empty',
  error: 'error',
  info: 'info',
  success: 'check',
};

export default function StateBlock({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
  iconName,
  style,
}: StateBlockProps) {
  const accent = VARIANT_COLORS[variant];
  const resolvedIcon = iconName ?? VARIANT_ICONS[variant];

  return (
    <View
      style={[
        styles.root,
        compact && styles.rootCompact,
        {borderColor: `${accent}33`, backgroundColor: `${accent}12`},
        style,
      ]}>
      <View style={[styles.iconWrap, {backgroundColor: `${accent}20`}]}>
        {variant === 'loading' ? (
          <ActivityIndicator color={accent} size="small" />
        ) : (
          <IconSymbol name={resolvedIcon} size={20} color={accent} />
        )}
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={({pressed}) => [
            styles.action,
            {borderColor: `${accent}44`},
            pressed && styles.actionPressed,
          ]}>
          <Text style={[styles.actionLabel, {color: accent}]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rootCompact: {
    paddingVertical: Spacing.md,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  action: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  actionPressed: {
    opacity: 0.84,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
