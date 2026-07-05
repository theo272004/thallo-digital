import React, { useEffect, useRef } from 'react';

export default function Testimonials() {
  const trackRef = useRef(null);

  const reviews = [
    {
      initials: 'MC',
      name: 'Mark Cleary',
      role: 'VP of Growth, Meridian',
      stars: '★★★★★',
      quote: 'Before Thallo, Perplexity and ChatGPT kept recommending our competitors. Within 90 days, we became the default cited choice for enterprise queries. The ROI was clear immediately.'
    },
    {
      initials: 'NH',
      name: 'Natalie Horn',
      role: 'CMO, Northwind FinTech',
      stars: '★★★★★',
      quote: 'Zero-click searches were killing our pipeline. Thallo built the research asset infrastructure that turned our brand into the authority B2B buyers find first.'
    },
    {
      initials: 'SL',
      name: 'Sarah Ledger',
      role: 'Founder, Ledgerly',
      stars: '★★★★★',
      quote: 'They don’t sell standard B2B SEO. They build the distribution consensus and co-citations that dictate what AI tells buyers. Absolute game changer.'
    }
  ];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const interval = setInterval(() => {
      const firstChild = track.querySelector('.quote');
      if (!firstChild) return;
      
      const cardWidth = firstChild.offsetWidth + 20; // card width + gap
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    }, 4200);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="tst" id="testimonials">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Social Proof</span>
          <h2>Recommended by industry leaders.</h2>
          <p>Read how fast-growing fintechs, SaaS providers, and treatment centers use Thallo to establish visibility.</p>
        </div>

        <div className="tst-track" ref={trackRef}>
          {reviews.map((rev, idx) => (
            <div className="quote" key={idx}>
              <div className="stars">{rev.stars}</div>
              <p>“{rev.quote}”</p>
              <div className="who">
                <div className="av">{rev.initials}</div>
                <div>
                  <div className="nm">{rev.name}</div>
                  <div className="rl">{rev.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
