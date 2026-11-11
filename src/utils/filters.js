import { toSqft } from './format';
import { nearestLocality } from '../data/localities';

export const emptyF = {
  loc: '',
  purpose: '',
  types: [],
  min: '',
  max: '',
  amin: '',
  amax: '',
  aunit: 'sqft',
  use: '',
  inv: false,
  sort: 'relevance',
};

export const fromQuery = (q) => ({
  ...emptyF,
  loc: q.loc || '',
  purpose: q.purpose || '',
  types: q.type ? q.type.split(',') : [],
  min: q.min || '',
  max: q.max || '',
  use: q.use || '',
  inv: q.inv === '1',
  sort: q.sort || 'relevance',
});

export function filterListings(list, f) {
  return list.filter((p) => {
    if (p.status !== 'Active') return false;
    if (f.loc) {
      const s = (p.title + ' ' + p.town + ' ' + p.district + ' ' + p.locality).toLowerCase();
      if (!s.includes(f.loc.toLowerCase())) return false;
    }
    if (f.purpose && p.purpose !== f.purpose) return false;
    if (f.types.length && !f.types.includes(p.type)) return false;
    if (f.min !== '' && p.price < +f.min) return false;
    if (f.max !== '' && p.price > +f.max) return false;
    const sq = toSqft(p.area, p.unit);
    if (f.amin !== '' && sq < toSqft(+f.amin, f.aunit)) return false;
    if (f.amax !== '' && sq > toSqft(+f.amax, f.aunit)) return false;
    if (f.use && !p.uses.includes(f.use)) return false;
    if (f.inv && nearestLocality(p.lat, p.lng).dev < 80) return false;
    return true;
  });
}

export function sortListings(list, f) {
  const a = [...list];
  if (f.sort === 'plh') a.sort((x, y) => x.price - y.price);
  else if (f.sort === 'phl') a.sort((x, y) => y.price - x.price);
  else if (f.sort === 'new') a.sort((x, y) => String(y.createdAt).localeCompare(String(x.createdAt)));
  else {
    const sc = (p) =>
      (f.loc && (p.town + p.locality).toLowerCase().includes(f.loc.toLowerCase()) ? 3 : 0) +
      (f.use && p.uses[0] === f.use ? 2 : 0) +
      (f.types.includes(p.type) ? 1 : 0);
    a.sort((x, y) => sc(y) - sc(x) || String(y.createdAt).localeCompare(String(x.createdAt)));
  }
  return a;
}
