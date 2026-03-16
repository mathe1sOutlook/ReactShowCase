import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Platform, Pressable, StyleSheet, Text, type DimensionValue, View} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing, Typography} from '../theme';

type AspectPreset = '16:9' | '4:5' | '1:1';
type SpeedPreset = 0.5 | 1 | 1.5 | 2;

type VideoAsset = {
  id: string;
  title: string;
  createdAt: string;
  durationSec: number;
  aspect: AspectPreset;
  accent: string;
  genre: string;
  note: string;
};

type ChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

type StatProps = {
  label: string;
  value: string;
  accent: string;
};

type ThumbnailProps = {
  asset: VideoAsset;
  timeSec: number;
  active: boolean;
  onPress: () => void;
};

type SurfaceProps = {
  asset: VideoAsset;
  ratio: number;
  fullscreen?: boolean;
  compact?: boolean;
};

const PALETTE = [
  Colors.primary,
  Colors.secondary,
  Colors.accent,
  Colors.success,
  Colors.warning,
  Colors.error,
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatDuration(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${mins}:${secs}`;
}

function aspectRatioFor(aspect: AspectPreset) {
  switch (aspect) {
    case '4:5':
      return 4 / 5;
    case '1:1':
      return 1;
    default:
      return 16 / 9;
  }
}

function buildAssets() {
  return [
    {
      id: 'video-1',
      title: 'Launch teaser',
      createdAt: '2026-03-08 08:45',
      durationSec: 94,
      aspect: '16:9',
      accent: PALETTE[0],
      genre: 'Promo',
      note: 'Fast cut teaser used for campaign previews and fullscreen playback checks.',
    },
    {
      id: 'video-2',
      title: 'Portrait interview',
      createdAt: '2026-03-09 14:10',
      durationSec: 126,
      aspect: '4:5',
      accent: PALETTE[1],
      genre: 'Interview',
      note: 'Vertical-safe edit that is ideal for seek and thumbnail validation.',
    },
    {
      id: 'video-3',
      title: 'Square product loop',
      createdAt: '2026-03-10 18:22',
      durationSec: 72,
      aspect: '1:1',
      accent: PALETTE[2],
      genre: 'Loop',
      note: 'Short looping piece for PiP and thumbnail generation demos.',
    },
    {
      id: 'video-4',
      title: 'Field walkthrough',
      createdAt: '2026-03-12 07:15',
      durationSec: 148,
      aspect: '16:9',
      accent: PALETTE[3],
      genre: 'Documentary',
      note: 'Longer timeline that makes scrubbing and stop behavior easier to verify.',
    },
  ] satisfies VideoAsset[];
}

function buildThumbnailTimes(durationSec: number) {
  const count = 8;
  return Array.from({length: count}, (_, index) =>
    Math.round((durationSec / Math.max(count - 1, 1)) * index),
  );
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

function Surface({asset, ratio, fullscreen, compact}: SurfaceProps) {
  const pulseWidth = 14 + ratio * 48;
  const pulseX = `${18 + ratio * 54}%` as DimensionValue;
  const horizonY = `${56 - ratio * 12}%` as DimensionValue;

  return (
    <View
      style={[
        styles.surfaceFrame,
        {aspectRatio: aspectRatioFor(asset.aspect)},
        compact && styles.surfaceFrameCompact,
        fullscreen && styles.surfaceFrameFullscreen,
        {backgroundColor: `${asset.accent}22`},
      ]}>
      <View style={[styles.surfaceFill, {backgroundColor: asset.accent}]} />
      <View style={styles.surfaceShadeTop} />
      <View style={styles.surfaceShadeBottom} />
      <View style={[styles.surfaceOrb, {left: pulseX, width: pulseWidth, height: pulseWidth}]} />
      <View style={[styles.surfaceHorizon, {top: horizonY}]} />
      <View style={styles.surfaceStructure} />
      <View style={styles.surfaceStructureSmall} />
      <View style={styles.surfaceTrack}>
        <View style={[styles.surfaceTrackFill, {width: `${ratio * 100}%`, backgroundColor: asset.accent}]} />
      </View>
      <View style={styles.surfaceHudTop}>
        <Text style={styles.surfaceHudText}>{asset.genre.toUpperCase()}</Text>
        <Text style={styles.surfaceHudText}>{asset.aspect}</Text>
      </View>
      <View style={styles.surfaceHudBottom}>
        <Text style={styles.surfaceHudText}>{asset.title}</Text>
        <Text style={styles.surfaceHudText}>{Math.round(ratio * 100)}%</Text>
      </View>
    </View>
  );
}

function Thumbnail({asset, timeSec, active, onPress}: ThumbnailProps) {
  const ratio = asset.durationSec > 0 ? timeSec / asset.durationSec : 0;

  return (
    <Pressable onPress={onPress} style={[styles.thumbnailCard, active && styles.thumbnailCardActive]}>
      <Surface asset={asset} ratio={ratio} compact />
      <Text style={styles.thumbnailTime}>{formatDuration(timeSec)}</Text>
    </Pressable>
  );
}

export default function VideoScreen() {
  const assets = useMemo(() => buildAssets(), []);
  const [selectedId, setSelectedId] = useState(assets[0].id);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<SpeedPreset>(1);
  const [volume, setVolume] = useState(0.72);
  const [fullscreen, setFullscreen] = useState(false);
  const [pipEnabled, setPipEnabled] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [volumeWidth, setVolumeWidth] = useState(0);
  const [feedback, setFeedback] = useState(
    'Video deck ready. Press play, scrub the timeline or open the mini player.',
  );
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedAsset = assets.find(asset => asset.id === selectedId) ?? assets[0];
  const progressRatio =
    selectedAsset.durationSec > 0 ? currentTime / selectedAsset.durationSec : 0;
  const thumbnails = useMemo(
    () => buildThumbnailTimes(selectedAsset.durationSec),
    [selectedAsset.durationSec],
  );

  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setCurrentTime(0);
    setPlaying(false);
  }, [selectedId]);

  useEffect(() => {
    if (!playing) {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      return;
    }

    playbackTimerRef.current = setInterval(() => {
      setCurrentTime(current => {
        const next = current + 0.25 * speed;
        if (next >= selectedAsset.durationSec) {
          setPlaying(false);
          setFeedback(`Playback completed for ${selectedAsset.title}.`);
          return selectedAsset.durationSec;
        }
        return next;
      });
    }, 250);

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [playing, selectedAsset.durationSec, selectedAsset.title, speed]);

  function seekTo(nextSeconds: number) {
    const safe = clamp(nextSeconds, 0, selectedAsset.durationSec);
    setCurrentTime(safe);
    setFeedback(`Timeline moved to ${formatDuration(safe)}.`);
  }

  function togglePlayback() {
    if (playing) {
      setPlaying(false);
      setFeedback(`Playback paused at ${formatDuration(currentTime)}.`);
      return;
    }

    if (currentTime >= selectedAsset.durationSec) {
      setCurrentTime(0);
    }

    setPlaying(true);
    setFeedback(`Playback started for ${selectedAsset.title}.`);
  }

  function stopPlayback() {
    setPlaying(false);
    setCurrentTime(0);
    setFeedback('Playback stopped and rewound to the beginning.');
  }

  function changeVolume(next: number) {
    const safe = clamp(next, 0, 1);
    setVolume(safe);
    setFeedback(`Volume set to ${Math.round(safe * 100)}%.`);
  }

  function toggleFullscreen() {
    setFullscreen(current => !current);
    setFeedback(!fullscreen ? 'Fullscreen player expanded.' : 'Fullscreen player collapsed.');
  }

  function togglePip() {
    setPipEnabled(current => !current);
    setFeedback(
      !pipEnabled
        ? Platform.OS === 'android'
          ? 'Android PiP mini-player enabled.'
          : 'Floating mini-player enabled.'
        : 'Mini-player closed.',
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.section}>
        <Text style={styles.eyebrow}>Phase 5.3</Text>
        <Text style={styles.title}>Video Playback Deck</Text>
        <Text style={styles.subtitle}>
          Full player controls, play pause stop seek, fullscreen, Picture-in-Picture behavior and
          generated thumbnails in one screen.
        </Text>

        <View style={styles.statsRow}>
          <Stat label="Videos" value={`${assets.length}`} accent={Colors.primary} />
          <Stat
            label="Current time"
            value={formatDuration(currentTime)}
            accent={Colors.success}
          />
          <Stat
            label="Speed"
            value={`${speed.toFixed(1)}x`}
            accent={Colors.warning}
          />
          <Stat
            label="Mode"
            value={pipEnabled ? 'PIP' : fullscreen ? 'FULL' : 'PLAYER'}
            accent={Colors.secondary}
          />
        </View>

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Status</Text>
          <Text style={styles.feedbackCopy}>{feedback}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Player</Text>
        <Text style={styles.sectionCopy}>
          The player supports transport controls, timeline seek, speed changes and output volume.
        </Text>

        <View style={[styles.playerCard, fullscreen && styles.playerCardFullscreen]}>
          <Surface asset={selectedAsset} ratio={progressRatio} fullscreen={fullscreen} />

          <View style={styles.playerHeader}>
            <View style={styles.playerCopy}>
              <Text style={styles.playerTitle}>{selectedAsset.title}</Text>
              <Text style={styles.playerMeta}>
                {selectedAsset.genre} | {selectedAsset.createdAt} | {formatDuration(selectedAsset.durationSec)}
              </Text>
            </View>
            <View style={[styles.assetBadge, {backgroundColor: `${selectedAsset.accent}22`}]}>
              <Text style={[styles.assetBadgeText, {color: selectedAsset.accent}]}>
                {selectedAsset.aspect}
              </Text>
            </View>
          </View>

          <View style={styles.timelineBlock}>
            <View style={styles.timelineMeta}>
              <Text style={styles.timelineLabel}>{formatDuration(currentTime)}</Text>
              <Text style={styles.timelineLabel}>{formatDuration(selectedAsset.durationSec)}</Text>
            </View>
            <Pressable
              onLayout={event => setProgressWidth(event.nativeEvent.layout.width)}
              onPress={event => {
                if (!progressWidth) {
                  return;
                }
                const ratio = clamp(event.nativeEvent.locationX / progressWidth, 0, 1);
                seekTo(ratio * selectedAsset.durationSec);
              }}
              style={styles.timelineTrack}>
              <View style={[styles.timelineFill, {width: `${progressRatio * 100}%`}]} />
            </Pressable>
          </View>

          <View style={styles.actionRow}>
            <Pressable onPress={() => seekTo(currentTime - 10)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Back 10s</Text>
            </Pressable>
            <Pressable onPress={togglePlayback} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{playing ? 'Pause' : 'Play'}</Text>
            </Pressable>
            <Pressable onPress={stopPlayback} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Stop</Text>
            </Pressable>
            <Pressable onPress={() => seekTo(currentTime + 10)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Forward 10s</Text>
            </Pressable>
          </View>

          <View style={styles.toolbarGroup}>
            <Text style={styles.toolbarLabel}>Playback speed</Text>
            <View style={styles.chipRow}>
              {([0.5, 1, 1.5, 2] as SpeedPreset[]).map(option => (
                <Chip
                  key={option}
                  label={`${option}x`}
                  active={speed === option}
                  onPress={() => {
                    setSpeed(option);
                    setFeedback(`Playback speed set to ${option}x.`);
                  }}
                />
              ))}
            </View>
          </View>

          <View style={styles.volumeBlock}>
            <View style={styles.timelineMeta}>
              <Text style={styles.toolbarLabel}>Volume</Text>
              <Text style={styles.timelineLabel}>{Math.round(volume * 100)}%</Text>
            </View>
            <View style={styles.volumeRow}>
              <Pressable onPress={() => changeVolume(volume - 0.1)} style={styles.volumeButton}>
                <Text style={styles.volumeButtonText}>-</Text>
              </Pressable>
              <Pressable
                onLayout={event => setVolumeWidth(event.nativeEvent.layout.width)}
                onPress={event => {
                  if (!volumeWidth) {
                    return;
                  }
                  changeVolume(event.nativeEvent.locationX / volumeWidth);
                }}
                style={styles.volumeTrack}>
                <View style={[styles.volumeFill, {width: `${volume * 100}%`}]} />
              </Pressable>
              <Pressable onPress={() => changeVolume(volume + 0.1)} style={styles.volumeButton}>
                <Text style={styles.volumeButtonText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable onPress={toggleFullscreen} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>
                {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </Text>
            </Pressable>
            <Pressable onPress={togglePip} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>
                {pipEnabled
                  ? 'Close mini-player'
                  : Platform.OS === 'android'
                    ? 'Open Android PiP'
                    : 'Open mini-player'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thumbnail generation</Text>
        <Text style={styles.sectionCopy}>
          Thumbnails are generated from timeline checkpoints. Tap one to seek directly to that
          moment.
        </Text>

        <View style={styles.thumbnailRow}>
          {thumbnails.map(timeSec => (
            <Thumbnail
              key={`${selectedAsset.id}-${timeSec}`}
              asset={selectedAsset}
              timeSec={timeSec}
              active={Math.abs(currentTime - timeSec) < selectedAsset.durationSec / 12}
              onPress={() => seekTo(timeSec)}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Library</Text>
        <Text style={styles.sectionCopy}>
          Choose another asset to reset the player, regenerate thumbnails and test the controls
          against a different duration and aspect ratio.
        </Text>

        <View style={styles.libraryList}>
          {assets.map((asset, index) => {
            const selected = asset.id === selectedId;
            return (
              <Pressable
                key={asset.id}
                onPress={() => {
                  setSelectedId(asset.id);
                  setFeedback(`${asset.title} loaded into the player.`);
                }}
                style={[styles.libraryCard, selected && styles.libraryCardSelected]}>
                <View style={styles.libraryHeader}>
                  <View style={[styles.libraryIndex, {backgroundColor: `${asset.accent}20`}]}>
                    <Text style={[styles.libraryIndexText, {color: asset.accent}]}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                  </View>
                  <View style={styles.libraryCopy}>
                    <Text style={styles.libraryTitle}>{asset.title}</Text>
                    <Text style={styles.libraryMeta}>
                      {asset.genre} | {formatDuration(asset.durationSec)} | {asset.aspect}
                    </Text>
                  </View>
                </View>
                <Surface asset={asset} ratio={0.35} compact />
                <Text style={styles.libraryNote}>{asset.note}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {pipEnabled ? (
        <View style={styles.pipShell}>
          <Surface asset={selectedAsset} ratio={progressRatio} compact />
          <View style={styles.pipFooter}>
            <Text style={styles.pipTitle}>{selectedAsset.title}</Text>
            <View style={styles.pipActions}>
              <Pressable onPress={togglePlayback} style={styles.pipButton}>
                <Text style={styles.pipButtonText}>{playing ? 'Pause' : 'Play'}</Text>
              </Pressable>
              <Pressable onPress={togglePip} style={styles.pipButton}>
                <Text style={styles.pipButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
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
  playerCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  playerCardFullscreen: {
    paddingBottom: Spacing.xl,
  },
  surfaceFrame: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.bg,
    minHeight: 180,
  },
  surfaceFrameCompact: {
    minHeight: 0,
  },
  surfaceFrameFullscreen: {
    minHeight: 320,
  },
  surfaceFill: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  surfaceShadeTop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,26,0.22)',
  },
  surfaceShadeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  surfaceOrb: {
    position: 'absolute',
    top: '22%',
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    opacity: 0.82,
  },
  surfaceHorizon: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  surfaceStructure: {
    position: 'absolute',
    bottom: '18%',
    left: '14%',
    width: '18%',
    height: '28%',
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  surfaceStructureSmall: {
    position: 'absolute',
    bottom: '24%',
    right: '18%',
    width: '10%',
    height: '18%',
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  surfaceTrack: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 18,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  surfaceTrackFill: {
    height: '100%',
    borderRadius: Radius.full,
  },
  surfaceHudTop: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  surfaceHudBottom: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  surfaceHudText: {
    ...Typography.caption,
    color: Colors.white,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  playerCopy: {
    flex: 1,
    gap: Spacing.xs,
  },
  playerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  playerMeta: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  assetBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  assetBadgeText: {
    ...Typography.caption,
  },
  timelineBlock: {
    gap: Spacing.xs,
  },
  timelineMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  timelineTrack: {
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg,
    overflow: 'hidden',
  },
  timelineFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  primaryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    ...Typography.caption,
    color: Colors.bg,
  },
  secondaryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  secondaryButtonText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  toolbarGroup: {
    gap: Spacing.xs,
  },
  toolbarLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
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
    backgroundColor: Colors.bgCard,
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
  volumeBlock: {
    gap: Spacing.sm,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  volumeButton: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  volumeButtonText: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  volumeTrack: {
    flex: 1,
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg,
    overflow: 'hidden',
  },
  volumeFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.warning,
  },
  thumbnailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  thumbnailCard: {
    width: 126,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  thumbnailCardActive: {
    borderColor: Colors.primary,
  },
  thumbnailTime: {
    ...Typography.caption,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  libraryList: {
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  libraryCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  libraryCardSelected: {
    borderColor: Colors.primary,
  },
  libraryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  libraryIndex: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryIndexText: {
    ...Typography.caption,
  },
  libraryCopy: {
    flex: 1,
    gap: 2,
  },
  libraryTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  libraryMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  libraryNote: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  pipShell: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 180,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  pipFooter: {
    gap: Spacing.xs,
  },
  pipTitle: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  pipActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pipButton: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    backgroundColor: Colors.bg,
  },
  pipButtonText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
});
