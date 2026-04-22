import {useCallback, useEffect, useRef} from 'react';

export function useTimeoutRegistry() {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timersRef.current.forEach(timeout => clearTimeout(timeout));
    timersRef.current = [];
  }, []);

  const scheduleTimeout = useCallback(
    (callback: () => void, delay: number) => {
      const timeout = setTimeout(() => {
        timersRef.current = timersRef.current.filter(active => active !== timeout);
        callback();
      }, delay);

      timersRef.current.push(timeout);
      return timeout;
    },
    [],
  );

  useEffect(() => clearTimeouts, [clearTimeouts]);

  return {
    clearTimeouts,
    scheduleTimeout,
  };
}
