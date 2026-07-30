import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';

/* Despite the file name, this is the resources library — the review carousel
   lives in BlogSection.tsx. The cards deliberately surface only category,
   title and read time; `date` and `desc` stay in the data for the day these
   become real posts with their own routes. */
const ARTICLES = [
  {
    badge: 'GEO',
    date:  'June 2026',
    read:  '7 min',
    title: 'What "share of answer" really measures',
    desc:  'And why it matters more than rankings now.',
  },
  {
    badge: 'Content',
    date:  'May 2026',
    read:  '5 min',
    title: "Original research beats AI's infinite content",
    desc:  "The one asset machines can't fabricate.",
  },
  {
    badge: 'Strategy',
    date:  'May 2026',
    read:  '6 min',
    title: "Why authority compounds and ads don't",
    desc:  'Renting attention vs. owning credibility.',
  },
];

export default function Testimonials() {
  return (
    /* id="blog" is the target the navbar and footer have always pointed at. */
    <section className="bg-[#F7F8F9] py-20 2xl:py-24 border-b border-gray-100" id="blog">
      <div className="max-w-[1440px] mx-auto px-6">

        <div className="flex flex-col items-center text-center mb-12">
          <Eyebrow center className="mb-5 justify-center">Blog</Eyebrow>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans max-w-2xl">
            Notes on getting found,<br />and trusted.
          </h2>
        </div>

        {/* A library, not a feed: one row of equal cards, no thumbnails. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARTICLES.map((a) => (
            <article
              key={a.title}
              data-reveal
              className="border border-gray-200 rounded-3xl p-8 bg-white flex flex-col items-center text-center shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] hover:shadow-[0_16px_40px_-14px_rgba(23,26,16,0.22)] transition-shadow duration-300"
            >
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#39471D] bg-[#39471D]/10 px-2.5 py-1 rounded-full">
                {a.badge}
              </span>

              <h3 className="mt-5 text-lg font-bold text-gray-900 leading-snug text-balance">
                {a.title}
              </h3>

              <span className="mt-3 font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-gray-400">
                {a.read} read
              </span>

              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#39471D]"
              >
                Read →
              </a>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}
