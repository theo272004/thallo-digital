/**
 * Sample data, used only when no backend is configured.
 *
 * It exists so the interface can be built, reviewed and demonstrated before a
 * single API key is in place — and so a broken deployment degrades to something
 * legible rather than a spinner that never resolves.
 *
 * Whenever this runs, `ScanSession.demo` is true and the UI shows a banner
 * saying so. Numbers a visitor cannot distinguish from a real measurement are
 * the one thing this tool must never ship; that was the flaw in the widget it
 * replaces, which invented a score from a hash of the brand name and presented
 * it as a reading.
 */

import { buildQuestions } from './questions';
import {
  MEMORY_PROVIDERS,
  gradeFor,
  type Answer,
  type ProviderResult,
  type ScanInput,
  type ScanPhase1,
  type ScanPhase2,
  type TechSignal,
} from './types';

/** Stable pseudo-random from a seed, so the same brand always demos the same. */
function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}

const RIVALS = ['Northwind', 'Sable & Co', 'Lumen Group', 'Vertex Partners', 'Arbor Systems', 'Kestrel Labs'];

const MODEL_IDS: Record<string, string> = {
  chatgpt: 'openai/gpt-4o-mini (sample)',
  claude: 'anthropic/claude-haiku-4.5 (sample)',
  gemini: 'google/gemini-2.0-flash (sample)',
};

export function demoPhase1(input: ScanInput): ScanPhase1 {
  const rand = seeded(input.brand + input.domain);
  const questions = buildQuestions(input.industry, input.market);

  const providers: ProviderResult[] = MEMORY_PROVIDERS.map((provider) => {
    const rate = rand() * 0.5;
    const answers: Answer[] = questions.map((_, q) => {
      const mentioned = rand() < rate;
      const position = mentioned ? 1 + Math.floor(rand() * 6) : null;
      const names = RIVALS.slice(0, 3 + Math.floor(rand() * 3));
      return {
        q,
        mentioned,
        position,
        names: mentioned ? [...names.slice(0, position ?? 1), input.brand, ...names.slice(position ?? 1)] : names,
      };
    });
    const hits = answers.filter((a) => a.mentioned);
    return {
      provider,
      model: MODEL_IDS[provider],
      mentions: hits.length,
      positions: hits.map((a) => a.position as number),
      answers,
    };
  });

  const totalAnswers = questions.length * providers.length;
  const mentions = providers.reduce((sum, p) => sum + p.mentions, 0);
  const allPositions = providers.flatMap((p) => p.positions);

  return {
    scanId: `demo-${Math.abs(Math.round(rand() * 1e9))}`,
    brand: input.brand,
    domain: input.domain,
    industry: input.industry,
    market: input.market,
    scannedAt: new Date().toISOString(),
    questions,
    providers,
    totalAnswers,
    mentions,
    sovPct: Math.round((mentions / totalAnswers) * 100),
    avgPosition: allPositions.length
      ? Math.round((allPositions.reduce((a, b) => a + b, 0) / allPositions.length) * 10) / 10
      : null,
  };
}

/**
 * Each failed signal maps to the action that fixes it. Titles are written as
 * instructions — a signal label describes the healthy state, which reads
 * backwards once it is the thing that failed. The plugin holds the same table;
 * this copy only ever renders behind the demo banner.
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

export function demoPhase2(phase1: ScanPhase1): ScanPhase2 {
  const rand = seeded(phase1.brand + phase1.domain + 'p2');

  const top = Math.min(phase1.totalAnswers, Math.max(phase1.mentions + 2, 9 + Math.floor(rand() * 5)));

  /* Sorted, because the real backend sorts and an unsorted demo reads as a
     rendering bug rather than as sample data. */
  const competitors = RIVALS.slice(0, 5)
    .map((name, i) => ({
      name,
      mentions: Math.max(1, top - i * (1 + Math.floor(rand() * 2))),
      providers: MEMORY_PROVIDERS.filter(() => rand() > 0.3),
    }))
    .sort((a, b) => b.mentions - a.mentions);

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
    { id: 'about', label: 'About page with named people', status: rand() > 0.5 ? 'pass' : 'warn', weight: 10 },
    { id: 'blog', label: 'Content published in the last 6 months', status: rand() > 0.45 ? 'pass' : 'fail', weight: 10 },
    { id: 'faq', label: 'Structured FAQ schema', status: rand() > 0.6 ? 'pass' : 'fail', weight: 10 },
    { id: 'citations', label: 'Cited on third-party authority sites', status: rand() > 0.55 ? 'pass' : 'fail', weight: 25 },
    {
      id: 'llms-txt',
      label: 'llms.txt file',
      status: 'warn',
      weight: 0,
      note: 'Not scored. No major AI system is known to read it, so its absence costs nothing.',
    },
  ];

  const signals: TechSignal[] = checks.map((s) => ({
    ...s,
    earned: s.status === 'pass' ? s.weight : s.status === 'warn' ? Math.round(s.weight / 2) : 0,
  }));

  const techScore = signals.reduce((sum, s) => sum + s.earned, 0);
  /* −1 renders as a dash. Nothing was retrieved, so there is no reading to
     give — and the grade below averages only the parts that were measured. */
  const serpScore = -1;
  const combined = Math.round((phase1.sovPct + techScore) / 2);

  /* A sample series, so the trend chart can be shown before any brand has a
     real second run. It is invented in exactly the way every other number on
     this screen is invented, and it is only ever reachable with `demo: true`
     set and the banner up. It walks backwards from the demo's own share of
     voice rather than to some flattering shape — a demo that always goes up and
     to the right is a sales mock, not sample data. */
  const history = Array.from({ length: 5 }, (_, i) => {
    const weeksAgo = 4 - i;
    const date = new Date();
    date.setDate(date.getDate() - weeksAgo * 7);
    const drift = Math.round((rand() - 0.45) * 14);
    return {
      date: date.toISOString().slice(0, 10),
      sovPct: weeksAgo === 0 ? phase1.sovPct : Math.max(0, Math.min(100, phase1.sovPct - drift * weeksAgo)),
      avgPosition: phase1.avgPosition,
    };
  });

  const gaps = [...signals].filter((s) => s.weight > 0 && s.status !== 'pass').sort((a, b) => b.weight - a.weight);
  const remedyFor = (i: number) => (gaps[i] ? REMEDY[gaps[i].id] ?? REMEDY.default : null);
  const named = phase1.providers.filter((p) => p.mentions > 0);
  const absent = phase1.providers.filter((p) => p.mentions === 0);

  return {
    history,
    competitors,
    /* Reported as unavailable rather than as a status, because that is the
       truth of it: with no backend there is nothing to retrieve from. Showing
       "Absent" here would be a finding about the visitor's brand that nothing
       was measured to support. */
    retrieval: [
      {
        provider: 'perplexity',
        status: 'unavailable',
        detail: 'Sample data — no Perplexity key is connected, so live retrieval was not run.',
      },
      {
        provider: 'ai-overview',
        status: 'unavailable',
        detail: 'Sample data — no search-results provider is connected, so the AI Overview was not read.',
      },
    ],
    signals,
    techScore,
    serpScore,
    grade: gradeFor(combined),
    keyInsight:
      absent.length === 0
        ? `${phase1.brand} is named by every model tested, but rarely in first position. The gap is ranking, not recognition.`
        : named.length === 0
          ? `No model tested named ${phase1.brand} in any of the ${phase1.totalAnswers} answers. The brand is not an established entity in this category — that is a content and citation problem, not a website problem.`
          : `${phase1.brand} is recognised by some models but absent from others. Uneven coverage usually means citations exist but are concentrated in too few sources.`,
    actions: [
      { ...(remedyFor(0) ?? REMEDY.default), impact: 4, priority: 'high' },
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
