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
 *
 * 2 November: Cami's new words. The heading names the two offers ("A focused
 * project or ongoing support."), the masthead paragraph and both lists are
 * gone, and the line about what your team contributes closes the section
 * under both panels. The section is one screen tall.
 */

type Engagement = {
  id: string;
  title: string;
  body: string;
  link: { label: string; href: string };
  dark: boolean;
};

/* Cami's copy of 2 November, word for word (Focused Projects' paragraph
   rewritten by her on 7 November). Focused projects lead now, and
   neither panel carries a list: each is its title, one paragraph and its
   button. The ongoing service keeps the photograph. */
const ENGAGEMENTS: Engagement[] = [
  {
    id: 'focused-projects',
    title: 'Focused Projects',
    body: 'Start with a defined need, such as a website rebuild, an SEO audit, a research study or an outreach campaign. We agree on the scope, deliverables and timeline upfront, then manage the project through delivery.',
    link: { label: 'Discuss A Project', href: '#cta' },
    dark: false,
  },
  {
    id: 'authority-engine',
    title: 'Ongoing Support',
    body: 'You need a partner to take responsibility for your content and its reach. Through the Authority Engine, we manage research, content, SEO and distribution.',
    link: { label: 'Explore The Authority Engine', href: `${BASE}/services/` },
    dark: true,
  },
];

/* The dark panel's scrim, shared with the window in the light panel's button. */
const SCRIM = 'linear-gradient(to right, rgba(23,26,16,.94) 0%, rgba(23,26,16,.84) 45%, rgba(23,26,16,.66) 100%)';

function Panel({ e }: { e: Engagement }) {
  const d = e.dark;
  return (
    <article
      id={e.id}
      /* From lg the panel is a subgrid over three shared rows (title,
         paragraph, button), so each block starts at the same height in both
         panels even though the paragraphs differ in length. */
      className={`relative isolate flex flex-col lg:grid lg:grid-rows-subgrid lg:row-span-3 lg:gap-0 overflow-hidden rounded-[1.5rem] p-7 sm:p-10 transition-transform duration-300 hover:-translate-y-1 ${
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
            style={{ background: SCRIM }}
          />
        </>
      )}

      <h3 className={`text-2xl font-bold tracking-tight mb-4 ${d ? 'text-white' : 'text-gray-900'}`}>
        {e.title}
      </h3>
      <p className={`text-base font-medium leading-relaxed mb-8 ${d ? 'text-white/75' : 'text-gray-500'}`}>{e.body}</p>

      {/* mt-auto on a phone, the button row of the subgrid from lg: either
          way the pair ends level.

          The light panel's button is a window onto the dark panel's
          photograph (Cami, 2 November: "que no sea verde… algo especial").
          The photo and scrim inside it are positioned against the panel, not
          the button, so they are exactly the size the neighbouring panel
          shows them at; the button's clip-path cuts that down to its pill.
          clip-path, not overflow, because overflow would not clip something
          whose containing block is outside the button. */}
      <a
        href={e.link.href}
        onClick={(ev) => {
          if (!e.link.href.startsWith('#')) return;
          ev.preventDefault();
          scrollToEl(e.link.href);
        }}
        className={`group mt-auto self-start inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition-all ${
          d
            ? 'bg-white text-gray-900 hover:bg-[#F7F8F9]'
            : 'bg-[#171A10] text-white [clip-path:inset(0_round_9999px)]'
        }`}
      >
        {!d && (
          <>
            <img
              src={`${BASE}/notebook-desk.webp`}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
            />
            {/* Lighter than the panel's scrim: at the panel's full strength
                the corner the button sits in reads as flat black, and the
                point is that the photograph shows. */}
            <span aria-hidden className="absolute inset-0 bg-[#171A10]/40 transition-colors duration-300 group-hover:bg-[#171A10]/20" />
          </>
        )}
        <span className="relative inline-flex items-center gap-2">
          {e.link.label}
          <ArrowUpRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
        </span>
      </a>
    </article>
  );
}

export default function HomeEngagements() {
  return (
    <section
      className="flex items-center border-b border-gray-100 bg-white py-20 lg:min-h-[100svh] lg:py-24"
      id="ways-to-work"
    >
      <div className="mx-auto w-full max-w-[77.5rem] xl:max-w-[min(77.5rem,80vw)] px-6">
        <SplitReveal
          as="h2"
          className="mx-auto mb-10 sm:mb-14 max-w-[24ch] text-center font-sans text-4xl font-bold leading-[1.08] tracking-tight text-gray-900 sm:text-5xl text-balance"
          html='A Focused Project <span class="italic text-[#39471D]">Or Ongoing Support</span>.'
        />

        {/* The heading has its own line reveal; the panels and the closing
            line rise in after it. The whole block used to fade up as one,
            which moved the heading twice at once. */}
        <div data-reveal className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-5">
          {ENGAGEMENTS.map((e) => (
            <Panel key={e.id} e={e} />
          ))}
        </div>

        {/* Said of both, so it sits under both. */}
        <p data-reveal className="mx-auto mt-10 max-w-[62ch] text-center text-base font-medium leading-relaxed text-gray-500">
          Your team contributes its knowledge and reviews the substance. We coordinate the agreed work and keep you
          informed throughout.
        </p>
      </div>
    </section>
  );
}
