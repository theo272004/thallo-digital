import React from 'react';
import AuditCTA from '@/components/AuditCTA';
import { CONVERSATION_PLANS } from '@/components/PlanEnquiryForm';
import { SplitReveal } from '@/components/motion';
import { BASE } from '@/lib/site';

/**
 * The home page's closing panel.
 *
 * Same panel as every other page — Cami's note on 3 October was "the design
 * stays, the words change" — but the words are a different ask: not "book an
 * audit" but "let's work out where to start", with the three steps that follow
 * the form and a smaller form behind them. The two buttons go, because the
 * footnote now carries the scan and the form is the booking.
 */
export default function CTASection() {
  return (
    <AuditCTA
      id="cta"
      image={`${BASE}/cta-bg.webp`}
      eyebrow="Your next step"
      /* Keeps its own reveal and its italic emphasis, which the shared plain
         heading cannot carry. The home page runs useRevealBatch, so the
         animation has something to drive it here. */
      headingSlot={
        <SplitReveal
          as="h2"
          className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-8 font-sans"
          html="Let&rsquo;s work out <em>where to start.</em>"
        />
      }
      copy="Tell us about your business and what you want to improve. We'll discuss whether an audit, a project or ongoing support makes sense."
      steps={['Tell us where you stand', 'Discuss your goals and fit', 'Review a clear scope before committing']}
      footnote={
        <>
          Prefer to explore first?{' '}
          <a href={`${BASE}/thallo-ai/scan/`} className="font-semibold text-white underline underline-offset-4 hover:text-[#CBD0AC]">
            Check my visibility
          </a>{' '}
          · free scan, no account.
        </>
      }
      actions={false}
      plans={CONVERSATION_PLANS}
      activePlans={['Not sure yet']}
      formVariant="conversation"
    />
  );
}
