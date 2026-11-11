import { Link } from '../utils/router';

export function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#0A3B2D" />
      <path
        d="M9 27V19.5L20 11l11 8.5V27"
        fill="none"
        stroke="#C8E86B"
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M15.5 27v-6h9v6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ tone = 'dark', className = '' }) {
  const text = tone === 'light' ? 'text-white' : 'text-ink';
  return (
    <Link to="/" aria-label="ONREAL home" className={'inline-flex items-center gap-2.5 ' + className}>
      <LogoMark />
      <span className={'text-[19px] font-extrabold tracking-tight ' + text}>
        ON<span className={tone === 'light' ? 'text-lime' : 'text-brand-text'}>REAL</span>
      </span>
    </Link>
  );
}
