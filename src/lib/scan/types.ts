/**
 * The data contract between the scan UI and the backend.
 *
 * Everything the UI renders comes from these shapes. The backend — a WordPress
 * plugin living on the same Bluehost account as the blog — returns exactly
 * these objects, so wiring the real thing means filling in API keys, not
 * touching a component.
 *
 * Two things shape the design.
 *
 * First, the cost model. Phase 1 is free and always runs; phase 2 costs money
 * (a grounded-retrieval call, a SERP lookup, a crawl of the domain) and only
 * runs once we have an email. The split is in the types so it cannot be
 * forgotten in the wiring.
 *
 * Second, PHP on shared hosting. Fifteen questions across three models is
 * forty-five calls — far past any `max_execution_time` a Bluehost plan will
 * give us. So a scan is a job, not a request: the client starts it, then ticks
 * it forward one step at a time and reads the progress back. That is why
 * `steps` carries live state rather than the UI faking it on a timer.
 */

/** Models queried from memory — no web search. "Do you know this brand?" */
export type MemoryProvider = 'chatgpt' | 'claude' | 'gemini';

/** Grounded sources — live retrieval. "Is this brand findable right now?" */
export type RetrievalProvider = 'perplexity' | 'ai-overview';

export type AnyProvider = MemoryProvider | RetrievalProvider;

export const MEMORY_PROVIDERS: readonly MemoryProvider[] = ['chatgpt', 'claude', 'gemini'];

export const PROVIDER_LABEL: Record<AnyProvider, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  'ai-overview': 'Google AI Overview',
};

/** Logo marks we actually hold. Providers without one fall back to a glyph. */
export const PROVIDER_LOGO: Partial<Record<AnyProvider, string>> = {
  chatgpt: 'chatgpt.svg',
  /* Gemini the model wears the Gemini spark; Google AI Overview wears Google's
     "G". They are different products and had been sharing the one mark. */
  gemini: 'gemini.svg',
  'ai-overview': 'google.svg',
  perplexity: 'perplexity.png',
};

// ---------------------------------------------------------------------------
// Phase 1 — free
// ---------------------------------------------------------------------------

/** One question put to one model, and what came back. The audit trail row. */
export interface Answer {
  /** Index into `ScanPhase1.questions`, so the text is not repeated 45 times. */
  q: number;
  /** Did the answer name the brand? */
  mentioned: boolean;
  /** Rank the brand held in the list, 1-based. `null` when it was not named. */
  position: number | null;
  /** Companies the model named, in the order it ranked them. */
  names: string[];
}

export interface ProviderResult {
  provider: MemoryProvider;
  /** Exact model id — printed in the audit trail so the run is reproducible. */
  model: string;
  /** How many of the questions returned an answer naming the brand. */
  mentions: number;
  /** Rank the brand held in each answer that named it (1 = listed first). */
  positions: number[];
  /** Every answer, in question order. Powers the "see what we asked" table. */
  answers: Answer[];
  /** Set when the provider errored out — the row renders as unavailable rather
      than as a zero, because "we could not ask" is not "you were not named". */
  error?: string;
}

/** Free tier. Enough to prove the problem, not enough to solve it. */
export interface ScanPhase1 {
  scanId: string;
  brand: string;
  domain: string;
  industry: string;
  /** The market it was run in. Printed beside the date, because a share of
      voice without the market it was measured in is not a finding. */
  market: string;
  /** ISO timestamp — shown to the user; a scan without a date is not an audit. */
  scannedAt: string;
  /** The exact prompts sent. Surfaced in the UI; this is what makes it auditable. */
  questions: string[];
  providers: ProviderResult[];
  /** questions.length × providers that answered. */
  totalAnswers: number;
  mentions: number;
  /** Share of voice, 0–100. The headline number. */
  sovPct: number;
  /** Mean rank across the answers that named the brand. `null` if never named. */
  avgPosition: number | null;
}

// ---------------------------------------------------------------------------
// Phase 2 — unlocked by the email gate
// ---------------------------------------------------------------------------

export interface Competitor {
  name: string;
  /** Mentions across every answer in the run. */
  mentions: number;
  /** Which models named them. Two models agreeing is a stronger signal than one. */
  providers: MemoryProvider[];
}

export interface RetrievalResult {
  provider: RetrievalProvider;
  status: 'cited' | 'partial' | 'absent' | 'unavailable';
  detail: string;
  /** Sources the grounded answer cited, when the provider returns them. */
  citations?: string[];
}

export interface TechSignal {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'warn';
  /** Points available, and points actually earned. Every score traces here. */
  weight: number;
  earned: number;
  note?: string;
}

export interface ActionItem {
  title: string;
  detail: string;
  /** 1–4, rendered as filled dots. */
  impact: 1 | 2 | 3 | 4;
  priority: 'high' | 'medium' | 'low';
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

/**
 * One earlier run of the same brand, in the same market.
 *
 * Working scan data is pruned after fourteen days; these rows are not. They are
 * small on purpose — the headline numbers and nothing else — so that keeping
 * them forever costs nothing and a brand accumulates a trend rather than a pile
 * of snapshots. A scan tells you where you stand; only the series tells you
 * whether anything you did worked.
 */
export interface HistoryPoint {
  /** ISO date, `YYYY-MM-DD`. Chart axis and dedupe key. */
  date: string;
  sovPct: number;
  avgPosition: number | null;
  grade?: Grade;
}

/** Unlocked by the email gate. */
export interface ScanPhase2 {
  competitors: Competitor[];
  retrieval: RetrievalResult[];
  signals: TechSignal[];
  /** 0–100, summed from the signals above. */
  techScore: number;
  /** 0–100, from grounded retrieval. −1 when no SERP provider is configured. */
  serpScore: number;
  grade: Grade;
  keyInsight: string;
  actions: ActionItem[];
  /** Every run of this brand in this market, oldest first, including the one
      just finished. A single-point series is the normal first-scan case and the
      chart says so rather than drawing a line through one dot. */
  history: HistoryPoint[];
}

// ---------------------------------------------------------------------------
// The job
// ---------------------------------------------------------------------------

export type StepState = 'queued' | 'running' | 'done' | 'failed' | 'skipped' | 'locked';

export interface StepStatus {
  id: string;
  label: string;
  phase: 1 | 2;
  state: StepState;
  /** Right-hand readout: "15 asked", "asking…", "no key configured". */
  detail?: string;
}

export type ScanStatus =
  /** Phase 1 is working through its steps. */
  | 'running'
  /** Phase 1 is done and the email gate is up. */
  | 'awaiting-email'
  /** Email given; phase 2 is working through its steps. */
  | 'unlocking'
  /** Everything that was going to run has run. */
  | 'complete'
  | 'failed';

export interface ScanSession {
  scanId: string;
  status: ScanStatus;
  steps: StepStatus[];
  /** True while the backend is returning sample data — drives the demo banner.
      Never inferred on the client: the server is the only thing that knows
      whether a key was actually used. */
  demo: boolean;
  phase1?: ScanPhase1;
  phase2?: ScanPhase2;
  /** Set on `failed`, and shown verbatim. */
  error?: string;
}

export interface ScanInput {
  brand: string;
  domain: string;
  industry: string;
  /** A `Market` id from `./markets.ts` — the language asked in and the country
      asked from. Separate markets are separate measurements, and separate
      history series, because they are separate answers. */
  market: string;
  /**
   * The prompts to send, written by the visitor.
   *
   * Every question is put to every model, so the cost of a scan is
   * `questions × models` calls — which is why the ceiling below is a ceiling
   * and not a suggestion.
   *
   * A caveat worth keeping in view: because these are the visitor's own words
   * rather than a fixed set, two brands' scores are not comparable with each
   * other, and neither are two runs of the same brand once the wording changes.
   * The audit trail prints what was actually asked, so the number is always
   * traceable — it is just no longer a benchmark.
   */
  questions: string[];
}

/** Ceiling on the prompt list. Fifteen questions × three models = 45 calls. */
export const MAX_QUESTIONS = 15;

/** The shape of the steps before the server has said anything about them.
    Used only for the very first paint of the progress screen. */
export const SCAN_STEPS: readonly Omit<StepStatus, 'state'>[] = [
  { id: 'chatgpt', label: 'ChatGPT', phase: 1 },
  { id: 'claude', label: 'Claude', phase: 1 },
  { id: 'gemini', label: 'Gemini', phase: 1 },
  { id: 'perplexity', label: 'Perplexity', phase: 2 },
  { id: 'ai-overview', label: 'Google AI Overview', phase: 2 },
  { id: 'technical', label: 'Website & technical signals', phase: 2 },
];

export const INDUSTRIES = [
  'Fintech & payments',
  'Health tech & recovery',
  'Enterprise software / SaaS',
  'Professional services',
  'Legal tech',
  'Logistics & supply chain',
  'E-commerce & retail',
  'Marketing & advertising',
] as const;

export function gradeFor(score: number): Grade {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}

/** Normalises whatever the user pastes into a bare hostname. */
export function cleanDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/[/?#].*$/, '')
    .toLowerCase();
}

export function isDomain(value: string): boolean {
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(value);
}
