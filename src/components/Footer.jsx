import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { Icon } from './Icon';
import { Link } from '../utils/router';

const col = (title, links) => (
  <div>
    <h4 className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-white">{title}</h4>
    <ul className="space-y-2.5">
      {links.map(([to, l]) => (
        <li key={to + l}>
          <Link to={to} className="text-sm text-white/65 transition hover:text-lime">
            {l}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export function Footer() {
  const A = useApp();
  const soc = (n) => () => A.toast(`Demo placeholder: ONREAL has no ${n} page yet.`, 'info');
  return (
    <footer className="mt-20 bg-deep-800 text-white/70">
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            A direct marketplace for land and commercial property, with location insights that help you judge
            what a place could become.
          </p>
          <div className="mt-5 flex gap-2">
            {[
              ['facebook', 'Facebook'],
              ['instagram', 'Instagram'],
              ['linkedin', 'LinkedIn'],
            ].map(([n, l]) => (
              <button
                key={n}
                aria-label={l}
                onClick={soc(l)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white transition hover:bg-white/10"
              >
                <Icon n={n} size={16} />
              </button>
            ))}
          </div>
        </div>
        {col('Explore', [
          ['/properties', 'Explore Properties'],
          ['/properties?type=Land&purpose=Sale', 'Land for sale'],
          ['/market-insights', 'Market Insights'],
          ['/location-intelligence', 'Location Intelligence'],
        ])}
        {col('Company', [
          ['/about', 'About ONREAL'],
          ['/sell', 'List Your Property'],
          ['/contact', 'Contact Us'],
          ['/dashboard', 'My Dashboard'],
        ])}
        <div>
          <h4 className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-white">Contact</h4>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center gap-2.5">
              <Icon n="mail" size={16} className="text-lime" />
              hello@onreal.example
            </li>
            <li className="flex items-center gap-2.5">
              <Icon n="phone" size={16} className="text-lime" />
              +91 00000 00000 (placeholder)
            </li>
            <li className="flex items-center gap-2.5">
              <Icon n="pin" size={16} className="text-lime" />
              Thrissur, Kerala, India
            </li>
          </ul>
          <p className="mt-5 text-xs text-white/45">Contact details are placeholders in this prototype.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-white/55">
          <span>
            © {new Date().getFullYear()} ONREAL. Prototype for demonstration. Sample data is illustrative.
          </span>
          <span className="flex gap-5">
            <Link to="/privacy" className="hover:text-lime">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-lime">
              Terms and Conditions
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
