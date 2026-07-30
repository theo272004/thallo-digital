'use client';
import React, { useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

// Floating panel — lifts on card hover via group-hover.
// One panel per card, alternating above and below down the grid (1 above,
// 2 below, 3 above…). Two panels per card read as clutter and the pair
// competed with each other for the same glance.
const fp =
  'absolute z-20 bg-white border border-[#ececec] rounded-[16px] ' +
  'shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] pointer-events-none ' +
  'transition-all duration-300 ease-out ' +
  'group-hover:-translate-y-[6px] group-hover:scale-[1.03] ' +
  'group-hover:shadow-[0_10px_28px_rgba(0,0,0,0.13)]';

// Exactly one card is green at a time. Six blocks of solid green read as a
// wall; one green against five white reads as a selection, and the grid stops
// competing with the floating panels for attention.
const cardBase =
  'group relative p-8 pt-16 pb-12 border rounded-3xl ' +
  'transition-[background-color,border-color,box-shadow,transform] duration-300 ease-out ' +
  'hover:-translate-y-1';

const cardOn =
  'bg-[#39471D] border-transparent shadow-[0_8px_32px_-12px_rgba(57,71,29,0.40)] ' +
  'hover:shadow-[0_24px_60px_-20px_rgba(57,71,29,0.55)]';

const cardOff =
  'bg-white border-gray-200 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] ' +
  'hover:shadow-[0_20px_48px_-24px_rgba(23,26,16,0.30)]';

const panel = (extra: string) => `${fp} ${extra}`;

/* The green never resets on mouse-out: whichever card the cursor touched last
   stays lit once you scroll on, so the section keeps a chosen state instead of
   snapping back to a default the moment you leave. */
function Card({
  index, active, onActivate, title, body, children,
}: {
  index: number;
  active: number;
  onActivate: (i: number) => void;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  const on = index === active;
  return (
    <div
      data-reveal
      onMouseEnter={() => onActivate(index)}
      onClick={() => onActivate(index)}
      className={`${cardBase} ${on ? cardOn : cardOff}`}
    >
      {children}
      <h3 className={`text-xl font-semibold mb-2.5 transition-colors duration-300 ${on ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </h3>
      <p className={`text-sm leading-relaxed font-medium transition-colors duration-300 ${on ? 'text-[#CBD0AC]' : 'text-gray-500'}`}>
        {body}
      </p>
    </div>
  );
}

const Check = () => (
  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
    <svg viewBox="0 0 10 10" width="8" height="8" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 5L3.5 7.5L8.5 2" />
    </svg>
  </div>
);

export default function Industries() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-white py-16 2xl:py-24 min-h-[80vh] flex flex-col justify-center border-b border-gray-100" id="industries">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <Eyebrow className="mb-5">Industries</Eyebrow>
          <SplitReveal
            as="h2"
            className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-6 font-sans leading-[1.05]"
            html="Where trust decides the sale."
          />
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch]">
            We go deep in high-consideration categories, where buyers research hard and choose the provider they trust most.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">

          {/* ── Specialized software ─────────────────────────────────────── */}
          <Card
            index={0} active={active} onActivate={setActive}
            title="Specialized software"
            body="Category-defining SaaS where the winner is the name buyers already trust."
          >
            <div className={panel('-top-4 -right-4 w-[152px] p-3')}>
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-2">AI Overview</p>
              <div className="h-[5px] rounded-full bg-[#39471D] mb-1.5" />
              <div className="h-[5px] rounded-full bg-[#CBD0AC] mb-1.5 w-3/4" />
              <div className="h-[5px] rounded-full bg-[#e8e8e3] w-1/2" />
            </div>
          </Card>

          {/* ── Fintech ──────────────────────────────────────────────────── */}
          <Card
            index={1} active={active} onActivate={setActive}
            title="Fintech"
            body="Where a wrong vendor is costly to unwind, and credibility clears the shortlist."
          >
            <div className={panel('-bottom-4 right-4 p-3')}>
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-2">Decision factors</p>
              <div className="flex gap-1.5">
                <span className="text-[11px] font-bold text-[#39471D] bg-[#39471D]/10 px-2 py-0.5 rounded-full whitespace-nowrap">Trust</span>
                <span className="text-[11px] font-bold text-[#39471D] bg-[#39471D]/10 px-2 py-0.5 rounded-full whitespace-nowrap">Authority</span>
                <span className="text-[11px] font-bold text-[#39471D] bg-[#39471D]/10 px-2 py-0.5 rounded-full whitespace-nowrap">ROI</span>
              </div>
            </div>
          </Card>

          {/* ── Health tech ──────────────────────────────────────────────── */}
          <Card
            index={2} active={active} onActivate={setActive}
            title="Health tech"
            body="Regulated, high-stakes buying that rewards the most credible, best-documented source."
          >
            <div className={panel('-top-4 -right-3 w-[148px] p-3')}>
              <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-gray-400 mb-2">AI Answer</p>
              <div className="h-[5px] rounded-full bg-[#e8e8e3] mb-1.5" />
              <div className="h-[5px] rounded-full bg-[#e8e8e3] mb-1.5 w-4/5" />
              <div className="h-[5px] rounded-full bg-[#39471D] w-1/2 mb-1.5" />
              <p className="text-[11px] font-bold text-[#39471D]">Thallo</p>
            </div>
          </Card>

          {/* ── Professional services ────────────────────────────────────── */}
          <Card
            index={3} active={active} onActivate={setActive}
            title="Professional services"
            body="Expertise businesses that live or die on reputation and referral."
          >
            <div className={panel('-bottom-4 left-1/2 -translate-x-1/2 px-4 py-2.5 flex items-center gap-2.5')}>
              <div className="w-6 h-6 rounded-full bg-[#39471D]/10 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#39471D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-900 leading-none whitespace-nowrap">Referrals</p>
                <p className="text-[11px] font-medium text-gray-400 mt-0.5 whitespace-nowrap">drive growth</p>
              </div>
            </div>
          </Card>

          {/* ── Health & recovery ────────────────────────────────────────── */}
          <Card
            index={4} active={active} onActivate={setActive}
            title="Health & recovery"
            body="Deeply researched, deeply personal decisions where trust is everything."
          >
            <div className={panel('-top-4 -right-3 p-3 w-[160px]')}>
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-gray-400 mb-2">Buyer intent</p>
              <div className="flex items-center gap-2.5">
                <svg viewBox="0 0 52 52" width="44" height="44" className="flex-shrink-0">
                  <circle cx="26" cy="26" r="20" fill="none" stroke="#e8e8e3" strokeWidth="4" />
                  <circle cx="26" cy="26" r="20" fill="none" stroke="#39471D" strokeWidth="4" strokeDasharray="125.66" strokeDashoffset="27.6" strokeLinecap="round" transform="rotate(-90 26 26)" />
                  <text x="26" y="30" textAnchor="middle" fontSize="10" fontWeight="700" fill="#111827">78%</text>
                </svg>
                <p className="text-[11px] font-medium text-gray-500 leading-snug">Deep research<br />before decision</p>
              </div>
            </div>
          </Card>

          {/* ── Benefits & claims ────────────────────────────────────────── */}
          <Card
            index={5} active={active} onActivate={setActive}
            title="Benefits & claims"
            body="Complex, confusing choices where the clear, trusted guide wins."
          >
            <div className={panel('-bottom-4 right-5 px-3 py-2.5 flex items-center gap-2')}>
              <Check />
              <div>
                <p className="text-[11px] font-bold text-gray-900 leading-none">Clear guidance</p>
                <p className="text-[11px] font-medium text-gray-400 mt-0.5">wins confidence</p>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </section>
  );
}
