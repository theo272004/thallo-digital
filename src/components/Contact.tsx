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

const INTERESTS = [
  'AI Visibility Audit',
  'Authority Engine',
  'Flagship Project',
  'Not sure yet',
] as const;

type Status = 'idle' | 'sending' | 'sent' | 'mail' | 'error';

const fieldCls =
  'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-900 ' +
  'placeholder:text-gray-400 outline-none transition-colors duration-200 ' +
  'focus:border-[#39471D] focus:ring-2 focus:ring-[#39471D]/15 hover:border-gray-300';

const labelCls =
  'block text-[11px] font-bold text-gray-900 tracking-wider uppercase mb-2';

export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null);
  const [interest, setInterest] = useState<string>(INTERESTS[0]);
  const [status, setStatus] = useState<Status>('idle');
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(INBOX);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the address is visible on screen anyway */
    }
  };

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
      email: String(data.get('email') || ''),
      company: String(data.get('company') || ''),
      site: String(data.get('site') || ''),
      interest,
      message: String(data.get('message') || ''),
    };

    if (!FORM_ENDPOINT) {
      // No backend configured — hand the enquiry to the visitor's mail client.
      const body = [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        `Company: ${payload.company || '—'}`,
        `Website: ${payload.site || '—'}`,
        `Interested in: ${payload.interest}`,
        '',
        payload.message,
      ].join('\n');
      window.location.href =
        `mailto:${INBOX}` +
        `?subject=${encodeURIComponent(`${payload.interest} — ${payload.company || payload.name}`)}` +
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
      setInterest(INTERESTS[0]);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  const done = status === 'sent' || status === 'mail';

  return (
    <section className="bg-white py-28 border-b border-gray-100" id="contact">
      <div className="max-w-[1440px] mx-auto px-6 w-full">

        {/* ── Header — stacked: title, then copy ──────────────────────────── */}
        <div className="mb-14 max-w-[52ch]">
          <Eyebrow className="mb-5">Contact</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans text-balance"
            html="Tell us where you want to be found."
          />
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[48ch]">
            One conversation is enough to know where your brand stands in AI answers
            today, and what it takes to lead the category tomorrow.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-14 items-start">

          {/* ── Form ─────────────────────────────────────────────────────── */}
          <div
            data-reveal
            className="rounded-[28px] border border-gray-100 bg-white p-7 sm:p-10 shadow-[0_28px_60px_-40px_rgba(57,71,29,0.35)]"
          >
            {done ? (
              <div className="py-10 text-center" role="status" aria-live="polite">
                <span
                  className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full text-2xl"
                  style={{ backgroundColor: '#E7ECD9', color: '#39471D' }}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {status === 'mail' ? 'Your email is ready to send.' : 'Thanks — message received.'}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[42ch] mx-auto">
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
                  className="mt-8 text-[11px] font-mono font-bold tracking-wider uppercase text-[#55672E] hover:text-[#39471D] transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={onSubmit} noValidate={false}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls} htmlFor="c-name">Name</label>
                    <input
                      id="c-name" name="name" type="text" required autoComplete="name"
                      placeholder="Jane Ellis" className={fieldCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="c-email">Work email</label>
                    <input
                      id="c-email" name="email" type="email" required autoComplete="email"
                      placeholder="jane@company.com" className={fieldCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="c-company">Company</label>
                    <input
                      id="c-company" name="company" type="text" autoComplete="organization"
                      placeholder="Company name" className={fieldCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="c-site">Website</label>
                    <input
                      id="c-site" name="site" type="text" autoComplete="url"
                      placeholder="company.com" className={fieldCls}
                    />
                  </div>
                </div>

                {/* Interest — selectable chips, submitted with the payload */}
                <fieldset className="mt-7">
                  <legend className={labelCls}>What do you need?</legend>
                  <div className="flex flex-wrap gap-2.5">
                    {INTERESTS.map((item) => {
                      const active = interest === item;
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setInterest(item)}
                          aria-pressed={active}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                            active
                              ? 'border-[#39471D] bg-[#E7ECD9] text-[#39471D]'
                              : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-7">
                  <label className={labelCls} htmlFor="c-message">Message</label>
                  <textarea
                    id="c-message" name="message" rows={5} required
                    placeholder="What are you trying to be found for, and who's the buyer?"
                    className={`${fieldCls} resize-y min-h-[132px]`}
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
                      className="w-full sm:w-auto px-7 py-3.5 bg-[#39471D] border border-[#39471D] rounded-full text-sm font-semibold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'sending' ? 'Sending…' : 'Send message ↗'}
                    </button>
                  </Magnetic>
                  <p className="text-[11px] text-gray-400 font-semibold leading-relaxed max-w-[34ch]">
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

          {/* ── Direct contact + what happens next ───────────────────────── */}
          <div data-reveal className="rounded-[28px] p-7 sm:p-10 h-full" style={{ backgroundColor: '#39471D' }}>
            <Eyebrow tone="light" className="mb-6">Direct line</Eyebrow>

            <a
              href={`mailto:${INBOX}?subject=AI Visibility Audit Request`}
              className="block text-2xl sm:text-[28px] font-bold text-white tracking-tight hover:text-[#CBD0AC] transition-colors break-words"
            >
              {INBOX}
            </a>
            <button
              type="button"
              onClick={copyEmail}
              className="mt-4 rounded-full border border-white/25 px-4 py-2 text-[11px] font-mono font-bold tracking-wider uppercase text-white hover:bg-white/10 transition-colors"
            >
              {copied ? 'Copied ✓' : 'Copy address'}
            </button>

            <div className="my-9 h-px bg-white/15" />

            <h3 className="text-[11px] font-bold text-white tracking-wider uppercase mb-6">
              What happens next
            </h3>
            <ol className="flex flex-col gap-6">
              {[
                ['01', 'We read it', 'A founder reads your message, not a form queue.'],
                ['02', 'We look first', 'Before we reply we check how AI answers describe you today.'],
                ['03', 'We reply with substance', 'You get findings and a straight answer on fit, within a business day.'],
              ].map(([n, title, copy]) => (
                <li key={n} className="flex gap-4 items-start">
                  <span
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                    style={{ backgroundColor: '#E7ECD9', color: '#39471D' }}
                  >
                    {n}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white mb-1">{title}</p>
                    <p className="text-sm text-[#CBD0AC] leading-relaxed">{copy}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="my-9 h-px bg-white/15" />

            <p className="text-[11px] font-mono tracking-wider uppercase text-[#CBD0AC] mb-3">
              Rather see it yourself first?
            </p>
            <a
              href="/thallo-digital/thallo-ai/"
              className="inline-block rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Check my visibility ↗
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
