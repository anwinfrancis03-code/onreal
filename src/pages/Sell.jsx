import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Disclaimer, Field, PageHead, Spinner } from '../components/ui';
import { Icon } from '../components/Icon';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyMap } from '../components/PropertyMap';
import { AMENITIES, PROP_TYPES, PROP_USES } from '../data/constants';
import { Link } from '../utils/router';
import { compressImage } from '../utils/images';
import { fmtArea } from '../utils/format';
import { validEmail } from '../utils/validation';

export const blank = {
  title: '',
  ownerName: '',
  contact: '',
  privacy: 'enquiry',
  type: 'Land',
  purpose: 'Sale',
  price: '',
  area: '',
  unit: 'cents',
  district: '',
  town: '',
  locality: '',
  lat: '',
  lng: '',
  desc: '',
  availableFrom: '',
  uses: [],
  amenities: [],
  images: [],
};

const STEPS = [
  { key: 'basics', label: 'Basics', icon: 'tag', fields: ['title', 'price', 'area', 'desc'] },
  { key: 'location', label: 'Location', icon: 'pin', fields: ['district', 'town', 'locality', 'lat'] },
  { key: 'details', label: 'Details', icon: 'list', fields: ['availableFrom', 'uses'] },
  { key: 'photos', label: 'Photos and contact', icon: 'camera', fields: ['ownerName', 'contact'] },
  { key: 'review', label: 'Review', icon: 'done', fields: [] },
];

function validate(f) {
  const er = {};
  if (f.title.trim().length < 5) er.title = 'Enter a title of at least 5 characters.';
  if (!(+f.price > 0)) er.price = 'Enter a price greater than 0.';
  if (!(+f.area > 0)) er.area = 'Enter an area greater than 0.';
  if (f.desc.trim().length < 20) er.desc = 'Describe the property in at least 20 characters.';
  if (!f.district.trim()) er.district = 'District is required.';
  if (!f.town.trim()) er.town = 'Town is required.';
  if (!f.locality.trim()) er.locality = 'Locality is required.';
  if (f.lat === '' || f.lng === '' || isNaN(+f.lat) || isNaN(+f.lng))
    er.lat = 'Click the map or enter coordinates.';
  else if (+f.lat < -90 || +f.lat > 90 || +f.lng < -180 || +f.lng > 180)
    er.lat = 'Coordinates are out of range.';
  if (!f.availableFrom) er.availableFrom = 'Choose a date.';
  if (!f.uses.length) er.uses = 'Select at least one intended use.';
  if (!f.ownerName.trim()) er.ownerName = 'Owner name is required.';
  if (!f.contact.trim()) er.contact = 'Add an email or phone number.';
  else if (!validEmail(f.contact.trim()) && !/^[+\d][\d\s-]{7,}$/.test(f.contact.trim()))
    er.contact = 'Enter a valid email or phone number.';
  return er;
}

function Stepper({ step, maxStep, onGo }) {
  return (
    <ol className="mb-8 grid grid-cols-5 gap-2" aria-label="Progress">
      {STEPS.map((s, i) => {
        const done = i < step,
          cur = i === step,
          ok = i <= maxStep;
        return (
          <li key={s.key} className="min-w-0">
            <button
              type="button"
              disabled={!ok}
              onClick={() => onGo(i)}
              aria-current={cur ? 'step' : undefined}
              className="group block w-full text-left disabled:cursor-not-allowed"
            >
              <div
                className={'mb-2.5 h-1.5 rounded-full transition ' + (done || cur ? 'bg-brand' : 'bg-line')}
              />
              <div className="flex items-center gap-2">
                <span
                  className={
                    'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ' +
                    (done ? 'bg-brand text-white' : cur ? 'bg-lime text-deep-800' : 'bg-line text-muted')
                  }
                >
                  {done ? <Icon n="check" size={13} /> : i + 1}
                </span>
                <span
                  className={
                    'hidden truncate text-[13px] font-bold sm:block ' + (cur ? 'text-ink' : 'text-muted')
                  }
                >
                  {s.label}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function Sell({ route }) {
  const A = useApp();
  const editId = route.query.edit;
  const existing = editId ? A.db.listings.find((l) => l.id === editId && l.ownerId === A.user.id) : null;
  const [f, setF] = useState(() =>
    existing
      ? { amenities: [], ...existing }
      : { ...blank, ownerName: A.user ? A.user.name : '', contact: A.user ? A.user.email : '' },
  );
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(existing ? 4 : 0);
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const toggle = (k, v) =>
    setF((x) => ({ ...x, [k]: x[k].includes(v) ? x[k].filter((y) => y !== v) : [...x[k], v] }));
  const pick = (lat, lng) => setF((x) => ({ ...x, lat, lng }));

  const onFiles = async (e) => {
    const files = [...e.target.files].slice(0, 5 - f.images.length);
    const out = [];
    for (const fl of files) {
      if (!fl.type.startsWith('image/')) {
        A.toast('Only image files are allowed.', 'error');
        continue;
      }
      try {
        out.push(await compressImage(fl));
      } catch (x) {
        A.toast('Could not read ' + fl.name, 'error');
      }
    }
    setF((x) => ({ ...x, images: [...x.images, ...out].slice(0, 5) }));
    e.target.value = '';
  };

  const checkStep = (i) => {
    const all = validate(f);
    const er = {};
    STEPS[i].fields.forEach((k) => all[k] && (er[k] = all[k]));
    setErr(er);
    if (Object.keys(er).length) {
      A.toast('Please fix the highlighted fields.', 'error');
      setTimeout(() => document.querySelector('[aria-invalid="true"]')?.focus(), 30);
      return false;
    }
    return true;
  };
  const next = () => {
    if (!checkStep(step)) return;
    setStep(step + 1);
    setMaxStep((m) => Math.max(m, step + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const back = () => {
    setErr({});
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const publish = async () => {
    const er = validate(f);
    if (Object.keys(er).length) {
      const bad = STEPS.findIndex((s) => s.fields.some((k) => er[k]));
      setErr(er);
      setStep(bad);
      A.toast('Some required fields are missing.', 'error');
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    const data = {
      ...f,
      title: f.title.trim(),
      desc: f.desc.trim(),
      price: +f.price,
      area: +f.area,
      lat: +f.lat,
      lng: +f.lng,
      features: f.features || [
        ['Listed by', 'ONREAL member'],
        ['Area', fmtArea(+f.area, f.unit)],
      ],
    };
    if (existing) {
      A.updateListing(existing.id, data);
      setDone(existing);
      A.toast('Listing updated.');
    } else {
      setDone(A.addListing(data));
      A.toast('Listing published in this browser.');
    }
    setBusy(false);
  };

  if (done)
    return (
      <div className="wrap max-w-xl py-16">
        <div className="card card-pad text-center sm:p-10">
          <span className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-brand text-white">
            <Icon n="check" size={32} />
          </span>
          <h1 className="text-2xl">{existing ? 'Listing updated' : 'Your listing is live'}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            "{done.title}" now appears in the marketplace. It is stored only in this browser (localStorage)
            and is not shared with other users until a real backend exists.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to={'/properties/' + done.id} className="btn btn-primary">
              View listing
            </Link>
            <Link to="/dashboard?tab=listings" className="btn btn-outline">
              Manage my listings
            </Link>
          </div>
        </div>
      </div>
    );

  const prev = {
    ...f,
    id: 'preview',
    price: +f.price || 0,
    area: +f.area || 0,
    seed: 7,
    status: 'Active',
    lat: +f.lat || 10.5,
    lng: +f.lng || 76.2,
    title: f.title || 'Your property title',
    town: f.town || 'Town',
    locality: f.locality || 'Locality',
    desc: f.desc || 'Your description appears here.',
    sample: false,
  };
  const E = err;
  const cur = STEPS[step];

  return (
    <div className="wrap pb-16 pt-8 sm:pt-10">
      <PageHead
        crumbs={[['Home', '/'], [existing ? 'Edit listing' : 'List a property']]}
        title={existing ? 'Edit your property' : 'List your property'}
        sub="Connect directly with interested buyers or tenants. No broker needed."
      />
      <Disclaimer tone="info">
        Prototype note: listings are saved in <b>this browser only</b> (localStorage). They are not visible to
        other people or devices.
      </Disclaimer>
      <div className="h-6" />
      <Stepper
        step={step}
        maxStep={maxStep}
        onGo={(i) => {
          setErr({});
          setStep(i);
        }}
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_370px]">
        <form className="card card-pad sm:p-8" onSubmit={(e) => e.preventDefault()} noValidate>
          <div className="mb-6">
            <div className="eyebrow">
              Step {step + 1} of {STEPS.length}
            </div>
            <h2 className="mt-1 text-2xl">{cur.label}</h2>
          </div>

          {cur.key === 'basics' && (
            <div className="space-y-5">
              <Field label="Property title" id="s-t" required error={E.title}>
                <input
                  className="input"
                  value={f.title}
                  onChange={set('title')}
                  placeholder="e.g. 10-cent corner plot near the bypass"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Category" id="s-ty">
                  <select className="input" value={f.type} onChange={set('type')}>
                    {PROP_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Transaction type" id="s-p">
                  <select className="input" value={f.purpose} onChange={set('purpose')}>
                    <option value="Sale">For sale</option>
                    <option value="Rent">For rent</option>
                  </select>
                </Field>
              </div>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field
                  label={f.purpose === 'Rent' ? 'Monthly rent (₹)' : 'Price (₹)'}
                  id="s-pr"
                  required
                  error={E.price}
                >
                  <input className="input" type="number" min="0" value={f.price} onChange={set('price')} />
                </Field>
                <Field label="Area" id="s-a" required error={E.area}>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    step="any"
                    value={f.area}
                    onChange={set('area')}
                  />
                </Field>
                <Field label="Unit" id="s-u">
                  <select className="input" value={f.unit} onChange={set('unit')}>
                    <option value="cents">Cents</option>
                    <option value="sqft">Square feet</option>
                    <option value="acres">Acres</option>
                  </select>
                </Field>
              </div>
              <Field
                label="Description"
                id="s-de"
                required
                error={E.desc}
                hint="Road access, shape, utilities and surroundings help buyers most."
              >
                <textarea className="input" value={f.desc} onChange={set('desc')} />
              </Field>
            </div>
          )}

          {cur.key === 'location' && (
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="District" id="s-d" required error={E.district}>
                  <input className="input" value={f.district} onChange={set('district')} />
                </Field>
                <Field label="Town" id="s-tw" required error={E.town}>
                  <input className="input" value={f.town} onChange={set('town')} />
                </Field>
                <Field label="Locality" id="s-l" required error={E.locality}>
                  <input className="input" value={f.locality} onChange={set('locality')} />
                </Field>
              </div>
              <div>
                <span className="label">
                  Pin the location <span className="text-danger">*</span>
                </span>
                <PropertyMap
                  height={340}
                  onPick={pick}
                  picked={
                    f.lat !== '' && f.lng !== '' && !isNaN(+f.lat) ? { lat: +f.lat, lng: +f.lng } : null
                  }
                />
                <p className="field-hint">
                  Click the map to drop a pin, or enter coordinates below. Map data © OpenStreetMap
                  contributors.
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Latitude" id="s-la" error={E.lat}>
                  <input className="input" type="number" step="any" value={f.lat} onChange={set('lat')} />
                </Field>
                <Field label="Longitude" id="s-lo">
                  <input className="input" type="number" step="any" value={f.lng} onChange={set('lng')} />
                </Field>
              </div>
            </div>
          )}

          {cur.key === 'details' && (
            <div className="space-y-6">
              <Field label="Available from" id="s-av" required error={E.availableFrom}>
                <input
                  className="input sm:max-w-xs"
                  type="date"
                  value={f.availableFrom}
                  onChange={set('availableFrom')}
                />
              </Field>
              <div>
                <span className="label">
                  Intended or permitted uses <span className="text-danger">*</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {PROP_USES.map((u) => (
                    <button
                      type="button"
                      key={u}
                      aria-pressed={f.uses.includes(u)}
                      onClick={() => toggle('uses', u)}
                      className={'chip ' + (f.uses.includes(u) ? 'chip-on' : '')}
                    >
                      {u}
                    </button>
                  ))}
                </div>
                {E.uses && (
                  <p className="field-error" role="alert">
                    {E.uses}
                  </p>
                )}
              </div>
              <div>
                <span className="label">
                  Amenities <span className="font-normal text-muted">(optional)</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES.map((a) => (
                    <button
                      type="button"
                      key={a}
                      aria-pressed={f.amenities.includes(a)}
                      onClick={() => toggle('amenities', a)}
                      className={'chip ' + (f.amenities.includes(a) ? 'chip-on' : '')}
                    >
                      {f.amenities.includes(a) && <Icon n="check" size={13} className="mr-1.5" />}
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {cur.key === 'photos' && (
            <div className="space-y-6">
              <div>
                <span className="label">
                  Photos <span className="font-normal text-muted">(up to 5)</span>
                </span>
                <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line bg-bg/60 px-6 py-8 text-center transition hover:border-brand/50">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-50 text-brand-text">
                    <Icon n="upload" size={20} />
                  </span>
                  <b className="text-sm">Click to add photos</b>
                  <span className="text-xs text-muted">JPG or PNG. Images are resized in your browser.</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={onFiles}
                    className="sr-only"
                    disabled={f.images.length >= 5}
                  />
                </label>
                {f.images.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {f.images.map((s, i) => (
                      <div key={i} className="relative">
                        <img
                          src={s}
                          alt={'Preview ' + (i + 1)}
                          className="h-20 w-28 rounded-xl object-cover"
                        />
                        <button
                          type="button"
                          className="icon-btn absolute -right-2 -top-2 h-7 w-7"
                          aria-label="Remove image"
                          onClick={() => setF((x) => ({ ...x, images: x.images.filter((_, j) => j !== i) }))}
                        >
                          <Icon n="x" size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="field-hint">
                    No photos? Illustrative stock photography is shown, clearly marked as such.
                  </p>
                )}
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Owner name" id="s-o" required error={E.ownerName}>
                  <input className="input" value={f.ownerName} onChange={set('ownerName')} />
                </Field>
                <Field label="Contact (email or phone)" id="s-c" required error={E.contact}>
                  <input className="input" value={f.contact} onChange={set('contact')} />
                </Field>
              </div>
              <Field
                label="Contact privacy"
                id="s-pv"
                hint="Controls who can see your contact details on the listing."
              >
                <select className="input" value={f.privacy} onChange={set('privacy')}>
                  <option value="enquiry">Hidden: contact me through ONREAL enquiries</option>
                  <option value="members">Visible to logged-in users</option>
                  <option value="public">Visible to everyone</option>
                </select>
              </Field>
            </div>
          )}

          {cur.key === 'review' && (
            <div className="space-y-5">
              <p className="text-sm text-muted">
                Check the details below. You can go back to change anything before publishing.
              </p>
              <dl className="divide-y divide-line rounded-xl border border-line text-sm">
                {[
                  ['Title', f.title],
                  ['Category', f.type + ' · ' + (f.purpose === 'Rent' ? 'For rent' : 'For sale')],
                  [
                    f.purpose === 'Rent' ? 'Monthly rent' : 'Price',
                    '₹' + Number(f.price).toLocaleString('en-IN'),
                  ],
                  ['Area', fmtArea(+f.area, f.unit)],
                  ['Location', `${f.locality}, ${f.town}, ${f.district}`],
                  ['Coordinates', `${f.lat}, ${f.lng}`],
                  ['Available from', f.availableFrom],
                  ['Uses', f.uses.join(', ')],
                  ['Amenities', f.amenities.join(', ') || 'None selected'],
                  [
                    'Photos',
                    f.images.length
                      ? f.images.length + ' uploaded'
                      : 'None (stock photography will be shown)',
                  ],
                  ['Owner', f.ownerName],
                  [
                    'Contact',
                    f.contact +
                      ' (' +
                      { enquiry: 'hidden', members: 'logged-in users', public: 'public' }[f.privacy] +
                      ')',
                  ],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[130px_1fr] gap-3 px-4 py-3">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
            <div className="flex gap-2">
              {step > 0 && (
                <button type="button" className="btn btn-outline" onClick={back}>
                  <Icon n="left" size={16} />
                  Back
                </button>
              )}
              <Link to="/dashboard?tab=listings" className="btn btn-ghost">
                Cancel
              </Link>
            </div>
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={next}>
                Continue
                <Icon n="arrow" size={16} />
              </button>
            ) : (
              <button type="button" className="btn btn-primary btn-lg" onClick={publish} disabled={busy}>
                {busy ? (
                  <>
                    <Spinner />
                    Saving...
                  </>
                ) : existing ? (
                  'Save changes'
                ) : (
                  'Publish listing'
                )}
              </button>
            )}
          </div>
        </form>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="eyebrow mb-3">Live preview</div>
          <PropertyCard p={prev} />
          <p className="mt-3 text-xs text-muted">This is how your listing will appear in search results.</p>
        </aside>
      </div>
    </div>
  );
}
