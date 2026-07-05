'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ClientLogos from '@/components/ClientLogos';
import TheProblem from '@/components/TheProblem';
import Services from '@/components/Services';
import HowItWorks from '@/components/HowItWorks';
import ResultsDashboard from '@/components/ResultsDashboard';
import Testimonials from '@/components/Testimonials';
import VideoSection from '@/components/VideoSection';
import VisibilityCheck from '@/components/VisibilityCheck';
import BlogSection from '@/components/BlogSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import ThalloAIPage from '@/components/ThalloAIPage';

export default function Home() {
  const [view, setView] = useState('home'); // 'home' or 'ai-tool'

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation Header */}
      <Navbar currentView={view} setView={setView} />

      <main className="flex-grow">
        {view === 'home' ? (
          <>
            <Hero />
            <ClientLogos />
            <TheProblem />
            <Services />
            <HowItWorks />
            <ResultsDashboard />
            <Testimonials />
            <VideoSection />
            <VisibilityCheck />
            <BlogSection />
            <CTASection />
          </>
        ) : (
          <ThalloAIPage />
        )}
      </main>

      {/* Footer */}
      <Footer setView={setView} />
    </div>
  );
}
