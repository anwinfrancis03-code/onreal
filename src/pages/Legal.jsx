import { Disclaimer, PageHead } from '../components/ui';

const COPY = {
  privacy: [
    [
      'What we store',
      'In this prototype, accounts, listings, favourites, enquiries and messages are stored only in your own browser (localStorage). ONREAL servers receive none of it.',
    ],
    [
      'Passwords',
      'Demo passwords are salted and hashed in your browser for demonstration. This is not a substitute for server-side authentication.',
    ],
    [
      'Your control',
      'You can edit or delete your listings, delete your demo account, or reset all demo data from Dashboard > Account Settings.',
    ],
    [
      'Contact details',
      'You choose whether your contact details are hidden, visible to logged-in users or public when you create a listing.',
    ],
  ],
  terms: [
    [
      'Prototype use',
      'ONREAL is a demonstration. Sample listings, prices, trends and scores are illustrative and not verified.',
    ],
    [
      'No advice',
      'Location insights are not financial, legal or valuation advice. Zoning, permissions, title and ownership must be verified independently.',
    ],
    [
      'Your listings',
      'You are responsible for the accuracy of anything you list. Do not post personal data you do not want stored in your browser.',
    ],
    ['No guarantees', 'Future appreciation scenarios are not predictions and returns are not guaranteed.'],
  ],
};

export function Legal({ kind }) {
  const priv = kind === 'privacy';
  return (
    <div className="wrap max-w-3xl pb-16 pt-8 sm:pt-10">
      <PageHead
        crumbs={[['Home', '/'], [priv ? 'Privacy Policy' : 'Terms and Conditions']]}
        eyebrow="Legal"
        title={priv ? 'Privacy Policy' : 'Terms and Conditions'}
      />
      <Disclaimer>
        Placeholder text for a prototype. It is not legal advice. A real launch needs policies reviewed by a
        qualified professional.
      </Disclaimer>
      <div className="mt-8 space-y-7">
        {COPY[kind].map(([h, t]) => (
          <section key={h}>
            <h2 className="mb-2 text-lg">{h}</h2>
            <p className="leading-relaxed text-muted">{t}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
