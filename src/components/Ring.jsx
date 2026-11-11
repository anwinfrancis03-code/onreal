import { useEffect, useState } from 'react';
import { useCountUp } from '../hooks/useCountUp';

/* Animated score ring (0-100). */
export function Ring({ score, size = 150, label = 'Suitability' }) {
  const v = useCountUp(score, 1100, score);
  const r = size / 2 - 10,
    c = 2 * Math.PI * r;
  const col = score >= 75 ? '#2E9E6B' : score >= 55 ? '#C9A227' : '#C0573B';
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(false);
    const t = setTimeout(() => setOn(true), 60);
    return () => clearTimeout(t);
  }, [score]);
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label={`${label} ${score} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgb(var(--line))" strokeWidth="10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={col}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={on ? c * (1 - score / 100) : c}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.22,.8,.24,1)' }}
        />
      </svg>
      <div className="absolute text-center leading-none">
        <b className="text-4xl font-extrabold tracking-tight">{v}</b>
        <small className="mt-1 block text-[11px] font-semibold text-muted">/ 100</small>
      </div>
    </div>
  );
}
