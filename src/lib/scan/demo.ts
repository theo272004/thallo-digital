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
  type SourceHost,
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

/* Where a searching model plausibly went to find out. Sample, like everything
   else in this file, and here for one reason: "Sources found" is the section a
   reviewer most needs to see filled, and in preview mode there are no keys, so
   nothing real ever arrives to fill it. The banner above the report says the
   whole screen is sample data; a section that stays empty in the only mode
   anybody can review it in is a section nobody reviews. */
const SOURCES = [
  'reddit.com',
  'en.wikipedia.org',
  'linkedin.com',
  'forbes.com',
  'g2.com',
  'clutch.co',
  'trustpilot.com',
];

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
 * The plan's copy, for sample runs.
 *
 * It was keyed on technical signals — one remedy per failed check, robots.txt
 * through FAQ schema — and every one of those keys is now unreachable: the
 * technical crawl is gone and `signals` is empty, so nothing ever looked them
 * up. What is left is the three the live plan actually produces, keyed by what
 * the scan found rather than by which check failed.
 *
 * The plugin's `Thallo_Vis_Analysis::remedies()` is the authoritative copy;
 * this one only ever renders behind the demo banner.
 */
const REMEDY: Record<string, { title: string; detail: string }> = {
  sources: {
    title: 'Get named on the websites the models read for this category',
    detail:
      'The models opened a handful of pages before answering and you were not on any of them. This is the shortest route between the two figures at the top of the report.',
  },
  citations: {
    title: 'Earn citations on third-party authority sites',
    detail:
      'Get named in the roundups and category listicles these models retrieve. This is the highest-leverage signal there is.',
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
/**
 * The websites a searching answer was built from.
 *
 * Sample, like everything else in this file, and here for one reason: "Sources
 * found" is the section a reviewer most needs to see filled, and preview mode
 * has no keys, so nothing real ever arrives to fill it. The banner above the
 * report says the whole screen is sample data; a section that stays empty in
 * the only mode anybody can review it in is a section nobody reviews.
 *
 * Shaped exactly as `Thallo_Vis_Analysis::sources` returns it, down to the
 * ordering rule — most-read first, the brand's own domain last however often it
 * was opened — so what a reviewer approves here is what a real scan draws.
 */
function demoSources(phase1: ScanPhase1): SourceHost[] {
  const rand = seeded(phase1.brand + phase1.domain + 'sources');

  const rows: SourceHost[] = SOURCES.map((host, i) => {
    const times = 2 + Math.floor(rand() * 4);
    /* A source that names the brand is the exception rather than the rule, which
       is the finding this panel usually has to deliver. */
    const brand = rand() < 0.3;
    return {
      host,
      times,
      own: false,
      brand,
      names: RIVALS.slice(i % 3, (i % 3) + 2 + Math.floor(rand() * 2)),
    };
  })
    .filter(() => rand() < 0.8)
    .sort((a, b) => b.times - a.times || a.host.localeCompare(b.host));

  /* Read directly about half the time. Both cases are worth reviewing: the
     panel says something different when a model opened your site and still
     recommended somebody else. */
  if (rand() < 0.5) {
    rows.push({ host: phase1.domain, times: 1 + Math.floor(rand() * 3), own: true, brand: true, names: [] });
  }

  return rows.slice(0, 8);
}

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

  /* No technical signals, because the scan no longer runs a technical check.
     The crawl that graded robots.txt, schema, freshness and citations was
     dropped — a technical audit of a website is a different product from a
     report on what the models say — and the live backend ships `signals` as an
     empty array. This sample data went on inventing eight of them, which is
     the reason the empty panels in the report went unnoticed for so long:
     preview mode drew a full technical scorecard, and only a scan against the
     real API showed the section rendering as a 0 / 0 chip over nothing.

     Sample data whose shape differs from the live shape is worse than no
     sample data. It is the version every walkthrough is recorded against. */
  const signals: TechSignal[] = [];
  const techScore = 0;

  /* -1 renders as a dash. Nothing was retrieved, so there is no reading to
     give - and the grade below is taken from what was measured. */
  const serpScore = -1;

  /* The memory reading alone. It used to be averaged with `techScore`, which
     handed a demo brand half its grade for a website check that no longer
     happens; with the check gone that average would have quietly halved every
     sample grade instead. The backend grades on the readings, and so does
     this. */
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

  /* Built once, because the plan is now derived from it rather than from a
     technical checklist — the same order `Thallo_Vis_Analysis::actions()`
     works in: the sources the models actually opened, then the gap between
     the two readings, then the entity. */
  const sources = demoSources(phase1);
  const missing = sources.filter((h) => !h.own && !h.brand).map((h) => h.host);

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
    grounded: demoGrounded(phase1),
    sources,
    grade: gradeFor(combined),
    keyInsight:
      absent.length === 0
        ? `${phase1.brand} is named by every model tested, but rarely in first position. The gap is ranking, not recognition.`
        : named.length === 0
          ? `No model tested named ${phase1.brand} in any of the ${phase1.totalAnswers} answers. The brand is not an established entity in this category — that is a content and citation problem, not a website problem.`
          : `${phase1.brand} is recognised by some models but absent from others. Uneven coverage usually means citations exist but are concentrated in too few sources.`,
    /* These used to be remedies for failed technical checks — add Organization
       schema, mark up your FAQ — which was the wrong prescription on a report
       about what the models say, and is now impossible anyway: the checks are
       gone. They are built from the sources instead, which is both what the
       live backend does and the more useful answer, because it names actual
       websites rather than a category of work. */
    actions: [
      missing.length > 0
        ? {
            ...REMEDY.sources,
            detail: `These are the pages the models opened before answering, and you are not on any of them: ${missing
              .slice(0, 4)
              .join(', ')}. The models cannot recommend what the sources they read do not mention.`,
            impact: 4 as const,
            priority: 'high' as const,
          }
        : { ...REMEDY.citations, impact: 4 as const, priority: 'high' as const },
      { ...REMEDY.default, impact: 4 as const, priority: 'high' as const },
      {
        title: 'Make the entity unambiguous',
        detail:
          'Consistent name, description and category across your site, Wikidata, LinkedIn and industry directories.',
        impact: 3 as const,
        priority: 'medium' as const,
      },
    ],
  };
}
