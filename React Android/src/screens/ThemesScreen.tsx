import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
  useWindowDimensions,
} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing} from '../theme';

type ModePreference = 'system' | 'dark' | 'light';
type ResolvedMode = 'dark' | 'light';
type PaletteId = 'neon' | 'sunrise' | 'forest' | 'mono';

type PreviewTheme = {
  signature: string;
  mode: ResolvedMode;
  paletteId: PaletteId;
  paletteLabel: string;
  accent: string;
  secondary: string;
  highlight: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  input: string;
  border: string;
  outline: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  chip: string;
  accessibilityBg: string;
  focus: string;
  buttonText: string;
  highContrast: boolean;
  fontScale: number;
  followSystem: boolean;
  systemLabel: string;
};

const PALETTES = {
  neon: {
    label: 'Neon',
    darkAccent: '#00F0FF',
    darkSecondary: '#FF00C8',
    lightAccent: '#0057FF',
    lightSecondary: '#7C3AED',
    highlight: '#39FF14',
  },
  sunrise: {
    label: 'Sunrise',
    darkAccent: '#FF8A3D',
    darkSecondary: '#FFD166',
    lightAccent: '#D94F04',
    lightSecondary: '#F59E0B',
    highlight: '#FFB703',
  },
  forest: {
    label: 'Forest',
    darkAccent: '#5ADF9A',
    darkSecondary: '#1DD3B0',
    lightAccent: '#1C7C54',
    lightSecondary: '#0F9D58',
    highlight: '#84CC16',
  },
  mono: {
    label: 'Mono',
    darkAccent: '#F3F4F6',
    darkSecondary: '#9CA3AF',
    lightAccent: '#111827',
    lightSecondary: '#374151',
    highlight: '#6B7280',
  },
} satisfies Record<
  PaletteId,
  {
    label: string;
    darkAccent: string;
    darkSecondary: string;
    lightAccent: string;
    lightSecondary: string;
    highlight: string;
  }
>;

const MODE_OPTIONS: ModePreference[] = ['system', 'dark', 'light'];
const FONT_OPTIONS = [0.85, 1, 1.15, 1.3] as const;

function withAlpha(color: string, alpha: number) {
  const hex = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return `${color}${hex}`;
}

function buildPreviewTheme({
  mode,
  paletteId,
  highContrast,
  fontScale,
  followSystem,
  systemLabel,
}: {
  mode: ResolvedMode;
  paletteId: PaletteId;
  highContrast: boolean;
  fontScale: number;
  followSystem: boolean;
  systemLabel: string;
}): PreviewTheme {
  const palette = PALETTES[paletteId];
  const accent = mode === 'dark' ? palette.darkAccent : palette.lightAccent;
  const secondary = mode === 'dark' ? palette.darkSecondary : palette.lightSecondary;
  const highlight = palette.highlight;

  const background =
    mode === 'dark'
      ? highContrast
        ? '#020202'
        : '#0C1118'
      : highContrast
        ? '#FFFFFF'
        : '#F5F7FB';
  const surface =
    mode === 'dark'
      ? highContrast
        ? '#000000'
        : '#121925'
      : '#FFFFFF';
  const surfaceAlt =
    mode === 'dark'
      ? highContrast
        ? '#080808'
        : '#182131'
      : highContrast
        ? '#F7F7F7'
        : '#EEF3FA';
  const input =
    mode === 'dark'
      ? highContrast
        ? '#050505'
        : '#0D141E'
      : highContrast
        ? '#FFFFFF'
        : '#F8FAFC';
  const border = highContrast ? accent : mode === 'dark' ? '#263347' : '#D8DFEB';
  const outline = highContrast
    ? accent
    : withAlpha(accent, mode === 'dark' ? 0.35 : 0.2);
  const textPrimary = mode === 'dark' ? '#FFFFFF' : '#0B1324';
  const textSecondary =
    mode === 'dark'
      ? highContrast
        ? '#F2F2F2'
        : '#9EABC2'
      : highContrast
        ? '#111111'
        : '#5E6D84';
  const textMuted = mode === 'dark' ? '#7D899E' : '#7A8AA1';
  const chip = withAlpha(accent, mode === 'dark' ? (highContrast ? 0.26 : 0.18) : highContrast ? 0.16 : 0.1);
  const accessibilityBg = highContrast
    ? mode === 'dark'
      ? '#000000'
      : '#FFFFFF'
    : withAlpha(secondary, mode === 'dark' ? 0.14 : 0.08);
  const focus = highContrast ? highlight : secondary;
  const buttonText = mode === 'dark' ? '#071118' : '#FFFFFF';

  return {
    signature: `${mode}-${paletteId}-${highContrast ? 'hc' : 'std'}-${fontScale}`,
    mode,
    paletteId,
    paletteLabel: palette.label,
    accent,
    secondary,
    highlight,
    background,
    surface,
    surfaceAlt,
    input,
    border,
    outline,
    textPrimary,
    textSecondary,
    textMuted,
    chip,
    accessibilityBg,
    focus,
    buttonText,
    highContrast,
    fontScale,
    followSystem,
    systemLabel,
  };
}

function OptionChip({
  label,
  active,
  accent,
  onPress,
}: {
  label: string;
  active: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.optionChip,
        active && {
          backgroundColor: withAlpha(accent, 0.16),
          borderColor: accent,
        },
      ]}
      onPress={onPress}>
      <Text style={[styles.optionChipText, active && {color: accent}]}>{label}</Text>
    </Pressable>
  );
}

function PaletteChip({
  paletteId,
  active,
  onPress,
}: {
  paletteId: PaletteId;
  active: boolean;
  onPress: () => void;
}) {
  const palette = PALETTES[paletteId];
  return (
    <Pressable
      style={[
        styles.paletteChip,
        active && {
          borderColor: palette.darkAccent,
          backgroundColor: withAlpha(palette.darkAccent, 0.14),
        },
      ]}
      onPress={onPress}>
      <View style={styles.paletteSwatches}>
        <View style={[styles.paletteDot, {backgroundColor: palette.darkAccent}]} />
        <View style={[styles.paletteDot, {backgroundColor: palette.lightAccent}]} />
        <View style={[styles.paletteDot, {backgroundColor: palette.highlight}]} />
      </View>
      <Text style={styles.paletteChipText}>{palette.label}</Text>
    </Pressable>
  );
}

function PreviewSurface({theme}: {theme: PreviewTheme}) {
  const titleSize = Math.round(24 * theme.fontScale);
  const bodySize = Math.round(13 * theme.fontScale);
  const captionSize = Math.round(11 * theme.fontScale);
  const metricValueSize = Math.round(18 * theme.fontScale);

  return (
    <View style={[styles.previewSurface, {backgroundColor: theme.background}]}>
      <View style={[styles.previewWindow, {backgroundColor: theme.surface, borderColor: theme.border}]}>
        <View style={[styles.previewToolbar, {backgroundColor: theme.surfaceAlt, borderBottomColor: theme.border}]}>
          <View style={styles.previewBrand}>
            <View style={[styles.previewBrandDot, {backgroundColor: theme.accent}]} />
            <View style={styles.previewBrandCopy}>
              <Text style={[styles.previewEyebrow, {color: theme.secondary, fontSize: Math.round(10 * theme.fontScale)}]}>
                THEME LAB
              </Text>
              <Text style={[styles.previewHeadline, {color: theme.textPrimary, fontSize: titleSize}]}>
                Cross-platform appearance
              </Text>
            </View>
          </View>
          <View style={[styles.previewBadge, {backgroundColor: theme.chip, borderColor: theme.outline}]}>
            <Text style={[styles.previewBadgeText, {color: theme.accent, fontSize: captionSize}]}>
              {theme.paletteLabel} {theme.mode.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.previewContent}>
          <View style={styles.previewMetricRow}>
            {[
              {label: 'System', value: theme.followSystem ? 'Auto' : 'Manual', tone: theme.highlight},
              {label: 'Fonts', value: `${Math.round(theme.fontScale * 100)}%`, tone: theme.secondary},
              {label: 'Contrast', value: theme.highContrast ? 'High' : 'Standard', tone: theme.accent},
            ].map(item => (
              <View
                key={item.label}
                style={[styles.previewMetricCard, {backgroundColor: theme.surfaceAlt, borderColor: theme.border}]}>
                <Text style={[styles.previewMetricLabel, {color: theme.textMuted, fontSize: captionSize}]}>
                  {item.label}
                </Text>
                <Text style={[styles.previewMetricValue, {color: item.tone, fontSize: metricValueSize}]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.previewPaneRow}>
            <View style={[styles.previewPane, {backgroundColor: theme.surfaceAlt, borderColor: theme.border}]}>
              <Text style={[styles.previewPaneTitle, {color: theme.textPrimary, fontSize: Math.round(15 * theme.fontScale)}]}>
                Palette sync
              </Text>
              <Text style={[styles.previewPaneBody, {color: theme.textSecondary, fontSize: bodySize}]}>
                Accent, neutrals and status colors stay coherent across dark and light modes.
              </Text>
              <View style={styles.previewSwatches}>
                <View style={[styles.previewSwatch, {backgroundColor: theme.accent}]} />
                <View style={[styles.previewSwatch, {backgroundColor: theme.secondary}]} />
                <View style={[styles.previewSwatch, {backgroundColor: theme.highlight}]} />
              </View>
            </View>

            <View style={[styles.previewPane, {backgroundColor: theme.surfaceAlt, borderColor: theme.border}]}>
              <Text style={[styles.previewPaneTitle, {color: theme.textPrimary, fontSize: Math.round(15 * theme.fontScale)}]}>
                Accessibility
              </Text>
              <Text style={[styles.previewPaneBody, {color: theme.textSecondary, fontSize: bodySize}]}>
                Font scaling and high contrast raise legibility without breaking the layout.
              </Text>
              <View
                style={[
                  styles.previewFocusCard,
                  {
                    backgroundColor: theme.accessibilityBg,
                    borderColor: theme.focus,
                  },
                ]}>
                <Text style={[styles.previewFocusText, {color: theme.textPrimary, fontSize: bodySize}]}>
                  Focus ring ready
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.previewInputShell, {backgroundColor: theme.input, borderColor: theme.border}]}>
            <Text style={[styles.previewInputText, {color: theme.textSecondary, fontSize: bodySize}]}>
              Search demos, layouts, charts...
            </Text>
            <Text style={[styles.previewInputHint, {color: theme.textMuted, fontSize: captionSize}]}>CMD+K</Text>
          </View>

          <View style={styles.previewButtonRow}>
            <View style={[styles.previewPrimaryButton, {backgroundColor: theme.accent}]}>
              <Text style={[styles.previewPrimaryText, {color: theme.buttonText, fontSize: bodySize}]}>
                Apply theme
              </Text>
            </View>
            <View
              style={[
                styles.previewSecondaryButton,
                {
                  backgroundColor: theme.surfaceAlt,
                  borderColor: theme.border,
                },
              ]}>
              <Text style={[styles.previewSecondaryText, {color: theme.textPrimary, fontSize: bodySize}]}>
                Preview contrast
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.previewNotice,
              {
                backgroundColor: theme.accessibilityBg,
                borderColor: theme.focus,
              },
            ]}>
            <Text style={[styles.previewNoticeText, {color: theme.textPrimary, fontSize: bodySize}]}>
              Animated transitions fade between profiles in 280ms while preserving readable type.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ThemesScreen() {
  const {width} = useWindowDimensions();
  const systemScheme = useColorScheme();
  const systemMode: ResolvedMode = systemScheme === 'light' ? 'light' : 'dark';
  const [modePreference, setModePreference] = useState<ModePreference>('system');
  const [paletteId, setPaletteId] = useState<PaletteId>('neon');
  const [fontScale, setFontScale] = useState<number>(1);
  const [highContrast, setHighContrast] = useState(false);
  const effectiveMode: ResolvedMode =
    modePreference === 'system' ? systemMode : modePreference;
  const transitionOpacity = useRef(new Animated.Value(0)).current;
  const nextTheme = buildPreviewTheme({
    mode: effectiveMode,
    paletteId,
    highContrast,
    fontScale,
    followSystem: modePreference === 'system',
    systemLabel: systemMode,
  });
  const [committedTheme, setCommittedTheme] = useState(nextTheme);
  const [transitionTheme, setTransitionTheme] = useState<PreviewTheme | null>(null);
  const fullWidth = width - Spacing.lg * 2;
  const halfWidth = width >= 1080 ? (fullWidth - Spacing.md) / 2 : fullWidth;
  const previewHeight = width >= 960 ? 500 : 620;

  useEffect(() => {
    if (nextTheme.signature === committedTheme.signature) {
      return;
    }

    transitionOpacity.stopAnimation();
    setTransitionTheme(nextTheme);
    transitionOpacity.setValue(0);

    Animated.timing(transitionOpacity, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (!finished) {
        return;
      }
      setCommittedTheme(nextTheme);
      setTransitionTheme(null);
      transitionOpacity.setValue(0);
    });
  }, [committedTheme.signature, nextTheme, transitionOpacity]);

  return (
    <ScreenContainer>
      <View style={styles.root}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PHASE 8.3</Text>
          <Text style={styles.title}>Themes & Appearance</Text>
          <Text style={styles.body}>
            Theme orchestration with dark, light and system modes, animated transitions, four
            palettes, accessibility font scaling and high-contrast previews.
          </Text>
          <View style={styles.pills}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>8 demos</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>System {systemMode}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>
                {modePreference === 'system' ? 'Auto sync' : 'Manual mode'}
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{Math.round(fontScale * 100)}% fonts</Text>
            </View>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.card, {width: halfWidth}]}>
            <Text style={styles.cardTitle}>Theme mode</Text>
            <Text style={styles.cardSubtitle}>
              Toggle between explicit light and dark modes or follow the current system theme.
            </Text>
            <View style={styles.wrap}>
              {MODE_OPTIONS.map(mode => (
                <OptionChip
                  key={mode}
                  label={mode}
                  active={modePreference === mode}
                  accent={nextTheme.accent}
                  onPress={() => setModePreference(mode)}
                />
              ))}
            </View>
            <View style={styles.infoStack}>
              <Text style={styles.infoLabel}>Detected system theme</Text>
              <Text style={styles.infoValue}>{systemMode}</Text>
            </View>
            <View style={styles.infoStack}>
              <Text style={styles.infoLabel}>Current theme source</Text>
              <Text style={styles.infoValue}>
                {modePreference === 'system' ? 'Following device appearance' : 'Manual override'}
              </Text>
            </View>
          </View>

          <View style={[styles.card, {width: halfWidth}]}>
            <Text style={styles.cardTitle}>Palette and accessibility</Text>
            <Text style={styles.cardSubtitle}>
              Four palette directions plus scalable type and high-contrast tuning.
            </Text>
            <View style={styles.paletteGrid}>
              {(Object.keys(PALETTES) as PaletteId[]).map(item => (
                <PaletteChip
                  key={item}
                  paletteId={item}
                  active={paletteId === item}
                  onPress={() => setPaletteId(item)}
                />
              ))}
            </View>
            <View style={styles.wrap}>
              {FONT_OPTIONS.map(option => (
                <OptionChip
                  key={option}
                  label={`${Math.round(option * 100)}%`}
                  active={fontScale === option}
                  accent={nextTheme.secondary}
                  onPress={() => setFontScale(option)}
                />
              ))}
            </View>
            <Pressable
              style={[
                styles.contrastToggle,
                {
                  borderColor: highContrast ? nextTheme.highlight : Colors.border,
                  backgroundColor: highContrast
                    ? withAlpha(nextTheme.highlight, 0.14)
                    : Colors.surface,
                },
              ]}
              onPress={() => setHighContrast(previous => !previous)}>
              <View>
                <Text style={styles.infoLabel}>High contrast mode</Text>
                <Text style={styles.infoValue}>
                  {highContrast ? 'Enabled for stronger outlines and text' : 'Standard contrast profile'}
                </Text>
              </View>
              <View
                style={[
                  styles.togglePill,
                  {
                    backgroundColor: highContrast ? nextTheme.highlight : Colors.border,
                  },
                ]}>
                <Text style={[styles.togglePillText, {color: highContrast ? '#081018' : Colors.textSecondary}]}>
                  {highContrast ? 'ON' : 'OFF'}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, {width: fullWidth}]}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.cardTitle}>Animated transition preview</Text>
              <Text style={styles.cardSubtitle}>
                Every mode, palette or accessibility change crossfades the surface and updates the
                same shell layout.
              </Text>
            </View>
            <View style={[styles.liveBadge, {borderColor: nextTheme.accent}]}>
              <Text style={[styles.liveBadgeText, {color: nextTheme.accent}]}>280ms fade</Text>
            </View>
          </View>

          <View style={[styles.previewHost, {height: previewHeight}]}>
            <PreviewSurface theme={committedTheme} />
            {transitionTheme ? (
              <Animated.View
                style={[
                  StyleSheet.absoluteFillObject,
                  {
                    opacity: transitionOpacity,
                  },
                ]}>
                <PreviewSurface theme={transitionTheme} />
              </Animated.View>
            ) : null}
          </View>
        </View>

        <View style={styles.grid}>
          <View style={[styles.card, {width: halfWidth}]}>
            <Text style={styles.cardTitle}>System detection</Text>
            <Text style={styles.cardSubtitle}>
              `useColorScheme()` feeds the current device preference and the preview follows it
              when auto sync stays enabled.
            </Text>
            <View style={styles.detailList}>
              <Text style={styles.detailItem}>System theme: {systemMode}</Text>
              <Text style={styles.detailItem}>
                Theme source: {modePreference === 'system' ? 'system' : 'manual'}
              </Text>
              <Text style={styles.detailItem}>
                Active palette: {PALETTES[paletteId].label}
              </Text>
            </View>
          </View>

          <View style={[styles.card, {width: halfWidth}]}>
            <Text style={styles.cardTitle}>Current profile</Text>
            <Text style={styles.cardSubtitle}>
              The active preview state combines palette, mode, font scaling and contrast into one
              appearance profile.
            </Text>
            <View style={styles.detailList}>
              <Text style={styles.detailItem}>Resolved mode: {effectiveMode}</Text>
              <Text style={styles.detailItem}>Font scale: {Math.round(fontScale * 100)}%</Text>
              <Text style={styles.detailItem}>
                Contrast: {highContrast ? 'high' : 'standard'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  hero: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.8,
    color: Colors.primary,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    textTransform: 'capitalize',
  },
  infoStack: {
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    lineHeight: 18,
    color: Colors.textPrimary,
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  paletteChip: {
    minWidth: 116,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: Spacing.sm,
  },
  paletteSwatches: {
    flexDirection: 'row',
    gap: 6,
  },
  paletteDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  paletteChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  contrastToggle: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  togglePill: {
    minWidth: 54,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  togglePillText: {
    fontSize: 12,
    fontWeight: '900',
  },
  previewHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  liveBadge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  previewHost: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewSurface: {
    flex: 1,
    padding: Spacing.lg,
  },
  previewWindow: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewToolbar: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  previewBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  previewBrandDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  previewBrandCopy: {
    gap: 2,
  },
  previewEyebrow: {
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  previewHeadline: {
    fontWeight: '900',
  },
  previewBadge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  previewBadgeText: {
    fontWeight: '800',
  },
  previewContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  previewMetricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  previewMetricCard: {
    flex: 1,
    minWidth: 120,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: 4,
  },
  previewMetricLabel: {
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  previewMetricValue: {
    fontWeight: '900',
  },
  previewPaneRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  previewPane: {
    flex: 1,
    minWidth: 220,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  previewPaneTitle: {
    fontWeight: '800',
  },
  previewPaneBody: {
    lineHeight: 20,
  },
  previewSwatches: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  previewSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  previewFocusCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  previewFocusText: {
    fontWeight: '800',
  },
  previewInputShell: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  previewInputText: {
    flex: 1,
  },
  previewInputHint: {
    fontWeight: '800',
  },
  previewButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  previewPrimaryButton: {
    flex: 1,
    minWidth: 150,
    borderRadius: Radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  previewPrimaryText: {
    fontWeight: '900',
  },
  previewSecondaryButton: {
    flex: 1,
    minWidth: 150,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  previewSecondaryText: {
    fontWeight: '800',
  },
  previewNotice: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  previewNoticeText: {
    lineHeight: 20,
  },
  detailList: {
    gap: Spacing.sm,
  },
  detailItem: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textPrimary,
  },
});
