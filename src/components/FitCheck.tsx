import React from 'react';
import { SplitReveal } from '@/components/motion';
import { BASE } from '@/lib/site';

/**
 * "Are we a fit?" — who this is for, and who it is not for, said before the
 * form rather than after a call.
 *
 * Added at Cami's request on 3 October 2026. It is a filter as much as a pitch:
 * the "not for you" column turns away the enquiries a $2,500 retainer cannot
 * serve, which is what keeps the form at the bottom worth reading.
 *
 * Same two-panel grammar as PlaybookContrast — the isotipo marks what we want,
 * a dash marks what we do not — but both panels alike here, because neither
 * side is the position being argued against.
 *
 * On 5 October it took the same treatment as "Start with clarity": a blurred,
 * darkened photograph behind it and the two panels in glass.
 */
const FOR_YOU = [
  'Your buyers research carefully before they commit, and you want to be the name they find.',
  'You suspect AI is already shaping those conversations and you want the numbers.',
  "You'd rather own authority than rent attention.",
];

const NOT_FOR_YOU = [
  'You\'re looking for quick SEO tricks or a badge that says "AI optimized."',
  'You need results in thirty days. Anyone promising that is selling something else.',
  'You want more content, not better authority.',
];

export default function FitCheck() {
  return (
    <section className="border-b border-gray-100 bg-white py-16 2xl:py-24" id="fit">
      <div className="mx-auto max-w-[1440px] px-6" data-reveal>
        <div className="relative isolate overflow-hidden rounded-[28px] bg-[#171A10] px-8 py-12 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
        {/* The photograph, softened. scale-110 pushes the blur's faded edge
            outside the rounded corners. */}
        <img
          src={`${BASE}/industry-professional-services-bg.webp`}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full scale-110 select-none object-cover"
          style={{ filter: 'blur(6px)' }}
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(to bottom, rgba(23,26,16,.86) 0%, rgba(23,26,16,.7) 100%)' }}
        />
        <div className="mb-10 max-w-3xl sm:mb-12">
          <SplitReveal
            as="h2"
            className="font-sans text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl"
            html='Are we <span class="italic text-[#CBD0AC]">a fit?</span>'
          />
          <p className="mt-5 text-base font-medium leading-relaxed text-white/70">
            If you&rsquo;re still reading, check this before the form.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
          <div className="rounded-[24px] border border-white/15 bg-white/[0.08] p-7 backdrop-blur-md sm:p-9 transition-transform duration-300 hover:-translate-y-1">
            <p className="mb-5 text-[12px] font-bold uppercase tracking-wider text-[#CBD0AC]">This is for you if</p>
            <ul className="flex flex-col">
              {FOR_YOU.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3.5 border-b border-white/15 py-4 text-[15px] font-medium leading-snug text-white last:border-0"
                >
                  <img
                    src={`${BASE}/isotipo.png`}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    decoding="async"
                    className="mt-[2px] block h-[15px] w-[15px] shrink-0 select-none object-contain"
                    style={{ filter: 'brightness(0) invert(1)', opacity: 0.75 }}
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[24px] border border-white/15 bg-white/[0.08] p-7 backdrop-blur-md sm:p-9 transition-transform duration-300 hover:-translate-y-1">
            {/* The one red on the site, and only on a label — muted enough to
                read as "no" without reading as an error. Lightened on the dark
                ground, where #8A2B12 all but disappears. */}
            <p className="mb-5 text-[12px] font-bold uppercase tracking-wider text-[#E9A189]">Not for you if</p>
            <ul className="flex flex-col">
              {NOT_FOR_YOU.map((line) => (
                <li
                  key={line}
                  className="flex items-start gap-3.5 border-b border-white/15 py-4 text-[15px] font-medium leading-snug text-white/75 last:border-0"
                >
                  <span aria-hidden className="mt-[9px] block h-[1.5px] w-[12px] shrink-0 rounded-full bg-white/50" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}
