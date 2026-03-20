import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  GestureResponderEvent,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {AcrylicCard} from '../common/AcrylicCard';
import {Colors, Radius, Spacing, Typography, fluentShadow} from '../../theme';
import {clamp} from '../../utils';

const TRACK_HEIGHT = 6;
const THUMB_SIZE = 22;
const RANGE_MIN_GAP = 8;

const BUTTON_GROUP_OPTIONS = ['Today', 'Week', 'Month'];
const RADIO_OPTIONS = [
  {
    id: 'starter',
    label: 'Starter Kit',
    description: 'Essential components for a quick pitch build.',
  },
  {
    id: 'growth',
    label: 'Growth Pack',
    description: 'Balanced setup for a production-ready vertical slice.',
  },
  {
    id: 'scale',
    label: 'Scale Mode',
    description: 'High-density UI for complex enterprise flows.',
  },
];
const CHIP_OPTIONS = ['Desktop', 'Keyboard', 'Acrylic', 'Analytics', 'Offline'];
const SEGMENT_OPTIONS = ['Overview', 'Preview', 'Code'];
const SEGMENT_HINTS: Record<string, string> = {
  Overview: 'Balanced summary for stakeholders and demos.',
  Preview: 'Focuses on polish, motion, and interaction density.',
  Code: 'Highlights implementation details and architecture choices.',
};

type ButtonTone = 'primary' | 'secondary' | 'outlined' | 'text' | 'surface';
type ButtonSize = 'default' | 'icon' | 'fab';
type RangeValue = [number, number];

type DemoCardProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

type DemoButtonProps = {
  label?: string;
  tone: ButtonTone;
  icon?: string;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
};

type ToggleSwitchProps = {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

type CheckboxFieldProps = {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

type RadioFieldProps = {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
};

type ValueSliderProps = {
  label: string;
  description: string;
  value: number;
  min?: number;
  max?: number;
  accentColor?: string;
  valueSuffix?: string;
  onChange: (value: number) => void;
};

type RangeSliderProps = {
  label: string;
  description: string;
  value: RangeValue;
  min?: number;
  max?: number;
  accentColor?: string;
  onChange: (value: RangeValue) => void;
};

function percentFromValue(value: number, min: number, max: number) {
  return (value - min) / (max - min);
}

function valueFromPosition(position: number, width: number, min: number, max: number) {
  if (!width) {
    return min;
  }

  const percentage = clamp(position / width, 0, 1);
  return Math.round(min + percentage * (max - min));
}

function getButtonToneStyle(tone: ButtonTone) {
  switch (tone) {
    case 'primary':
      return {
        container: {
          backgroundColor: Colors.primary,
          borderColor: Colors.primary,
        },
        label: {
          color: Colors.white,
          fontWeight: '700' as const,
        },
        iconBadge: {
          backgroundColor: 'rgba(255,255,255,0.16)',
        },
        iconText: {
          color: Colors.white,
        },
        spinner: Colors.white,
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: Colors.accent,
          borderColor: Colors.accent,
        },
        label: {
          color: Colors.white,
          fontWeight: '700' as const,
        },
        iconBadge: {
          backgroundColor: 'rgba(255,255,255,0.16)',
        },
        iconText: {
          color: Colors.white,
        },
        spinner: Colors.white,
      };
    case 'outlined':
      return {
        container: {
          backgroundColor: Colors.bgCard,
          borderColor: Colors.primary,
        },
        label: {
          color: Colors.primary,
          fontWeight: '600' as const,
        },
        iconBadge: {
          backgroundColor: Colors.primary + '14',
        },
        iconText: {
          color: Colors.primary,
        },
        spinner: Colors.primary,
      };
    case 'text':
      return {
        container: {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
        },
        label: {
          color: Colors.textSecondary,
          fontWeight: '600' as const,
        },
        iconBadge: {
          backgroundColor: Colors.bgAlt,
        },
        iconText: {
          color: Colors.textPrimary,
        },
        spinner: Colors.textPrimary,
      };
    case 'surface':
    default:
      return {
        container: {
          backgroundColor: Colors.bgCard,
          borderColor: Colors.borderMedium,
        },
        label: {
          color: Colors.textPrimary,
          fontWeight: '600' as const,
        },
        iconBadge: {
          backgroundColor: Colors.bgAlt,
        },
        iconText: {
          color: Colors.textPrimary,
        },
        spinner: Colors.textPrimary,
      };
  }
}

function DemoCard({eyebrow, title, description, children}: DemoCardProps) {
  return (
    <AcrylicCard style={styles.card}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
      {children}
    </AcrylicCard>
  );
}

function DemoButton({
  label,
  tone,
  icon,
  size = 'default',
  loading = false,
  disabled = false,
  onPress,
}: DemoButtonProps) {
  const toneStyle = getButtonToneStyle(tone);
  const iconOnly = size !== 'default';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label || icon || 'Showcase button'}
      accessibilityHint="Activates this control demo"
      accessibilityState={{disabled, busy: loading}}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.buttonBase,
        toneStyle.container,
        size === 'icon' && styles.iconButton,
        size === 'fab' && styles.fabButton,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={toneStyle.spinner} size="small" />
      ) : iconOnly ? (
        <Text style={[styles.iconOnlyGlyph, toneStyle.label, size === 'fab' && styles.fabGlyph]}>
          {icon ?? '+'}
        </Text>
      ) : (
        <>
          {icon ? (
            <View style={[styles.buttonIconBadge, toneStyle.iconBadge]}>
              <Text style={[styles.buttonIconText, toneStyle.iconText]}>{icon}</Text>
            </View>
          ) : null}
          {label ? <Text style={[styles.buttonLabel, toneStyle.label]}>{label}</Text> : null}
        </>
      )}
    </Pressable>
  );
}

function ToggleSwitch({label, description, value, onChange}: ToggleSwitchProps) {
  const animation = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 90,
    }).start();
  }, [animation, value]);

  return (
    <Pressable
      style={styles.controlRow}
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{checked: value}}>
      <View style={styles.controlTextBlock}>
        <Text style={styles.controlLabel}>{label}</Text>
        <Text style={styles.controlDescription}>{description}</Text>
      </View>
      <View style={[styles.switchTrack, value && styles.switchTrackActive]}>
        <Animated.View
          style={[
            styles.switchThumb,
            {
              transform: [
                {
                  translateX: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, 28],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

function CheckboxField({label, description, value, onChange}: CheckboxFieldProps) {
  const animation = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 110,
    }).start();
  }, [animation, value]);

  return (
    <Pressable style={styles.controlRow} onPress={() => onChange(!value)}>
      <View style={[styles.checkboxBox, value && styles.checkboxBoxActive]}>
        <Animated.View
          style={[
            styles.checkboxFill,
            {
              opacity: animation,
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.55, 1],
                  }),
                },
              ],
            },
          ]}>
          <Animated.Text style={styles.checkboxMark}>✓</Animated.Text>
        </Animated.View>
      </View>
      <View style={styles.controlTextBlock}>
        <Text style={styles.controlLabel}>{label}</Text>
        <Text style={styles.controlDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

function RadioField({label, description, selected, onPress}: RadioFieldProps) {
  const animation = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      toValue: selected ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 120,
    }).start();
  }, [animation, selected]);

  return (
    <Pressable style={styles.controlRow} onPress={onPress}>
      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        <Animated.View
          style={[
            styles.radioInner,
            {
              opacity: animation,
              transform: [
                {
                  scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 1],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
      <View style={styles.controlTextBlock}>
        <Text style={styles.controlLabel}>{label}</Text>
        <Text style={styles.controlDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

function ValueSlider({
  label,
  description,
  value,
  min = 0,
  max = 100,
  accentColor = Colors.primary,
  valueSuffix = '%',
  onChange,
}: ValueSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const percentage = percentFromValue(value, min, max);
  const thumbLeft = clamp(
    trackWidth * percentage - THUMB_SIZE / 2,
    0,
    Math.max(0, trackWidth - THUMB_SIZE),
  );

  const updateValue = (locationX: number) => {
    const nextValue = clamp(valueFromPosition(locationX, trackWidth, min, max), min, max);
    onChange(nextValue);
  };

  const handleGesture = (event: GestureResponderEvent) => {
    updateValue(event.nativeEvent.locationX);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.valueHeader}>
        <View style={styles.valueCopy}>
          <Text style={styles.controlLabel}>{label}</Text>
          <Text style={styles.controlDescription}>{description}</Text>
        </View>
        <Text style={styles.valueBadge}>
          {value}
          {valueSuffix}
        </Text>
      </View>
      <View
        onLayout={handleLayout}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleGesture}
        onResponderMove={handleGesture}
        onStartShouldSetResponder={() => true}
        style={styles.sliderTrackArea}>
        <View style={styles.sliderTrack} />
        <View
          style={[
            styles.sliderFill,
            {backgroundColor: accentColor, width: trackWidth ? trackWidth * percentage : 0},
          ]}
        />
        <View style={[styles.sliderThumb, {borderColor: accentColor, left: thumbLeft}]} />
      </View>
      <View style={styles.sliderFooter}>
        <Text style={styles.sliderHint}>Low</Text>
        <Text style={styles.sliderHint}>High</Text>
      </View>
    </View>
  );
}

function RangeSlider({
  label,
  description,
  value,
  min = 0,
  max = 100,
  accentColor = Colors.accent,
  onChange,
}: RangeSliderProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const [activeThumb, setActiveThumb] = useState<'start' | 'end' | null>(null);
  const [start, end] = value;
  const startPercentage = percentFromValue(start, min, max);
  const endPercentage = percentFromValue(end, min, max);
  const startLeft = clamp(
    trackWidth * startPercentage - THUMB_SIZE / 2,
    0,
    Math.max(0, trackWidth - THUMB_SIZE),
  );
  const endLeft = clamp(
    trackWidth * endPercentage - THUMB_SIZE / 2,
    0,
    Math.max(0, trackWidth - THUMB_SIZE),
  );

  const updateValue = (locationX: number, fixedThumb?: 'start' | 'end') => {
    const nextValue = valueFromPosition(locationX, trackWidth, min, max);
    const nearestThumb =
      fixedThumb ??
      (Math.abs(locationX - trackWidth * startPercentage) <=
      Math.abs(locationX - trackWidth * endPercentage)
        ? 'start'
        : 'end');

    setActiveThumb(nearestThumb);

    if (nearestThumb === 'start') {
      onChange([clamp(nextValue, min, end - RANGE_MIN_GAP), end]);
      return;
    }

    onChange([start, clamp(nextValue, start + RANGE_MIN_GAP, max)]);
  };

  const handleGrant = (event: GestureResponderEvent) => {
    updateValue(event.nativeEvent.locationX);
  };

  const handleMove = (event: GestureResponderEvent) => {
    updateValue(event.nativeEvent.locationX, activeThumb ?? undefined);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  return (
    <View style={styles.sliderBlock}>
      <View style={styles.valueHeader}>
        <View style={styles.valueCopy}>
          <Text style={styles.controlLabel}>{label}</Text>
          <Text style={styles.controlDescription}>{description}</Text>
        </View>
        <Text style={[styles.valueBadge, styles.secondaryBadge]}>
          {start} - {end}
        </Text>
      </View>
      <View
        onLayout={handleLayout}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleGrant}
        onResponderMove={handleMove}
        onResponderRelease={() => setActiveThumb(null)}
        onResponderTerminate={() => setActiveThumb(null)}
        onResponderTerminationRequest={() => false}
        onStartShouldSetResponder={() => true}
        style={styles.sliderTrackArea}>
        <View style={styles.sliderTrack} />
        <View
          style={[
            styles.sliderFill,
            {
              backgroundColor: accentColor,
              left: trackWidth ? trackWidth * startPercentage : 0,
              width: trackWidth ? trackWidth * (endPercentage - startPercentage) : 0,
            },
          ]}
        />
        <View
          style={[
            styles.sliderThumb,
            styles.rangeThumb,
            activeThumb === 'start' && styles.rangeThumbActive,
            {borderColor: accentColor, left: startLeft},
          ]}
        />
        <View
          style={[
            styles.sliderThumb,
            styles.rangeThumb,
            activeThumb === 'end' && styles.rangeThumbActive,
            {borderColor: accentColor, left: endLeft},
          ]}
        />
      </View>
      <View style={styles.sliderFooter}>
        <Text style={styles.sliderHint}>Compact</Text>
        <Text style={styles.sliderHint}>Immersive</Text>
      </View>
    </View>
  );
}

export function ControlsShowcase() {
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Week');
  const [enabled, setEnabled] = useState(true);
  const [checked, setChecked] = useState(true);
  const [selectedRadio, setSelectedRadio] = useState('growth');
  const [sliderValue, setSliderValue] = useState(68);
  const [rangeValue, setRangeValue] = useState<RangeValue>([18, 74]);
  const [stepperValue, setStepperValue] = useState(3);
  const [selectedChips, setSelectedChips] = useState<string[]>(['Desktop', 'Analytics']);
  const [selectedSegment, setSelectedSegment] = useState('Preview');
  const loadingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (loadingTimer.current) {
        clearTimeout(loadingTimer.current);
      }
    };
  }, []);

  const handleLoadingPress = () => {
    if (loading) {
      return;
    }

    setLoading(true);
    loadingTimer.current = setTimeout(() => {
      setLoading(false);
    }, 1400);
  };

  const toggleChip = (chip: string) => {
    setSelectedChips(current =>
      current.includes(chip)
        ? current.filter(item => item !== chip)
        : [...current, chip],
    );
  };

  return (
    <View style={styles.stack}>
      <DemoCard
        eyebrow="Phase 1.1 live"
        title="Buttons, selection, and value controls"
        description="The Components screen now ships real interaction patterns instead of a placeholder. Everything below runs with core React Native APIs, ready for reuse in later forms and workflows.">
        <View style={styles.statGrid}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>controls delivered</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>new dependencies</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>1.1</Text>
            <Text style={styles.statLabel}>section completed</Text>
          </View>
        </View>
      </DemoCard>

      <DemoCard
        eyebrow="Actions"
        title="Buttons, loading states, and groups"
        description="Primary, secondary, outlined, text, icon, and floating actions cover the main CTA variants. The loading button simulates an async task to validate disabled and busy states.">
        <View style={styles.buttonWrap}>
          <DemoButton label="Primary" tone="primary" />
          <DemoButton label="Secondary" tone="secondary" />
          <DemoButton label="Outlined" tone="outlined" />
          <DemoButton label="Text button" tone="text" />
          <DemoButton icon="+" size="icon" tone="surface" />
          <DemoButton icon="+" size="fab" tone="primary" />
        </View>

        <View style={styles.buttonWrap}>
          <DemoButton label="Create sample" icon="+" tone="primary" />
          <DemoButton
            label={loading ? 'Syncing' : 'Run sync'}
            loading={loading}
            disabled={loading}
            tone="secondary"
            onPress={handleLoadingPress}
          />
        </View>

        <View style={styles.groupCard}>
          <Text style={styles.groupLabel}>Button Group</Text>
          <View style={styles.groupRow}>
            {BUTTON_GROUP_OPTIONS.map(option => {
              const selected = selectedPeriod === option;

              return (
                <Pressable
                  key={option}
                  onPress={() => setSelectedPeriod(option)}
                  style={[styles.groupButton, selected && styles.groupButtonActive]}>
                  <Text style={[styles.groupButtonText, selected && styles.groupButtonTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </DemoCard>

      <DemoCard
        eyebrow="Selection"
        title="Toggle, checkbox, radio, chips, and segmented control"
        description="This set covers binary choices, exclusive options, multi-select filters, and compact tab selection for tool panels or data modes.">
        <View style={styles.panelGrid}>
          <View style={styles.panel}>
            <ToggleSwitch
              description="Enable animated accents and elevated emphasis."
              label="Animated toggle"
              value={enabled}
              onChange={setEnabled}
            />
            <CheckboxField
              description="Require approval before launching the showcase flow."
              label="Checkbox with animated check"
              value={checked}
              onChange={setChecked}
            />
          </View>

          <View style={styles.panel}>
            {RADIO_OPTIONS.map(option => (
              <RadioField
                key={option.id}
                description={option.description}
                label={option.label}
                selected={selectedRadio === option.id}
                onPress={() => setSelectedRadio(option.id)}
              />
            ))}
          </View>
        </View>

        <View style={styles.chipWrap}>
          {CHIP_OPTIONS.map(chip => {
            const selected = selectedChips.includes(chip);

            return (
              <Pressable
                key={chip}
                onPress={() => toggleChip(chip)}
                style={[styles.chip, selected && styles.chipActive]}>
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>{chip}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.segmentTrack}>
          {SEGMENT_OPTIONS.map(segment => {
            const selected = selectedSegment === segment;

            return (
              <Pressable
                key={segment}
                onPress={() => setSelectedSegment(segment)}
                style={[styles.segmentButton, selected && styles.segmentButtonActive]}>
                <Text style={[styles.segmentLabel, selected && styles.segmentLabelActive]}>
                  {segment}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.segmentHint}>{SEGMENT_HINTS[selectedSegment]}</Text>
      </DemoCard>

      <DemoCard
        eyebrow="Values"
        title="Slider, range slider, and numeric stepper"
        description="These controls handle precision adjustments for density, ranges, quotas, and other tunable values used by dashboards, filters, and setup flows.">
        <ValueSlider
          accentColor={Colors.primary}
          description="Adjust interface density in real time."
          label="Slider with live value"
          value={sliderValue}
          onChange={setSliderValue}
        />

        <RangeSlider
          accentColor={Colors.accent}
          description="Control the visible confidence window for a chart or pricing band."
          label="Range slider with two thumbs"
          value={rangeValue}
          onChange={setRangeValue}
        />

        <View style={styles.stepperCard}>
          <View style={styles.valueHeader}>
            <View style={styles.valueCopy}>
              <Text style={styles.controlLabel}>Stepper / numeric input</Text>
              <Text style={styles.controlDescription}>
                Fine-tune the amount of highlighted KPI cards on screen.
              </Text>
            </View>
            <Text style={styles.valueBadge}>{stepperValue} items</Text>
          </View>
          <View style={styles.stepperRow}>
            <Pressable
              onPress={() => setStepperValue(current => clamp(current - 1, 1, 8))}
              style={styles.stepperButton}>
              <Text style={styles.stepperGlyph}>-</Text>
            </Pressable>
            <View style={styles.stepperValueWrap}>
              <Text style={styles.stepperValue}>{stepperValue}</Text>
            </View>
            <Pressable
              onPress={() => setStepperValue(current => clamp(current + 1, 1, 8))}
              style={[styles.stepperButton, styles.stepperButtonPrimary]}>
              <Text style={[styles.stepperGlyph, styles.stepperGlyphPrimary]}>+</Text>
            </Pressable>
          </View>
        </View>
      </DemoCard>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.acrylicBg,
    borderColor: Colors.acrylicBorder,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.primary,
  },
  cardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  cardDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statPill: {
    flexGrow: 1,
    minWidth: 110,
    backgroundColor: Colors.bgSmoke,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  buttonWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  buttonBase: {
    minHeight: 42,
    minWidth: 112,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  buttonPressed: {
    opacity: 0.86,
    transform: [{scale: 0.98}],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    ...Typography.bodySmall,
  },
  buttonIconBadge: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconText: {
    fontSize: 15,
    fontWeight: '800',
  },
  iconButton: {
    width: 44,
    minWidth: 44,
    paddingHorizontal: 0,
  },
  fabButton: {
    width: 56,
    minWidth: 56,
    minHeight: 56,
    paddingHorizontal: 0,
    ...fluentShadow('lg'),
  },
  iconOnlyGlyph: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 24,
  },
  fabGlyph: {
    fontSize: 28,
    lineHeight: 30,
  },
  groupCard: {
    backgroundColor: Colors.bgSmoke,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  groupLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  groupButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  groupButtonActive: {
    backgroundColor: Colors.primary + '12',
    borderColor: Colors.primary,
  },
  groupButtonText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  groupButtonTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  panelGrid: {
    gap: Spacing.md,
  },
  panel: {
    gap: Spacing.sm,
    backgroundColor: Colors.bgSmoke,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  controlTextBlock: {
    flex: 1,
    gap: 2,
  },
  controlLabel: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  controlDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  switchTrack: {
    width: 54,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgAlt,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    position: 'relative',
  },
  switchTrackActive: {
    backgroundColor: Colors.primary + '18',
    borderColor: Colors.primary,
  },
  switchThumb: {
    position: 'absolute',
    top: 2,
    width: 22,
    height: 22,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
  },
  checkboxBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.bgCard,
    padding: 2,
  },
  checkboxBoxActive: {
    borderColor: Colors.primary,
  },
  checkboxFill: {
    flex: 1,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxMark: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '900',
  },
  radioOuter: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: Colors.accent,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: Radius.full,
    backgroundColor: Colors.accent,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.bgCard,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '12',
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  segmentTrack: {
    flexDirection: 'row',
    backgroundColor: Colors.bgAlt,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: Colors.primary + '14',
  },
  segmentLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  segmentLabelActive: {
    color: Colors.primary,
  },
  segmentHint: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  sliderBlock: {
    gap: Spacing.sm,
  },
  valueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  valueCopy: {
    flex: 1,
    gap: 2,
  },
  valueBadge: {
    ...Typography.caption,
    color: Colors.primary,
    backgroundColor: Colors.primary + '12',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  secondaryBadge: {
    color: Colors.accent,
    backgroundColor: Colors.accent + '12',
  },
  sliderTrackArea: {
    height: 30,
    justifyContent: 'center',
  },
  sliderTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: TRACK_HEIGHT,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgAlt,
  },
  sliderFill: {
    position: 'absolute',
    height: TRACK_HEIGHT,
    borderRadius: Radius.full,
  },
  sliderThumb: {
    position: 'absolute',
    top: 4,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 3,
    ...fluentShadow('sm'),
  },
  rangeThumb: {
    ...fluentShadow('sm'),
  },
  rangeThumbActive: {
    transform: [{scale: 1.08}],
  },
  sliderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderHint: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  stepperCard: {
    backgroundColor: Colors.bgSmoke,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepperGlyph: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 24,
  },
  stepperGlyphPrimary: {
    color: Colors.white,
  },
  stepperValueWrap: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
});
