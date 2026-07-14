'use client';
import React, { useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

// Normal floating panel
const fp =
  'absolute z-20 bg-white border border-[#ececec] rounded-[16px] ' +
  'shadow-[0_4px_16px_rgba(0,0,0,0.06)] pointer-events-none ' +
  'opacity-90 transition-all duration-300 ease-out ' +
  'group-hover:-translate-y-[6px] group-hover:scale-[1.03] ' +
  'group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.10)] group-hover:opacity-100';

// Elevated floating panel (for the active card)
const fpUp =
  'absolute z-20 bg-white border border-[#ececec] rounded-[16px] ' +
  'shadow-[0_8px_24px_rgba(0,0,0,0.10)] pointer-events-none ' +
  'opacity-100 -translate-y-[6px] scale-[1.03] transition-all duration-300 ease-out';

// Olive checkmark circle
const Check = () => (
  <div className="w-5 h-5 rounded-full bg-[#39471D] flex items-center justify-center flex-shrink-0">
    <svg viewBox="0 0 10 10" width="8" height="8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 5L3.5 7.5L8.5 2" />
    </svg>
  </div>
);

export default function Industries() {
  // First card is green by default; the green then STICKS to the last card the mouse
  // passed over — it no longer snaps back to the first card when the mouse leaves.
  const [active, setActive] = useState(0);

  const cardCls = (i: number) =>
    'group relative p-8 pt-16 pb-12 border rounded-3xl transition-all duration-300 ' +
    (active === i
      ? 'bg-[#39471D] -translate-y-1 shadow-[0_24px_60px_-24px_rgba(57,71,29,0.5)] border-transparent'
      : 'bg-white border-[#e8e8e3] shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]');

  const h3Cls = (i: number) =>
    'text-xl font-semibold transition-colors duration-300 mb-2.5 ' +
    (active === i ? 'text-white' : 'text-gray-900');

  const pCls = (i: number) =>
    'text-sm leading-relaxed font-medium transition-colors duration-300 ' +
    (active === i ? 'text-[#CBD0AC]' : 'text-gray-500');

  const panelCls = (i: number, extra: string) =>
    `${active === i ? fpUp : fp} ${extra}`;

  const bind = (i: number) => ({
    onMouseEnter: () => setActive(i),
  });

  return (
    <section className="bg-[#F4F5F0] py-16 2xl:py-28 min-h-[80vh] flex flex-col justify-center border-b border-gray-100" id="industries">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-2xl mb-20">
          <Eyebrow className="mb-5">Industries</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6 font-sans leading-[1.05]"
            html="Where trust decides the sale."
          />
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch]">
            We go deep in high-consideration categories, where buyers research hard and choose the provider they trust
            most.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">

          {/* ── 0: Specialized software ──────────────────────────────────── */}
          <div data-reveal className={cardCls(0)} {...bind(0)}>
            <div className={panelCls(0, '-top-4 -right-4 w-[152px] p-3')}>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-2">AI Overview</p>
              <div className="h-[5px] rounded-full bg-[#39471D] mb-1.5" />
              <div className="h-[5px] rounded-full bg-[#CBD0AC] mb-1.5 w-3/4" />
              <div className="h-[5px] rounded-full bg-[#e8e8e3] w-1/2" />
            </div>
            <div className={panelCls(0, '-bottom-4 right-5 px-3 py-2.5 flex items-center gap-2')}>
              <Check />
              <div>
                <p className="text-[10px] font-bold text-gray-900 leading-none">Thallo</p>
                <p className="text-[9px] font-medium text-gray-400 mt-0.5">cited in AI overview</p>
              </div>
            </div>
            <h3 className={h3Cls(0)}>Specialized software</h3>
            <p className={pCls(0)}>Category-defining SaaS where the winner is the name buyers already trust.</p>
          </div>

          {/* ── 1: Fintech ───────────────────────────────────────────────── */}
          <div data-reveal className={cardCls(1)} {...bind(1)}>
            <div className={panelCls(1, '-top-8 left-1/2 -translate-x-1/2 w-[148px] p-3')}>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-2">Buyer shortlist</p>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-[18px] h-[18px] rounded-full bg-[#39471D] text-white text-[8px] font-bold flex items-center justify-center flex-shrink-0">1</span>
                <span className="text-[10px] font-bold text-gray-900">Thallo</span>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-[18px] h-[18px] rounded-full bg-gray-100 text-gray-400 text-[8px] font-bold flex items-center justify-center flex-shrink-0">2</span>
                <div className="h-[4px] rounded-full bg-[#e8e8e3] flex-1" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-[18px] h-[18px] rounded-full bg-gray-100 text-gray-400 text-[8px] font-bold flex items-center justify-center flex-shrink-0">3</span>
                <div className="h-[4px] rounded-full bg-[#e8e8e3] flex-1 w-2/3" />
              </div>
            </div>
            <div className={panelCls(1, '-bottom-4 right-4 p-3')}>
              <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-2">Decision factors</p>
              <div className="flex gap-1.5">
                <span className="text-[9px] font-bold text-[#39471D] bg-[#39471D]/10 px-2 py-0.5 rounded-full whitespace-nowrap">Trust</span>
                <span className="text-[9px] font-bold text-[#39471D] bg-[#39471D]/10 px-2 py-0.5 rounded-full whitespace-nowrap">Authority</span>
                <span className="text-[9px] font-bold text-[#39471D] bg-[#39471D]/10 px-2 py-0.5 rounded-full whitespace-nowrap">ROI</span>
              </div>
            </div>
            <h3 className={h3Cls(1)}>Fintech</h3>
            <p className={pCls(1)}>Where a wrong vendor is costly to unwind, and credibility clears the shortlist.</p>
          </div>

          {/* ── 2: Health tech ───────────────────────────────────────────── */}
          <div data-reveal className={cardCls(2)} {...bind(2)}>
            <div className={panelCls(2, '-top-4 -right-3 w-[148px] p-3')}>
              <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-2">AI Answer</p>
              <div className="h-[5px] rounded-full bg-[#e8e8e3] mb-1.5" />
              <div className="h-[5px] rounded-full bg-[#e8e8e3] mb-1.5 w-4/5" />
              <div className="h-[5px] rounded-full bg-[#39471D] w-1/2 mb-1.5" />
              <p className="text-[9px] font-bold text-[#39471D]">Thallo</p>
            </div>
            <div className={panelCls(2, '-bottom-4 right-5 px-3 py-2.5 flex items-center gap-2')}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#39471D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div>
                <p className="text-[10px] font-bold text-gray-900 leading-none">Recommended</p>
                <p className="text-[9px] font-medium text-gray-400 mt-0.5">by AI</p>
              </div>
            </div>
            <h3 className={h3Cls(2)}>Health tech</h3>
            <p className={pCls(2)}>Regulated, high-stakes buying that rewards the most credible, best-documented source.</p>
          </div>

          {/* ── 3: Professional services ─────────────────────────────────── */}
          <div data-reveal className={cardCls(3)} {...bind(3)}>
            <div className={panelCls(3, '-top-4 -right-3 w-[148px] p-3')}>
              <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-1">Reputation score</p>
              <p className="text-[18px] font-bold text-gray-900 leading-tight">
                92 <span className="text-[10px] font-medium text-gray-400">/100</span>
              </p>
              <svg viewBox="0 0 110 30" width="110" height="30" className="mt-1">
                <polyline points="0,26 20,21 40,17 60,12 80,7 100,4 110,2" fill="none" stroke="#39471D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="110" cy="2" r="2.5" fill="#39471D" />
              </svg>
            </div>
            <div className={panelCls(3, '-bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 flex items-center gap-2.5')}>
              <div className="w-6 h-6 rounded-full bg-[#39471D]/10 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#39471D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-900 leading-none whitespace-nowrap">Referrals</p>
                <p className="text-[9px] font-medium text-gray-400 mt-0.5 whitespace-nowrap">drive growth</p>
              </div>
            </div>
            <h3 className={h3Cls(3)}>Professional services</h3>
            <p className={pCls(3)}>Expertise businesses that live or die on reputation and referral.</p>
          </div>

          {/* ── 4: Health & recovery ─────────────────────────────────────── */}
          <div data-reveal className={cardCls(4)} {...bind(4)}>
            <div className={panelCls(4, '-top-4 -right-3 p-3 w-[160px]')}>
              <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-2">Buyer intent</p>
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 52 52" width="44" height="44" className="flex-shrink-0">
                  <circle cx="26" cy="26" r="20" fill="none" stroke="#e8e8e3" strokeWidth="4" />
                  <circle cx="26" cy="26" r="20" fill="none" stroke="#39471D" strokeWidth="4" strokeDasharray="125.66" strokeDashoffset="27.6" strokeLinecap="round" transform="rotate(-90 26 26)" />
                  <text x="26" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill="#111827">78%</text>
                </svg>
                <p className="text-[9px] font-medium text-gray-500 leading-snug">Deep research<br />before decision</p>
              </div>
            </div>
            <div className={panelCls(4, '-bottom-4 left-1/2 -translate-x-1/2 px-3 py-2.5 flex items-center gap-2')}>
              {[
                <><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" /><path d="M21 21l-4.35-4.35" /></>,
                <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
              ].map((paths, i) => (
                <div key={i} className="w-7 h-7 rounded-full border border-[#e8e8e3] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#39471D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {paths}
                  </svg>
                </div>
              ))}
            </div>
            <h3 className={h3Cls(4)}>Health &amp; recovery</h3>
            <p className={pCls(4)}>Deeply researched, deeply personal decisions where trust is everything.</p>
          </div>

          {/* ── 5: Benefits & claims ─────────────────────────────────────── */}
          <div data-reveal className={cardCls(5)} {...bind(5)}>
            <div className={panelCls(5, '-top-4 -right-3 w-[152px] p-3')}>
              <p className="text-[9px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-2">Complex decisions</p>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-[14px] h-[14px] rounded-[4px] bg-[#39471D] flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 10 10" width="7" height="7" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M1.5 5L3.5 7.5L8.5 2" /></svg>
                </div>
                <div className="h-[4px] rounded-full bg-[#39471D] flex-1" />
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-[14px] h-[14px] rounded-[4px] bg-[#CBD0AC] flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 10 10" width="7" height="7" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M1.5 5L3.5 7.5L8.5 2" /></svg>
                </div>
                <div className="h-[4px] rounded-full bg-[#CBD0AC] flex-1 w-3/4" />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[14px] h-[14px] rounded-[4px] border border-[#e8e8e3] flex-shrink-0" />
                <div className="h-[4px] rounded-full bg-[#e8e8e3] flex-1 w-1/2" />
              </div>
            </div>
            <div className={panelCls(5, '-bottom-4 right-5 px-3 py-2.5 flex items-center gap-2')}>
              <Check />
              <div>
                <p className="text-[10px] font-bold text-gray-900 leading-none">Clear guidance</p>
                <p className="text-[9px] font-medium text-gray-400 mt-0.5">wins confidence</p>
              </div>
            </div>
            <h3 className={h3Cls(5)}>Benefits &amp; claims</h3>
            <p className={pCls(5)}>Complex, confusing choices where the clear, trusted guide wins.</p>
          </div>

        </div>
      </div>
    </section>
  );
}
