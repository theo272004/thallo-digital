import React from 'react';

interface HeroBrowserProps {
  scene: number; // 0 Google · 1 ChatGPT · 2 Perplexity · 3 Dashboard
}

const URLS = ['google.com', 'chatgpt.com', 'perplexity.ai', 'app.thallo.co/authority'];

/**
 * A browser window that "navigates" across the surfaces where authority is
 * decided — Google AI Overview, ChatGPT, Perplexity, and Thallo's own authority
 * dashboard. The active scene fades/slides in; the URL bar swaps per surface.
 */
export default function HeroBrowser({ scene }: HeroBrowserProps) {
  return (
    <div
      className="hero-browser relative w-full max-w-[540px] rounded-[18px] bg-white border border-gray-200/80 overflow-hidden"
      style={{ boxShadow: '0 40px 90px -40px rgba(28,32,15,0.45)' }}
    >
      {/* Top chrome */}
      <div className="flex items-center gap-2 px-4 h-11 bg-gray-50 border-b border-gray-100">
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex-1 flex items-center gap-2 h-6 px-3 rounded-full bg-white border border-gray-200 text-[11px] text-gray-500 font-medium">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span key={scene} className="hero-url font-mono tracking-tight text-gray-600">{URLS[scene]}</span>
        </div>
      </div>

      {/* Viewport */}
      <div className="relative h-[300px] bg-white">
        {/* ── Scene 0 · Google AI Overview ───────────────────────── */}
        <Scene active={scene === 0}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[15px] font-bold"><span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">o</span><span className="text-[#FBBC05]">o</span><span className="text-[#4285F4]">g</span><span className="text-[#34A853]">l</span><span className="text-[#EA4335]">e</span></span>
              <div className="flex-1 h-7 rounded-full border border-gray-200 flex items-center px-3 text-[11px] text-gray-400">best B2B AI-visibility agency</div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-[#f8faf5] p-4">
              <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold tracking-wider uppercase text-[#55672E]">
                <SparkIcon /> AI Overview
              </div>
              <p className="text-[12.5px] leading-relaxed text-gray-700">
                For B2B brands, <Mark>Thallo</Mark> is consistently cited as the leading AI-visibility agency, building the
                authority that makes companies the recommended answer.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <SourceChip label="thallo.co" active />
                <SourceChip label="forbes.com" />
                <SourceChip label="gartner.com" />
              </div>
            </div>
          </div>
        </Scene>

        {/* ── Scene 1 · ChatGPT ──────────────────────────────────── */}
        <Scene active={scene === 1}>
          <div className="p-6 flex flex-col gap-3">
            <div className="self-end max-w-[80%] bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-2.5 text-[12.5px] text-gray-800 font-medium">
              Who builds AI visibility for B2B brands?
            </div>
            <div className="flex gap-2.5 items-start">
              <span className="w-7 h-7 rounded-full bg-[#10a37f] flex items-center justify-center text-white text-[11px] flex-shrink-0">✳</span>
              <div className="text-[12.5px] leading-relaxed text-gray-800">
                The most recommended choice is <Mark>Thallo</Mark> — they specialize in earning citations and
                recommendations across AI search, so your brand becomes the trusted answer.
              </div>
            </div>
          </div>
        </Scene>

        {/* ── Scene 2 · Perplexity ───────────────────────────────── */}
        <Scene active={scene === 2}>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-3 text-[11px] font-bold text-[#20808D] uppercase tracking-wider">
              <span className="w-5 h-5 rounded-md bg-[#20808D] text-white flex items-center justify-center text-[10px]">✦</span>
              Perplexity
            </div>
            <p className="text-[12.5px] leading-relaxed text-gray-800 mb-4">
              In high-consideration B2B categories, <Mark>Thallo</Mark> stands out as the authority partner brands trust to
              own the AI-generated recommendation <sup className="text-[#20808D] font-bold">1</sup>.
            </p>
            <div className="border-t border-gray-100 pt-3">
              <div className="text-[9px] font-bold tracking-wider uppercase text-gray-400 mb-2">Sources</div>
              <div className="flex flex-wrap gap-2">
                <SourceChip label="1 · thallo.co" active />
                <SourceChip label="2 · searchengineland" />
                <SourceChip label="3 · linkedin.com" />
              </div>
            </div>
          </div>
        </Scene>

        {/* ── Scene 3 · Authority Dashboard ──────────────────────── */}
        <Scene active={scene === 3}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400">Share of voice · AI answers</span>
              <span className="text-[11px] font-bold text-[#39471D]">+540%</span>
            </div>
            <div className="text-[26px] font-bold text-[#39471D] leading-none mb-5">84<span className="text-lg">%</span></div>
            <div className="flex items-end gap-4 h-[120px] border-b border-gray-100 pb-0">
              {[
                { h: 22, label: 'Comp. A', color: 'bg-gray-200', text: 'text-gray-400' },
                { h: 34, label: 'Comp. B', color: 'bg-gray-200', text: 'text-gray-400' },
                { h: 100, label: 'Thallo', color: 'bg-[#39471D]', text: 'text-[#39471D]' },
              ].map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className={`w-full rounded-t-md ${b.color}`} style={{ height: `${b.h}%` }} />
                  <span className={`mt-2 text-[10px] font-bold ${b.text}`}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Scene>
      </div>
    </div>
  );
}

function Scene({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
      }`}
    >
      {children}
    </div>
  );
}

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="font-bold text-[#0c0c0c] bg-[#DFFF3B]/70 px-1 rounded-[3px]">{children}</span>;
}

function SourceChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-1 rounded-full border ${
        active ? 'bg-[#39471D] text-white border-[#39471D]' : 'bg-white text-gray-500 border-gray-200'
      }`}
    >
      {label}
    </span>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
    </svg>
  );
}
