import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {ScreenContainer} from '../components/common/ScreenContainer';
import {Colors, Radius, Spacing, Typography} from '../theme';

type AudioClip = {
  id: string;
  title: string;
  createdAt: string;
  durationSec: number;
  bars: number[];
  accent: string;
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

type WaveformProps = {
  bars: number[];
  accent: string;
  activeRatio?: number;
  live?: boolean;
};

const WAVE_COLORS = [
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

function buildBars(seed: number, length: number) {
  return Array.from({length}, (_, index) => {
    const base = Math.sin((index + 1) * 0.6 + seed) * 0.24 + 0.52;
    const texture = Math.cos((index + 1) * 1.35 + seed * 0.7) * 0.12 + 0.12;
    return clamp(base + texture, 0.12, 0.98);
  });
}

function buildSeedClips() {
  return [
    {
      id: 'clip-1',
      title: 'Voice memo kickoff',
      createdAt: '2026-03-10 09:12',
      durationSec: 52,
      bars: buildBars(1.2, 42),
      accent: WAVE_COLORS[0],
      note: 'Warmup note captured during product handoff.',
    },
    {
      id: 'clip-2',
      title: 'Ambient train loop',
      createdAt: '2026-03-11 18:43',
      durationSec: 86,
      bars: buildBars(2.4, 42),
      accent: WAVE_COLORS[1],
      note: 'Environmental reference used for motion mockups.',
    },
    {
      id: 'clip-3',
      title: 'Client cue sheet',
      createdAt: '2026-03-12 14:21',
      durationSec: 64,
      bars: buildBars(3.1, 42),
      accent: WAVE_COLORS[2],
      note: 'Structured readout for the next production sprint.',
    },
    {
      id: 'clip-4',
      title: 'Field capture',
      createdAt: '2026-03-13 07:54',
      durationSec: 97,
      bars: buildBars(4.7, 42),
      accent: WAVE_COLORS[3],
      note: 'Longer outdoor capture with stronger low-end peaks.',
    },
  ] satisfies AudioClip[];
}

function createClip(index: number, bars: number[], durationSec: number) {
  return {
    id: `recorded-${Date.now()}-${index}`,
    title: `Recorded clip ${index + 1}`,
    createdAt: '2026-03-15 10:00',
    durationSec,
    bars,
    accent: WAVE_COLORS[index % WAVE_COLORS.length],
    note: 'Fresh microphone take generated from the live waveform recorder.',
  } satisfies AudioClip;
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

function Waveform({bars, accent, activeRatio = 0, live}: WaveformProps) {
  return (
    <View style={styles.waveformRow}>
      {bars.map((value, index) => {
        const highlight = live || index / Math.max(bars.length - 1, 1) <= activeRatio;
        return (
          <View
            key={`bar-${index}`}
            style={[
              styles.waveBar,
              {
                height: 18 + value * 82,
                backgroundColor: highlight ? accent : `${accent}33`,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function AudioScreen() {
  const initialClips = useMemo(() => buildSeedClips(), []);
  const [clips, setClips] = useState(initialClips);
  const [selectedId, setSelectedId] = useState(initialClips[0].id);
  const [recording, setRecording] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [recordBars, setRecordBars] = useState<number[]>(buildBars(0.8, 42));
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [volume, setVolume] = useState(0.72);
  const [monitorMode, setMonitorMode] = useState<'mic' | 'loopback'>('mic');
  const [feedback, setFeedback] = useState(
    'Microphone recorder ready. Start recording to generate a new clip.',
  );
  const [progressWidth, setProgressWidth] = useState(0);
  const [volumeWidth, setVolumeWidth] = useState(0);
  const levelAnim = useRef(new Animated.Value(0.36)).current;
  const recordTicksRef = useRef(0);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedClip = clips.find(clip => clip.id === selectedId) ?? clips[0];
  const progressRatio =
    selectedClip.durationSec > 0 ? playbackSeconds / selectedClip.durationSec : 0;

  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!recording) {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      return;
    }

    recordingTimerRef.current = setInterval(() => {
      const tick = recordTicksRef.current + 1;
      recordTicksRef.current = tick;

      setRecordBars(current => {
        const nextBar = clamp(
          0.26 +
            Math.sin(tick * 0.52) * 0.2 +
            Math.cos(tick * 0.23) * 0.16 +
            (tick % 5) * 0.05,
          0.12,
          0.98,
        );
        return [...current.slice(1), nextBar];
      });

      setRecordSeconds(current => current + 0.2);

      Animated.spring(levelAnim, {
        toValue: clamp(0.32 + Math.abs(Math.sin(tick * 0.8)) * 0.58, 0.24, 1),
        useNativeDriver: false,
        bounciness: 0,
      }).start();
    }, 200);

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
  }, [levelAnim, recording]);

  useEffect(() => {
    if (!playing) {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      return;
    }

    playbackTimerRef.current = setInterval(() => {
      setPlaybackSeconds(current => {
        const next = current + 0.25;
        if (next >= selectedClip.durationSec) {
          setPlaying(false);
          setFeedback(`Playback completed for ${selectedClip.title}.`);
          return selectedClip.durationSec;
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
  }, [playing, selectedClip.durationSec, selectedClip.title]);

  useEffect(() => {
    setPlaybackSeconds(0);
    setPlaying(false);
  }, [selectedId]);

  function toggleRecording() {
    if (recording) {
      const duration = Math.max(4, Math.round(recordSeconds));
      const nextClip = createClip(clips.length, recordBars, duration);
      setRecording(false);
      setClips(current => [nextClip, ...current]);
      setSelectedId(nextClip.id);
      setRecordSeconds(0);
      recordTicksRef.current = 0;
      setFeedback(`Audio clip saved with duration ${formatDuration(duration)}.`);
      return;
    }

    setPlaying(false);
    setRecordBars(buildBars(Date.now() % 10, 42));
    setRecordSeconds(0);
    recordTicksRef.current = 0;
    setRecording(true);
    setFeedback('Recording started. Live waveform is sampling the microphone input.');
  }

  function togglePlayback() {
    if (playing) {
      setPlaying(false);
      setFeedback(`Playback paused at ${formatDuration(playbackSeconds)}.`);
      return;
    }

    if (playbackSeconds >= selectedClip.durationSec) {
      setPlaybackSeconds(0);
    }
    setPlaying(true);
    setFeedback(`Playback started for ${selectedClip.title}.`);
  }

  function seekTo(nextSeconds: number) {
    const safe = clamp(nextSeconds, 0, selectedClip.durationSec);
    setPlaybackSeconds(safe);
    setFeedback(`Seek updated to ${formatDuration(safe)}.`);
  }

  function changeVolume(next: number) {
    const safe = clamp(next, 0, 1);
    setVolume(safe);
    setFeedback(`Output volume set to ${Math.round(safe * 100)}%.`);
  }

  return (
    <ScreenContainer>
      <View style={styles.section}>
        <Text style={styles.eyebrow}>Phase 5.2</Text>
        <Text style={styles.title}>Audio Capture Deck</Text>
        <Text style={styles.subtitle}>
          Microphone recording, live waveform feedback, playback transport, seek, progress, volume
          and a clip library in one audio workflow.
        </Text>

        <View style={styles.statsRow}>
          <Stat label="Recorded clips" value={`${clips.length}`} accent={Colors.primary} />
          <Stat
            label="Current duration"
            value={recording ? formatDuration(recordSeconds) : formatDuration(selectedClip.durationSec)}
            accent={Colors.success}
          />
          <Stat label="Volume" value={`${Math.round(volume * 100)}%`} accent={Colors.warning} />
          <Stat label="Monitor" value={monitorMode.toUpperCase()} accent={Colors.secondary} />
        </View>

        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackTitle}>Status</Text>
          <Text style={styles.feedbackCopy}>{feedback}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recorder</Text>
        <Text style={styles.sectionCopy}>
          Start a take to simulate microphone capture and render the waveform in real time.
        </Text>

        <View style={styles.toolbarGroup}>
          <Text style={styles.toolbarLabel}>Monitor source</Text>
          <View style={styles.chipRow}>
            <Chip
              label="Mic input"
              active={monitorMode === 'mic'}
              onPress={() => setMonitorMode('mic')}
            />
            <Chip
              label="Loopback"
              active={monitorMode === 'loopback'}
              onPress={() => setMonitorMode('loopback')}
            />
          </View>
        </View>

        <View style={styles.recordCard}>
          <View style={styles.recordHeader}>
            <View>
              <Text style={styles.recordTitle}>Live waveform</Text>
              <Text style={styles.recordMeta}>
                {recording ? 'Recording in progress' : 'Standby'}
              </Text>
            </View>
            <View style={styles.recordBadge}>
              <View
                style={[
                  styles.recordBadgeDot,
                  {backgroundColor: recording ? Colors.error : Colors.textMuted},
                ]}
              />
              <Text style={styles.recordBadgeText}>{formatDuration(recordSeconds)}</Text>
            </View>
          </View>

          <Waveform bars={recordBars} accent={Colors.primary} live />

          <View style={styles.levelPanel}>
            <Text style={styles.toolbarLabel}>Input level</Text>
            <View style={styles.levelTrack}>
              <Animated.View
                style={[
                  styles.levelFill,
                  {
                    width: levelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['12%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={toggleRecording}
              style={[styles.primaryButton, recording && styles.primaryButtonActive]}>
              <Text style={styles.primaryButtonText}>
                {recording ? 'Stop recording' : 'Start recording'}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setRecordBars(buildBars((clips.length + 1) * 0.8, 42));
                setFeedback('Waveform refreshed for a new take.');
              }}
              style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Refresh waveform</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Playback</Text>
        <Text style={styles.sectionCopy}>
          Transport controls include play, pause, seek, progress tracking and master volume.
        </Text>

        <View style={styles.playbackCard}>
          <View style={styles.playbackHeader}>
            <View>
              <Text style={styles.playbackTitle}>{selectedClip.title}</Text>
              <Text style={styles.playbackMeta}>{selectedClip.note}</Text>
            </View>
            <View style={[styles.clipAccent, {backgroundColor: `${selectedClip.accent}22`}]}>
              <Text style={[styles.clipAccentText, {color: selectedClip.accent}]}>
                {formatDuration(selectedClip.durationSec)}
              </Text>
            </View>
          </View>

          <Waveform
            bars={selectedClip.bars}
            accent={selectedClip.accent}
            activeRatio={progressRatio}
          />

          <View style={styles.progressBlock}>
            <View style={styles.progressMetaRow}>
              <Text style={styles.progressLabel}>{formatDuration(playbackSeconds)}</Text>
              <Text style={styles.progressLabel}>{formatDuration(selectedClip.durationSec)}</Text>
            </View>
            <Pressable
              onLayout={event => setProgressWidth(event.nativeEvent.layout.width)}
              onPress={event => {
                if (!progressWidth) {
                  return;
                }
                const ratio = clamp(event.nativeEvent.locationX / progressWidth, 0, 1);
                seekTo(ratio * selectedClip.durationSec);
              }}
              style={styles.progressTrack}>
              <View style={[styles.progressFill, {width: `${progressRatio * 100}%`}]} />
            </Pressable>
          </View>

          <View style={styles.actionRow}>
            <Pressable onPress={() => seekTo(playbackSeconds - 5)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Back 5s</Text>
            </Pressable>
            <Pressable onPress={togglePlayback} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{playing ? 'Pause' : 'Play'}</Text>
            </Pressable>
            <Pressable onPress={() => seekTo(playbackSeconds + 5)} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Forward 5s</Text>
            </Pressable>
          </View>

          <View style={styles.volumeBlock}>
            <View style={styles.progressMetaRow}>
              <Text style={styles.toolbarLabel}>Volume</Text>
              <Text style={styles.progressLabel}>{Math.round(volume * 100)}%</Text>
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
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recorded clips</Text>
        <Text style={styles.sectionCopy}>
          Every captured take is appended to the library and can be reopened for playback.
        </Text>

        <View style={styles.clipList}>
          {clips.map((clip, index) => {
            const selected = clip.id === selectedId;
            return (
              <Pressable
                key={clip.id}
                onPress={() => {
                  setSelectedId(clip.id);
                  setFeedback(`${clip.title} loaded into playback controls.`);
                }}
                style={[styles.clipCard, selected && styles.clipCardSelected]}>
                <View style={styles.clipRow}>
                  <View style={[styles.clipIndex, {backgroundColor: `${clip.accent}20`}]}>
                    <Text style={[styles.clipIndexText, {color: clip.accent}]}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                  </View>
                  <View style={styles.clipCopy}>
                    <Text style={styles.clipTitle}>{clip.title}</Text>
                    <Text style={styles.clipMeta}>
                      {clip.createdAt} | {formatDuration(clip.durationSec)}
                    </Text>
                  </View>
                </View>
                <Waveform
                  bars={clip.bars.slice(0, 28)}
                  accent={clip.accent}
                  activeRatio={selected ? progressRatio : 0}
                />
                <Text style={styles.clipNote}>{clip.note}</Text>
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
  recordCard: {
    marginTop: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  recordMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  recordBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg,
  },
  recordBadgeDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.full,
  },
  recordBadgeText: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  waveformRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    minHeight: 112,
  },
  waveBar: {
    flex: 1,
    borderRadius: Radius.full,
    minWidth: 4,
  },
  levelPanel: {
    gap: Spacing.xs,
  },
  levelTrack: {
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg,
    overflow: 'hidden',
  },
  levelFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.success,
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
  primaryButtonActive: {
    backgroundColor: Colors.error,
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
  playbackCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  playbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  playbackTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  playbackMeta: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  clipAccent: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  clipAccentText: {
    ...Typography.caption,
  },
  progressBlock: {
    gap: Spacing.xs,
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  progressTrack: {
    height: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
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
  clipList: {
    gap: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  clipCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgCardAlt,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  clipCardSelected: {
    borderColor: Colors.primary,
  },
  clipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  clipIndex: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clipIndexText: {
    ...Typography.caption,
  },
  clipCopy: {
    flex: 1,
    gap: 2,
  },
  clipTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  clipMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  clipNote: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
});
