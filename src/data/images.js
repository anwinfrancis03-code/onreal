/* Stock photography catalogue.
   Photos are loaded from the Unsplash CDN. If any URL ever fails to load, <PropertyImage> falls back to an
   illustrated scene automatically, so the UI never shows a broken image. To use your own photos, drop files in
   /public/photos and replace the ids below with paths such as '/photos/land-1.jpg' (see README). */
const CDN = 'https://images.unsplash.com/';
const IDS = {
  land: [
    'photo-1500382017468-9049fed747ef',
    'photo-1500530855697-b586d89ba3ee',
    'photo-1574362848149-11496d93a7c7',
    'photo-1470071459604-3b5ec3a7fe05',
  ],
  house: [
    'photo-1564013799919-ab600027ffc6',
    'photo-1560518883-ce09059eeffa',
    'photo-1512917774080-9991f1c4c750',
    'photo-1600585154340-be6161a56a0c',
  ],
  shop: [
    'photo-1441986300917-64674bd600d8',
    'photo-1604719312566-8912e9227c6a',
    'photo-1472851294608-062f824d29cc',
  ],
  office: [
    'photo-1497366216548-37526070297c',
    'photo-1497366811353-6870744d04b2',
    'photo-1524758631624-e2822e304c36',
    'photo-1486406146926-c627a92ad1ab',
  ],
  building: [
    'photo-1486406146926-c627a92ad1ab',
    'photo-1545324418-cc1a3fa10c00',
    'photo-1486325212027-8081e485255e',
    'photo-1449824913935-59a10b8d2000',
  ],
  warehouse: [
    'photo-1586528116311-ad8dd3c8310d',
    'photo-1553413077-190dd305871c',
    'photo-1578575437130-527eed3abbec',
  ],
  restaurant: [
    'photo-1555396273-367ea4eb4db5',
    'photo-1517248135467-4c7edcad34c4',
    'photo-1414235077428-338989a2e8c0',
  ],
  city: [
    'photo-1480714378408-67cf0d13bc1b',
    'photo-1449824913935-59a10b8d2000',
    'photo-1477959858617-67f85cf4f1df',
  ],
};

export const photoUrl = (id, w = 900) =>
  id.startsWith('/') || id.startsWith('http') ? id : `${CDN}${id}?auto=format&fit=crop&w=${w}&q=70`;

const pickKey = (p) => {
  if (p.type === 'Shop') return 'shop';
  if (p.type === 'Office') return 'office';
  if (p.type === 'Commercial Building')
    return p.uses && p.uses[0] === 'Restaurant' ? 'restaurant' : 'building';
  if (p.uses && p.uses.includes('Warehouse')) return 'warehouse';
  return 'land';
};

/* Three representative photos for a listing that has no uploaded images. */
export function stockPhotos(p, w = 900) {
  const key = pickKey(p);
  const main = IDS[key];
  const alt =
    key === 'land' && p.uses && p.uses.includes('Residential')
      ? IDS.house
      : IDS[key === 'land' ? 'city' : key];
  const seed = p.seed || 1;
  return [main[seed % main.length], main[(seed + 1) % main.length], alt[seed % alt.length]].map((id) =>
    photoUrl(id, w),
  );
}

/* Photos for a listing: uploaded images win, otherwise stock photography. */
export function listingPhotos(p, w = 900) {
  if (p.images && p.images.length) return { urls: p.images, stock: false };
  return { urls: stockPhotos(p, w), stock: true };
}

export const HERO_PHOTOS = [
  photoUrl(IDS.house[0], 1000),
  photoUrl(IDS.city[2], 800),
  photoUrl(IDS.land[0], 800),
];
export const AUTH_PHOTO = photoUrl(IDS.building[1], 1200);
export const CATEGORY_PHOTOS = {
  land: photoUrl(IDS.land[1], 700),
  commercial: photoUrl(IDS.building[0], 700),
  shops: photoUrl(IDS.shop[0], 700),
  offices: photoUrl(IDS.office[0], 700),
  residential: photoUrl(IDS.house[1], 700),
  investment: photoUrl(IDS.city[0], 700),
};
