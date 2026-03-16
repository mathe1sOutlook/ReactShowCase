import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  type DimensionValue,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing, Typography} from '../theme';

type CaptureKind = 'photo' | 'video';
type LensMode = 'rear' | 'front';
type FlashMode = 'off' | 'auto' | 'on';
type CropPreset = '1:1' | '4:5' | '16:9';
type SizePreset = '1080x1080' | '1080x1350' | '1920x1080';

type MediaItem = {
  id: string;
  kind: CaptureKind;
  title: string;
  tint: string;
  accent: string;
  lens: LensMode;
  flash: FlashMode;
  brightness: number;
  contrast: number;
  sepia: number;
  crop: CropPreset;
  size: SizePreset;
  duration?: string;
  createdAt: string;
  note: string;
};

type ComposerState = {
  brightness: number;
  contrast: number;
  sepia: number;
  crop: CropPreset;
  size: SizePreset;
};

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

type AdjusterProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

type StatProps = {
  label: string;
  value: string;
  accent: string;
};

type PhotoSurfaceProps = {
  item: MediaItem;
  live?: boolean;
  mirrored?: boolean;
  recording?: boolean;
  crop?: CropPreset;
};

const MEDIA_COLORS = [
  {tint: '#244d7a', accent: '#8be3ff'},
  {tint: '#5e3c99', accent: '#f6a6ff'},
  {tint: '#2f6d4e', accent: '#bfffd2'},
  {tint: '#7a4a22', accent: '#ffd79a'},
  {tint: '#6b2447', accent: '#ff9fc1'},
  {tint: '#374151', accent: '#ffd66b'},
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

function cropBounds(crop: CropPreset) {
  switch (crop) {
    case '1:1':
      return {width: '58%' as DimensionValue, height: '58%' as DimensionValue};
    case '16:9':
      return {width: '78%' as DimensionValue, height: '44%' as DimensionValue};
    default:
      return {width: '54%' as DimensionValue, height: '68%' as DimensionValue};
  }
}

function buildSeedMedia(): MediaItem[] {
  const titles = [
    'Morning harbor',
    'Neon lobby',
    'Forest trail',
    'Studio shelf',
    'Metro line',
    'Courtyard',
  ];

  return titles.map((title, index) => ({
    id: `seed-${index + 1}`,
    kind: index % 3 === 0 ? 'video' : 'photo',
    title,
    tint: MEDIA_COLORS[index % MEDIA_COLORS.length].tint,
    accent: MEDIA_COLORS[index % MEDIA_COLORS.length].accent,
    lens: index % 2 === 0 ? 'rear' : 'front',
    flash: index % 3 === 0 ? 'auto' : 'off',
    brightness: 0.05 * (index % 3),
    contrast: 0.08 * (index % 4),
    sepia: 0.12 * (index % 2),
    crop: index % 2 === 0 ? '4:5' : '16:9',
    size: index % 2 === 0 ? '1080x1350' : '1920x1080',
    duration: index % 3 === 0 ? formatDuration(12 + index * 9) : undefined,
    createdAt: `2026-03-${String(index + 5).padStart(2, '0')}`,
    note:
      index % 3 === 0
        ? 'Captured as a short motion study with the video pipeline enabled.'
        : 'Captured as a still frame with live crop, resize and filter tuning.',
  }));
}

function createCapture(
  index: number,
  kind: CaptureKind,
  lens: LensMode,
  flash: FlashMode,
  composer: ComposerState,
  seconds?: number,
): MediaItem {
  const palette = MEDIA_COLORS[index % MEDIA_COLORS.length];
  return {
    id: `capture-${Date.now()}-${index}`,
    kind,
    title: kind === 'photo' ? `Capture ${index + 1}` : `Clip ${index + 1}`,
    tint: palette.tint,
    accent: palette.accent,
    lens,
    flash,
    brightness: composer.brightness,
    contrast: composer.contrast,
    sepia: composer.sepia,
    crop: composer.crop,
    size: composer.size,
    duration: kind === 'video' ? formatDuration(seconds ?? 0) : undefined,
    createdAt: '2026-03-15',
    note:
      kind === 'photo'
        ? 'Fresh still captured from the live camera surface.'
        : 'Recorded clip generated from the live video timeline.',
  };
}

function Chip({label, active, onPress}: ChipProps) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Stat({label, value, accent}: StatProps) {
  return (
    <View style={[styles.statCard, {borderColor: accent}]}> 
      <Text style={[styles.statValue, {color: accent}]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Adjuster({label, value, onChange}: AdjusterProps) {
  const percent = Math.round(value * 100);
  return (
    <View style={styles.adjusterCard}>
      <View style={styles.adjusterHeader}>
        <Text style={styles.adjusterLabel}>{label}</Text>
        <Text style={styles.adjusterValue}>{percent}%</Text>
      </View>
      <View style={styles.adjusterTrack}>
        <View style={[styles.adjusterFill, {width: `${percent}%`}]} />
      </View>
      <View style={styles.adjusterActions}>
        <Pressable onPress={() => onChange(clamp(value - 0.08, 0, 1))} style={styles.adjusterButton}>
          <Text style={styles.adjusterButtonText}>-</Text>
        </Pressable>
        <Pressable onPress={() => onChange(clamp(value + 0.08, 0, 1))} style={styles.adjusterButton}>
          <Text style={styles.adjusterButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PhotoSurface({item, live, mirrored, recording, crop}: PhotoSurfaceProps) {
  const sceneScale = 1 + item.contrast * 0.16;
  const brightnessShade = clamp(0.22 - item.brightness * 0.18, 0.02, 0.22);
  const sepiaOpacity = item.sepia * 0.28;
  const cropRect = cropBounds(crop ?? item.crop);

  return (
    <View style={styles.surfaceFrame}>
      <View style={[styles.surfaceFill, {backgroundColor: item.tint}]} />
      <Animated.View
        style={[
          styles.surfaceScene,
          mirrored && {transform: [{scaleX: -1}, {scale: sceneScale}]},
          !mirrored && {transform: [{scale: sceneScale}]},
        ]}>
        <View style={[styles.surfaceSun, {backgroundColor: item.accent}]} />
        <View style={[styles.surfaceHillLarge, {backgroundColor: `${item.accent}44`}]} />
        <View style={styles.surfaceHillSmall} />
        <View style={styles.surfaceTower} />
        <View style={[styles.surfaceAccent, {backgroundColor: item.accent}]} />
      </Animated.View>
      <View style={[styles.surfaceGlow, {backgroundColor: item.accent, opacity: 0.22 + item.brightness * 0.18}]} />
      <View style={[styles.surfaceSepia, {opacity: sepiaOpacity}]} />
      <View style={[styles.surfaceShade, {opacity: brightnessShade}]} />
      <View style={[styles.cropOverlay, cropRect]} />
      <View style={styles.surfaceHudTop}>
        <Text style={styles.surfaceHudText}>{live ? 'LIVE PREVIEW' : item.kind.toUpperCase()}</Text>
        <Text style={styles.surfaceHudText}>{item.lens.toUpperCase()} / FLASH {item.flash.toUpperCase()}</Text>
      </View>
      <View style={styles.surfaceHudBottom}>
        <Text style={styles.surfaceHudText}>{item.size}</Text>
        <Text style={styles.surfaceHudText}>{item.crop}</Text>
      </View>
      {recording ? (
        <View style={styles.recordingBadge}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingText}>REC</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function MediaScreen() {
  const initialGallery = useMemo(() => buildSeedMedia(), []);
  const [gallery, setGallery] = useState(initialGallery);
  const [selectedId, setSelectedId] = useState(initialGallery[0].id);
  const [lens, setLens] = useState<LensMode>('rear');
  const [flash, setFlash] = useState<FlashMode>('auto');
  const [captureMode, setCaptureMode] = useState<CaptureKind>('photo');
  const [composer, setComposer] = useState<ComposerState>({
    brightness: 0.24,
    contrast: 0.32,
    sepia: 0.12,
    crop: '4:5',
    size: '1080x1350',
  });
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [feedback, setFeedback] = useState('Camera surface ready for stills and short clips.');
  const scanAnim = useRef(new Animated.Value(0)).current;
  const shutterAnim = useRef(new Animated.Value(0)).current;
  const viewerScale = useRef(new Animated.Value(1)).current;
  const viewerScaleRef = useRef(1);
  const pinchStartDistanceRef = useRef(0);
  const pinchStartScaleRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedItem = gallery.find(item => item.id === selectedId) ?? gallery[0];

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanAnim, {
        toValue: 1,
        duration: 2400,
        useNativeDriver: true,
      }),
    ).start();
  }, [scanAnim]);

  useEffect(() => {
    setComposer({
      brightness: selectedItem.brightness,
      contrast: selectedItem.contrast,
      sepia: selectedItem.sepia,
      crop: selectedItem.crop,
      size: selectedItem.size,
    });
    setLens(selectedItem.lens);
    setFlash(selectedItem.flash);
  }, [selectedItem]);

  useEffect(() => {
    if (!recording) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setRecordSeconds(current => current + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [recording]);

  const livePreview = useMemo<MediaItem>(
    () => ({
      id: 'live-preview',
      kind: captureMode,
      title: captureMode === 'photo' ? 'Live still preview' : 'Live video preview',
      tint: lens === 'rear' ? '#264b74' : '#5f3e89',
      accent: lens === 'rear' ? '#97e6ff' : '#f0b8ff',
      lens,
      flash,
      brightness: composer.brightness,
      contrast: composer.contrast,
      sepia: composer.sepia,
      crop: composer.crop,
      size: composer.size,
      duration: recording ? formatDuration(recordSeconds) : undefined,
      createdAt: 'LIVE',
      note: 'Live camera surface tuned by crop, resize and filter controls.',
    }),
    [captureMode, composer, flash, lens, recordSeconds, recording],
  );

  const viewResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: event => event.nativeEvent.touches.length >= 2,
        onMoveShouldSetPanResponder: event => event.nativeEvent.touches.length >= 2,
        onPanResponderGrant: event => {
          const [a, b] = event.nativeEvent.touches;
          if (!a || !b) {
            return;
          }
          const dx = a.pageX - b.pageX;
          const dy = a.pageY - b.pageY;
          pinchStartDistanceRef.current = Math.hypot(dx, dy);
          pinchStartScaleRef.current = viewerScaleRef.current;
        },
        onPanResponderMove: event => {
          const [a, b] = event.nativeEvent.touches;
          if (!a || !b || pinchStartDistanceRef.current === 0) {
            return;
          }
          const dx = a.pageX - b.pageX;
          const dy = a.pageY - b.pageY;
          const distance = Math.hypot(dx, dy);
          const next = clamp(
            pinchStartScaleRef.current * (distance / pinchStartDistanceRef.current),
            1,
            3,
          );
          viewerScaleRef.current = next;
          viewerScale.setValue(next);
        },
        onPanResponderRelease: () => {
          pinchStartDistanceRef.current = 0;
        },
        onPanResponderTerminate: () => {
          pinchStartDistanceRef.current = 0;
        },
      }),
    [viewerScale],
  );

  const scanTranslate = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 180],
  });

  function syncSelected(partial: Partial<MediaItem>) {
    setGallery(current =>
      current.map(item => (item.id === selectedId ? {...item, ...partial} : item)),
    );
  }

  function updateComposer<Key extends keyof ComposerState>(key: Key, value: ComposerState[Key]) {
    setComposer(current => ({...current, [key]: value}));
    syncSelected({[key]: value} as Partial<MediaItem>);
  }

  function triggerShutter() {
    shutterAnim.setValue(0.92);
    Animated.timing(shutterAnim, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }

  function capturePhoto() {
    triggerShutter();
    const capture = createCapture(gallery.length, 'photo', lens, flash, composer);
    setGallery(current => [capture, ...current]);
    setSelectedId(capture.id);
    setCaptureMode('photo');
    setFeedback('Photo captured and pushed into the gallery grid.');
  }

  function toggleRecording() {
    if (!recording) {
      setCaptureMode('video');
      setRecordSeconds(0);
      setRecording(true);
      setFeedback('Video recording started from the live preview.');
      return;
    }

    const clip = createCapture(gallery.length, 'video', lens, flash, composer, recordSeconds);
    setRecording(false);
    setGallery(current => [clip, ...current]);
    setSelectedId(clip.id);
    setFeedback(`Video clip saved with duration ${clip.duration}.`);
  }

  function resetZoom() {
    viewerScaleRef.current = 1;
    Animated.spring(viewerScale, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 6,
    }).start();
  }

  return (
    <ScreenContainer>
      <View style={styles.section}>
        <Text style={styles.eyebrow}>Phase 5.1</Text>
        <Text style={styles.title}>Camera and Photos Lab</Text>
        <Text style={styles.subtitle}>
          Live camera preview, front and rear lens switching, flash states, still capture, video
          recording, gallery browsing, pinch zoom viewer, crop presets, resize presets and photo
          filters in one workflow.
        </Text>
        <View style={styles.statsRow}>
          <Stat label="Gallery items" value={`${gallery.length}`} accent={Colors.primary} />
          <Stat label="Videos" value={`${gallery.filter(item => item.kind === 'video').length}`} accent={Colors.error} />
          <Stat label="Zoom" value={`${viewerScaleRef.current.toFixed(1)}x`} accent={Colors.warning} />
          <Stat label="Current output" value={composer.size} accent={Colors.success} />
        </View>
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Workflow status</Text>
          <Text style={styles.feedbackCopy}>{feedback}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Camera controls</Text>
        <Text style={styles.sectionCopy}>
          The preview reacts live to lens, flash, crop and filter adjustments before each capture.
        </Text>

        <View style={styles.toolbarGroup}>
          <Text style={styles.toolbarLabel}>Lens</Text>
          <View style={styles.chipRow}>
            {(['rear', 'front'] as LensMode[]).map(option => (
              <Chip
                key={option}
                label={option === 'rear' ? 'Rear camera' : 'Front camera'}
                active={lens === option}
                onPress={() => {
                  setLens(option);
                  syncSelected({lens: option});
                }}
              />
            ))}
          </View>
        </View>

        <View style={styles.toolbarGroup}>
          <Text style={styles.toolbarLabel}>Flash</Text>
          <View style={styles.chipRow}>
            {(['off', 'auto', 'on'] as FlashMode[]).map(option => (
              <Chip
                key={option}
                label={`Flash ${option}`}
                active={flash === option}
                onPress={() => {
                  setFlash(option);
                  syncSelected({flash: option});
                }}
              />
            ))}
          </View>
        </View>

        <View style={styles.toolbarGroup}>
          <Text style={styles.toolbarLabel}>Capture mode</Text>
          <View style={styles.chipRow}>
            {(['photo', 'video'] as CaptureKind[]).map(option => (
              <Chip
                key={option}
                label={option === 'photo' ? 'Still photo' : 'Video clip'}
                active={captureMode === option}
                onPress={() => setCaptureMode(option)}
              />
            ))}
          </View>
        </View>

        <View style={styles.previewCard}>
          <Animated.View style={[styles.scanLine, {transform: [{translateY: scanTranslate}]}]} />
          <PhotoSurface
            item={livePreview}
            live
            mirrored={lens === 'front'}
            recording={recording}
            crop={composer.crop}
          />
          <Animated.View
            pointerEvents="none"
            style={[styles.shutterOverlay, {opacity: shutterAnim}]}
          />
        </View>

        <View style={styles.captureActions}>
          <Pressable onPress={capturePhoto} style={styles.capturePrimary}>
            <Text style={styles.capturePrimaryText}>Capture photo</Text>
          </Pressable>
          <Pressable
            onPress={toggleRecording}
            style={[styles.captureSecondary, recording && styles.captureSecondaryActive]}>
            <Text style={styles.captureSecondaryText}>
              {recording ? `Stop video ${formatDuration(recordSeconds)}` : 'Record video'}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Viewer and editing</Text>
        <Text style={styles.sectionCopy}>
          Select any gallery item, pinch inside the viewer to zoom, then tune crop, output size and
          color filters.
        </Text>

        <View style={styles.viewerCard}>
          <View style={styles.viewerHeader}>
            <View>
              <Text style={styles.viewerTitle}>{selectedItem.title}</Text>
              <Text style={styles.viewerMeta}>
                {selectedItem.kind.toUpperCase()} | {selectedItem.createdAt}
                {selectedItem.duration ? ` | ${selectedItem.duration}` : ''}
              </Text>
            </View>
            <Pressable onPress={resetZoom} style={styles.viewerReset}>
              <Text style={styles.viewerResetText}>Reset zoom</Text>
            </Pressable>
          </View>

          <View style={styles.viewerSurface} {...viewResponder.panHandlers}>
            <Animated.View style={{transform: [{scale: viewerScale}]}}>
              <PhotoSurface item={selectedItem} crop={composer.crop} />
            </Animated.View>
          </View>

          <View style={styles.toolbarGroup}>
            <Text style={styles.toolbarLabel}>Crop preset</Text>
            <View style={styles.chipRow}>
              {(['1:1', '4:5', '16:9'] as CropPreset[]).map(option => (
                <Chip
                  key={option}
                  label={option}
                  active={composer.crop === option}
                  onPress={() => updateComposer('crop', option)}
                />
              ))}
            </View>
          </View>

          <View style={styles.toolbarGroup}>
            <Text style={styles.toolbarLabel}>Resize output</Text>
            <View style={styles.chipRow}>
              {(['1080x1080', '1080x1350', '1920x1080'] as SizePreset[]).map(option => (
                <Chip
                  key={option}
                  label={option}
                  active={composer.size === option}
                  onPress={() => updateComposer('size', option)}
                />
              ))}
            </View>
          </View>

          <View style={styles.adjusterGrid}>
            <Adjuster
              label="Brightness"
              value={composer.brightness}
              onChange={value => updateComposer('brightness', value)}
            />
            <Adjuster
              label="Contrast"
              value={composer.contrast}
              onChange={value => updateComposer('contrast', value)}
            />
            <Adjuster
              label="Sepia"
              value={composer.sepia}
              onChange={value => updateComposer('sepia', value)}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gallery grid</Text>
        <Text style={styles.sectionCopy}>
          Every capture is inserted into the gallery. Tap a tile to open it in the viewer and keep
          editing the same media asset.
        </Text>

        <View style={styles.galleryGrid}>
          {gallery.map(item => {
            const selected = item.id === selectedId;
            return (
              <Pressable
                key={item.id}
                onPress={() => {
                  setSelectedId(item.id);
                  setFeedback(`${item.title} loaded into the viewer.`);
                }}
                style={[styles.galleryTile, selected && styles.galleryTileSelected]}>
                <PhotoSurface item={item} crop={item.crop} />
                <View style={styles.galleryMeta}>
                  <Text style={styles.galleryTitle}>{item.title}</Text>
                  <Text style={styles.gallerySubtitle}>
                    {item.kind === 'video' ? `Video ${item.duration}` : 'Photo'} | {item.size}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
  },
  eyebrow: {
    ...Typography.label,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  statCard: {
    minWidth: 120,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    backgroundColor: Colors.bgCardAlt,
  },
  statValue: {
    ...Typography.h3,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  feedbackCard: {
    marginTop: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgCardAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedbackTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  feedbackCopy: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  sectionCopy: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  toolbarGroup: {
    marginTop: Spacing.md,
  },
  toolbarLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}22`,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.textPrimary,
  },
  previewCard: {
    marginTop: Spacing.lg,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    height: 320,
    justifyContent: 'center',
  },
  scanLine: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: `${Colors.primary}80`,
    zIndex: 3,
  },
  shutterOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
    zIndex: 4,
  },
  surfaceFrame: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    margin: Spacing.md,
    flex: 1,
    minHeight: 180,
  },
  surfaceFill: {
    ...StyleSheet.absoluteFillObject,
  },
  surfaceScene: {
    ...StyleSheet.absoluteFillObject,
  },
  surfaceSun: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: Radius.full,
    top: 26,
    right: 34,
    opacity: 0.9,
  },
  surfaceHillLarge: {
    position: 'absolute',
    left: -12,
    right: -12,
    bottom: 0,
    height: '38%',
    borderTopLeftRadius: 80,
    borderTopRightRadius: 120,
  },
  surfaceHillSmall: {
    position: 'absolute',
    left: '18%',
    bottom: '20%',
    width: '52%',
    height: '24%',
    borderRadius: 80,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  surfaceTower: {
    position: 'absolute',
    bottom: '24%',
    left: '24%',
    width: 18,
    height: 94,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  surfaceAccent: {
    position: 'absolute',
    bottom: '33%',
    left: '58%',
    width: 84,
    height: 14,
    borderRadius: Radius.full,
    opacity: 0.58,
  },
  surfaceGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  surfaceSepia: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0d2a2',
  },
  surfaceShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  cropOverlay: {
    position: 'absolute',
    top: '16%',
    left: '20%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.88)',
    borderRadius: Radius.md,
  },
  surfaceHudTop: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  surfaceHudBottom: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  surfaceHudText: {
    ...Typography.caption,
    color: Colors.white,
  },
  recordingBadge: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.error,
  },
  recordingText: {
    ...Typography.caption,
    color: Colors.white,
  },
  captureActions: {
    marginTop: Spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  capturePrimary: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  capturePrimaryText: {
    ...Typography.caption,
    color: Colors.bg,
  },
  captureSecondary: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
  },
  captureSecondaryActive: {
    borderColor: Colors.error,
    backgroundColor: `${Colors.error}22`,
  },
  captureSecondaryText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  viewerCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    overflow: 'hidden',
  },
  viewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  viewerMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  viewerReset: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  viewerResetText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  viewerSurface: {
    minHeight: 320,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  adjusterGrid: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  adjusterCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
    padding: Spacing.md,
  },
  adjusterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adjusterLabel: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  adjusterValue: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  adjusterTrack: {
    height: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  adjusterFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  adjusterActions: {
    marginTop: Spacing.sm,
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  adjusterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
  },
  adjusterButtonText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  galleryTile: {
    width: '47%',
    minWidth: 250,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    overflow: 'hidden',
  },
  galleryTileSelected: {
    borderColor: Colors.primary,
  },
  galleryMeta: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: 2,
  },
  galleryTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  gallerySubtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});
