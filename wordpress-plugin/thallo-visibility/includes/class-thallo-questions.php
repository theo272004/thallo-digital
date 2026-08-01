<?php
/**
 * The prompt set.
 *
 * This copy is authoritative — the audit trail the visitor sees prints what the
 * server actually sent, which is this. `src/lib/scan/questions.ts` mirrors it so
 * the setup screen can say what is coming; if you change one, change both.
 *
 * The questions are what a buyer types, and the brand's name is deliberately not
 * among the words in them. Ask "is Ledgerly any good?" and a model will happily
 * have an opinion about a company that does not exist; a visibility test only
 * means anything when nothing in the question can lead the answer.
 *
 * Five angles, three questions each, because one phrasing measures a phrasing.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Questions {

	const TEMPLATES = array(
		// Open recommendation.
		'What are the best {industry} companies right now?',
		'Which {industry} companies would you recommend?',
		'Who are the leading providers in {industry}?',

		// Shortlist / procurement.
		'I need to shortlist {industry} partners. Who should I be looking at?',
		'Which {industry} vendors would you recommend to a mid-market B2B buyer?',
		'We are running a procurement process for {industry}. Which suppliers should be on the list?',

		// Trust and reputation.
		'Who are the most trusted providers in {industry}?',
		'Which {industry} companies have the strongest reputation with enterprise clients?',
		'Which {industry} providers have the best reviews from their customers?',

		// Segment fit.
		'Which {industry} companies are best for a startup on a limited budget?',
		'Which {industry} providers work best with large enterprises?',
		'Which {industry} companies are best for a business expanding internationally?',

		// Alternatives and switching.
		'What are the main alternatives in {industry} worth comparing?',
		'Who competes with the biggest names in {industry}?',
		'If I am unhappy with my current {industry} provider, who should I move to?',
	);

	/**
	 * @param string $industry Category label chosen by the visitor.
	 * @param int    $count    How many to send. Trimmed from the end, so a
	 *                         shortened run still covers the earlier angles
	 *                         rather than three phrasings of one.
	 * @return string[]
	 */
	public static function build( $industry, $count = 15 ) {
		$industry = strtolower( trim( $industry ) );
		$count    = max( 1, min( count( self::TEMPLATES ), (int) $count ) );

		$out = array();
		foreach ( array_slice( self::TEMPLATES, 0, $count ) as $template ) {
			$out[] = str_replace( '{industry}', $industry, $template );
		}

		return $out;
	}

	/**
	 * The system prompt.
	 *
	 * Asking for JSON is not decoration. Parsing prose for company names means
	 * regexing capitalised words, which finds "However" and misses "37signals",
	 * and it cannot tell you what rank a name held. A structured list gives us
	 * the mention, the rank and the competitor set from one call, and it is what
	 * makes the audit trail exact rather than approximate.
	 *
	 * The instruction to return an empty array is load-bearing: without it a
	 * model asked for a list will invent one, and invented companies would show
	 * up as competitors that do not exist.
	 */
	public static function system_prompt() {
		return implode(
			' ',
			array(
				'You are helping a business buyer choose a vendor.',
				'Answer with the companies you would genuinely recommend, most recommended first.',
				'Only name real companies you actually know of. Do not invent names, and do not pad the list to reach a length.',
				'If you do not know of any suitable companies, return an empty list.',
				'Respond with JSON only, in exactly this shape: {"companies": ["Company A", "Company B"]}.',
				'Use each company\'s common trading name, without a legal suffix, a description or a URL.',
				'Return between 0 and 8 names.',
			)
		);
	}
}
