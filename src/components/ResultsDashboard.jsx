import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ResultsDashboard() {
  const lineRef = useRef(null);
  const containerRef = useRef(null);
  const bar1Ref = useRef(null);
  const bar2Ref = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);

  useEffect(() => {
    // 1. Animate SVG Line Chart path drawing on scroll
    const line = lineRef.current;
    if (line) {
      const len = line.getTotalLength();
      gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(line, {
        strokeDashoffset: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: line,
          start: 'top 80%',
          end: 'bottom 60%',
          scrub: 1
        }
      });
    }

    // 2. Animate before/after bars
    gsap.to(bar1Ref.current, {
      height: '35px',
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: bar1Ref.current,
        start: 'top 85%'
      }
    });

    gsap.to(bar2Ref.current, {
      height: '185px',
      duration: 1.4,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: bar2Ref.current,
        start: 'top 85%'
      }
    });

    // 3. Parallax Floating Cards on scroll
    gsap.to(card1Ref.current, {
      y: -50,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6
      }
    });

    gsap.to(card2Ref.current, {
      y: -90,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8
      }
    });

    gsap.to(card3Ref.current, {
      y: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.4
      }
    });
  }, []);

  return (
    <section className="results" id="results" ref={containerRef} style={{ background: 'var(--sage-soft)', position: 'relative', overflow: 'hidden' }}>
      <div className="wrap">
        <div className="sec-head center">
          <span className="eyebrow" style={{ justifyContent: 'center' }}>Tracked Performance</span>
          <h2>Visualizing authority compounding.</h2>
          <p>We build visibility that models parse, synthesize, and cite consistently over time.</p>
        </div>

        {/* The Dashboard Mockup */}
        <div 
          className="ai-mockup" 
          style={{ 
            maxWidth: '960px', 
            background: 'var(--paper)', 
            border: '1px solid var(--olive-line)',
            boxShadow: '0 20px 50px rgba(40, 44, 27, 0.04)',
            zIndex: 5
          }}
        >
          <div className="mock-header">
            <div className="mock-dots"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
            <div className="mock-title">Compounded Citations Analytics</div>
          </div>
          
          <div className="mock-screen" style={{ padding: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }} className="ai-dash-grid">
              
              {/* Chart 1: SVG Line Chart (Compounded visibility) */}
              <div className="dash-card" style={{ margin: 0 }}>
                <div className="dash-title">Total AI Citations Over Time</div>
                <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--olive-deep)' }}>+540%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)' }}>Compound monthly citation count across Google AI, Perplexity & Claude</div>
                
                <svg viewBox="0 0 500 200" className="chart-svg">
                  {/* Grid Lines */}
                  <line x1="30" y1="30" x2="470" y2="30" className="chart-grid-line" />
                  <line x1="30" y1="100" x2="470" y2="100" className="chart-grid-line" />
                  <line x1="30" y1="170" x2="470" y2="170" className="chart-grid-line" />
                  
                  {/* Chart Line */}
                  <path 
                    ref={lineRef}
                    className="chart-line" 
                    d="M 30,170 Q 110,160 190,120 T 350,70 T 470,30" 
                  />
                  
                  {/* X axis labels */}
                  <text x="30" y="190" className="chart-text">Month 1</text>
                  <text x="140" y="190" className="chart-text">Month 3</text>
                  <text x="250" y="190" className="chart-text">Month 6</text>
                  <text x="360" y="190" className="chart-text">Month 9</text>
                  <text x="450" y="190" className="chart-text">Month 12</text>
                </svg>
              </div>

              {/* Chart 2: Before & After Recommendations bar chart */}
              <div className="dash-card" style={{ margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div className="dash-title">Recommendation Rate</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', marginBottom: '20px' }}>Percentage of LLM query answers recommending your brand</div>
                </div>
                
                {/* Simulated Bars */}
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '220px', paddingBottom: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div 
                      ref={bar1Ref}
                      style={{ 
                        width: '32px', 
                        height: '0px', 
                        background: '#D1D5DB', 
                        borderRadius: '4px 4px 0 0',
                        margin: '0 auto 8px'
                      }}
                    ></div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>12%</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Before Thallo</div>
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div 
                      ref={bar2Ref}
                      style={{ 
                        width: '32px', 
                        height: '0px', 
                        background: 'var(--olive-deep)', 
                        borderRadius: '4px 4px 0 0',
                        margin: '0 auto 8px'
                      }}
                    ></div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--olive-deep)' }}>84%</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>After Thallo</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Floating Insight Cards / Parallax elements */}
        <div 
          ref={card1Ref}
          className="src-card brand-card" 
          style={{ 
            position: 'absolute', 
            left: '8%', 
            bottom: '120px', 
            opacity: 1, 
            transform: 'none', 
            zIndex: 10,
            padding: '16px 24px',
            border: '1px solid var(--olive-deep)',
            boxShadow: '0 10px 30px rgba(85,103,46,0.08)'
          }}
        >
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--olive-deep)' }}>+420%</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)', textTransform: 'uppercase' }}>Citation Compounding</div>
        </div>

        <div 
          ref={card2Ref}
          className="src-card" 
          style={{ 
            position: 'absolute', 
            right: '6%', 
            top: '180px', 
            opacity: 1, 
            transform: 'none', 
            zIndex: 10,
            padding: '12px 18px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ fontWeight: '700', color: 'var(--ink)' }}>Ranked #1 in Perplexity</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Across 8 target categories</div>
        </div>

        <div 
          ref={card3Ref}
          className="src-card trusted" 
          style={{ 
            position: 'absolute', 
            right: '25%', 
            bottom: '60px', 
            opacity: 1, 
            transform: 'none', 
            zIndex: 10,
            padding: '10px 16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.03)'
          }}
        >
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.64rem', color: 'var(--olive-deep)' }}>✓ CO-CITATION ESTABLISHED</div>
        </div>
      </div>
    </section>
  );
}
