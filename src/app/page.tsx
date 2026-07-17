'use client';

import React, { useState, useEffect } from 'react';
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
import ThalloAIPage from '@/components/ThalloAIPage';
import ServicesPage from '@/components/ServicesLanding';
import IndustriesPage from '@/components/IndustriesLanding';
import Industries from '@/components/Industries';
import About from '@/components/About';
import { useRevealBatch } from '@/components/motion';

export default function Home() {
  const [view, setView] = useState('home'); // 'home' or 'ai-tool'

  // Only run reveal batch on home — other views handle their own visibility.
  useRevealBatch(view === 'home' ? view : null);

  // When leaving home, clear GSAP inline styles so elements in other views
  // don't inherit opacity:0/visibility:hidden from the batch animation.
  useEffect(() => {
    if (view !== 'home') {
      document.querySelectorAll('[style]').forEach((el) => {
        const h = el as HTMLElement;
        h.style.removeProperty('opacity');
        h.style.removeProperty('visibility');
        h.style.removeProperty('transform');
        h.style.removeProperty('translate');
        h.style.removeProperty('rotate');
        h.style.removeProperty('scale');
      });
    }
  }, [view]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation Header */}
      <Navbar currentView={view} setView={setView} />

      <main className="flex-grow">
        {view === 'home' ? (
          <>
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
          </>
        ) : view === 'services' ? (
          <ServicesPage />
        ) : view === 'industries' ? (
          <IndustriesPage />
        ) : (
          <ThalloAIPage />
        )}
      </main>

      {/* Footer */}
      <Footer setView={setView} />
    </div>
  );
}
