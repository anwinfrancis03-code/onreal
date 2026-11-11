import { useState } from 'react';
import { Icon } from '../Icon';
import { Ring } from '../Ring';
import { Field } from '../ui';
import { Link, qs } from '../../utils/router';
import { LOCALITIES, LOC_BY_ID } from '../../data/localities';
import { USES, rankUses, scoreUse } from '../../utils/insights';

const FEATURES = [
  ['pin', 'Nearby facilities', 'Schools, hospitals, transport and markets around the plot.'],
  ['users', 'Estimated customer demand', 'Footfall and residential demand signals for the area.'],
  ['route', 'Accessibility', 'Main-road distance and public transport at a glance.'],
  ['sparkle', 'Possible business categories', 'Ranked uses, with the reasons behind each score.'],
];

export function InsightShowcase() {
  const [lid, setLid] = useState('kakkanad');
  const [use, setUse] = useState('office');
  const loc = LOC_BY_ID[lid];
  const sc = scoreUse(loc, use);
  const top = rankUses(loc).slice(0, 3);
  const access = Math.round(Math.max(5, 100 - loc.roadKm * 20) * 0.6 + loc.transit * 0.4);
  const demand = Math.round((loc.footfall + loc.residential) / 2);
  return (
    <section className="section">
      <div className="wrap">
        <div className="overflow-hidden rounded-3xl bg-deep px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
            <div>
              <div className="eyebrow !text-lime">Location intelligence</div>
              <h2 className="mt-3 text-3xl !text-white sm:text-4xl">
                Know what a place can become before you commit.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75">
                Most listings tell you the price and size. ONREAL adds the missing context: which kinds of
                business or building suit a location, and why. Insights below are simulated samples until real
                data sources are connected.
              </p>
              <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                {FEATURES.map(([ic, t, d]) => (
                  <li key={t} className="flex gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-lime">
                      <Icon n={ic} size={19} />
                    </span>
                    <div>
                      <b className="block text-sm text-white">{t}</b>
                      <span className="text-[13px] leading-snug text-white/65">{d}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <Link to="/location-intelligence" className="btn btn-lime btn-lg mt-9">
                Open the full report
                <Icon n="arrow" size={18} />
              </Link>
            </div>

            <div className="card p-5 text-ink shadow-pop sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h3 className="text-base">Try a sample insight</h3>
                <span className="sample-tag">
                  <Icon n="info" size={12} />
                  Simulated data
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Locality" id="ins-l">
                  <select className="input" value={lid} onChange={(e) => setLid(e.target.value)}>
                    {LOCALITIES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Intended purpose" id="ins-u">
                  <select className="input" value={use} onChange={(e) => setUse(e.target.value)}>
                    {Object.keys(USES).map((u) => (
                      <option key={u} value={u}>
                        {USES[u].label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-6">
                <Ring score={sc.score} size={132} />
                <div className="min-w-[180px] flex-1 space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wide text-muted">
                    Best-fit categories
                  </div>
                  {top.map((t) => (
                    <div key={t.use} className="grid grid-cols-[1fr_32px] items-center gap-3 text-sm">
                      <div>
                        <div className="mb-1 font-semibold">{t.label}</div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-line">
                          <div className="h-full rounded-full bg-brand" style={{ width: t.score + '%' }} />
                        </div>
                      </div>
                      <b className="text-right">{t.score}</b>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
                <div>
                  <div className="text-xs text-muted">Accessibility</div>
                  <b className="text-lg">{access}/100</b>
                </div>
                <div>
                  <div className="text-xs text-muted">Estimated demand</div>
                  <b className="text-lg">{demand}/100</b>
                </div>
              </div>
              <Link
                to={'/location-intelligence' + qs({ loc: lid, use })}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-text hover:underline"
              >
                See nearby facilities, risks and reasons
                <Icon n="arrow" size={15} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
