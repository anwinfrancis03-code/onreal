import { useEffect } from 'react';

const TITLES = {
  '/': 'ONREAL | Build your future on the right land',
  '/properties': 'Browse properties | ONREAL',
  '/sell': 'List your property | ONREAL',
  '/market-insights': 'Market insights | ONREAL',
  '/location-intelligence': 'Location intelligence | ONREAL',
  '/dashboard': 'Dashboard | ONREAL',
  '/contact': 'Contact | ONREAL',
  '/about': 'About | ONREAL',
  '/login': 'Log in | ONREAL',
  '/register': 'Create account | ONREAL',
  '/forgot': 'Reset password | ONREAL',
  '/privacy': 'Privacy | ONREAL',
  '/terms': 'Terms | ONREAL',
};

export function useDocumentTitle(path) {
  useEffect(() => {
    document.title = /^\/properties\/[\w-]+$/.test(path)
      ? 'Property details | ONREAL'
      : TITLES[path] || 'Page not found | ONREAL';
  }, [path]);
}
