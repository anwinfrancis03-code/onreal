import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyFilters } from '../components/PropertyFilters';
import { PropertyMap } from '../components/PropertyMap';
import { CardSkeleton, Drawer, Empty, PageHead } from '../components/ui';
import { Icon } from '../components/Icon';
import { Link } from '../utils/router';
import { useApp } from '../context/AppContext';
import { emptyF, filterListings, fromQuery, sortListings } from '../utils/filters';
import { fmtINR } from '../utils/format';

const QUICK = [
  ['', 'All'],
  ['Land', 'Land'],
  ['Shop', 'Shops'],
  ['Office', 'Offices'],
  ['Commercial Building', 'Commercial'],
];

function activeChips(f, setF) {
  const out = [];
  const rm = (patch) => () => setF((x) => ({ ...x, ...patch }));
  if (f.loc) out.push(['Location: ' + f.loc, rm({ loc: '' })]);
  if (f.purpose) out.push([f.purpose === 'Sale' ? 'Buy' : 'Rent', rm({ purpose: '' })]);
  f.types.forEach((t) => out.push([t, () => setF((x) => ({ ...x, types: x.types.filter((y) => y !== t) }))]));
  if (f.use) out.push(['Use: ' + f.use, rm({ use: '' })]);
  if (f.min !== '' || f.max !== '')
    out.push([
      `Budget ${f.min !== '' ? fmtINR(+f.min) : '₹0'} – ${f.max !== '' ? fmtINR(+f.max) : 'any'}`,
      rm({ min: '', max: '' }),
    ]);
  if (f.amin !== '' || f.amax !== '')
    out.push([`Area ${f.amin || 0} – ${f.amax || 'any'} ${f.aunit}`, rm({ amin: '', amax: '' })]);
  if (f.inv) out.push(['High-growth areas', rm({ inv: false })]);
  return out;
}

export function Properties({ route }) {
  const A = useApp();
  const [f, setF] = useState(() => fromQuery(route.query));
  const [view, setView] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [act, setAct] = useState(null);

  useEffect(() => setF(fromQuery(route.query)), [route.raw]);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  const res = useMemo(() => sortListings(filterListings(A.listings, f), f), [A.listings, f]);
  const activeP = act && res.find((p) => p.id === act);
  const chips = activeChips(f, setF);
  const dirty = JSON.stringify({ ...f, sort: '' }) !== JSON.stringify({ ...emptyF, sort: '' });
  const clear = () => setF({ ...emptyF, sort: f.sort });
  const quickType = (t) => setF((x) => ({ ...x, types: t ? [t] : [] }));
  const seg = (on) =>
    'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] font-bold transition ' +
    (on ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink');

  return (
    <div className="wrap pb-16 pt-8 sm:pt-10">
      <PageHead
        crumbs={[['Home', '/'], ['Explore Properties']]}
        title="Explore properties"
        sub="Search land and commercial space by place, budget, area and what you plan to use it for."
      />

      <div className="card mb-6 flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon
            n="search"
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            aria-label="Search by location"
            className="input h-12 border-transparent bg-bg pl-11"
            placeholder="Search by town, locality or district"
            value={f.loc}
            onChange={(e) => setF((x) => ({ ...x, loc: e.target.value }))}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Sort by"
            className="input h-12 w-auto min-w-[170px]"
            value={f.sort}
            onChange={(e) => setF((x) => ({ ...x, sort: e.target.value }))}
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="new">Newest listing</option>
            <option value="plh">Price: low to high</option>
            <option value="phl">Price: high to low</option>
          </select>
          <button className="btn btn-outline h-12 lg:hidden" onClick={() => setDrawer(true)}>
            <Icon n="sliders" size={17} />
            Filters{chips.length ? ` (${chips.length})` : ''}
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
        <aside aria-label="Filters" className="card card-pad hidden h-fit lg:sticky lg:top-24 lg:block">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base">Filters</h2>
            {dirty && (
              <button onClick={clear} className="text-[13px] font-bold text-brand-text hover:underline">
                Reset
              </button>
            )}
          </div>
          <PropertyFilters f={f} setF={setF} idp="d" />
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Quick category">
              {QUICK.map(([v, l]) => {
                const on = v ? f.types.length === 1 && f.types[0] === v : f.types.length === 0;
                return (
                  <button
                    key={l}
                    aria-pressed={on}
                    onClick={() => quickType(v)}
                    className={'chip ' + (on ? 'chip-on' : '')}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
            <div className="inline-flex rounded-xl bg-bg p-1 ring-1 ring-line" role="group" aria-label="View">
              <button
                className={seg(view === 'grid')}
                aria-pressed={view === 'grid'}
                onClick={() => setView('grid')}
              >
                <Icon n="grid" size={15} />
                Grid
              </button>
              <button
                className={seg(view === 'list')}
                aria-pressed={view === 'list'}
                onClick={() => setView('list')}
              >
                <Icon n="list" size={15} />
                List
              </button>
              <button
                className={seg(view === 'map')}
                aria-pressed={view === 'map'}
                onClick={() => setView('map')}
              >
                <Icon n="map" size={15} />
                Map
              </button>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">
              <b>{res.length}</b> {res.length === 1 ? 'property' : 'properties'} found
            </span>
            {chips.map(([label, remove]) => (
              <button
                key={label}
                onClick={remove}
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-text hover:bg-brand-100"
                aria-label={'Remove filter ' + label}
              >
                {label}
                <Icon n="x" size={12} />
              </button>
            ))}
            {dirty && (
              <button onClick={clear} className="text-xs font-bold text-muted underline hover:text-ink">
                Clear all
              </button>
            )}
          </div>

          {view === 'map' && (
            <div className="mb-6">
              <PropertyMap
                height={440}
                markers={res.map((p) => ({ id: p.id, lat: p.lat, lng: p.lng, label: p.title }))}
                activeId={act}
                onSelect={setAct}
              />
              <AnimatePresence>
                {activeP && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="card mt-3 flex flex-wrap items-center justify-between gap-3 p-4"
                  >
                    <div>
                      <b>{activeP.title}</b>
                      <div className="text-sm text-muted">
                        {activeP.locality}, {activeP.town} ·{' '}
                        {activeP.purpose === 'Rent'
                          ? '₹' + activeP.price.toLocaleString('en-IN') + ' / month'
                          : fmtINR(activeP.price)}
                      </div>
                    </div>
                    <Link to={'/properties/' + activeP.id} className="btn btn-primary btn-sm">
                      View details
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="mt-2 text-xs text-muted">
                Map data © OpenStreetMap contributors. Select a marker to preview a listing.
              </p>
            </div>
          )}

          {loading ? (
            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : res.length === 0 ? (
            <Empty
              icon="search"
              title="No properties match your filters"
              text="Try widening the budget or area, or clear some filters to see more listings."
              action={
                <button className="btn btn-primary" onClick={clear}>
                  Clear all filters
                </button>
              }
            />
          ) : (
            <div
              className={'grid gap-6 ' + (view === 'list' ? 'grid-cols-1' : 'md:grid-cols-2 2xl:grid-cols-3')}
            >
              {res.map((p, i) => (
                <PropertyCard key={p.id} p={p} view={view === 'list' ? 'list' : 'grid'} i={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Drawer
        open={drawer}
        title="Filters"
        onClose={() => setDrawer(false)}
        footer={
          <div className="grid grid-cols-2 gap-3">
            <button className="btn btn-outline" onClick={clear}>
              Reset
            </button>
            <button className="btn btn-primary" onClick={() => setDrawer(false)}>
              Show {res.length} results
            </button>
          </div>
        }
      >
        <PropertyFilters f={f} setF={setF} idp="m" />
      </Drawer>
    </div>
  );
}
