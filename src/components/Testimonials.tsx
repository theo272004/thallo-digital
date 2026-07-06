'use client';

import React, { useEffect, useRef } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  const reviews = [
    {
      initials: 'MC',
      name: 'Mark Cleary',
      role: 'VP of Growth, Meridian',
      stars: '★★★★★',
      quote: 'Before Thallo, Perplexity and ChatGPT kept recommending our competitors. Within 90 days, we became the default cited choice for enterprise queries. The ROI was clear immediately.'
    },
    {
      initials: 'NH',
      name: 'Natalie Horn',
      role: 'CMO, Northwind FinTech',
      stars: '★★★★★',
      quote: 'Zero-click searches were killing our pipeline. Thallo built the research asset infrastructure that turned our brand into the authority B2B buyers find first.'
    },
    {
      initials: 'SL',
      name: 'Sarah Ledger',
      role: 'Founder, Ledgerly',
      stars: '★★★★★',
      quote: 'They don’t sell standard B2B SEO. They build the distribution consensus and co-citations that dictate what AI tells buyers. Absolute game changer.'
    }
  ];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const interval = setInterval(() => {
      const firstChild = track.querySelector('.quote-card') as HTMLElement;
      if (!firstChild) return;
      
      const cardWidth = firstChild.offsetWidth + 20; 
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-white py-24 border-b border-gray-100" id="testimonials">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <Eyebrow className="mb-5">Social Proof</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-medium tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans"
            html="Recommended by industry leaders."
          />
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[45ch]">
            Read how fast-growing fintechs, SaaS providers, and treatment centers use Thallo to establish visibility.
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory" ref={trackRef}>
          {reviews.map((rev, idx) => (
            <div className="quote-card min-w-[280px] sm:min-w-[340px] p-8 bg-gray-50/50 border border-gray-100 rounded-3xl snap-start flex flex-col justify-between" key={idx}>
              <div>
                <div className="text-[#39471D] text-xs mb-4">{rev.stars}</div>
                <p className="text-xs text-gray-500 italic leading-relaxed font-semibold mb-8">“{rev.quote}”</p>
              </div>
              <div className="flex items-center gap-3 mt-auto">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  {rev.initials}
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-900">{rev.name}</div>
                  <div className="text-[11px] text-gray-400 font-bold">{rev.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
