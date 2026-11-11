import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Field, Spinner } from './ui';
import { Icon } from './Icon';
import { Logo } from './Logo';
import { PropertyImage } from './PropertyImage';
import { Link, go } from '../utils/router';
import { AUTH_PHOTO } from '../data/images';
import { validEmail } from '../utils/validation';

export function PwField({ id, label, value, onChange, error, hint, autoComplete }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} id={id} error={error} hint={hint}>
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? id + '-msg' : undefined}
          className={'input pr-12 ' + (error ? 'input-error' : '')}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:bg-bg hover:text-ink"
        >
          <Icon n={show ? 'eyeoff' : 'eye'} size={18} />
        </button>
      </div>
    </Field>
  );
}

const PERKS = [
  ['users', 'Deal directly with property owners'],
  ['compass', 'See location insights for every listing'],
  ['shield', 'You control who sees your contact details'],
];

export function AuthPage({ mode, route }) {
  const A = useApp();
  const next = route.query.next ? decodeURIComponent(route.query.next) : '/';
  const nq = route.query.next ? '?next=' + encodeURIComponent(next) : '';
  const [f, setF] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    terms: false,
    remember: true,
  });
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState('');

  useEffect(() => {
    if (A.user && mode !== 'forgot') go('/');
  }, [A.user]);
  useEffect(() => {
    setErr({});
    setFormErr('');
  }, [mode]);
  const set = (k) => (e) =>
    setF((x) => ({ ...x, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = () => {
    const er = {};
    if (mode === 'register' && f.name.trim().length < 2) er.name = 'Please enter your full name.';
    if (!f.email.trim()) er.email = 'Email is required.';
    else if (!validEmail(f.email.trim())) er.email = 'Enter a valid email address, like name@example.com.';
    if (!f.password) er.password = 'Password is required.';
    else if (
      (mode === 'register' || mode === 'forgot') &&
      (f.password.length < 8 || !/[a-zA-Z]/.test(f.password) || !/\d/.test(f.password))
    )
      er.password = 'Use at least 8 characters with a letter and a number.';
    if ((mode === 'register' || mode === 'forgot') && f.confirm !== f.password)
      er.confirm = 'Passwords do not match.';
    if (mode === 'register' && !f.terms) er.terms = 'Please accept the terms to continue.';
    return er;
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormErr('');
    const er = validate();
    setErr(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    if (mode === 'register') {
      const r = await A.register({ name: f.name, email: f.email, password: f.password });
      setBusy(false);
      if (r.error) return setErr({ email: r.error });
      A.toast('Welcome to ONREAL, ' + f.name.trim().split(' ')[0] + '! Your demo account is ready.');
      go(next);
    } else if (mode === 'login') {
      const r = await A.login({ email: f.email, password: f.password, remember: f.remember });
      setBusy(false);
      if (r.error) return setFormErr(r.error);
      A.toast('Logged in. Welcome back!');
      go(next);
    } else {
      const r = await A.resetPassword(f.email, f.password);
      setBusy(false);
      if (r.error) return setErr({ email: r.error });
      A.toast('Demo password updated. You can log in now.');
      go('/login');
    }
  };
  const demo = async () => {
    setBusy(true);
    await A.demoLogin();
    setBusy(false);
    A.toast('Signed in with the sample account.');
    go(next);
  };

  const title =
    mode === 'register' ? 'Create your account' : mode === 'forgot' ? 'Reset demo password' : 'Welcome back';
  const sub =
    mode === 'register'
      ? 'Create a demo account to list properties, save favourites and send enquiries.'
      : mode === 'forgot'
        ? "This prototype has no email service. Enter your demo account's email and choose a new password stored in this browser."
        : 'Sign in to manage your listings, saved properties and enquiries.';

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="auth-skyline relative overflow-hidden bg-deep lg:block">
        <div className="absolute inset-0 opacity-25">
          <PropertyImage src={AUTH_PHOTO} alt="" type="Commercial Building" seed={4} eager />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-deep-800 via-deep/80 to-deep/60" /><div className="skyline" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Logo tone="light" />
          <div>
            <h2 className="max-w-md text-4xl font-extrabold leading-tight !text-white">
              Find the land. Discover the opportunity.
            </h2>
            <p className="mt-4 max-w-md text-base text-white/75">
              ONREAL is a marketplace for land and commercial property, with location insights that show what
              a place could become.
            </p>
            <ul className="mt-8 space-y-4">
              {PERKS.map(([ic, t]) => (
                <li key={t} className="flex items-center gap-3 text-sm font-semibold">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-lime">
                    <Icon n={ic} size={17} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-white/50">Prototype. Sample data is illustrative.</p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-between">
            <span className="lg:hidden">
              <Logo />
            </span>
            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
            >
              <Icon n="left" size={15} />
              Back to home
            </Link>
          </div>
          <h1 className="text-3xl">{title}</h1>
          <p className="mb-7 mt-2 text-sm text-muted">{sub}</p>
          <form onSubmit={submit} noValidate className="space-y-4">
            {mode === 'register' && (
              <Field label="Full name" id="a-n" error={err.name}>
                <input className="input" value={f.name} onChange={set('name')} autoComplete="name" />
              </Field>
            )}
            <Field label="Email address" id="a-e" error={err.email}>
              <input
                className="input"
                type="email"
                value={f.email}
                onChange={set('email')}
                autoComplete="email"
              />
            </Field>
            <PwField
              id="a-p"
              label={mode === 'forgot' ? 'New password' : 'Password'}
              value={f.password}
              onChange={set('password')}
              error={err.password}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              hint={mode !== 'login' ? 'At least 8 characters, with a letter and a number.' : undefined}
            />
            {mode !== 'login' && (
              <PwField
                id="a-c"
                label="Confirm password"
                value={f.confirm}
                onChange={set('confirm')}
                error={err.confirm}
                autoComplete="new-password"
              />
            )}
            {mode === 'register' && (
              <div>
                <label className="flex cursor-pointer items-start gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4"
                    checked={f.terms}
                    onChange={set('terms')}
                  />
                  <span>
                    I agree to the{' '}
                    <Link to="/terms" className="font-bold text-brand-text underline">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="font-bold text-brand-text underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {err.terms && (
                  <p className="field-error" role="alert">
                    {err.terms}
                  </p>
                )}
              </div>
            )}
            {mode === 'login' && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={f.remember}
                    onChange={set('remember')}
                  />
                  Remember me
                </label>
                <Link to="/forgot" className="font-bold text-brand-text hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}
            {formErr && (
              <p
                className="rounded-lg bg-danger/10 px-3.5 py-2.5 text-sm font-semibold text-danger"
                role="alert"
              >
                {formErr}
              </p>
            )}
            <button className="btn btn-primary btn-lg w-full" type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Spinner />
                  Please wait...
                </>
              ) : mode === 'register' ? (
                'Create Account'
              ) : mode === 'forgot' ? (
                'Update password'
              ) : (
                'Login'
              )}
            </button>
          </form>
          {mode !== 'forgot' && (
            <>
              <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted">
                <span className="h-px flex-1 bg-line" />
                or
                <span className="h-px flex-1 bg-line" />
              </div>
              <button className="btn btn-outline btn-lg w-full" onClick={demo} disabled={busy} type="button">
                <Icon n="sparkle" size={17} />
                Continue with a sample account
              </button>
            </>
          )}
          <p className="mt-6 text-center text-sm text-muted">
            {mode === 'register' ? (
              <>
                Already have an account?{' '}
                <Link to={'/login' + nq} className="font-bold text-brand-text hover:underline">
                  Log in
                </Link>
              </>
            ) : mode === 'forgot' ? (
              <Link to="/login" className="font-bold text-brand-text hover:underline">
                Back to log in
              </Link>
            ) : (
              <>
                Don't  have an account?{' '}
                <Link to={'/register' + nq} className="font-bold text-brand-text hover:underline">
                  Create one
                </Link>
              </>
            )}
          </p>
          <p className="mt-6 rounded-xl border border-dashed border-line px-4 py-3 text-xs leading-relaxed text-muted">
            <b className="text-ink">Demo only.</b> Accounts are stored in your browser's localStorage, which
            is not production security. A real product needs a secure backend, server-side password hashing
            and proper session management. Please use no real personal informations.
          </p>
        </div>
      </main>
    </div>
  );
}
