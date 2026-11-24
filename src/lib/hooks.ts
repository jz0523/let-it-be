import { useEffect, useState } from 'react';
import { now } from './time';

/** Re-render on an interval and hand back the current time. */
export function useNow(intervalMs = 1000): number {
  const [t, setT] = useState(now);
  useEffect(() => {
    const id = window.setInterval(() => setT(now()), intervalMs);
    const onShow = () => setT(now());
    document.addEventListener('visibilitychange', onShow);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onShow);
    };
  }, [intervalMs]);
  return t;
}
