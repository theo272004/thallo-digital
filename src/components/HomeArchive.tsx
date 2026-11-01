'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import About from '@/components/About';
import TheProblem from '@/components/TheProblem';
import ResearchAndScan from '@/components/ResearchAndScan';
import PlaybookContrast from '@/components/PlaybookContrast';
import HowItWorks from '@/components/HowItWorks';
import AuditOffer from '@/components/AuditOffer';
import PublicPricing from '@/components/PublicPricing';
import FitCheck from '@/components/FitCheck';
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
 * The home page as it stood until 1 November 2026, kept whole.
 *
 * Cami took the home down to a shorter argument that day (src/app/page.tsx) as
 * a temporary strategy, and asked for everything that came off it to be kept
 * running somewhere — animations included — because it will be used again.
 * This is that copy: the same components in the same order, rendered at
 * /home-archive/.
 *
 * It exists on the GitHub Pages mirror only. The Bluehost workflow deletes
 * out/home-archive/ before uploading, the route is noindex, and it is not in
 * the sitemap, so thallodigital.com never serves it.
 *
 * Putting a section back on the home is moving its line from here to
 * src/app/page.tsx. The git tag `home-2026-10-31` is the same home as a commit.
 *
 * What follows is the original note, unchanged.
 *
 * ---
 *
 * The home page, in the order of the approved copy.
 *
 * One argument, start to finish: who we are, what changed, what everyone else
 * is still selling, what we do instead, a free way to check where you stand,
 * the awkward questions answered, the writing, the ask.
 *
 * Four sections came off it to get there. The results dashboard and the
 * industries panel were both saying, at length, things the sections around
 * them now say once; the video was a stop in the middle of an argument that
 * reads better without one; and the testimonial carousel is commented out
 * below rather than deleted. The industries themselves did not go anywhere —
 * they are the ticker under About, which is where the copy puts them, and
 * `/industries/` still holds the long version.
 */
export default function HomeArchive() {
  useRevealBatch('home-archive');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        {/* Who the buyer is and what they ask while researching. Straight
            under the hero since Cami's pass of 3 October. */}
        <TheProblem />
        {/* Who we are, and the one idea the whole page rests on. */}
        <About />
        {/* The proof that we measure what we sell (The AI Shortlist) beside the
            same measurement run on your own brand (the free scan) — one section,
            two cards, since Cami's pass of 5 October. Straight above the
            playbook since 6 October, where Cami placed it. */}
        <ResearchAndScan />
        {/* What the alternative is, and why it stopped working. */}
        <PlaybookContrast />
        {/* What we do instead — read as the answer to the two above it. */}
        <HowItWorks />
        {/* The paid first step, with its price and its scope. */}
        <AuditOffer />
        {/* All three prices at once, so nobody has to ask. */}
        <PublicPricing />
        {/* Who this is for and who it is not, before the form. */}
        <FitCheck />
        {/* The awkward questions, answered before the writing and the ask.
            They spent a week as the last thing on the page; they sit above the
            closing panel again at Cami's request, which is why the intro
            sentence points at the form *below* it. */}
        <HomeFaq />
        {/* "Blogs & guides" — the writing, despite the file name. */}
        <Testimonials />
        {/* Closes the argument: with the form on its own route now, this is the
            home's hand-off to /contact/. */}
        <CTASection />

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

      </main>
      <Footer />
    </div>
  );
}
