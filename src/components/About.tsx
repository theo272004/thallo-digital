import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

export default function About() {
  return (
    <section
      className="relative bg-white py-28 border-b border-gray-100 overflow-hidden"
      id="about"
    >
      {/* Text — centered, sits BEHIND the photos */}
      <div className="relative max-w-[1440px] mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
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

      {/* Laptop — right side of the photo, IN FRONT of text */}
      <img
        src="/thallo-digital/pc-cafe.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          zIndex: 20,
          right: -60,
          top: '50%',
          transform: 'translateY(-52%) rotate(3deg)',
          width: 580,
          height: 380,
          objectFit: 'cover',
          objectPosition: 'right top',
        }}
      />

      {/* Phone + coffee — left side of the photo, IN FRONT of text */}
      <img
        src="/thallo-digital/pc-cafe.png"
        alt=""
        aria-hidden="true"
        className="absolute pointer-events-none select-none"
        style={{
          zIndex: 20,
          left: -30,
          bottom: -20,
          transform: 'rotate(-6deg)',
          width: 320,
          height: 260,
          objectFit: 'cover',
          objectPosition: 'left bottom',
        }}
      />
    </section>
  );
}
