/**
 * The prompt set.
 *
 * Fifteen questions, put verbatim to every model, with `{industry}` swapped for
 * whatever the visitor picked. They are the questions a buyer actually types —
 * not "is Ledgerly good?", which invites a model to agree about a company it has
 * never heard of. A visibility test only means anything if the brand's name is
 * absent from the question.
 *
 * The same list lives in the WordPress plugin (`class-thallo-questions.php`) and
 * the server's copy is authoritative — the audit trail prints what the server
 * actually sent. This copy exists so the setup screen can say what is coming
 * before a scan has started, and so the demo mode has something honest to show.
 * If you change one, change both.
 *
 * Five angles, three questions each, because a single phrasing measures a
 * phrasing rather than a market:
 *   · open recommendation      · shortlist / procurement
 *   · trust and reputation     · segment-specific fit
 *   · alternatives and switching
 */

export const QUESTION_TEMPLATES: readonly string[] = [
  // Open recommendation
  'What are the best {industry} companies right now?',
  'Which {industry} companies would you recommend?',
  'Who are the leading providers in {industry}?',

  // Shortlist / procurement
  'I need to shortlist {industry} partners. Who should I be looking at?',
  'Which {industry} vendors would you recommend to a mid-market B2B buyer?',
  'We are running a procurement process for {industry}. Which suppliers should be on the list?',

  // Trust and reputation
  'Who are the most trusted providers in {industry}?',
  'Which {industry} companies have the strongest reputation with enterprise clients?',
  'Which {industry} providers have the best reviews from their customers?',

  // Segment fit
  'Which {industry} companies are best for a startup on a limited budget?',
  'Which {industry} providers work best with large enterprises?',
  'Which {industry} companies are best for a business expanding internationally?',

  // Alternatives and switching
  'What are the main alternatives in {industry} worth comparing?',
  'Who competes with the biggest names in {industry}?',
  'If I am unhappy with my current {industry} provider, who should I move to?',
];

export const QUESTION_COUNT = QUESTION_TEMPLATES.length;

export function buildQuestions(industry: string): string[] {
  const label = industry.toLowerCase();
  return QUESTION_TEMPLATES.map((q) => q.replace(/\{industry\}/g, label));
}
