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
/* BlogSection — the testimonial carousel, despite the file name. */
import BlogSection from '@/components/BlogSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { useRevealBatch } from '@/components/motion';

/**
 * The home page, in the order of the approved copy.
 *
 * One argument, start to finish: who we are, what changed, what everyone else
 * is still selling, what we do instead, a free way to check where you stand,
 * the awkward questions answered, the writing, the ask.
 *
 * Four sections came off it to get there. The results dashboard and the
 * industries panel were both saying, at length, things the sections around
 * them now say once; the video was a stop in the middle of an argument that
 * reads better without one. The testimonial carousel came off with them, on 8
 * August 2026, because its six quotes were invented; it is back above the
 * scanner strip now that three real clients have said something we can print.
 * The industries themselves did not go anywhere —
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
        {/* Somebody other than us saying it worked, placed where the reader has
            just been told what we do and has not yet been asked for anything.
            It came off the page in August because the six quotes on it were
            invented; it goes back on now that the three on it are real. */}
        <BlogSection />
        {/* The cheapest possible next step, offered once. */}
        <ScannerStripe />
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

      </main>
      <Footer />
    </div>
  );
}
