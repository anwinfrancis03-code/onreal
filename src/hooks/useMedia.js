import { useEffect, useState } from 'react';

export function useMedia(q) {
  const [m, setM] = useState(() => (typeof matchMedia === 'function' ? matchMedia(q).matches : false));
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia(q),
      f = () => setM(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', f) : mq.addListener(f);
    f();
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', f) : mq.removeListener(f);
    };
  }, [q]);
  return m;
}

export const useReduced = () => useMedia('(prefers-reduced-motion: reduce)');
