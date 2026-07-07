import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

export default function BlogSection() {
  const posts = [
    {
      tag: 'GEO Strategy',
      date: 'June 18, 2026',
      title: 'Generative Engine Optimization: How LLMs Synthesize Authority',
      desc: 'An in-depth analysis of how ChatGPT, Claude, and Gemini scrape and process brand citations across clinical and technical hubs.'
    },
    {
      tag: 'B2B Research',
      date: 'May 24, 2026',
      title: 'The Rise of Zero-Click Searches: How Buyers Find Answers Today',
      desc: 'Why ranking in Google’s top 10 is no longer sufficient when 69% of searches end without a user clicking a single link.'
    },
    {
      tag: 'Content Engineering',
      date: 'April 09, 2026',
      title: 'Building Authority Infrastructure: How to Seed Your B2B Brand',
      desc: 'A checklist for technical SEO, schema architecture, and consensus PR that convert your company into a cited AI source.'
    }
  ];

  return (
    <section className="bg-white py-24 min-h-[80vh] flex flex-col justify-center border-b border-gray-100" id="blog">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <Eyebrow className="mb-5">Insights</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans"
            html="Inside the AI visibility playbook."
          />
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[45ch]">
            Read our latest research and frameworks on GEO, B2B authority building, and content engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <div data-reveal className="border border-gray-100 bg-white rounded-3xl overflow-hidden hover:shadow-md transition-shadow duration-300" key={idx}>
              <div className="p-6 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#39471D] uppercase tracking-wider bg-[#39471D]/10 px-2 py-0.5 rounded-full">
                  {post.tag}
                </span>
                <span className="text-[11px] text-gray-400 font-bold">{post.date}</span>
              </div>
              <div className="p-8">
                <h3 className="text-base font-bold text-gray-900 leading-snug mb-3 hover:text-[#39471D] transition-colors">
                  <a href="#blog" onClick={(e) => e.preventDefault()}>{post.title}</a>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold mb-6">{post.desc}</p>
                <a href="#blog" onClick={(e) => e.preventDefault()} className="text-xs font-bold text-[#39471D] flex items-center gap-1">
                  Read playbook ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
