import { useEffect, useState } from 'react';
import { useReduced } from './useMedia';
import { clamp } from '../utils/format';

export function useCountUp(target, dur = 1200, key) {
  const [v, setV] = useState(0);
  const reduced = useReduced();
  useEffect(() => {
    if (reduced) {
      setV(target);
      return;
    }
    let raf, t0;
    const step = (t) => {
      t0 = t0 || t;
      const k = clamp((t - t0) / dur, 0, 1);
      setV(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, key]);
  return v;
}
