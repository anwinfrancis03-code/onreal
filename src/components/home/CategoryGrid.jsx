import { useMemo } from 'react';
import { Icon } from '../Icon';
import { PropertyImage } from '../PropertyImage';
import { SectionHead } from '../ui';
import { Link } from '../../utils/router';
import { useApp } from '../../context/AppContext';
import { CATEGORY_PHOTOS } from '../../data/images';
import { emptyF, filterListings } from '../../utils/filters';

export const CATEGORIES = [
  {
    key: 'land',
    title: 'Land for sale',
    icon: 'land',
    to: '/properties?type=Land&purpose=Sale',
    f: { types: ['Land'], purpose: 'Sale' },
    scene: 'Land',
  },
  {
    key: 'commercial',
    title: 'Commercial spaces for rent',
    icon: 'building',
    to: '/properties?type=Commercial%20Building,Office,Shop&purpose=Rent',
    f: { types: ['Commercial Building', 'Office', 'Shop'], purpose: 'Rent' },
    scene: 'Commercial Building',
  },
  {
    key: 'shops',
    title: 'Shops and retail spaces',
    icon: 'store',
    to: '/properties?type=Shop',
    f: { types: ['Shop'] },
    scene: 'Shop',
  },
  {
    key: 'offices',
    title: 'Offices',
    icon: 'briefcase',
    to: '/properties?type=Office',
    f: { types: ['Office'] },
    scene: 'Office',
  },
  {
    key: 'residential',
    title: 'Residential properties',
    icon: 'home',
    to: '/properties?use=Residential',
    f: { use: 'Residential' },
    scene: 'Land',
  },
  {
    key: 'investment',
    title: 'Investment opportunities',
    icon: 'trend',
    to: '/properties?inv=1',
    f: { inv: true },
    scene: 'Commercial Building',
  },
];

export function CategoryGrid() {
  const { listings } = useApp();
  const counts = useMemo(
    () =>
      Object.fromEntries(
        CATEGORIES.map((c) => [c.key, filterListings(listings, { ...emptyF, ...c.f }).length]),
      ),
    [listings],
  );
  return (
    <section className="section pt-12 sm:pt-16">
      <div className="wrap">
        <SectionHead
          eyebrow="Explore by category"
          title="Whatever you are looking for, start here"
          sub="Jump straight to the kind of space that fits your plan."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key}
              to={c.to}
              className="group relative isolate flex h-48 items-end overflow-hidden rounded-2xl border border-line bg-line shadow-card transition hover:-translate-y-1 hover:shadow-lift sm:h-56"
            >
              <div className="absolute inset-0 -z-20 transition duration-500 group-hover:scale-105">
                <PropertyImage src={CATEGORY_PHOTOS[c.key]} alt="" type={c.scene} seed={c.key.length * 7} />
              </div>
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-deep-800/90 via-deep-800/35 to-transparent" />
              <div className="flex w-full items-end justify-between gap-3 p-5 text-white">
                <div>
                  <span className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-white/15 backdrop-blur">
                    <Icon n={c.icon} size={18} />
                  </span>
                  <h3 className="text-lg text-white">{c.title}</h3>
                  <p className="text-[13px] text-white/75">
                    {counts[c.key]} {counts[c.key] === 1 ? 'listing' : 'listings'}
                  </p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-lime text-deep-800 transition group-hover:translate-x-0.5">
                  <Icon n="upright" size={17} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
