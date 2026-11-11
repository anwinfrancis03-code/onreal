# ONREAL: Land and Property Intelligence Platform

A modern real-estate marketplace where owners list land and commercial property for sale or rent, and buyers, investors and business owners discover properties and see **sample** location insights for what a place could be used for.

> **Frontend prototype.** Accounts, listings, favourites, enquiries and messages live in the browser's `localStorage`. Prices, trends and suitability scores are **illustrative sample data**, clearly labelled in the UI. See "Moving to a real backend" below.

## Run it in VS Code

1. Install **Node.js 18 or newer** from https://nodejs.org.
2. In VS Code choose **File > Open Folder...** and open the `onreal-app` folder.
3. Open the integrated terminal (**Terminal > New Terminal**) and run:

```bash
npm install
npm run dev
```

4. Open the address printed in the terminal (usually http://localhost:5173).

Other commands:

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm test          # run the test suite (Vitest)
```

Tip: on the login page, **Continue with a sample account** signs you in instantly so you can explore the dashboard and the listing wizard.

## Tech stack

Vite 5, React 18, React Router 6, **Tailwind CSS 3** (design tokens in `tailwind.config.js` and `src/index.css`), Framer Motion, Recharts, React Leaflet (OpenStreetMap), Lucide icons, Vitest + Testing Library.

## Design system

- **Palette:** deep emerald (`brand`, `deep`), warm off-white background, charcoal text, soft lime accent. Light theme by default; dark theme via Dashboard > Account Settings > Appearance.
- **Type:** Plus Jakarta Sans (falls back to Inter / system fonts).
- **Tokens:** colours are CSS variables in `src/index.css` (`--bg`, `--surface`, `--ink`, `--line`, `--brand` ...) mapped to Tailwind colours, so `bg-surface`, `text-muted`, `border-line`, `bg-brand` work everywhere and theme automatically.
- **Components:** reusable classes (`btn`, `btn-primary`, `card`, `input`, `chip`, `badge`...) are defined once in `src/index.css` with `@apply`; layout is done with Tailwind utilities in JSX.

## Pages and routes

| Route | Page |
| --- | --- |
| `/` | Landing page: hero + search, categories, featured listings, location intelligence, market preview, how it works, benefits |
| `/properties` | Explore: search, filters (location, budget, category, buy/rent, area, use), sort, grid/list/map, mobile filter drawer |
| `/properties/:id` | Details: photo gallery + lightbox, specs, amenities, map, nearby facilities, enquiry, site visit, Location Insights, similar properties |
| `/sell` | Add Property wizard (5 steps, per-step validation, live preview, review before publishing); `?edit=ID` edits a listing |
| `/market-insights` | Locality metrics, 1Y/3Y/5Y chart, comparison of up to three areas |
| `/location-intelligence` | Sample suitability report: score, ranked categories, accessibility, demand, facilities, risks, price scenarios |
| `/dashboard` | Overview (stat cards, recent listings and activity), My Listings, Saved, Enquiries, Site Visits, Settings |
| `/login`, `/register`, `/forgot` | Split-screen authentication (demo) |
| `/contact`, `/about`, `/privacy`, `/terms`, `*` | Info pages and a custom 404 |

## Project structure

```
src/
  App.jsx, main.jsx, index.css
  layouts/      MainLayout (sticky navbar, animated page area, footer), AuthLayout
  pages/        Home, Properties, PropertyDetails, Sell, MarketInsights, LocationIntelligence,
                Dashboard, Contact, About, Legal, NotFound
  components/   Navbar, Footer, PropertyCard, PropertyFilters, PropertyImage, PropertyMap (Leaflet),
                MarketChart (Recharts), LocationInsights, LocalityCard, AuthForm, ProtectedRoute,
                ToastNotification, Reveal, ui (Field, Modal, Drawer, PageHead, Empty, ...)
    home/       HeroSection, CategoryGrid, InsightShowcase, MarketPreview, HowItWorks, Benefits, FinalCta
  context/      AppContext (auth, listings, favourites, enquiries, visits, toasts, theme)
  data/         properties.js (sample listings), localities.js (sample locality data), images.js, constants.js
  utils/        storage, auth, validation, filters, insights (scoring), format, images, router
  hooks/        useMedia, useCountUp, useDocumentTitle
tests/          Vitest suite (utilities, routes, auth, filters, wizard)
```

## Images

Listing, category and hero photography uses curated **Unsplash** URLs defined in one file: `src/data/images.js`. Every image goes through `<PropertyImage>`, which falls back to an illustrated scene if a URL fails to load, so the UI never shows a broken image. Photos are illustrative stock images, labelled as such on listings that have no owner uploads. To use your own photos, put files in `public/photos/` and replace the ids in `images.js` with paths such as `/photos/land-1.jpg`. Owner-uploaded photos (Add Property > Photos) always take priority.

## Moving to a real backend

All data access goes through `src/context/AppContext.jsx` and `src/data/*`, so the swap is contained.

1. **API client:** add `src/api/client.js` (a `fetch` wrapper using `import.meta.env.VITE_API_URL`).
2. **Listings:** replace the `SEED` import and `listings` state with `GET/POST/PATCH/DELETE /listings`. Enforce ownership on the server. Upload images to object storage (S3, Cloudinary) and store URLs, not base64 (`src/utils/images.js`).
3. **Authentication:** remove the browser-hashed passwords (`src/utils/auth.js`) and use a real backend or provider (Auth0, Clerk, Supabase, Firebase) with server-side password hashing and `httpOnly` cookie sessions. `register`, `login`, `logout` and `resetPassword` in `AppContext` are the only places to change. Add real email for password reset.
4. **Enquiries, visits, contact form:** post to API endpoints and have the server email owners (SendGrid, SES, Resend). Until then the UI says plainly that nothing is emailed.
5. **Locality data and prices:** replace `src/data/localities.js` and the generated series in `src/utils/insights.js` with a service backed by verified market and land-use data and a documented method. Keep the uncertainty labels and disclaimers.
6. **Maps:** `PropertyMap` uses public OpenStreetMap tiles. For production traffic use a tile provider (MapTiler, Mapbox, Stadia) with a key in `.env`, and add geocoding to the listing form.
7. **Search:** move filtering from `src/utils/filters.js` to server-side queries with pagination.

## Security notes

LocalStorage authentication is for demonstration only and is **not secure**. Do not store real personal data in this prototype. Production needs HTTPS, server-side validation, rate limiting, CSRF protection for cookie sessions, and legal pages reviewed by a qualified professional (the included Privacy and Terms pages are placeholders).

## Accessibility and performance

Semantic landmarks, labelled controls with inline error messages, keyboard-operable gallery/drawer/modals (Esc closes), a skip link, visible focus rings, and `prefers-reduced-motion` support. Routes are code-split and heavy libraries are split into vendor chunks.


## Updates in this version
- Main website pages require login; sign in or register to see the home page and marketplace.
- Login/register view includes an animated skyscraper skyline.
- Visit `/admin` and enter the demo admin password `2137` to open the admin workspace.
- Admin workspace can edit/delete listings, mark properties sold, view users and recent login activity, and view the admin profile section.
- Sold listings remain in the marketplace as historical records. Existing location intelligence/map UI is preserved.

## Demo limitations
The admin password is checked in frontend JavaScript, and users/listings/login history are stored in localStorage for this browser only. This is not real security and does not provide shared cross-device data. Do not deploy as a real property marketplace without a backend, server-side role checks, a database, verified transaction/valuation data, and a real maps/geocoding API. Map and property-value insights in this prototype may use illustrative/demo data.
