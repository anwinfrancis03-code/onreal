import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Field, PageHead } from '../components/ui';
import { Icon } from '../components/Icon';
import { validEmail } from '../utils/validation';

export function Contact() {
  const A = useApp();
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' });
  const [err, setErr] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!f.name.trim()) er.name = 'Please enter your name.';
    if (!validEmail(f.email.trim())) er.email = 'Enter a valid email address.';
    if (f.subject.trim().length < 3) er.subject = 'Add a short subject.';
    if (f.message.trim().length < 10) er.message = 'Message must be at least 10 characters.';
    setErr(er);
    if (Object.keys(er).length) return;
    A.addMessage(f);
    setSent(true);
    A.toast('Message saved in this demo. It was not emailed.', 'info');
  };
  return (
    <div className="wrap pb-16 pt-8 sm:pt-10">
      <PageHead
        crumbs={[['Home', '/'], ['Contact']]}
        eyebrow="Contact"
        title="Talk to the ONREAL team"
        sub="Questions about listing, buying or the platform? Send us a note."
      />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {sent ? (
          <div className="card card-pad py-12 text-center">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand text-white">
              <Icon n="check" size={28} />
            </span>
            <h2 className="text-xl">Thanks, {f.name.split(' ')[0]}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Your message was saved in this browser as a demo. No email was sent because this prototype has
              no email service or backend connected.
            </p>
            <button
              className="btn btn-outline mt-6"
              onClick={() => {
                setSent(false);
                setF({ name: '', email: '', subject: '', message: '' });
              }}
            >
              Send another
            </button>
          </div>
        ) : (
          <form className="card card-pad space-y-5 sm:p-8" onSubmit={submit} noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" id="c-n" error={err.name}>
                <input className="input" value={f.name} onChange={set('name')} autoComplete="name" />
              </Field>
              <Field label="Email" id="c-e" error={err.email}>
                <input
                  className="input"
                  type="email"
                  value={f.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
              </Field>
            </div>
            <Field label="Subject" id="c-s" error={err.subject}>
              <input className="input" value={f.subject} onChange={set('subject')} />
            </Field>
            <Field label="Message" id="c-m" error={err.message}>
              <textarea className="input min-h-[150px]" value={f.message} onChange={set('message')} />
            </Field>
            <button className="btn btn-primary btn-lg" type="submit">
              Send message
            </button>
          </form>
        )}
        <div className="card card-pad h-fit">
          <h2 className="mb-4 text-lg">Other ways to reach us</h2>
          <ul className="space-y-4 text-sm">
            {[
              ['mail', 'hello@onreal.example (placeholder address)'],
              ['pin', 'Thrissur, Kerala, India (prototype location)'],
              ['info', 'This is a demo build. No real inbox is monitored.'],
            ].map(([ic, t]) => (
              <li key={t} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-text">
                  <Icon n={ic} size={17} />
                </span>
                <span className="pt-1.5">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
