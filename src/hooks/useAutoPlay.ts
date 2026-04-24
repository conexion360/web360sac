// src/hooks/useAutoPlay.ts
'use client';
import { useEffect, useRef, useCallback } from 'react';

interface UseAutoPlayOptions {
  enabled: boolean;
  interval: number;
  onTick: () => void;
  paused: boolean;
}

export function useAutoPlay({ enabled, interval, onTick, paused }: UseAutoPlayOptions) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => onTickRef.current(), interval);
  }, [interval]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled || paused) {
      stop();
      return;
    }
    start();
    return stop;
  }, [enabled, paused, start, stop]);
}
