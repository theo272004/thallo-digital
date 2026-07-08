import React from 'react';

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
    <section className="bg-white py-28 border-b border-gray-100" id="testimonials">
      <div className="max-w-[1440px] mx-auto px-6">

        {/* ── Single row: image (40%) + three cards side-by-side (60%) ─ */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-stretch">

          {/* Featured card — heading lives inside the image */}
          <div className="relative overflow-hidden rounded-[28px] bg-[#1a1f10] min-h-[380px] lg:min-h-0 lg:w-[40%] lg:flex-shrink-0">
            <img
              src="/thallo-digital/shift.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            <div className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-10">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50 mb-4">
                From the field
              </span>
              <h2 className="text-2xl sm:text-[2rem] font-bold text-white leading-tight">
                Notes on getting found,<br />and trusted.
              </h2>
            </div>
          </div>

          {/* Three editorial cards — horizontal row, equal widths */}
          <div className="flex flex-col sm:flex-row gap-6 flex-1">
            {ARTICLES.map((a) => (
              <div
                key={a.title}
                className="flex-1 border border-gray-100 rounded-3xl p-7 bg-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5 gap-2 flex-wrap">
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#39471D] bg-[#39471D]/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                      {a.badge}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                      {a.date} · {a.read}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 leading-snug mb-2">{a.title}</h3>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">{a.desc}</p>
                </div>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#39471D]"
                >
                  Read →
                </a>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
