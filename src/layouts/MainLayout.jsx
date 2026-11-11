import { Suspense, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useOutlet } from 'react-router-dom';
import { Nav } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Toasts } from '../components/ToastNotification';
import { useRoute, go } from '../utils/router';
import { useApp } from '../context/AppContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/* Navbar + animated page area + footer. */
export default function MainLayout() {
  const route = useRoute();
  const A = useApp();
  const outlet = useOutlet();
  const reduce = useReducedMotion();
  useDocumentTitle(route.path);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (!A.user) go('/login?next=' + encodeURIComponent(route.raw));
  }, [A.user, route.raw]);
  if (!A.user) return <div className="wrap py-16"><div className="skeleton h-72" /></div>;
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:font-bold focus:text-white"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Skip to content
      </a>
      <Nav route={route} />
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
        <motion.main
          key={route.path}
          id="main-content"
          tabIndex={-1}
          className="flex-1 outline-none"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <Suspense
            fallback={
              <div className="page">
                <div className="wrap">
                  <div className="skeleton" style={{ height: 320 }}></div>
                </div>
              </div>
            }
          >
            {outlet}
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
      <Toasts />
    </div>
  );
}
