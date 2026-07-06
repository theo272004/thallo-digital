'use client';

import React, { useState, useEffect } from 'react';

const PROMPT = 'Best B2B AI visibility agency';

/**
 * Opening beat: a wide, CSS-drawn iPhone that types a query, then hands off
 * to the source cards (see HeroSourceCards) which fly out of it — the phone
 * itself never shows a full answer thread anymore. Cropped by its parent to
 * show only the top half of the device. Replays whenever it becomes active.
 */
export default function HeroPhoneScene({ active }: { active: boolean }) {
  const [step, setStep] = useState(0); // 0 idle · 1 typing · 2 thinking
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
      await delay(300);
      if (!alive) return;
      setStep(1);
      for (let i = 1; i <= PROMPT.length; i++) {
        if (!alive) return;
        setQuery(PROMPT.slice(0, i));
        await delay(38);
      }
      await delay(350);
      if (!alive) return;
      setStep(2);
    })();
    return () => {
      alive = false;
    };
  }, [active]);

  return (
    <div className="phone-crop-container">
      <div className="phone-mockup-frame" id="hero-phone-anchor">
        <div className="phone-notch" />
        <div className="phone-inner-screen">
          {/* Status bar */}
          <div className="flex justify-between items-center text-[12px] font-bold text-gray-900 px-1 pt-1">
            <span>9:41</span>
            <div className="flex gap-1.5 items-center">
              <svg viewBox="0 0 10 10" width="14" height="14" fill="currentColor">
                <rect x="0" y="8" width="1.5" height="2" rx="0.5" />
                <rect x="2.5" y="6" width="1.5" height="4" rx="0.5" />
                <rect x="5" y="4" width="1.5" height="6" rx="0.5" />
                <rect x="7.5" y="1" width="1.5" height="9" rx="0.5" />
              </svg>
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none">
                <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.1a6 6 0 0 1 6.95 0M12 20h.01" />
              </svg>
              <div className="w-6 h-3 border border-gray-900 rounded-[3px] p-0.5 flex items-center">
                <div className="w-full h-full bg-gray-900 rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div className="flex-1 flex flex-col gap-4 pt-6 px-1">
            {step >= 1 && (
              <div className="flex gap-2.5 items-start">
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-[13px] font-bold text-gray-500">U</span>
                </div>
                <div className="flex-1 pt-1">
                  <div className="text-[12px] font-semibold text-gray-400 mb-1">You</div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-[14px] text-gray-800 font-medium leading-snug">
                    {query}
                    {query.length < PROMPT.length && <span className="inline-block w-1.5 h-4 ml-0.5 bg-gray-900 animate-pulse align-middle" />}
                  </div>
                </div>
              </div>
            )}

            {step >= 2 && (
              <div className="flex gap-2.5 items-start" style={{ animation: 'phoneAnswerIn 0.35s ease both' }}>
                <div className="w-9 h-9 rounded-full bg-[#758061]/10 border border-[#758061]/20 flex items-center justify-center text-sm flex-shrink-0">✨</div>
                <div className="flex-1 pt-1">
                  <div className="text-[12px] font-semibold text-[#758061] mb-1.5">Checking 4 sources...</div>
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#758061] animate-pulse" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#758061] animate-pulse" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#758061] animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
