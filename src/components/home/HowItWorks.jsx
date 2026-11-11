import { Icon } from '../Icon';
import { Reveal } from '../Reveal';
import { SectionHead } from '../ui';

const STEPS = [
  [
    'user',
    'Register or discover',
    'Create a free demo account, or just browse listings by place, budget and purpose.',
  ],
  [
    'compass',
    'Explore property and location',
    'Open a listing to see photos, specifications, the map and nearby facilities.',
  ],
  [
    'target',
    'Evaluate the opportunity',
    'Check sample suitability scores, risks and price scenarios for your intended use.',
  ],
  [
    'mail',
    'Connect with the owner',
    'Send an enquiry or request a site visit, and deal directly with the owner.',
  ],
];

export function HowItWorks() {
  return (
    <section className="section bg-surface">
      <div className="wrap">
        <SectionHead
          center
          eyebrow="How ONREAL works"
          title="From first search to site visit in four steps"
        />
        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([ic, t, d], i) => (
            <Reveal key={t} delay={i * 80}>
              <li className="relative h-full rounded-2xl border border-line bg-bg p-6">
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-deep text-lime">
                    <Icon n={ic} size={20} />
                  </span>
                  <span className="text-4xl font-extrabold text-ink/10">0{i + 1}</span>
                </div>
                <h3 className="text-base">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
