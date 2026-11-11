import { Icon } from '../components/Icon';
import { Disclaimer, PageHead } from '../components/ui';
import { Link } from '../utils/router';

export function About() {
  return (
    <div className="wrap max-w-4xl pb-16 pt-8 sm:pt-10">
      <PageHead
        crumbs={[['Home', '/'], ['About']]}
        eyebrow="About ONREAL"
        title="Build your future on the right land."
        sub="ONREAL is a customer-to-customer real estate platform that helps people discover land and commercial property, and understand what a location could become."
      />
      <div className="grid gap-5 md:grid-cols-2">
        <div className="card card-pad">
          <h2 className="mb-2 text-lg">The problem</h2>
          <p className="text-sm leading-relaxed text-muted">
            A board on a plot says "for sale" or "for rent", but buyers often cannot tell whether their plan,
            a home, a shop or a clinic, actually suits the area. Owners are not obliged to explain the
            surroundings, and their claims cannot always be trusted.
          </p>
        </div>
        <div className="card card-pad">
          <h2 className="mb-2 text-lg">Our approach</h2>
          <p className="text-sm leading-relaxed text-muted">
            ONREAL processes the location and offers an independent view: suitable business categories, future
            appreciation scenarios and a purpose check, alongside what the owner says.
          </p>
        </div>
      </div>
      <div className="card card-pad mt-5">
        <h2 className="mb-4 text-lg">What this prototype does and does not do</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <ul className="space-y-3 text-sm">
            {[
              'Working accounts, listings, search, favourites, enquiries and visit requests, stored in your browser.',
              'Sample location rules that generate suitability scores and illustrative scenarios.',
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <Icon n="check" size={17} className="mt-0.5 shrink-0 text-brand-text" />
                {t}
              </li>
            ))}
          </ul>
          <ul className="space-y-3 text-sm">
            {[
              'No real AI analysis, verified land prices, zoning checks or title verification.',
              'No shared database, so listings are not visible to other users yet.',
              'Demo login is not production security.',
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <Icon n="alert" size={17} className="mt-0.5 shrink-0 text-amber-ink" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-5">
        <Disclaimer tone="info">
          Photography on listings is illustrative stock imagery unless an owner uploads their own photos.
        </Disclaimer>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/properties" className="btn btn-primary">
          Explore properties
        </Link>
        <Link to="/contact" className="btn btn-outline">
          Contact us
        </Link>
      </div>
    </div>
  );
}
