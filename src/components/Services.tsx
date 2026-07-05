import React from 'react';

export default function Services() {
  const list = [
    {
      idx: '01',
      title: 'Authority Content',
      desc: 'We engineer original expert research, technical papers, and industry-defining insights that AI models scrape and reference as trusted sources.',
      items: [
        'Proprietary Industry Surveys',
        'Expert Interview Series',
        'Technical Whitepapers',
        'Crawlable SEO Infrastructure'
      ],
      price: 'Retainers from $3,500/mo'
    },
    {
      idx: '02',
      title: 'AI Visibility (GEO)',
      desc: 'We optimize your entire digital footprint for Generative Engine Optimization (GEO). We ensure LLMs like ChatGPT, Claude, and Gemini cite you first.',
      items: [
        'Citation & Reference Architecture',
        'Brand Association Mapping',
        'Model Response Fine-Tuning',
        'Competitive LLM Benchmark Audits'
      ],
      price: 'Retainers from $4,000/mo'
    },
    {
      idx: '03',
      title: 'Distribution',
      desc: 'We place your insights directly into the circles your buyers trust. We build authority that secures citations in newsletters and premium hubs.',
      items: [
        'Strategic PR & Newsletters Placement',
        'Industry Consensus Contribution',
        'Key Opinion Leader Co-citation',
        'Digital Distribution Networks'
      ],
      price: 'Retainers from $3,000/mo'
    }
  ];

  return (
    <section className="bg-white py-24 border-b border-gray-100" id="services">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#55672E]"></span>
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-gray-500">Our Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-gray-900 mb-6 font-sans">
            Convert visibility into B2B authority.
          </h2>
          <p className="text-gray-500 font-medium text-[15px] leading-relaxed max-w-[50ch]">
            We help your brand transition from standard keyword rankings to becoming the primary citation in AI answers and enterprise research.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {list.map((svc) => (
            <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-3xl flex flex-col justify-between" key={svc.idx}>
              <div>
                <span className="text-[9px] font-bold text-gray-400 block tracking-widest mb-4">
                  {svc.idx} / SOLUTIONS
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{svc.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed font-medium mb-6">{svc.desc}</p>
                <ul className="card-bullet-list">
                  {svc.items.map((item, idx) => (
                    <li key={idx} className="font-semibold text-gray-800">{item}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#39471D]">{svc.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
