import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Link, go } from '../utils/router';
import { useApp } from '../context/AppContext';
import { Disclaimer, Empty, Field, Modal } from '../components/ui';
import { Icon, TYPE_ICON } from '../components/Icon';
import { PropertyImage } from '../components/PropertyImage';
import { PropertyMap } from '../components/PropertyMap';
import { PropertyCard, Price } from '../components/PropertyCard';
import { SuitabilityReport } from '../components/LocationInsights';
import { nearestLocality } from '../data/localities';
import { USE_MAP } from '../data/constants';
import { listingPhotos } from '../data/images';
import { facilitiesOf } from '../utils/insights';
import { fmtArea, fmtINR, fmtNum, initials, toSqft, todayISO } from '../utils/format';

function Lightbox({ urls, start, p, onClose }) {
  const [i, setI] = useState(start);
  const go_ = (d) => setI((x) => (x + d + urls.length) % urls.length);
  useEffect(() => {
    const k = (e) => (e.key === 'ArrowRight' ? go_(1) : e.key === 'ArrowLeft' ? go_(-1) : null);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, []);
  return (
    <Modal title={`Photos (${i + 1} of ${urls.length})`} onClose={onClose} wide>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-line">
        <PropertyImage
          src={urls[i]}
          alt={`${p.title}, photo ${i + 1}`}
          type={p.type}
          seed={p.seed}
          variant={i}
          eager
        />
        {urls.length > 1 && (
          <>
            <button
              className="icon-btn absolute left-3 top-1/2 -translate-y-1/2 bg-white/90"
              onClick={() => go_(-1)}
              aria-label="Previous photo"
            >
              <Icon n="left" />
            </button>
            <button
              className="icon-btn absolute right-3 top-1/2 -translate-y-1/2 bg-white/90"
              onClick={() => go_(1)}
              aria-label="Next photo"
            >
              <Icon n="right" />
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

function Gallery({ p }) {
  const { urls, stock } = listingPhotos(p, 1200);
  const [box, setBox] = useState(null);
  const tile = (i, cls) => (
    <button
      key={i}
      onClick={() => setBox(i)}
      className={'group relative overflow-hidden bg-line ' + cls}
      aria-label={`Open photo ${i + 1}`}
    >
      <PropertyImage
        src={urls[i]}
        alt={`${p.title}, photo ${i + 1}`}
        type={p.type}
        seed={p.seed}
        variant={i}
        eager={i === 0}
        className="transition duration-500 group-hover:scale-105"
      />
    </button>
  );
  return (
    <div>
      <div className="relative">
        <div
          className={
            'grid gap-2 overflow-hidden rounded-2xl ' +
            (urls.length > 1 ? 'sm:grid-cols-[2fr_1fr] sm:grid-rows-2' : '')
          }
        >
          {tile(0, 'aspect-[4/3] sm:row-span-2 sm:aspect-auto sm:h-[440px]')}
          {urls.length > 1 && tile(1, 'hidden sm:block sm:h-[216px]')}
          {urls.length > 2 && tile(2, 'hidden sm:block sm:h-[216px]')}
        </div>
        <button
          className="btn btn-light btn-sm absolute bottom-3 right-3 shadow-card"
          onClick={() => setBox(0)}
        >
          <Icon n="image" size={15} />
          View all {urls.length} photos
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        {p.sample
          ? 'Sample listing: photography is illustrative.'
          : stock
            ? 'The owner has not uploaded photos yet. Showing illustrative stock photography.'
            : ''}
      </p>
      <AnimatePresence>
        {box !== null && <Lightbox urls={urls} start={box} p={p} onClose={() => setBox(null)} />}
      </AnimatePresence>
    </div>
  );
}

function VisitModal({ p, onClose }) {
  const A = useApp();
  const [d, setD] = useState('');
  const [t, setT] = useState('Morning (9-12)');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!d) return setErr('Please choose a date.');
    if (d < todayISO()) return setErr('Choose today or a future date.');
    A.addVisit({
      listingId: p.id,
      listingTitle: p.title,
      date: d,
      time: t,
      note,
      ownerId: p.ownerId,
      name: A.user.name,
    });
    A.toast('Site visit request saved in this demo.');
    onClose();
  };
  return (
    <Modal title="Request a site visit" onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <p className="text-sm text-muted">{p.title}</p>
        <Field label="Preferred date" id="v-d" error={err}>
          <input
            className="input"
            type="date"
            min={todayISO()}
            value={d}
            onChange={(e) => {
              setD(e.target.value);
              setErr('');
            }}
          />
        </Field>
        <Field label="Time slot" id="v-t">
          <select className="input" value={t} onChange={(e) => setT(e.target.value)}>
            <option>Morning (9-12)</option>
            <option>Afternoon (12-4)</option>
            <option>Evening (4-6)</option>
          </select>
        </Field>
        <Field label="Note (optional)" id="v-n">
          <textarea className="input" value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <button className="btn btn-primary w-full" type="submit">
          Submit request
        </button>
      </form>
    </Modal>
  );
}

export function PropertyDetail({ id }) {
  const A = useApp();
  const p = A.getListing(id);
  const [enq, setEnq] = useState({ message: '', phone: '' });
  const [err, setErr] = useState({});
  const [visit, setVisit] = useState(false);

  if (!p)
    return (
      <div className="wrap py-16">
        <Empty
          icon="alert"
          title="Listing not found"
          text="This listing may have been removed or never existed in this browser."
          action={
            <Link to="/properties" className="btn btn-primary">
              Browse properties
            </Link>
          }
        />
      </div>
    );

  const loc = nearestLocality(p.lat, p.lng);
  const fac = facilitiesOf(loc);
  const mine = A.user && p.ownerId === A.user.id;
  const useKey = USE_MAP[p.uses[0]] || 'other';
  const similar = A.listings
    .filter(
      (l) =>
        l.id !== p.id &&
        l.status === 'Active' &&
        (l.type === p.type || nearestLocality(l.lat, l.lng).id === loc.id),
    )
    .slice(0, 3);
  const showContact = p.privacy === 'public' || (p.privacy === 'members' && A.user);
  const perSqft = Math.round(p.price / toSqft(p.area, p.unit));
  const next = encodeURIComponent('/properties/' + p.id);

  const send = (e) => {
    e.preventDefault();
    const er = {};
    if (enq.message.trim().length < 10) er.message = 'Please write at least 10 characters.';
    if (enq.phone && !/^[+\d][\d\s-]{6,}$/.test(enq.phone))
      er.phone = 'Enter a valid phone number or leave it blank.';
    setErr(er);
    if (Object.keys(er).length) return;
    A.addEnquiry({
      listingId: p.id,
      listingTitle: p.title,
      message: enq.message.trim(),
      phone: enq.phone,
      name: A.user.name,
      email: A.user.email,
    });
    setEnq({ message: '', phone: '' });
    A.toast('Enquiry saved in this demo. It is not emailed to a real owner.');
  };
  const askVisit = () => {
    if (!A.user) {
      A.toast('Log in to request a site visit', 'info');
      return go('/login?next=' + next);
    }
    setVisit(true);
  };

  const spec = (icon, label, value) => (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted">
        <Icon n={icon} size={15} />
        {label}
      </div>
      <div className="text-[15px] font-extrabold leading-tight">{value}</div>
    </div>
  );

  return (
    <div className="wrap pb-28 pt-6 lg:pb-16">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-muted"
      >
        <Link to="/" className="hover:text-ink">
          Home
        </Link>
        <Icon n="right" size={14} />
        <Link to="/properties" className="hover:text-ink">
          Explore Properties
        </Link>
        <Icon n="right" size={14} />
        <span className="line-clamp-1 font-semibold text-ink">{p.title}</span>
      </nav>
      {p.status !== 'Active' && (
        <div className="mb-4">
          <Disclaimer>
            This listing is currently <b>{p.status}</b> and is hidden from the public marketplace.
          </Disclaimer>
        </div>
      )}

      <Gallery p={p} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className={'badge ' + (p.purpose === 'Rent' ? 'badge-rent' : 'badge-sale')}>
              {p.purpose === 'Rent' ? 'For Rent' : 'For Sale'}
            </span>
            <span className="badge">
              <Icon n={TYPE_ICON[p.type]} size={13} />
              {p.type}
            </span>
            <span className={'badge ' + (p.status === 'Active' ? 'badge-soft' : 'badge-warn')}>
              {p.status === 'Active' ? 'Available' : p.status}
            </span>
            {p.sample && <span className="badge">Sample listing, not verified</span>}
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl">{p.title}</h1>
          <p className="mt-2 flex items-center gap-2 text-muted">
            <Icon n="pin" size={17} />
            {p.locality}, {p.town}, {p.district}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {spec('ruler', 'Area', fmtArea(p.area, p.unit))}
            {spec(
              'wallet',
              p.purpose === 'Rent' ? 'Rent per sq ft' : 'Price per sq ft',
              '₹' + fmtNum(perSqft),
            )}
            {spec('building', 'Category', p.type)}
            {spec('calendar', 'Available from', p.availableFrom)}
          </div>

          <section className="mt-10">
            <h2 className="mb-3 text-xl">About this property</h2>
            <p className="leading-relaxed text-muted">{p.desc}</p>
          </section>

          <section className="mt-10">
            <h2 className="mb-4 text-xl">Specifications and features</h2>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {[
                ['Type', p.type],
                ['Listing', p.purpose],
                ['Area', fmtArea(p.area, p.unit)],
                ['Area in sq ft', fmtNum(Math.round(toSqft(p.area, p.unit)))],
                ['Permitted / intended uses', p.uses.join(', ')],
                ...(p.features || []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-line py-3 text-sm">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            {p.amenities && p.amenities.length > 0 && (
              <>
                <h3 className="mb-3 mt-7 text-base">Amenities</h3>
                <ul className="flex flex-wrap gap-2">
                  {p.amenities.map((a) => (
                    <li
                      key={a}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-[13px] font-semibold text-brand-text"
                    >
                      <Icon n="check" size={14} />
                      {a}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="mt-10">
            <h2 className="mb-4 text-xl">Location and nearby amenities</h2>
            <PropertyMap
              height={340}
              showLocalities={false}
              markers={[{ id: p.id, lat: p.lat, lng: p.lng, label: p.title }]}
              activeId={p.id}
            />
            <p className="mt-2 text-xs text-muted">
              Coordinates {p.lat}, {p.lng}. Map data © OpenStreetMap contributors.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {['school', 'hospital', 'bus', 'market', 'rail'].map((t) => {
                const items = fac.filter((f) => f.type === t);
                const nearest = Math.min(...items.map((x) => x.km));
                const label = {
                  school: 'Schools',
                  hospital: 'Hospitals & clinics',
                  bus: 'Bus stops',
                  market: 'Markets',
                  rail: 'Railway',
                }[t];
                return (
                  <div
                    key={t}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3.5 text-sm"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-text">
                      <Icon n={t} size={17} />
                    </span>
                    <div>
                      <b className="block">{label}</b>
                      <span className="text-xs text-muted">Nearest ~{nearest} km (sample)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start" id="enquiry">
          <div className="card card-pad">
            <Price p={p} size="xl" />
            <p className="mb-5 mt-1 text-[13px] text-muted">
              {p.purpose === 'Rent'
                ? 'Monthly rent. Deposit terms are set by the owner.'
                : 'Asking price set by the owner.'}
            </p>
            <div className="flex gap-2">
              <button className="btn btn-primary btn-lg flex-1" onClick={askVisit}>
                <Icon n="calendar" size={17} />
                Request a site visit
              </button>
              <button
                className={
                  'icon-btn h-12 w-12 ' + (A.isFav(p.id) ? 'border-rose-200 bg-rose-50 text-rose-600' : '')
                }
                onClick={() => A.toggleFav(p.id)}
                aria-pressed={A.isFav(p.id)}
                aria-label="Save to favourites"
              >
                <Icon n="heart" size={19} style={{ fill: A.isFav(p.id) ? 'currentColor' : 'none' }} />
              </button>
            </div>
          </div>
          <div className="card card-pad">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-lime font-extrabold text-deep-800">
                {initials(p.ownerName)}
              </span>
              <div>
                <b className="block">{p.ownerName}</b>
                <span className="text-xs text-muted">
                  {p.sample ? 'Sample owner profile' : 'ONREAL member'}
                </span>
              </div>
            </div>
            <p className="mb-4 text-xs text-muted">
              Contact preference:{' '}
              {p.privacy === 'public'
                ? 'details shown publicly'
                : p.privacy === 'members'
                  ? 'shown to logged-in users'
                  : 'via ONREAL enquiry only'}
            </p>
            {showContact && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-bg px-3 py-2.5 text-sm font-semibold">
                <Icon n="mail" size={15} className="text-muted" />
                {p.contact}
              </div>
            )}
            {mine ? (
              <Disclaimer tone="info">
                This is your listing.{' '}
                <Link to={'/sell?edit=' + p.id} className="font-bold underline">
                  Edit it
                </Link>
                .
              </Disclaimer>
            ) : A.user ? (
              <form onSubmit={send} noValidate className="space-y-4">
                <Field label="Send an enquiry" id="e-m" error={err.message}>
                  <textarea
                    className="input"
                    placeholder="Hello, I'm interested in this property..."
                    value={enq.message}
                    onChange={(e) => setEnq((x) => ({ ...x, message: e.target.value }))}
                  />
                </Field>
                <Field label="Your phone (optional)" id="e-p" error={err.phone}>
                  <input
                    className="input"
                    inputMode="tel"
                    value={enq.phone}
                    onChange={(e) => setEnq((x) => ({ ...x, phone: e.target.value }))}
                  />
                </Field>
                <button className="btn btn-outline w-full" type="submit">
                  Send enquiry
                </button>
                <p className="field-hint !mt-0">
                  Saved in this browser only in the prototype. No email is sent.
                </p>
              </form>
            ) : (
              <Disclaimer tone="info">
                <Icon n="lock" size={14} className="mr-1 inline" />
                Log in to enquire or book a visit.{' '}
                <Link to={'/login?next=' + next} className="font-bold underline">
                  Log in
                </Link>{' '}
                ·{' '}
                <Link to="/register" className="font-bold underline">
                  Create account
                </Link>
              </Disclaimer>
            )}
          </div>
        </aside>
      </div>

      <section className="mt-14">
        <div className="eyebrow mb-2">
          <Icon n="sparkle" size={14} />
          ONREAL Location Insights
        </div>
        <h2 className="mb-6 text-2xl sm:text-3xl">What could this location become?</h2>
        <SuitabilityReport loc={loc} use={useKey} price={p.purpose === 'Sale' ? p.price : null} />
      </section>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl sm:text-3xl">Similar properties</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s, i) => (
              <PropertyCard key={s.id} p={s} i={i} />
            ))}
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <div>
          <div className="text-lg font-extrabold leading-none">
            {p.purpose === 'Rent' ? '₹' + fmtNum(Math.round(p.price)) : fmtINR(p.price)}
          </div>
          <div className="text-[11px] text-muted">{p.purpose === 'Rent' ? 'per month' : 'asking price'}</div>
        </div>
        <button className="btn btn-primary" onClick={askVisit}>
          Request a visit
        </button>
      </div>
      <AnimatePresence>{visit && <VisitModal p={p} onClose={() => setVisit(false)} />}</AnimatePresence>
    </div>
  );
}
