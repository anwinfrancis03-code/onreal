import { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { LOCALITIES } from '../data/localities';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { Modal } from './ui';
import { Link, go, qs } from '../utils/router';
import { initials } from '../utils/format';

export const NAV = [
  ['/', 'Home'],
  ['/properties', 'Explore Properties'],
  ['/market-insights', 'Market Insights'],
  ['/location-intelligence', 'Location Intelligence'],
  ['/about', 'About'],
];

export const isActive = (path, to) => (to === '/' ? path === '/' : path === to || path.startsWith(to + '/'));

function SearchDialog({ onClose }) {
  const [loc, setLoc] = useState('');
  const submit = (e) => {
    e.preventDefault();
    onClose();
    go('/properties' + qs({ loc: loc.trim() }));
  };
  const quick = (name) => {
    onClose();
    go('/properties' + qs({ loc: name }));
  };
  return (
    <Modal title="Search properties" onClose={onClose}>
      <form onSubmit={submit} role="search">
        <label htmlFor="nav-search" className="label">
          Location, town or locality
        </label>
        <div className="flex gap-2">
          <input
            id="nav-search"
            autoFocus
            className="input"
            placeholder="e.g. Thrissur, Kakkanad"
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            <Icon n="search" size={17} />
            Search
          </button>
        </div>
      </form>
      <p className="label mt-5">Popular areas</p>
      <div className="flex flex-wrap gap-2">
        {LOCALITIES.map((l) => (
          <button key={l.id} className="chip" onClick={() => quick(l.name.split(' ')[0])}>
            <Icon n="pin" size={14} className="mr-1.5 text-brand-text" />
            {l.name.split(' ')[0]}
          </button>
        ))}
      </div>
    </Modal>
  );
}

export function Nav({ route }) {
  const A = useApp();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mref = useRef(null);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f();
    window.addEventListener('scroll', f, { passive: true });
    return () => window.removeEventListener('scroll', f);
  }, []);
  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [route.raw]);
  useEffect(() => {
    const f = (e) => mref.current && !mref.current.contains(e.target) && setMenu(false);
    const k = (e) => e.key === 'Escape' && (setMenu(false), setOpen(false));
    document.addEventListener('mousedown', f);
    document.addEventListener('keydown', k);
    return () => {
      document.removeEventListener('mousedown', f);
      document.removeEventListener('keydown', k);
    };
  }, []);

  const items = [
    ['dash', 'Dashboard', '/dashboard'],
    ['building', 'My Listings', '/dashboard?tab=listings'],
    ['heart', 'Saved Properties', '/dashboard?tab=saved'],
    ['mail', 'My Enquiries', '/dashboard?tab=enquiries'],
    ['calendar', 'Site Visit Requests', '/dashboard?tab=visits'],
    ['settings', 'Account Settings', '/dashboard?tab=settings'],
  ];

  return (
    <header
      className={
        'sticky top-0 z-50 border-b transition ' +
        (scrolled
          ? 'border-line bg-surface/90 shadow-sm backdrop-blur-md'
          : 'border-transparent bg-bg/90 backdrop-blur-md')
      }
    >
      <div className="wrap flex h-16 items-center gap-4 lg:h-[72px]">
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV.map(([to, l]) => (
            <Link
              key={to}
              to={to}
              aria-current={isActive(route.path, to) ? 'page' : undefined}
              className={
                'rounded-lg px-3 py-2 text-sm font-semibold transition ' +
                (isActive(route.path, to)
                  ? 'bg-brand-50 text-brand-text'
                  : 'text-muted hover:bg-ink/5 hover:text-ink')
              }
            >
              {l}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="icon-btn border-transparent bg-transparent hover:bg-ink/5"
            onClick={() => setSearch(true)}
            aria-label="Search properties"
          >
            <Icon n="search" size={19} />
          </button>
          {A.user ? (
            <div className="relative" ref={mref}>
              <button
                onClick={() => setMenu((m) => !m)}
                aria-haspopup="menu"
                aria-expanded={menu}
                aria-label="Open profile menu"
                className="grid h-10 w-10 place-items-center rounded-full bg-lime text-sm font-extrabold text-deep-800 ring-2 ring-surface transition hover:brightness-95"
              >
                {initials(A.user.name)}
              </button>
              {menu && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+10px)] w-64 rounded-2xl border border-line bg-surface p-2 shadow-lift"
                >
                  <div className="mb-1 border-b border-line px-3 pb-3 pt-2">
                    <b className="block text-sm">{A.user.name}</b>
                    <span className="text-xs text-muted">{A.user.email}</span>
                  </div>
                  {items.map(([ic, l, to]) => (
                    <Link
                      key={to}
                      to={to}
                      role="menuitem"
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-bg"
                    >
                      <Icon n={ic} size={17} className="text-muted" />
                      {l}
                    </Link>
                  ))}
                  <button
                    role="menuitem"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold hover:bg-bg"
                    onClick={() => {
                      A.logout();
                      A.toast('You have been logged out', 'info');
                      go('/');
                    }}
                  >
                    <Icon n="logout" size={17} className="text-muted" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-ghost btn-sm hidden sm:inline-flex">
              Sign in
            </Link>
          )}
          <Link to="/sell" className="btn btn-primary btn-sm hidden sm:inline-flex">
            <Icon n="plus" size={16} />
            List Your Property
          </Link>
          <button
            className="icon-btn lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
          >
            <Icon n={open ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
      {open && (
        <div id="mobile-nav" className="border-t border-line bg-surface lg:hidden">
          <div className="wrap py-3">
            {NAV.map(([to, l]) => (
              <Link
                key={to}
                to={to}
                className={
                  'block rounded-lg px-3 py-3 text-[15px] font-semibold ' +
                  (isActive(route.path, to) ? 'bg-brand-50 text-brand-text' : 'hover:bg-bg')
                }
              >
                {l}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 pb-2">
              <Link to="/sell" className="btn btn-primary">
                <Icon n="plus" size={16} />
                List Your Property
              </Link>
              {A.user ? (
                <Link to="/dashboard" className="btn btn-outline">
                  Dashboard
                </Link>
              ) : (
                <Link to="/login" className="btn btn-outline">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      <AnimatePresence>{search && <SearchDialog onClose={() => setSearch(false)} />}</AnimatePresence>
    </header>
  );
}
