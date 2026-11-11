import { useMemo } from 'react';
import { facilitiesOf } from '../utils/insights';

const COLORS = { school: '#C9A227', hospital: '#C0573B', bus: '#3D8FA8', market: '#2E9E6B', rail: '#5A6FB5' };
const LETTER = { school: 'S', hospital: 'H', bus: 'B', market: 'M', rail: 'R' };

/* Radial map of nearby facilities (sample data) around a locality. */
export function FacilityMap({ loc }) {
  const fac = useMemo(() => facilitiesOf(loc), [loc.id]);
  const S = 360,
    c = S / 2,
    R = 150,
    maxKm = 3.6;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-brand-50/60">
      <svg
        viewBox={`0 0 ${S} ${S}`}
        className="block h-auto w-full"
        role="img"
        aria-label={'Nearby facilities around ' + loc.name}
      >
        {[1, 2, 3].map((k) => (
          <g key={k}>
            <circle
              cx={c}
              cy={c}
              r={(k / maxKm) * R}
              fill="none"
              stroke="#0B4F3C"
              strokeOpacity=".2"
              strokeDasharray="3 4"
            />
            <text x={c + (k / maxKm) * R - 2} y={c - 3} fontSize="8" fill="#4a6a5f" textAnchor="end">
              {k} km
            </text>
          </g>
        ))}
        <line
          x1={c - R - 10}
          x2={c + R + 10}
          y1={c + loc.roadKm * 10}
          y2={c + loc.roadKm * 10}
          stroke="#8a948d"
          strokeWidth="6"
          opacity=".45"
        />
        <text x={c - R} y={c + loc.roadKm * 10 - 8} fontSize="8" fill="#4a554e">
          Main road
        </text>
        {fac.map((f, i) => {
          const a = (f.angle * Math.PI) / 180,
            rr = (Math.min(f.km, maxKm) / maxKm) * R;
          const x = c + Math.cos(a) * rr,
            y = c + Math.sin(a) * rr;
          return (
            <g key={i}>
              <title>{f.name + ' · ' + f.km + ' km'}</title>
              <circle cx={x} cy={y} r="11" fill={COLORS[f.type]} stroke="#fff" strokeWidth="2" />
              <text x={x} y={y + 4} fontSize="10" textAnchor="middle" fill="#fff" fontWeight="800">
                {LETTER[f.type]}
              </text>
            </g>
          );
        })}
        <circle cx={c} cy={c} r="22" fill="rgba(11,79,60,.15)" />
        <circle cx={c} cy={c} r="9" fill="#0B4F3C" stroke="#C8E86B" strokeWidth="3" />
      </svg>
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line bg-surface/70 px-4 py-2.5 text-xs text-muted">
        {Object.keys(COLORS).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLORS[k] }} />
            {{ school: 'School', hospital: 'Hospital', bus: 'Bus', market: 'Market', rail: 'Rail' }[k]}
          </span>
        ))}
      </div>
    </div>
  );
}
