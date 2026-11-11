import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Icon, TYPE_ICON } from './Icon';
import { PropertyImage } from './PropertyImage';
import { Link } from '../utils/router';
import { listingPhotos } from '../data/images';
import { fmtArea, fmtINR, fmtNum } from '../utils/format';

export function Price({ p, size = 'lg' }) {
  const rent = p.purpose === 'Rent';
  return (
    <div
      className={
        'whitespace-nowrap font-extrabold tracking-tight text-ink ' + (size === 'xl' ? 'text-3xl' : 'text-xl')
      }
    >
      {rent ? '₹' + fmtNum(Math.round(p.price)) : fmtINR(p.price)}
      {rent && <span className="text-sm font-medium text-muted"> / month</span>}
    </div>
  );
}

export function PropertyCard({ p, view = 'grid', i = 0 }) {
  const A = useApp();
  const fav = A.isFav(p.id);
  const photo = listingPhotos(p, 700).urls[0];
  const list = view === 'list';
  return (
    <motion.article
      className={
        'group card flex overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-lift ' +
        (list ? 'flex-col sm:flex-row' : 'flex-col')
      }
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.45, delay: (i % 6) * 0.05, ease: [0.22, 0.8, 0.24, 1] }}
    >
      <div
        className={
          'relative shrink-0 overflow-hidden bg-line/50 ' +
          (list ? 'aspect-[4/3] sm:aspect-auto sm:w-72' : 'aspect-[4/3]')
        }
      >
        <Link to={'/properties/' + p.id} aria-label={'Open ' + p.title} className="block h-full">
          <PropertyImage
            src={photo}
            alt={p.title + ' in ' + p.town}
            type={p.type}
            seed={p.seed}
            className="transition duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between">
          <div className="flex flex-wrap gap-1.5">
            <span className={'badge ' + (p.purpose === 'Rent' ? 'badge-rent' : 'badge-sale')}>
              {p.purpose === 'Rent' ? 'For Rent' : 'For Sale'}
            </span>
            <span className="badge bg-white/95 text-ink ring-0">
              {p.type === 'Commercial Building' ? 'Commercial' : p.type}
            </span>
          </div>
          <button
            className={
              'pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-sm transition hover:scale-105 ' +
              (fav ? 'text-rose-600' : 'text-ink')
            }
            onClick={() => A.toggleFav(p.id)}
            aria-pressed={fav}
            aria-label={fav ? 'Remove from favourites' : 'Save to favourites'}
          >
            <Icon n="heart" size={18} style={{ fill: fav ? 'currentColor' : 'none' }} />
          </button>
        </div>
        {p.sample && (
          <span className="absolute bottom-3 left-3 rounded-md bg-deep-800/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur">
            Sample listing
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <Price p={p} />
          <span className={'badge ' + (p.status === 'Active' ? 'badge-soft' : 'badge-warn')}>
            {p.status === 'Active' ? 'Available' : p.status}
          </span>
        </div>
        <div>
          <h3 className="line-clamp-1 text-base font-bold">{p.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
            <Icon n="pin" size={15} className="shrink-0" />
            <span className="line-clamp-1">
              {p.locality}, {p.town}
            </span>
          </p>
        </div>
        {list && <p className="line-clamp-2 text-sm text-muted">{p.desc}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3.5 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Icon n="ruler" size={15} />
            {fmtArea(p.area, p.unit)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icon n={TYPE_ICON[p.type]} size={15} />
            {p.type}
          </span>
          <Link
            to={'/properties/' + p.id}
            className="inline-flex items-center gap-1 font-bold text-brand-text hover:underline"
          >
            Details <Icon n="arrow" size={17} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
