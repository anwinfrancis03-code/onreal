import { useState } from 'react';
import { Disclaimer, Empty, PageHead, SampleTag } from '../components/ui';
import { LocalityCard } from '../components/LocalityCard';
import { MarketChart } from '../components/MarketChart';
import { Icon } from '../components/Icon';
import { Link } from '../utils/router';
import { LOCALITIES, LOC_BY_ID } from '../data/localities';
import { pctChange, pointsFor } from '../utils/insights';

const PALETTE = ['#0B4F3C', '#C9A227', '#3D8FA8', '#C0573B', '#7A63C9'];

const Seg = ({ value, onChange, opts }) => (
  <div className="inline-flex rounded-xl bg-bg p-1 ring-1 ring-line" role="tablist" aria-label="Time range">
    {opts.map((r) => (
      <button
        key={r}
        role="tab"
        aria-selected={value === r}
        onClick={() => onChange(r)}
        className={
          'rounded-lg px-4 py-1.5 text-[13px] font-bold transition ' +
          (value === r ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink')
        }
      >
        {r}
      </button>
    ))}
  </div>
);

export function MarketInsights({ route }) {
  const [sel, setSel] = useState(
    route.query.loc && LOC_BY_ID[route.query.loc] ? route.query.loc : 'thrissur',
  );
  const [range, setRange] = useState('3Y');
  const [cmp, setCmp] = useState(['thrissur', 'kakkanad']);
  const loc = LOC_BY_ID[sel];
  const pts = pointsFor(loc, range);
  const ch = pctChange(pts);
  const toggleCmp = (id) =>
    setCmp((c) =>
      c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? [...c.slice(1), id] : [...c, id],
    );
  const series = cmp.map((id, i) => ({
    name: LOC_BY_ID[id].name.split(' ')[0],
    color: PALETTE[i],
    points: pointsFor(LOC_BY_ID[id], range),
  }));
  const kpi = [
    ['wallet', 'Price per cent', '₹' + pts[pts.length - 1].value.toFixed(1) + ' L'],
    ['trend', range + ' change', (ch >= 0 ? '+' : '') + ch.toFixed(1) + '%'],
    ['target', 'Development potential', loc.dev + '/100'],
    ['users', 'Commercial footfall', loc.footfall + '/100'],
  ];

  return (
    <div className="wrap pb-16 pt-8 sm:pt-10">
      <PageHead
        crumbs={[['Home', '/'], ['Market Insights']]}
        eyebrow="Market insights"
        title="Where is the next opportunity?"
        sub="Explore locations with promising development potential."
        actions={
          <Link to={'/location-intelligence?loc=' + sel} className="btn btn-outline">
            Location report for {loc.name.split(' ')[0]}
            <Icon n="arrow" size={16} />
          </Link>
        }
      />
      <Disclaimer>
        <b>Sample data only.</b> Every price, trend and score on this page is illustrative. ONREAL does not
        yet use verified land prices. Real appreciation estimates need reliable historical prices, market data
        and a documented method, and future returns are never guaranteed.
      </Disclaimer>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpi.map(([ic, l, v]) => (
          <div key={l} className="card card-pad">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-text">
                <Icon n={ic} size={16} />
              </span>
              {l}
            </div>
            <div
              className={
                'text-3xl font-extrabold tracking-tight ' +
                (l.includes('change') && ch < 0 ? 'text-danger' : '')
              }
            >
              {v}
            </div>
            <div className="mt-1 text-xs text-muted">{loc.name}</div>
          </div>
        ))}
      </div>

      <div className="card card-pad mt-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg">{loc.name}: illustrative price per cent</h2>
            <div className="mt-1">
              <SampleTag>Sample data</SampleTag>
            </div>
          </div>
          <Seg value={range} onChange={setRange} opts={['1Y', '3Y', '5Y']} />
        </div>
        <MarketChart
          id="mi"
          series={[{ name: loc.name, color: '#0B4F3C', points: pts }]}
          fmt={(v) => '₹' + v.toFixed(1) + ' L'}
        />
        <div className="mt-4 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-3">
          <div className="flex justify-between sm:block">
            <span className="text-muted">Distance to main road</span>
            <b className="sm:block">~{loc.roadKm} km</b>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-muted">Infrastructure</span>
            <b className="sm:block">{loc.infra}/100</b>
          </div>
          <div className="flex justify-between sm:block">
            <span className="text-muted">Potential uses</span>
            <b className="sm:block">{loc.uses.join(', ')}</b>
          </div>
        </div>
      </div>

      <h2 className="mb-5 mt-14 text-2xl">Explore localities</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {LOCALITIES.map((l) => (
          <LocalityCard key={l.id} loc={l} active={sel === l.id} onClick={() => setSel(l.id)} />
        ))}
      </div>

      <div className="card card-pad mt-14">
        <h2 className="text-xl">Compare localities</h2>
        <p className="mb-4 mt-1 text-sm text-muted">
          Choose up to three areas to compare on the same chart ({range} view).
        </p>
        <div className="mb-5 flex flex-wrap gap-2">
          {LOCALITIES.map((l) => (
            <button
              key={l.id}
              aria-pressed={cmp.includes(l.id)}
              onClick={() => toggleCmp(l.id)}
              className={'chip ' + (cmp.includes(l.id) ? 'chip-on' : '')}
            >
              {l.name}
            </button>
          ))}
        </div>
        {cmp.length < 2 ? (
          <Empty
            icon="trend"
            title="Select at least two localities"
            text="Pick another area to see the comparison chart and table."
          />
        ) : (
          <>
            <MarketChart id="cmp" series={series} fmt={(v) => '₹' + v.toFixed(1) + ' L'} area={false} />
            <div className="mt-4 overflow-x-auto">
              <table className="table min-w-[560px]">
                <thead>
                  <tr>
                    <th>Locality</th>
                    <th>Price / cent</th>
                    <th>{range} change</th>
                    <th>Infrastructure</th>
                    <th>Commercial</th>
                    <th>Dev. potential</th>
                  </tr>
                </thead>
                <tbody>
                  {cmp.map((id, i) => {
                    const l = LOC_BY_ID[id],
                      p = pointsFor(l, range),
                      c = pctChange(p);
                    return (
                      <tr key={id}>
                        <td>
                          <span
                            className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
                            style={{ background: PALETTE[i] }}
                          />
                          <b>{l.name}</b>
                        </td>
                        <td>₹{p[p.length - 1].value.toFixed(1)} L</td>
                        <td className={c >= 0 ? 'font-bold text-brand-text' : 'font-bold text-danger'}>
                          {c >= 0 ? '+' : ''}
                          {c.toFixed(1)}%
                        </td>
                        <td>{l.infra}</td>
                        <td>{l.footfall}</td>
                        <td>{l.dev}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
