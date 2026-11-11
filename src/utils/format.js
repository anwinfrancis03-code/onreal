export const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

export const mulberry = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const hashStr = (s) => {
  let h = 2166136261;
  for (const c of String(s)) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

export const fmtNum = (n) => Number(n).toLocaleString('en-IN');

export function fmtINR(n) {
  n = Number(n) || 0;
  if (n >= 1e7) return '₹' + +(n / 1e7).toFixed(2) + ' Cr';
  if (n >= 1e5) return '₹' + +(n / 1e5).toFixed(2) + ' L';
  return '₹' + fmtNum(Math.round(n));
}

export const priceLabel = (p) =>
  p.purpose === 'Rent' ? '₹' + fmtNum(Math.round(p.price)) + ' / month' : fmtINR(p.price);

export const toSqft = (v, u) => (u === 'cents' ? v * 435.6 : u === 'acres' ? v * 43560 : v);

export const fmtArea = (v, u) => fmtNum(v) + ' ' + (u === 'sqft' ? 'sq ft' : u);

export const initials = (n) =>
  (n || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('');

export const mix = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a),
    B = p(b);
  return (
    '#' +
    A.map((v, i) =>
      Math.round(v + (B[i] - v) * t)
        .toString(16)
        .padStart(2, '0'),
    ).join('')
  );
};

export const todayISO = () => new Date().toISOString().slice(0, 10);
