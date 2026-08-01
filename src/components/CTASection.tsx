import React from 'react';
import AuditCTA from '@/components/AuditCTA';
import { SplitReveal } from '@/components/motion';
import { BASE } from '@/lib/site';

export default function CTASection() {
  return (
    <AuditCTA
      id="cta"
      image={`${BASE}/cta-bg.webp`}
      eyebrow="Ready?"
      /* Keeps its own reveal and its italic emphasis, which the shared plain
         heading cannot carry. The home page runs useRevealBatch, so the
         animation has something to drive it here. */
      headingSlot={
        <SplitReveal
          as="h2"
          className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-8 font-sans"
          html="Be the answer buyers <em>find first.</em>"
        />
      }
      copy="Start with an AI visibility audit. See exactly where you stand, and what it takes to lead."
    />
  );
}
