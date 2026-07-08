import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

export default function About() {
  return (
    <section className="bg-white py-16 2xl:py-28 min-h-[80vh] flex flex-col justify-center border-b border-gray-100" id="about">
      <div className="max-w-[1440px] mx-auto px-6">
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
    </section>
  );
}
