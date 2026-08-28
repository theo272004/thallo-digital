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
  /* Claude was the only one of the three wearing the fallback glyph — a globe,
     which in a row of three named assistants reads as a provider we could not
     identify rather than as a missing file. */
  claude: 'claude.svg',
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
  /**
   * The model the API said actually answered, when it is not the one we asked
   * for. Absent in the normal case, including when an alias resolves to its own
   * dated snapshot — that is the id doing its job.
   *
   * Present, it means the call was served from somewhere else, and the audit
   * trail says so rather than printing the requested id over numbers another
   * model produced. A reproducible method is the whole claim of this report;
   * an unverified model id is the quietest way to lose it.
   */
  modelUsed?: string;
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

/**
 * What one model said when asked, by name, what this company is.
 *
 * ## Why this exists
 *
 * Nearly every brand that runs this scan comes back at 0% share of answer, and
 * a zero tells its story exactly once. It confirms absence and gives the reader
 * nothing to do — worse, it flattens three completely different situations into
 * one number: the model has never heard of you, the model knows you and cannot
 * say who you are for, and the model resolves your name to somebody else's
 * company. The last of those is not absence at all. It is a buyer asking about
 * you by name and being handed a different business, and it is both the most
 * damaging of the three and the most fixable.
 *
 * This is the one question in the whole scan that names the brand, which every
 * other question here is forbidden from doing. The rule it breaks exists to
 * stop a model agreeing with a premise we handed it — that is about *ranking*.
 * This is not a ranking question: it asks the model to identify an entity, and
 * every part of the answer is checked against something we already hold rather
 * than taken at its word.
 */
export type EntityVerdict =
  /** Knows what you do and who you do it for. */
  | 'resolved'
  /** Knows the company; cannot state a buyer, or volunteered doubt. */
  | 'partial'
  /** Named a website that is not yours — it is describing a different company. */
  | 'mismatch'
  /** Said plainly that it does not recognise the name. The honest zero. */
  | 'unknown'
  /** The call failed. A fault at our end, never a finding about the brand. */
  | 'unavailable';

export interface EntityCheck {
  provider: MemoryProvider;
  /** The model id asked, printed so the row is reproducible. */
  model: string;
  verdict: EntityVerdict;
  /** What the model said the company does, in its own words. */
  what: string;
  /** Who it said the company serves. Empty is itself the finding on `partial`. */
  serves: string;
  /** The site the model believes owns this name. Only set on `mismatch`, where
      it is the evidence for the accusation and has to be visible. */
  claimedDomain?: string;
  /** Set on `unavailable`, and shown small and grey — it is what makes the
      failure fixable, not a statement about the brand. */
  error?: string;
}

/**
 * One website the searching models opened before answering, and who was named
 * in the answers that opened it.
 *
 * ## Why this is the most useful panel in the report
 *
 * Every other figure here tells somebody where they stand. This one tells them
 * where the ground is. When a model searches before it answers, the pages it
 * read are the shortest available description of what earns a recommendation in
 * that category — and unlike a percentage, every row names something a person
 * can go and do: get into that roundup, get reviewed on that directory, get
 * quoted in that trade publication.
 *
 * It is also the only part of this report a reader could not reconstruct on
 * their own in an afternoon, which is the honest test of whether a free report
 * was worth their email address.
 */
export interface AnswerSource {
  /** Bare host — `g2.com`, `reddit.com`. */
  host: string;
  /** How many answers opened it, de-duplicated within each answer. */
  times: number;
  /** The brand's own domain. Kept and flagged rather than dropped: "every
      source that mentioned you was your own website" is one of the strongest
      findings this report produces, and dropping the row would delete it. */
  own: boolean;
  /** Whether the brand itself was named in the answers that cited this host. */
  brand: boolean;
  /** Companies named in those same answers, most-named first. Not the run's
      leaders — crediting from the whole run would put every leader against
      every source and turn a finding into a matrix of ticks. */
  names: string[];
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
  /** The direct question, one row per model. Absent when the check did not run
      — a missing panel is honest, a panel reading "not measured" implies we
      tried. */
  entity?: EntityCheck[];
  /** The sentence under that panel, counted from the rows on the server so it
      cannot disagree with them. */
  entityReading?: string;
  /** The pages the searching models opened. Absent when the searching reading
      did not run, or ran and cited nothing readable. */
  sources?: AnswerSource[];
  actions: ActionItem[];
  /** The same three models over the same questions, with web search on.
   *
   *  Phase 1 measures whether a model knows you; this measures whether it picks
   *  you once it has looked, and the two come apart. Absent when the reading is
   *  switched off for the installation — a missing section is honest, whereas a
   *  section reading "not measured" would imply we tried.
   *
   *  Deliberately not folded into `grade`: it is a comparison against phase 1,
   *  not a fourth component, and averaging it in would weight share of voice
   *  twice for a reason the reader could not see. */
  grounded?: ScanPhase1;
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
  /** What is left of the free allowance after this scan. Returned on every
      response so the report can print "scan 2 of 3" without a second call. */
  quota?: ScanQuota;
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
  /**
   * Collected on the setup screen, before anything is run.
   *
   * With web search on, a scan costs real money on the first call rather than
   * on the second half, so the address is asked for up front and the whole
   * report is one job: no free half, no gate in the middle, and nothing spent
   * on somebody we cannot reply to. Omitted, the server falls back to the
   * two-step flow, which is what a cached bundle from before this change
   * still sends.
   */
  email?: string;
}

/**
 * The same scan, pointed at somebody else.
 *
 * A report ends with a leaderboard of the companies being recommended instead
 * of the reader, and the obvious next question — *how do they score?* — used to
 * mean going back to an empty form and retyping three questions from memory,
 * which is enough friction that almost nobody did it. This is the setup screen
 * seeded from the report that produced it.
 *
 * Everything except the company carries over, and that is the point rather than
 * a convenience: two reports are only comparable if the questions, the category
 * and the market are identical. The fields are all still editable — a visitor
 * may well want to change the category once they see whose report it is — but
 * the default is the comparison rather than a fresh unrelated scan.
 *
 * `domain` is the one field that usually arrives empty. See `ScanSetup`: we
 * will not guess a website from a company name, because the brand match keys on
 * the domain root and a wrong guess reports a competitor as absent from answers
 * that named them.
 */
export interface Rematch {
  brand: string;
  domain: string;
  industry: string;
  market: string;
  questions: string[];
  email: string;
}

/**
 * Ceiling on the prompt list, and the free tier's whole shape.
 *
 * Three questions × three models, asked twice — once from memory, once with
 * search — is eighteen calls, and every call on the searching half carries a
 * per-call fee of roughly a cent whatever model answers it. So this ceiling is
 * a bill rather than a nicety: at three it is about 13 US cents a scan, at five
 * about 21.
 *
 * Three is enough for what a free scan has to prove — whether the models name
 * you at all, and whether searching changes the answer. It is not enough to be
 * a measurement anybody should act on, and that is the honest line between this
 * and a paid tier, which is where a longer list belongs.
 */
export const MAX_QUESTIONS = 3;

/** The shape of the steps before the server has said anything about them.
    Used only for the very first paint of the progress screen. */
export const SCAN_STEPS: readonly Omit<StepStatus, 'state'>[] = [
  { id: 'chatgpt', label: 'ChatGPT', phase: 1 },
  { id: 'claude', label: 'Claude', phase: 1 },
  { id: 'gemini', label: 'Gemini', phase: 1 },
  { id: 'perplexity', label: 'Perplexity', phase: 2 },
  { id: 'ai-overview', label: 'Google AI Overview', phase: 2 },
];

/**
 * Suggestions for the category field — not the set of allowed answers.
 *
 * The setup screen offers these under a free-text input and accepts anything
 * else typed over them, because the backend always did: `industry_label()`
 * passes an unrecognised label through untouched, and only the entries below
 * have translations. A closed dropdown made a business pick the nearest wrong
 * box, and that box is what phase 2 then searches Google for.
 *
 * **These are the five industries Thallo sells to**, in the order the site
 * lists them, plus the two adjacent categories that come up often enough to be
 * worth a suggestion. They used to be a general catalogue — "e-commerce &
 * retail", "marketing & advertising" — with a placeholder reading "pizzerias,
 * legal tech, wedding photography". Two of those three will never pay for a
 * retainer that starts at $2,500 a month, and this field is what decides which
 * leads come through the door: whatever is printed here is what most people
 * type, so printing the wrong examples is not a copy problem, it is a
 * targeting one.
 */
export const INDUSTRIES = [
  'Fintech',
  'Health tech',
  'Legal tech',
  'Specialized software',
  'Professional services',
  'Insurance & claims',
  'Enterprise software / SaaS',
] as const;

// ---------------------------------------------------------------------------
// The address the report is sent to
// ---------------------------------------------------------------------------

/**
 * Mailbox providers that are not a company.
 *
 * A scan costs real money on the first call and the report is a sales
 * conversation with whoever reads it, so the address is the qualification: an
 * engagement that starts at $2,500 a month is approved by somebody with a
 * company domain in their signature. This is a hard gate rather than a warning
 * — see `isWorkEmail` — and the list is deliberately short. It catches the
 * consumer mailboxes and the throwaway ones, and nothing else: a rule broad
 * enough to catch every free provider on earth would also start rejecting small
 * hosts that real companies use.
 *
 * Kept in sync with `Thallo_Vis_REST::FREE_MAIL_DOMAINS`, which is the copy that
 * actually enforces it — this one only exists to say so before the button is
 * pressed instead of after.
 */
export const FREE_EMAIL_DOMAINS: readonly string[] = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'outlook.es',
  'hotmail.com',
  'hotmail.es',
  'hotmail.co.uk',
  'live.com',
  'live.com.mx',
  'msn.com',
  'yahoo.com',
  'yahoo.es',
  'yahoo.com.mx',
  'yahoo.com.br',
  'ymail.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'gmx.com',
  'gmx.net',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'yandex.ru',
  'protonmail.com',
  'proton.me',
  'pm.me',
  'tutanota.com',
  'mail.ru',
  'inbox.ru',
  'bol.com.br',
  'uol.com.br',
  'terra.com.br',
  'hotmail.com.br',
  'yahoo.com.ar',
  'hotmail.com.ar',
  // Disposable — these exist to be thrown away, which is the opposite of a lead.
  'mailinator.com',
  'guerrillamail.com',
  'yopmail.com',
  '10minutemail.com',
  'temp-mail.org',
  'trashmail.com',
  'sharklasers.com',
  'dispostable.com',
  'getnada.com',
  'maildrop.cc',
];

/** The domain part of an address, lowercased. Empty when there is not one. */
export function emailDomain(value: string): string {
  const at = value.trim().toLowerCase().lastIndexOf('@');
  return at === -1 ? '' : value.trim().toLowerCase().slice(at + 1);
}

/** True when the address is on a company domain rather than a mailbox provider. */
export function isWorkEmail(value: string): boolean {
  const domain = emailDomain(value);
  return domain !== '' && !FREE_EMAIL_DOMAINS.includes(domain);
}

// ---------------------------------------------------------------------------
// The free allowance
// ---------------------------------------------------------------------------

/**
 * How many free scans are left, and why — counted on the server, printed on the
 * setup screen before anything is spent.
 *
 * The count is not one number. A cookie alone is cleared in ten seconds, so
 * four things are counted together and the tightest of them wins: the browser
 * session, the address, the network, and the domain being scanned. Only
 * `remaining` and `limit` are rendered as "Scan 1 of 3"; `reason` is what the
 * message says when the allowance is gone, and it is written as an invitation
 * rather than as a technical refusal, because a visitor who has run three scans
 * is the most interested person to reach this page all week.
 */
export interface ScanQuota {
  /** Free scans still available to this visitor. Never negative. */
  remaining: number;
  /** The headline allowance — what the "1 of 3" counter counts against. */
  limit: number;
  /** Which of the four layers is binding: session, email, ip, domain, or site. */
  limitedBy?: 'session' | 'email' | 'ip' | 'domain' | 'site';
  /** Shown when `remaining` is 0. Prose for a person, never an error code. */
  reason?: string;
}

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
