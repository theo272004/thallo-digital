import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

const INDUSTRIES = [
  {
    title: 'Specialized software',
    desc: 'Category-defining SaaS where the winner is the name buyers already trust.',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M8 20h8M9 8l-2 3 2 3M15 8l2 3-2 3" />
      </>
    ),
  },
  {
    title: 'Fintech',
    desc: 'Where a wrong vendor is costly to unwind, and credibility clears the shortlist.',
    icon: (
      <>
        <path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6" />
      </>
    ),
  },
  {
    title: 'Health tech',
    desc: 'Regulated, high-stakes buying that rewards the most credible, best-documented source.',
    icon: (
      <>
        <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z" />
        <path d="M9 11h2v-2h2v2h2" />
      </>
    ),
  },
  {
    title: 'Professional services',
    desc: 'Expertise businesses that live or die on reputation and referral.',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
      </>
    ),
  },
  {
    title: 'Health & recovery',
    desc: 'Deeply researched, deeply personal decisions where trust is everything.',
    icon: (
      <>
        <path d="M12 3v18M5 8c0 4 3 6 7 6M19 8c0 4-3 6-7 6" />
      </>
    ),
  },
  {
    title: 'Benefits & claims',
    desc: 'Complex, confusing choices where the clear, trusted guide wins.',
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" />
      </>
    ),
  },
];

export default function Industries() {
  return (
    <section className="bg-white py-28 min-h-[80vh] flex flex-col justify-center border-b border-gray-100" id="industries">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <Eyebrow className="mb-5">Industries</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6 font-sans leading-[1.05]"
            html="Where trust decides the sale."
          />
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch]">
            We go deep in high-consideration categories, where buyers research hard and choose the provider they trust
            most.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INDUSTRIES.map((ind) => (
            <div
              key={ind.title}
              data-reveal
              className="group p-8 bg-white border border-gray-100 rounded-3xl transition-all duration-300 hover:bg-[#39471D] hover:-translate-y-1 hover:shadow-[0_24px_60px_-24px_rgba(57,71,29,0.5)]"
            >
              <div className="w-10 h-10 flex items-center justify-center text-[#55672E] group-hover:text-white transition-colors mb-6">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {ind.icon}
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 group-hover:text-white transition-colors mb-2.5">
                {ind.title}
              </h3>
              <p className="text-sm text-gray-500 group-hover:text-[#CBD0AC] leading-relaxed font-medium transition-colors">
                {ind.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
