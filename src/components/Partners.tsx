import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';
import { PARTNERS, PARTNERS_READY, filledPartners, initials, type Partner } from '@/lib/team';
import { BASE } from '@/lib/site';

/**
 * Who runs the company.
 *
 * Required for the Stripe account review — it wants a named, verifiable team
 * behind the business, not just a brand voice. Until the real details are in
 * `lib/team.ts` this renders a labelled template instead of invented people:
 * an obviously-unfinished block is recoverable, a page of fictional colleagues
 * on a live company site is not.
 */
export default function Partners() {
  const partners = PARTNERS_READY ? filledPartners() : [];

  return (
    <section className="bg-white border-b border-gray-100 py-24 2xl:py-28" id="team">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <Eyebrow center className="mb-5 justify-center">
            The partners
          </Eyebrow>
          <SplitReveal
            as="h2"
            className="mb-6 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl"
            html="The people behind the work."
          />
          <p className="text-base font-medium leading-relaxed text-gray-500 sm:text-lg">
            Thallo is deliberately small. The people who scope your engagement are the people who do it — no account
            layer between you and the work.
          </p>
        </div>

        <div
          className={`mx-auto grid max-w-4xl gap-6 ${
            (PARTNERS_READY ? partners.length : PARTNERS.length) > 2
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2'
          }`}
        >
          {PARTNERS_READY
            ? partners.map((p) => <PartnerCard key={p.name} partner={p} />)
            : PARTNERS.map((_, i) => <TemplateCard key={i} n={i + 1} />)}
        </div>
      </div>
    </section>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <div
      data-reveal
      className="flex flex-col items-center rounded-3xl border border-gray-200 bg-gray-50/60 p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:border-[#55672E]/40 hover:shadow-[0_24px_60px_-30px_rgba(57,71,29,0.25)]"
    >
      {partner.photo ? (
        <img
          loading="lazy"
          decoding="async"
          src={`${BASE}/${partner.photo}`}
          alt={partner.name}
          width={160}
          height={160}
          className="mb-5 h-20 w-20 rounded-full border border-gray-200 object-cover"
        />
      ) : (
        <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#55672E]/20 bg-[#39471D] font-sans text-xl font-bold text-[#CBD0AC]">
          {initials(partner.name)}
        </span>
      )}

      <h3 className="mb-1 font-sans text-lg font-bold tracking-tight text-gray-900">{partner.name}</h3>
      <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#55672E]">{partner.role}</p>
      <p className="text-[14px] font-medium leading-relaxed text-gray-500">{partner.bio}</p>

      {partner.linkedin && (
        <a
          href={partner.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400 underline-offset-4 transition-colors hover:text-[#39471D] hover:underline"
        >
          LinkedIn ↗
        </a>
      )}
    </div>
  );
}

/**
 * The unfilled state.
 *
 * Deliberately looks like a form rather than a person: dashed edges and named
 * slots, so nobody reads it as content and everybody can see exactly which
 * three things are missing.
 */
function TemplateCard({ n }: { n: number }) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-gray-300 bg-gray-50/40 p-8 text-center">
      <span className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-gray-300 bg-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-gray-300">
        Photo
      </span>

      <span className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-gray-300">
        Partner {n}
      </span>

      <Slot label="Full name" />
      <Slot label="Role · e.g. Co-founder & Strategy" />
      <Slot label="One line on what they do here" wide />
    </div>
  );
}

function Slot({ label, wide = false }: { label: string; wide?: boolean }) {
  return (
    <span
      className={`mb-2 block rounded-md border border-dashed border-gray-300 bg-white px-3 py-2 text-[12px] font-medium text-gray-400 ${
        wide ? 'w-full' : 'w-[85%]'
      }`}
    >
      {label}
    </span>
  );
}
