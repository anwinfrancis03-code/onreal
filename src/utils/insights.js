import { clamp, hashStr, mulberry } from './format';

export const USES = {
  house: {
    label: 'Residential House',
    w: { residential: 3, services: 2.5, calm: 2, infra: 1, transit: 1, road: 0.5 },
  },
  grocery: {
    label: 'Grocery Store',
    w: { residential: 2.5, footfall: 1.5, road: 1, lowComp: 2.5, services: 1 },
  },
  restaurant: {
    label: 'Restaurant / Cafe',
    w: { footfall: 3, road: 2, transit: 1.5, lowComp: 2, residential: 1 },
  },
  retail: {
    label: 'Retail Shop',
    w: { footfall: 3, road: 2, transit: 1.5, lowComp: 2, infra: 1 },
  },
  office: {
    label: 'Office',
    w: {
      infra: 3,
      transit: 1.5,
      road: 1,
      services: 1.5,
      lowComp: 0.6,
      footfall: 1,
    },
  },
  clinic: {
    label: 'Clinic',
    w: { residential: 2.5, services: 2, road: 1.5, lowComp: 2.5, transit: 1 },
  },
  warehouse: {
    label: 'Warehouse',
    w: { industrial: 3, road: 3, lowComp: 1.5, infra: 1, transit: 1 },
  },
  workshop: {
    label: 'Workshop',
    w: { industrial: 2.5, road: 2, lowComp: 2, infra: 1, residential: 0.5 },
  },
  other: {
    label: 'Other / Mixed use',
    w: { infra: 2, road: 2, services: 1, footfall: 1, residential: 1 },
  },
};

export const FACTOR_LABEL = {
  residential: 'Residential demand',
  services: 'Schools, hospitals & markets',
  road: 'Main-road access',
  infra: 'Infrastructure',
  transit: 'Public transport',
  footfall: 'Commercial footfall',
  industrial: 'Industrial / logistics activity',
  calm: 'Quiet, residential setting',
  lowComp: 'Low competition',
};

export function featuresOf(loc, use) {
  const f = {
    residential: loc.residential,
    services: loc.services,
    road: clamp(100 - loc.roadKm * 20, 5, 100),
    infra: loc.infra,
    transit: loc.transit,
    footfall: loc.footfall,
    industrial: loc.industrial,
    calm: 100 - loc.footfall,
  };
  f.lowComp = loc.comp[use] != null ? 100 - loc.comp[use] : null;
  return f;
}

export function scoreUse(loc, use) {
  const U = USES[use],
    f = featuresOf(loc, use);
  let s = 0,
    t = 0;
  const parts = [];
  for (const k in U.w) {
    const v = f[k];
    if (v == null) continue;
    s += U.w[k] * v;
    t += U.w[k];
    parts.push({ k, v: Math.round(v), w: U.w[k] });
  }
  const score = Math.round(s / t);
  parts.sort((a, b) => b.w * b.v - a.w * a.v);
  const pos = parts
    .filter((p) => p.v >= 65)
    .slice(0, 4)
    .map((p) => FACTOR_LABEL[p.k] + ' is strong (' + p.v + '/100 in the sample data).');
  const neg = parts
    .filter((p) => p.v <= 45)
    .slice(0, 3)
    .map((p) => FACTOR_LABEL[p.k] + ' looks weak (' + p.v + '/100 in the sample data).');
  return { use, label: U.label, score, pos, neg, parts };
}

export function rankUses(loc) {
  return Object.keys(USES)
    .filter((u) => u !== 'other')
    .map((u) => scoreUse(loc, u))
    .sort((a, b) => b.score - a.score);
}

export function facilitiesOf(loc) {
  const r = mulberry(loc.seed * 31),
    out = [];
  const names = {
    school: 'School',
    hospital: 'Hospital / clinic',
    bus: 'Bus stop',
    market: 'Market / supermarket',
  };
  Object.keys(loc.counts).forEach((t) => {
    for (let i = 0; i < Math.min(loc.counts[t], 3); i++)
      out.push({
        type: t,
        name: names[t] + ' ' + String.fromCharCode(65 + i),
        km: +(0.4 + i * 0.7 + r() * 0.5).toFixed(1),
      });
  });
  out.push({ type: 'rail', name: 'Railway station', km: loc.railKm });
  out.forEach((f, i) => {
    f.angle = (i * 137.5 + loc.seed * 20) % 360;
  });
  return out;
}

export const _ser = {};

export function monthlySeries(loc) {
  if (_ser[loc.id]) return _ser[loc.id];
  const r = mulberry(hashStr(loc.id)),
    out = [],
    now = new Date();
  for (let i = 60; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const base = loc.base * Math.pow(1 + loc.trend / 100, -i / 12);
    const noise = 1 + Math.sin(i * 0.9 + loc.seed) * 0.025 + (r() - 0.5) * 0.03;
    out.push({ d, v: +(base * noise).toFixed(2) });
  }
  return (_ser[loc.id] = out);
}

export function pointsFor(loc, range) {
  const all = monthlySeries(loc);
  let pts;
  if (range === '1Y') pts = all.slice(-13);
  else if (range === '3Y')
    pts = all.filter((_, i) => (all.length - 1 - i) % 3 === 0 && all.length - 1 - i <= 36);
  else pts = all.filter((_, i) => (all.length - 1 - i) % 3 === 0);
  return pts.map((p) => ({
    label: p.d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
    value: p.v,
  }));
}

export const pctChange = (pts) => (pts[pts.length - 1].value / pts[0].value - 1) * 100;
