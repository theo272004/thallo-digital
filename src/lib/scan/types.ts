/**
 * The data contract between the scan UI and the backend.
 *
 * Everything the UI renders comes from these shapes, so wiring the real
 * WordPress endpoints later means implementing `runPhase1` / `runPhase2` in
 * `engine.ts` against them — no component changes.
 *
 * The split mirrors the cost model: phase 1 is free and always runs, phase 2
 * costs money and only runs once we have an email.
 */

/** Models queried from memory — no web search. "Do you know this brand?" */
export type MemoryProvider = 'chatgpt' | 'claude' | 'gemini';

/** Grounded sources — live retrieval. "Is this brand findable right now?" */
export type RetrievalProvider = 'perplexity' | 'ai-overview';

export const MEMORY_PROVIDERS: readonly MemoryProvider[] = ['chatgpt', 'claude', 'gemini'];

export const PROVIDER_LABEL: Record<MemoryProvider | RetrievalProvider, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  'ai-overview': 'Google AI Overview',
};

export interface ProviderResult {
  provider: MemoryProvider;
  /** Exact model id — printed in the audit trail so the run is reproducible. */
  model: string;
  /** How many of the questions returned an answer naming the brand. */
  mentions: number;
  /** Rank the brand held in each answer that named it (1 = listed first). */
  positions: number[];
}

export interface Competitor {
  name: string;
  /** Mentions across every answer in the run. */
  mentions: number;
}

export interface RetrievalResult {
  provider: RetrievalProvider;
  status: 'cited' | 'partial' | 'absent';
  detail: string;
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

/** Free tier. Enough to prove the problem, not enough to solve it. */
export interface ScanPhase1 {
  scanId: string;
  brand: string;
  domain: string;
  industry: string;
  /** ISO timestamp — shown to the user; a scan without a date is not an audit. */
  scannedAt: string;
  /** The exact prompts sent. Surfaced in the UI; this is what makes it auditable. */
  questions: string[];
  providers: ProviderResult[];
  /** questions.length × providers.length */
  totalAnswers: number;
  mentions: number;
  /** Share of voice, 0–100. The headline number. */
  sovPct: number;
}

/** Unlocked by the email gate. */
export interface ScanPhase2 {
  competitors: Competitor[];
  retrieval: RetrievalResult[];
  signals: TechSignal[];
  techScore: number;
  serpScore: number;
  grade: Grade;
  keyInsight: string;
  actions: ActionItem[];
}

export interface ScanResult extends ScanPhase1 {
  phase2?: ScanPhase2;
}

export interface ScanInput {
  brand: string;
  domain: string;
  industry: string;
}

/** Progress rows in the scanning screen — one per unit of real work. */
export interface ScanStep {
  id: string;
  label: string;
  /** Phase 2 steps render locked until the email is given. */
  phase: 1 | 2;
}

export const SCAN_STEPS: readonly ScanStep[] = [
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
] as const;

export function gradeFor(score: number): Grade {
  if (score >= 80) return 'A';
  if (score >= 65) return 'B';
  if (score >= 50) return 'C';
  if (score >= 30) return 'D';
  return 'F';
}
