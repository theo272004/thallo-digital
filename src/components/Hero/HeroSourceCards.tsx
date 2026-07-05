import React from 'react';

const CARDS = [
  { key: 'google', logo: '/thallo-digital/logos/google.svg', name: 'Google', tag: 'AI Overview', pos: 'top-0 -left-[7%]', scene: 1 },
  { key: 'chatgpt', logo: '/thallo-digital/logos/chatgpt.svg', name: 'ChatGPT', tag: 'Recommends you', pos: 'top-[14%] -right-[7%]', scene: 2 },
  { key: 'perplexity', logo: '/thallo-digital/logos/perplexity.svg', name: 'Perplexity', tag: 'Cited ✓', pos: 'bottom-[14%] -left-[7%]', scene: 3 },
  { key: 'forbes', logo: '/thallo-digital/logos/forbes.svg', name: 'Forbes', tag: 'Featured', pos: 'bottom-0 -right-[6%]', scene: -1 },
];

/**
 * Source cards around the browser. Hidden during the phone beat (scene 0);
 * pop in fast with a tight CSS stagger once the browser appears; the active
 * surface is highlighted. No cursor tracking.
 */
export default function HeroSourceCards({ scene }: { scene: number }) {
  const show = scene >= 1;
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {CARDS.map((c, i) => {
        const on = scene === c.scene;
        return (
          <div
            key={c.key}
            style={{ transitionDelay: show ? `${i * 70}ms` : '0ms' }}
            className={`src-card absolute ${c.pos} w-[156px] bg-white rounded-2xl border p-3 flex items-center gap-2.5 transition-all duration-[400ms] ease-out ${
              show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95'
            } ${
              on
                ? 'border-[#39471D] shadow-[0_20px_44px_-18px_rgba(57,71,29,0.55)] -translate-y-0.5'
                : 'border-gray-100 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.25)]'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 flex-shrink-0">
              <img src={c.logo} alt={c.name} className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-gray-900 leading-tight">{c.name}</div>
              <div className={`text-[10px] font-semibold ${on ? 'text-[#39471D]' : 'text-gray-400'}`}>{c.tag}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
