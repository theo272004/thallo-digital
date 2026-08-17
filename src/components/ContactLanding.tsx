'use client';

import React, { useRef, useState } from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import SpinFlower from '@/components/ui/SpinFlower';
import PlanChips from '@/components/ui/PlanChips';
import ConsentCheck from '@/components/ui/ConsentCheck';
import { ENQUIRY_PLANS } from '@/components/AuditCTA';
import { SplitReveal, Magnetic, useRevealBatch } from '@/components/motion';
import { BASE } from '@/lib/site';
import { ENQUIRY_ENDPOINT, sendEnquiry } from '@/lib/scan/enquiry';

/**
 * Where the form posts: the WordPress plugin that already runs the scan, which
 * records the enquiry, tells us, and sends the person a note saying we have it.
 * See `lib/scan/enquiry.ts`. Unset at build time, the form falls back to opening
 * the visitor's mail client with every field pre-filled, so an enquiry is never
 * silently dropped.
 */
const FORM_ENDPOINT = ENQUIRY_ENDPOINT;

const INBOX = 'hello@thallo.co';

type Status = 'idle' | 'sending' | 'sent' | 'mail' | 'error';

/* Shared input system — hairline borders, generous padding, olive focus ring. */
const fieldCls =
  'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 ' +
  'placeholder:text-gray-400 outline-none transition-colors duration-200 ' +
  'focus:border-[#39471D] hover:border-gray-300';

const labelCls = 'block text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-2';

const ROUTES = [
  {
    href: `${BASE}/thallo-ai/`,
    label: 'Visibility Check',
    copy: 'Walk through the report we run for clients.',
  },
  {
    href: `${BASE}/services/`,
    label: 'Our Plans',
    copy: 'The audit, the engine, and the flagship work.',
  },
  {
    href: `${BASE}/results/`,
    label: 'Case Studies',
    copy: 'What the work looked like for a real client.',
  },
];

export default function ContactLanding() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);

  const togglePlan = (plan: string) =>
    setSelectedPlans((prev) =>
      prev.includes(plan) ? prev.filter((p) => p !== plan) : [...prev, plan],
    );

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
      plans: selectedPlans,
      /* The tick is required, so reaching here means it was given. Recorded
         with the enquiry rather than assumed, since consent you cannot show
         is not much use later. */
      consent: data.get('consent') === 'on',
    };

    if (!FORM_ENDPOINT) {
      // No backend configured — hand the enquiry to the visitor's mail client.
      const body = [
        `Name: ${payload.name}`,
        `Business: ${payload.company || '—'}`,
        `Email: ${payload.email}`,
        `Plans of interest: ${payload.plans.length ? payload.plans.join(', ') : '—'}`,
        `Consent given: ${payload.consent ? 'yes' : 'no'}`,
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
      await sendEnquiry({
        ...payload,
        page: typeof window !== 'undefined' ? window.location.href : '',
      });
      form.reset();
      setSelectedPlans([]);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const done = status === 'sent' || status === 'mail';

  return (
    <>
      {/* ── The photograph, pinned. It gets its own layer rather than wrapping
             the card, because a pinned section pins everything inside it — the
             card would hold still too and the white would swallow it. Here the
             picture stays put and the card scrolls up off the top, over it.
             The negative margin takes the layer back out of the flow, so what
             follows starts at the top of the page and lies on the photo. ──── */}
      <div
        aria-hidden="true"
        className="sticky top-0 z-0 h-[100svh] -mb-[100svh] overflow-hidden pointer-events-none"
      >
        <img
          src={`${BASE}/contact-bg.webp`}
          alt=""
          width={2048}
          height={1152}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center select-none"
        />
        {/* Light scrim — enough to seat the card, not enough to flatten the light */}
        <div className="absolute inset-0 bg-[#171A10]/35" />
      </div>

      {/* One screen of photograph before the white arrives; the card rides on
          top of everything so it never passes behind the section below. */}
      <section className="relative z-20 flex min-h-[100svh] flex-col">
        {/* Extra side padding from lg up so the photograph always reads as the
            backdrop instead of a hairline frame around an almost-full-bleed card.

            my-auto rather than a fixed top padding: it splits the leftover
            screen evenly above and below, so the card sits centred instead of
            riding high. Auto margins collapse to nothing when there is no
            leftover — which is the case on a phone, where the card is taller
            than the screen — so it degrades to top-aligned rather than
            centring the top of the card off the top of the page. */}
        {/* The card lines up with the navbar above it. Both sit in the same
            `max-w-[1440px]` container — which the laptop rule in globals.css
            narrows to 90vw — so matching them is a matter of the card taking
            that container whole: no `lg:px-14` on the wrapper, no 1180 cap on
            the card. That was 58px a side, which is what showed as the
            misalignment. `px-6` stays below `lg`, where a card running to the
            screen edge would have no gutter at all. */}
        {/* `lg:pt-28 lg:pb-16` rather than a flat `lg:py-16`. `my-auto` centres
            the card in this box, and the navbar floating over the top of the
            screen means dead centre reads high — the eye measures from under
            the bar, not from the top of the page. The extra 48px above splits
            in half and nudges the card down 24px, which is the amount that
            looks centred rather than the amount that is. */}
        <div className="my-auto w-full max-w-[1440px] mx-auto px-6 lg:px-0 pt-32 pb-20 sm:pt-36 sm:pb-24 lg:pt-28 lg:pb-16">
          {/* ── Floating editorial card ──────────────────────────────────────── */}
          <div
            data-reveal
            className="mx-auto rounded-[32px] bg-white p-8 sm:p-12 lg:p-16
                       shadow-[0_50px_120px_-40px_rgba(23,26,16,0.55)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1fr] gap-12 lg:gap-20 items-start">

              {/* ── Left — the invitation ────────────────────────────────────── */}
              <div className="lg:pt-2">
                <SplitReveal
                  as="h1"
                  className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans text-balance"
                  html="Tell us where you want to be found."
                />
                <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[42ch]">
                  One conversation is enough to know how AI describes your business today —
                  and what it takes to become the answer it gives first. Whoever your
                  customer is.
                </p>

                <div className="mt-10 h-px w-full max-w-[280px] bg-gray-100" />

                <p className="mt-6 text-[11px] tracking-wider uppercase text-gray-400 mb-2">
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
                    {/* Outlined rather than filled — the sage fill it wore is
                        out of use, and a ring reads as a mark of completion as
                        well as a disc does. */}
                    <span
                      className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#39471D] text-2xl text-[#39471D]"
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {status === 'mail' ? 'Your email is ready to send.' : 'Thanks — message received.'}
                    </h2>
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
                      className="mt-8 min-h-[44px] text-[11px] font-bold tracking-wider uppercase text-[#55672E] hover:text-[#39471D] transition-colors"
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

                    {/* The same field the enquiry form in the closing panels
                        carries, so an enquiry arriving here is not missing what
                        one arriving from a plans page would have. */}
                    <div className="mt-5">
                      <PlanChips
                        plans={ENQUIRY_PLANS}
                        selected={selectedPlans}
                        onToggle={togglePlan}
                        labelClassName={labelCls}
                      />
                    </div>

                    {/* Honeypot — hidden from people, irresistible to bots */}
                    <input
                      type="text" name="website_url" tabIndex={-1} autoComplete="off"
                      aria-hidden="true" className="hidden"
                    />

                    <div className="mt-6">
                      <ConsentCheck id="c-consent" />
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-5">
                      <Magnetic>
                        <button
                          type="submit"
                          disabled={status === 'sending'}
                          className="w-full sm:w-auto shrink-0 whitespace-nowrap px-8 py-4 bg-[#39471D] border border-[#39471D] rounded-full text-sm font-semibold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {status === 'sending' ? 'Sending…' : <>Send message <ArrowUpRight className="ml-0.5" /></>}
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

      {/* ── For visitors who are not ready to write yet. Sits above the pinned
             photograph, so scrolling slides it up over the picture. ───────── */}
      <section className="relative z-10 bg-white py-24 lg:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-14">
          <div className="flex flex-col items-center text-center mb-12">
            <SpinFlower alt="Thallo" className="block w-16 h-16 opacity-80 mb-8" />
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
                className="group rounded-[28px] border border-gray-200 bg-white p-8 transition-all duration-300
                           shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)]
                           lift"
              >
                <p className="text-lg font-bold text-gray-900 mb-2">{r.label}</p>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">{r.copy}</p>
                <span className="text-[11px] font-bold tracking-wider uppercase text-[#55672E] group-hover:text-[#39471D] transition-colors">
                  Open <ArrowUpRight className="ml-0.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
