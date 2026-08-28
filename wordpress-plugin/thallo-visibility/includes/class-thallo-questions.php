<?php
/**
 * The prompt set, and the markets it is asked in.
 *
 * This copy is authoritative — the audit trail the visitor sees prints what the
 * server actually sent, which is this. `src/lib/scan/markets.ts` mirrors it so
 * the setup screen can preview what is coming; if you change one, change both.
 *
 * The questions are what a buyer types, and the brand's name is deliberately not
 * among the words in them. Ask "is Ledgerly any good?" and a model will happily
 * have an opinion about a company that does not exist; a visibility test only
 * means anything when nothing in the question can lead the answer.
 *
 * Five angles, three questions each, because one phrasing measures a phrasing.
 *
 * ## Markets
 *
 * A market is a language plus a country, and the two are separate on purpose. A
 * Spanish question asked for a buyer in Mexico is a different measurement from
 * an English question asking about vendors *for* Mexico. The language chooses
 * the table below; the country goes into the system prompt as who is asking.
 *
 * The translations are written out rather than machine-translated on the way to
 * the model. A translation call per question would cost money, drift between
 * runs, and make two scans a fortnight apart incomparable — which would quietly
 * destroy the only thing a history series is for.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Questions {

	/** Falls back to this whenever a market id is missing or unrecognised. */
	const DEFAULT_MARKET = 'en-US';

	/**
	 * language => the country a buyer is asking from.
	 *
	 * The country strings carry "the" where a sentence needs it, because that is
	 * the only place they are used.
	 */
	const MARKETS = array(
		'en-US' => array( 'lang' => 'en', 'country' => 'the United States' ),
		'en-GB' => array( 'lang' => 'en', 'country' => 'the United Kingdom' ),
		'es-ES' => array( 'lang' => 'es', 'country' => 'Spain' ),
		'es-MX' => array( 'lang' => 'es', 'country' => 'Mexico' ),
		'es-CO' => array( 'lang' => 'es', 'country' => 'Colombia' ),
		'es-AR' => array( 'lang' => 'es', 'country' => 'Argentina' ),
		'pt-BR' => array( 'lang' => 'pt', 'country' => 'Brazil' ),
	);

	const TEMPLATES = array(
		'en' => array(
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
		),

		'es' => array(
			// Recomendación abierta.
			'¿Cuáles son las mejores empresas de {industry} ahora mismo?',
			'¿Qué empresas de {industry} recomendarías?',
			'¿Quiénes son los proveedores líderes en {industry}?',

			// Lista corta / compras.
			'Necesito armar una lista corta de socios de {industry}. ¿A quiénes debería mirar?',
			'¿Qué proveedores de {industry} le recomendarías a una empresa B2B de tamaño medio?',
			'Estamos abriendo un proceso de compra de {industry}. ¿Qué proveedores deberían estar en la lista?',

			// Confianza y reputación.
			'¿Cuáles son los proveedores más confiables en {industry}?',
			'¿Qué empresas de {industry} tienen mejor reputación entre clientes corporativos?',
			'¿Qué proveedores de {industry} tienen las mejores reseñas de sus clientes?',

			// Ajuste por segmento.
			'¿Qué empresas de {industry} son mejores para una startup con presupuesto ajustado?',
			'¿Qué proveedores de {industry} funcionan mejor con grandes empresas?',
			'¿Qué empresas de {industry} son mejores para un negocio que se expande internacionalmente?',

			// Alternativas y cambio de proveedor.
			'¿Cuáles son las principales alternativas en {industry} que vale la pena comparar?',
			'¿Quién compite con los nombres más grandes en {industry}?',
			'Si no estoy conforme con mi proveedor actual de {industry}, ¿a quién debería cambiarme?',
		),

		'pt' => array(
			// Recomendação aberta.
			'Quais são as melhores empresas de {industry} hoje?',
			'Que empresas de {industry} você recomendaria?',
			'Quem são os principais fornecedores em {industry}?',

			// Lista curta / compras.
			'Preciso montar uma lista curta de parceiros de {industry}. Quem eu deveria considerar?',
			'Que fornecedores de {industry} você recomendaria para uma empresa B2B de médio porte?',
			'Estamos abrindo um processo de compra de {industry}. Que fornecedores deveriam estar na lista?',

			// Confiança e reputação.
			'Quem são os fornecedores mais confiáveis em {industry}?',
			'Que empresas de {industry} têm a melhor reputação entre clientes corporativos?',
			'Que fornecedores de {industry} têm as melhores avaliações dos seus clientes?',

			// Ajuste por segmento.
			'Que empresas de {industry} são melhores para uma startup com orçamento limitado?',
			'Que fornecedores de {industry} funcionam melhor com grandes empresas?',
			'Que empresas de {industry} são melhores para um negócio que está se expandindo internacionalmente?',

			// Alternativas e troca de fornecedor.
			'Quais são as principais alternativas em {industry} que valem a pena comparar?',
			'Quem compete com os maiores nomes em {industry}?',
			'Se eu não estiver satisfeito com meu fornecedor atual de {industry}, para quem eu deveria migrar?',
		),
	);

	/**
	 * The category labels, per language.
	 *
	 * The picker on the site is in English because the site is, but a Spanish
	 * question with `enterprise software / SaaS` dropped into the middle of it is
	 * not a question anybody types. Keyed on the English label the site sends, so
	 * a category that is not in this table — the field accepts free text — falls
	 * through unchanged rather than failing.
	 */
	const INDUSTRIES = array(
		/* The five Thallo sells to, in the order the site lists them. */
		'fintech'                     => array( 'es' => 'fintech', 'pt' => 'fintech' ),
		'health tech'                 => array( 'es' => 'tecnología de la salud', 'pt' => 'tecnologia da saúde' ),
		'legal tech'                  => array( 'es' => 'tecnología legal', 'pt' => 'tecnologia jurídica' ),
		'specialized software'        => array( 'es' => 'software especializado', 'pt' => 'software especializado' ),
		'professional services'       => array( 'es' => 'servicios profesionales', 'pt' => 'serviços profissionais' ),

		/* Adjacent, and asked for often enough to be worth translating. */
		'insurance & claims'          => array( 'es' => 'seguros y siniestros', 'pt' => 'seguros e sinistros' ),
		'enterprise software / saas'  => array( 'es' => 'software empresarial / SaaS', 'pt' => 'software empresarial / SaaS' ),

		/* Retired from the site's suggestion list and kept translated anyway. A
		   lead who typed one of these before the list changed — or who types it
		   now, since the field has always taken free text — should still get a
		   question in their own language rather than an English label dropped
		   into a Spanish sentence. Removing a translation does not remove the
		   category, it only removes the translation. */
		'fintech & payments'          => array( 'es' => 'fintech y pagos', 'pt' => 'fintech e pagamentos' ),
		'health tech & recovery'      => array( 'es' => 'tecnología de la salud y recuperación', 'pt' => 'tecnologia da saúde e recuperação' ),
		'logistics & supply chain'    => array( 'es' => 'logística y cadena de suministro', 'pt' => 'logística e cadeia de suprimentos' ),
		'e-commerce & retail'         => array( 'es' => 'comercio electrónico y retail', 'pt' => 'e-commerce e varejo' ),
		'marketing & advertising'     => array( 'es' => 'marketing y publicidad', 'pt' => 'marketing e publicidade' ),
	);

	public static function is_market( $market ) {
		return isset( self::MARKETS[ $market ] );
	}

	public static function market_ids() {
		return array_keys( self::MARKETS );
	}

	public static function language_of( $market ) {
		return isset( self::MARKETS[ $market ] ) ? self::MARKETS[ $market ]['lang'] : 'en';
	}

	public static function country_of( $market ) {
		return isset( self::MARKETS[ $market ] ) ? self::MARKETS[ $market ]['country'] : 'the United States';
	}

	/**
	 * The country as a search-results provider wants it.
	 *
	 * DataForSEO takes a bare `location_name` — "Colombia", not "the United
	 * States" — and the article that makes the system prompt read as English is
	 * exactly what breaks the lookup. Same fact, two audiences.
	 */
	public static function serp_location_of( $market ) {
		return preg_replace( '/^the /', '', self::country_of( $market ) );
	}

	/** The category label as it should read inside a question in `$market`. */
	public static function industry_label( $industry, $market ) {
		$industry = strtolower( trim( $industry ) );
		$lang     = self::language_of( $market );

		if ( 'en' === $lang ) {
			return $industry;
		}

		return isset( self::INDUSTRIES[ $industry ][ $lang ] )
			? strtolower( self::INDUSTRIES[ $industry ][ $lang ] )
			: $industry;
	}

	/**
	 * The search a buyer in this market would actually type.
	 *
	 * Google generates a different AI Overview — often none at all — for the
	 * translated query, so searching in English for a Spanish-language market
	 * would answer a question nobody in that market asked.
	 */
	public static function serp_query( $industry, $market ) {
		$label = self::industry_label( $industry, $market );

		switch ( self::language_of( $market ) ) {
			case 'es':
				return sprintf( 'mejores empresas de %s', $label );
			case 'pt':
				return sprintf( 'melhores empresas de %s', $label );
			default:
				return sprintf( 'best %s companies', $label );
		}
	}

	/**
	 * The one-line brief a grounded model gets alongside a retrieval question.
	 *
	 * Perplexity answers in the language it is asked in, and an answer in
	 * Spanish is the correct answer for a Spanish market — the brand-matching
	 * downstream works on company names, which the prompt tells it to leave
	 * alone.
	 */
	public static function retrieval_prompt( $kind, $market ) {
		$lang = self::language_of( $market );

		$briefs = array(
			'category' => array(
				'en' => 'Answer briefly and name specific companies. Cite your sources.',
				'es' => 'Responde brevemente y nombra empresas concretas. Cita tus fuentes. No traduzcas los nombres de las empresas.',
				'pt' => 'Responda brevemente e cite empresas específicas. Cite suas fontes. Não traduza os nomes das empresas.',
			),
			'brand'    => array(
				'en' => 'Answer briefly using sources you can cite. If you cannot find information about this company, say so plainly.',
				'es' => 'Responde brevemente usando fuentes que puedas citar. Si no encuentras información sobre esta empresa, dilo claramente.',
				'pt' => 'Responda brevemente usando fontes que possa citar. Se não encontrar informações sobre esta empresa, diga isso claramente.',
			),
		);

		return isset( $briefs[ $kind ][ $lang ] ) ? $briefs[ $kind ][ $lang ] : $briefs[ $kind ]['en'];
	}

	/**
	 * @param string $industry Category label chosen by the visitor, in English.
	 * @param int    $count    How many to send. Trimmed from the end, so a
	 *                         shortened run still covers the earlier angles
	 *                         rather than three phrasings of one.
	 * @param string $market   Market id; anything unknown falls back to en-US.
	 * @return string[]
	 */
	public static function build( $industry, $count = 15, $market = self::DEFAULT_MARKET ) {
		$lang      = self::language_of( $market );
		$templates = isset( self::TEMPLATES[ $lang ] ) ? self::TEMPLATES[ $lang ] : self::TEMPLATES['en'];
		$label     = self::industry_label( $industry, $market );
		$count     = max( 1, min( count( $templates ), (int) $count ) );

		$out = array();
		foreach ( array_slice( $templates, 0, $count ) as $template ) {
			$out[] = str_replace( '{industry}', $label, $template );
		}

		return $out;
	}

	// -----------------------------------------------------------------------
	// The direct question: "what is this company?"
	// -----------------------------------------------------------------------

	/**
	 * Asked by name, once per model, and the only question in the whole scan
	 * that mentions the brand.
	 *
	 * ## Why it breaks the rule the rest of this file is built on
	 *
	 * Every other question here keeps the brand's name out of it, because a
	 * model asked "is Ledgerly any good?" will have an opinion about a company
	 * that does not exist, and a share of voice measured that way measures
	 * nothing. That reasoning is about *ranking*. This question is not a ranking
	 * question — it asks the model to identify an entity, and the answer is
	 * checked against facts we already hold rather than taken at its word.
	 *
	 * ## What it is for
	 *
	 * The floor problem. Nearly every brand that runs this scan comes back at 0%
	 * share of answer, and a zero tells a story only once: it confirms absence
	 * and says nothing about what to do. Worse, it flattens three completely
	 * different situations into one number — the model has never heard of you,
	 * the model knows you and cannot say who you are for, and the model resolves
	 * your name to somebody else's company. The last of those is not absence at
	 * all; it is a buyer being handed the wrong business under your name, and it
	 * is both the most damaging and the most fixable.
	 *
	 * ## Why it asks for a website
	 *
	 * `domain` is the field that makes the wrong-entity case detectable without
	 * a second model call to judge the first. A model that has confused two
	 * companies of the same name will confidently name the other one's website,
	 * and comparing that string to the domain being scanned is a deterministic
	 * check we can print the evidence for. Asked to self-assess in prose instead,
	 * every model says it is confident.
	 *
	 * `certain` is asked for separately and is only ever read as a downgrade —
	 * a model that volunteers doubt is telling us something; a model that claims
	 * certainty is not.
	 */
	public static function entity_prompt( $brand, $market = self::DEFAULT_MARKET ) {
		$lang = self::language_of( $market );

		switch ( $lang ) {
			case 'es':
				return sprintf( '¿Qué es %s? ¿A qué se dedica y a quién le sirve?', $brand );
			case 'pt':
				return sprintf( 'O que é %s? O que faz e para quem trabalha?', $brand );
			default:
				return sprintf( 'What is %s? What do they do and who do they serve?', $brand );
		}
	}

	/**
	 * The system prompt for the question above.
	 *
	 * Separate from `system_prompt()` because it asks for a different shape and,
	 * more importantly, gives the opposite instruction about guessing. The
	 * ranking prompt tells a model not to pad a list; this one tells it not to
	 * reconstruct a plausible company from a name — which is the failure this
	 * question exists to catch, and a model left to be helpful will produce a
	 * fluent description of a business that does not exist.
	 */
	public static function entity_system_prompt( $market = self::DEFAULT_MARKET ) {
		$lines = array(
			'You are being asked to identify a specific company by name.',
			'Answer only from what you already know. Do not guess, and do not assemble a plausible description from the name itself.',
			'If you do not recognise the company, say so — that is a useful and correct answer.',
			'If the name could refer to more than one company, describe the one you know best and say which it is.',
			'Respond with JSON only, in exactly this shape: {"known": true, "what": "one sentence on what they do", "serves": "one sentence on who their customers are", "domain": "their website, host only, or an empty string", "certain": true}.',
			'Set "known" to false, and leave the other fields empty, when you do not recognise the company.',
			'Leave "serves" empty rather than guessing at a customer type you are not sure of.',
			'"domain" must be the website of the company you are actually describing, as a bare host such as example.com. Leave it empty if you do not know it. Never invent one.',
			'Set "certain" to false whenever you are working from a weak or partial memory.',
			'Keep "what" and "serves" to one short sentence each.',
		);

		/* The answer is read by a person in their own market, so it is written in
		   their language — but the field names and the JSON shape stay English,
		   because those are what the parser reads. */
		$lang = self::language_of( $market );
		if ( 'es' === $lang ) {
			$lines[] = 'Write the values of "what" and "serves" in Spanish. Keep the field names in English.';
		} elseif ( 'pt' === $lang ) {
			$lines[] = 'Write the values of "what" and "serves" in Portuguese. Keep the field names in English.';
		}

		return implode( ' ', $lines );
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
	 *
	 * The locale lines are appended rather than translated into the prompt. The
	 * instructions that keep the output parseable are the ones that must not be
	 * weakened, and they are most reliable in English; what has to change per
	 * market is *who is asking*, which is exactly what these two lines say.
	 */
	public static function system_prompt( $market = self::DEFAULT_MARKET ) {
		$lang    = self::language_of( $market );
		$country = self::country_of( $market );

		$lines = array(
			'You are helping a business buyer choose a vendor.',
			sprintf( 'The buyer is in %s and is asking in their own language.', $country ),
			sprintf( 'Recommend companies that a buyer in %s could actually hire — local and international firms both count, but a company that does not serve that market does not.', $country ),
			'Answer with the companies you would genuinely recommend, most recommended first.',
			'Only name real companies you actually know of. Do not invent names, and do not pad the list to reach a length.',
			/* The category test. Without it, "which web design studio in
			   Barranquilla" came back with Google and Accenture: a model asked
			   for vendors and short of local ones reaches for the biggest name
			   adjacent to the industry, and a report then prints Google as a
			   competitor to a five-person studio. */
			'Name only companies whose actual business is the thing being asked for. A search engine, a marketplace, a software platform or a global consultancy that merely touches the category is not a vendor for it.',
			/* And the locality test. The country line above says who is asking;
			   this one says it is the question, not the buyer's passport, that
			   decides how local the answer has to be. */
			'When the question names a city or a region, prefer firms that actually operate there. A national or international name belongs in the list only if a buyer in that place would realistically hire it for this.',
			'If you do not know of any suitable companies, return an empty list.',
			'Respond with JSON only, in exactly this shape: {"companies": ["Company A", "Company B"]}.',
			'Use each company\'s common trading name, without a legal suffix, a description or a URL.',
			/* "Between 0 and 8" read as a target and got treated as one. An
			   owner checking the tool by hand watched ChatGPT decline to name
			   anybody without searching, then name exactly one company when
			   pressed — while our own call to the same model returned a
			   confident eight. The ceiling was doing that. */
			'Return at most 8 names. A short list you are sure of is a better answer than a long one: three companies you actually know beats eight that include guesses.',
		);

		/* Company names are proper nouns and must come back unaltered whatever
		   language the question was in — a model that helpfully translates
		   "Arbor Systems" into Spanish breaks the brand match, and a brand that
		   cannot be matched reads to the visitor as a brand that was not named. */
		if ( 'en' !== $lang ) {
			$lines[] = 'Keep every company name exactly as that company writes it. Never translate or localise a company name.';
		}

		return implode( ' ', $lines );
	}
}
