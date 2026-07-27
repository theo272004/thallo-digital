/**
 * Scan engine — the single seam between the UI and the backend.
 *
 * Today it returns demo data so the flow can be designed and reviewed before
 * any API key exists. To go live, set MODE to 'live' and implement the two
 * fetch calls below against the WordPress endpoints. Nothing else changes.
 *
 * IMPORTANT: while MODE is 'demo' the UI shows a visible demo banner. Numbers
 * a visitor cannot distinguish from a real audit are the one thing this tool
 * must never ship — that was the flaw in the widget this replaces.
 */

import {
  MEMORY_PROVIDERS,
  gradeFor,
  type ScanInput,
  type ScanPhase1,
  type ScanPhase2,
  type ProviderResult,
  type TechSignal,
} from './types';

export const MODE: 'demo' | 'live' = 'demo';

/** Set when the WordPress plugin is deployed, e.g. https://cms.thallodigital.com */
const API_BASE = '';

const QUESTIONS_PER_PROVIDER = 5;

/** The prompt set. Real runs substitute {industry} and send these verbatim. */
export function buildQuestions(industry: string): string[] {
  return [
    `What are the best ${industry} companies right now?`,
    `Which ${industry} vendors would you recommend to a mid-market B2B buyer?`,
    `Who are the most trusted providers in ${industry}?`,
    `I need to shortlist ${industry} partners. Who should I be looking at?`,
    `Which ${industry} companies have the strongest reputation with enterprise clients?`,
  ];
}

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------

/** Stable pseudo-random from the brand name, so a demo run is reproducible. */
function seeded(brand: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < brand.length; i++) {
    h ^= brand.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

const DEMO_COMPETITORS = ['Northwind', 'Sable & Co', 'Lumen Group', 'Vertex Partners', 'Arbor Systems'];

/**
 * Each failed signal maps to the action that fixes it. Titles are written as
 * instructions — a signal label describes the healthy state, which reads
 * backwards once it is the thing that failed.
 */
const REMEDY: Record<string, { title: string; detail: string }> = {
  'ai-crawlers': {
    title: 'Unblock the AI crawlers in robots.txt',
    detail:
      'Your robots.txt is blocking the crawlers these models use to read the web. Nothing else on this list matters until it is unblocked.',
  },
  schema: {
    title: 'Add Organization schema markup',
    detail:
      'Structured data lets models resolve who you are, what you sell and where, instead of inferring it from prose.',
  },
  about: {
    title: 'Put named, credentialed humans on the About page',
    detail: 'Anonymous companies are hard for a model to vouch for. Real names with real credentials are the fix.',
  },
  blog: {
    title: 'Publish on the questions buyers actually ask',
    detail: 'A site with nothing recent gives retrieval nothing current to pull, however good the older pages are.',
  },
  faq: {
    title: 'Mark up your FAQ with structured data',
    detail: 'Marked-up answers can be lifted into a response directly rather than paraphrased away or skipped.',
  },
  citations: {
    title: 'Earn citations on third-party authority sites',
    detail:
      'Get named in the roundups and category listicles these models retrieve. This is the highest-leverage signal on the list.',
  },
  default: {
    title: 'Deepen category coverage',
    detail:
      'Publish the comparison and category pages buyers ask about, structured so a model can quote them directly.',
  },
};

const MODEL_IDS: Record<string, string> = {
  chatgpt: 'gpt-4o-mini',
  claude: 'claude-haiku-4-5',
  gemini: 'gemini-2.0-flash',
};

function demoPhase1(input: ScanInput): ScanPhase1 {
  const rand = seeded(input.brand);
  const questions = buildQuestions(input.industry);

  const providers: ProviderResult[] = MEMORY_PROVIDERS.map((provider) => {
    const mentions = Math.floor(rand() * (QUESTIONS_PER_PROVIDER + 1));
    return {
      provider,
      model: MODEL_IDS[provider],
      mentions,
      positions: Array.from({ length: mentions }, () => 1 + Math.floor(rand() * 6)),
    };
  });

  const totalAnswers = questions.length * providers.length;
  const mentions = providers.reduce((sum, p) => sum + p.mentions, 0);

  return {
    scanId: crypto.randomUUID(),
    brand: input.brand,
    domain: input.domain,
    industry: input.industry,
    scannedAt: new Date().toISOString(),
    questions,
    providers,
    totalAnswers,
    mentions,
    sovPct: Math.round((mentions / totalAnswers) * 100),
  };
}

function demoPhase2(phase1: ScanPhase1): ScanPhase2 {
  const rand = seeded(phase1.brand + phase1.domain);

  // Spread competitors across a plausible range and step them down, so the
  // list reads like a real ranking rather than four identical bars.
  const top = Math.min(phase1.totalAnswers, Math.max(phase1.mentions + 2, 9 + Math.floor(rand() * 5)));
  const competitors = DEMO_COMPETITORS.slice(0, 4).map((name, i) => ({
    name,
    mentions: Math.max(1, top - i * (1 + Math.floor(rand() * 2))),
  }));

  const checks: Omit<TechSignal, 'earned'>[] = [
    {
      id: 'ai-crawlers',
      label: 'AI crawlers allowed in robots.txt',
      status: rand() > 0.4 ? 'pass' : 'fail',
      weight: 25,
      note: 'GPTBot, ClaudeBot, PerplexityBot, Google-Extended',
    },
    { id: 'https', label: 'HTTPS enabled', status: 'pass', weight: 5 },
    { id: 'schema', label: 'Organization schema markup', status: rand() > 0.5 ? 'pass' : 'fail', weight: 15 },
    { id: 'about', label: 'About page with named authors', status: rand() > 0.5 ? 'pass' : 'warn', weight: 10 },
    { id: 'blog', label: 'Blog updated in the last 6 months', status: rand() > 0.45 ? 'pass' : 'fail', weight: 10 },
    { id: 'faq', label: 'Structured FAQ schema', status: rand() > 0.6 ? 'pass' : 'fail', weight: 10 },
    { id: 'citations', label: 'Cited on third-party authority sites', status: rand() > 0.55 ? 'pass' : 'fail', weight: 25 },
    {
      id: 'llms-txt',
      label: 'llms.txt file',
      status: 'warn',
      weight: 0,
      note: 'Not scored. Google confirmed no AI system reads it, and an Ahrefs study of 137k domains found 97% are never requested.',
    },
  ];

  // A warn is worth half its weight; llms.txt carries weight 0 so it stays
  // visible in the report without moving the score either way.
  const signals: TechSignal[] = checks.map((s) => ({
    ...s,
    earned: s.status === 'pass' ? s.weight : s.status === 'warn' ? Math.round(s.weight / 2) : 0,
  }));

  const techScore = signals.reduce((sum, s) => sum + s.earned, 0);
  const serpScore = 20 + Math.floor(rand() * 60);
  const combined = Math.round((phase1.sovPct + techScore + serpScore) / 3);

  // Heaviest unmet signals first — the action list is ordered by what the
  // scan actually found, not by a fixed script.
  const gaps = [...signals].filter((s) => s.weight > 0 && s.status !== 'pass').sort((a, b) => b.weight - a.weight);
  const remedyFor = (i: number) => (gaps[i] ? REMEDY[gaps[i].id] ?? REMEDY.default : null);
  const mentionedIn = phase1.providers.filter((p) => p.mentions > 0).map((p) => p.provider);
  const absentIn = phase1.providers.filter((p) => p.mentions === 0).map((p) => p.provider);

  return {
    competitors,
    retrieval: [
      {
        provider: 'perplexity',
        status: rand() > 0.5 ? 'partial' : 'absent',
        detail: 'Measures whether your content is retrievable and citable today, not whether the model remembers you.',
      },
      {
        provider: 'ai-overview',
        status: rand() > 0.6 ? 'partial' : 'absent',
        detail: 'Presence in the AI Overview shown above Google results for your category.',
      },
    ],
    signals,
    techScore,
    serpScore,
    grade: gradeFor(combined),
    keyInsight:
      absentIn.length === 0
        ? `${phase1.brand} is named by every model tested, but rarely in first position. The gap is ranking, not recognition.`
        : mentionedIn.length === 0
          ? `No model tested named ${phase1.brand} in any of the ${phase1.totalAnswers} answers. The brand is not an established entity in this category — that is a content and citation problem, not a website problem.`
          : `${phase1.brand} is recognised by some models but absent from others. Uneven coverage usually means citations exist but are concentrated in too few sources.`,
    actions: [
      { ...(remedyFor(0) ?? REMEDY.default), impact: 4, priority: 'high' },
      // Falls back to whichever generic advice the first slot did not already use.
      {
        ...(remedyFor(1) ?? (gaps[0]?.id === 'citations' ? REMEDY.default : REMEDY.citations)),
        impact: 4,
        priority: 'high',
      },
      {
        title: 'Make the entity unambiguous',
        detail:
          'Consistent name, description and category across your site, Wikidata, LinkedIn and industry directories.',
        impact: 3,
        priority: 'medium',
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Public API — swap these two bodies to go live
// ---------------------------------------------------------------------------

const settle = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function runPhase1(input: ScanInput): Promise<ScanPhase1> {
  if (MODE === 'live') {
    const res = await fetch(`${API_BASE}/wp-json/thallo/v1/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error('scan_failed');
    return res.json();
  }
  await settle(2600);
  return demoPhase1(input);
}

export async function runPhase2(phase1: ScanPhase1, email: string): Promise<ScanPhase2> {
  if (MODE === 'live') {
    const res = await fetch(`${API_BASE}/wp-json/thallo/v1/scan/${phase1.scanId}/unlock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('unlock_failed');
    return res.json();
  }
  await settle(2200);
  return demoPhase2(phase1);
}
