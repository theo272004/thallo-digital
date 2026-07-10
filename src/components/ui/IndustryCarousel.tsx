'use client';

import React, { useState, useEffect, useCallback } from 'react';

const INDUSTRIES = [
  {
    title: 'Specialized software',
    desc: 'Category-defining SaaS where the winner is the name buyers already trust.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#39471D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="14" rx="2" />
        <path d="M8 20h8M9 8l-2 3 2 3M15 8l2 3-2 3" />
      </svg>
    ),
  },
  {
    title: 'Fintech',
    desc: 'Where a wrong vendor is costly to unwind, and credibility clears the shortlist.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#39471D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="5" width="22" height="14" rx="2" />
        <path d="M1 10h22" />
      </svg>
    ),
  },
  {
    title: 'Health tech',
    desc: 'Regulated, high-stakes buying that rewards the most credible, best-documented source.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#39471D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    title: 'Professional services',
    desc: 'Expertise businesses that live or die on reputation and referral.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#39471D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    title: 'Health & recovery',
    desc: 'Deeply researched, deeply personal decisions where trust is everything.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#39471D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 0 1 0 20" />
        <path d="M12 2a10 10 0 0 0 0 20" />
        <path d="M12 6c-2 2-3 4-3 6s1 4 3 6" />
        <path d="M12 6c2 2 3 4 3 6s-1 4-3 6" />
        <path d="M2 12h20" />
      </svg>
    ),
  },
  {
    title: 'Benefits & claims',
    desc: 'Complex, confusing choices where the clear, trusted guide wins.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#39471D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function IndustryCarousel() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  const advance = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % INDUSTRIES.length);
      setVisible(true);
    }, 300);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, 3000);
    return () => clearInterval(id);
  }, [advance]);

  const item = INDUSTRIES[current];

  return (
    <div className="flex flex-col items-center gap-3 my-7">
      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #ECECEC',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          padding: '18px 22px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          minHeight: '84px',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: '#F3F5EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'opacity 300ms ease, transform 300ms ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
          }}
        >
          {item.icon}
        </div>

        {/* Text */}
        <div
          style={{
            flex: 1,
            transition: 'opacity 300ms ease, transform 300ms ease',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '3px',
              lineHeight: 1.3,
            }}
          >
            {item.title}
          </p>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#6b7280',
              lineHeight: 1.5,
            }}
          >
            {item.desc}
          </p>
        </div>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {INDUSTRIES.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === current ? '16px' : '5px',
              height: '5px',
              borderRadius: '999px',
              background: i === current ? '#39471D' : '#C5CCBA',
              transition: 'all 400ms ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}
