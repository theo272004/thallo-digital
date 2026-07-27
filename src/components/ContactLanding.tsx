'use client';

import React, { useRef, useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal, Magnetic, useRevealBatch } from '@/components/motion';

/**
 * Where the form posts. The site is a static export (GitHub Pages), so there is
 * no server of our own — point this at a form backend that accepts a JSON POST
 * (Formspree, Basin, Formsubmit…), e.g. 'https://formspree.io/f/abcdwxyz'.
 * Left empty, the form falls back to opening the visitor's mail client with
 * every field pre-filled, so an enquiry is never silently dropped.
 */
const FORM_ENDPOINT = '';

const INBOX = 'hello@thallo.co';

type Status = 'idle' | 'sending' | 'sent' | 'mail' | 'error';

/* Shared input system — hairline borders, generous padding, olive focus ring. */
const fieldCls =
  'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 ' +
  'placeholder:text-gray-400 outline-none transition-colors duration-200 ' +
  'focus:border-[#39471D] focus:ring-2 focus:ring-[#39471D]/15 hover:border-gray-300';

const labelCls = 'block text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-2';

/* The promise, stated up front on the photograph — the three things a visitor
   actually wants to know before writing to a stranger. */
const PROMISES = [
  'Reply within one business day',
  'A founder reads it, not a queue',
  'No sequences, no sales floor',
];

const STEPS: [string, string, string][] = [
  ['01', 'We read it', 'Your message goes to the people who do the work, not to a CRM.'],
  ['02', 'We look first', 'Before replying we check how AI assistants describe you today.'],
  ['03', 'We reply with substance', 'Findings and a straight answer on whether we are a fit.'],
];

const ROUTES = [
  {
    href: '/thallo-digital/thallo-ai/',
    label: 'Visibility Check',
    copy: 'Walk through the report we run for clients.',
  },
  {
    href: '/thallo-digital/services/',
    label: 'Services',
    copy: 'The audit, the engine, and the flagship work.',
  },
  {
    href: '/thallo-digital/results/',
    label: 'Results',
    copy: 'What the work looked like for a real client.',
  },
];

export default function ContactLanding() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>('idle');

  // The page owns no other reveal batch — run it here so [data-reveal] animates.
  useRevealBatch('contact');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot: bots fill every field they find. Fake success, send nothing.
    if (data.get('website_url')) {
      setStatus('sent');
      return;
    }

    const payload = {
      name: String(data.get('name') || ''),
      company: String(data.get('company') || ''),
      email: String(data.get('email') || ''),
      message: String(data.get('message') || ''),
    };

    if (!FORM_ENDPOINT) {
      // No backend configured — hand the enquiry to the visitor's mail client.
      const body = [
        `Name: ${payload.name}`,
        `Business: ${payload.company || '—'}`,
        `Email: ${payload.email}`,
        '',
        payload.message,
      ].join('\n');
      window.location.href =
        `mailto:${INBOX}` +
        `?subject=${encodeURIComponent(`New enquiry — ${payload.company || payload.name}`)}` +
        `&body=${encodeURIComponent(body)}`;
      setStatus('mail');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...payload, page: typeof window !== 'undefined' ? window.location.href : '' }),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const done = status === 'sent' || status === 'mail';

  return (
    <>
      {/* ── Hero — the photograph runs full-bleed and carries the page ─────── */}
      <section className="relative isolate overflow-hidden">
        <img
          src="/thallo-digital/contact-bg.webp"
          alt=""
          aria-hidden="true"
          width={2048}
          height={1152}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-10 h-full w-full object-cover object-center select-none pointer-events-none"
        />
        {/* Gradient scrim, heaviest at the foot — the type sits on the dark end
            while the top of the frame keeps the daylight of the photograph. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-b from-[#171a10]/55 via-[#171a10]/40 to-[#171a10]/80"
        />

        <div className="max-w-[1440px] mx-auto px-6 lg:px-14 pt-40 pb-44 lg:pt-52 lg:pb-56">
          <Eyebrow tone="light" className="mb-6">Contact</Eyebrow>
          <SplitReveal
            as="h1"
            scroll={false}
            fade={false}
            className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-7 font-sans text-balance max-w-[20ch]"
            html="Tell us where you want to be found."
          />
          <p className="text-[#CBD0AC] font-medium text-base sm:text-lg leading-relaxed max-w-[52ch]">
            One conversation is enough to know how AI describes your business today —
            and what it takes to become the answer it gives first. Whoever your
            customer is.
          </p>

          <ul className="mt-12 flex flex-col sm:flex-row sm:flex-wrap gap-x-10 gap-y-4">
            {PROMISES.map((p) => (
              <li key={p} className="flex items-center gap-3">
                <span className="h-px w-6 bg-white/40" aria-hidden="true" />
                <span className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-white/80">
                  {p}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── The card rises into the photograph ────────────────────────────── */}
      <section className="bg-white pb-24 lg:pb-32">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
          <div
            className="relative -mt-24 lg:-mt-32 mx-auto max-w-[1180px] rounded-[32px] bg-white
                       p-8 sm:p-12 lg:p-16 shadow-[0_50px_120px_-40px_rgba(23,26,16,0.55)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1fr] gap-12 lg:gap-20 items-start">

              {/* ── Left — the direct line, then what actually happens ─────── */}
              <div className="lg:pt-2">
                <p className="text-[11px] font-mono tracking-wider uppercase text-gray-400 mb-2">
                  Write to us directly
                </p>
                <a
                  href={`mailto:${INBOX}`}
                  className="text-xl sm:text-2xl font-bold text-gray-900 hover:text-[#39471D] transition-colors break-words"
                >
                  {INBOX}
                </a>

                <div className="my-9 h-px w-full max-w-[280px] bg-gray-100" />

                <h2 className="text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-6">
                  What happens next
                </h2>
                <ol className="flex flex-col gap-6">
                  {STEPS.map(([n, title, copy]) => (
                    <li key={n} className="flex gap-4 items-start">
                      <span
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                        style={{ backgroundColor: '#E7ECD9', color: '#39471D' }}
                      >
                        {n}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-gray-900 mb-1">{title}</p>
                        <p className="text-sm text-gray-500 leading-relaxed">{copy}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              {/* ── Right — the form ──────────────────────────────────────── */}
              <div>
                {done ? (
                  <div className="py-8" role="status" aria-live="polite">
                    <span
                      className="mb-6 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                      style={{ backgroundColor: '#E7ECD9', color: '#39471D' }}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {status === 'mail' ? 'Your email is ready to send.' : 'Thanks — message received.'}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-[44ch]">
                      {status === 'mail' ? (
                        <>
                          We opened your mail app with everything filled in. If nothing happened,
                          write to <span className="font-semibold text-gray-900">{INBOX}</span> and
                          we&apos;ll take it from there.
                        </>
                      ) : (
                        <>We read every enquiry ourselves and reply within one business day.</>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus('idle')}
                      className="mt-8 min-h-[44px] text-[11px] font-mono font-bold tracking-wider uppercase text-[#55672E] hover:text-[#39471D] transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form ref={formRef} onSubmit={onSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className={labelCls} htmlFor="c-name">Name</label>
                        <input
                          id="c-name" name="name" type="text" required autoComplete="name"
                          placeholder="Your full name" className={fieldCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls} htmlFor="c-company">
                          Business <span className="text-gray-400 font-semibold normal-case tracking-normal">(optional)</span>
                        </label>
                        <input
                          id="c-company" name="company" type="text" autoComplete="organization"
                          placeholder="Business or brand name" className={fieldCls}
                        />
                      </div>
                    </div>

                    <div className="mt-5">
                      <label className={labelCls} htmlFor="c-email">Email</label>
                      <input
                        id="c-email" name="email" type="email" required autoComplete="email"
                        placeholder="you@yourbusiness.com" className={fieldCls}
                      />
                    </div>

                    <div className="mt-5">
                      <label className={labelCls} htmlFor="c-message">How can we help?</label>
                      <textarea
                        id="c-message" name="message" rows={5} required
                        placeholder="What do you want to be found for, and who are you trying to reach?"
                        className={`${fieldCls} resize-y min-h-[140px]`}
                      />
                    </div>

                    {/* Honeypot — hidden from people, irresistible to bots */}
                    <input
                      type="text" name="website_url" tabIndex={-1} autoComplete="off"
                      aria-hidden="true" className="hidden"
                    />

                    <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-5">
                      <Magnetic>
                        <button
                          type="submit"
                          disabled={status === 'sending'}
                          className="w-full sm:w-auto shrink-0 whitespace-nowrap px-8 py-4 bg-[#39471D] border border-[#39471D] rounded-full text-sm font-semibold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {status === 'sending' ? 'Sending…' : 'Send message ↗'}
                        </button>
                      </Magnetic>
                      <p className="text-xs text-gray-400 font-semibold leading-relaxed max-w-[32ch]">
                        We reply within one business day. No sequences, no sales floor.
                      </p>
                    </div>

                    {status === 'error' && (
                      <p className="mt-5 text-sm font-semibold text-[#8A2B12]" role="alert">
                        Something went wrong on our side. Write to{' '}
                        <a href={`mailto:${INBOX}`} className="underline">{INBOX}</a> and we&apos;ll pick it up.
                      </p>
                    )}
                  </form>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── For visitors who are not ready to write yet ────────────────────── */}
      <section className="bg-white pb-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
          <div className="flex flex-col items-center text-center mb-12">
            <img
              loading="lazy"
              decoding="async"
              src="/thallo-digital/flower.webp"
              alt="Thallo"
              className="w-16 h-16 object-contain opacity-80 thallo-spin mb-8"
            />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans text-balance">
              Not ready to write yet?
            </h2>
            <p className="mt-5 text-gray-500 font-medium text-base leading-relaxed max-w-[46ch]">
              Look around first. Everything below explains the work before you
              ever have to speak to us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ROUTES.map((r) => (
              <a
                key={r.href}
                href={r.href}
                data-reveal
                className="group rounded-[28px] border border-gray-100 bg-white p-8 transition-all duration-300
                           hover:border-[#39471D]/25 hover:shadow-[0_28px_60px_-40px_rgba(57,71,29,0.5)]"
              >
                <p className="text-lg font-bold text-gray-900 mb-2">{r.label}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{r.copy}</p>
                <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#55672E] group-hover:text-[#39471D] transition-colors">
                  Open ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
