import { Spark } from './MarketChart';
import { SampleTag } from './ui';
import { pctChange, pointsFor } from '../utils/insights';

const Meter = ({ label, v }) => (
  <div>
    <div className="mb-1 flex justify-between text-xs">
      <span className="text-muted">{label}</span>
      <b>{v}</b>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-line">
      <div className="h-full rounded-full bg-brand" style={{ width: v + '%' }} />
    </div>
  </div>
);

export function LocalityCard({ loc, active, onClick }) {
  const pts = pointsFor(loc, '3Y');
  const ch = pctChange(pts);
  const cur = pts[pts.length - 1].value;
  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={!!active}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick())}
      className={
        'card card-pad cursor-pointer transition hover:-translate-y-0.5 hover:shadow-lift ' +
        (active ? 'ring-2 ring-brand' : '')
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base">{loc.name}</h3>
          <p className="text-xs text-muted">{loc.district} district</p>
        </div>
        <Spark points={pts} color="#2E9E6B" />
      </div>
      <div className="mt-4 flex items-end gap-6">
        <div>
          <div className="text-xs text-muted">Price per cent</div>
          <div className="text-2xl font-extrabold tracking-tight">₹{cur.toFixed(1)} L</div>
        </div>
        <div>
          <div className="text-xs text-muted">3-year change</div>
          <div className={'text-lg font-extrabold ' + (ch >= 0 ? 'text-brand-text' : 'text-danger')}>
            {ch >= 0 ? '+' : ''}
            {ch.toFixed(1)}%
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <Meter label="Infrastructure" v={loc.infra} />
        <Meter label="Commercial activity" v={loc.footfall} />
        <Meter label="Development potential" v={loc.dev} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {loc.uses.map((u) => (
          <span key={u} className="badge">
            {u}
          </span>
        ))}
      </div>
      <div className="mt-4">
        <SampleTag>Illustrative data</SampleTag>
      </div>
    </article>
  );
}
