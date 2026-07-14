'use client';

import React, { useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';

// ─── Data ───────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    idx: '01',
    kicker: 'Entry point',
    title: 'AI Visibility Audit',
    desc: 'See exactly where you show up when buyers ask AI, where competitors beat you, and what it takes to lead.',
    deliverables: [
      'Visibility benchmark vs. rivals',
      'Share-of-answer scoring',
      'Technical readiness review',
      'Content & authority gaps',
      'Prioritized 90-day roadmap',
      'Competitor teardown',
    ],
    price: 'One-time · no lock-in',
    featured: false,
  },
  {
    idx: '02',
    kicker: 'Core program',
    title: 'The Authority Engine',
    desc: 'Our monthly engine that builds, publishes, and compounds authority across search and AI, so you keep winning the research phase.',
    deliverables: [
      'Deeply researched content',
      'Technical AI-readiness build',
      'Search & AI visibility',
      'Distribution to buyer channels',
      'Consistent brand narrative',
      'Monthly outcome reporting',
    ],
    price: 'Ongoing · monthly partnership',
    featured: true,
  },
  {
    idx: '03',
    kicker: 'Accelerate',
    title: 'Flagship Projects',
    desc: 'High-value assets that earn citations and put you on the map — as a standalone project or layered onto your engine.',
    deliverables: [
      'Proprietary data studies',
      'Industry reports',
      'Digital PR & podcasts',
      'Interactive tools',
      'Signature research',
      'Launch strategy',
    ],
    price: 'Per project · scoped to you',
    featured: false,
  },
];

const PROCESS = [
  { idx: '01', period: 'Week 1–3',       title: 'Audit & diagnosis',    desc: 'We benchmark where you show up across Google and AI, score your share of answer, and hand you a prioritized roadmap.' },
  { idx: '02', period: 'Month 1',         title: 'Foundation',           desc: 'We rebuild the technical infrastructure so search engines and AI can read, understand, and cite you, plus your first authority piece.' },
  { idx: '03', period: 'Month 2 onward',  title: 'The Authority Engine', desc: 'Original content, distribution, and visibility work, published and compounded every month, with reporting on real outcomes.' },
  { idx: '04', period: 'When you\'re ready', title: 'Accelerate',        desc: 'Flagship projects, proprietary studies, digital PR, and interactive tools that put you on the map for good.' },
];

const COMPARE = [
  { feature: 'AI visibility benchmark',      audit: true,  engine: true,       flagship: false },
  { feature: 'Technical AI-readiness build', audit: false, engine: true,       flagship: false },
  { feature: 'Original, researched content', audit: false, engine: 'Monthly',  flagship: 'Deep' },
  { feature: 'Distribution & publishing',    audit: false, engine: true,       flagship: false },
  { feature: 'Proprietary data studies',     audit: false, engine: false,      flagship: true },
  { feature: 'Digital PR & podcasts',        audit: false, engine: false,      flagship: true },
  { feature: 'Monthly outcome reporting',    audit: false, engine: true,       flagship: false },
  { feature: 'Best for',                     audit: 'Getting clarity', engine: 'Compounding growth', flagship: 'Big moves' },
];

const FAQS = [
  { q: 'What if AI says something wrong about us?',               a: 'It happens, and there\'s no edit button. No AI company lets you log in and correct it. What you can do is make the accurate version of your story the strongest, most consistent signal across the places AI reads, so the correct answer becomes the one it repeats. Getting that right is a large part of our work, and it\'s why precision matters to us more than volume.' },
  { q: 'Can you prove it\'s working?',                            a: 'Yes, with honesty about what\'s measurable and what isn\'t. We track how often you appear in AI answers for the questions your buyers ask, the sources citing you, and the pipeline your presence influences. What no one can promise is perfect click-by-click attribution; AI search is newer and messier than Google. We report the real signals, not a vanity dashboard, and we\'re straight about the limits.' },
  { q: 'Will this bring us more customers?',                      a: 'We build the preference, visibility, and pipeline that make you far more likely to win, and keep you on the shortlist. What we won\'t do is promise a fixed number of sales. In a long, multi-person buying decision, anyone who does is guessing.' },
  { q: 'How fast will we see results?',                           a: 'Faster than old-school SEO. Because AI reads and cites fresh content in real time, early movement — first mentions and first citations — can show up within weeks, not the long months traditional search used to demand. The deeper, compounding authority builds from there.' },
  { q: 'Where do we start, and how much do we have to commit?',  a: 'You start small. Almost everyone begins with the audit: fixed scope, no lock-in, and you walk away with a clear picture and a roadmap you keep whether or not you continue. It\'s the lowest-risk way to see where you stand before committing to anything bigger.' },
];

// ─── Check icon (same as Services.tsx) ─────────────────────────────────────

function Check({ featured }: { featured: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
      stroke={featured ? '#CBD0AC' : '#55672E'}
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="mt-0.5 flex-shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// ─── Compare table cell ─────────────────────────────────────────────────────

function Cell({ val, highlight }: { val: boolean | string; highlight?: boolean }) {
  const bg = highlight ? 'bg-[#39471D]/[0.04]' : '';
  if (val === true)  return <td className={`${bg} py-4 px-6 text-center text-[#39471D] font-bold`}>✓</td>;
  if (val === false) return <td className={`${bg} py-4 px-6 text-center text-gray-300`}>✕</td>;
  return <td className={`${bg} py-4 px-6 text-center text-sm font-semibold text-gray-600`}>{val}</td>;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100" id="services-hero">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl">
            <Eyebrow className="mb-5">Services</Eyebrow>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans">
              One engine to make you<br />the answer.
            </h1>
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch]">
              Everything we do builds toward one outcome: making you the name buyers and AI trust.
            </p>
          </div>
        </div>
      </section>

      {/* ── Service Cards ─────────────────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100" id="service-cards">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {SERVICES.map((svc) => (
              <div
                key={svc.idx}
                               className={`relative overflow-hidden p-8 rounded-3xl flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  svc.featured
                    ? 'bg-[#39471D] border border-[#39471D] shadow-[0_30px_70px_-30px_rgba(57,71,29,0.6)]'
                    : 'bg-gray-50/60 border border-gray-100 hover:border-[#55672E]/40 hover:shadow-[0_24px_60px_-30px_rgba(57,71,29,0.25)]'
                }`}
              >
                {svc.featured && (
                  <img
                    src="/thallo-digital/isotipo.png"
                    alt=""
                    aria-hidden="true"
                    className="absolute -top-16 -right-16 w-72 rotate-[18deg] opacity-[0.09] pointer-events-none select-none"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                )}

                <div className="relative flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <span className={`font-mono text-[11px] font-bold tracking-[0.18em] uppercase ${svc.featured ? 'text-white/70' : 'text-gray-400'}`}>
                      {svc.idx} / {svc.kicker}
                    </span>
                    {svc.featured && (
                      <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-[#39471D] bg-[#CBD0AC] px-2 py-1 rounded-full">
                        Most chosen
                      </span>
                    )}
                  </div>

                  <h3 className={`text-2xl font-semibold mb-3 ${svc.featured ? 'text-white' : 'text-gray-900'}`}>
                    {svc.title}
                  </h3>
                  <p className={`text-sm leading-relaxed font-medium mb-7 ${svc.featured ? 'text-[#CBD0AC]' : 'text-gray-500'}`}>
                    {svc.desc}
                  </p>

                  <ul className="flex flex-col gap-3">
                    {svc.deliverables.map((item, i) => (
                      <li key={i} className={`flex items-start gap-2.5 text-sm font-medium ${svc.featured ? 'text-gray-100' : 'text-gray-700'}`}>
                        <Check featured={svc.featured} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`relative mt-8 pt-6 border-t ${svc.featured ? 'border-white/15' : 'border-gray-200/70'}`}>
                  <span className={`block text-base font-bold tracking-tight ${svc.featured ? 'text-[#CBD0AC]' : 'text-[#39471D]'}`}>
                    {svc.price}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
              className="px-5 py-2.5 bg-[#39471D] border border-[#39471D] rounded-full text-sm font-semibold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all"
            >
              Book an audit ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── Process ───────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100" id="process">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-16">
            <Eyebrow className="mb-5">How an engagement runs</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans">
              What working together looks like.
            </h2>
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[48ch]">
              A clear arc from first look to compounding results — no hidden phases, no surprises.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS.map((step) => (
              <div
                key={step.idx}
                               className="p-8 rounded-3xl bg-gray-50/60 border border-gray-100 flex flex-col gap-4"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E7ECD9' }}>
                  <span className="text-[11px] font-semibold" style={{ color: '#39471D' }}>{step.idx}</span>
                </div>
                <div>
                  <p className="font-mono text-[11px] font-bold tracking-[0.18em] uppercase text-gray-400 mb-2">{step.period}</p>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compare ───────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100" id="compare">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <Eyebrow className="mb-5">Compare</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans">
              What's in each.
            </h2>
          </div>

          <div className="overflow-x-auto rounded-[20px] border border-gray-100 shadow-[0_2px_20px_-8px_rgba(57,71,29,0.08)]">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-6 font-semibold text-sm text-gray-900 bg-gray-50/60">Feature</th>
                  <th className="py-4 px-6 text-center font-semibold text-sm text-gray-900 bg-gray-50/60">Audit</th>
                  <th className="py-4 px-6 text-center font-semibold text-sm text-white bg-[#39471D]">Authority Engine</th>
                  <th className="py-4 px-6 text-center font-semibold text-sm text-gray-900 bg-gray-50/60">Flagship</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-4 px-6 text-sm font-semibold text-gray-800">{row.feature}</td>
                    <Cell val={row.audit} />
                    <Cell val={row.engine} highlight />
                    <Cell val={row.flagship} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 w-full">
          <div className="relative overflow-hidden rounded-[28px] px-12 py-20 sm:px-20 sm:py-28">
            <img
              src="/thallo-digital/cta-bg.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
              style={{ zIndex: 0 }}
            />
            <div className="relative z-[2] max-w-xl">
              <Eyebrow tone="light" className="mb-6">Ready?</Eyebrow>
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-8 font-sans">
                Start with a clear look at where you stand.
              </h2>
              <p className="text-[#CBD0AC] font-medium text-base sm:text-lg leading-relaxed max-w-[44ch] mb-8">
                Book an AI visibility audit. Clear, fixed scope, and a roadmap you keep either way.
              </p>
              <a
                href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#39471D] rounded-full text-sm font-semibold hover:bg-[#CBD0AC] transition-colors"
              >
                Book your audit ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <Eyebrow className="mb-5">Questions</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans">
              The honest answers.
            </h2>
          </div>

          <div className="max-w-3xl">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="border-b border-gray-100">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full text-left py-6 flex justify-between items-center gap-5 group"
                  >
                    <span className="text-base font-semibold text-gray-900 group-hover:text-[#39471D] transition-colors">
                      {faq.q}
                    </span>
                    <span className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                      isOpen
                        ? 'bg-[#39471D] border-[#39471D] text-white rotate-45'
                        : 'border-gray-200 text-gray-400'
                    }`}>
                      +
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: isOpen ? '300px' : '0px' }}
                  >
                    <p className="pb-6 text-sm text-gray-500 font-medium leading-relaxed max-w-[68ch]">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </>
  );
}
