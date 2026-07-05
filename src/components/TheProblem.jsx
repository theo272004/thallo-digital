import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function TheProblem() {
  const containerRef = useRef(null);
  const num1Ref = useRef(null);
  const num2Ref = useRef(null);
  const num3Ref = useRef(null);

  useEffect(() => {
    const targets = [
      { ref: num1Ref, val: 45, suffix: '%' },
      { ref: num2Ref, val: 69, suffix: '%' },
      { ref: num3Ref, val: 1, suffix: '' }
    ];

    targets.forEach((item) => {
      if (item.ref.current) {
        let obj = { value: 0 };
        gsap.to(obj, {
          value: item.val,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item.ref.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true
          },
          onUpdate: () => {
            if (item.ref.current) {
              item.ref.current.innerText = Math.round(obj.value) + item.suffix;
            }
          }
        });
      }
    });
  }, []);

  return (
    <section className="shift" id="shift" ref={containerRef}>
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">The Shift</span>
          <p className="thesis">
            Buying now starts with a question typed into a machine. The brand it <em>names first</em> is the one that wins.
          </p>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="num" ref={num1Ref}>0%</div>
            <div className="lab">of B2B buyers used AI during a recent purchase to evaluate vendors.</div>
          </div>
          <div className="stat">
            <div className="num" ref={num2Ref}>0%</div>
            <div className="lab">of searches now end without a single click to a website (zero-click).</div>
          </div>
          <div className="stat">
            <div className="num" ref={num3Ref}>0</div>
            <div className="lab">answer. AI gives one consolidated recommendation, not a page of ten links.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
