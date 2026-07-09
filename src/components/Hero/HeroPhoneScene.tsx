'use client';

import React, { useState, useEffect } from 'react';

const PROMPT = 'Best B2B AI visibility agency';

const RESULTS = [
  { key: 'chatgpt', logo: '/thallo-digital/logos/chatgpt.svg', name: 'ChatGPT', snippet: 'Thallo is the most recommended choice for B2B AI visibility.' },
  { key: 'google',  logo: '/thallo-digital/logos/google.svg',  name: 'Google AI Overview', snippet: 'Consistently cited as the leading AI-visibility agency.' },
  { key: 'perplexity', logo: '/thallo-digital/logos/perplexity.png', name: 'Perplexity', snippet: 'Thallo stands out as the authority partner brands trust.' },
  { key: 'forbes',  logo: '/thallo-digital/logos/forbes.svg',  name: 'Forbes', snippet: 'Winning the race for AI search — Thallo leads B2B.' },
];

export default function HeroPhoneScene({ active, burst = false }: { active: boolean; burst?: boolean }) {
  const [step, setStep] = useState(0); // 0 idle · 1 typing · 2 loading · 3 results
  const [query, setQuery] = useState('');
  const [visibleResults, setVisibleResults] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      setQuery('');
      setVisibleResults(0);
      return;
    }
    let alive = true;
    const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    (async () => {
      await delay(200);
      if (!alive) return;
      setStep(1);
      for (let i = 1; i <= PROMPT.length; i++) {
        if (!alive) return;
        setQuery(PROMPT.slice(0, i));
        await delay(22);
      }
      await delay(180);
      if (!alive) return;
      setStep(2);
      await delay(350);
      if (!alive) return;
      setStep(3);
      for (let i = 1; i <= RESULTS.length; i++) {
        await delay(130);
        if (!alive) return;
        setVisibleResults(i);
      }
    })();
    return () => { alive = false; };
  }, [active]);

  return (
    <div className="phone-crop-container">
      <div className="phone-mockup-frame" id="hero-phone-anchor">
        <div className="phone-notch" />
        <div className="phone-inner-screen">

          {/* Status bar */}
          <div className="flex justify-between items-center text-[11px] font-bold text-gray-900 px-1 pt-1 flex-shrink-0">
            <span>9:41</span>
            <div className="flex gap-1.5 items-center">
              <svg viewBox="0 0 10 10" width="12" height="12" fill="currentColor">
                <rect x="0" y="8" width="1.5" height="2" rx="0.5" />
                <rect x="2.5" y="6" width="1.5" height="4" rx="0.5" />
                <rect x="5" y="4" width="1.5" height="6" rx="0.5" />
                <rect x="7.5" y="1" width="1.5" height="9" rx="0.5" />
              </svg>
              <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none">
                <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.1a6 6 0 0 1 6.95 0M12 20h.01" />
              </svg>
              <div className="w-5 h-2.5 border border-gray-900 rounded-[2px] p-[1.5px] flex items-center">
                <div className="w-full h-full bg-gray-900 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Safari-style search / URL bar */}
          <div className="mt-2.5 mx-0.5 flex items-center gap-1.5 bg-gray-100 rounded-[10px] px-2.5 py-2 flex-shrink-0">
            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400 flex-shrink-0">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-[12px] text-gray-700 font-medium flex-1 min-w-0 truncate leading-tight">
              {step >= 1 ? query : <span className="text-gray-400">Search AI sources…</span>}
              {step === 1 && query.length < PROMPT.length && (
                <span className="inline-block w-[1.5px] h-3 bg-gray-700 animate-pulse ml-0.5 align-middle" />
              )}
            </span>
            {step >= 2 && (
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300 flex-shrink-0">
                <circle cx="11" cy="11" r="8" /><path d="M11 8v3l2 2" />
              </svg>
            )}
          </div>

          {/* Results / loading area — each row lifts out one by one on burst,
              in sync with its floating card taking over outside the phone */}
          <div className="flex-1 pt-2.5 px-0.5 flex flex-col gap-1.5 min-h-0 overflow-hidden">
            {step === 2 && (
              <div className="flex items-center gap-2 px-1 pt-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7f9b42] animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7f9b42] animate-pulse" style={{ animationDelay: '180ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7f9b42] animate-pulse" style={{ animationDelay: '360ms' }} />
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Checking sources…</span>
              </div>
            )}

            {step >= 3 && RESULTS.map((r, i) => (
              <div
                key={r.key}
                id={`hero-result-${r.key}`}
                className="flex items-start gap-2 bg-gray-50 border border-gray-100 rounded-xl px-2.5 py-2"
                style={
                  burst
                    ? {
                        // Lift out in the same order (and rhythm) as the floating
                        // cards emerge, so each row reads as *becoming* its card.
                        opacity: 0,
                        transform: 'translateY(-8px) scale(0.97)',
                        transition: 'opacity 0.28s ease, transform 0.28s ease',
                        transitionDelay: `${i * 260}ms`,
                      }
                    : {
                        opacity: i < visibleResults ? 1 : 0,
                        transform: i < visibleResults ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.96)',
                        transition: 'opacity 0.5s cubic-bezier(0.34,1.56,0.64,1), transform 0.5s cubic-bezier(0.34,1.56,0.64,1)',
                      }
                }
              >
                <div className="w-5 h-5 rounded-md bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5 p-[3px]">
                  <img src={r.logo} alt={r.name} className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10.5px] font-bold text-gray-800 leading-tight">{r.name}</div>
                  <div className="text-[10px] text-gray-500 leading-snug mt-0.5 line-clamp-2">{r.snippet}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
