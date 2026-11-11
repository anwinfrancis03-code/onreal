import { Icon } from '../Icon';
import { Reveal } from '../Reveal';
import { SectionHead } from '../ui';
import { Link } from '../../utils/router';

const OWNERS = [
  'List land or commercial space in a guided, step-by-step form',
  'Choose whether your contact details are hidden, members-only or public',
  'Pause, mark as sold or rented, or delete a listing any time',
  'Receive enquiries and site-visit requests in your dashboard',
];
const SEEKERS = [
  'Search by place, budget, area and what you plan to build or run',
  'See sample location insights, risks and nearby facilities for each listing',
  'Compare localities and save the properties you like',
  'Contact owners directly, with no broker in between',
];

const Panel = ({ tone, title, sub, items, cta }) => (
  <div
    className={
      'rounded-2xl border p-7 sm:p-9 ' +
      (tone === 'deep' ? 'border-transparent bg-deep text-white' : 'border-line bg-surface')
    }
  >
    <h3 className={'text-2xl ' + (tone === 'deep' ? '!text-white' : '')}>{title}</h3>
    <p className={'mt-2 text-sm ' + (tone === 'deep' ? 'text-white/70' : 'text-muted')}>{sub}</p>
    <ul className="mt-6 space-y-3.5">
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-sm leading-snug">
          <span
            className={
              'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ' +
              (tone === 'deep' ? 'bg-lime text-deep-800' : 'bg-brand-50 text-brand-text')
            }
          >
            <Icon n="check" size={13} />
          </span>
          {t}
        </li>
      ))}
    </ul>
    <div className="mt-8">{cta}</div>
  </div>
);

export function Benefits() {
  return (
    <section className="section">
      <div className="wrap">
        <SectionHead
          eyebrow="Built for both sides of the deal"
          title="Benefits for owners and business owners"
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <Panel
              title="For property owners"
              sub="Reach interested buyers and tenants without a middleman."
              items={OWNERS}
              cta={
                <Link to="/sell" className="btn btn-lime btn-lg">
                  List Your Property
                  <Icon n="arrow" size={18} />
                </Link>
              }
              tone="deep"
            />
          </Reveal>
          <Reveal delay={100}>
            <Panel
              title="For buyers and business owners"
              sub="Make better decisions with context, not just a price tag."
              items={SEEKERS}
              cta={
                <Link to="/properties" className="btn btn-primary btn-lg">
                  Explore Properties
                  <Icon n="arrow" size={18} />
                </Link>
              }
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
