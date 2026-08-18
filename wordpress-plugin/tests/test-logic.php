<?php
/**
 * Exercises the pure logic of the plugin without WordPress.
 *
 * Everything that decides what a visitor is told — is this name their brand,
 * who else was named, is robots.txt blocking the crawlers — is a plain function
 * with no WordPress in it. That is the half worth testing before anything
 * touches a server, so the WP API is stubbed and the rest runs for real.
 *
 * Run it with any PHP 7.4+ binary, from anywhere:
 *
 *     php wordpress-plugin/tests/test-logic.php
 *
 * Exits non-zero on a failure, so it can go in CI when there is one.
 */

define( 'ABSPATH', __DIR__ );
define( 'DAY_IN_SECONDS', 86400 );

// ── WordPress stubs ─────────────────────────────────────────────────────────
/**
 * WordPress does this with a character map, not with iconv — and it matters:
 * iconv's //TRANSLIT on Windows renders "é" as "'e", so the apostrophe survives
 * into the normaliser and splits the word. A cut-down version of the real map.
 */
function remove_accents( $s ) {
	return strtr(
		$s,
		array(
			'á' => 'a', 'à' => 'a', 'ä' => 'a', 'â' => 'a', 'ã' => 'a', 'å' => 'a',
			'é' => 'e', 'è' => 'e', 'ë' => 'e', 'ê' => 'e',
			'í' => 'i', 'ì' => 'i', 'ï' => 'i', 'î' => 'i',
			'ó' => 'o', 'ò' => 'o', 'ö' => 'o', 'ô' => 'o', 'õ' => 'o',
			'ú' => 'u', 'ù' => 'u', 'ü' => 'u', 'û' => 'u',
			'ñ' => 'n', 'ç' => 'c',
			'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U', 'Ñ' => 'N', 'Ü' => 'U',
		)
	);
}
function wp_strip_all_tags( $s ) {
	return strip_tags( (string) $s );
}
function wp_parse_url( $url, $component = -1 ) {
	return parse_url( $url, $component );
}
function wp_json_encode( $v ) {
	return json_encode( $v );
}
/* Sin base de datos no hay cache de capacidades, que es justamente el caso que
   se quiere probar: `reasons()` cae entonces en el patron estatico. */
function get_option( $name, $default = false ) {
	return $default;
}

$dir = __DIR__ . '/../thallo-visibility/includes/';
require_once $dir . 'class-thallo-questions.php';
require_once $dir . 'class-thallo-http.php';
/* Only the pure half of it is exercised here — `same_model()` and `parse()`
   touch no settings and no network, and the analysis calls the first of them. */
require_once $dir . 'class-thallo-llm.php';
/* Solo se ejercita el patron estatico: `reasons()` mira primero la cache de
   capacidades, que aqui no existe, asi que cae en el. */
require_once $dir . 'class-thallo-models.php';
require_once $dir . 'class-thallo-analysis.php';
require_once $dir . 'class-thallo-tech.php';
require_once $dir . 'class-thallo-retrieval.php';

// ── Tiny harness ────────────────────────────────────────────────────────────
$pass = 0;
$fail = 0;

function check( $label, $got, $want ) {
	global $pass, $fail;
	$ok = $got === $want;
	if ( $ok ) {
		++$pass;
	} else {
		++$fail;
		printf(
			"FAIL  %s\n      got:  %s\n      want: %s\n",
			$label,
			var_export( $got, true ),
			var_export( $want, true )
		);
	}
}

/** Calls a private static method, so the internals can be tested where they live. */
function priv( $class, $method, array $args ) {
	$m = new ReflectionMethod( $class, $method );
	$m->setAccessible( true );
	return $m->invokeArgs( null, $args );
}

echo "=== normalize ===\n";
check( 'legal suffix', Thallo_Vis_Analysis::normalize( 'Ledgerly Ltd' ), 'ledgerly' );
check( 'stacked suffixes', Thallo_Vis_Analysis::normalize( 'Vertex Partners Group Ltd' ), 'vertex partners' );
check( 'ampersand', Thallo_Vis_Analysis::normalize( 'Sable & Co' ), 'sable and' );
check( 'accents', Thallo_Vis_Analysis::normalize( 'Créditos Solución' ), 'creditos solucion' );
check( 'punctuation', Thallo_Vis_Analysis::normalize( 'Ledgerly, Inc.' ), 'ledgerly' );
check( 'digits kept', Thallo_Vis_Analysis::normalize( '37signals' ), '37signals' );
// The Spanish legal form, which arrives dotted more often than not.
check( 'dotted acronym suffix', Thallo_Vis_Analysis::normalize( 'Vet Claims S.A.S.' ), 'vet claims' );
check( 'undotted acronym suffix', Thallo_Vis_Analysis::normalize( 'Vet Claims SAS' ), 'vet claims' );
// …but a name that is genuinely initials keeps them.
check( 'initials kept', Thallo_Vis_Analysis::normalize( 'H&M' ), 'h and m' );
check( 'empty', Thallo_Vis_Analysis::normalize( '   ' ), '' );

echo "=== domain_root ===\n";
check( 'com', Thallo_Vis_Analysis::domain_root( 'ledgerly.com' ), 'ledgerly' );
check( 'co.uk', Thallo_Vis_Analysis::domain_root( 'ledgerly.co.uk' ), 'ledgerly' );
check( 'www', Thallo_Vis_Analysis::domain_root( 'www.Ledgerly.com' ), 'ledgerly' );

echo "=== is_brand ===\n";
$brand  = Thallo_Vis_Analysis::normalize( 'Ledgerly' );
$root   = Thallo_Vis_Analysis::domain_root( 'ledgerly.com' );
$is     = function ( $candidate ) use ( $brand, $root ) {
	return Thallo_Vis_Analysis::is_brand( $candidate, $brand, $root );
};

check( 'exact', $is( 'Ledgerly' ), true );
check( 'case', $is( 'LEDGERLY' ), true );
check( 'with suffix', $is( 'Ledgerly Inc.' ), true );
check( 'trailing words', $is( 'Ledgerly Payments' ), true );
check( 'shorter prefix is NOT the brand', $is( 'Ledger' ), false );
check( 'different company', $is( 'Northwind' ), false );
check( 'substring only', $is( 'MyLedgerly' ), false );
check( 'empty', $is( '' ), false );

// The short-name trap: a two-word brand must not swallow a rival that merely
// starts the same way, and a short domain must not match half the market.
$pay = Thallo_Vis_Analysis::normalize( 'Pay' );
check( 'short brand vs longer rival', Thallo_Vis_Analysis::is_brand( 'PayPal', $pay, 'pay' ), false );
check( 'short domain not used', Thallo_Vis_Analysis::is_brand( 'pay', Thallo_Vis_Analysis::normalize( 'Something Else' ), 'pay' ), false );

// Spacing. The visitor types the brand one way and the model writes it the
// other, and the report then said "never named" over an audit trail printing
// the name in every answer. Both directions, because either side can be the
// one that spaces it.
$vc      = Thallo_Vis_Analysis::normalize( 'VetClaims' );
$vc_root = Thallo_Vis_Analysis::domain_root( 'vetclaims.com' );
check( 'model spaces a compound brand', Thallo_Vis_Analysis::is_brand( 'Vet Claims', $vc, $vc_root ), true );
check( 'model closes up a spaced brand', Thallo_Vis_Analysis::is_brand( 'VetClaims', Thallo_Vis_Analysis::normalize( 'Vet Claims' ), $vc_root ), true );
check( 'spacing plus suffix', Thallo_Vis_Analysis::is_brand( 'Vet Claims S.A.S.', $vc, $vc_root ), true );
check( 'hyphenated domain matches closed-up name', Thallo_Vis_Analysis::is_brand( 'VetClaims', Thallo_Vis_Analysis::normalize( 'Something Else' ), Thallo_Vis_Analysis::domain_root( 'vet-claims.com' ) ), true );

// …and the guard the despacing must not undo: without spaces there are no word
// boundaries, so the prefix rule stays on the spaced form. "Ledger" closed up is
// a prefix of "ledgerly" and must still not match it.
check( 'despacing does not revive the prefix trap', $is( 'Ledger' ), false );
check( 'despacing does not merge distinct names', Thallo_Vis_Analysis::is_brand( 'VetClaims', Thallo_Vis_Analysis::normalize( 'Vet' ), 'vet' ), false );

echo "=== phase1 ===\n";
$state = array(
	'scan_id'    => 'test',
	'brand'      => 'Ledgerly',
	'domain'     => 'ledgerly.com',
	'industry'   => 'fintech',
	'created_at' => '2026-08-01T00:00:00+00:00',
	'questions'  => array( 'q1', 'q2', 'q3' ),
	'models'     => array( 'chatgpt' => 'gpt-4o-mini', 'claude' => 'haiku', 'gemini' => 'flash' ),
	'skipped'    => array( 'gemini' => 'no API key configured' ),
	'results'    => array(
		'chatgpt' => array(
			0 => array( 'companies' => array( 'Northwind', 'Ledgerly Ltd', 'Sable & Co' ), 'error' => '' ),
			1 => array( 'companies' => array( 'Northwind' ), 'error' => '' ),
			2 => array( 'companies' => array( 'Ledgerly' ), 'error' => '' ),
		),
		'claude'  => array(
			0 => array( 'companies' => array(), 'error' => 'HTTP 429' ),
			1 => array( 'companies' => array( 'Vertex Partners', 'Northwind' ), 'error' => '' ),
			2 => array( 'companies' => array( 'Ledger' ), 'error' => '' ),
		),
	),
);

$p1 = Thallo_Vis_Analysis::phase1( $state );

check( 'mentions counted', $p1['mentions'], 2 );
check( 'failed call excluded from denominator', $p1['totalAnswers'], 5 );
check( 'share of voice', $p1['sovPct'], 40 );
check( 'average rank', $p1['avgPosition'], 1.5 );
check( 'chatgpt rank 2 then 1', $p1['providers'][0]['positions'], array( 2, 1 ) );
check( 'claude named nobody', $p1['providers'][1]['mentions'], 0 );
check( 'skipped provider carries a reason', $p1['providers'][2]['error'], 'no API key configured' );
check( 'skipped provider is not a zero', $p1['providers'][2]['answers'], array() );

/* Claude's first call failed, so its answers start at question 2. The index has
   to travel with the answer: the audit trail lines these rows up against the
   questions by it, and reading them positionally put every Claude verdict one
   question early on any run where a call failed. */
check( 'answers carry their question index', array_column( $p1['providers'][1]['answers'], 'q' ), array( 1, 2 ) );

echo "=== which model answered ===\n";
check( 'exact', Thallo_Vis_LLM::same_model( 'openai/gpt-4.1-nano', 'openai/gpt-4.1-nano' ), true );
check( 'alias resolves to a dated snapshot', Thallo_Vis_LLM::same_model( 'claude-3-5-haiku-latest', 'claude-3-5-haiku-20241022' ), true );
check( 'openrouter :online is routing, not identity', Thallo_Vis_LLM::same_model( 'openai/gpt-5.6-luna:online', 'openai/gpt-5.6-luna' ), true );
check( 'someone else answered', Thallo_Vis_LLM::same_model( 'openai/gpt-4.1-nano', 'anthropic/claude-haiku-4.5' ), false );
check( 'nothing to compare', Thallo_Vis_LLM::same_model( 'openai/gpt-4.1-nano', '' ), null );

$swapped                          = $state;
$swapped['skipped']               = array();
$swapped['models']                = array( 'chatgpt' => 'openai/gpt-4.1-nano' );
$swapped['results']               = array(
	'chatgpt' => array(
		0 => array( 'companies' => array( 'Northwind' ), 'error' => '', 'model' => 'anthropic/claude-haiku-4.5' ),
		1 => array( 'companies' => array( 'Northwind' ), 'error' => '', 'model' => 'anthropic/claude-haiku-4.5' ),
		2 => array( 'companies' => array( 'Ledgerly' ), 'error' => '', 'model' => 'anthropic/claude-haiku-4.5' ),
	),
);
$swap = Thallo_Vis_Analysis::phase1( $swapped );
check( 'a different model answering is reported', $swap['providers'][0]['modelUsed'], 'anthropic/claude-haiku-4.5' );

$honest                    = $swapped;
$honest['results']['chatgpt'][0]['model'] = 'openai/gpt-4.1-nano-2025-04-14';
$honest['results']['chatgpt'][1]['model'] = 'openai/gpt-4.1-nano-2025-04-14';
$honest['results']['chatgpt'][2]['model'] = 'openai/gpt-4.1-nano-2025-04-14';
$honest_row = Thallo_Vis_Analysis::phase1( $honest )['providers'][0];
check( 'a snapshot of the id asked for is not a mismatch', isset( $honest_row['modelUsed'] ), false );

echo "=== which models think before answering ===\n";
/* La deteccion por catalogo puede no llegar: la llamada falla, o el scan corre
   sin red hacia OpenRouter. Cuando eso pasa, este patron es lo unico que impide
   que un modelo que razona se quede sin presupuesto y devuelva vacio, que es
   como Gemini paso una version entera con la columna en blanco. */
check( 'gemini 3 razona', Thallo_Vis_Models::reasons( 'google/gemini-3.6-flash' ), true );
check( 'gemini 3 con :online tambien', Thallo_Vis_Models::reasons( 'google/gemini-3.6-flash:online' ), true );
check( 'la familia gpt-5 razona', Thallo_Vis_Models::reasons( 'openai/gpt-5.6-luna' ), true );
check( 'gpt-4.1 no', Thallo_Vis_Models::reasons( 'openai/gpt-4.1-nano' ), false );
check( 'haiku no', Thallo_Vis_Models::reasons( 'anthropic/claude-haiku-4.5' ), false );
check( 'gemini 2.5 no', Thallo_Vis_Models::reasons( 'google/gemini-2.5-flash' ), false );

echo "=== reading a response ===\n";
$ok = Thallo_Vis_LLM::parse(
	'openai',
	array( 'code' => 200, 'error' => '', 'body' => '{"model":"openai/gpt-4.1-nano","choices":[{"message":{"content":"{\"companies\":[\"Northwind\"]}"}}]}' )
);
check( 'names read', $ok['companies'], array( 'Northwind' ) );
check( 'answering model read', $ok['model'], 'openai/gpt-4.1-nano' );

/* A 200 carrying an error object. Read only for `choices` this came back as
   "empty answer", which told the operator nothing about a key or a retired id. */
$refused = Thallo_Vis_LLM::parse(
	'openai',
	array( 'code' => 200, 'error' => '', 'body' => '{"error":{"message":"No endpoints found for openai/gpt-4.1-nano."}}' )
);
check( 'a 200 that carries an error says what it was', $refused['error'], 'No endpoints found for openai/gpt-4.1-nano.' );


echo "=== competitors ===\n";
$rivals = Thallo_Vis_Analysis::competitors( $state );
check( 'top rival', $rivals[0]['name'], 'Northwind' );
check( 'top rival count', $rivals[0]['mentions'], 3 );
check( 'brand excluded', array_column( $rivals, 'name' ), array( 'Northwind', 'Sable & Co', 'Vertex Partners', 'Ledger' ) );
check( 'providers recorded', $rivals[0]['providers'], array( 'chatgpt', 'claude' ) );

// Same company written two ways inside one answer counts once.
$dupe = $state;
$dupe['results'] = array( 'chatgpt' => array( 0 => array( 'companies' => array( 'Northwind', 'Northwind Ltd' ), 'error' => '' ) ) );
$dupe['questions'] = array( 'q1' );
check( 'deduped within an answer', Thallo_Vis_Analysis::competitors( $dupe )[0]['mentions'], 1 );

echo "=== extract_json ===\n";
check( 'plain', Thallo_Vis_HTTP::extract_json( '{"companies":["A"]}' ), array( 'companies' => array( 'A' ) ) );
check( 'fenced', Thallo_Vis_HTTP::extract_json( "```json\n{\"companies\":[\"A\"]}\n```" ), array( 'companies' => array( 'A' ) ) );
check( 'with preamble', Thallo_Vis_HTTP::extract_json( 'Sure! {"companies":["A"]} Hope that helps.' ), array( 'companies' => array( 'A' ) ) );
check( 'garbage', Thallo_Vis_HTTP::extract_json( 'no json here' ), null );
check( 'empty', Thallo_Vis_HTTP::extract_json( '' ), null );

echo "=== robots.txt ===\n";
$blocked = function ( $body ) {
	return priv( 'Thallo_Vis_Tech', 'blocked_bots', array( $body ) );
};

check( 'wide open', $blocked( "User-agent: *\nDisallow:\n" ), array() );
check( 'GPTBot blocked', $blocked( "User-agent: GPTBot\nDisallow: /\n" ), array( 'GPTBot' ) );
check(
	'blanket block catches everything',
	count( $blocked( "User-agent: *\nDisallow: /\n" ) ),
	count( Thallo_Vis_Tech::AI_BOTS )
);
check( 'partial path is not a block', $blocked( "User-agent: GPTBot\nDisallow: /private/\n" ), array() );
check(
	'grouped agents share the rule',
	$blocked( "User-agent: GPTBot\nUser-agent: ClaudeBot\nDisallow: /\n" ),
	array( 'GPTBot', 'ClaudeBot' )
);
check(
	'a new group does not inherit the last one',
	$blocked( "User-agent: GPTBot\nDisallow: /\n\nUser-agent: ClaudeBot\nDisallow:\n" ),
	array( 'GPTBot' )
);
check( 'comments ignored', $blocked( "# User-agent: GPTBot\n# Disallow: /\nUser-agent: *\nDisallow:\n" ), array() );
check( 'case insensitive agent', $blocked( "user-agent: gptbot\ndisallow: /\n" ), array( 'GPTBot' ) );

echo "=== schema detection ===\n";
$has = function ( $html, $types ) {
	return priv( 'Thallo_Vis_Tech', 'has_schema_type', array( $html, $types ) );
};

check(
	'plain Organization',
	$has( '<script type="application/ld+json">{"@type":"Organization"}</script>', array( 'Organization' ) ),
	true
);
check(
	'inside @graph array',
	$has( '<script type="application/ld+json">{"@graph":[{"@type":"WebSite"},{"@type":"Organization"}]}</script>', array( 'Organization' ) ),
	true
);
check(
	'@type as an array',
	$has( '<script type="application/ld+json">{"@type":["LocalBusiness","Organization"]}</script>', array( 'Organization' ) ),
	true
);
check(
	'absent',
	$has( '<script type="application/ld+json">{"@type":"WebSite"}</script>', array( 'Organization' ) ),
	false
);
check( 'no json-ld at all', $has( '<html><body>hello</body></html>', array( 'Organization' ) ), false );

echo "=== retrieval helpers ===\n";
check(
	'hosts deduped and bare',
	Thallo_Vis_Retrieval::hosts( array( 'https://www.Forbes.com/a', 'https://forbes.com/b', 'g2.com' ) ),
	array( 'forbes.com', 'g2.com' )
);

$names = function ( $text, $brand ) {
	return priv( 'Thallo_Vis_Retrieval', 'text_names_brand', array( $text, Thallo_Vis_Analysis::normalize( $brand ) ) );
};
check( 'named in prose', $names( 'We rate Ledgerly highly.', 'Ledgerly' ), true );
check( 'possessive', $names( "Ledgerly's pricing is fair.", 'Ledgerly' ), true );
check( 'not a substring match', $names( 'Ledgerly is fine.', 'Ledger' ), false );
check( 'absent', $names( 'Northwind leads the category.', 'Ledgerly' ), true === false );

echo "=== questions ===\n";
$qs = Thallo_Vis_Questions::build( 'Fintech & Payments', 15 );
check( 'count', count( $qs ), 15 );
check( 'industry substituted', strpos( $qs[0], 'fintech & payments' ) !== false, true );
check( 'no placeholder left', strpos( implode( ' ', $qs ), '{industry}' ), false );
check( 'trimmed run keeps the early angles', count( Thallo_Vis_Questions::build( 'saas', 5 ) ), 5 );
check( 'cannot ask zero', count( Thallo_Vis_Questions::build( 'saas', 0 ) ), 1 );

echo "=== grades ===\n";
check( 'A', Thallo_Vis_Analysis::grade_for( 80 ), 'A' );
check( 'F', Thallo_Vis_Analysis::grade_for( 0 ), 'F' );
check( 'C boundary', Thallo_Vis_Analysis::grade_for( 50 ), 'C' );

echo "=== key insight reads from the rows ===\n";
$signals_blocked = array( array( 'id' => 'ai-crawlers', 'status' => 'fail', 'weight' => 25 ) );
check(
	'blocked crawlers lead the insight',
	strpos( Thallo_Vis_Analysis::key_insight( $p1, $signals_blocked, array() ), 'blocking the crawlers' ) !== false,
	true
);

$none = $p1;
$none['mentions'] = 0;
$none['providers'] = array( array( 'provider' => 'chatgpt', 'mentions' => 0, 'error' => '' ) );
check(
	'absent everywhere says so',
	strpos( Thallo_Vis_Analysis::key_insight( $none, array(), array() ), 'No model named' ) !== false,
	true
);

$unreachable = $p1;
$unreachable['providers'] = array( array( 'provider' => 'chatgpt', 'mentions' => 0, 'error' => 'HTTP 401' ) );
check(
	'nothing measured is not a finding about the brand',
	strpos( Thallo_Vis_Analysis::key_insight( $unreachable, array(), array() ), 'No model could be reached' ) !== false,
	true
);

/*
 * Markets.
 *
 * The property worth protecting here is that the question actually changes with
 * the market — a selector that silently sends English either way would be worse
 * than not having one, because the report would carry a market label it did not
 * honour.
 */
echo "=== markets ===\n";

check( 'known market', Thallo_Vis_Questions::is_market( 'es-CO' ), true );
check( 'unknown market', Thallo_Vis_Questions::is_market( 'xx-ZZ' ), false );
check( 'language of a market', Thallo_Vis_Questions::language_of( 'pt-BR' ), 'pt' );
check( 'language of nonsense falls back', Thallo_Vis_Questions::language_of( 'xx-ZZ' ), 'en' );

/* The article belongs in the sentence, not in the API call. */
check( 'country reads in a sentence', Thallo_Vis_Questions::country_of( 'en-US' ), 'the United States' );
check( 'serp location drops the article', Thallo_Vis_Questions::serp_location_of( 'en-US' ), 'United States' );
check( 'serp location without one is unchanged', Thallo_Vis_Questions::serp_location_of( 'es-CO' ), 'Colombia' );

check(
	'category translated into the question',
	Thallo_Vis_Questions::industry_label( 'Fintech & payments', 'es-MX' ),
	'fintech y pagos'
);
check(
	'unknown category passes through rather than failing',
	Thallo_Vis_Questions::industry_label( 'Underwater basket weaving', 'es-MX' ),
	'underwater basket weaving'
);
check(
	'English market lowercases and leaves alone',
	Thallo_Vis_Questions::industry_label( 'Legal tech', 'en-GB' ),
	'legal tech'
);

$en = Thallo_Vis_Questions::build( 'Legal tech', 15, 'en-US' );
$es = Thallo_Vis_Questions::build( 'Legal tech', 15, 'es-CO' );
$pt = Thallo_Vis_Questions::build( 'Legal tech', 15, 'pt-BR' );

check( 'every language has the full set', array( count( $en ), count( $es ), count( $pt ) ), array( 15, 15, 15 ) );
check( 'Spanish is not English', $en[0] === $es[0], false );
check( 'Spanish question is in Spanish', strpos( $es[0], '¿Cuáles son las mejores empresas' ) === 0, true );
check( 'Portuguese question is in Portuguese', strpos( $pt[0], 'Quais são as melhores empresas' ) === 0, true );
check( 'the translated label is inside the question', strpos( $es[0], 'tecnología legal' ) !== false, true );

/* A shortened run has to keep the angles, not three phrasings of one. The
   templates are grouped in threes, so the first three are one angle — trimming
   to three is the boundary case that proves the slice is from the front. */
check( 'a shortened run trims from the end', Thallo_Vis_Questions::build( 'Legal tech', 3, 'es-CO' ), array_slice( $es, 0, 3 ) );
check( 'count is clamped to what exists', count( Thallo_Vis_Questions::build( 'Legal tech', 99, 'en-US' ) ), 15 );
check( 'zero is not a valid run', count( Thallo_Vis_Questions::build( 'Legal tech', 0, 'en-US' ) ), 1 );

/* An unrecognised market must degrade to English rather than to an empty
   question set — the REST layer already coerces it, and this is the second
   line of defence for anything that reaches the builder another way. */
check( 'nonsense market still produces questions', Thallo_Vis_Questions::build( 'Legal tech', 15, 'xx-ZZ' ), $en );

echo "=== serp query ===\n";
check( 'English search', Thallo_Vis_Questions::serp_query( 'Legal tech', 'en-US' ), 'best legal tech companies' );
check( 'Spanish search', Thallo_Vis_Questions::serp_query( 'Legal tech', 'es-ES' ), 'mejores empresas de tecnología legal' );
check( 'Portuguese search', Thallo_Vis_Questions::serp_query( 'Legal tech', 'pt-BR' ), 'melhores empresas de tecnologia jurídica' );

echo "=== system prompt ===\n";
$prompt_us = Thallo_Vis_Questions::system_prompt( 'en-US' );
$prompt_co = Thallo_Vis_Questions::system_prompt( 'es-CO' );

check( 'the country is in the prompt', strpos( $prompt_co, 'Colombia' ) !== false, true );
check( 'the JSON contract survives translation', strpos( $prompt_co, '{"companies"' ) !== false, true );
/* Without this the model helpfully translates "Arbor Systems", the brand match
   fails, and the visitor is told they were not named when they were. */
check( 'non-English asks for names to be left alone', strpos( $prompt_co, 'Never translate or localise a company name' ) !== false, true );
check( 'English does not need that line', strpos( $prompt_us, 'Never translate' ) !== false, false );

echo "\n" . str_repeat( '─', 50 ) . "\n";
printf( "%d passed, %d failed\n", $pass, $fail );
exit( $fail > 0 ? 1 : 0 );
