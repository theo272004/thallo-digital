'use client';

import React, { useEffect, useRef, useState } from 'react';
import { SplitReveal } from '@/components/motion';
import ShowBuyersPanel from '@/components/ShowBuyersPanel';
import { prefersReducedMotion } from '@/lib/gsap';

/**
 * "Show buyers what your customers already know."
 *
 * No card and no photograph. The video right above it is already a dark
 * framed object, and a second one straight after read oddly (Cami, 1
 * November), so this section is type on the page's own ground.
 *
 * Sizes are the site's, not this section's own: the heading is every h2's
 * text-4xl/5xl and the paragraphs are text-base, the body size of every other
 * paragraph on the page (Cami, 2 November: one size for all running text). Both columns are
 * justified, at Cami's request, so they end square instead of ragged. A larger pass
 * (6xl heading, 2xl copy, one long column) made it the biggest and tallest
 * thing on the page, and Cami asked for it unified with the rest. The room it
 * needs comes from spacing instead.
 *
 * Nothing in the copy moves. Each paragraph used to fill in word by word on
 * scroll, from pale grey to ink; it meant the section could only be read at
 * the speed of the scrollbar, and half-read if you stopped (Cami, 1
 * November), so the words are simply there now. What the fill was for — a
 * skim landing on the argument — the olive still does: the phrases that carry
 * it are set in it. ScrollFill itself is kept in motion/ for other uses. Two
 * earlier versions of the whole section — white cards over a photograph, then
 * a dark photo banner — are in git history.
 *
 * Type alone read as too bare (Cami, 2 November: "está muy solo ahí"), so it
 * takes two of the house's own marks and no new words: the turning isotipo
 * by the heading, as on the About statement, and an olive rule beside the
 * copy that draws down once as the section arrives.
 *
 * Then, the same day, the centred heading over two side-by-side paragraphs
 * went too ("no me gusta que esté estos dos párrafos así"). It is a split
 * now: the heading on the left, the two paragraphs stacked on the right, read
 * at once with nothing waiting below for another scroll. It was a full screen
 * tall at first and read big and empty (Cami, 2 November: "grandota y
 * vacía"), and then, cut down to its copy, too small (3 November). It sits
 * between the two: four fifths of a screen on a desktop, the copy centred in
 * it, with wide gaps.
 *
 * Still "nada" after that (3 November): too empty for what it says. Three
 * wordless drawings beside the heading followed (nodes and lines, hairlines,
 * orbits) and none of them landed. What stands now is the layout of the
 * reference Cami sent the same day: on the left the heading and the two
 * paragraphs as a list you can step through, the active one marked by an
 * olive bar; on the right a pale panel whose small white card shows, without
 * words, what the active paragraph says (ShowBuyersPanel). It steps on its
 * own every few seconds while on screen and stops once someone picks one.
 */

/** A run of the paragraph and the colour it is set in. */
type Part = { text: string; color: string };

const INK = '#4B5563'; // gray-600: a step darker than the body grey, so the olive reads against it
const OLIVE = '#39471D';

const RESEARCH: Part[] = [
  {
    text: 'What customers value most about your business doesn’t always come through in your content. We interview your experts and conduct customer research, using sales materials and search data to really understand',
    color: INK,
  },
  { text: ' how buyers compare their options, what holds them back and what gives them confidence to choose you.', color: OLIVE },
];

const PLAN: Part[] = [
  {
    text: 'Then, we use those insights to plan your website’s structure, decide which content and resources to create and how we’ll distribute them to reach the right people. Over time, useful, credible work gives people',
    color: INK,
  },
  /* The space before "it." is a no-break space, so the last word never ends
     up alone on a line of its own. */
  { text: ' a reason to remember your business and recommend it.', color: OLIVE },
];

const STEPS = [RESEARCH, PLAN];
const STEP_MS = 7000;

export default function HomeApproach() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState(false);

  /* Step on its own while the section is on screen, until someone picks. */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || picked || prefersReducedMotion()) return;
    let timer = 0;
    const io = new IntersectionObserver(([entry]) => {
      window.clearInterval(timer);
      if (entry.isIntersecting) timer = window.setInterval(() => setActive((a) => (a + 1) % STEPS.length), STEP_MS);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [picked]);

  return (
    <section
      ref={sectionRef}
      className="flex items-center bg-[#F7F8F9] py-24 lg:min-h-[80svh] short:pt-28 short:pb-16 border-b border-gray-100"
      id="approach"
    >
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <SplitReveal
            as="h2"
            className="max-w-[20ch] text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans text-balance"
            html='Show Buyers <span class="italic text-[#39471D]">What Your Customers Already Know.</span>'
          />

          <div className="mt-10 flex flex-col gap-2" role="tablist" aria-label="Show Buyers">
            {STEPS.map((parts, i) => {
              const on = i === active;
              return (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setActive(i);
                    setPicked(true);
                  }}
                  className="group relative py-3 pl-6 text-left"
                >
                  {/* The bar: grey track, olive when this one is showing. */}
                  <span
                    aria-hidden
                    className={`absolute inset-y-3 left-0 w-[2px] rounded-full transition-colors duration-500 ${
                      on ? 'bg-[#39471D]' : 'bg-gray-200 group-hover:bg-gray-300'
                    }`}
                  />
                  <Paragraph parts={parts} on={on} />
                </button>
              );
            })}
          </div>
        </div>

        <ShowBuyersPanel active={active} />
      </div>
    </section>
  );
}

/* The inactive paragraph stays fully readable, in the body grey (#6B7280);
   only the active one takes the darker ink and its olive phrase. Nothing is
   ever faded out to be read later. */
function Paragraph({ parts, on }: { parts: Part[]; on: boolean }) {
  return (
    <p className="text-base font-medium leading-relaxed text-justify hyphens-none [text-wrap:pretty]">
      {parts.map((part) => (
        <span
          key={part.text}
          className="transition-colors duration-500"
          style={{ color: on ? part.color : '#6B7280' }}
        >
          {part.text}
        </span>
      ))}
    </p>
  );
}
