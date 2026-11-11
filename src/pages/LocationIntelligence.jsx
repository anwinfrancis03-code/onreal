import { useState } from 'react';
import { Field, PageHead } from '../components/ui';
import { SuitabilityReport } from '../components/LocationInsights';
import { useApp } from '../context/AppContext';
import { USE_MAP } from '../data/constants';
import { LOCALITIES, LOC_BY_ID, nearestLocality } from '../data/localities';
import { USES } from '../utils/insights';

export function LocationIntelligence({ route }) {
  const A = useApp();
  const q = route.query;
  const [lid, setLid] = useState(LOC_BY_ID[q.loc] ? q.loc : 'thrissur');
  const [use, setUse] = useState(USES[q.use] ? q.use : 'retail');
  const [lp, setLp] = useState('');
  const loc = LOC_BY_ID[lid];
  const active = A.listings.filter((l) => l.status === 'Active');
  const pickListing = (e) => {
    const id = e.target.value;
    setLp(id);
    if (!id) return;
    const p = A.getListing(id);
    setLid(nearestLocality(p.lat, p.lng).id);
    setUse(USE_MAP[p.uses[0]] || 'other');
  };
  return (
    <div className="wrap pb-16 pt-8 sm:pt-10">
      <PageHead
        crumbs={[['Home', '/'], ['Location Intelligence']]}
        eyebrow="Location intelligence"
        title="More than land. Discover what it can become."
        sub="Select a property or locality and your intended purpose to see a sample suitability report."
      />
      <div className="card card-pad mb-6">
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Analyse a listing (optional)" id="li-p">
            <select className="input" value={lp} onChange={pickListing}>
              <option value="">Choose a property...</option>
              {active.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Locality" id="li-l">
            <select
              className="input"
              value={lid}
              onChange={(e) => {
                setLid(e.target.value);
                setLp('');
              }}
            >
              {LOCALITIES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Intended business purpose" id="li-u">
            <select className="input" value={use} onChange={(e) => setUse(e.target.value)}>
              {Object.keys(USES).map((u) => (
                <option key={u} value={u}>
                  {USES[u].label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>
      <SuitabilityReport key={lid + use} loc={loc} use={use} full />
    </div>
  );
}
