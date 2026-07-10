import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

export default function About() {
  return (
    <section className="relative bg-white border-b border-gray-100" id="about">
      <div className="relative">

        {/* Text — centered over the composition; sits behind the photo objects */}
        <div className="absolute inset-0 flex items-center justify-center px-6" style={{ zIndex: 10 }}>
          <div className="max-w-3xl text-center">
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

        {/* Photo in normal flow — sets section height naturally.
            z-index 20 puts the laptop + phone objects on top of the text;
            the transparent center of the PNG lets the text show through. */}
        <img
          src="/thallo-digital/pc-cafe.png"
          alt=""
          aria-hidden="true"
          className="relative w-[82%] mx-auto h-auto block pointer-events-none select-none"
          style={{ zIndex: 20 }}
        />

      </div>
    </section>
  );
}
