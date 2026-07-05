import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

export default function Services() {
  const list = [
    {
      idx: '01',
      kicker: 'Entry',
      title: 'AI Visibility Audit',
      desc: 'See exactly where you show up when buyers ask AI — and where the gaps are.',
      items: [
        'Visibility benchmark vs. competitors',
        'Share-of-answer assessment',
        'Technical readiness review',
        'Prioritized roadmap',
      ],
      price: 'From $800 · one-time · 2–3 weeks',
      featured: false,
    },
    {
      idx: '02',
      kicker: 'Core',
      title: 'The Authority Engine',
      desc: 'Our monthly program that builds, publishes, and compounds authority across search and AI.',
      items: [
        'Deeply researched original content',
        'Site built to be read & cited',
        'Distribution where buyers research',
        'Monthly reporting on business outcomes',
      ],
      price: 'From $2,500 / month · 6-month term',
      featured: true,
    },
    {
      idx: '03',
      kicker: 'Accelerate',
      title: 'Flagship Projects',
      desc: 'High-value assets that earn citations and put you on the map — on your terms.',
      items: [
        'Proprietary data studies',
        'Digital PR & podcasts',
        'Interactive tools & calculators',
        'Industry reports',
      ],
      price: 'From $600 · priced by scope',
      featured: false,
    },
  ];

  return (
    <section className="bg-white py-28 border-b border-gray-100" id="services">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-2xl mb-16">
          <Eyebrow className="mb-5">Services</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-medium tracking-tight text-gray-900 mb-6 font-sans leading-[1.05]"
            html="One engine, built to make you the reference."
          />
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch]">
            A low-risk way in, a compounding core program, and premium projects when you&rsquo;re ready to accelerate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {list.map((svc) => (
            <div
              key={svc.idx}
              data-reveal
              className={`p-8 rounded-3xl flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                svc.featured
                  ? 'bg-[#39471D] border border-[#39471D] shadow-[0_30px_70px_-30px_rgba(57,71,29,0.6)]'
                  : 'bg-gray-50/60 border border-gray-100 hover:border-[#55672E]/40 hover:shadow-[0_24px_60px_-30px_rgba(57,71,29,0.25)]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className={`font-mono text-[10px] font-bold tracking-[0.18em] uppercase ${svc.featured ? 'text-[#DFFF3B]' : 'text-gray-400'}`}>
                    {svc.idx} / {svc.kicker}
                  </span>
                  {svc.featured && (
                    <span className="font-mono text-[9px] font-bold tracking-widest uppercase text-[#39471D] bg-[#DFFF3B] px-2 py-1 rounded-md">
                      Most chosen
                    </span>
                  )}
                </div>
                <h3 className={`text-2xl font-semibold mb-3 ${svc.featured ? 'text-white' : 'text-gray-900'}`}>
                  {svc.title}
                </h3>
                <p className={`text-sm leading-relaxed font-medium mb-7 ${svc.featured ? 'text-[#CBD0AC]' : 'text-gray-500'}`}>
                  {svc.desc}
                </p>
                <ul className="flex flex-col gap-3">
                  {svc.items.map((item, i) => (
                    <li key={i} className={`flex items-start gap-2.5 text-sm font-medium ${svc.featured ? 'text-gray-100' : 'text-gray-700'}`}>
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={svc.featured ? '#DFFF3B' : '#55672E'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`mt-8 pt-6 border-t ${svc.featured ? 'border-white/15' : 'border-gray-200/70'}`}>
                <span className={`block text-lg sm:text-xl font-bold tracking-tight ${svc.featured ? 'text-[#DFFF3B]' : 'text-[#39471D]'}`}>
                  {svc.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
