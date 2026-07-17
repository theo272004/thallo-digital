'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import TheProblem from '@/components/TheProblem';
import Services from '@/components/Services';
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
        <About />
        <TheProblem />
        <HowItWorks />
        <Industries />
        <ResultsDashboard />
        <Testimonials />
        <VideoSection />
        <Services />
        <BlogSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
