import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { K, readSession, store, writeSession } from '../utils/storage';
import { hashPw } from '../utils/auth';
import { SEED } from '../data/properties';

export const Ctx = createContext(null);

export const useApp = () => useContext(Ctx);

export function AppProvider({ children }) {
  const [db, setDb] = useState(() => ({
    users: store.get(K + 'users', []),
    listings: store.get(K + 'listings', []),
    favs: store.get(K + 'favs', {}),
    enquiries: store.get(K + 'enquiries', []),
    visits: store.get(K + 'visits', []),
    messages: store.get(K + 'messages', []),
    loginEvents: store.get(K + 'loginEvents', []),
    hiddenSeedIds: store.get(K + 'hiddenSeedIds', []),
  }));
  const dbRef = useRef(db);
  dbRef.current = db;
  const put = (key, val) => {
    store.set(K + key, val);
    dbRef.current = { ...dbRef.current, [key]: val };
    setDb(dbRef.current);
  };
  const [sid, setSid] = useState(() => readSession());
  const [toasts, setToasts] = useState([]);
  const [theme, setThemeState] = useState(() => store.get(K + 'theme', 'light'));
  useEffect(() => {
    const r = document.documentElement;
    r.setAttribute('data-theme', theme);
  }, [theme]);
  const setTheme = (t) => {
    store.set(K + 'theme', t);
    setThemeState(t);
  };
  const toast = useCallback((msg, type = 'ok') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const user = db.users.find((u) => u.id === sid) || null;
  const startSession = (id, remember) => {
    writeSession(id, remember);
    setSid(id);
    const account = dbRef.current.users.find((x) => x.id === id);
    if (account) put('loginEvents', [{ id: 'login-' + Date.now(), userId: id, name: account.name, email: account.email, at: new Date().toISOString() }, ...dbRef.current.loginEvents].slice(0, 100));
  };
  const A = {
    db,
    user,
    toast,
    theme,
    setTheme,
    toasts,
    async register({ name, email, password }) {
      const em = email.trim().toLowerCase();
      if (dbRef.current.users.some((u) => u.email === em))
        return {
          error: 'An account with this email already exists. Try logging in instead.',
        };
      const salt = Math.random().toString(36).slice(2);
      const hash = await hashPw(password, salt);
      const u = {
        id: 'u' + Date.now().toString(36),
        name: name.trim(),
        email: em,
        salt,
        hash,
        phone: '',
        bio: '',
        notify: true,
        created: new Date().toISOString(),
      };
      put('users', [...dbRef.current.users, u]);
      startSession(u.id, true);
      return { ok: true };
    },
    async login({ email, password, remember }) {
      const em = email.trim().toLowerCase();
      const u = dbRef.current.users.find((x) => x.email === em);
      if (!u) return { error: 'Incorrect email or password.' };
      const h = await hashPw(password, u.salt);
      if (h !== u.hash) return { error: 'Incorrect email or password.' };
      startSession(u.id, remember);
      return { ok: true };
    },
    async demoLogin() {
      const em = 'demo@onreal.example';
      let u = dbRef.current.users.find((x) => x.email === em);
      if (!u) {
        const salt = Math.random().toString(36).slice(2);
        u = {
          id: 'udemo',
          name: 'Demo Visitor',
          email: em,
          salt,
          hash: await hashPw(Math.random().toString(36), salt),
          phone: '',
          bio: 'Exploring ONREAL with the sample account.',
          notify: true,
          created: new Date().toISOString(),
        };
        put('users', [...dbRef.current.users, u]);
      }
      startSession(u.id, true);
    },
    async resetPassword(email, pw) {
      const em = email.trim().toLowerCase();
      const u = dbRef.current.users.find((x) => x.email === em);
      if (!u)
        return {
          error: 'No demo account with this email exists in this browser.',
        };
      const salt = Math.random().toString(36).slice(2);
      const hash = await hashPw(pw, salt);
      put(
        'users',
        dbRef.current.users.map((x) => (x.id === u.id ? { ...x, salt, hash } : x)),
      );
      return { ok: true };
    },
    logout() {
      writeSession(null);
      setSid(null);
    },
    updateUser(patch) {
      put(
        'users',
        dbRef.current.users.map((u) => (u.id === sid ? { ...u, ...patch } : u)),
      );
    },
    deleteAccount() {
      put(
        'listings',
        dbRef.current.listings.filter((l) => l.ownerId !== sid),
      );
      put(
        'users',
        dbRef.current.users.filter((u) => u.id !== sid),
      );
      writeSession(null);
      setSid(null);
    },
    addListing(l) {
      const item = {
        ...l,
        id: 'u' + Date.now().toString(36),
        ownerId: sid,
        createdAt: new Date().toISOString(),
        status: 'Active',
        sample: false,
        seed: Math.floor(Math.random() * 900) + 1,
      };
      put('listings', [item, ...dbRef.current.listings]);
      return item;
    },
    updateListing(id, patch) {
      const l = dbRef.current.listings.find((x) => x.id === id);
      if (!l || l.ownerId !== sid) return false;
      put(
        'listings',
        dbRef.current.listings.map((x) => (x.id === id ? { ...x, ...patch } : x)),
      );
      return true;
    },
    deleteListing(id) {
      const l = dbRef.current.listings.find((x) => x.id === id);
      if (!l || l.ownerId !== sid) return false;
      put('listings', dbRef.current.listings.filter((x) => x.id !== id));
      return true;
    },
    adminUpdateListing(id, patch) {
      const found = dbRef.current.listings.find((x) => x.id === id);
      if (found) put('listings', dbRef.current.listings.map((x) => x.id === id ? { ...x, ...patch } : x));
      else { const seed = SEED.find((x) => x.id === id); if (seed) put('listings', [{ ...seed, ...patch }, ...dbRef.current.listings]); }
    },
    adminDeleteListing(id) {
      put('listings', dbRef.current.listings.filter((x) => x.id !== id));
      if (SEED.some((x) => x.id === id)) put('hiddenSeedIds', [...new Set([...dbRef.current.hiddenSeedIds, id])]);
    },
    markListingSold(id, soldPrice) {
      put('listings', dbRef.current.listings.map((x) => x.id === id ? { ...x, status: 'Sold', soldPrice: Number(soldPrice), soldAt: new Date().toISOString() } : x));
    },
    favKey: sid || 'guest',
    isFav(id) {
      return (dbRef.current.favs[sid || 'guest'] || []).includes(id);
    },
    toggleFav(id) {
      const k = sid || 'guest';
      const cur = dbRef.current.favs[k] || [];
      const on = cur.includes(id);
      put('favs', {
        ...dbRef.current.favs,
        [k]: on ? cur.filter((x) => x !== id) : [...cur, id],
      });
      toast(on ? 'Removed from saved properties' : 'Saved to your favourites', 'ok');
    },
    addEnquiry(e) {
      const item = {
        ...e,
        id: 'e' + Date.now().toString(36),
        userId: sid,
        createdAt: new Date().toISOString(),
      };
      put('enquiries', [item, ...dbRef.current.enquiries]);
      return item;
    },
    addVisit(v) {
      const item = {
        ...v,
        id: 'v' + Date.now().toString(36),
        userId: sid,
        status: 'Requested',
        createdAt: new Date().toISOString(),
      };
      put('visits', [item, ...dbRef.current.visits]);
      return item;
    },
    setVisitStatus(id, status) {
      put(
        'visits',
        dbRef.current.visits.map((v) => (v.id === id ? { ...v, status } : v)),
      );
    },
    addMessage(m) {
      put('messages', [
        {
          ...m,
          id: 'm' + Date.now().toString(36),
          createdAt: new Date().toISOString(),
        },
        ...dbRef.current.messages,
      ]);
    },
    resetAll() {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(K))
        .forEach((k) => localStorage.removeItem(k));
      try {
        sessionStorage.clear();
      } catch (e) {}
      window.location.assign('/');
    },
  };
  A.listings = useMemo(() => {
    const seedIds = new Set(SEED.map((x) => x.id));
    const seedRows = SEED.filter((x) => !(db.hiddenSeedIds || []).includes(x.id)).map((seed) => db.listings.find((x) => x.id === seed.id) || seed);
    const userRows = db.listings.filter((x) => !seedIds.has(x.id));
    return [...userRows, ...seedRows].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  }, [db.listings, db.hiddenSeedIds]);
  A.getListing = (id) => A.listings.find((l) => l.id === id);
  return <Ctx.Provider value={A}>{children}</Ctx.Provider>;
}
