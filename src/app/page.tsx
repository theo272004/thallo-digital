'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TheProblem from '@/components/TheProblem';
import HowItWorks from '@/components/HowItWorks';
import ResultsDashboard from '@/components/ResultsDashboard';
import Testimonials from '@/components/Testimonials';
import VideoSection from '@/components/VideoSection';
import BlogSection from '@/components/BlogSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import Industries from '@/components/Industries';
import About from '@/components/About';
import { useRevealBatch } from '@/components/motion';

export default function Home() {
  useRevealBatch('home');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        {/* Who Thallo is comes straight off the hero. About carries the grey
            band so the alternation still starts on a tint here. */}
        <About />
        {/* The partners live on /about/ rather than here: the home is a single
            argument from hero to CTA, and a team block interrupts it. */}
        {/* What we do comes before why it matters: the approach answers the
            "who are you" the hero and About just raised, and the shift then
            lands as the reason the work is built that way. */}
        <HowItWorks />
        <TheProblem />
        {/* Proof that we measure it, and the scanner that does — before the
            categories, so the tool is met while the argument is still warm. */}
        <ResultsDashboard />
        <Industries />
        {/* Video runs before the resources library, so the film introduces the
            writing rather than following it. */}
        <VideoSection />
        {/* The resources library, despite the file name. */}
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
