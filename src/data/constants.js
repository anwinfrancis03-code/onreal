export const USE_MAP = {
  Residential: 'house',
  Shop: 'retail',
  Office: 'office',
  Warehouse: 'warehouse',
  Restaurant: 'restaurant',
  Other: 'other',
};

export const PROP_USES = ['Residential', 'Shop', 'Office', 'Warehouse', 'Restaurant', 'Other'];

export const PROP_TYPES = ['Land', 'Shop', 'Office', 'Commercial Building'];

export const AMENITIES = [
  'Road access',
  'Water supply',
  'Electricity',
  'Boundary fencing',
  'Parking',
  'Security',
  'Power backup',
  'Lift',
  'Drainage',
  'Internet / fibre',
  'Loading bay',
  'Washroom',
];

export const DEFAULT_AMENITIES = {
  Land: ['Road access', 'Water supply', 'Electricity', 'Boundary fencing'],
  Shop: ['Electricity', 'Washroom', 'Parking', 'Security'],
  Office: ['Power backup', 'Lift', 'Parking', 'Internet / fibre', 'Security'],
  'Commercial Building': ['Parking', 'Lift', 'Power backup', 'Drainage', 'Security'],
};
