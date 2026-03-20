import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors, Radius, Spacing} from '../theme';
import {
  getPerformanceStats,
  subscribeToPerformance,
  type PerformanceStats,
} from './performanceStore';

type PerformanceOverlayProps = {
  visible?: boolean;
};

type PerformanceWithMemory = Performance & {
  memory?: {
    usedJSHeapSize?: number;
  };
};

function readHeapSizeLabel() {
  const heapSize = (
    globalThis.performance as PerformanceWithMemory | undefined
  )?.memory?.usedJSHeapSize;

  if (typeof heapSize !== 'number') {
    return 'n/a';
  }

  return `${(heapSize / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PerformanceOverlay({
  visible = __DEV__,
}: PerformanceOverlayProps) {
  const [fps, setFps] = useState(60);
  const [heapLabel, setHeapLabel] = useState(readHeapSizeLabel);
  const [stats, setStats] = useState<PerformanceStats>(getPerformanceStats);

  useEffect(() => {
    if (!visible) {
      return;
    }

    let animationFrameId = 0;
    let frameCount = 0;
    let lastSampleTime = globalThis.performance?.now() ?? Date.now();

    const update = (timestamp: number) => {
      frameCount += 1;

      if (timestamp - lastSampleTime >= 1000) {
        const elapsed = timestamp - lastSampleTime;
        const nextFps = Math.round((frameCount * 1000) / elapsed);
        setFps(nextFps);
        setHeapLabel(readHeapSizeLabel());
        frameCount = 0;
        lastSampleTime = timestamp;
      }

      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    return subscribeToPerformance(setStats);
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={styles.overlay}
      testID="performance-overlay">
      <Text style={styles.label}>JS FPS {fps}</Text>
      <Text style={styles.value}>
        {stats.lastScreenName} {stats.lastPhase} {stats.lastRenderDurationMs.toFixed(1)}ms
      </Text>
      <Text style={styles.value}>
        slow {stats.slowRenderCount} | max {stats.slowestRenderDurationMs.toFixed(1)}ms
      </Text>
      <Text style={styles.value}>heap {heapLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.md,
    zIndex: 999,
    minWidth: 180,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(17, 24, 39, 0.82)',
    borderWidth: 1,
    borderColor: Colors.borderMedium,
  },
  label: {
    color: Colors.primaryLight,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  value: {
    color: Colors.white,
    fontSize: 11,
    lineHeight: 16,
  },
});
