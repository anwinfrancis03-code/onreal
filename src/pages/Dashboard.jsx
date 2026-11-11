import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Empty, Field, Modal, PageHead, StatCard } from '../components/ui';
import { Icon } from '../components/Icon';
import { PropertyCard } from '../components/PropertyCard';
import { Link, go } from '../utils/router';
import { initials } from '../utils/format';
import { priceLabel } from '../utils/format';

const TABS = [
  ['overview', 'dash', 'Overview'],
  ['listings', 'building', 'My Listings'],
  ['saved', 'heart', 'Saved Properties'],
  ['enquiries', 'mail', 'My Enquiries'],
  ['visits', 'calendar', 'Site Visits'],
  ['settings', 'settings', 'Account Settings'],
];
const date = (s) =>
  new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const statusBadge = (s) =>
  s === 'Active' || s === 'Accepted'
    ? 'badge-soft'
    : s === 'Declined'
      ? 'badge-warn'
      : s === 'Paused' || s === 'Requested'
        ? 'badge-warn'
        : '';

export function Dashboard({ route }) {
  const A = useApp();
  const tab = route.query.tab || 'overview';
  const [confirm, setConfirm] = useState(null);
  const [recvMode, setRecv] = useState(false);
  const mine = A.db.listings.filter((l) => l.ownerId === A.user.id);
  const favIds = A.db.favs[A.user.id] || [];
  const saved = favIds.map((id) => A.getListing(id)).filter(Boolean);
  const myIds = mine.map((l) => l.id);
  const sentEnq = A.db.enquiries.filter((e) => e.userId === A.user.id);
  const recvEnq = A.db.enquiries.filter((e) => myIds.includes(e.listingId));
  const sentVis = A.db.visits.filter((v) => v.userId === A.user.id);
  const recvVis = A.db.visits.filter((v) => myIds.includes(v.listingId));
  const [prof, setProf] = useState({
    name: A.user.name,
    phone: A.user.phone || '',
    bio: A.user.bio || '',
    notify: A.user.notify !== false,
  });
  const closeLabel = (l) => (l.purpose === 'Rent' ? 'Rented' : 'Sold');

  const activity = [
    ...mine.map((l) => ({
      at: l.createdAt,
      icon: 'building',
      text: `You listed "${l.title}"`,
      to: '/properties/' + l.id,
    })),
    ...sentEnq.map((e) => ({
      at: e.createdAt,
      icon: 'mail',
      text: `You enquired about "${e.listingTitle}"`,
      to: '/properties/' + e.listingId,
    })),
    ...recvEnq.map((e) => ({
      at: e.createdAt,
      icon: 'inbox',
      text: `${e.name} enquired about "${e.listingTitle}"`,
      to: '/dashboard?tab=enquiries',
    })),
    ...sentVis.map((v) => ({
      at: v.createdAt,
      icon: 'calendar',
      text: `You requested a visit to "${v.listingTitle}"`,
      to: '/dashboard?tab=visits',
    })),
    ...recvVis.map((v) => ({
      at: v.createdAt,
      icon: 'calendar',
      text: `${v.name} requested a visit to "${v.listingTitle}"`,
      to: '/dashboard?tab=visits',
    })),
  ]
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
    .slice(0, 6);

  const nav = (
    <nav aria-label="Dashboard" className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      {TABS.map(([k, ic, l]) => (
        <button
          key={k}
          onClick={() => go('/dashboard?tab=' + k)}
          aria-current={tab === k ? 'page' : undefined}
          className={
            'flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ' +
            (tab === k ? 'bg-brand text-white' : 'text-muted hover:bg-bg hover:text-ink')
          }
        >
          <Icon n={ic} size={17} />
          {l}
        </button>
      ))}
      <button
        onClick={() => {
          A.logout();
          A.toast('You have been logged out', 'info');
          go('/');
        }}
        className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold text-muted transition hover:bg-bg hover:text-ink lg:mt-3 lg:border-t lg:border-line lg:pt-4"
      >
        <Icon n="logout" size={17} />
        Logout
      </button>
    </nav>
  );

  const visitTable = (rows, owner) => (
    <div className="overflow-x-auto">
      <table className="table min-w-[520px]">
        <thead>
          <tr>
            <th>Property</th>
            {owner && <th>Requester</th>}
            <th>When</th>
            <th>Status</th>
            {owner && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((v) => (
            <tr key={v.id}>
              <td className="font-semibold">
                <Link to={'/properties/' + v.listingId} className="hover:underline">
                  {v.listingTitle}
                </Link>
              </td>
              {owner && <td>{v.name}</td>}
              <td>
                {v.date}, {v.time}
              </td>
              <td>
                <span className={'badge ' + statusBadge(v.status)}>{v.status}</span>
              </td>
              {owner && (
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        A.setVisitStatus(v.id, 'Accepted');
                        A.toast('Visit accepted');
                      }}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        A.setVisitStatus(v.id, 'Declined');
                        A.toast('Visit declined', 'info');
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="wrap pb-16 pt-8 sm:pt-10">
      <PageHead
        crumbs={[['Home', '/'], ['Dashboard']]}
        title={'Welcome back, ' + A.user.name.split(' ')[0]}
        sub="Manage your listings, saved properties and conversations."
        actions={
          <Link to="/sell" className="btn btn-primary">
            <Icon n="plus" size={17} />
            New listing
          </Link>
        }
      />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="card h-fit min-w-0 p-2.5 lg:sticky lg:top-24">{nav}</aside>
        <div className="min-w-0">
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon="building"
                  label="Listed properties"
                  value={mine.length}
                  hint={mine.filter((l) => l.status === 'Active').length + ' active'}
                  onClick={() => go('/dashboard?tab=listings')}
                />
                <StatCard
                  icon="inbox"
                  label="Enquiries received"
                  value={recvEnq.length}
                  hint={sentEnq.length + ' sent by you'}
                  onClick={() => go('/dashboard?tab=enquiries')}
                />
                <StatCard
                  icon="heart"
                  label="Saved properties"
                  value={saved.length}
                  onClick={() => go('/dashboard?tab=saved')}
                />
                <StatCard
                  icon="calendar"
                  label="Site visit requests"
                  value={sentVis.length + recvVis.length}
                  onClick={() => go('/dashboard?tab=visits')}
                />
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
                <div className="card card-pad">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-base">Recent listings</h2>
                    <Link
                      to="/dashboard?tab=listings"
                      className="text-[13px] font-bold text-brand-text hover:underline"
                    >
                      View all
                    </Link>
                  </div>
                  {mine.length === 0 ? (
                    <Empty
                      icon="building"
                      title="No listings yet"
                      text="Create your first listing to appear in the marketplace."
                      action={
                        <Link to="/sell" className="btn btn-primary btn-sm">
                          List a property
                        </Link>
                      }
                    />
                  ) : (
                    <ul className="divide-y divide-line">
                      {mine.slice(0, 4).map((l) => (
                        <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                          <div className="min-w-0">
                            <Link
                              to={'/properties/' + l.id}
                              className="line-clamp-1 text-sm font-bold hover:underline"
                            >
                              {l.title}
                            </Link>
                            <div className="text-xs text-muted">
                              {l.locality}, {l.town} · {priceLabel(l)}
                            </div>
                          </div>
                          <span className={'badge ' + statusBadge(l.status)}>{l.status}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="card card-pad">
                  <h2 className="mb-4 text-base">Recent activity</h2>
                  {activity.length === 0 ? (
                    <p className="text-sm text-muted">
                      Nothing yet. Your listings, enquiries and visit requests will show up here.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {activity.map((a, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-text">
                            <Icon n={a.icon} size={15} />
                          </span>
                          <div className="min-w-0 text-sm">
                            <Link to={a.to} className="line-clamp-2 font-semibold hover:underline">
                              {a.text}
                            </Link>
                            <div className="text-xs text-muted">{date(a.at)}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="card card-pad">
                <h2 className="mb-4 text-base">Quick actions</h2>
                <div className="flex flex-wrap gap-3">
                  <Link to="/sell" className="btn btn-primary">
                    <Icon n="plus" size={17} />
                    New listing
                  </Link>
                  <Link to="/properties" className="btn btn-outline">
                    Browse properties
                  </Link>
                  <Link to="/location-intelligence" className="btn btn-outline">
                    Location intelligence
                  </Link>
                  <Link to="/market-insights" className="btn btn-outline">
                    Market insights
                  </Link>
                </div>
              </div>
            </div>
          )}

          {tab === 'listings' && (
            <div className="card card-pad">
              <div className="mb-1 flex items-center justify-between gap-3">
                <h2 className="text-lg">My listings</h2>
                <Link to="/sell" className="btn btn-primary btn-sm">
                  <Icon n="plus" size={15} />
                  New listing
                </Link>
              </div>
              <p className="mb-5 text-sm text-muted">
                Only listings you created in this browser appear here. Only you can edit or delete them.
              </p>
              {mine.length === 0 ? (
                <Empty
                  icon="building"
                  title="No listings yet"
                  text="Create your first listing to appear in the marketplace."
                  action={
                    <Link to="/sell" className="btn btn-primary">
                      List a property
                    </Link>
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="table min-w-[640px]">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Price</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mine.map((l) => (
                        <tr key={l.id}>
                          <td>
                            <Link to={'/properties/' + l.id} className="font-bold hover:underline">
                              {l.title}
                            </Link>
                            <div className="text-xs text-muted">
                              {l.locality}, {l.town}
                            </div>
                          </td>
                          <td className="whitespace-nowrap">{priceLabel(l)}</td>
                          <td>
                            <span className={'badge ' + statusBadge(l.status)}>{l.status}</span>
                          </td>
                          <td>
                            <div className="flex flex-wrap gap-1.5">
                              <Link to={'/sell?edit=' + l.id} className="btn btn-outline btn-sm">
                                <Icon n="edit" size={14} />
                                Edit
                              </Link>
                              {l.status === 'Active' && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => {
                                    A.updateListing(l.id, { status: 'Paused' });
                                    A.toast('Listing paused', 'info');
                                  }}
                                >
                                  <Icon n="pause" size={14} />
                                  Pause
                                </button>
                              )}
                              {l.status !== 'Active' && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => {
                                    A.updateListing(l.id, { status: 'Active' });
                                    A.toast('Listing is active again');
                                  }}
                                >
                                  <Icon n="play" size={14} />
                                  Reactivate
                                </button>
                              )}
                              {(l.status === 'Active' || l.status === 'Paused') && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() => {
                                    A.updateListing(l.id, { status: closeLabel(l) });
                                    A.toast('Marked as ' + closeLabel(l).toLowerCase());
                                  }}
                                >
                                  <Icon n="check" size={14} />
                                  Mark {closeLabel(l).toLowerCase()}
                                </button>
                              )}
                              <button className="btn btn-danger btn-sm" onClick={() => setConfirm(l)}>
                                <Icon n="trash" size={14} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'saved' && (
            <div>
              <h2 className="mb-5 text-lg">Saved properties</h2>
              {saved.length === 0 ? (
                <Empty
                  icon="heart"
                  title="Nothing saved yet"
                  text="Tap the heart on any property to save it here."
                  action={
                    <Link to="/properties" className="btn btn-primary">
                      Browse properties
                    </Link>
                  }
                />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {saved.map((p, i) => (
                    <PropertyCard key={p.id} p={p} i={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'enquiries' && (
            <div className="card card-pad">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg">My enquiries</h2>
                <div className="inline-flex rounded-xl bg-bg p-1 ring-1 ring-line">
                  {[
                    [false, `Sent (${sentEnq.length})`],
                    [true, `Received (${recvEnq.length})`],
                  ].map(([v, l]) => (
                    <button
                      key={l}
                      onClick={() => setRecv(v)}
                      className={
                        'rounded-lg px-3.5 py-1.5 text-[13px] font-bold ' +
                        (recvMode === v ? 'bg-surface text-ink shadow-sm' : 'text-muted')
                      }
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mb-5 text-sm text-muted">
                Enquiries are stored in this browser only. Nothing is emailed in the prototype.
              </p>
              {(recvMode ? recvEnq : sentEnq).length === 0 ? (
                <Empty
                  icon="mail"
                  title={recvMode ? 'No enquiries received' : 'No enquiries sent'}
                  text={
                    recvMode
                      ? 'Enquiries on your own listings will appear here.'
                      : 'Open a property and send an enquiry to the owner.'
                  }
                />
              ) : (
                <ul className="space-y-3">
                  {(recvMode ? recvEnq : sentEnq).map((e) => (
                    <li key={e.id} className="rounded-xl border border-line p-4">
                      <div className="flex flex-wrap justify-between gap-2">
                        <Link to={'/properties/' + e.listingId} className="font-bold hover:underline">
                          {e.listingTitle}
                        </Link>
                        <span className="text-xs text-muted">{date(e.createdAt)}</span>
                      </div>
                      {recvMode && (
                        <div className="text-xs text-muted">
                          From {e.name} ({e.email}
                          {e.phone ? ', ' + e.phone : ''})
                        </div>
                      )}
                      <p className="mt-2 text-sm">{e.message}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'visits' && (
            <div className="space-y-6">
              <div className="card card-pad">
                <h2 className="mb-4 text-lg">Visits I requested</h2>
                {sentVis.length === 0 ? (
                  <Empty
                    icon="calendar"
                    title="No visit requests"
                    text="Request a site visit from any property page."
                  />
                ) : (
                  visitTable(sentVis, false)
                )}
              </div>
              <div className="card card-pad">
                <h2 className="mb-4 text-lg">Visits on my listings</h2>
                {recvVis.length === 0 ? (
                  <p className="text-sm text-muted">
                    None yet. Requests for your own listings appear here and you can accept or decline them.
                  </p>
                ) : (
                  visitTable(recvVis, true)
                )}
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="space-y-6">
              <form
                className="card card-pad space-y-5"
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!prof.name.trim()) return A.toast('Name cannot be empty', 'error');
                  A.updateUser({
                    name: prof.name.trim(),
                    phone: prof.phone,
                    bio: prof.bio,
                    notify: prof.notify,
                  });
                  A.toast('Profile saved');
                }}
              >
                <div className="flex items-center gap-4">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-lime text-lg font-extrabold text-deep-800">
                    {initials(A.user.name)}
                  </span>
                  <div>
                    <h2 className="text-lg">Account settings</h2>
                    <p className="text-sm text-muted">Member since {date(A.user.created)}</p>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Full name" id="st-n">
                    <input
                      className="input"
                      value={prof.name}
                      onChange={(e) => setProf((p) => ({ ...p, name: e.target.value }))}
                    />
                  </Field>
                  <Field label="Phone (optional)" id="st-p">
                    <input
                      className="input"
                      value={prof.phone}
                      onChange={(e) => setProf((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </Field>
                </div>
                <Field label="Email" id="st-e" hint="Email cannot be changed in the prototype.">
                  <input className="input" value={A.user.email} disabled />
                </Field>
                <Field label="About you" id="st-b">
                  <textarea
                    className="input"
                    value={prof.bio}
                    onChange={(e) => setProf((p) => ({ ...p, bio: e.target.value }))}
                  />
                </Field>
                <label className="flex cursor-pointer items-center gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={prof.notify}
                    onChange={(e) => setProf((p) => ({ ...p, notify: e.target.checked }))}
                  />
                  Show in-app notifications for enquiries and visits
                </label>
                <Field label="Appearance" id="st-th">
                  <select
                    className="input sm:max-w-xs"
                    value={A.theme}
                    onChange={(e) => A.setTheme(e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Match my device</option>
                  </select>
                </Field>
                <button className="btn btn-primary" type="submit">
                  Save changes
                </button>
              </form>
              <div className="card card-pad">
                <h2 className="text-lg">Demo data</h2>
                <p className="mb-4 mt-1 text-sm text-muted">
                  Accounts, listings and favourites live in this browser's localStorage. This is a prototype:
                  production needs a secure backend, server-side password hashing and proper session
                  management.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="btn btn-danger" onClick={() => setConfirm('reset')}>
                    Reset all demo data
                  </button>
                  <button className="btn btn-danger" onClick={() => setConfirm('account')}>
                    Delete my demo account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {confirm && (
          <Modal title="Please confirm" onClose={() => setConfirm(null)}>
            <p className="text-sm text-muted">
              {confirm === 'reset'
                ? 'This clears every demo account, listing, favourite and message in this browser.'
                : confirm === 'account'
                  ? 'This deletes your demo account and your listings from this browser.'
                  : 'Delete "' + confirm.title + '"? This cannot be undone.'}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button className="btn btn-outline" onClick={() => setConfirm(null)}>
                Cancel
              </button>
              <button
                className="btn bg-danger text-white hover:brightness-95"
                onClick={() => {
                  if (confirm === 'reset') return A.resetAll();
                  if (confirm === 'account') {
                    A.deleteAccount();
                    return go('/');
                  }
                  A.deleteListing(confirm.id);
                  A.toast('Listing deleted', 'info');
                  setConfirm(null);
                }}
              >
                Delete
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
