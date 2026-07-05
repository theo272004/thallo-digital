import React from 'react';

interface CardProps {
  step: number;
  parallaxStyle?: React.CSSProperties;
}

export default function CardGoogle({ step, parallaxStyle }: CardProps) {
  return (
    <div 
      className={`floating-card-wrapper transition-all duration-700 ease-out`}
      style={{
        left: '10%',
        top: '12%',
        opacity: step >= 3 ? 1 : 0,
        transform: step >= 3 ? 'scale(1)' : 'scale(0.9)',
        ...parallaxStyle
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 text-gray-800">
          <img src="/logos/google.svg" alt="Google" className="w-full h-full object-contain" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-gray-900 leading-tight">Google</h4>
          <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100/50">
            AI Overview
          </span>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t border-gray-50 pt-2.5 mt-2.5">
        <span className="text-[10px] text-gray-500 flex items-center gap-1.5 font-medium">
          Source cited
          <span className="text-emerald-800 font-bold text-[11px]">✓</span>
        </span>
        <svg viewBox="0 0 100 30" width="60" height="18" fill="none">
          <path d="M 0,25 Q 25,20 50,12 T 100,2" stroke="var(--olive-light)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
