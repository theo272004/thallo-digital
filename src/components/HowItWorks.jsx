import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const stemRef = useRef(null);
  const leafRefs = useRef([]);
  const stepRefs = useRef([]);

  useEffect(() => {
    const stem = stemRef.current;
    if (!stem) return;

    // Calculate length of the SVG path
    const length = stem.getTotalLength();
    
    // Set initial dasharray/offset
    gsap.set(stem, {
      strokeDasharray: length,
      strokeDashoffset: length
    });

    // Create ScrollTrigger timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top 60%',
        end: 'bottom 90%',
        scrub: 0.8
      }
    });

    // Animate path drawing
    tl.to(stem, {
      strokeDashoffset: 0,
      ease: 'none'
    });

    // Pop in the leaves and activate steps based on scroll progress
    leafRefs.current.forEach((leaf, idx) => {
      if (leaf) {
        ScrollTrigger.create({
          trigger: stepRefs.current[idx],
          start: 'top 75%',
          end: 'bottom 75%',
          onEnter: () => {
            gsap.to(leaf, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' });
            stepRefs.current[idx]?.classList.add('active');
          },
          onLeaveBack: () => {
            gsap.to(leaf, { scale: 0.2, opacity: 0, duration: 0.3 });
            stepRefs.current[idx]?.classList.remove('active');
          }
        });
      }
    });

  }, []);

  const steps = [
    {
      idx: 'STEP 01',
      title: 'Audit & Visibility Mapping',
      desc: 'We audit your search presence across all major LLMs and search engines. We identify where you are invisible, who dominates your category, and compile a prioritized citation action plan.'
    },
    {
      idx: 'STEP 02',
      title: 'Authority Infrastructure',
      desc: 'We build the original content assets, research databases, and technical schema structures required for AI crawlers to parse, store, and cite your brand as the primary reference.'
    },
    {
      idx: 'STEP 03',
      title: 'Expert Distribution & Seed',
      desc: 'We seed your insights across authority nodes (PR, premium newsletters, journals, databases). AI models synthesize these nodes, transforming your brand into their default recommendation.'
    }
  ];

  return (
    <section className="approach" id="approach" ref={sectionRef}>
      <div className="wrap approach-grid">
        {/* Left Column - SVG Growth Animation */}
        <div className="branch-hold">
          <svg viewBox="0 0 200 400" id="svgBranch">
            <path 
              ref={stemRef}
              className="stem" 
              d="M 100,380 C 100,300 100,200 100,50 M 100,300 C 60,260 40,240 40,220 M 100,200 C 140,160 160,140 160,120 M 100,100 C 70,70 50,50 50,40"
            />
            {/* Leaf Nodes */}
            <circle 
              ref={el => leafRefs.current[0] = el}
              className="leaf" 
              cx="40" 
              cy="220" 
              r="8" 
            />
            <circle 
              ref={el => leafRefs.current[1] = el}
              className="leaf" 
              cx="160" 
              cy="120" 
              r="8" 
            />
            <circle 
              ref={el => leafRefs.current[2] = el}
              className="leaf" 
              cx="50" 
              cy="40" 
              r="8" 
            />
          </svg>
        </div>

        {/* Right Column - Steps */}
        <div className="steps">
          <div className="sec-head">
            <span className="eyebrow">Our Method</span>
            <h2>How we build AI visibility.</h2>
            <p>A systematic three-phase B2B authority building process that converts search queries into revenue-generating recommendations.</p>
          </div>
          {steps.map((step, idx) => (
            <div 
              className="step" 
              key={idx} 
              ref={el => stepRefs.current[idx] = el}
            >
              <div className="k">{step.idx}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
