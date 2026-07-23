import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';
import IndustryTicker from '@/components/ui/IndustryTicker';

export default function About() {
  return (
    /* minHeight: 45vw keeps section height fixed regardless of photo size
       (matches what the section was when photo was 90% wide at 2:1 ratio) */
    <section
      className="relative bg-white border-b border-gray-100 py-24 xl:py-0 xl:min-h-[45vw]"
      id="about"
    >

      {/* Text — normal flow on small screens, absolute-centered on xl+ */}
      <div className="xl:absolute xl:inset-0 flex items-center justify-center px-6" style={{ zIndex: 10 }}>
        <div className="max-w-3xl text-center relative">
          <Eyebrow center className="mb-5 justify-center">About Thallo</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans"
            html="Premium authority, without the premium agency price."
          />
          <p className="text-gray-500 font-medium text-base sm:text-lg leading-relaxed">
            Thallo builds authority for companies in high-consideration industries. We combine strong fundamentals with
            strategies tuned to how buyers research and decide today, so our clients stay the trusted answer no matter how
            the channels change. A senior team, deliberately small, focused on doing a few things exceptionally well.
          </p>

          {/* IndustryTicker hidden provisionally */}
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
      <img
        src="/thallo-digital/cel-cafe.png"
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

      {/* Laptop — RIGHT, slightly above center to align with "without the" (heading line 1).
          Moved left so leading edge nearly touches the 'e' of "the". */}
      <img
        src="/thallo-digital/pc-about.png"
        alt=""
        aria-hidden="true"
        className="hidden xl:block absolute pointer-events-none select-none"
        style={{
          zIndex: 30,
          top: 'calc(50% - 60px)',
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
