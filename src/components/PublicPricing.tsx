'use client';

import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { scrollToEl, SplitReveal } from '@/components/motion';
import { BASE } from '@/lib/site';

/**
 * "Our prices are public" — the three figures, on the home page, before anyone
 * has to ask.
 *
 * Added at Cami's request on 3 October 2026. Each figure is one the site
 * already states elsewhere and has to stay in step with: the free tier in
 * ScannerStripe ("under a minute"), the audit in Services.tsx and AuditOffer,
 * the Engine's floor and term in Services.tsx, ServicesLanding.tsx and
 * HomeFaq.tsx. Grep for the old figure across the site when any of them moves.
 *
 * ## A pricing table, not a row of chips
 *
 * On 5 October Cami found the three small price cards too slight for what
 * they carry, and asked for something different and longer. So each tier is
 * now a full card, in the order a client meets them — scan, audit, Engine —
 * numbered as steps, each with what it is, its price and terms, four things it
 * includes, and its own next step.
 *
 * No new claims: every line is one the site already makes. The scan's comes
 * from ScannerStripe, the audit's from its deliverables in ServicesLanding,
 * the Engine's from the same place, and each terms line from Our Plans.
 *
 * The Engine is the featured card because it is the program — "The full
 * program" is Our Plans' own kicker for it — not because of a popularity
 * figure we do not have.
 */
type Tier = {
  step: string;
  kicker: string;
  name: string;
  desc: string;
  price: string;
  /** Small, before the figure: "From". */
  prefix?: string;
  unit?: string;
  terms: string;
  items: string[];
  cta: string;
  /** A page to go to; absent means the form at the foot of the page. */
  href?: string;
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    step: '01',
    kicker: 'Start free',
    name: 'Free scan',
    desc: 'See how AI describes your brand today, before you spend anything.',
    price: '$0',
    terms: 'No account. Under a minute.',
    items: [
      'Real buying questions you write yourself',
      'Answers from ChatGPT, Claude and Gemini',
      'How often you are named',
      'Who gets named instead',
    ],
    cta: 'Run my scan',
    href: `${BASE}/thallo-ai/scan/`,
  },
  {
    step: '02',
    kicker: 'Diagnosis',
    name: 'AI Visibility Audit',
    desc: 'Where you show up when buyers ask AI, where competitors beat you, and what it would take to lead.',
    price: '$1,000',
    unit: 'one time',
    terms: 'Fixed price. No lock-in. The roadmap is yours either way.',
    items: [
      'Your mention rate vs. your competitors',
      "The questions where they win and you don't",
      'The 20 sites you need to be on in your category',
      'A 90-day plan you can act on, in-house or with us',
    ],
    cta: 'Book the audit',
  },
  {
    step: '03',
    kicker: 'The full program',
    name: 'Authority Engine',
    desc: 'The monthly operation that builds, publishes and compounds your authority across search and AI.',
    prefix: 'From',
    price: '$2,500',
    unit: '/ month',
    terms: '3-month initial term. Scales with the size of the operation.',
    items: [
      'Deeply researched original content',
      'Technical AI-readiness build',
      'Distribution to buyer channels',
      'Monthly outcome reporting',
    ],
    cta: 'Talk about the Engine',
    featured: true,
  },
];

function TierCta({ t }: { t: Tier }) {
  const className = `mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold transition-colors ${
    t.featured
      ? 'bg-[#39471D] text-white hover:bg-[#55672E]'
      : 'border border-[#39471D] text-[#39471D] hover:bg-[#39471D] hover:text-white'
  }`;
  if (t.href) {
    return (
      <a href={t.href} className={className}>
        {t.cta}
        <ArrowUpRight className="text-[11px]" />
      </a>
    );
  }
  return (
    <a
      href="#cta"
      onClick={(e) => {
        e.preventDefault();
        scrollToEl('#cta');
      }}
      className={className}
    >
      {t.cta}
      <ArrowUpRight className="text-[11px]" />
    </a>
  );
}

export default function PublicPricing() {
  return (
    <section className="border-b border-gray-100 bg-[#F7F8F9] py-20 2xl:py-28" id="pricing">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="mx-auto max-w-2xl text-center" data-reveal>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#55672E]">
            No discovery-call pricing
          </p>
          <SplitReveal
            as="h2"
            className="mt-4 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl"
            html='Our prices are <span class="italic text-[#39471D]">public.</span>'
          />
          <p className="mx-auto mt-5 max-w-[56ch] text-base font-medium leading-relaxed text-gray-500">
            You shouldn&rsquo;t have to book a call to find out what something costs. Here are our prices, up front.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* The reveal moves the outer box and the hover lift moves the card
              inside it. On one element GSAP's inline transform would pin the
              card in place and the lift would never show. */}
          {TIERS.map((t) => (
            <div key={t.name} data-reveal className="flex">
            <div
              className={`lift flex w-full flex-col rounded-[28px] border bg-white p-8 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-all duration-300 sm:p-10 ${
                t.featured ? 'border-[#39471D]' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[12px] font-bold tracking-wider text-[#8FA88A] tabular-nums">{t.step}</span>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
                    t.featured ? 'bg-[#39471D] text-white' : 'bg-[#39471D]/10 text-[#39471D]'
                  }`}
                >
                  {t.kicker}
                </span>
              </div>

              <h3 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">{t.name}</h3>
              {/* Minimum heights on the description and the terms keep the three
                  prices, and the three lists under them, on one line across
                  the row whatever each tier's copy runs to. */}
              <p className="mt-3 text-[15.5px] font-medium leading-relaxed text-gray-500 lg:min-h-[4.75rem]">{t.desc}</p>

              <div className="mt-8 flex items-baseline gap-2">
                {t.prefix && <span className="text-sm font-semibold text-gray-500">{t.prefix}</span>}
                <span className="font-sans text-5xl font-bold tracking-tight text-gray-900 tabular-nums">{t.price}</span>
                {t.unit && <span className="text-sm font-semibold text-gray-500">{t.unit}</span>}
              </div>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-500 lg:min-h-[2.6rem]">{t.terms}</p>

              <ul className="mb-10 mt-8 flex flex-col border-t border-gray-200/70">
                {t.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3.5 border-b border-gray-200/70 py-4 text-[15px] font-medium leading-snug text-gray-900 last:border-0"
                  >
                    <img
                      src={`${BASE}/isotipo.png`}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      decoding="async"
                      className="mt-[2px] block h-[15px] w-[15px] shrink-0 select-none object-contain"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <TierCta t={t} />
            </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[15.5px] font-medium leading-relaxed text-gray-500" data-reveal>
          Standalone projects, from original research to digital PR, are quoted per project.{' '}
          <a href={`${BASE}/services/`} className="font-semibold text-[#39471D] underline underline-offset-4 hover:text-[#55672E]">
            See Our Plans
          </a>
        </p>
      </div>
    </section>
  );
}
