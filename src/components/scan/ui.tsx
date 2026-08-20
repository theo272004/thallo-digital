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
 * `Stepper` and `Tag` carry the same idea outwards onto the dark masthead: the
 * setup card numbered its own two screens and then the numbering stopped, so
 * running and reporting read as a different program rather than as steps 3 and
 * 4 of one. The rail now spans all four, and the facts you typed into the form
 * — brand, category, market — stay on screen as tags once the fields are gone.
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

/** The faint plotting grid that says "canvas" rather than "page".
    No longer used by the scan console — over the photograph band it read as a
    texture on the picture rather than as graph paper under the tool, which is
    the only thing it was ever for. Still drawn on the results dashboard, where
    the ground really is flat. */
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

/** The olive pill that carries a count or a status beside a heading. Solid and
    white-lettered, for the same reason the block above is: at 10% opacity it
    was a grey pill with green text on it. */
export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0 rounded-full bg-[#39471D] px-3.5 py-2 text-[12px] font-bold tabular-nums text-white">
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
 * The olive block — guidance, findings, anything that is a remark about the
 * data rather than the data itself.
 *
 * Deep green with white type, not the near-white wash it used to be. At
 * #F4FAF5 against a white panel the block was a tint you had to look for: the
 * key insight — the one sentence on the report that says what the numbers mean
 * — read as a faintly shaded paragraph rather than as the conclusion. The dark
 * ground is the console's own colour and gives the block the weight its content
 * already had.
 *
 * `edged` is kept as a distinction between the two uses — guidance beside a
 * field, against a finding about the data — but both are now dark; the edged
 * one simply carries a lighter rule so it reads as an aside rather than as a
 * verdict.
 *
 * White on #39471D is 10.0:1, so every call site can use plain white and the
 * softer #CBD0AC (6.3:1) for anything secondary. What no longer works inside
 * one of these is grey body text, and the call sites were updated with it.
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
    <div
      className={`rounded-xl p-4 sm:p-5 ${
        edged ? 'border border-[#55672E] bg-[#39471D]' : 'bg-[#39471D]'
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Micro-label. Units, counts and the masthead eyebrow — never a heading. */
export const Micro = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <span className={`text-[11px] font-bold uppercase tracking-[0.18em] ${className}`}>{children}</span>
);

/**
 * A fact about the run, worn on the dark masthead.
 *
 * The setup card carries the brand, the category and the market as fields you
 * filled in; the moment the scan starts they vanish from the screen, and every
 * stage after it was a report about a brand with no statement of what was
 * actually measured. These put them back where the fields were.
 */
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11.5px] font-semibold text-white/90">
      {children}
    </span>
  );
}

/** The four screens of a scan, in order. `Stepper` is indexed against this. */
export const STAGE_LABELS = ['Your brand', 'Your questions', 'Scanning', 'Report'] as const;

/**
 * Where you are in the scan.
 *
 * The setup card numbers its own two screens with olive discs — "1. Your
 * brand", "2. Your questions" — and then the numbering simply stopped. Running
 * and reporting are two more screens in the same sequence, and without a rail
 * saying so they read as a different program that took over once the form was
 * submitted. So the rail covers all four, sits on the masthead above every
 * stage including the first, and uses the same discs.
 *
 * Colours are for the dark ground it always sits on: white for the step you are
 * on, #CBD0AC for the ones behind you (6.3:1 on the olive end), and a muted
 * white for the ones ahead — which are chrome, not information.
 */
export function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-2.5">
      {STAGE_LABELS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const now = n === current;
        return (
          <li key={label} className="flex items-center gap-2.5">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${
                done
                  ? 'bg-[#CBD0AC] text-[#171A10]'
                  : now
                    ? 'bg-white text-[#39471D]'
                    : 'border border-white/25 text-white/55'
              }`}
            >
              {done ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                n
              )}
            </span>
            <span
              className={`text-[12.5px] ${
                now ? 'font-bold text-white' : done ? 'font-semibold text-[#CBD0AC]' : 'font-medium text-white/55'
              }`}
            >
              {label}
            </span>
            {/* Hidden on small screens, where the rail wraps and a rule between
                two lines points at nothing. */}
            {i < STAGE_LABELS.length - 1 && <span aria-hidden className="ml-1 hidden h-px w-7 bg-white/20 lg:block" />}
          </li>
        );
      })}
    </ol>
  );
}

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

/* The track is grey, not pale green. On a white panel #E7ECD9 behind a dark
   green fill read as two values rather than as a value on a scale — and pale
   green on white is the one use of it the brand does not want. It stays a type
   colour on the dark ground, where it belongs. */
export function Meter({ pct, tone = 'olive' }: { pct: number; tone?: 'olive' | 'grey' }) {
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-sm bg-gray-100">
      <span
        className={`block h-full rounded-sm ${tone === 'olive' ? 'bg-[#39471D]' : 'bg-gray-300'}`}
        style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
      />
    </span>
  );
}

export type Tone = 'on' | 'mid' | 'off';

export function Verdict({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  /* `mid` was pale green on green — the middle of three states rendered
     lighter than the negative one below it, so a partial result read as the
     weakest of the three. It is olive with white type now, separated from `on`
     by the rule around it rather than by being washed out. */
  const s =
    tone === 'on'
      ? 'bg-[#39471D] text-white'
      : tone === 'mid'
        ? 'bg-[#55672E] text-white'
        : 'bg-gray-100 text-gray-600';
  return <Micro className={`shrink-0 whitespace-nowrap rounded-sm px-2 py-1 ${s}`}>{children}</Micro>;
}

/** A dense readout cell — the console's headline figures. */
export function Stat({
  value,
  label,
  note,
  muted = false,
}: {
  value: string;
  label: string;
  /** What the figure means, in the reader's words. A number with a name is
      still not a finding: "Retrieval / 100" tells a client nothing they can act
      on, and a client who cannot read a number decides it was invented. */
  note?: string;
  muted?: boolean;
}) {
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
      {note && <span className="mt-1 block text-[11px] font-medium leading-snug text-gray-400">{note}</span>}
    </div>
  );
}

/** Platform mark. No logo is invented — providers without a file get a glyph.
 *
 * Bare, not boxed. Each mark used to sit in a bordered white tile, which put a
 * card inside a card inside a card — a logo in a box, in a bordered row, in a
 * panel — and made five identical frames the loudest thing in a legend whose
 * subject is five different companies. These are already recognisable shapes;
 * the frame was only ever telling the eye where one logo stopped, which the
 * gap beside it does anyway. */
export function ProviderMark({ provider }: { provider: AnyProvider }) {
  const file = PROVIDER_LOGO[provider];
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
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

/** Takes its colour from the text colour around it — `border-current` rather
    than a hardcoded olive, so the same spinner works on a white panel and
    inside a dark green block, where an olive ring on olive was invisible. */
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`block animate-spin rounded-full border-2 border-current border-t-transparent text-[#39471D] ${className}`}
    />
  );
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
