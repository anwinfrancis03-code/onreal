import { Field } from './ui';
import { PROP_TYPES, PROP_USES } from '../data/constants';

/* The advanced filter fields. Rendered in the desktop sidebar and in the mobile drawer (idp keeps ids unique). */
export function PropertyFilters({ f, setF, idp = 'f' }) {
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const toggleType = (t) =>
    setF((x) => ({ ...x, types: x.types.includes(t) ? x.types.filter((y) => y !== t) : [...x.types, t] }));
  return (
    <div className="space-y-5">
      <Field label="Location" id={idp + '-loc'}>
        <input className="input" placeholder="Town, locality, district" value={f.loc} onChange={set('loc')} />
      </Field>
      <div>
        <span className="label">Buy or rent</span>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-bg p-1">
          {[
            ['', 'All'],
            ['Sale', 'Buy'],
            ['Rent', 'Rent'],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={f.purpose === v}
              onClick={() => setF((x) => ({ ...x, purpose: v }))}
              className={
                'rounded-lg py-1.5 text-[13px] font-bold transition ' +
                (f.purpose === v ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink')
              }
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div>
        <span className="label">Property category</span>
        <div className="flex flex-wrap gap-2">
          {PROP_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={f.types.includes(t)}
              onClick={() => toggleType(t)}
              className={'chip ' + (f.types.includes(t) ? 'chip-on' : '')}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <Field label="Intended use" id={idp + '-use'}>
        <select className="input" value={f.use} onChange={set('use')}>
          <option value="">Any use</option>
          {PROP_USES.map((u) => (
            <option key={u}>{u}</option>
          ))}
        </select>
      </Field>
      <div>
        <span className="label">Budget (₹)</span>
        <div className="grid grid-cols-2 gap-3">
          <input
            aria-label="Minimum budget"
            className="input"
            type="number"
            min="0"
            placeholder="Min"
            value={f.min}
            onChange={set('min')}
          />
          <input
            aria-label="Maximum budget"
            className="input"
            type="number"
            min="0"
            placeholder="Max"
            value={f.max}
            onChange={set('max')}
          />
        </div>
        <p className="field-hint">Sale price, or monthly rent for rentals.</p>
      </div>
      <div>
        <span className="label">Area</span>
        <div className="grid grid-cols-2 gap-3">
          <input
            aria-label="Minimum area"
            className="input"
            type="number"
            min="0"
            placeholder="Min"
            value={f.amin}
            onChange={set('amin')}
          />
          <input
            aria-label="Maximum area"
            className="input"
            type="number"
            min="0"
            placeholder="Max"
            value={f.amax}
            onChange={set('amax')}
          />
          <select aria-label="Area unit" className="input col-span-2" value={f.aunit} onChange={set('aunit')}>
            <option value="sqft">sq ft</option>
            <option value="cents">cents</option>
            <option value="acres">acres</option>
          </select>
        </div>
      </div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-bg/60 p-3.5 text-sm">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4"
          checked={f.inv}
          onChange={(e) => setF((x) => ({ ...x, inv: e.target.checked }))}
        />
        <span>
          <b className="block">High-growth areas only</b>
          <span className="text-xs text-muted">
            Localities with a sample development score of 80 or more.
          </span>
        </span>
      </label>
    </div>
  );
}
