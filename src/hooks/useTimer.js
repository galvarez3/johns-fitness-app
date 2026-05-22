import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialSeconds = 90) {
  const [remaining, setRemaining] = useState(0);
  const [total, setTotal] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((seconds) => {
    clear();
    const secs = seconds ?? total;
    setTotal(secs);
    setRemaining(secs);
    setRunning(true);

    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          setRunning(false);
          // Vibrate on mobile when timer ends
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [total, clear]);

  const stop = useCallback(() => {
    clear();
    setRunning(false);
    setRemaining(0);
  }, [clear]);

  const addTime = useCallback((seconds) => {
    setRemaining(prev => Math.max(0, prev + seconds));
    setTotal(prev => Math.max(0, prev + seconds));
  }, []);

  useEffect(() => () => clear(), [clear]);

  const progress = total > 0 ? (total - remaining) / total : 0;

  return { remaining, total, running, progress, start, stop, addTime };
}
