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
import BlogSection from '@/components/BlogSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { useRevealBatch } from '@/components/motion';

/**
 * The home page, in the order of the approved copy.
 *
 * One argument, start to finish: who we are, what changed, what everyone else
 * is still selling, what we do instead, a free way to check where you stand,
 * the awkward questions answered, the writing, the proof, the ask.
 *
 * Three sections came off it to get there. The results dashboard and the
 * industries panel were both saying, at length, things the sections around
 * them now say once — and the video was a stop in the middle of an argument
 * that reads better without one. The industries themselves did not go
 * anywhere; they are the ticker under About, which is where the copy puts
 * them. `/industries/` still exists for anyone who wants the long version.
 *
 * The testimonial carousel stays, at Cami's instruction, immediately before
 * the ask — which is the right place for it anyway.
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
        {/* The awkward questions, answered before the call rather than on it. */}
        <HomeFaq />
        {/* "Blogs & guides" — the writing, despite the file name. */}
        <Testimonials />
        {/* "In their words" — the testimonial carousel, despite the file name.
            The proof runs immediately before the ask. */}
        <BlogSection />
        {/* Closes the page: with the form on its own route now, this is the
            home's hand-off to /contact/. */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
