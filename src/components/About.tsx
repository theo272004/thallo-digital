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

      {/* Photo — only shown at xl+ where the composition has room to breathe */}
      <img
        src="/thallo-digital/pc-cafe.png"
        alt=""
        aria-hidden="true"
        className="hidden xl:block absolute w-[72%] pointer-events-none select-none"
        style={{ zIndex: 20, top: '50%', left: '55.2%', transform: 'translate(-50%, -50%)' }}
      />

    </section>
  );
}
