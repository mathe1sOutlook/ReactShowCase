export const SLOW_RENDER_THRESHOLD_MS = 24;

export type RenderSample = {
  screenName: string;
  phase: 'mount' | 'update' | 'nested-update';
  actualDuration: number;
  baseDuration: number;
  commitTime: number;
};

export type PerformanceStats = {
  sampleCount: number;
  slowRenderCount: number;
  lastScreenName: string;
  lastPhase: RenderSample['phase'];
  lastRenderDurationMs: number;
  slowestRenderDurationMs: number;
};

type Listener = (stats: PerformanceStats) => void;

const listeners = new Set<Listener>();

let stats: PerformanceStats = {
  sampleCount: 0,
  slowRenderCount: 0,
  lastScreenName: 'boot',
  lastPhase: 'mount',
  lastRenderDurationMs: 0,
  slowestRenderDurationMs: 0,
};

const INITIAL_STATS = stats;

export function getPerformanceStats() {
  return stats;
}

export function resetPerformanceStats() {
  stats = INITIAL_STATS;
}

export function subscribeToPerformance(listener: Listener) {
  listeners.add(listener);
  listener(stats);

  return () => {
    listeners.delete(listener);
  };
}

export function reportRenderSample(sample: RenderSample) {
  stats = {
    sampleCount: stats.sampleCount + 1,
    slowRenderCount:
      stats.slowRenderCount +
      (sample.actualDuration >= SLOW_RENDER_THRESHOLD_MS ? 1 : 0),
    lastScreenName: sample.screenName,
    lastPhase: sample.phase,
    lastRenderDurationMs: sample.actualDuration,
    slowestRenderDurationMs: Math.max(
      stats.slowestRenderDurationMs,
      sample.actualDuration,
    ),
  };

  listeners.forEach(listener => listener(stats));
}
