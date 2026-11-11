import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toasts } from '../components/ToastNotification';
import { useRoute } from '../utils/router';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/* Full-screen layout for login, registration and password reset (no navbar/footer). */
export default function AuthLayout() {
  const route = useRoute();
  useDocumentTitle(route.path);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.path]);
  return (
    <div className="min-h-screen">
      <Outlet />
      <Toasts />
    </div>
  );
}
