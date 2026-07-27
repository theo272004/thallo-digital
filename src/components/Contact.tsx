'use client';

import React, { useRef, useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal, Magnetic } from '@/components/motion';

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

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>('idle');

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
    <section className="relative isolate overflow-hidden" id="contact">
      {/* ── Cinematic backdrop — the photograph carries the whole section ─── */}
      <img
        src="/thallo-digital/contact-bg.webp"
        alt=""
        aria-hidden="true"
        width={2048}
        height={1152}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 -z-10 h-full w-full object-cover object-center select-none pointer-events-none"
      />
      {/* Light scrim — enough to seat the card, not enough to flatten the light */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#171a10]/35" />

      {/* Extra side padding from lg up so the photograph always reads as the
          backdrop instead of a hairline frame around an almost-full-bleed card. */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-14 py-20 sm:py-28 lg:py-36">
        {/* ── Floating editorial card ──────────────────────────────────────── */}
        <div
          data-reveal
          className="mx-auto max-w-[1180px] rounded-[32px] bg-white p-8 sm:p-12 lg:p-16
                     shadow-[0_50px_120px_-40px_rgba(23,26,16,0.55)]"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1fr] gap-12 lg:gap-20 items-start">

            {/* ── Left — the invitation ────────────────────────────────────── */}
            <div className="lg:pt-2">
              <Eyebrow className="mb-6">Contact</Eyebrow>
              <SplitReveal
                as="h2"
                className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans text-balance"
                html="Tell us where you want to be found."
              />
              <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[42ch]">
                One conversation is enough to know how AI describes your business today —
                and what it takes to become the answer it gives first. Whoever your
                customer is.
              </p>

              <div className="mt-10 h-px w-full max-w-[280px] bg-gray-100" />

              <p className="mt-6 text-[11px] font-mono tracking-wider uppercase text-gray-400 mb-2">
                Or write to us directly
              </p>
              <a
                href={`mailto:${INBOX}`}
                className="text-base font-bold text-gray-900 hover:text-[#39471D] transition-colors break-words"
              >
                {INBOX}
              </a>
            </div>

            {/* ── Right — the form ─────────────────────────────────────────── */}
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
  );
}
