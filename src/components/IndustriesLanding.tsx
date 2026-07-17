'use client';
import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';

const STATS = [
  {
    val: '73%',
    label: 'Research before contact',
    desc: 'Most buyers investigate thoroughly online before they speak to anyone. The shortlist forms in private.',
  },
  {
    val: '45%',
    label: 'AI in the mix',
    desc: 'Buyers fold ChatGPT and Perplexity into their research, and act on the names those tools surface first.',
  },
  {
    val: '1st',
    label: 'Preference wins',
    desc: 'The provider seen as most credible early is usually the one that wins, often before a sales call ever happens.',
  },
];

type Industry =
  | { type: 'metric'; name: string; metric: string; meaning: string; src: string; line: string }
  | { type: 'phrase'; name: string; phrase: string };

const INDUSTRIES: Industry[] = [
  {
    type: 'metric',
    name: 'Specialized software',
    metric: '94%',
    meaning: 'used AI to research their most recent software purchase',
    src: '6sense, 2025',
    line: 'The shortlist takes shape before a demo is ever booked.',
  },
  {
    type: 'phrase',
    name: 'Fintech',
    phrase: 'Nobody moves money to a name they do not trust.',
  },
  {
    type: 'metric',
    name: 'Health & recovery',
    metric: '84%',
    meaning: 'of patients check online reviews before choosing a provider',
    src: 'rater8, 2025',
    line: 'When the decision is this personal, people read everything before they reach out.',
  },
  {
    type: 'phrase',
    name: 'Professional services',
    phrase: 'Your reputation arrives before you do.',
  },
  {
    type: 'metric',
    name: 'Benefits & claims',
    metric: '57%',
    meaning: 'shopped and compared their coverage last year, a record high',
    src: 'J.D. Power, 2025',
    line: 'People compare hard when the fine print costs them.',
  },
  {
    type: 'phrase',
    name: 'Health tech',
    phrase: 'In medicine, being credible is not a nice-to-have. It is the whole decision.',
  },
];

const QUOTES = [
  {
    text: 'In our category, being the name AI recommends changed everything about how fast deals moved.',
    who: 'VP Marketing - Fintech',
  },
  {
    text: 'They understood our regulatory world. The content was credible enough to be cited, not just published.',
    who: 'Founder - Health tech',
  },
  {
    text: 'Referrals used to be our whole pipeline. Now buyers find us first, already trusting us.',
    who: 'Partner - Professional services',
  },
];

export default function IndustriesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white pt-36 pb-16 2xl:pt-48 2xl:pb-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
          <Eyebrow center className="mb-5">Industries</Eyebrow>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans max-w-2xl">
            Built for high-consideration<br />industries.
          </h1>
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch] mb-10">
            Where the decision is high-stakes, buyers research hard before they commit. We make you the name they are most likely to trust.
          </p>
          <img
            src="/thallo-digital/flower.png"
            alt="Thallo"
            className="w-20 h-20 object-contain opacity-80"
          />
        </div>
      </section>

      {/* How buyers decide */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="relative overflow-hidden rounded-[28px] bg-[#39471D] px-10 py-14 sm:px-16 sm:py-20">
            <div className="max-w-lg mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.05] font-sans">
                Buyers decide before they ever contact you.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/[0.06] border border-white/10 rounded-2xl p-7 hover:-translate-y-1 transition-transform duration-300"
                >
                  <p className="font-bold text-[2.6rem] leading-none text-[#E4D2A2] mb-4 font-sans tracking-tight">{s.val}</p>
                  <h3 className="text-white font-semibold text-base mb-2">{s.label}</h3>
                  <p className="text-[#CBD0AC] text-sm font-medium leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Industries grid */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-14">
            <Eyebrow className="mb-5">Where we work</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans mb-4">
              Industries we build authority for.
            </h2>
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[48ch]">
              We focus where trust and authority decide who wins.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {INDUSTRIES.map((ind) => (
              <div
                key={ind.name}
                className="relative overflow-hidden bg-gray-50/60 border border-gray-100 rounded-3xl p-8 flex flex-col gap-5 hover:-translate-y-1 hover:border-[#55672E]/40 hover:shadow-[0_24px_60px_-30px_rgba(57,71,29,0.2)] transition-all duration-300 min-h-[240px]"
              >
                {ind.type === 'metric' ? (
                  <>
                    <div>
                      <p className="text-[3rem] font-bold tracking-tight leading-none text-[#39471D] font-sans">{ind.metric}</p>
                      <p className="text-sm text-gray-500 font-medium leading-snug mt-2 max-w-[28ch]">{ind.meaning}</p>
                      <p className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 mt-1.5">{ind.src}</p>
                    </div>
                    <div className="mt-auto pt-5 border-t border-gray-200/70">
                      <h3 className="text-base font-bold text-gray-900 mb-1">{ind.name}</h3>
                      <p className="text-sm text-gray-500 font-medium leading-relaxed">{ind.line}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-serif italic text-[1.55rem] leading-[1.25] text-[#39471D] flex-1">
                      {ind.phrase}
                    </p>
                    <div className="pt-5 border-t border-gray-200/70">
                      <h3 className="text-base font-bold text-gray-900">{ind.name}</h3>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50/50 py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <Eyebrow center className="mb-12 justify-center">What clients say</Eyebrow>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUOTES.map((q) => (
              <div
                key={q.who}
                className="bg-white border border-gray-100 rounded-3xl p-8 flex flex-col gap-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} viewBox="0 0 12 12" width="14" height="14" fill="#B0812E">
                      <path d="M6 1l1.4 2.9 3.1.4-2.2 2.2.5 3.1L6 8.1 3.2 9.6l.5-3.1L1.5 4.3l3.1-.4z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-900 font-medium text-base leading-relaxed flex-1">{q.text}</p>
                <p className="font-mono text-[11px] font-bold tracking-[0.14em] uppercase text-gray-400">{q.who}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
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
              <Eyebrow tone="light" className="mb-6">Your market</Eyebrow>
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-8 font-sans">
                Be the one they already trust.
              </h2>
              <p className="text-[#CBD0AC] font-medium text-base sm:text-lg leading-relaxed max-w-[44ch] mb-8">
                Start with an audit tuned to your industry. See where you stand against the names winning your category.
              </p>
              <a
                href="mailto:hello@thallo.co?subject=AI Visibility Audit Request"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#39471D] rounded-full text-sm font-semibold hover:bg-[#CBD0AC] transition-colors"
              >
                Book your audit &#x2197;
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}