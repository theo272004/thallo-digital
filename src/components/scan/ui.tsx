/**
 * Console chrome, shared by every screen of the scan.
 *
 * Deliberately not the language of the marketing pages. Those use a white
 * ground, 28px radii and grey hairlines. The console uses a deep green ground,
 * 8–16px radii, dense readouts and roughly half the padding — because a tool
 * that looks like the brochure around it never reads as a tool.
 *
 * The labels are Inter rather than the typewriter face the console used to
 * caption everything with; that is gone site-wide, and only genuine machine
 * output still carries it — the model names and citations in the audit trail.
 *
 * ## One screen sets the language for the rest
 *
 * The setup card was designed first and is the screen everybody sees, so it is
 * the reference: a white `Panel` at 24/32px padding, an olive disc marking each
 * step, a 22px title with a 14px grey line under it, 12px radii on every field
 * and button, and olive tint blocks for anything that is guidance rather than
 * data. Everything after it — the progress list, the results, the report — had
 * drifted into a second dialect: uppercase micro-labels doing the work of
 * headings, 8px radii, and small-caps pill buttons. Same tool, two designs, and
 * the half nobody sees until they have committed was the worse-looking half.
 *
 * `Head`, `Badge`, `Chip`, `Tint`, `FIELD`, `BTN_PRIMARY` and `BTN_SECONDARY`
 * below are that first screen's vocabulary, pulled out so the later screens are
 * built from the same parts rather than from a copy that drifts again. `Micro`
 * stays, but only for genuine micro-captions — units, counts, the masthead
 * eyebrow — never as a panel's title.
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

/* One radius, 12px: every panel, field, button, tint block and inner card.
   The console had 4, 6, 8 and 12 all in use at once, and the screens that
   leaned on the small end were exactly the ones that stopped looking like the
   setup card in front of them. */

/* The setup card's two buttons, which are now the console's two buttons. The
   pair they replace were small-caps pills at 11px — right for a dense tool
   panel, wrong beside the 14px bold "Continue" on the screen immediately
   before them, which is where a visitor learns what our buttons look like. */
export const BTN_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-[#39471D] px-6 py-3.5 text-[14px] font-bold text-white transition-colors hover:bg-[#55672E] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#39471D]';

export const BTN_SECONDARY =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3.5 text-[13px] font-semibold text-gray-600 transition-colors hover:border-[#39471D] hover:text-[#39471D] disabled:cursor-not-allowed disabled:opacity-40';

/* Carries its own size and radius so no call site has to restate them. It was
   an 8px/14px field that every screen overrode back up to the setup card's
   12px/15px — which is how two call sites ended up with both text sizes on one
   element, the winner decided by stylesheet order rather than by intent. */
export const FIELD =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] font-medium text-gray-900 placeholder-gray-400 transition-colors hover:border-gray-300 focus:border-[#39471D] focus:outline-none';

/** The olive disc that marks a step, or heads a section of the report. */
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#39471D] text-[15px] font-bold text-white">
      {children}
    </span>
  );
}

/** The olive-tint pill that carries a count or a status beside a heading. */
export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-full bg-[#39471D]/10 px-3.5 py-2 text-[12px] font-bold tabular-nums text-[#39471D]">
      {children}
    </span>
  );
}

/**
 * A panel's masthead: disc, title, and the line that says what the panel is.
 *
 * The sub-line is not decoration. Every readout below needs a sentence saying
 * what it measures, and those sentences already existed — they were just
 * floating under an uppercase label with nothing tying the two together.
 */
export function Head({
  badge,
  title,
  sub,
  chip,
  className = '',
}: {
  badge?: React.ReactNode;
  title: React.ReactNode;
  sub?: React.ReactNode;
  chip?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap items-start justify-between gap-4 ${className}`}>
      <div className="flex min-w-0 items-start gap-3">
        {badge !== undefined && <Badge>{badge}</Badge>}
        <div className="min-w-0">
          <h2 className="text-[22px] font-bold leading-tight tracking-tight text-gray-900">{title}</h2>
          {sub && <p className="mt-1.5 max-w-[64ch] text-[14px] font-medium leading-relaxed text-gray-500">{sub}</p>}
        </div>
      </div>
      {chip !== undefined && <Chip>{chip}</Chip>}
    </div>
  );
}

/**
 * The olive tint block — guidance, findings, anything that is a remark about
 * the data rather than the data itself.
 *
 * `edged` draws the border the setup card's hint carries; the plain one is the
 * flat wash used for the email block and the key insight.
 */
export function Tint({
  children,
  edged = false,
  className = '',
}: {
  children: React.ReactNode;
  edged?: boolean;
  className?: string;
}) {
  return (
    <div className={`rounded-xl p-4 sm:p-5 ${edged ? 'border border-[#D9E2C8] bg-[#F7FAF2]' : 'bg-[#F4FAF5]'} ${className}`}>
      {children}
    </div>
  );
}

/** Micro-label. Units, counts and the masthead eyebrow — never a heading. */
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
    <div className={`rounded-xl bg-white p-6 sm:p-8 ${className}`} style={CARD} {...rest}>
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
      {/* Sentence case at 12px. In uppercase micro-caps these read as a
          machine's column headers, which is the dialect the setup card — the
          screen right before this one — does not speak. */}
      <span className="mt-2 block text-[12px] font-semibold leading-snug text-gray-500">{label}</span>
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
    <p className={`rounded-xl border px-4 py-3.5 text-[13px] font-medium leading-relaxed ${s}`} role="status">
      {children}
    </p>
  );
}
