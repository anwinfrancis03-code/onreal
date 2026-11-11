import { lazy, useEffect } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import { setNavigator, useRoute } from './utils/router';
import { AuthPage } from './components/AuthForm';
import { Protected } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { NotFound } from './pages/NotFound';

/* Route-level code splitting: heavy pages load on demand. */
const page = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));
const Properties = page(() => import('./pages/Properties'), 'Properties');
const PropertyDetail = page(() => import('./pages/PropertyDetails'), 'PropertyDetail');
const Sell = page(() => import('./pages/Sell'), 'Sell');
const MarketInsights = page(() => import('./pages/MarketInsights'), 'MarketInsights');
const LocationIntelligence = page(() => import('./pages/LocationIntelligence'), 'LocationIntelligence');
const Dashboard = page(() => import('./pages/Dashboard'), 'Dashboard');
const Contact = page(() => import('./pages/Contact'), 'Contact');
const About = page(() => import('./pages/About'), 'About');
const Legal = page(() => import('./pages/Legal'), 'Legal');
const Admin = page(() => import('./pages/Admin'), 'Admin');

/* Small adapters so pages receive the parsed route (path, query, raw). */
function WithRoute({ C, ...props }) {
  const route = useRoute();
  return <C route={route} {...props} />;
}
function Guarded({ C }) {
  const route = useRoute();
  return (
    <Protected route={route}>
      <C route={route} />
    </Protected>
  );
}
function PropertyRoute() {
  const { id } = useParams();
  return <PropertyDetail id={id} />;
}

export default function App() {
  const navigate = useNavigate();
  setNavigator(navigate);
  useEffect(() => setNavigator(navigate), [navigate]);
  return (
    <Routes>
      <Route element={<AuthLayout />}><Route path="/admin" element={<Admin />} /></Route>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<WithRoute C={AuthPage} mode="login" />} />
        <Route path="/register" element={<WithRoute C={AuthPage} mode="register" />} />
        <Route path="/forgot" element={<WithRoute C={AuthPage} mode="forgot" />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="/properties" element={<WithRoute C={Properties} />} />
        <Route path="/properties/:id" element={<PropertyRoute />} />
        <Route path="/sell" element={<Guarded C={Sell} />} />
        <Route path="/market-insights" element={<WithRoute C={MarketInsights} />} />
        <Route path="/location-intelligence" element={<WithRoute C={LocationIntelligence} />} />
        <Route path="/dashboard" element={<Guarded C={Dashboard} />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Legal kind="privacy" />} />
        <Route path="/terms" element={<Legal kind="terms" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
