import React from 'react';
import { SplitReveal } from '@/components/motion';
import IndustryTicker from '@/components/ui/IndustryTicker';
import SpinFlower from '@/components/ui/SpinFlower';
import { BASE } from '@/lib/site';

export default function About() {
  return (
    /* minHeight: 45vw keeps section height fixed regardless of photo size
       (matches what the section was when photo was 90% wide at 2:1 ratio) */
    <section
      /* White, not the #F7F8F9 tint. The page alternates, and this is the first
         slot after the hero: grey here put three tinted sections in a row
         before the first white one. The hairline underneath is what separates
         it from the grey section following — the band was never doing that
         work on its own. */
      className="relative bg-white border-b border-gray-100 py-24 xl:py-0 xl:min-h-[45vw]"
      id="about"
    >

      {/* Text — normal flow on small screens, absolute-centered on xl+ */}
      <div className="xl:absolute xl:inset-0 flex items-center justify-center px-6" style={{ zIndex: 10 }}>
        <div className="max-w-3xl text-center relative">
          {/* Mobile: in normal flow above the label */}
          <div className="mb-6 flex justify-center xl:hidden">
            <SpinFlower alt="Thallo" className="block w-16 h-16 opacity-80" />
          </div>

          {/* Desktop: out of flow above the text block, for the same reason the
              ticker sits out of flow below it — this block is absolutely centred
              at xl+, so anything that adds height here drags the laptop and
              phone photographs along with it. */}
          <div
            className="hidden xl:block absolute left-1/2 -translate-x-1/2"
            style={{ bottom: '100%', marginBottom: '24px' }}
          >
            <SpinFlower alt="Thallo" className="block w-16 h-16 opacity-80" />
          </div>

          <SplitReveal
            as="h2"
            /* Balanced onto three lines. Greedy wrapping broke this headline
               into four, with "building." alone on the last — and a capped
               measure only made the ragging worse. Balancing evens the three
               lines out; the widest lands at roughly the width the paragraph
               below already runs to, so it clears the devices the same way. */
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans text-balance"
            html='Authority is the one asset <span class="italic text-[#39471D]">that appreciates.</span>'
          />
          <p className="text-gray-500 font-medium text-base sm:text-lg leading-relaxed">
            Ads stop the day you stop paying. Rankings move with every update.{' '}
            <strong className="text-gray-900 font-semibold">Authority compounds.</strong> Every study you publish, every
            citation you earn, every room where your name comes up makes the next one easier. That&rsquo;s what we build
            for companies in high-consideration industries.
          </p>

          {/* Mobile: in normal flow */}
          <div className="mt-8 xl:hidden">
            <IndustryTicker />
          </div>

          {/* Desktop: absolutely positioned below the text block — does NOT add to block height,
              so the flex-centering and image position stay exactly as before */}
          <div
            className="hidden xl:block absolute left-1/2 -translate-x-1/2"
            style={{ top: '100%', marginTop: '28px' }}
          >
            <IndustryTicker />
          </div>
        </div>
      </div>

      {/* Photo — only shown at xl+ where the composition has room to breathe.

         Responsive width: the laptop and phone sit at the left/right edges of this
         single composite image with empty space in the middle where the text lives.
         The text block has a FIXED width (max-w-3xl), but the image scales with the
         viewport — so on narrower screens (e.g. a 13" MacBook at ~1440px) the devices
         creep inward and cover the text. Growing the image pushes the devices back out
         toward the screen edges, reopening the gap for the text.

         width = max(72%, 1368px) behaves like this:
           • ≥ 1920px (large desktop): resolves to 72% — unchanged from the original.
           • < 1920px: locks to a fixed 1368px, which as a % of the viewport grows from
             ~71% (@1920px) to ~95% (@1440px) to ~107% (@1280px) so the text stays clear.
         REFERENCE POINTS: 1440px → ~95%   1920px → 72% (crossover to the 72% baseline).
         To make it bigger/smaller at 1440 without touching desktop, adjust the 1368px.
         The 56.6% left shifts the whole composition slightly to the right. */}
      {/* Phone + coffee — LEFT, lower to align with "our clients" in body paragraph.
          ~80px below section center. Right edge 6px inside text-block left edge. */}
      <img loading="lazy" decoding="async"
        src={`${BASE}/cel-cafe.webp`}
        alt=""
        aria-hidden="true"
        className="hidden xl:block absolute pointer-events-none select-none"
        style={{
          zIndex: 30,
          top: 'calc(50% + 115px)',
          right: 'calc(50% + 335px)',
          height: 'clamp(150px, 18vw, 270px)',
          width: 'auto',
          maxWidth: 'none',
          transform: 'translateY(-50%)',
        }}
      />

      {/* Laptop — RIGHT, slightly above center to align with "built for" (heading line 1).
          Moved left so leading edge nearly touches the last word of that line. */}
      <img loading="lazy" decoding="async"
        src={`${BASE}/pc-about.webp`}
        alt=""
        aria-hidden="true"
        className="hidden xl:block absolute pointer-events-none select-none"
        style={{
          zIndex: 30,
          top: 'calc(50% - 90px)',
          left: 'calc(50% + 275px)',
          height: 'clamp(200px, 26vw, 400px)',
          width: 'auto',
          maxWidth: 'none',
          transform: 'translateY(-50%)',
        }}
      />

    </section>
  );
}
