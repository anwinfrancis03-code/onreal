import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { go } from '../utils/router';

export function Protected({ route, children }) {
  const A = useApp();
  useEffect(() => {
    if (!A.user) {
      A.toast('Please log in to continue', 'info');
      go('/login?next=' + encodeURIComponent(route.raw));
    }
  }, [A.user]);
  return A.user ? (
    children
  ) : (
    <div className="wrap py-16">
      <div className="skeleton h-72" />
    </div>
  );
}
