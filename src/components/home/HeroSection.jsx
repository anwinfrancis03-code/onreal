import { useState } from 'react';
import { Icon } from '../Icon';
import { PropertyImage } from '../PropertyImage';
import { Link, go, qs } from '../../utils/router';
import { HERO_PHOTOS } from '../../data/images';
import { PROP_TYPES } from '../../data/constants';
import { LOC_BY_ID } from '../../data/localities';
import { scoreUse } from '../../utils/insights';

export const BUDGETS = {
  Sale: [
    ['', 'Any budget'],
    ['0-2500000', 'Under ₹25 L'],
    ['2500000-10000000', '₹25 L – ₹1 Cr'],
    ['10000000-50000000', '₹1 Cr – ₹5 Cr'],
    ['50000000-', 'Above ₹5 Cr'],
  ],
  Rent: [
    ['', 'Any budget'],
    ['0-25000', 'Under ₹25,000'],
    ['25000-75000', '₹25k – ₹75k'],
    ['75000-200000', '₹75k – ₹2 L'],
    ['200000-', 'Above ₹2 L'],
  ],
};

export function SearchPanel() {
  const [f, setF] = useState({ loc: '', type: '', purpose: 'Sale', budget: '' });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const [min, max] = (f.budget || '-').split('-');
    go('/properties' + qs({ loc: f.loc.trim(), type: f.type, purpose: f.purpose, min, max }));
  };
  return (
    <form
      onSubmit={submit}
      role="search"
      aria-label="Search properties"
      className="card relative z-10 p-3 shadow-pop sm:p-4"
    >
      <div className="mb-3 inline-flex rounded-xl bg-bg p-1" role="tablist" aria-label="Transaction type">
        {[
          ['Sale', 'Buy'],
          ['Rent', 'Rent'],
        ].map(([v, l]) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={f.purpose === v}
            onClick={() => setF((x) => ({ ...x, purpose: v, budget: '' }))}
            className={
              'rounded-lg px-5 py-1.5 text-sm font-bold transition ' +
              (f.purpose === v ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink')
            }
          >
            {l}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto]">
        <div>
          <label htmlFor="hs-loc" className="label">
            Location
          </label>
          <div className="relative">
            <Icon
              n="pin"
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id="hs-loc"
              className="input pl-10"
              placeholder="City, town or locality"
              value={f.loc}
              onChange={set('loc')}
            />
          </div>
        </div>
        <div>
          <label htmlFor="hs-type" className="label">
            Property type
          </label>
          <select id="hs-type" className="input" value={f.type} onChange={set('type')}>
            <option value="">All types</option>
            {PROP_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="hs-bud" className="label">
            Budget
          </label>
          <select id="hs-bud" className="input" value={f.budget} onChange={set('budget')}>
            {BUDGETS[f.purpose].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button className="btn btn-primary btn-lg w-full md:w-auto" type="submit">
            <Icon n="search" size={18} />
            Search
          </button>
        </div>
      </div>
    </form>
  );
}

export function Hero() {
  const insight = scoreUse(LOC_BY_ID.kakkanad, 'office');
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-48 top-24 h-[520px] w-[520px] rounded-full bg-lime/20 blur-3xl"
      />
      <div className="wrap relative grid items-center gap-12 pb-20 pt-10 sm:pt-14 lg:grid-cols-[1.02fr_.98fr] lg:pb-28 lg:pt-20">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-bold text-brand-text shadow-sm">
            <span className="h-2 w-2 rounded-full bg-lime ring-2 ring-lime/40" /> Owners, buyers and
            businesses, directly connected
          </span>
          <h1 className="mt-5 text-[2.5rem] font-extrabold leading-[1.05] sm:text-6xl">
            Find the Right Space for Your{' '}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">Next Opportunity.</span>
              <span aria-hidden="true" className="absolute inset-x-0 bottom-1 z-0 h-3 bg-lime/70 sm:h-4" />
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            ONREAL connects property owners, buyers, investors and business owners. Discover land and
            commercial space, then see what each location could be used for before you commit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/properties" className="btn btn-primary btn-lg">
              Explore Properties
              <Icon n="arrow" size={18} />
            </Link>
            <Link to="/sell" className="btn btn-outline btn-lg">
              List Your Property
            </Link>
          </div>
          <ul className="mt-9 grid gap-3 text-sm font-semibold text-ink sm:grid-cols-3">
            {[
              ['users', 'Deal directly with owners'],
              ['compass', 'Location insights on every listing'],
              ['wallet', 'Prices in ₹, local area units'],
            ].map(([ic, t]) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-text">
                  <Icon n={ic} size={16} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div className="grid h-[380px] grid-cols-[1.25fr_1fr] grid-rows-2 gap-3 sm:h-[460px] sm:gap-4">
            <div className="row-span-2 overflow-hidden rounded-2xl bg-line shadow-lift">
              <PropertyImage
                src={HERO_PHOTOS[0]}
                alt="Modern home with landscaped garden"
                type="Land"
                seed={5}
                eager
              />
            </div>
            <div className="overflow-hidden rounded-2xl bg-line shadow-card">
              <PropertyImage
                src={HERO_PHOTOS[1]}
                alt="City buildings at dusk"
                type="Commercial Building"
                seed={9}
                eager
              />
            </div>
            <div className="overflow-hidden rounded-2xl bg-line shadow-card">
              <PropertyImage src={HERO_PHOTOS[2]} alt="Open green land" type="Land" seed={2} eager />
            </div>
          </div>
          <div className="card absolute -bottom-6 left-3 w-[250px] p-4 shadow-lift sm:-left-6 sm:w-[270px]">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Sample insight</span>
              <span className="sample-tag">Simulated</span>
            </div>
            <div className="mt-2 text-sm font-bold">Office in Kakkanad</div>
            <div className="mt-2 flex items-center gap-3">
              <div className="text-3xl font-extrabold tracking-tight">
                {insight.score}
                <span className="text-sm font-semibold text-muted">/100</span>
              </div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-brand" style={{ width: insight.score + '%' }} />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">Illustrative score from sample rules.</p>
          </div>
        </div>
      </div>
      <div className="wrap relative -mt-4 pb-4 sm:-mt-10 lg:-mt-14">
        <SearchPanel />
      </div>
    </section>
  );
}
