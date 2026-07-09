import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

export default function About() {
  return (
    <section
      className="relative bg-white py-28 border-b border-gray-100 overflow-hidden"
      id="about"
    >
      {/* Photo — upper-right, bleeds out of section */}
      <img
        src="/thallo-digital/pc-cafe.png"
        alt=""
        aria-hidden="true"
        className="absolute -right-16 -top-8 w-[480px] lg:w-[580px] xl:w-[640px] h-auto object-contain pointer-events-none select-none"
        style={{ transform: 'rotate(6deg)' }}
      />

      {/* Photo — lower-left, mirror / offset instance */}
      <img
        src="/thallo-digital/pc-cafe.png"
        alt=""
        aria-hidden="true"
        className="absolute -left-20 -bottom-10 w-[300px] lg:w-[360px] h-auto object-contain pointer-events-none select-none"
        style={{ transform: 'rotate(-8deg) scaleX(-1)' }}
      />

      {/* Text — centered, above decorative images */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
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
        </div>
      </div>
    </section>
  );
}
