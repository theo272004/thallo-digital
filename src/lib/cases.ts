/**
 * The case study index — one source of truth for the landing at /results/ and
 * for the routes it links to at /results/[slug]/.
 *
 * Two kinds of entry live here, and the difference is deliberate. A `live` case
 * has a page of its own and every figure on it traces back to a platform
 * export. A `placeholder` has no page, no figures, and says so on the card: the
 * list is short because we only publish what a client has cleared, and pretending
 * otherwise would undo the one thing a case study is for.
 */

export type CaseStatus = 'live' | 'placeholder';

export type CaseStudy = {
  /** URL segment under /results/. Only `live` cases have a page. */
  slug: string;
  /** Matches the sector names used on /industries/, so the two pages agree. */
  industry: string;
  /** The result in words — what changed, not how much. */
  headline: string;
  /** The result in figures. Placeholders carry a status here, never a number. */
  metric: string;
  /** How long the period covered by the case ran. */
  timeframe: string;
  blurb: string;
  status: CaseStatus;
};

export const CASES: CaseStudy[] = [
  {
    slug: 'va-disability-claims',
    industry: 'Health & recovery',
    headline: 'From page two to page one',
    // Search Console, January–July 2026. The same figure the case study leads on.
    metric: '3.3x organic clicks',
    timeframe: 'Six months',
    blurb:
      'A veteran-founded service in the VA disability claims space — compliance-heavy, crowded at the top, and an audience sceptical by default. Authority was the only way in.',
    status: 'live',
  },

  /* ── Upcoming ──────────────────────────────────────────────────────────────
     Two, so the published case and the two in preparation fill one row of
     three rather than spilling a lone card onto a second row. No slug here
     resolves to a page and no figure is invented: the copy describes the
     publishing rule rather than a result, so nothing can be mistaken for a
     claim about work already done. ──────────────────────────────────────── */
  {
    slug: 'fintech-authority',
    industry: 'Fintech',
    headline: 'Case study in preparation',
    metric: 'Figures not yet published',
    timeframe: 'In preparation',
    blurb:
      'Work in this category is being written up. Figures go public once a full period of data is in and the client has cleared every number.',
    status: 'placeholder',
  },
  {
    slug: 'health-tech-authority',
    industry: 'Health tech',
    headline: 'Case study in preparation',
    metric: 'Figures not yet published',
    timeframe: 'In preparation',
    blurb:
      'A clinical category where a claim has to survive scrutiny. We will publish the detail when the write-up has been through the same review the content was.',
    status: 'placeholder',
  },
];

/** Only these get a route — see generateStaticParams in /results/[slug]/. */
export const LIVE_CASES = CASES.filter((c) => c.status === 'live');

/**
 * Filter options, derived rather than listed: a new entry above adds its own
 * pill, and no industry can appear on a pill with nothing behind it.
 */
export const CASE_INDUSTRIES: string[] = [...new Set(CASES.map((c) => c.industry))];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASES.find((c) => c.slug === slug);
}
