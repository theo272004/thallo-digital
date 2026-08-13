'use client';

import React from 'react';

/*
 * The five categories, in the order the page states them.
 *
 * Not a list of everything we would take on — a list of where the argument
 * above them holds. "Health & recovery" and "Benefits & claims" were sitting
 * here as consumer-side categories, which is a different business from the one
 * this page describes.
 */
const ITEMS = [
  {
    title: 'Fintech',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="5" width="22" height="14" rx="2" /><path d="M1 10h22" />
      </svg>
    ),
  },
  {
    title: 'Health tech',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    title: 'Legal tech',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v18M7 21h10M4 8h16M6.5 8 4 14h5zM17.5 8 15 14h5z" />
      </svg>
    ),
  },
  {
    title: 'Specialized software',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 20h8M9 8l-2 3 2 3M15 8l2 3-2 3" />
      </svg>
    ),
  },
  {
    title: 'Professional services',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
];

const track = [...ITEMS, ...ITEMS];

export default function IndustryTicker() {
  return (
    <div className="flex justify-center">
      <style>{`
        @keyframes industry-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .industry-ticker-track {
          animation: industry-ticker 32s linear infinite;
          will-change: transform;
        }
        /* Hovering to read a name should not mean chasing it. */
        .industry-ticker-shell:hover .industry-ticker-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .industry-ticker-track { animation: none; }
        }
        .industry-ticker-item {
          color: #374151;
          cursor: default;
          border-radius: 999px;
          transition: color 0.2s, background 0.2s;
        }
        .industry-ticker-item:hover {
          color: #39471D;
          background: #F7F8F3;
        }
      `}</style>

      <div
        className="industry-ticker-shell"
        style={{
          width: '420px',
          maxWidth: '100%',
          height: '52px',
          background: '#ffffff',
          border: '1px solid #ECECE8',
          borderRadius: '999px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Left fade */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '56px', background: 'linear-gradient(to right, #ffffff, transparent)', zIndex: 10, pointerEvents: 'none' }} />
        {/* Right fade */}
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '56px', background: 'linear-gradient(to left, #ffffff, transparent)', zIndex: 10, pointerEvents: 'none' }} />

        {/* Scrolling track */}
        <div
          className="industry-ticker-track"
          style={{ display: 'flex', alignItems: 'center', height: '100%', width: 'max-content' }}
        >
          {track.map((item, i) => (
            <React.Fragment key={i}>
              <div
                className="industry-ticker-item"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 24px', whiteSpace: 'nowrap', height: '100%' }}
              >
                {item.icon}
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.title}</span>
              </div>
              {/* A neutral hairline, the same grey every rule on the site
                  uses. It was a sage one, which on this white ground was a
                  faint green line doing a divider's job. */}
              <div style={{ width: '1px', height: '20px', background: '#E5E7EB', flexShrink: 0 }} />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
