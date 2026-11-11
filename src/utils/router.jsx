import { useMemo } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

/* A tiny bridge so non-component code (e.g. after an async login) can navigate. */
let navigator_ = null;
export const setNavigator = (fn) => {
  navigator_ = fn;
};
export const go = (to) => {
  if (navigator_) navigator_(to);
  else window.location.assign(to);
};

export const qs = (o) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => {
    if (v !== '' && v != null && v !== false) p.set(k, v);
  });
  const s = p.toString();
  return s ? '?' + s : '';
};

export function Link({ to, className, children, onClick, ...rest }) {
  return (
    <RouterLink to={to} className={className} onClick={onClick} {...rest}>
      {children}
    </RouterLink>
  );
}

/* Returns { path, query, raw } for the current URL. */
export function useRoute() {
  const { pathname, search } = useLocation();
  return useMemo(
    () => ({
      path: pathname,
      query: Object.fromEntries(new URLSearchParams(search)),
      raw: pathname + search,
    }),
    [pathname, search],
  );
}
