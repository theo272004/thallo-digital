'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import TheProblem from '@/components/TheProblem';
import PlaybookContrast from '@/components/PlaybookContrast';
import HowItWorks from '@/components/HowItWorks';
import ScannerStripe from '@/components/ScannerStripe';
import HomeFaq from '@/components/HomeFaq';
import Testimonials from '@/components/Testimonials';
/* BlogSection — the testimonial carousel — is hidden further down this file
   rather than removed. Its import is commented out with it, because an unused
   import is a lint error and would block the build.
import BlogSection from '@/components/BlogSection'; */
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { useRevealBatch } from '@/components/motion';

/**
 * The home page, in the order of the approved copy.
 *
 * One argument, start to finish: who we are, what changed, what everyone else
 * is still selling, what we do instead, a free way to check where you stand,
 * the writing, the awkward questions answered, the ask.
 *
 * Four sections came off it to get there. The results dashboard and the
 * industries panel were both saying, at length, things the sections around
 * them now say once; the video was a stop in the middle of an argument that
 * reads better without one; and the testimonial carousel is commented out
 * below rather than deleted. The industries themselves did not go anywhere —
 * they are the ticker under About, which is where the copy puts them, and
 * `/industries/` still holds the long version.
 */
export default function Home() {
  useRevealBatch('home');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        {/* Who we are, and the one idea the whole page rests on. */}
        <About />
        {/* What changed, and the three figures that show it. */}
        <TheProblem />
        {/* What the alternative is, and why it stopped working. */}
        <PlaybookContrast />
        {/* What we do instead — read as the answer to the two above it. */}
        <HowItWorks />
        {/* The cheapest possible next step, offered once. */}
        <ScannerStripe />
        {/* "Blogs & guides" — the writing, despite the file name. */}
        <Testimonials />
        {/* The awkward questions, answered before the call rather than on it.
            It sits after the writing rather than before it: someone who has
            read this far is closer to deciding than to browsing, and the last
            thing they should meet before the ask is the price, the timeline
            and what happens if it does not work. */}
        <HomeFaq />

        {/*
          ── HIDDEN, NOT DELETED ─────────────────────────────────────────────
          <BlogSection /> — the testimonial carousel, headed "Teams that became
          the answer", despite the file name. Taken off the home on 8 August
          2026 at Cami's request.

          Nothing else references it, so it ships nowhere while this line is
          commented out. The component itself is untouched in
          src/components/BlogSection.tsx and its content is intact; putting it
          back is uncommenting the line below and restoring the import at the
          top of this file.

          Worth a decision rather than a drift: a home page with no third-party
          proof on it is a deliberate choice, not an oversight, and if it stays
          off then the quotes should probably find a home somewhere else rather
          than sitting in a component nobody renders.

          <BlogSection />
          ────────────────────────────────────────────────────────────────────
        */}

        {/* Closes the page: with the form on its own route now, this is the
            home's hand-off to /contact/. */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
