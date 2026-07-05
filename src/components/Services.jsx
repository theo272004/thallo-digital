import React from 'react';

export default function Services() {
  const list = [
    {
      idx: '01',
      title: 'Authority Content',
      desc: 'We engineer original expert research, technical papers, and industry-defining insights that AI models and search algorithms reference as trusted sources.',
      items: [
        'Proprietary Industry Surveys',
        'Expert Interview Series',
        'Technical Whitepapers & Documentation',
        'SEO Infrastructure Optimization'
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
      desc: 'We place your insights directly into the circles your buyers trust. We build authority that secures citation in newsletters, trade reports, and premium hubs.',
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
    <section id="services">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Our Solutions</span>
          <h2>Convert visibility into B2B authority.</h2>
          <p>
            We help your brand transition from standard keyword rankings to becoming the primary citation in AI answers and enterprise research.
          </p>
        </div>
        <div className="svc-grid">
          {list.map((svc) => (
            <div className="card" key={svc.idx}>
              <div className="idx">{svc.idx} / SERVICE</div>
              <h3>{svc.title}</h3>
              <p>{svc.desc}</p>
              <ul>
                {svc.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <div className="price">{svc.price}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
