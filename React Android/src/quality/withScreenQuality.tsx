import React, {Profiler} from 'react';
import ScreenErrorBoundary from './ScreenErrorBoundary';
import {
  reportRenderSample,
  SLOW_RENDER_THRESHOLD_MS,
} from './performanceStore';

export function withScreenQuality<P extends object>(
  screenName: string,
  Component: React.ComponentType<P>,
) {
  function ScreenWithQuality(props: P) {
    return (
      <ScreenErrorBoundary screenName={screenName}>
        <Profiler
          id={screenName}
          onRender={(
            _id,
            phase,
            actualDuration,
            baseDuration,
            _startTime,
            commitTime,
          ) => {
            reportRenderSample({
              screenName,
              phase,
              actualDuration,
              baseDuration,
              commitTime,
            });

            if (
              __DEV__ &&
              process.env.NODE_ENV !== 'test' &&
              actualDuration >= SLOW_RENDER_THRESHOLD_MS
            ) {
              console.warn(
                `[Performance:${screenName}] ${phase} took ${actualDuration.toFixed(1)}ms`,
              );
            }
          }}>
          {React.createElement(Component, props)}
        </Profiler>
      </ScreenErrorBoundary>
    );
  }

  ScreenWithQuality.displayName = `withScreenQuality(${screenName})`;

  return ScreenWithQuality;
}
