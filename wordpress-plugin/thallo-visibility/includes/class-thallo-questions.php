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
		'fintech & payments'          => array( 'es' => 'fintech y pagos', 'pt' => 'fintech e pagamentos' ),
		'health tech & recovery'      => array( 'es' => 'tecnología de la salud y recuperación', 'pt' => 'tecnologia da saúde e recuperação' ),
		'enterprise software / saas'  => array( 'es' => 'software empresarial / SaaS', 'pt' => 'software empresarial / SaaS' ),
		'professional services'       => array( 'es' => 'servicios profesionales', 'pt' => 'serviços profissionais' ),
		'legal tech'                  => array( 'es' => 'tecnología legal', 'pt' => 'tecnologia jurídica' ),
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
