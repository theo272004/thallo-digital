import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ClientLogos from './components/ClientLogos';
import TheProblem from './components/TheProblem';
import Services from './components/Services';
import HowItWorks from './components/HowItWorks';
import ResultsDashboard from './components/ResultsDashboard';
import Testimonials from './components/Testimonials';
import VideoSection from './components/VideoSection';
import VisibilityCheck from './components/VisibilityCheck';
import BlogSection from './components/BlogSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import ThalloAIPage from './components/ThalloAIPage';

export default function App() {
  const [view, setView] = useState('home'); // 'home' or 'ai-tool'

  return (
    <div className="app-container">
      {/* Global Navigation */}
      <Navbar currentView={view} setView={setView} />

      {/* Main Content Router */}
      <main>
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

      {/* Global Footer */}
      <Footer setView={setView} />
    </div>
  );
}
