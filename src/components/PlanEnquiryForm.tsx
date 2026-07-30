'use client';

import React, { useRef, useState } from 'react';
import { Magnetic } from '@/components/motion';
import ArrowUpRight from '@/components/ui/ArrowUpRight';

/* Same arrangement as the contact form: with no endpoint set we fall back to a
   mailto so an enquiry is never silently swallowed. Fill this in and the fetch
   path takes over — see ContactLanding.tsx, which does the same thing. */
const FORM_ENDPOINT = '';
const INBOX = 'hello@thallo.co';

/* Duplicated from ContactLanding rather than imported: those consts are
   module-scoped there, and the codebase already repeats this recipe in
   VisibilityCheck. Change both if the input style changes. */
const fieldCls =
  'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none transition-colors duration-200 focus:border-[#39471D] focus:ring-2 focus:ring-[#39471D]/15 hover:border-gray-300';
const labelCls =
  'block text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-2';

type Status = 'idle' | 'sending' | 'sent' | 'mail' | 'error';

export default function PlanEnquiryForm({
  plans,
  extras,
  activePlan,
}: {
  plans: string[];
  extras: string[];
  /* The plan the visitor is currently reading about, so the form opens with
     their place in the page already ticked rather than empty. */
  activePlan?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);

  /* null means the visitor has not touched the boxes, so the selection simply
     mirrors the plan tab they are reading. The moment they tick anything we
     hold their choice — derived rather than synced, so there is no effect
     racing the tab above and overwriting them. */
  const [planChoice, setPlanChoice] = useState<string[] | null>(null);
  const selectedPlans = planChoice ?? (activePlan ? [activePlan] : []);

  const togglePlan = (value: string) =>
    setPlanChoice(
      selectedPlans.includes(value)
        ? selectedPlans.filter((v) => v !== value)
        : [...selectedPlans, value],
    );

  const toggleExtra = (value: string) =>
    setSelectedExtras((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
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
      additionalProjects: selectedExtras,
    };

    const lines = [
      `Name: ${payload.name}`,
      `Business: ${payload.company || '—'}`,
      `Email: ${payload.email}`,
      `Website: ${payload.website || '—'}`,
      `Plans of interest: ${payload.plans.length ? payload.plans.join(', ') : '—'}`,
      `Additional projects: ${
        payload.additionalProjects.length
          ? payload.additionalProjects.join(', ')
          : '—'
      }`,
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
      setSelectedExtras([]);
      setPlanChoice(null);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const done = status === 'sent' || status === 'mail';

  const checkboxCls =
    'flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors cursor-pointer';

  if (done) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-[32px] bg-white border border-gray-100 p-8 sm:p-12 text-center"
      >
        <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-3">
          {status === 'mail' ? 'Your email is ready to send.' : 'Thank you — that reached us.'}
        </h3>
        <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[44ch] mx-auto mb-8">
          {status === 'mail'
            ? 'We opened a draft in your mail app with your selection filled in. Send it and we will reply within one working day.'
            : 'We read every enquiry ourselves and will reply within one working day.'}
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-xs font-bold text-[#39471D] underline underline-offset-4"
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="rounded-[32px] bg-white border border-gray-100 p-8 sm:p-12 shadow-[0_40px_100px_-50px_rgba(23,26,16,0.35)]"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label className={labelCls} htmlFor="pe-name">Name</label>
          <input id="pe-name" name="name" type="text" required className={fieldCls} placeholder="Your name" />
        </div>
        <div>
          <label className={labelCls} htmlFor="pe-company">Business</label>
          <input id="pe-company" name="company" type="text" className={fieldCls} placeholder="Company name" />
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

      <fieldset className="mb-5">
        <legend className={labelCls}>Plans you are considering</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {plans.map((plan) => {
            const on = selectedPlans.includes(plan);
            return (
              <label
                key={plan}
                className={`${checkboxCls} ${
                  on
                    ? 'border-[#39471D] bg-[#39471D]/[0.06] text-[#39471D]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => togglePlan(plan)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#39471D]"
                />
                {plan}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mb-5">
        <legend className={labelCls}>Additional projects (optional)</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {extras.map((extra) => {
            const on = selectedExtras.includes(extra);
            return (
              <label
                key={extra}
                className={`${checkboxCls} ${
                  on
                    ? 'border-[#39471D] bg-[#39471D]/[0.06] text-[#39471D]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggleExtra(extra)}
                  className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#39471D]"
                />
                {extra}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mb-6">
        <label className={labelCls} htmlFor="pe-message">What are you trying to achieve?</label>
        <textarea
          id="pe-message"
          name="message"
          rows={5}
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

      <Magnetic>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#39471D] border border-[#39471D] rounded-full text-sm font-semibold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : <>Send enquiry <ArrowUpRight className="ml-0.5" /></>}
        </button>
      </Magnetic>

      {status === 'error' && (
        <p role="alert" className="mt-4 text-sm font-medium" style={{ color: '#8A2B12' }}>
          That did not go through. Please email us directly at{' '}
          <a className="underline" href={`mailto:${INBOX}`}>{INBOX}</a>.
        </p>
      )}
    </form>
  );
}
