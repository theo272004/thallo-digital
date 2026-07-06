import React from 'react';

type Props = {
  children: React.ReactNode;
  center?: boolean;
  /** 'light' = for use on dark/olive backgrounds. */
  tone?: 'dark' | 'light';
  className?: string;
};

/** Space Mono kicker with a short rule — the shared section label. */
export default function Eyebrow({ children, center = false, tone = 'dark', className = '' }: Props) {
  const line = tone === 'light' ? 'bg-white' : 'bg-[#55672E]';
  const text = tone === 'light' ? 'text-white' : 'text-[#55672E]';
  return (
    <div className={`flex items-center gap-3 ${center ? 'justify-center' : ''} ${className}`}>
      <span className={`h-px w-7 ${line}`} />
      <span className={`font-mono text-[11px] font-bold tracking-[0.2em] uppercase ${text}`}>{children}</span>
    </div>
  );
}
