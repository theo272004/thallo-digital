import React from 'react';

const ARTICLES = [
  {
    badge: 'Results',
    date:  'May 2026',
    read:  '5 min',
    title: 'Mid-market AI adoption playbook',
    desc:  'Why distribution wins before differentiation.',
  },
  {
    badge: 'Strategy',
    date:  'Apr 2026',
    read:  '4 min',
    title: 'High-intent content that ranks in AI',
    desc:  'Structure, sources, and semantic lift.',
  },
  {
    badge: 'Growth',
    date:  'Mar 2026',
    read:  '6 min',
    title: 'From rankings to recommendations',
    desc:  'The shift beyond traditional search.',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-28 border-b border-gray-100" id="testimonials">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">

          {/* ── Featured card — dark, image-backed ────────────────────── */}
          <div className="relative overflow-hidden rounded-[28px] bg-[#1a1f10] min-h-[480px]">
            <img
              src="/thallo-digital/shift.jpg"
              alt="Northwind case study"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            <div className="relative z-10 h-full flex flex-col justify-between p-8 sm:p-10">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/50">
                Featured · 2 min
              </span>
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-5">
                  How we made Northwind the cited authority in 90&nbsp;days.
                </h3>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white/60 hover:text-white transition-colors duration-200"
                >
                  Read the case study →
                </a>
              </div>
            </div>

            {/* Play button */}
            <button
              className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/25 transition-colors duration-200"
              aria-label="Play video"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>

          {/* ── Three editorial article cards ─────────────────────────── */}
          <div className="flex flex-col gap-5">
            {ARTICLES.map((a) => (
              <div
                key={a.title}
                className="flex-1 border border-gray-100 rounded-3xl p-8 bg-white hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-shadow duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#39471D] bg-[#39471D]/10 px-2.5 py-1 rounded-full">
                      {a.badge}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">
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
