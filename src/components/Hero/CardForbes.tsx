import React from 'react';

interface CardProps {
  step: number;
  parallaxStyle?: React.CSSProperties;
}

export default function CardForbes({ step, parallaxStyle }: CardProps) {
  return (
    <div 
      className={`floating-card-wrapper transition-all duration-700 ease-out`}
      style={{
        right: '-20px',
        top: '46%',
        opacity: step >= 5 ? 1 : 0,
        transform: step >= 5 ? 'scale(1)' : 'scale(0.9)',
        ...parallaxStyle
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 text-gray-800">
          <img src="/thallo-digital/logos/forbes.svg" alt="Forbes" className="w-full h-full object-contain" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Forbes</h4>
          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-100/50">
            Industry report
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t border-gray-50 pt-2.5 mt-2.5">
        <span className="text-[10px] text-gray-500 flex items-center gap-1.5 font-medium">
          Source cited
          <span className="text-emerald-800 font-bold text-[11px]">✓</span>
        </span>
        <svg viewBox="0 0 100 30" width="60" height="18" fill="none">
          <path d="M 0,27 Q 40,24 60,18 T 100,6" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
