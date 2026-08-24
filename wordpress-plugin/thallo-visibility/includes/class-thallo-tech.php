<?php
/**
 * The crawl.
 *
 * Seven scored checks against the visitor's own domain, plus one that is
 * listed and deliberately not scored. Between them they answer a narrower
 * question than "is this a good website": can a model reach this site, resolve
 * who the company is, and find something quotable that is still true.
 *
 * A check that cannot be run is dropped to weight 0 rather than failed. The
 * score is a share of the points we could actually assess, so a site that times
 * out gets a smaller denominator instead of a worse grade — an unreachable page
 * is our problem to report, not the visitor's to be marked down for.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Tech {

	/** The crawlers worth checking for. Google-Extended governs Gemini's
	    training access; Google's indexing crawler is a separate question. */
	const AI_BOTS = array( 'GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'CCBot' );

	const UA = 'ThalloVisibilityBot/1.0 (+https://thallodigital.com/thallo-ai/scan/)';

	/**
	 * @param string $domain          Bare hostname.
	 * @param array  $citation_hosts  Third-party hosts seen citing the brand during retrieval.
	 * @param bool   $citations_known Whether retrieval ran at all.
	 * @return array{signals: array, score: int, max: int}
	 */
	public static function run( $domain, array $citation_hosts = array(), $citations_known = false ) {
		$base = 'https://' . $domain;

		$home     = self::fetch( $base . '/' );
		$insecure = null;

		/* Only worth a second request when the first failed: a site that is
		   http-only will refuse the https fetch, and we would otherwise report
		   every content check as unreachable when the real finding is "no TLS". */
		if ( ! $home['ok'] ) {
			$insecure = self::fetch( 'http://' . $domain . '/' );
		}

		$html      = $home['ok'] ? $home['body'] : ( $insecure && $insecure['ok'] ? $insecure['body'] : '' );
		$reachable = '' !== $html;

		$signals = array();

		// ── HTTPS ──────────────────────────────────────────────────────────
		$signals[] = self::signal(
			'https',
			'HTTPS enabled',
			$home['ok'] ? 'pass' : ( $reachable ? 'fail' : 'warn' ),
			5,
			$home['ok'] ? null : ( $reachable ? 'The site answered over http but not https.' : 'We could not reach the site to check.' ),
			$reachable || $home['ok']
		);

		// ── robots.txt ─────────────────────────────────────────────────────
		$robots  = self::fetch( $base . '/robots.txt' );
		$blocked = array();
		if ( $robots['ok'] ) {
			$blocked = self::blocked_bots( $robots['body'] );
			$signals[] = self::signal(
				'ai-crawlers',
				'AI crawlers allowed in robots.txt',
				$blocked ? 'fail' : 'pass',
				25,
				$blocked
					? 'Blocked: ' . implode( ', ', $blocked )
					: implode( ', ', array_slice( self::AI_BOTS, 0, 5 ) ) . ' — all allowed',
				true
			);
		} else {
			/* No robots.txt is not a failure. The default is "allowed", which is
			   the state we are checking for. */
			$signals[] = self::signal(
				'ai-crawlers',
				'AI crawlers allowed in robots.txt',
				'pass',
				25,
				'No robots.txt found, so nothing is disallowed.',
				true
			);
		}

		// ── Organization schema ────────────────────────────────────────────
		$has_org = $reachable && self::has_schema_type( $html, array( 'Organization', 'Corporation', 'LocalBusiness', 'ProfessionalService' ) );
		$signals[] = self::signal(
			'schema',
			'Organization schema markup',
			$has_org ? 'pass' : 'fail',
			15,
			$has_org ? 'JSON-LD found on the homepage.' : 'No Organization JSON-LD found on the homepage.',
			$reachable
		);

		// ── About page ─────────────────────────────────────────────────────
		$about = self::find_about( $base, $html );
		$signals[] = self::signal(
			'about',
			'About page with named people',
			$about['status'],
			10,
			$about['note'],
			$reachable
		);

		// ── Freshness ──────────────────────────────────────────────────────
		$fresh = self::freshness( $base );
		$signals[] = self::signal(
			'freshness',
			'Content published in the last 6 months',
			$fresh['status'],
			10,
			$fresh['note'],
			$fresh['known']
		);

		// ── FAQ schema ─────────────────────────────────────────────────────
		$has_faq = $reachable && self::has_schema_type( $html, array( 'FAQPage', 'QAPage' ) );
		if ( ! $has_faq && $reachable ) {
			$faq_page = self::fetch( $base . '/faq/' );
			$has_faq  = $faq_page['ok'] && self::has_schema_type( $faq_page['body'], array( 'FAQPage', 'QAPage' ) );
		}
		$signals[] = self::signal(
			'faq',
			'Structured FAQ schema',
			$has_faq ? 'pass' : 'fail',
			10,
			$has_faq ? 'FAQPage JSON-LD found.' : 'No FAQPage JSON-LD found on the homepage or /faq/.',
			$reachable
		);

		// ── Third-party citations ──────────────────────────────────────────
		$external = array_values(
			array_filter(
				array_unique( $citation_hosts ),
				static function ( $host ) use ( $domain ) {
					return $host && false === strpos( $host, $domain );
				}
			)
		);

		$signals[] = self::signal(
			'citations',
			'Cited on third-party authority sites',
			count( $external ) >= 3 ? 'pass' : ( $external ? 'warn' : 'fail' ),
			25,
			$citations_known
				? ( $external
					? count( $external ) . ' third-party ' . ( 1 === count( $external ) ? 'source' : 'sources' ) . ' cited you: ' . implode( ', ', array_slice( $external, 0, 4 ) )
					: 'No source other than your own site was cited when answering about you.' )
				: 'Not measured — live retrieval was unavailable for this scan.',
			$citations_known
		);

		// ── llms.txt, listed and not scored ────────────────────────────────
		$llms      = self::fetch( $base . '/llms.txt' );
		$signals[] = array(
			'id'     => 'llms-txt',
			'label'  => 'llms.txt file',
			'status' => $llms['ok'] ? 'pass' : 'warn',
			'weight' => 0,
			'earned' => 0,
			'note'   => 'Not scored. No major AI system is known to read it, so its absence costs nothing — it is listed because people ask.',
		);

		$score = 0;
		$max   = 0;
		foreach ( $signals as $signal ) {
			$score += $signal['earned'];
			$max   += $signal['weight'];
		}

		return array(
			'signals' => $signals,
			'score'   => $score,
			'max'     => $max,
		);
	}

	/** A warn earns half. A check we could not run earns nothing out of nothing. */
	private static function signal( $id, $label, $status, $weight, $note, $measurable = true ) {
		if ( ! $measurable ) {
			$weight = 0;
			$status = 'warn';
		}

		$earned = 'pass' === $status ? $weight : ( 'warn' === $status ? (int) round( $weight / 2 ) : 0 );

		return array(
			'id'     => $id,
			'label'  => $label,
			'status' => $status,
			'weight' => $weight,
			'earned' => $earned,
			'note'   => $note,
		);
	}

	private static function fetch( $url, $timeout = 12 ) {
		$response = wp_remote_get(
			$url,
			array(
				'timeout'     => $timeout,
				'redirection' => 3,
				'user-agent'  => self::UA,
				'headers'     => array( 'Accept' => 'text/html,application/xhtml+xml,text/plain,*/*' ),
			)
		);

		if ( is_wp_error( $response ) ) {
			return array(
				'ok'   => false,
				'code' => 0,
				'body' => '',
			);
		}

		$code = (int) wp_remote_retrieve_response_code( $response );

		return array(
			'ok'   => $code >= 200 && $code < 400,
			'code' => $code,
			// Homepages get large; nothing we look for is 400KB in.
			'body' => substr( (string) wp_remote_retrieve_body( $response ), 0, 400000 ),
		);
	}

	/**
	 * Which of the AI crawlers are disallowed at the root.
	 *
	 * robots.txt groups agents above a shared block of rules, so the file is
	 * walked as groups rather than line by line — a `Disallow: /` belongs to
	 * every `User-agent` immediately above it, not just the nearest one.
	 */
	private static function blocked_bots( $body ) {
		$lines   = preg_split( '/\r\n|\r|\n/', (string) $body );
		$blocked = array();
		$agents  = array();
		$in_rules = false;

		foreach ( $lines as $line ) {
			$line = trim( preg_replace( '/#.*$/', '', $line ) );
			if ( '' === $line || false === strpos( $line, ':' ) ) {
				continue;
			}

			list( $field, $value ) = array_map( 'trim', explode( ':', $line, 2 ) );
			$field                 = strtolower( $field );

			if ( 'user-agent' === $field ) {
				if ( $in_rules ) {
					$agents   = array();
					$in_rules = false;
				}
				$agents[] = strtolower( $value );
				continue;
			}

			if ( 'disallow' === $field ) {
				$in_rules = true;

				if ( '/' !== $value ) {
					continue;
				}

				foreach ( $agents as $agent ) {
					foreach ( self::AI_BOTS as $bot ) {
						if ( strtolower( $bot ) === $agent ) {
							$blocked[ $bot ] = true;
						}
					}
					/* A blanket `User-agent: *` with `Disallow: /` blocks every
					   one of them, and is the single most common way a site
					   disappears from AI answers without anyone noticing. */
					if ( '*' === $agent ) {
						foreach ( self::AI_BOTS as $bot ) {
							$blocked[ $bot ] = true;
						}
					}
				}
			} elseif ( 'allow' === $field ) {
				$in_rules = true;
			}
		}

		return array_keys( $blocked );
	}

	/** Looks for a @type anywhere in the JSON-LD blocks, including inside @graph. */
	private static function has_schema_type( $html, array $types ) {
		if ( ! preg_match_all( '#<script[^>]+application/ld\+json[^>]*>(.*?)</script>#is', $html, $matches ) ) {
			return false;
		}

		foreach ( $matches[1] as $block ) {
			foreach ( $types as $type ) {
				// Cheap and sufficient: a @type value is always a quoted string here.
				if ( preg_match( '/"@type"\s*:\s*(?:"' . preg_quote( $type, '/' ) . '"|\[[^\]]*"' . preg_quote( $type, '/' ) . '")/i', $block ) ) {
					return true;
				}
			}
		}

		return false;
	}

	private static function find_about( $base, $html ) {
		$candidates = array( '/about/', '/about-us/', '/company/', '/team/', '/nosotros/', '/quienes-somos/' );

		// Prefer whatever the homepage actually links to.
		if ( preg_match( '#href=["\']([^"\']*(?:about|nosotros|company|team|quienes)[^"\']*)["\']#i', $html, $m ) ) {
			array_unshift( $candidates, $m[1] );
		}

		foreach ( $candidates as $path ) {
			$url  = preg_match( '#^https?://#i', $path ) ? $path : $base . '/' . ltrim( $path, '/' );
			$page = self::fetch( $url, 10 );

			if ( ! $page['ok'] || strlen( $page['body'] ) < 500 ) {
				continue;
			}

			$named = self::has_schema_type( $page['body'], array( 'Person' ) )
				|| preg_match( '/\b(founder|co-?founder|chief executive|ceo|cto|managing director|head of|partner|fundador|director)\b/i', wp_strip_all_tags( $page['body'] ) );

			return array(
				'status' => $named ? 'pass' : 'warn',
				'note'   => $named
					? 'Found at ' . $url . ', with named roles on it.'
					: 'Found at ' . $url . ', but no named people on it.',
			);
		}

		return array(
			'status' => 'fail',
			'note'   => 'No About or team page found at the usual paths.',
		);
	}

	/**
	 * Recency, read from the sitemap because it is the only place a site states
	 * a date in a machine-readable way without us guessing at its URL scheme.
	 */
	private static function freshness( $base ) {
		$cutoff  = time() - ( 182 * DAY_IN_SECONDS );
		$sitemap = self::fetch( $base . '/sitemap.xml', 12 );

		if ( ! $sitemap['ok'] ) {
			$sitemap = self::fetch( $base . '/sitemap_index.xml', 12 );
		}

		if ( ! $sitemap['ok'] ) {
			return array(
				'status' => 'warn',
				'note'   => 'No sitemap found, so publication dates could not be read.',
				'known'  => false,
			);
		}

		if ( ! preg_match_all( '#<lastmod>\s*([^<]+?)\s*</lastmod>#i', $sitemap['body'], $matches ) ) {
			return array(
				'status' => 'warn',
				'note'   => 'The sitemap carries no <lastmod> dates, so recency could not be read.',
				'known'  => false,
			);
		}

		$latest = 0;
		foreach ( $matches[1] as $date ) {
			$time = strtotime( $date );
			if ( $time && $time > $latest ) {
				$latest = $time;
			}
		}

		if ( ! $latest ) {
			return array(
				'status' => 'warn',
				'note'   => 'The dates in the sitemap could not be read.',
				'known'  => false,
			);
		}

		return array(
			'status' => $latest >= $cutoff ? 'pass' : 'fail',
			'note'   => 'Most recent page in the sitemap: ' . gmdate( 'j M Y', $latest ) . '.',
			'known'  => true,
		);
	}
}
