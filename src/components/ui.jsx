import { Children, cloneElement, isValidElement, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icon } from './Icon';
import { Link } from '../utils/router';

const cx = (...a) => a.filter(Boolean).join(' ');

/* Label + control + hint/error. The single child control receives id, aria-invalid and error styling. */
export function Field({ label, id, error, hint, required, children, className = '' }) {
  const only = Children.count(children) === 1 && isValidElement(children) ? children : null;
  const control =
    only && ['input', 'select', 'textarea'].includes(only.type)
      ? cloneElement(only, {
          id,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': error || hint ? id + '-msg' : undefined,
          className: cx(only.props.className, error && 'input-error'),
        })
      : children;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="label">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      {control}
      {error ? (
        <p id={id + '-msg'} className="field-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={id + '-msg'} className="field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const f = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', f);
    ref.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', f);
    };
  }, []);
  return (
    <motion.div
      className="fixed inset-0 z-[90] grid place-items-center bg-deep-800/60 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={cx(
          'max-h-[90vh] w-full overflow-auto rounded-2xl bg-surface p-6 shadow-lift outline-none',
          wide ? 'max-w-2xl' : 'max-w-md',
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg">{title}</h3>
          <button className="icon-btn h-9 w-9" onClick={onClose} aria-label="Close">
            <Icon n="x" size={16} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* Slide-over panel (used for the mobile filter drawer). */
export function Drawer({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const f = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', f);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', f);
    };
  }, [open]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80]" initial={{ opacity: 1 }} exit={{ opacity: 1 }}>
          <motion.div
            className="absolute inset-0 bg-deep-800/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="absolute inset-y-0 left-0 flex w-[min(92vw,380px)] flex-col bg-surface shadow-lift"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.26 }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h3 className="text-base">{title}</h3>
              <button className="icon-btn h-9 w-9" onClick={onClose} aria-label="Close filters">
                <Icon n="x" size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            {footer && <div className="border-t border-line p-4">{footer}</div>}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PageHead({ eyebrow, title, sub, crumbs, actions }) {
  return (
    <div className="mb-8">
      {crumbs && (
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex flex-wrap items-center gap-1.5 text-[13px] text-muted"
        >
          {crumbs.map(([label, to], i) => (
            <span key={label} className="inline-flex items-center gap-1.5">
              {i > 0 && <Icon n="right" size={14} />}
              {to ? (
                <Link to={to} className="hover:text-ink">
                  {label}
                </Link>
              ) : (
                <span className="font-semibold text-ink">{label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
          <h1 className="text-3xl sm:text-4xl">{title}</h1>
          {sub && <p className="mt-3 text-base text-muted sm:text-lg">{sub}</p>}
        </div>
        {actions}
      </div>
    </div>
  );
}

export function SectionHead({ eyebrow, title, sub, center = false, action }) {
  return (
    <div
      className={cx(
        'mb-10 flex flex-wrap items-end justify-between gap-4',
        center && 'justify-center text-center',
      )}
    >
      <div className={center ? 'mx-auto max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
        <h2 className="text-3xl sm:text-4xl">{title}</h2>
        {sub && <p className="mt-3 text-base text-muted sm:text-lg">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ icon = 'search', title, text, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
      <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-text">
        <Icon n={icon} size={22} />
      </span>
      <h3 className="text-lg">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">{text}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/* Notice used wherever data is simulated. */
export const Disclaimer = ({ children, tone = 'sample' }) => (
  <div
    role="note"
    className={cx(
      'flex gap-3 rounded-xl border px-4 py-3 text-[13px] leading-relaxed',
      tone === 'sample'
        ? 'border-amber-soft bg-amber-soft/60 text-amber-ink'
        : 'border-line bg-bg text-muted',
    )}
  >
    <Icon n="info" size={17} className="mt-0.5 shrink-0" />
    <div>{children}</div>
  </div>
);

export const SampleTag = ({ children = 'Sample data' }) => (
  <span className="sample-tag">
    <Icon n="info" size={12} />
    {children}
  </span>
);

export function Spinner({ className = '' }) {
  return (
    <span
      className={cx(
        'inline-block h-4 w-4 animate-[spin_.7s_linear_infinite] rounded-full border-2 border-current border-t-transparent',
        className,
      )}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-5 w-4/5" />
        <div className="skeleton h-4 w-3/5" />
        <div className="skeleton h-9 w-full" />
      </div>
    </div>
  );
}

export const StatCard = ({ icon, label, value, hint, onClick }) => {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={cx(
        'card card-pad text-left',
        onClick && 'transition hover:-translate-y-0.5 hover:shadow-lift',
      )}
    >
      <span className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-text">
        <Icon n={icon} size={19} />
      </span>
      <div className="text-3xl font-extrabold tracking-tight">{value}</div>
      <div className="mt-0.5 text-sm font-semibold">{label}</div>
      {hint && <div className="mt-1 text-xs text-muted">{hint}</div>}
    </Tag>
  );
};

export { cx };
