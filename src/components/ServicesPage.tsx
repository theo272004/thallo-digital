'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';

// ─── Data ──────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    tag: '01 / Entry point',
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
    price: 'One-time',
    unit: 'engagement · no lock-in',
    best: false,
    meta: [['Format', 'Fixed scope'], ['Commitment', 'None'], ['Output', 'Diagnosis + roadmap']],
  },
  {
    tag: '02 / Core program',
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
    price: 'Ongoing',
    unit: 'monthly partnership',
    best: true,
    meta: [['Scope', 'Defined by contract'], ['Foundation', 'Built in month 1'], ['Reporting', 'Monthly']],
  },
  {
    tag: '03 / Accelerate',
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
    price: 'Per project',
    unit: 'scoped to you',
    best: false,
    meta: [['Format', 'Project-based'], ['Great for', 'Big moves'], ['Pairs with', 'The Engine']],
  },
];

const PROCESS = [
  { period: 'Week 1–3', title: 'Audit & diagnosis', desc: 'We benchmark where you show up across Google and AI, score your share of answer, and hand you a prioritized roadmap.' },
  { period: 'Month 1', title: 'Foundation', desc: 'We rebuild the technical infrastructure so search engines and AI can read, understand, and cite you, plus your first authority piece.' },
  { period: 'Month 2 onward', title: 'The Authority Engine', desc: 'Original content, distribution, and visibility work, published and compounded every month, with reporting on real outcomes.' },
  { period: 'When you\'re ready', title: 'Accelerate', desc: 'Flagship projects, proprietary studies, digital PR, and interactive tools that put you on the map for good.' },
];

const COMPARE = [
  { feature: 'AI visibility benchmark',    audit: true,             engine: true,               flagship: false },
  { feature: 'Technical AI-readiness build', audit: false,          engine: true,               flagship: false },
  { feature: 'Original, researched content', audit: false,          engine: 'Monthly',          flagship: 'Deep' },
  { feature: 'Distribution & publishing',  audit: false,            engine: true,               flagship: false },
  { feature: 'Proprietary data studies',   audit: false,            engine: false,              flagship: true },
  { feature: 'Digital PR & podcasts',      audit: false,            engine: false,              flagship: true },
  { feature: 'Monthly outcome reporting',  audit: false,            engine: true,               flagship: false },
  { feature: 'Best for',                   audit: 'Getting clarity', engine: 'Compounding growth', flagship: 'Big moves' },
];

const FAQS = [
  {
    q: 'What if AI says something wrong about us?',
    a: 'It happens, and there\'s no edit button. No AI company lets you log in and correct it. What you can do is make the accurate version of your story the strongest, most consistent signal across the places AI reads, so the correct answer becomes the one it repeats. Getting that right is a large part of our work, and it\'s why precision matters to us more than volume.',
  },
  {
    q: 'Can you prove it\'s working?',
    a: 'Yes, with honesty about what\'s measurable and what isn\'t. We track how often you appear in AI answers for the questions your buyers ask, the sources citing you, and the pipeline your presence influences. What no one can promise is perfect click-by-click attribution; AI search is newer and messier than Google. We report the real signals, not a vanity dashboard, and we\'re straight about the limits.',
  },
  {
    q: 'Will this bring us more customers?',
    a: 'We build the preference, visibility, and pipeline that make you far more likely to win, and keep you on the shortlist. What we won\'t do is promise a fixed number of sales. In a long, multi-person buying decision, anyone who does is guessing.',
  },
  {
    q: 'How fast will we see results?',
    a: 'Faster than old-school SEO. Because AI reads and cites fresh content in real time, early movement — first mentions and first citations — can show up within weeks, not the long months traditional search used to demand. The deeper, compounding authority builds from there.',
  },
  {
    q: 'Where do we start, and how much do we have to commit?',
    a: 'You start small. Almost everyone begins with the audit: fixed scope, no lock-in, and you walk away with a clear picture and a roadmap you keep whether or not you continue. It\'s the lowest-risk way to see where you stand before committing to anything bigger.',
  },
];

// ─── Cell helper for compare table ─────────────────────────────────────────

function Cell({ val, highlight }: { val: boolean | string; highlight?: boolean }) {
  const base = highlight ? 'bg-[#39471D]/[0.04]' : '';
  if (val === true)  return <td className={`text-center font-bold text-[#39471D] ${base} py-4 px-5`}>✓</td>;
  if (val === false) return <td className={`text-center text-gray-300 ${base} py-4 px-5`}>✕</td>;
  return <td className={`text-center text-sm font-semibold text-gray-700 ${base} py-4 px-5`}>{val}</td>;
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [active, setActive] = useState(0);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [processProgress, setProcessProgress] = useState(0);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const plineRef = useRef<HTMLDivElement>(null);
  const [panelKey, setPanelKey] = useState(0);

  // Pill position for segmented control
  const updatePill = useCallback(() => {
    const btn = btnRefs.current[active];
    if (btn) setPillStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
  }, [active]);

  useEffect(() => {
    updatePill();
    window.addEventListener('resize', updatePill);
    return () => window.removeEventListener('resize', updatePill);
  }, [updatePill]);

  // Process scroll animation
  useEffect(() => {
    const onScroll = () => {
      if (!plineRef.current) return;
      const rect = plineRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = Math.min(Math.max((vh * 0.6 - rect.top) / (rect.height * 0.8), 0), 1);
      setProcessProgress(prog);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleServiceSwitch = (i: number) => {
    setActive(i);
    setPanelKey(k => k + 1);
  };

  const svc = SERVICES[active];
  const activeSteps = Math.floor(processProgress * PROCESS.length * 0.999);

  return (
    <div className="pt-20">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative py-24 text-center overflow-hidden bg-white border-b border-gray-100">
        {/* Soft radial blobs matching home aesthetic */}
        <div className="pointer-events-none absolute -top-40 -right-20 w-[520px] h-[520px] rounded-full bg-[#CBD0AC]/20 blur-[80px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 w-[440px] h-[440px] rounded-full bg-[#CBD0AC]/15 blur-[80px]" />

        <div className="relative max-w-[1440px] mx-auto px-6">
          <Eyebrow center className="mb-5 justify-center" data-reveal>Services</Eyebrow>
          <h1
            data-reveal
            className="font-serif text-[clamp(2.6rem,6vw,5rem)] font-medium tracking-tight leading-[1.04] text-gray-900 max-w-[15ch] mx-auto mt-3 mb-5"
          >
            One engine to make you{' '}
            <em className="text-[#39471D] not-italic font-normal font-serif italic">the answer.</em>
          </h1>
          <p data-reveal className="text-gray-500 text-lg font-medium max-w-[46ch] mx-auto">
            Everything we do builds toward one outcome: making you the name buyers and AI trust.
          </p>
        </div>
      </section>

      {/* ── Service Selector ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">

          {/* Segmented control */}
          <div className="flex justify-center mb-12">
            <div className="relative inline-flex bg-gray-100 border border-gray-200 rounded-full p-1.5 gap-1">
              {/* Animated pill */}
              <span
                className="absolute top-1.5 bottom-1.5 rounded-full bg-[#39471D] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
                style={{ left: pillStyle.left, width: pillStyle.width }}
              />
              {SERVICES.map((s, i) => (
                <button
                  key={i}
                  ref={el => { btnRefs.current[i] = el; }}
                  onClick={() => handleServiceSwitch(i)}
                  className={`relative z-10 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 ${
                    active === i ? 'text-white' : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {s.title.split(' ').slice(0, 2).join(' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Service panel */}
          <div
            key={panelKey}
            className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 bg-white border border-gray-100 rounded-3xl p-10 shadow-[0_4px_40px_-20px_rgba(57,71,29,0.12)] animate-[fadeUp_0.45s_ease_both]"
            style={{ animationName: 'fadeUp', animationDuration: '0.45s', animationFillMode: 'both' }}
          >
            {/* Left */}
            <div>
              <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#B0812E] font-bold mb-3">{svc.tag}</p>
              <h2 className="font-serif text-[clamp(1.8rem,3.5vw,2.8rem)] font-medium leading-[1.05] text-gray-900 mb-4">{svc.title}</h2>
              <p className="text-gray-500 text-base font-medium leading-relaxed mb-7">{svc.desc}</p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-9">
                {svc.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-gray-700">
                    <span className="mt-0.5 text-[#39471D] font-bold shrink-0">✓</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#39471D] text-white text-sm font-semibold rounded-full hover:bg-[#55672E] transition-colors"
                >
                  Start here <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
              </div>
            </div>

            {/* Right — price card */}
            <aside className="bg-[#39471D] rounded-2xl p-8 text-white flex flex-col self-start sticky top-28">
              {svc.best && (
                <span className="inline-block self-start mb-4 font-mono text-[10px] tracking-[0.1em] uppercase font-bold px-3 py-1 rounded-full bg-[#B0812E] text-[#39471D]">
                  Most popular
                </span>
              )}
              <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-[#CBD0AC] mb-2">Engagement</p>
              <p className="font-serif text-[2.4rem] font-medium leading-none text-[#E4D2A2]">
                {svc.price}
                <small className="text-base font-mono text-[#CBD0AC] ml-2">{svc.unit}</small>
              </p>

              <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-4">
                {svc.meta.map(([label, val], i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-[#CBD0AC]">{label}</span>
                    <b className="text-white font-semibold">{val}</b>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Process Timeline ─────────────────────────────────────────────── */}
      <section className="bg-[#39471D] py-24 border-b border-[#39471D]">
        <div className="max-w-[1200px] mx-auto px-6">
          <Eyebrow tone="light" className="mb-5">How an engagement runs</Eyebrow>
          <h2 className="font-serif text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.05] text-white mb-16 max-w-[24ch]">
            What working together looks like.
          </h2>

          {/* Timeline */}
          <div ref={plineRef} className="relative pl-10">
            {/* Track */}
            <div className="absolute left-[11px] top-1.5 bottom-1.5 w-[2px] bg-white/10" />
            {/* Fill */}
            <div
              className="absolute left-[11px] top-1.5 w-[2px] bg-[#E4D2A2] transition-none"
              style={{ height: `${processProgress * 100}%` }}
            />

            {PROCESS.map((step, i) => (
              <div key={i} className="relative pb-12 last:pb-0 pl-10">
                {/* Dot */}
                <div className={`absolute -left-[34px] top-0.5 w-6 h-6 rounded-full border-2 transition-all duration-500 ${
                  i <= activeSteps && processProgress > 0.02
                    ? 'bg-[#E4D2A2] border-[#E4D2A2]'
                    : 'bg-[#39471D] border-white/20'
                }`} />
                <p className="font-mono text-[11px] tracking-[0.1em] uppercase text-[#CBD0AC] mb-1.5">{step.period}</p>
                <h3 className="font-serif text-[1.45rem] font-medium text-white mb-2">{step.title}</h3>
                <p className="text-[#CBD0AC] font-medium leading-relaxed max-w-[52ch]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compare Table ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <Eyebrow center className="mb-4 justify-center">Compare</Eyebrow>
          <h2 className="font-serif text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.05] text-gray-900 text-center mb-12">
            What's in each.
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-[0_2px_20px_-8px_rgba(57,71,29,0.08)]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-4 px-5 font-serif font-medium text-gray-900 text-base bg-gray-50">What you get</th>
                  <th className="py-4 px-5 font-serif font-medium text-gray-900 text-base text-center bg-gray-50">Audit</th>
                  <th className="py-4 px-5 font-serif font-medium text-white text-base text-center bg-[#39471D]">Authority Engine</th>
                  <th className="py-4 px-5 font-serif font-medium text-gray-900 text-base text-center bg-gray-50">Flagship</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-4 px-5 text-sm font-semibold text-gray-800">{row.feature}</td>
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

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-28 text-center bg-white border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="font-serif text-[clamp(2.2rem,5vw,3.8rem)] font-medium leading-[1.05] text-gray-900 max-w-[16ch] mx-auto mb-4">
            Start with a clear look at where you{' '}
            <em className="text-[#39471D] not-italic italic">stand.</em>
          </h2>
          <p className="text-gray-500 text-lg font-medium max-w-[44ch] mx-auto mb-10">
            Book an AI visibility audit. Clear, fixed scope, and a roadmap you keep either way.
          </p>
          <a
            href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#39471D] text-white text-base font-semibold rounded-full hover:bg-[#55672E] transition-colors shadow-[0_14px_30px_-14px_rgba(57,71,29,0.5)] hover:-translate-y-0.5 transition-all"
          >
            Book your audit →
          </a>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50/50 border-b border-gray-100">
        <div className="max-w-[1200px] mx-auto px-6">
          <Eyebrow center className="mb-4 justify-center">Questions</Eyebrow>
          <h2 className="font-serif text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[1.05] text-gray-900 text-center mb-14">
            The honest answers.
          </h2>

          <div className="max-w-[820px] mx-auto">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="border-b border-gray-200">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full text-left py-6 flex justify-between items-center gap-5 group"
                  >
                    <span className="font-serif text-[1.2rem] font-medium text-gray-900 group-hover:text-[#39471D] transition-colors">
                      {faq.q}
                    </span>
                    <span className={`shrink-0 w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center text-sm transition-all duration-300 ${
                      isOpen
                        ? 'bg-[#39471D] border-[#39471D] text-white rotate-45'
                        : 'border-gray-300 text-gray-400'
                    }`}>
                      +
                    </span>
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-400 ease-in-out"
                    style={{ maxHeight: isOpen ? '400px' : '0px' }}
                  >
                    <p className="pb-6 text-gray-500 font-medium leading-relaxed max-w-[70ch]">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
