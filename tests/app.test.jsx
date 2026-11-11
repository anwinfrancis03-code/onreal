import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import { AppProvider } from '../src/context/AppContext';
import { scoreUse, rankUses } from '../src/utils/insights';
import { LOCALITIES } from '../src/data/localities';
import { SEED } from '../src/data/properties';
import { filterListings, emptyF } from '../src/utils/filters';
import { fmtINR, priceLabel } from '../src/utils/format';
import { stockPhotos, listingPhotos } from '../src/data/images';

/* Leaflet needs a real browser (SVG renderer); it is verified in the browser, so stub it here. */
vi.mock('../src/components/PropertyMap', () => ({
  PropertyMap: ({ markers = [] }) => <div data-testid="map">{markers.length} markers</div>,
}));

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppProvider>
        <App />
      </AppProvider>
    </MemoryRouter>,
  );

describe('utilities', () => {
  it('formats rupees in lakh / crore', () => {
    expect(fmtINR(4800000)).toBe('₹48 L');
    expect(fmtINR(21000000)).toBe('₹2.1 Cr');
    expect(priceLabel({ purpose: 'Rent', price: 110000 })).toBe('₹1,10,000 / month');
  });
  it('scores every locality for every use between 0 and 100', () => {
    LOCALITIES.forEach((l) =>
      rankUses(l).forEach(
        (r) => expect(r.score).toBeGreaterThanOrEqual(0) && expect(r.score).toBeLessThanOrEqual(100),
      ),
    );
    expect(scoreUse(LOCALITIES[2], 'office').score).toBeGreaterThan(
      scoreUse(LOCALITIES[2], 'warehouse').score,
    );
  });
  it('filters seed listings', () => {
    expect(SEED.length).toBeGreaterThanOrEqual(8);
    expect(filterListings(SEED, { ...emptyF, purpose: 'Rent' }).every((p) => p.purpose === 'Rent')).toBe(
      true,
    );
    expect(filterListings(SEED, { ...emptyF, loc: 'zzzz' })).toHaveLength(0);
  });
});

describe('routes render', () => {
  const routes = [
    ['/', /Find the Right Space/i],
    ['/properties', /Explore properties/i],
    ['/properties/p1', /Residential plot near Ollur/i],
    ['/market-insights', /Where is the next opportunity/i],
    ['/location-intelligence', /Discover what it can become/i],
    ['/contact', /Talk to the ONREAL team/i],
    ['/about', /Build your future on the right land/i],
    ['/privacy', /Privacy Policy/i],
    ['/terms', /Terms and Conditions/i],
    ['/login', /Welcome back/i],
    ['/register', /Create your account/i],
    ['/nope', /This plot is empty/i],
  ];
  routes.forEach(([path, text]) => {
    it(path, async () => {
      renderAt(path);
      expect((await screen.findAllByText(text)).length).toBeGreaterThan(0);
    });
  });
  it('redirects protected routes to login', async () => {
    renderAt('/dashboard');
    expect((await screen.findAllByText(/Welcome back/i)).length).toBeGreaterThan(0);
  });
});

describe('auth', () => {
  it('shows validation errors on an empty registration', async () => {
    renderAt('/register');
    fireEvent.click(await screen.findByRole('button', { name: /create account/i }));
    expect(await screen.findByText(/valid email|Email is required/i)).toBeTruthy();
    expect(screen.getByText(/accept the terms/i)).toBeTruthy();
  });
  it('registers, keeps the session and never stores the plaintext password', async () => {
    renderAt('/register');
    fireEvent.change(await screen.findByLabelText(/full name/i), { target: { value: 'Test Person' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Passw0rdOK' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'Passw0rdOK' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() => expect(localStorage.getItem('onreal.v1.session')).toBeTruthy(), { timeout: 4000 });
    expect(localStorage.getItem('onreal.v1.users')).not.toContain('Passw0rdOK');
  });
  it('signs in with the sample account and opens the dashboard', async () => {
    renderAt('/login');
    fireEvent.click(await screen.findByRole('button', { name: /sample account/i }));
    await waitFor(() => expect(localStorage.getItem('onreal.v1.session')).toBeTruthy(), { timeout: 4000 });
  });
});

describe('marketplace', () => {
  it('shows an empty state when nothing matches', async () => {
    renderAt('/properties?loc=zzzz');
    expect(await screen.findByText(/No properties match your filters/i, {}, { timeout: 3000 })).toBeTruthy();
  });
});

describe('categories and images', () => {
  it('supports the high-growth investment filter', () => {
    const inv = filterListings(SEED, { ...emptyF, inv: true });
    expect(inv.length).toBeGreaterThan(0);
    expect(inv.length).toBeLessThan(SEED.length);
  });
  it('uses uploaded images first and stock photos otherwise', () => {
    expect(listingPhotos({ ...SEED[0], images: ['data:image/jpeg;base64,xx'] }).stock).toBe(false);
    const stock = listingPhotos(SEED[0]);
    expect(stock.stock).toBe(true);
    expect(stockPhotos(SEED[0])).toHaveLength(3);
  });
  it('gives every seed listing amenities', () => {
    SEED.forEach((p) => expect(p.amenities.length).toBeGreaterThan(0));
  });
});

describe('add property wizard', () => {
  const seedSession = () => {
    localStorage.setItem(
      'onreal.v1.users',
      JSON.stringify([
        {
          id: 'u1',
          name: 'Test Owner',
          email: 'o@example.com',
          salt: 's',
          hash: 'h',
          created: new Date().toISOString(),
        },
      ]),
    );
    localStorage.setItem('onreal.v1.session', 'u1');
  };
  it('validates each step before continuing', async () => {
    seedSession();
    renderAt('/sell');
    fireEvent.click(await screen.findByRole('button', { name: /continue/i }));
    expect(await screen.findByText(/title of at least 5 characters/i)).toBeTruthy();
    expect(screen.getByText(/Step 1 of 5/i)).toBeTruthy();
  });
  it('moves to the location step with valid basics', async () => {
    seedSession();
    renderAt('/sell');
    fireEvent.change(await screen.findByLabelText(/^property title/i), {
      target: { value: 'Corner plot near bypass' },
    });
    fireEvent.change(screen.getByLabelText(/^price/i), { target: { value: '2500000' } });
    fireEvent.change(screen.getByLabelText(/^area/i), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText(/^description/i), {
      target: { value: 'A level plot close to the main road with water.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(await screen.findByText(/Step 2 of 5/i)).toBeTruthy();
  });
});
