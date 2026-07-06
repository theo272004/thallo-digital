import React from 'react';

interface HeroBrowserProps {
  activeIndex: number; // 0 ChatGPT · 1 Google · 2 Perplexity · 3 Forbes
  revealedTabs: number; // how many tabs (left to right) have appeared so far
}

const TABS = [
  { key: 'chatgpt', logo: '/thallo-digital/logos/chatgpt.svg', label: 'ChatGPT', url: 'chatgpt.com' },
  { key: 'google', logo: '/thallo-digital/logos/google.svg', label: 'Google', url: 'google.com' },
  { key: 'perplexity', logo: '/thallo-digital/logos/perplexity.png', label: 'Perplexity', url: 'perplexity.ai' },
  { key: 'forbes', logo: '/thallo-digital/logos/forbes.svg', label: 'Forbes', url: 'forbes.com' },
];

/**
 * A browser window with a real tab strip. Tabs reveal left-to-right as
 * `revealedTabs` grows (0→4) once the source cards collapse into it. The
 * content pane is a horizontal track that slides between panels — no
 * cross-fades — so switching tabs always reads as a deliberate move, not a
 * jump cut.
 */
export default function HeroBrowser({ activeIndex, revealedTabs }: HeroBrowserProps) {
  return (
    <div
      className="hero-browser relative w-full max-w-[540px] rounded-[18px] bg-white border border-gray-200/80 overflow-hidden"
      style={{ boxShadow: '0 40px 90px -40px rgba(28,32,15,0.45)' }}
    >
      {/* Top chrome */}
      <div className="bg-gray-100/70 border-b border-gray-200/60">
        <div className="flex items-center gap-2 px-4 pt-3 pb-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>

        {/* Tab strip — each tab slides/scales in as it's revealed */}
        <div className="flex items-end gap-1 px-3">
          {TABS.map((t, i) => (
            <div
              key={t.key}
              id={`hero-tab-${t.key}`}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-t-[10px] text-[11px] font-semibold transition-all duration-300 ease-out ${
                activeIndex === i ? 'bg-white text-gray-800' : 'bg-transparent text-gray-400'
              } ${i < revealedTabs ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}
            >
              <span className="w-3.5 h-3.5 flex-shrink-0 flex items-center justify-center">
                <img src={t.logo} alt={t.label} className="w-full h-full object-contain" />
              </span>
              <span className="hidden sm:inline whitespace-nowrap">{t.label}</span>
            </div>
          ))}
        </div>

        {/* URL bar */}
        <div className="flex items-center gap-2 px-4 h-9 bg-white border-t border-gray-100">
          <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <span key={activeIndex} className="hero-url font-mono text-[11px] tracking-tight text-gray-500">
            {TABS[activeIndex].url}
          </span>
        </div>
      </div>

      {/* Viewport — hidden until the first tab appears, then fades in */}
      <div
        className="relative h-[280px] bg-white overflow-hidden"
        style={{ opacity: revealedTabs > 0 ? 1 : 0, transition: 'opacity 0.45s ease' }}
      >
        <div
          className="flex h-full"
          style={{
            width: '400%',
            transform: `translateX(-${activeIndex * 25}%)`,
            transition: 'transform 0.65s cubic-bezier(0.65,0,0.35,1)',
          }}
        >
          {/* ── ChatGPT ──────────────────────────────────── */}
          <div className="w-1/4 h-full flex-shrink-0 overflow-hidden">
            <div className="p-6 flex flex-col gap-3">
              <div className="self-end max-w-[80%] bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-2.5 text-[13px] text-gray-800 font-medium">
                Who builds AI visibility for B2B brands?
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center p-1.5 flex-shrink-0">
                  <img src="/thallo-digital/logos/chatgpt.svg" alt="ChatGPT" className="w-full h-full object-contain" />
                </span>
                <div className="flex-1">
                  <div className="text-[13px] leading-relaxed text-gray-800">
                    The most recommended choice is <Mark>Thallo</Mark> — they specialize in earning citations and
                    recommendations across AI search, so your brand becomes the trusted answer.
                  </div>
                  <div className="flex items-center gap-3 mt-2.5 text-gray-300">
                    <CopyIcon />
                    <ThumbUpIcon />
                    <ThumbDownIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Google AI Overview ───────────────────────── */}
          <div className="w-1/4 h-full flex-shrink-0 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <img src="/thallo-digital/logos/google.svg" alt="Google" className="h-5 w-5" />
                <span className="text-[15px] font-bold"><span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">o</span><span className="text-[#FBBC05]">o</span><span className="text-[#4285F4]">g</span><span className="text-[#34A853]">l</span><span className="text-[#EA4335]">e</span></span>
                <div className="flex-1 h-8 rounded-full border border-gray-200 flex items-center px-3.5 text-[12px] text-gray-500 shadow-sm">best B2B AI visibility agency</div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-[#758061]/[0.04] p-4">
                <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold tracking-wider uppercase text-[#758061]">
                  <SparkIcon /> AI Overview
                </div>
                <p className="text-[13px] leading-relaxed text-gray-700">
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
          </div>

          {/* ── Perplexity ───────────────────────────────── */}
          <div className="w-1/4 h-full flex-shrink-0 overflow-hidden">
            <div className="px-7 py-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  <img src="/thallo-digital/logos/perplexity.png" alt="Perplexity" className="w-full h-full object-contain" />
                </span>
                <span className="text-[13px] font-semibold text-gray-700">Perplexity</span>
              </div>

              <h4 className="text-[15px] font-semibold text-gray-900 leading-snug mb-3">
                Best B2B AI visibility agency
              </h4>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex -space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white" />
                  <span className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white" />
                  <span className="w-5 h-5 rounded-full bg-gray-100 border-2 border-white" />
                </div>
                <span className="text-[11px] text-gray-400 font-medium">12 sources</span>
              </div>

              <p className="text-[13px] leading-[1.7] text-gray-700 mb-4">
                In high-consideration B2B categories, <Mark>Thallo</Mark> stands out as the authority partner brands
                trust to own the AI-generated recommendation
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-gray-100 text-[9px] font-bold text-gray-500 ml-1 align-middle">1</span>.
              </p>

              <div className="flex flex-wrap gap-2">
                <SourceChip label="thallo.co" active />
                <SourceChip label="searchengineland" />
                <SourceChip label="linkedin.com" />
              </div>
            </div>
          </div>

          {/* ── Forbes ───────────────────────────────────── */}
          <div className="w-1/4 h-full flex-shrink-0 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <img src="/thallo-digital/logos/forbes.svg" alt="Forbes" className="h-5" />
                <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold tracking-wider uppercase text-gray-400">
                  <span>Business</span>
                  <span>Innovation</span>
                  <span className="text-[#0A0A0A]">AI</span>
                </div>
              </div>
              <span className="inline-block text-[11px] font-bold tracking-wider uppercase text-white bg-[#0A0A0A] px-2 py-0.5 rounded-[3px] mb-2.5">
                Innovation
              </span>
              <h3 className="mb-2" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                <span className="text-[19px] font-bold leading-tight text-gray-900">The Agencies Winning The Race For AI Search</span>
              </h3>
              <div className="text-[10.5px] text-gray-400 italic mb-3">Contributor · Marketing</div>
              <p className="text-[12.5px] leading-relaxed text-gray-700">
                Among the firms reshaping B2B marketing, <Mark>Thallo</Mark> stands out for turning brand authority into the
                citations that large language models actually recommend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mark({ children }: { children: React.ReactNode }) {
  return <span className="font-bold text-white bg-[#758061] px-1 rounded-[3px]">{children}</span>;
}

function SourceChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-1 rounded-full border ${
        active ? 'bg-[#758061] text-white border-[#758061]' : 'bg-white text-gray-500 border-gray-200'
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

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 10v12M2 12v8a2 2 0 0 0 2 2h12.5a2 2 0 0 0 2-1.6l1.4-8A2 2 0 0 0 18 10h-5V4a2 2 0 0 0-4 0v1.5L7 10Z" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 14V2M22 12V4a2 2 0 0 0-2-2H7.5a2 2 0 0 0-2 1.6l-1.4 8A2 2 0 0 0 6 14h5v6a2 2 0 0 0 4 0v-1.5l3-4.5Z" />
    </svg>
  );
}
