'use client';

import React, { useState } from 'react';

export default function VideoSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="bg-white py-16 border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6">
        <div
          className="relative text-white rounded-[32px] overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #252d12 0%, #39471D 55%, #4d5e26 100%)' }}
        >
          {/* Radial highlight */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(60% 90% at 85% 15%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 70%)' }}
          />

          {/* Banner row — always visible, never changes size */}
          <div className="flex items-center justify-between p-12">
            <div className="relative z-10 max-w-xl">
              <span className="text-[11px] font-mono tracking-widest text-white/60 font-bold block mb-2">
                Case film · 2 min
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                How we made Northwind the cited authority in 90 days
              </h3>
              <p className="text-xs text-white/60 font-semibold">
                {isOpen ? 'Playing below ↓' : 'Hit play to watch the executive briefing.'}
              </p>
            </div>

            {/* Play / Close button — only this triggers expansion */}
            <button
              onClick={() => setIsOpen((v) => !v)}
              aria-label={isOpen ? 'Close video' : 'Play video'}
              className="relative z-10 w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg hover:scale-105 transition-transform flex-shrink-0 focus:outline-none"
            >
              {isOpen ? (
                /* × close */
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                /* ▶ play */
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <polygon points="6 3 20 12 6 21 6 3" />
                </svg>
              )}
            </button>
          </div>

          {/* Inline video — expands downward on play click */}
          <div
            className="transition-all duration-500 ease-in-out overflow-hidden"
            style={{ maxHeight: isOpen ? '600px' : '0px', touchAction: 'pan-y' }}
          >
            <div className="px-12 pb-12">
              {/* Fixed height so content never overflows the 600px max-height container —
                  aspect-video at 1440px = 810px which triggers an iOS scroll trap.
                  Swap this div for <iframe src="…"> when the video URL is ready. */}
              <div className="w-full h-[400px] rounded-2xl bg-black/50" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
