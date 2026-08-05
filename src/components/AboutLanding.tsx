import React from 'react';
import SpinFlower from '@/components/ui/SpinFlower';
import Partners from '@/components/Partners';
import AuditCTA from '@/components/AuditCTA';
import { BASE } from '@/lib/site';

/**
 * The About page.
 *
 * Stripe's account review wants a page that says plainly what the company does
 * and who is behind it. The home page carries a short version of the first; this
 * carries both at length, and it is where the footer's "About" now points.
 *
 * Every claim here is one the site already makes elsewhere — the positioning
 * from the home About section and the four-part method from Our Approach. An
 * about page is exactly the wrong place to introduce a founding date, a client
 * count or a headcount that nobody has confirmed.
 */

/** The method, in the same four parts as the home page's Our Approach. */
const WORK = [
  {
    n: '01',
    title: 'Expert content',
    copy: 'Deeply researched, original work built on real expertise and your own data — the content people cite and return to.',
  },
  {
    n: '02',
    title: 'Technical infrastructure',
    copy: 'A site search engines and AI can read, understand and cite, structured to answer the questions buyers actually ask.',
  },
  {
    n: '03',
    title: 'Distribution',
    copy: 'We carry the work to where buyers already research, so authority is met in the places that shape opinion.',
  },
  {
    n: '04',
    title: 'Coherence',
    copy: 'One narrative, one standard of quality, repeated across every channel and every month until it becomes reputation.',
  },
];

export default function AboutLanding() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white pt-32 pb-10 2xl:pt-40 2xl:pb-12">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center px-6 text-center">
          <h1 className="mb-6 max-w-2xl font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
            The agency for the way
            <br />
            buyers search now.
          </h1>
          <p className="mb-10 max-w-[52ch] text-base font-medium leading-relaxed text-gray-500">
            Thallo Digital is a marketing agency. We build the authority that makes a company the name search engines
            and AI models recommend first.
          </p>
          <SpinFlower alt="Thallo" className="block h-20 w-20 opacity-80" />
        </div>
      </section>

      {/* ── The story ─────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-16 2xl:py-24">
        <div className="mx-auto max-w-[760px] px-6">
          <div className="flex flex-col gap-6">
            <p className="text-lg font-medium leading-relaxed text-gray-700">
              Buyers used to compare a page of ten blue links. Now they ask a machine, and it answers with one
              recommendation. Whoever that answer names has already won the part of the sale that happens before anyone
              fills in a form.
            </p>
            <p className="text-base font-medium leading-relaxed text-gray-500">
              Thallo builds authority for companies in high-consideration industries — the categories where a buyer
              researches carefully before they ever make contact. We combine strong fundamentals with strategies tuned
              to how buyers research and decide today, so our clients stay the trusted answer no matter how the channels
              change.
            </p>
            <p className="text-base font-medium leading-relaxed text-gray-500">
              We are a senior team, deliberately small, focused on doing a few things exceptionally well. The people who
              scope your engagement are the people who do it. That is also why we publish{' '}
              <a
                href={`${BASE}/thallo-ai/`}
                className="font-semibold text-[#39471D] underline underline-offset-2"
              >
                our own measurement tool
              </a>{' '}
              and{' '}
              <a
                href={`${BASE}/thallo-ai/method/`}
                className="font-semibold text-[#39471D] underline underline-offset-2"
              >
                the method behind it
              </a>
              : the work should be checkable, not taken on trust.
            </p>
          </div>
        </div>
      </section>

      {/* ── What we actually do ───────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-gray-50/50 py-20 2xl:py-28">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-sans text-3xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-4xl">
              Authority isn&rsquo;t one thing. It&rsquo;s a few, grown well.
            </h2>
          </div>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2">
            {WORK.map((w) => (
              <div
                key={w.n}
                data-reveal
                className="rounded-3xl border border-gray-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#55672E]/40 hover:shadow-[0_24px_60px_-30px_rgba(57,71,29,0.25)]"
              >
                <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  {w.n}
                </span>
                <h3 className="mb-2.5 font-sans text-xl font-semibold tracking-tight text-gray-900">{w.title}</h3>
                <p className="text-[15px] font-medium leading-relaxed text-gray-500">{w.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who runs it ───────────────────────────────────────────────────── */}
      <Partners />

      <AuditCTA
        image={`${BASE}/cta-bg.webp`}
        heading="Start with the evidence."
        copy="An AI visibility audit shows how your category looks today, where the authority sits, and what it takes to move. Fixed scope, and a roadmap you keep either way."
      />
    </>
  );
}
