<?php
/**
 * Live retrieval — the second kind of visibility.
 *
 * The three models in phase 1 answer from memory. These two read the web while
 * they answer, which measures something else entirely: not "did the industry
 * write about you enough for a model to learn your name", but "can a model find
 * and quote you right now". A brand can be strong on one and absent on the
 * other, and the fixes are opposite, which is why they are reported separately
 * rather than averaged into one number.
 *
 * Google publishes no API for the AI Overview. It is read through a
 * search-results provider (SerpApi or DataForSEO), and when none is configured
 * the result is reported as "not measured". It is never estimated. A tool whose
 * entire proposition is telling people the truth about their visibility cannot
 * have a component that guesses.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Retrieval {

	/**
	 * Perplexity, asked twice.
	 *
	 * Once about the category, to see whether the brand surfaces unprompted —
	 * the same test as phase 1, but grounded. Once about the brand itself, which
	 * is not a visibility question at all: it is how we find out who, other than
	 * the brand's own site, is writing about it. That citation list is the
	 * evidence behind the heaviest signal in the technical score.
	 *
	 * @return array{result: array, citation_hosts: string[], known: bool}
	 */
	public static function perplexity( $brand, $domain, $industry, $market = Thallo_Vis_Questions::DEFAULT_MARKET ) {
		$label   = Thallo_Vis_Questions::industry_label( $industry, $market );
		$country = Thallo_Vis_Questions::country_of( $market );

		/* Asked in the market's own language, like phase 1 — the whole point of
		   a grounded reading is that it retrieves what a real buyer's search
		   retrieves, and a Spanish-speaking buyer does not search in English. */
		switch ( Thallo_Vis_Questions::language_of( $market ) ) {
			case 'es':
				$category_q = sprintf( '¿Qué empresas de %s recomendarías? Nombra empresas concretas.', $label );
				$brand_q    = sprintf( '¿Qué es %s (%s)? ¿Quién escribe sobre ellos y qué dicen esas fuentes?', $brand, $domain );
				break;
			case 'pt':
				$category_q = sprintf( 'Que empresas de %s você recomendaria? Cite empresas específicas.', $label );
				$brand_q    = sprintf( 'O que é %s (%s)? Quem escreve sobre eles e o que essas fontes dizem?', $brand, $domain );
				break;
			default:
				$category_q = sprintf( 'Which companies would you recommend in %s? Name the specific companies.', $label );
				$brand_q    = sprintf( 'What is %s (%s)? Who writes about them, and what do those sources say?', $brand, $domain );
		}

		$job_category = Thallo_Vis_LLM::build_job(
			'perplexity',
			$category_q,
			Thallo_Vis_Questions::retrieval_prompt( 'category', $market )
				. sprintf( ' The buyer is in %s.', $country )
		);

		$job_brand = Thallo_Vis_LLM::build_job(
			'perplexity',
			$brand_q,
			Thallo_Vis_Questions::retrieval_prompt( 'brand', $market )
		);

		if ( ! $job_category || ! $job_brand ) {
			return array(
				'result'         => array(
					'provider' => 'perplexity',
					'status'   => 'unavailable',
					'detail'   => 'Not measured — no Perplexity key is configured for this installation.',
				),
				'citation_hosts' => array(),
				'known'          => false,
			);
		}

		$timeout   = (int) Thallo_Vis_Settings::get( 'request_timeout', 25 );
		$responses = Thallo_Vis_HTTP::post_many( array( $job_category, $job_brand ), $timeout );

		$category = Thallo_Vis_LLM::parse( $job_category['shape'], $responses[0] );
		$about    = Thallo_Vis_LLM::parse( $job_brand['shape'], $responses[1] );

		if ( $category['error'] && $about['error'] ) {
			return array(
				'result'         => array(
					'provider' => 'perplexity',
					'status'   => 'unavailable',
					'detail'   => 'Not measured — Perplexity did not answer (' . $category['error'] . ').',
				),
				'citation_hosts' => array(),
				'known'          => false,
			);
		}

		$brand_norm = Thallo_Vis_Analysis::normalize( $brand );

		$named_in_category = self::text_names_brand( $category['text'], $brand_norm )
			|| self::hosts_include( $category['citations'], $domain );

		$hosts = self::hosts( array_merge( $category['citations'], $about['citations'] ) );

		/* Being cited when someone asks about you by name is table stakes.
		   Being cited when they ask about the category, without your name in the
		   question, is the thing worth measuring. */
		$own_domain_cited = self::hosts_include( $about['citations'], $domain );

		if ( $named_in_category ) {
			$status = 'cited';
			$detail = sprintf(
				'Perplexity named %s when asked about the category, without being prompted with the name.',
				$brand
			);
		} elseif ( $own_domain_cited || self::text_names_brand( $about['text'], $brand_norm ) ) {
			$status = 'partial';
			$detail = sprintf(
				'Perplexity can find %s when asked about it by name, but did not reach for it when asked about the category.',
				$brand
			);
		} else {
			$status = 'absent';
			$detail = sprintf(
				'Perplexity returned nothing usable about %s, even when asked about it directly. There is little on the open web for retrieval to pull.',
				$brand
			);
		}

		return array(
			'result'         => array(
				'provider'  => 'perplexity',
				'status'    => $status,
				'detail'    => $detail,
				'citations' => array_slice( $hosts, 0, 8 ),
			),
			'citation_hosts' => $hosts,
			'known'          => true,
		);
	}

	/**
	 * Google's AI Overview, read through whichever SERP provider is configured.
	 *
	 * @return array{result: array, citation_hosts: string[]}
	 */
	public static function ai_overview( $brand, $domain, $industry, $market = Thallo_Vis_Questions::DEFAULT_MARKET ) {
		$provider = Thallo_Vis_Settings::get( 'serp_provider', 'none' );

		/* Query, language and location all come from the market rather than from
		   a global setting. Google shows a different AI Overview — frequently
		   none at all — per country and language, so a lookup performed as a US
		   English search and reported as a Colombian reading would be a finding
		   about somebody else's search results with this brand's name on it. */
		$query = Thallo_Vis_Questions::serp_query( $industry, $market );

		if ( 'serpapi' === $provider ) {
			$data = self::serpapi( $query, $market );
		} elseif ( 'dataforseo' === $provider ) {
			$data = self::dataforseo( $query, $market );
		} else {
			return array(
				'result'         => array(
					'provider' => 'ai-overview',
					'status'   => 'unavailable',
					'detail'   => 'Not measured. Google publishes no API for the AI Overview, so it is read through a search-results provider — and none is configured for this installation.',
				),
				'citation_hosts' => array(),
			);
		}

		if ( ! empty( $data['error'] ) ) {
			return array(
				'result'         => array(
					'provider' => 'ai-overview',
					'status'   => 'unavailable',
					'detail'   => 'Not measured — the search-results provider did not answer (' . $data['error'] . ').',
				),
				'citation_hosts' => array(),
			);
		}

		if ( empty( $data['present'] ) ) {
			/* No overview shown is a finding about the query, not about the
			   brand: Google does not generate one for every search, and nobody
			   is absent from something that was not there. */
			return array(
				'result'         => array(
					'provider' => 'ai-overview',
					'status'   => 'unavailable',
					'detail'   => sprintf( 'Google showed no AI Overview for “%s” at the time of the scan, so there was nothing to be present in.', $query ),
				),
				'citation_hosts' => array(),
			);
		}

		$brand_norm = Thallo_Vis_Analysis::normalize( $brand );
		$named      = self::text_names_brand( $data['text'], $brand_norm );
		$linked     = self::hosts_include( $data['links'], $domain );

		if ( $named ) {
			$status = 'cited';
			$detail = sprintf( 'Named inside the AI Overview Google shows for “%s”.', $query );
		} elseif ( $linked ) {
			$status = 'partial';
			$detail = sprintf( 'Your site is among the sources under the AI Overview for “%s”, but the answer itself does not name you.', $query );
		} else {
			$status = 'absent';
			$detail = sprintf( 'Not present in the AI Overview Google shows for “%s”, in the answer or its sources.', $query );
		}

		return array(
			'result'         => array(
				'provider'  => 'ai-overview',
				'status'    => $status,
				'detail'    => $detail,
				'citations' => array_slice( self::hosts( $data['links'] ), 0, 8 ),
			),
			'citation_hosts' => self::hosts( $data['links'] ),
		);
	}

	/**
	 * SerpApi. The overview sometimes comes back inline and sometimes as a token
	 * to fetch it with, so both paths are handled.
	 */
	private static function serpapi( $query, $market = Thallo_Vis_Questions::DEFAULT_MARKET ) {
		$key = Thallo_Vis_Settings::get( 'serpapi_key' );
		if ( '' === $key ) {
			return array( 'error' => 'no API key' );
		}

		$url = add_query_arg(
			array(
				'engine'  => 'google',
				'q'       => rawurlencode( $query ),
				'hl'      => Thallo_Vis_Questions::language_of( $market ),
				/* The country half of the market. `hl` alone sets the interface
				   language; `gl` is what decides which country's results Google
				   returns, and the AI Overview differs by both. */
				'gl'      => strtolower( substr( $market, -2 ) ),
				'api_key' => $key,
			),
			'https://serpapi.com/search.json'
		);

		$response = Thallo_Vis_HTTP::post_one( $url, array(), null, 30, 'GET' );
		$body     = json_decode( $response['body'], true );

		if ( $response['error'] || ! is_array( $body ) ) {
			return array( 'error' => $response['error'] ? $response['error'] : 'unreadable response' );
		}
		if ( isset( $body['error'] ) ) {
			return array( 'error' => (string) $body['error'] );
		}

		$overview = isset( $body['ai_overview'] ) ? $body['ai_overview'] : null;

		if ( is_array( $overview ) && ! empty( $overview['page_token'] ) && empty( $overview['text_blocks'] ) ) {
			$follow = Thallo_Vis_HTTP::post_one(
				add_query_arg(
					array(
						'engine'     => 'google_ai_overview',
						'page_token' => rawurlencode( $overview['page_token'] ),
						'api_key'    => $key,
					),
					'https://serpapi.com/search.json'
				),
				array(),
				null,
				30,
				'GET'
			);

			$followed = json_decode( $follow['body'], true );
			if ( is_array( $followed ) && isset( $followed['ai_overview'] ) ) {
				$overview = $followed['ai_overview'];
			}
		}

		if ( ! is_array( $overview ) || empty( $overview['text_blocks'] ) ) {
			return array( 'present' => false );
		}

		return array(
			'present' => true,
			'text'    => self::flatten_text_blocks( $overview['text_blocks'] ),
			'links'   => self::pluck_links( isset( $overview['references'] ) ? $overview['references'] : array() ),
		);
	}

	/** DataForSEO. The overview arrives as one item among the SERP items. */
	private static function dataforseo( $query, $market = Thallo_Vis_Questions::DEFAULT_MARKET ) {
		$login    = Thallo_Vis_Settings::get( 'dataforseo_login' );
		$password = Thallo_Vis_Settings::get( 'dataforseo_password' );

		if ( '' === $login || '' === $password ) {
			return array( 'error' => 'no credentials' );
		}

		$response = Thallo_Vis_HTTP::post_one(
			'https://api.dataforseo.com/v3/serp/google/organic/live/advanced',
			array(
				'Authorization' => 'Basic ' . base64_encode( $login . ':' . $password ),
				'Content-Type'  => 'application/json',
			),
			wp_json_encode(
				array(
					array(
						'keyword'       => $query,
						'language_code' => Thallo_Vis_Questions::language_of( $market ),
						'location_name' => Thallo_Vis_Questions::serp_location_of( $market ),
						'device'        => 'desktop',
					),
				)
			),
			40
		);

		$body = json_decode( $response['body'], true );

		if ( $response['error'] || ! is_array( $body ) ) {
			return array( 'error' => $response['error'] ? $response['error'] : 'unreadable response' );
		}
		if ( isset( $body['status_code'] ) && 20000 !== (int) $body['status_code'] ) {
			return array( 'error' => isset( $body['status_message'] ) ? (string) $body['status_message'] : 'request rejected' );
		}

		$items = isset( $body['tasks'][0]['result'][0]['items'] ) ? $body['tasks'][0]['result'][0]['items'] : array();
		$text  = '';
		$links = array();

		foreach ( (array) $items as $item ) {
			if ( ! isset( $item['type'] ) || 'ai_overview' !== $item['type'] ) {
				continue;
			}

			foreach ( (array) ( isset( $item['items'] ) ? $item['items'] : array() ) as $block ) {
				if ( isset( $block['text'] ) ) {
					$text .= ' ' . $block['text'];
				}
				foreach ( (array) ( isset( $block['references'] ) ? $block['references'] : array() ) as $reference ) {
					if ( isset( $reference['url'] ) ) {
						$links[] = $reference['url'];
					} elseif ( isset( $reference['domain'] ) ) {
						$links[] = $reference['domain'];
					}
				}
			}

			foreach ( (array) ( isset( $item['references'] ) ? $item['references'] : array() ) as $reference ) {
				if ( isset( $reference['url'] ) ) {
					$links[] = $reference['url'];
				} elseif ( isset( $reference['domain'] ) ) {
					$links[] = $reference['domain'];
				}
			}
		}

		if ( '' === trim( $text ) && ! $links ) {
			return array( 'present' => false );
		}

		return array(
			'present' => true,
			'text'    => $text,
			'links'   => $links,
		);
	}

	private static function flatten_text_blocks( $blocks ) {
		$text = '';

		foreach ( (array) $blocks as $block ) {
			if ( isset( $block['snippet'] ) ) {
				$text .= ' ' . $block['snippet'];
			}
			if ( isset( $block['title'] ) ) {
				$text .= ' ' . $block['title'];
			}
			// Lists nest their items one level down.
			if ( isset( $block['list'] ) ) {
				$text .= ' ' . self::flatten_text_blocks( $block['list'] );
			}
			if ( isset( $block['text_blocks'] ) ) {
				$text .= ' ' . self::flatten_text_blocks( $block['text_blocks'] );
			}
		}

		return $text;
	}

	private static function pluck_links( $references ) {
		$links = array();

		foreach ( (array) $references as $reference ) {
			if ( isset( $reference['link'] ) ) {
				$links[] = $reference['link'];
			} elseif ( isset( $reference['url'] ) ) {
				$links[] = $reference['url'];
			} elseif ( isset( $reference['source'] ) ) {
				$links[] = $reference['source'];
			}
		}

		return $links;
	}

	/** Bare hostnames, deduplicated, in the order first seen. */
	public static function hosts( array $urls ) {
		$out = array();

		foreach ( $urls as $url ) {
			$host = wp_parse_url( (string) $url, PHP_URL_HOST );
			if ( ! $host ) {
				// Some providers hand back a bare domain rather than a URL.
				$host = preg_replace( '#^([a-z0-9.-]+).*$#i', '$1', (string) $url );
			}
			$host = preg_replace( '/^www\./i', '', strtolower( (string) $host ) );

			if ( $host && ! in_array( $host, $out, true ) ) {
				$out[] = $host;
			}
		}

		return $out;
	}

	private static function hosts_include( array $urls, $domain ) {
		foreach ( self::hosts( $urls ) as $host ) {
			if ( false !== strpos( $host, strtolower( $domain ) ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Whether prose names the brand.
	 *
	 * Word-boundary matching on the normalised form, so "Ledger" does not match
	 * "Ledgerly" and "ledgerly's" still does. Substring matching here would
	 * report a mention for any brand whose name is a common word, which is a
	 * large share of them.
	 */
	private static function text_names_brand( $text, $brand_norm ) {
		if ( '' === $brand_norm ) {
			return false;
		}

		$haystack = ' ' . Thallo_Vis_Analysis::normalize( wp_strip_all_tags( (string) $text ) ) . ' ';

		return false !== strpos( $haystack, ' ' . $brand_norm . ' ' );
	}

	/**
	 * A 0–100 reading of live findability, from whatever actually ran. Returns
	 * −1 when nothing did, which the front end renders as a dash rather than as
	 * a zero.
	 */
	public static function score( array $results ) {
		$points = array(
			'cited'   => 100,
			'partial' => 50,
			'absent'  => 0,
		);

		$scores = array();
		foreach ( $results as $result ) {
			if ( isset( $points[ $result['status'] ] ) ) {
				$scores[] = $points[ $result['status'] ];
			}
		}

		if ( ! $scores ) {
			return -1;
		}

		return (int) round( array_sum( $scores ) / count( $scores ) );
	}
}
