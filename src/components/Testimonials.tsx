'use client';

import React, { useEffect, useRef } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

export default function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);

  const reviews = [
    {
      initials: 'DM',
      name: 'Dana Mercer',
      role: 'VP Marketing, Ledgerly',
      stars: '★★★★★',
      quote: 'Within a quarter, we were the name coming up in ChatGPT for our category. Sales stopped having to explain who we were.'
    },
    {
      initials: 'RK',
      name: 'Raj Kapoor',
      role: 'Founder, Vireo Health',
      stars: '★★★★★',
      quote: 'They didn’t just publish more. They made the accurate version of our story the one the market and the AI actually find.'
    },
    {
      initials: 'EC',
      name: 'Elena Castro',
      role: 'CEO, Calderon & Co',
      stars: '★★★★★',
      quote: 'The audit alone paid for itself. We finally saw exactly where we were invisible and why competitors were winning.'
    },
    {
      initials: 'TN',
      name: 'Tom Nguyen',
      role: 'Head of Growth, Northwind',
      stars: '★★★★★',
      quote: 'Authority that compounds is real. Every month our content works harder, and it’s not something a competitor can copy overnight.'
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
    <section className="bg-white py-16 xl:py-24 min-h-[80vh] flex flex-col justify-center border-b border-gray-100" id="testimonials">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <Eyebrow className="mb-5">In their words</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans"
            html="Teams that became the answer."
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
                <div className="w-8 h-8 rounded-full bg-[#39471D]/10 text-[#39471D] font-bold flex items-center justify-center text-xs">
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
