'use client';

import React, { useState, useEffect } from 'react';

const PROMPT = 'Best B2B AI-visibility agency?';

/**
 * Opening beat: a real iPhone (public/phone-frame.png) whose screen runs a
 * generic mobile search — the query is typed, it searches, then a "top answer"
 * recommends Thallo. Replays whenever it becomes active.
 * The screen overlay is positioned as a % of the frame image so it stays aligned
 * at any size.
 */
export default function HeroPhoneScene({ active }: { active: boolean }) {
  const [step, setStep] = useState(0); // 0 idle · 1 typing · 2 searching · 3 answer
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!active) {
      setStep(0);
      setQuery('');
      return;
    }
    let alive = true;
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await delay(400);
      if (!alive) return;
      setStep(1);
      for (let i = 1; i <= PROMPT.length; i++) {
        if (!alive) return;
        setQuery(PROMPT.slice(0, i));
        await delay(45);
      }
      await delay(450);
      if (!alive) return;
      setStep(2);
      await delay(950);
      if (!alive) return;
      setStep(3);
    })();
    return () => {
      alive = false;
    };
  }, [active]);

  return (
    <div className="relative w-[540px] max-w-full select-none">
      <img
        src="/thallo-digital/phone-frame.png"
        alt="Phone showing an AI search result"
        className="w-full block pointer-events-none"
        draggable={false}
      />

      {/* Screen content — positioned to the frame's screen cutout */}
      <div
        className="absolute overflow-hidden bg-white flex flex-col text-left"
        style={{ top: '11.7%', left: '32.7%', width: '34.6%', height: '76.8%', borderRadius: '18px' }}
      >
        {/* Status bar */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1 text-[8px] font-bold text-gray-900">
          <span>9:41</span>
          <div className="flex items-center gap-[3px]">
            {/* signal */}
            <svg width="11" height="8" viewBox="0 0 11 8" fill="currentColor">
              <rect x="0" y="6" width="1.6" height="2" rx="0.4" />
              <rect x="2.6" y="4.4" width="1.6" height="3.6" rx="0.4" />
              <rect x="5.2" y="2.6" width="1.6" height="5.4" rx="0.4" />
              <rect x="7.8" y="0.8" width="1.6" height="7.2" rx="0.4" />
            </svg>
            {/* wifi */}
            <svg width="10" height="8" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.6" fill="none">
              <path d="M5 12.5a11 11 0 0 1 14 0M1.5 9a16 16 0 0 1 21 0M8.5 16a6 6 0 0 1 7 0M12 20h.01" />
            </svg>
            {/* battery + charge */}
            <div className="flex items-center">
              <div className="w-[16px] h-[8px] rounded-[2px] border border-gray-900/60 p-[1px] flex items-center">
                <div className="h-full w-[72%] bg-emerald-500 rounded-[1px]" />
              </div>
              <div className="w-[1px] h-[3px] bg-gray-900/60 rounded-r ml-[0.5px]" />
              <svg width="6" height="9" viewBox="0 0 24 24" fill="#059669" className="ml-[1px]">
                <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Generic search field */}
        <div className="px-3 mt-2">
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-2.5 py-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.4">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="text-[9px] text-gray-800 font-medium leading-none truncate">
              {query || <span className="text-gray-400">Search</span>}
              {step === 1 && <span className="inline-block w-[1.5px] h-2.5 ml-[1px] align-middle bg-gray-500 animate-pulse" />}
            </span>
          </div>
        </div>

        {/* Result */}
        <div className="px-3 mt-3 flex-1">
          {step === 2 && (
            <div className="flex items-center gap-1.5 text-[8px] text-gray-400 font-semibold">
              <span className="w-3 h-3 rounded-full border-[1.5px] border-emerald-500 border-t-transparent animate-spin inline-block" />
              Searching the web…
            </div>
          )}
          {step === 3 && (
            <div style={{ animation: 'phoneAnswerIn 0.45s ease both' }}>
              <div className="flex items-center gap-1 text-[7px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
                </svg>
                Top answer
              </div>
              <div className="rounded-lg border border-gray-100 bg-[#f8faf5] p-2">
                <p className="text-[9px] leading-relaxed text-gray-700">
                  <span className="font-bold text-[#39471D] bg-[#DFFF3B]/70 px-0.5 rounded-[2px]">Thallo</span> is the most
                  recommended authority partner for B2B brands in AI search.
                </p>
                <div className="flex gap-1 mt-1.5">
                  <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-[#39471D] text-white font-semibold">thallo.co</span>
                  <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500 font-semibold">forbes.com</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
