/**
 * The prompt set, as the rest of the site consumes it.
 *
 * The tables themselves — fifteen questions in each of three languages, and the
 * category labels that get dropped into them — live in `./markets.ts`, because
 * the question you ask and the market you ask it for are the same decision.
 * This module is the narrow view of them: the English list the marketing page
 * prints, the count the copy quotes, and a builder that takes a market.
 *
 * They are the questions a buyer actually types — not "is Ledgerly good?",
 * which invites a model to agree about a company it has never heard of. A
 * visibility test only means anything if the brand's name is absent from the
 * question.
 *
 * The WordPress plugin (`class-thallo-questions.php`) holds the same tables and
 * its copy is authoritative — the audit trail prints what the server actually
 * sent. If you change one, change both.
 */

import {
  DEFAULT_MARKET,
  QUESTION_TEMPLATES as BY_LANGUAGE,
  SUGGESTION_ANGLES,
  buildQuestionsFor,
  marketById,
  suggestedQuestionsFor,
} from './markets';

/**
 * The English set, flat.
 *
 * Used by the `/thallo-ai/` page to print "here is exactly what we ask" before
 * anyone has chosen a market. Every language has the same fifteen angles in the
 * same order, so showing one of them is representative rather than partial.
 */
export const QUESTION_TEMPLATES: readonly string[] = BY_LANGUAGE.en;

export const QUESTION_COUNT = QUESTION_TEMPLATES.length;

/** The prompts a scan of `industry` in `marketId` will send, in order. */
export function buildQuestions(industry: string, marketId: string = DEFAULT_MARKET): string[] {
  return buildQuestionsFor(industry, marketId);
}

/**
 * The three the setup screen starts the visitor from — one per archetype, in
 * the market's language, with the category and the country already in them.
 *
 * Paired with the angle each one is playing, because a suggestion the visitor
 * cannot see the purpose of is a suggestion they delete. Empty when no category
 * has been typed yet.
 */
export function suggestedQuestions(
  industry: string,
  marketId: string = DEFAULT_MARKET
): { question: string; angle: string }[] {
  const questions = suggestedQuestionsFor(industry, marketId);
  const angles = SUGGESTION_ANGLES[marketById(marketId).language];

  return questions.map((question, i) => ({ question, angle: angles[i] ?? '' }));
}
