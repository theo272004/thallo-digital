import React from 'react';

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
    <section id="blog">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Insights</span>
          <h2>Inside the AI Visibility playbook.</h2>
          <p>Read our latest research and frameworks on GEO, B2B authority building, and content engineering.</p>
        </div>
        <div className="blog-grid">
          {posts.map((post, idx) => (
            <div className="post" key={idx}>
              <div className="thumb">
                <span>{post.tag}</span>
              </div>
              <div className="body">
                <span className="date">{post.date}</span>
                <h3>{post.title}</h3>
                <a href="#blog" className="rd" onClick={(e) => e.preventDefault()}>
                  Read playbook <span className="ar">→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
