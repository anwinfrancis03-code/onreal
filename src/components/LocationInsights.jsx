import { useMemo } from 'react';
import { Disclaimer, SampleTag } from './ui';
import { FacilityMap } from './FacilityMap';
import { MarketChart } from './MarketChart';
import { Icon, FAC_ICON } from './Icon';
import { Ring } from './Ring';
import { fmtINR } from '../utils/format';
import { FACTOR_LABEL, USES, facilitiesOf, pointsFor, rankUses, scoreUse } from '../utils/insights';

const FAC_LABEL = {
  school: 'Schools',
  hospital: 'Hospitals & clinics',
  bus: 'Bus stops',
  market: 'Markets',
  rail: 'Railway',
};

function Metric({ icon, label, value, note }) {
  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-text">
          <Icon n={icon} size={16} />
        </span>
        {label}
      </div>
      <div className="text-2xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted">{note}</div>
    </div>
  );
}

/* Sample, rule-based suitability report for a locality and intended use. */
export function SuitabilityReport({ loc, use, full = false, price }) {
  const ranked = useMemo(() => rankUses(loc), [loc.id]);
  const sel = scoreUse(loc, use);
  const fac = useMemo(() => facilitiesOf(loc), [loc.id]);
  const pts = pointsFor(loc, '3Y');
  const scen = price
    ? [
        ['Conservative', loc.trend - 3],
        ['Base case', loc.trend],
        ['Optimistic', loc.trend + 3],
      ].map(([n, g]) => [n, Math.max(g, 0), price * Math.pow(1 + Math.max(g, 0) / 100, 5)])
    : null;
  const grouped = {};
  fac.forEach((f) => (grouped[f.type] = grouped[f.type] || []).push(f));
  const access = Math.round(Math.max(5, 100 - loc.roadKm * 20) * 0.6 + loc.transit * 0.4);
  const demand = Math.round((loc.footfall + loc.residential) / 2);
  const verdict =
    sel.score >= 75
      ? 'Strong match in the sample data.'
      : sel.score >= 55
        ? 'Moderate match, with trade-offs to check.'
        : 'Weak match in the sample data. Consider other uses.';

  return (
    <div className="grid gap-5">
      <Disclaimer>
        <b>Simulated sample insights.</b> Scores come from sample rules and illustrative location data, not a
        verified AI model. Zoning, legal permissions, title and ownership have <b>not</b> been verified.
        Always check these with the local authority and a qualified professional.
      </Disclaimer>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card card-pad flex flex-wrap items-center gap-6">
          <Ring score={sel.score} size={full ? 170 : 150} />
          <div className="min-w-[200px] flex-1">
            <div className="eyebrow">Locality suitability</div>
            <h3 className="mt-1.5 text-xl">
              {USES[use].label} in {loc.name}
            </h3>
            <p className="mt-1 text-sm text-muted">{verdict}</p>
            <div className="mt-3">
              <SampleTag>Simulated</SampleTag>
            </div>
          </div>
        </div>
        <div className="card card-pad">
          <h3 className="mb-3 text-base">Possible business categories</h3>
          <ul>
            {ranked.map((r, i) => (
              <li
                key={r.use}
                className="grid grid-cols-[130px_1fr_32px] items-center gap-3 py-1.5 text-sm sm:grid-cols-[150px_1fr_36px]"
              >
                <span className={i === 0 ? 'font-bold' : 'text-muted'}>{r.label}</span>
                <span className="h-2 overflow-hidden rounded-full bg-line">
                  <span className="block h-full rounded-full bg-brand" style={{ width: r.score + '%' }} />
                </span>
                <b className="text-right">{r.score}</b>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          icon="route"
          label="Accessibility"
          value={access + '/100'}
          note={`Main road ~${loc.roadKm} km, public transport ${loc.transit}/100`}
        />
        <Metric
          icon="users"
          label="Estimated demand"
          value={demand + '/100'}
          note="Footfall and residential demand (sample)"
        />
        <Metric
          icon="landmark"
          label="Nearby facilities"
          value={fac.length}
          note="Schools, hospitals, transport, markets"
        />
        <Metric
          icon="trend"
          label="Development potential"
          value={loc.dev + '/100'}
          note="Illustrative growth indicator"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="card card-pad">
          <h3 className="mb-3 flex items-center gap-2 text-base text-brand-text">
            <Icon n="done" size={18} />
            Positive location factors
          </h3>
          <ul className="space-y-2.5 text-sm">
            {(sel.pos.length
              ? sel.pos
              : ['No factor scored above 65 for this purpose in the sample data.']
            ).map((t, i) => (
              <li key={i} className="flex gap-2.5">
                <Icon n="check" size={17} className="mt-0.5 shrink-0 text-brand-text" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="card card-pad">
          <h3 className="mb-3 flex items-center gap-2 text-base text-amber-ink">
            <Icon n="alert" size={18} />
            Potential risks or limitations
          </h3>
          <ul className="space-y-2.5 text-sm">
            {[
              ...sel.neg,
              ...(sel.neg.length ? [] : ['No major weakness flagged by the sample rules.']),
              'Competition for this use: ' +
                (loc.comp[use] != null
                  ? loc.comp[use] + '/100 saturation (sample).'
                  : 'not modelled for this use.'),
            ].map((t, i) => (
              <li key={i} className="flex gap-2.5">
                <Icon n="alert" size={17} className="mt-0.5 shrink-0 text-amber-ink" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card card-pad">
        <h3 className="text-base">How the score is built</h3>
        <p className="mb-4 mt-1 text-sm text-muted">
          Each score blends these factors with weights chosen for the selected purpose.
        </p>
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {sel.parts.map((p) => (
            <div key={p.k}>
              <div className="mb-1 flex justify-between text-[13px]">
                <span className="font-semibold">{FACTOR_LABEL[p.k]}</span>
                <span className="text-muted">
                  {p.v}/100 · weight {p.w}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-brand" style={{ width: p.v + '%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={'grid gap-5 ' + (full ? 'lg:grid-cols-2' : '')}>
        <div className="card card-pad">
          <h3 className="mb-3 text-base">Nearby facilities (sample)</h3>
          {full && (
            <div className="mb-4">
              <FacilityMap loc={loc} />
            </div>
          )}
          <ul className="divide-y divide-line text-sm">
            {Object.keys(grouped).map((t) => (
              <li key={t} className="flex items-center justify-between py-2.5">
                <span className="inline-flex items-center gap-2.5 text-muted">
                  <Icon n={FAC_ICON[t]} size={17} />
                  {FAC_LABEL[t]}
                </span>
                <b>
                  {grouped[t].length > 1
                    ? grouped[t].length + ' within ' + Math.max(...grouped[t].map((x) => x.km)) + ' km'
                    : '~' + grouped[t][0].km + ' km'}
                </b>
              </li>
            ))}
          </ul>
        </div>
        {full && (
          <div className="card card-pad">
            <h3 className="text-base">Existing business competition</h3>
            <p className="mb-3 mt-1 text-sm text-muted">
              Sample saturation index. Higher means more competition.
            </p>
            {Object.entries(loc.comp).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[96px_1fr_32px] items-center gap-3 py-1.5 text-sm">
                <span className="capitalize text-muted">{k}</span>
                <span className="h-2 overflow-hidden rounded-full bg-line">
                  <span
                    className={'block h-full rounded-full ' + (v > 70 ? 'bg-amber-ink/70' : 'bg-brand')}
                    style={{ width: v + '%' }}
                  />
                </span>
                <b className="text-right">{v}</b>
              </div>
            ))}
          </div>
        )}
      </div>

      {full && (
        <div className="card card-pad">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base">Illustrative land price, 3 years</h3>
            <SampleTag />
          </div>
          <MarketChart
            id={'rp' + loc.id}
            series={[{ name: loc.name, color: '#0B4F3C', points: pts }]}
            fmt={(v) => '₹' + v.toFixed(1) + ' L'}
          />
        </div>
      )}

      {scen && (
        <div className="card card-pad">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-base">Illustrative 5-year appreciation scenarios</h3>
            <SampleTag>Not a forecast</SampleTag>
          </div>
          <p className="mb-4 mt-1 text-sm text-muted">
            Sample growth rates applied to this asking price. They are not predictions or guarantees. Real
            estimates need verified historical prices and a documented method.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {scen.map(([n, g, v]) => (
              <div key={n} className="rounded-xl bg-bg p-4">
                <div className="text-xs font-semibold text-muted">
                  {n} · {g.toFixed(1)}% / yr
                </div>
                <div className="mt-1 text-2xl font-extrabold tracking-tight">{fmtINR(v)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
