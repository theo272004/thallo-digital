'use client';

import React, { useRef, useState } from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';

/* Same arrangement as the contact form: with no endpoint set we fall back to a
   mailto so an enquiry is never silently swallowed. Fill this in and the fetch
   path takes over — see ContactLanding.tsx, which does the same thing. */
const FORM_ENDPOINT = '';
const INBOX = 'hello@thallo.co';

/* Compact versions of the contact form's field styles: this sits inside the
   closing CTA panel, not on a page of its own, so the vertical rhythm is
   tighter than ContactLanding's. Change both if the input style changes. */
const fieldCls =
  'w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-colors duration-200 focus:border-[#39471D] focus:ring-2 focus:ring-[#39471D]/15 hover:border-gray-300';
const labelCls =
  'block text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1.5';

type Status = 'idle' | 'sending' | 'sent' | 'mail' | 'error';

export default function PlanEnquiryForm({
  plans,
  activePlan,
}: {
  plans: string[];
  /* The plan the visitor is currently reading about, so the form opens with
     their place in the page already ticked rather than empty. */
  activePlan?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>('idle');

  /* null means the visitor has not touched the chips, so the selection simply
     mirrors the plan tab they were reading. The moment they pick one we hold
     their choice — derived rather than synced, so there is no effect racing
     the tabs above and overwriting them. */
  const [planChoice, setPlanChoice] = useState<string[] | null>(null);
  const selectedPlans = planChoice ?? (activePlan ? [activePlan] : []);

  const togglePlan = (value: string) =>
    setPlanChoice(
      selectedPlans.includes(value)
        ? selectedPlans.filter((v) => v !== value)
        : [...selectedPlans, value],
    );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    /* Honeypot. Deliberately not called website_url — this form has a real
       website field, and a bot filling the visible one is not spam. */
    if (data.get('referrer_url')) {
      setStatus('sent');
      return;
    }

    setStatus('sending');

    const payload = {
      name: String(data.get('name') ?? ''),
      company: String(data.get('company') ?? ''),
      email: String(data.get('email') ?? ''),
      website: String(data.get('website') ?? ''),
      message: String(data.get('message') ?? ''),
      plans: selectedPlans,
    };

    const lines = [
      `Name: ${payload.name}`,
      `Business: ${payload.company || '—'}`,
      `Email: ${payload.email}`,
      `Website: ${payload.website || '—'}`,
      `Plans of interest: ${payload.plans.length ? payload.plans.join(', ') : '—'}`,
      '',
      payload.message,
    ].join('\n');

    if (!FORM_ENDPOINT) {
      const subject = `Plan enquiry — ${payload.company || payload.name}`;
      window.location.href =
        `mailto:${INBOX}?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(lines)}`;
      setStatus('mail');
      return;
    }

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...payload, page: window.location.href }),
      });
      if (!res.ok) throw new Error('bad response');
      form.reset();
      setPlanChoice(null);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const done = status === 'sent' || status === 'mail';

  if (done) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl bg-white p-6 shadow-[0_24px_60px_-30px_rgba(23,26,16,0.6)] text-center"
      >
        <p className="text-lg font-bold tracking-tight text-gray-900 mb-2">
          {status === 'mail' ? 'Your email is ready to send.' : 'Thank you — that reached us.'}
        </p>
        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-5">
          {status === 'mail'
            ? 'We opened a draft in your mail app with your selection filled in.'
            : 'We read every enquiry ourselves and will reply within one working day.'}
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-xs font-bold text-[#39471D] underline underline-offset-4"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-2xl bg-white p-6 shadow-[0_24px_60px_-30px_rgba(23,26,16,0.6)]"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#55672E] mb-4">
        Tell us where you stand
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className={labelCls} htmlFor="pe-name">Name</label>
          <input id="pe-name" name="name" type="text" required className={fieldCls} placeholder="Your name" />
        </div>
        <div>
          <label className={labelCls} htmlFor="pe-company">Business</label>
          <input id="pe-company" name="company" type="text" className={fieldCls} placeholder="Company" />
        </div>
        <div>
          <label className={labelCls} htmlFor="pe-email">Email</label>
          <input id="pe-email" name="email" type="email" required className={fieldCls} placeholder="you@company.com" />
        </div>
        <div>
          <label className={labelCls} htmlFor="pe-website">Website</label>
          <input id="pe-website" name="website" type="text" className={fieldCls} placeholder="company.com" />
        </div>
      </div>

      <fieldset className="mb-3">
        <legend className={labelCls}>Plan of interest</legend>
        <div className="flex flex-wrap gap-2">
          {plans.map((plan) => {
            const on = selectedPlans.includes(plan);
            return (
              <label
                key={plan}
                className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                  on
                    ? 'border-[#39471D] bg-[#39471D] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => togglePlan(plan)}
                  className="sr-only"
                />
                {plan}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mb-4">
        <label className={labelCls} htmlFor="pe-message">What are you trying to achieve?</label>
        <textarea
          id="pe-message"
          name="message"
          rows={3}
          required
          className={fieldCls}
          placeholder="Where you are today, and what winning would look like."
        />
      </div>

      <input
        type="text"
        name="referrer_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#39471D] border border-[#39471D] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#55672E] hover:border-[#55672E] disabled:opacity-60"
      >
        {status === 'sending' ? 'Sending…' : <>Book your audit <ArrowUpRight className="ml-0.5" /></>}
      </button>

      {status === 'error' && (
        <p role="alert" className="mt-3 text-xs font-medium" style={{ color: '#8A2B12' }}>
          That did not go through. Please email{' '}
          <a className="underline" href={`mailto:${INBOX}`}>{INBOX}</a>.
        </p>
      )}
    </form>
  );
}
