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
  gemini: 'google/gemini-2.5-flash (sample)',
};

export function demoPhase1(input: ScanInput): ScanPhase1 {
  const rand = seeded(input.brand + input.domain);
  /* The visitor's own prompts, so the sample run's audit trail shows the
     questions they actually wrote. Falls back to the generated set only if the
     list arrives empty, which the setup screen does not allow. */
  const questions = input.questions.length
    ? input.questions
    : buildQuestions(input.industry, input.market);

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

/**
 * The same three models, asked again with the web open.
 *
 * Sample data needs this half for the same reason the real report leads with
 * it: the headline ring, the pair of figures beside it and the two columns in
 * the audit trail all come from here, and a preview without it shows a report
 * shaped like the one we stopped shipping. Built from the memory reading rather
 * than rolled fresh, so the comparison behaves like the real thing — searching
 * finds a brand more often than memory recalls it, which is the ordinary case
 * and the one the copy is written for.
 */
function demoGrounded(phase1: ScanPhase1): ScanPhase1 {
  const rand = seeded(phase1.brand + phase1.domain + 'web');
  /* Fewer questions asked twice, exactly as the plugin does: the search fee is
     per call, so the second reading is capped. The report prints both answer
     counts, and this is where a reviewer sees that they differ. */
  const asked = Math.max(1, phase1.questions.length - 1);

  const providers: ProviderResult[] = phase1.providers.map((p) => {
    const answers: Answer[] = phase1.questions.slice(0, asked).map((_, q) => {
      const memory = p.answers.find((a) => a.q === q);
      /* Named from memory stays named; the rest get a real chance, which is
         what makes the two columns worth putting side by side. */
      const mentioned = memory?.mentioned ? true : rand() < 0.45;
      const position = mentioned ? 1 + Math.floor(rand() * 5) : null;
      const names = RIVALS.slice(0, 3 + Math.floor(rand() * 3));
      return {
        q,
        mentioned,
        position,
        names: mentioned ? [...names.slice(0, position ?? 1), phase1.brand, ...names.slice(position ?? 1)] : names,
      };
    });
    const hits = answers.filter((a) => a.mentioned);
    return {
      provider: p.provider,
      model: `${p.model}:online`,
      mentions: hits.length,
      positions: hits.map((a) => a.position as number),
      answers,
    };
  });

  const totalAnswers = providers.reduce((sum, p) => sum + p.answers.length, 0);
  const mentions = providers.reduce((sum, p) => sum + p.mentions, 0);
  const allPositions = providers.flatMap((p) => p.positions);

  return {
    ...phase1,
    providers,
    totalAnswers,
    mentions,
    sovPct: totalAnswers ? Math.round((mentions / totalAnswers) * 100) : 0,
    avgPosition: allPositions.length
      ? Math.round((allPositions.reduce((a, b) => a + b, 0) / allPositions.length) * 10) / 10
      : null,
  };
}

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

  /* −1 renders as a dash. Nothing was retrieved, so there is no reading to
     give — and the grade below averages only the parts that were measured. */
  const serpScore = -1;
  /* The share of voice alone now. There used to be a technical score averaged
     in here; the scan no longer runs those checks — see the note in
     `FullReport` — so there is nothing else measured to average with. */
  const combined = phase1.sovPct;

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
    /* Empty, and kept in the payload rather than removed from the type: a
       cached bundle from before the technical panel was dropped still reads
       these, and an empty list is what every consumer already treats as "the
       step did not run". */
    signals: [],
    techScore: 0,
    serpScore,
    grounded: demoGrounded(phase1),
    grade: gradeFor(combined),
    /* Deliberately one of each, not three tidy passes. The panel exists because
       the three failure modes look nothing alike, and a preview that only shows
       the healthy one teaches whoever is reviewing this interface that the other
       two do not need designing for. Mirrors `Runner::demo_entity()`. */
    entity: [
      {
        provider: 'chatgpt',
        model: 'sample data',
        verdict: 'partial',
        what: `Sample data — a plausible description of what ${phase1.brand} does.`,
        serves: '',
      },
      {
        provider: 'claude',
        model: 'sample data',
        verdict: 'mismatch',
        what: 'Sample data — a company of the same name in another market.',
        serves: 'Sample data — the wrong buyer, because it is the wrong company.',
        claimedDomain: 'example-consultancy.com',
      },
      {
        provider: 'gemini',
        model: 'sample data',
        verdict: 'unknown',
        what: '',
        serves: '',
      },
    ],
    entityReading: `Sample data — 1 model out of 3 resolves the name ${phase1.brand} to a different company. A buyer who asks about you by name is being shown somebody else.`,
    /* The shape this panel takes in almost every real report: a handful of
       third-party sources carrying the competitors, and the brand's own website
       carrying the brand. Invented like everything else here, and it travels
       with `demo: true` and the banner. */
    sources: [
      { host: 'example-reviews.com', times: 6, own: false, brand: false, names: RIVALS.slice(0, 3) },
      { host: 'example-directory.com', times: 5, own: false, brand: false, names: RIVALS.slice(0, 2) },
      { host: 'example-tradepress.com', times: 4, own: false, brand: false, names: RIVALS.slice(1, 3) },
      { host: 'reddit.example', times: 3, own: false, brand: false, names: RIVALS.slice(0, 1) },
      { host: phase1.domain, times: 2, own: true, brand: true, names: [] },
    ],
    keyInsight:
      absent.length === 0
        ? `${phase1.brand} is named by every model tested, but rarely in first position. The gap is ranking, not recognition.`
        : named.length === 0
          ? `No model tested named ${phase1.brand} in any of the ${phase1.totalAnswers} answers. The brand is not an established entity in this category — that is a content and citation problem, not a website problem.`
          : `${phase1.brand} is recognised by some models but absent from others. Uneven coverage usually means citations exist but are concentrated in too few sources.`,
    /* Mirrors what the plugin now produces: the technical remedies are gone
       with the checks that generated them, so the plan is entirely about the
       answers. */
    actions: [
      { ...REMEDY.citations, impact: 4, priority: 'high' },
      {
        title: 'Make the entity unambiguous',
        detail:
          'Consistent name, description and category across your site, Wikidata, LinkedIn and industry directories.',
        impact: 3,
        priority: 'high',
      },
    ],
  };
}
