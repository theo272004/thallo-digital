/**
 * Console chrome, shared by every screen of the scan.
 *
 * Deliberately not the language of the marketing pages. Those use a white
 * ground, 28px radii and grey hairlines. The console uses a deep green ground,
 * 8–16px radii, dense readouts and roughly half the padding — because a tool
 * that looks like the brochure around it never reads as a tool.
 *
 * Two things here are house style rather than tool language, and both were
 * changed to match the rest of the site: the buttons are fully rounded, and the
 * labels are Inter. The typewriter face the console used to caption everything
 * with is gone site-wide; only genuine machine output still carries it — the
 * model names and citations in the audit trail.
 *
 * Contrast, checked rather than assumed. Both ends of the ground gradient carry
 * white well past AA (#39471D → 10.0:1, #171A10 → 17.6:1) and #E7ECD9 past it
 * too (8.3:1 and 14.6:1). #CBD0AC is 6.3:1 on the olive end. #55672E is only
 * 2.8:1 on the ink and is therefore used for rules and dots, never for text.
 */

import React from 'react';
import { PROVIDER_LOGO, type AnyProvider } from '@/lib/scan/types';
import { BASE } from '@/lib/site';

export const GROUND: React.CSSProperties = {
  backgroundImage: 'linear-gradient(158deg, #39471D 0%, #171A10 58%)',
};

/** The faint plotting grid that says "canvas" rather than "page". */
export const GRID: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, rgba(231,236,217,.055) 1px, transparent 1px),' +
    'linear-gradient(to bottom, rgba(231,236,217,.055) 1px, transparent 1px)',
  backgroundSize: '56px 56px',
};

/* White cards on dark green need their edge drawn by shadow, not by the
   hairline border the marketing cards use — a light border against the green
   reads as a seam rather than a card. */
export const CARD: React.CSSProperties = { boxShadow: '0 18px 44px -26px rgba(23,26,16,.66)' };

export const BTN_DARK =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[#171A10] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#39471D] disabled:cursor-not-allowed disabled:opacity-40';

export const BTN_GHOST =
  'inline-flex items-center justify-center gap-2 rounded-full border border-[#39471D]/25 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#39471D] transition-colors hover:bg-[#E7ECD9] disabled:cursor-not-allowed disabled:opacity-40';

export const FIELD =
  'w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition-colors focus:border-[#55672E] focus:outline-none';

/** Micro-label. Every readout on the console is captioned with one. */
export const Micro = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`text-[11px] font-bold uppercase tracking-[0.18em] ${className}`}>{children}</span>
);

/** A white console panel. */
export function Panel({
  children,
  className = '',
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) {
  return (
    <div className={`rounded-xl bg-white p-5 sm:p-6 ${className}`} style={CARD} {...rest}>
      {children}
    </div>
  );
}

export function Meter({ pct, tone = 'olive' }: { pct: number; tone?: 'olive' | 'grey' }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-sm bg-[#E7ECD9]">
      <span
        className={`block h-full rounded-sm ${tone === 'olive' ? 'bg-[#39471D]' : 'bg-gray-300'}`}
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </span>
  );
}

export type Tone = 'on' | 'mid' | 'off';

export function Verdict({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const s =
    tone === 'on' ? 'bg-[#39471D] text-white' : tone === 'mid' ? 'bg-[#E7ECD9] text-[#39471D]' : 'bg-gray-100 text-gray-600';
  return <Micro className={`shrink-0 whitespace-nowrap rounded-sm px-2 py-1 ${s}`}>{children}</Micro>;
}

/** A dense readout cell — the console's headline figures. */
export function Stat({ value, label, muted = false }: { value: string; label: string; muted?: boolean }) {
  return (
    <div className="px-4 py-4 first:pl-0">
      <p
        className={`text-2xl sm:text-3xl font-bold leading-none tracking-tight tabular-nums ${
          muted ? 'text-gray-300' : 'text-[#39471D]'
        }`}
      >
        {value}
      </p>
      <Micro className="mt-2.5 block text-gray-400">{label}</Micro>
    </div>
  );
}

/** Platform mark. No logo is invented — providers without a file get a glyph. */
export function ProviderMark({ provider }: { provider: AnyProvider }) {
  const file = PROVIDER_LOGO[provider];
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-white p-1">
      {file ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${BASE}/logos/${file}`}
          alt=""
          aria-hidden="true"
          width={18}
          height={18}
          className="h-full w-full object-contain"
        />
      ) : (
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#39471D" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
        </svg>
      )}
    </span>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return <span className={`block animate-spin rounded-full border-2 border-[#39471D] border-t-transparent ${className}`} />;
}

/** Inline error. One place, so the wording and the colour never drift. */
export function Notice({ children, tone = 'error' }: { children: React.ReactNode; tone?: 'error' | 'info' }) {
  const s =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-[#E7ECD9] bg-[#F4FAF5] text-[#39471D]';
  return (
    <p className={`rounded-lg border px-4 py-3 text-[13px] font-medium leading-relaxed ${s}`} role="status">
      {children}
    </p>
  );
}
