'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import HomeHero from '@/components/HomeHero';
import HomeVideo from '@/components/HomeVideo';
import HomeApproach from '@/components/HomeApproach';
import HowItWorks, { type HowItWorksStep } from '@/components/HowItWorks';
import HomeIndustries from '@/components/HomeIndustries';
import HomeEngagements from '@/components/HomeEngagements';
import HomeFaq from '@/components/HomeFaq';
import Testimonials from '@/components/Testimonials';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';
import { useRevealBatch } from '@/components/motion';
import { BASE } from '@/lib/site';

/**
 * The home page, as of 1 November 2026.
 *
 * Shorter on purpose, and for now: Cami cut it down to her homepage copy of
 * that day as part of a strategy, and everything that came off — the
 * phone-to-browser hero, the shift cards, the turning flower, the research and
 * scan pair, the playbook, the audit, the prices, the fit check — runs whole
 * on /home-archive/ (src/components/HomeArchive), on the mirror only, because
 * it will be used again.
 *
 * Everything from the hero to "How can we work together?" uses the words of
 * that copy and nothing else. The FAQ, the writing and the closing panel are
 * unchanged.
 */

/* "What we do for your business" — the branch section, with the new words. */
const CAPABILITIES: HowItWorksStep[] = [
  {
    title: 'Research And Content',
    body: 'We turn expert interviews and customer research into a clear content strategy and resources that demonstrate your expertise. That includes service pages, blog posts, white papers, case studies, original research and articles for relevant publications.',
    link: { label: 'See Our Content Work', href: `${BASE}/results/` },
  },
  {
    title: 'Website Design And Development',
    body: 'We plan, design and build websites that make your offer clear and give potential customers a straightforward path to contact you. Working with Kaiva Studio, we manage the architecture, navigation, design, development and launch.',
    link: { label: 'Discuss Your Website', href: '#cta' },
  },
  {
    title: 'Search And AI Visibility',
    body: 'We address the technical and content issues that affect how your business is found and understood in search and AI answers, then track visibility and relevant website actions to guide improvements.',
    link: { label: 'Explore AI Visibility', href: `${BASE}/thallo-ai/method/` },
  },
  {
    title: 'Digital PR And Distribution',
    body: 'We develop media pitches, bylined articles and press releases around your expertise and pursue relevant publication opportunities. We also adapt the work for LinkedIn, newsletters and other channels your customers follow.',
    link: { label: 'Discuss PR And Distribution', href: '#cta' },
  },
];

export default function Home() {
  useRevealBatch('home');

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
        <HomeHero />
        <HomeVideo />
        <HomeApproach />
        <HowItWorks
          id="services"
          heading='What We Do <span class="italic text-[#39471D]">For Your Business.</span>'
          intro={null}
          steps={CAPABILITIES}
        />
        <HomeIndustries />
        <HomeEngagements />
        <HomeFaq />
        {/* "Blogs & guides" — the writing, despite the file name. */}
        <Testimonials />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
