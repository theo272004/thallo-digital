'use client';
import React from 'react';
import SpinFlower from '@/components/ui/SpinFlower';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import AuditCTA from '@/components/AuditCTA';
import { BASE } from '@/lib/site';

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
  | { type: 'phrase'; name: string; phrase: string; image: string };

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
    image: 'industry-fintech-bg.webp',
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
    image: 'industry-professional-services-bg.webp',
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
    image: 'industry-health-tech-bg.webp',
  },
];

/* Same words as before, split into role + sector so the attribution can use
   the home page's avatar layout. These quotes are anonymous, so the disc
   carries the sector's initials — there is no name to put there. */
const QUOTES = [
  {
    text: 'In our category, being the name AI recommends changed everything about how fast deals moved.',
    role: 'VP Marketing',
    sector: 'Fintech',
    initials: 'FT',
  },
  {
    text: 'They understood our regulatory world. The content was credible enough to be cited, not just published.',
    role: 'Founder',
    sector: 'Health tech',
    initials: 'HT',
  },
  {
    text: 'Referrals used to be our whole pipeline. Now buyers find us first, already trusting us.',
    role: 'Partner',
    sector: 'Professional services',
    initials: 'PS',
  },
];

export default function IndustriesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white pt-32 pb-10 2xl:pt-40 2xl:pb-12 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans max-w-2xl">
            Built for high-consideration<br />industries.
          </h1>
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch] mb-10">
            Where the decision is high-stakes, buyers research hard before they commit. We make you the name they are most likely to trust.
          </p>
          <SpinFlower alt="Thallo" className="block w-20 h-20 opacity-80" />
        </div>
      </section>

      {/* How buyers decide */}
      {/* Top padding trimmed against the hero's own trailing whitespace — the
          two together read as one empty screen. */}
      <section className="bg-white pt-10 pb-16 2xl:pt-14 2xl:pb-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div
            className="relative overflow-hidden rounded-[28px] px-10 py-14 sm:px-16 sm:py-20"
            style={{
              backgroundImage: `url(${BASE}/buyers-bg.webp)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="max-w-lg mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-[1.05] font-sans">
                Buyers decide before they ever contact you.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

              {/* Card 1 — 73% Research */}
              <div
                className="rounded-3xl p-[30px] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
                style={{
                  background: 'rgba(20,20,18,0.72)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.28)',
                }}
              >
                <p className="font-bold text-[2.6rem] leading-none font-sans tracking-tight mb-4" style={{ color: '#F3E6C1' }}>73%</p>
                <h3 className="font-semibold text-base mb-2" style={{ color: '#FFFFFF' }}>Research before contact</h3>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>Most buyers investigate thoroughly online before they speak to anyone. The shortlist forms in private.</p>
              </div>

              {/* Card 2 — 45% AI in the mix */}
              <div
                className="rounded-3xl p-[30px] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
                style={{
                  background: 'rgba(20,20,18,0.72)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.28)',
                }}
              >
                <p className="font-bold text-[2.6rem] leading-none font-sans tracking-tight mb-4" style={{ color: '#F3E6C1' }}>45%</p>
                <h3 className="font-semibold text-base mb-2" style={{ color: '#FFFFFF' }}>AI in the mix</h3>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>Buyers fold ChatGPT and Perplexity into their research, and act on the names those tools surface first.</p>
              </div>

              {/* Card 3 — 1st Preference wins */}
              <div
                className="rounded-3xl p-[30px] transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
                style={{
                  background: 'rgba(20,20,18,0.72)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.28)',
                }}
              >
                <p className="font-bold text-[2.6rem] leading-none font-sans tracking-tight mb-4" style={{ color: '#F3E6C1' }}>1st</p>
                <h3 className="font-semibold text-base mb-2" style={{ color: '#FFFFFF' }}>Preference wins</h3>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.82)' }}>The provider seen as most credible early is usually the one that wins, often before a sales call ever happens.</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Industries grid */}
      {/* Sized to land whole. Six cards at 240px, a 56px heading gap and 112px
          of section padding ran the button off the bottom of a laptop screen,
          which is the one place it has to be seen — so the cards lose 50px of
          minimum height, the padding inside them comes in from 32 to 24, and
          the figures come down a step. Nothing here needed to be that large;
          the cards were sized by habit rather than by their content. */}
      <section className="bg-white py-12 2xl:py-20 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="max-w-2xl mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans mb-3">
              Industries we build authority for.
            </h2>
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[48ch]">
              We focus where trust and authority decide who wins.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDUSTRIES.map((ind) => (
              <div
                key={ind.name}
                className={`relative overflow-hidden rounded-3xl p-5 flex flex-col gap-3 transition-all duration-300 min-h-[170px] ${
                  ind.type === 'phrase'
                    ? 'isolate bg-[#1C160E] border border-[#1C160E] hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_rgba(57,71,29,0.55)]'
                    : 'bg-gray-50/60 border border-gray-200 lift'
                }`}
              >
                {/* The photograph is its own layer rather than a
                    `background-image` under a flat scrim. Two reasons, and the
                    second is the whole point: a layer can be filtered without
                    filtering the type on top of it, and a scrim can be shaped.

                    The old treatment was `rgba(20, 28, 10, .68 to .86)` -- a
                    green-black at nearly nine tenths, edge to edge. Measured
                    against the buyers panel and the audit CTA further down the
                    page, which are the tones these were supposed to sit beside:
                    those two composite warm, red a touch over green, and keep
                    highlights up around 223 and 249. These cards composited
                    green over red and their brightest surviving pixel was 82.
                    That is not a photograph any more, it is an olive rectangle
                    with a picture somewhere underneath it.

                    So: the tint is a warm black, and the scrim opens to .28
                    across the middle band where nothing is written, then closes
                    again over the name. The quote and the name each keep their
                    own dark ground; the photograph gets the gap between them.
                    Re-measured after, at desktop and at phone widths: warm by 4-7
                    points of red over green, highlights 120-192, and the
                    worst-case contrast under the quote is 5.05-5.6 against the
                    5.03-5.67 it had before. Nothing was traded for the warmth. */}
                {ind.type === 'phrase' && (
                  <>
                    <img
                      src={`${BASE}/${ind.image}`}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none object-cover"
                      style={{ filter: 'saturate(1.45) contrast(1.08) brightness(1.18)' }}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -z-10"
                      style={{
                        background:
                          'linear-gradient(180deg, rgba(28,22,14,0.82) 0%, rgba(28,22,14,0.74) 46%, rgba(28,22,14,0.28) 68%, rgba(28,22,14,0.80) 76%, rgba(28,22,14,0.92) 100%)',
                      }}
                    />
                  </>
                )}
                {ind.type === 'metric' ? (
                  <>
                    <div>
                      <p className="text-[2.1rem] font-bold tracking-tight leading-none text-[#39471D] font-sans">{ind.metric}</p>
                      <p className="text-[12.5px] text-gray-500 font-medium leading-[1.4] mt-1.5 max-w-[30ch]">{ind.meaning}</p>
                      <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-400 mt-1">{ind.src}</p>
                    </div>
                    {/* The industry name is the thing you are meant to leave
                        with, and in near-black under a 3rem figure it was the
                        quietest line on the card. Olive on the light cards,
                        white on the olive ones — the same job, inverted. */}
                    <div className="mt-auto pt-3.5 border-t border-gray-200/70">
                      {/* 20px against the 14px line under it. At 16px bold it
                          was only two points clear of its own description, so
                          the eye finished on the figure above and stopped. */}
                      <h3 className="text-base font-bold tracking-tight leading-snug text-[#39471D] mb-1">{ind.name}</h3>
                      <p className="text-[12.5px] text-gray-500 font-medium leading-[1.45]">{ind.line}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-serif italic text-[1.25rem] leading-[1.3] text-[#CBD0AC] flex-1">
                      {ind.phrase}
                    </p>
                    <div className="pt-3.5 border-t border-white/15">
                      <h3 className="text-base font-bold tracking-tight leading-snug text-white">{ind.name}</h3>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* The grid used to hand straight over to the quotes with nothing to
              do in between — six cards of reasoning and no way to act on it.
              One button, and the cheaper of the two asks: the panel at the
              foot of the page still carries the audit and the form. */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left 2xl:mt-12">
            <p className="max-w-[46ch] text-[15px] font-medium leading-relaxed text-gray-500">
              Whichever one you are in, the first question is the same: what do the models say when your buyer asks?
            </p>
            <a
              href={`${BASE}/thallo-ai/scan/`}
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#39471D] px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-px"
            >
              Run a free scan <ArrowUpRight className="ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50/50 py-14 2xl:py-24 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          {/* Three quotes arrived on the page with nothing above them saying
              what they were, so they read as decoration between two sections
              that did have titles. Small on purpose — this is a caption over
              the cards, not another section headline competing with the two
              above it. */}
          <div className="mb-9 text-center">
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight leading-[1.1] text-gray-900">
              In their <span className="italic text-[#39471D]">own words.</span>
            </h2>
            <p className="mx-auto mt-3 max-w-[46ch] text-[15px] font-medium leading-relaxed text-gray-500">
              Three sectors, three engagements, on what changed once the models started naming them.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {QUOTES.map((q, i) => (
              <div
                key={q.sector}
                /* Middle card runs half a cycle behind the outer two, so it
                   rises while they fall and vice versa. A NEGATIVE delay of
                   half the duration starts it already mid-cycle — a positive
                   one would hold all three still for three seconds first. */
                className={`quote-float bg-white border border-gray-200 rounded-3xl p-8 flex flex-col gap-5 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)]`}
                style={{ animationDelay: i === 1 ? '-3s' : '0s' }}
              >
                {/* Stars — olive and 13px, matching the home carousel */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} viewBox="0 0 16 16" width="13" height="13" fill="#39471D">
                      <path d="M8 1l1.854 3.757L14 5.528l-3 2.924.708 4.128L8 10.5l-3.708 2.08L5 8.452 2 5.528l4.146-.771L8 1z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-gray-700 font-medium leading-relaxed flex-1">
                  &ldquo;{q.text}&rdquo;
                </p>

                {/* Attribution */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#39471D]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-[#39471D]">{q.initials}</span>
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-900 leading-none">{q.role}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{q.sector}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <AuditCTA
        image={`${BASE}/cta-bg-industries.webp`}
        heading="Be the one they already trust."
        copy="Start with an audit tuned to your industry. See where you stand against the names winning your category."
      />
    </>
  );
}
