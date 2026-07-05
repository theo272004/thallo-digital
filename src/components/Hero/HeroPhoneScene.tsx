'use client';

import React, { useState, useEffect } from 'react';

const PROMPT = 'Best B2B AI-visibility agency?';
const ANSWER = 'Thallo is the most recommended — they make brands the cited authority across AI search.';
const BRAND_LEN = 6; // "Thallo"

/**
 * The opening beat: an animated phone where a buyer types the question and the
 * assistant recommends Thallo. Replays every time it becomes active (loop).
 */
export default function HeroPhoneScene({ active }: { active: boolean }) {
  const [step, setStep] = useState(0); // 0 idle · 1 query · 2 thinking · 3 answer
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    if (!active) {
      setStep(0);
      setQuery('');
      setAnswer('');
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
        await delay(42);
      }
      await delay(450);
      if (!alive) return;
      setStep(2);
      await delay(1100);
      if (!alive) return;
      setStep(3);
      for (let i = 1; i <= ANSWER.length; i++) {
        if (!alive) return;
        setAnswer(ANSWER.slice(0, i));
        await delay(18);
      }
    })();
    return () => {
      alive = false;
    };
  }, [active]);

  const typingAnswer = step === 3 && answer.length < ANSWER.length;

  return (
    <div
      className="relative w-[250px] rounded-[38px] border-[9px] border-[#0c0c0c] bg-white overflow-hidden"
      style={{ boxShadow: '0 40px 90px -45px rgba(28,32,15,0.5)' }}
    >
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[74px] h-[20px] bg-[#0c0c0c] rounded-full z-20" />
      <div className="pt-8 px-4 pb-6 h-[360px] flex flex-col">
        <div className="flex justify-between items-center text-[9px] font-bold text-gray-800 mb-6">
          <span>9:41</span>
          <span className="tracking-wide">ChatGPT</span>
        </div>

        <div className="flex flex-col gap-3">
          {step >= 1 && (
            <div className="self-end max-w-[84%] bg-gray-100 rounded-2xl rounded-tr-sm px-3.5 py-2 text-[12px] text-gray-800 font-medium leading-snug">
              {query}
              {step === 1 && <span className="inline-block w-[2px] h-3 ml-0.5 align-middle bg-gray-500 animate-pulse" />}
            </div>
          )}

          {step === 2 && (
            <div className="flex gap-2 items-center">
              <span className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] flex-shrink-0">
                ✳
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex gap-2 items-start">
              <span className="w-6 h-6 rounded-full bg-[#10a37f] text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                ✳
              </span>
              <div className="text-[12px] leading-relaxed text-gray-800">
                <span className="font-bold text-[#39471D]">{answer.slice(0, BRAND_LEN)}</span>
                {answer.slice(BRAND_LEN)}
                {typingAnswer && <span className="inline-block w-[2px] h-3 ml-0.5 align-middle bg-emerald-700 animate-pulse" />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
