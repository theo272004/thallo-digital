'use client';

import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal, scrollToEl } from '@/components/motion';
import { BASE } from '@/lib/site';

/**
 * "How can we work together?"
 *
 * The playbook section's frame (src/components/PlaybookContrast, now on
 * /home-archive/), reused as Cami suggested on 1 November: the centred
 * masthead, then two panels side by side — one on the desk photograph, one on
 * the house grey — with the isotipo as the bullet.
 *
 * In the playbook the two panels were deliberately unequal, because one side
 * was being argued against. Here both are real offers, so the difference is
 * only of material: the ongoing service gets the photograph because it is the
 * one we lead with. Same height, same structure, same weight of type.
 */

type Engagement = {
  id: string;
  title: string;
  intro: string;
  items: string[];
  close: string;
  link: { label: string; href: string };
  dark: boolean;
};

const ENGAGEMENTS: Engagement[] = [
  {
    id: 'authority-engine',
    title: 'Ongoing Support',
    intro:
      'The Authority Engine is our ongoing service for companies that need someone to take responsibility for their content and its reach.',
    items: [
      'A content plan and delivery schedule',
      'Production, publishing and distribution managed for you',
      'SEO and content updates as the work develops',
    ],
    close:
      'Your team contributes its knowledge and reviews the substance. We manage delivery and use search performance, inquiry quality and commercial feedback to guide the next round.',
    link: { label: 'Explore The Authority Engine', href: `${BASE}/services/` },
    dark: true,
  },
  {
    id: 'focused-projects',
    title: 'Focused Projects',
    intro: 'You may already have a project in mind, but need the expertise or capacity to get it done.',
    items: [
      'Research studies',
      'Website builds and content overhauls',
      'White papers',
      'SEO and AI visibility audits',
      'Outreach campaigns',
      'Interactive tools and assessments',
    ],
    close: 'We agree on the scope, deliverables and timeline upfront, then manage the work from planning through delivery.',
    link: { label: 'Discuss A Project', href: '#cta' },
    dark: false,
  },
];

function Panel({ e }: { e: Engagement }) {
  const d = e.dark;
  return (
    <article
      id={e.id}
      /* From lg the panel is a subgrid over five shared rows (title, intro,
         list, closing line, button), so each block starts at the same height
         in both panels even though the intros differ in length. */
      className={`relative isolate flex flex-col lg:grid lg:grid-rows-subgrid lg:row-span-5 lg:gap-0 overflow-hidden rounded-[24px] p-7 sm:p-10 transition-transform duration-300 hover:-translate-y-1 ${
        /* Both panels carry a 1px border, the dark one transparent, so
           their content starts on exactly the same pixel. */
        d ? 'border border-transparent bg-[#171A10]' : 'border border-gray-200/80 bg-[#F7F8F9]'
      }`}
    >
      {d && (
        <>
          <img
            src={`${BASE}/notebook-desk.webp`}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none object-cover"
          />
          {/* The playbook's two-pass scrim, so every line clears the photo. */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10"
            style={{
              background:
                'linear-gradient(to right, rgba(23,26,16,.94) 0%, rgba(23,26,16,.84) 45%, rgba(23,26,16,.66) 100%)',
            }}
          />
        </>
      )}

      <h3 className={`text-2xl sm:text-[1.75rem] font-bold tracking-tight mb-4 ${d ? 'text-white' : 'text-gray-900'}`}>
        {e.title}
      </h3>
      <p className={`text-[15px] font-medium leading-relaxed mb-6 ${d ? 'text-white/75' : 'text-gray-500'}`}>{e.intro}</p>

      <ul className="flex flex-col mb-6">
        {e.items.map((item) => (
          <li
            key={item}
            className={`flex items-start gap-3.5 border-b py-3.5 text-[14.5px] font-semibold leading-snug last:border-0 ${
              d ? 'border-white/15 text-white' : 'border-gray-200/70 text-gray-800'
            }`}
          >
            <img
              src={`${BASE}/isotipo.png`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="mt-[3px] block h-[15px] w-[15px] shrink-0 select-none object-contain"
              style={d ? { filter: 'brightness(0) invert(1)' } : undefined}
            />
            {item}
          </li>
        ))}
      </ul>

      <p className={`text-[14.5px] font-medium leading-relaxed mb-8 ${d ? 'text-white/75' : 'text-gray-500'}`}>{e.close}</p>

      {/* mt-auto on a phone, the button row of the subgrid from lg: either
          way the pair ends level. */}
      <a
        href={e.link.href}
        onClick={(ev) => {
          if (!e.link.href.startsWith('#')) return;
          ev.preventDefault();
          scrollToEl(e.link.href);
        }}
        className={`group mt-auto inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-xs font-bold transition-all ${
          d
            ? 'bg-white text-gray-900 hover:bg-[#F7F8F9]'
            : 'bg-[#39471D] text-white hover:bg-[#55672E]'
        }`}
      >
        {e.link.label}
        <ArrowUpRight className="text-[11px] group-hover:translate-x-0.5 transition-transform" />
      </a>
    </article>
  );
}

export default function HomeEngagements() {
  return (
    <section className="border-b border-gray-100 bg-white py-20 2xl:py-28" id="ways-to-work">
      <div className="mx-auto max-w-[1440px] px-6" data-reveal>
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <SplitReveal
            as="h2"
            className="font-sans text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl"
            html='How Can We <span class="italic text-[#39471D]">Work Together?</span>'
          />
          <p className="mx-auto mt-5 max-w-[62ch] text-base font-medium leading-relaxed text-gray-500">
            We work best with companies that want to build authority and attract relevant inquiries, need a partner to
            manage delivery and can make their experts available to share their knowledge and review the work.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-5">
          {ENGAGEMENTS.map((e) => (
            <Panel key={e.id} e={e} />
          ))}
        </div>
      </div>
    </section>
  );
}
