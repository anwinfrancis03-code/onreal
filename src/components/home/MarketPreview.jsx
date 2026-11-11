import { useState } from 'react';
import { Icon } from '../Icon';
import { MarketChart } from '../MarketChart';
import { SectionHead, SampleTag } from '../ui';
import { Link } from '../../utils/router';
import { LOCALITIES, LOC_BY_ID } from '../../data/localities';
import { pctChange, pointsFor } from '../../utils/insights';

const PICKS = ['kakkanad', 'thrissur', 'kozhikode', 'angamaly'];

export function MarketPreview() {
  const [lid, setLid] = useState('kakkanad');
  const [range, setRange] = useState('3Y');
  const loc = LOC_BY_ID[lid];
  const pts = pointsFor(loc, range);
  const ch = pctChange(pts);
  const cmp = [...LOCALITIES].sort((a, b) => b.dev - a.dev).slice(0, 5);
  return (
    <section className="section pt-4">
      <div className="wrap">
        <SectionHead
          eyebrow="Market insights"
          title="Compare locations at a glance"
          sub="A preview of the dashboard: price trend, demand indicators and location comparison."
          action={
            <Link to="/market-insights" className="btn btn-outline">
              Open Market Insights
              <Icon n="arrow" size={16} />
            </Link>
          }
        />
        <div className="grid gap-5 lg:grid-cols-[1.7fr_1fr]">
          <div className="card card-pad">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {PICKS.map((id) => (
                  <button
                    key={id}
                    onClick={() => setLid(id)}
                    aria-pressed={lid === id}
                    className={'chip ' + (lid === id ? 'chip-on' : '')}
                  >
                    {LOC_BY_ID[id].name.split(' ')[0]}
                  </button>
                ))}
              </div>
              <div className="inline-flex rounded-xl bg-bg p-1" role="tablist" aria-label="Time range">
                {['1Y', '3Y', '5Y'].map((r) => (
                  <button
                    key={r}
                    role="tab"
                    aria-selected={range === r}
                    onClick={() => setRange(r)}
                    className={
                      'rounded-lg px-3.5 py-1 text-[13px] font-bold transition ' +
                      (range === r ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink')
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
              <div>
                <div className="text-sm text-muted">{loc.name} · illustrative price per cent</div>
                <div className="text-3xl font-extrabold tracking-tight">
                  ₹{pts[pts.length - 1].value.toFixed(1)} L{' '}
                  <span className={'text-base font-bold ' + (ch >= 0 ? 'text-brand-text' : 'text-danger')}>
                    {ch >= 0 ? '+' : ''}
                    {ch.toFixed(1)}%
                  </span>
                </div>
              </div>
              <SampleTag>Sample data</SampleTag>
            </div>
            <MarketChart
              id="mp"
              height={290}
              series={[{ name: loc.name, color: '#0B4F3C', points: pts }]}
              fmt={(v) => '₹' + v.toFixed(0) + ' L'}
            />
          </div>
          <div className="grid gap-5">
            <div className="card card-pad">
              <h3 className="mb-4 text-base">Demand indicators</h3>
              {[
                ['Commercial footfall', loc.footfall],
                ['Residential demand', loc.residential],
                ['Infrastructure', loc.infra],
              ].map(([l, v]) => (
                <div key={l} className="mb-3.5 last:mb-0">
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="text-muted">{l}</span>
                    <b>{v}/100</b>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-line">
                    <div className="h-full rounded-full bg-brand" style={{ width: v + '%' }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="card card-pad">
              <h3 className="mb-4 text-base">Development potential by area</h3>
              <ul className="space-y-2.5">
                {cmp.map((l) => (
                  <li key={l.id} className="grid grid-cols-[110px_1fr_28px] items-center gap-3 text-[13px]">
                    <span className="truncate font-semibold">{l.name.split(' ')[0]}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-line">
                      <span
                        className="block h-full rounded-full bg-lime-600"
                        style={{ width: l.dev + '%' }}
                      />
                    </span>
                    <b className="text-right">{l.dev}</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-4 text-[13px] text-muted">
          All figures are illustrative samples, not real market statistics or a guarantee of future returns.
        </p>
      </div>
    </section>
  );
}
