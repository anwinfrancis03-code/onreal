/** @type {import('tailwindcss').Config} */
const v = (n) => `rgb(var(--${n}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        ink: v('ink'),
        muted: v('muted'),
        line: v('line'),
        danger: v('danger'),
        brand: { DEFAULT: v('brand'), 700: v('brand-700'), 100: v('brand-100'), 50: v('brand-50'), text: v('brand-text') },
        /* fixed (theme-independent) deep emerald used for hero panels and the footer */
        deep: { DEFAULT: '#0A3B2D', 700: '#072B21', 800: '#05211A' },
        lime: { DEFAULT: '#C8E86B', 300: '#DCF08F', 600: '#A6C940' },
        amber: { soft: '#FFF4D6', ink: '#7A5410' },
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] },
      boxShadow: {
        card: '0 1px 2px rgb(16 24 20 / 0.04), 0 8px 24px -14px rgb(16 24 20 / 0.14)',
        lift: '0 2px 4px rgb(16 24 20 / 0.05), 0 22px 44px -18px rgb(16 24 20 / 0.28)',
        pop: '0 24px 60px -20px rgb(10 59 45 / 0.35)',
      },
      keyframes: {
        shimmer: { to: { backgroundPosition: '-200% 0' } },
        'fade-up': { from: { opacity: 0, transform: 'translateY(14px)' }, to: { opacity: 1, transform: 'none' } },
        spin: { to: { transform: 'rotate(360deg)' } },
      },
      animation: { shimmer: 'shimmer 1.4s linear infinite', 'fade-up': 'fade-up .6s cubic-bezier(.22,.8,.24,1) both' },
    },
  },
  plugins: [],
};
