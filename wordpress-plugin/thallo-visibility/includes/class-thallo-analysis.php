<?php
/**
 * Turning answers into findings.
 *
 * The hard part is deciding whether "Ledgerly Inc." in a model's list is the
 * "ledgerly.com" the visitor typed. Get it wrong in one direction and a brand is
 * told it is invisible when it was named eleven times; get it wrong in the other
 * and it is congratulated for a competitor's mentions. So the matching is
 * conservative and its rules are written down here rather than tuned by feel.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Analysis {

	/** Legal suffixes, dropped before comparing. "Ledgerly" and "Ledgerly Ltd"
	    are the same company and no model is consistent about which it prints. */
	const SUFFIXES = array(
		'inc', 'incorporated', 'llc', 'llp', 'ltd', 'limited', 'plc', 'corp', 'corporation',
		'co', 'company', 'gmbh', 'ag', 'bv', 'nv', 'sa', 'sas', 'sarl', 'srl', 'spa', 'ab',
		'oy', 'as', 'pty', 'pte', 'kk', 'sl', 'sau', 'cia', 'group', 'holdings',
	);

	public static function normalize( $name ) {
		$name = (string) $name;

		if ( function_exists( 'remove_accents' ) ) {
			$name = remove_accents( $name );
		}

		$name = strtolower( $name );
		$name = str_replace( array( '&', '+' ), ' and ', $name );
		$name = preg_replace( '/[^a-z0-9]+/', ' ', $name );
		$name = trim( preg_replace( '/\s+/', ' ', $name ) );

		if ( '' === $name ) {
			return '';
		}

		$parts = explode( ' ', $name );

		/* Put a dotted acronym back together first. The punctuation pass above
		   turns "S.A.S." into "s a s", and the suffix list never sees the "sas"
		   it knows — so "Vet Claims S.A.S." normalised to something no spelling
		   of the brand could match. Spanish-language companies are written this
		   way as a matter of course, and es-CO is the market this tool was built
		   for, so it is the common case rather than an edge one.

		   Only a trailing run is joined. The legal form goes at the end of a
		   name; a run of single letters in the middle is more likely to be
		   initials that belong to it. */
		$run = array();
		while ( count( $parts ) > 1 && 1 === strlen( end( $parts ) ) ) {
			array_unshift( $run, array_pop( $parts ) );
		}
		if ( $run ) {
			$parts[] = implode( '', $run );
		}

		// Strip trailing legal suffixes, repeatedly — "Vertex Partners Group Ltd".
		while ( count( $parts ) > 1 && in_array( end( $parts ), self::SUFFIXES, true ) ) {
			array_pop( $parts );
		}

		return implode( ' ', $parts );
	}

	/** The label part of a hostname: ledgerly.co.uk → ledgerly. */
	public static function domain_root( $domain ) {
		$domain = preg_replace( '/^www\./i', '', strtolower( (string) $domain ) );
		$parts  = explode( '.', $domain );
		return self::normalize( $parts[0] );
	}

	/**
	 * The same name with the spacing taken out.
	 *
	 * No model is consistent about whether a compound brand is one word or two.
	 * A visitor types "VetClaims", the model writes "Vet Claims", and a matcher
	 * comparing the two strings finds nothing — so the report said the brand was
	 * never named while the audit trail underneath it printed the name in every
	 * answer. That is the worst failure this tool has: not a wrong number, a
	 * number the reader can see is wrong.
	 *
	 * Used only for the whole-string comparisons below, never for the "brand
	 * plus trailing words" rule. Without spaces there are no word boundaries
	 * left, and a prefix test on "ledger" would then match "ledgerly" — the
	 * false positive the matcher exists to avoid.
	 */
	public static function despace( $name ) {
		return str_replace( ' ', '', (string) $name );
	}

	/**
	 * Is this candidate the brand we are scanning for?
	 *
	 * Exact match after normalising — spacing ignored, so "Vet Claims" and
	 * "VetClaims" are one company — or the candidate is the brand plus trailing
	 * words ("Ledgerly Payments" for "Ledgerly"). Deliberately NOT the other way
	 * round: "Ledger" would otherwise match "Ledgerly", and short brand names are
	 * exactly where a false positive is most likely and most damaging.
	 *
	 * The domain root counts too, but only when it is long enough to be
	 * distinctive — a two-letter domain would match half the market.
	 */
	public static function is_brand( $candidate, $brand_norm, $domain_root ) {
		$candidate = self::normalize( $candidate );
		if ( '' === $candidate ) {
			return false;
		}

		if ( $candidate === $brand_norm ) {
			return true;
		}

		$flat = self::despace( $candidate );

		if ( '' !== $brand_norm && $flat === self::despace( $brand_norm ) ) {
			return true;
		}

		if ( '' !== $brand_norm && 0 === strpos( $candidate, $brand_norm . ' ' ) ) {
			return true;
		}

		if ( strlen( self::despace( $domain_root ) ) >= 5 && $flat === self::despace( $domain_root ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Counts one condition: how often the brand was named across the answers.
	 *
	 * Builds the ScanPhase1 payload the front end expects, from the raw answers
	 * the runner collected.
	 *
	 * @param string $bucket Suffix on the state keys to read. '' is the memory
	 *                       reading of phase 1; '_grounded' is the same three
	 *                       models over the same questions with web search on.
	 *                       One counter rather than two, because two would be
	 *                       two definitions of "mentioned" and the pair of
	 *                       numbers is only worth printing side by side if the
	 *                       same rules produced both.
	 */
	public static function phase1( array $state, $bucket = '' ) {
		$results_key = 'results' . $bucket;
		$models_key  = 'models' . $bucket;
		$skipped_key = 'skipped' . $bucket;

		$brand_norm  = self::normalize( $state['brand'] );
		$domain_root = self::domain_root( $state['domain'] );
		$questions   = $state['questions'];

		$providers   = array();
		$mentions    = 0;
		$total       = 0;
		$positions   = array();

		foreach ( array( 'chatgpt', 'claude', 'gemini' ) as $provider ) {
			$results = isset( $state[ $results_key ][ $provider ] ) ? $state[ $results_key ][ $provider ] : array();

			if ( isset( $state[ $skipped_key ][ $provider ] ) ) {
				$providers[] = array(
					'provider'  => $provider,
					'model'     => '',
					'mentions'  => 0,
					'positions' => array(),
					'answers'   => array(),
					'error'     => $state[ $skipped_key ][ $provider ],
				);
				continue;
			}

			$answers        = array();
			$hits           = 0;
			$provider_ranks = array();
			$errors         = 0;
			$answered_by    = array();

			foreach ( $questions as $i => $unused ) {
				$result = isset( $results[ $i ] ) ? $results[ $i ] : null;

				if ( ! $result || ! empty( $result['error'] ) ) {
					++$errors;
					continue;
				}

				/* Tallied rather than taken from the last answer: a router can
				   serve one call from one model and the next from another, and an
				   id printed on a report should be the one that produced most of
				   it. Scans that ran before this was recorded carry no `model`
				   key and simply contribute nothing here. */
				if ( ! empty( $result['model'] ) ) {
					$key                 = (string) $result['model'];
					$answered_by[ $key ] = isset( $answered_by[ $key ] ) ? $answered_by[ $key ] + 1 : 1;
				}

				$position = null;
				$rank     = 0;
				foreach ( $result['companies'] as $company ) {
					++$rank;
					if ( self::is_brand( $company, $brand_norm, $domain_root ) ) {
						$position = $rank;
						break;
					}
				}

				if ( null !== $position ) {
					++$hits;
					$provider_ranks[] = $position;
					$positions[]      = $position;
				}

				$answers[] = array(
					'q'         => (int) $i,
					'mentioned' => null !== $position,
					'position'  => $position,
					'names'     => array_slice( $result['companies'], 0, 8 ),
				);
			}

			/* Every question failed, so we did not measure this model at all. A
			   zero here would read as "not recommended", which is a finding we
			   have no evidence for. */
			if ( count( $answers ) === 0 ) {
				/* Carry the first real error up rather than the count of them.
				   "Every request failed" tells the person reading the report
				   that something broke and nothing about what — which is a
				   diagnosis they then cannot make, and neither can we. The
				   underlying message is usually the whole answer: a rejected
				   parameter, an expired key, a model id that no longer serves. */
				$detail = '';
				foreach ( $results as $result ) {
					if ( ! empty( $result['error'] ) ) {
						$detail = (string) $result['error'];
						break;
					}
				}

				$providers[] = array(
					'provider'  => $provider,
					'model'     => isset( $state[ $models_key ][ $provider ] ) ? $state[ $models_key ][ $provider ] : '',
					'mentions'  => 0,
					'positions' => array(),
					'answers'   => array(),
					'error'     => $errors
						? ( '' !== $detail ? 'every request failed — ' . $detail : 'every request failed' )
						: 'not run',
				);
				continue;
			}

			$mentions += $hits;
			$total    += count( $answers );

			$requested = isset( $state[ $models_key ][ $provider ] ) ? $state[ $models_key ][ $provider ] : '';
			$used      = '';
			if ( $answered_by ) {
				arsort( $answered_by );
				$used = (string) array_key_first( $answered_by );
			}

			$row = array(
				'provider'  => $provider,
				'model'     => $requested,
				'mentions'  => $hits,
				'positions' => $provider_ranks,
				'answers'   => $answers,
			);

			/* Only when it disagrees with what we asked for. An alias resolving
			   to its own dated snapshot is the id doing its job and does not need
			   saying; a different model answering does, because the column is
			   labelled with an assistant's name and that label is part of the
			   finding. */
			if ( '' !== $used && false === Thallo_Vis_LLM::same_model( $requested, $used ) ) {
				$row['modelUsed'] = $used;
			}

			$providers[] = $row;
		}

		return array(
			'scanId'       => $state['scan_id'],
			'brand'        => $state['brand'],
			'domain'       => $state['domain'],
			'industry'     => $state['industry'],
			'market'       => isset( $state['market'] ) ? $state['market'] : Thallo_Vis_Questions::DEFAULT_MARKET,
			'scannedAt'    => $state['created_at'],
			'questions'    => $questions,
			'providers'    => $providers,
			'totalAnswers' => $total,
			'mentions'     => $mentions,
			'sovPct'       => $total > 0 ? (int) round( ( $mentions / $total ) * 100 ) : 0,
			'avgPosition'  => $positions ? round( array_sum( $positions ) / count( $positions ), 1 ) : null,
		);
	}

	/**
	 * Everyone else the models named, tallied.
	 *
	 * Names are grouped on their normalised form but displayed in the surface
	 * form the models used most often, so the list reads the way a person would
	 * write it rather than as lowercase slugs.
	 */
	public static function competitors( array $state, $limit = 8 ) {
		$brand_norm  = self::normalize( $state['brand'] );
		$domain_root = self::domain_root( $state['domain'] );
		$tally       = array();

		foreach ( array( 'chatgpt', 'claude', 'gemini' ) as $provider ) {
			$results = isset( $state['results'][ $provider ] ) ? $state['results'][ $provider ] : array();

			foreach ( $results as $result ) {
				if ( ! empty( $result['error'] ) || empty( $result['companies'] ) ) {
					continue;
				}

				/* Deduplicated within a single answer: a model that says
				   "Stripe … or Stripe Connect" has named one company once as far
				   as share of voice is concerned. */
				$seen = array();

				foreach ( $result['companies'] as $company ) {
					/* Grouped on the despaced form for the same reason the brand
					   is matched on it: one model writes "Checkout.com", another
					   "Checkout com", and two spellings of one rival split its
					   mentions in half and drop it down the list. */
					$key = self::despace( self::normalize( $company ) );

					if ( '' === $key || isset( $seen[ $key ] ) ) {
						continue;
					}
					if ( self::is_brand( $company, $brand_norm, $domain_root ) ) {
						continue;
					}

					$seen[ $key ] = true;

					if ( ! isset( $tally[ $key ] ) ) {
						$tally[ $key ] = array(
							'labels'    => array(),
							'mentions'  => 0,
							'providers' => array(),
						);
					}

					++$tally[ $key ]['mentions'];
					$label = trim( $company );
					$tally[ $key ]['labels'][ $label ] = isset( $tally[ $key ]['labels'][ $label ] )
						? $tally[ $key ]['labels'][ $label ] + 1
						: 1;
					$tally[ $key ]['providers'][ $provider ] = true;
				}
			}
		}

		uasort(
			$tally,
			static function ( $a, $b ) {
				return $b['mentions'] <=> $a['mentions'];
			}
		);

		$out = array();
		foreach ( array_slice( $tally, 0, $limit, true ) as $entry ) {
			arsort( $entry['labels'] );
			$out[] = array(
				'name'      => (string) array_key_first( $entry['labels'] ),
				'mentions'  => (int) $entry['mentions'],
				'providers' => array_keys( $entry['providers'] ),
			);
		}

		return $out;
	}

	public static function grade_for( $score ) {
		if ( $score >= 80 ) {
			return 'A';
		}
		if ( $score >= 65 ) {
			return 'B';
		}
		if ( $score >= 50 ) {
			return 'C';
		}
		if ( $score >= 30 ) {
			return 'D';
		}
		return 'F';
	}

	/** Each failed signal maps to the action that fixes it. Titles are written as
	    instructions — a signal label describes the healthy state, which reads
	    backwards once it is the thing that failed. */
	public static function remedies() {
		return array(
			'ai-crawlers' => array(
				'title'  => 'Unblock the AI crawlers in robots.txt',
				'detail' => 'Your robots.txt is blocking the crawlers these models read the web with. Nothing else on this list matters until it is unblocked.',
			),
			'schema'      => array(
				'title'  => 'Add Organization schema markup',
				'detail' => 'Structured data lets a model resolve who you are, what you sell and where, instead of inferring it from prose.',
			),
			'about'       => array(
				'title'  => 'Put named, credentialed people on the About page',
				'detail' => 'Anonymous companies are hard for a model to vouch for. Real names with real credentials are the fix.',
			),
			'freshness'   => array(
				'title'  => 'Publish on the questions buyers actually ask',
				'detail' => 'A site with nothing recent gives retrieval nothing current to pull, however good the older pages are.',
			),
			'faq'         => array(
				'title'  => 'Mark up your FAQ with structured data',
				'detail' => 'A marked-up answer can be lifted into a response whole; a paragraph gets paraphrased away or skipped.',
			),
			'citations'   => array(
				'title'  => 'Earn citations on third-party authority sites',
				'detail' => 'Get named in the roundups and category comparisons these models retrieve. Highest leverage on this list, and the slowest to move.',
			),
			'https'       => array(
				'title'  => 'Serve the site over HTTPS',
				'detail' => 'Several crawlers will not index an insecure origin at all, which makes every other signal unreadable.',
			),
			'default'     => array(
				'title'  => 'Deepen category coverage',
				'detail' => 'Publish the comparison and category pages buyers ask about, structured so a model can quote them directly.',
			),
		);
	}

	/**
	 * The plan, ordered by what the scan found: heaviest unmet technical signal
	 * first, then whichever of the two structural problems the answers point at.
	 */
	public static function actions( array $signals, array $phase1, array $competitors ) {
		$remedies = self::remedies();

		$gaps = array_values(
			array_filter(
				$signals,
				static function ( $s ) {
					return $s['weight'] > 0 && 'pass' !== $s['status'];
				}
			)
		);

		usort(
			$gaps,
			static function ( $a, $b ) {
				return $b['weight'] <=> $a['weight'];
			}
		);

		$actions = array();
		$used    = array();

		foreach ( array_slice( $gaps, 0, 2 ) as $gap ) {
			$remedy    = isset( $remedies[ $gap['id'] ] ) ? $remedies[ $gap['id'] ] : $remedies['default'];
			$used[]    = $gap['id'];
			$actions[] = array(
				'title'    => $remedy['title'],
				'detail'   => $remedy['detail'],
				'impact'   => $gap['weight'] >= 20 ? 4 : ( $gap['weight'] >= 10 ? 3 : 2 ),
				'priority' => $gap['weight'] >= 15 ? 'high' : 'medium',
			);
		}

		/* Absent everywhere is a different problem from present-but-buried, and
		   the advice for one is wrong for the other. */
		if ( 0 === $phase1['mentions'] ) {
			if ( ! in_array( 'citations', $used, true ) ) {
				$actions[] = array(
					'title'    => $remedies['citations']['title'],
					'detail'   => $remedies['citations']['detail'],
					'impact'   => 4,
					'priority' => 'high',
				);
			}
			$actions[] = array(
				'title'    => 'Make the entity unambiguous',
				'detail'   => 'One consistent name, description and category across your own site, Wikidata, LinkedIn and the directories your industry actually uses. A model cannot recommend a company it cannot resolve.',
				'impact'   => 3,
				'priority' => 'high',
			);
		} elseif ( null !== $phase1['avgPosition'] && $phase1['avgPosition'] > 3 ) {
			$rival     = isset( $competitors[0]['name'] ) ? $competitors[0]['name'] : 'the category leader';
			$actions[] = array(
				'title'    => 'Publish the comparison pages you are being ranked below',
				'detail'   => sprintf(
					'You are named but listed behind others, %s among them. Head-to-head comparison and alternatives pages are what models quote when they order a list.',
					$rival
				),
				'impact'   => 3,
				'priority' => 'high',
			);
		} else {
			$actions[] = array(
				'title'    => 'Hold the position with fresh category coverage',
				'detail'   => 'You are being named near the top. That erodes quietly as rivals publish; a steady cadence on the questions buyers ask is what keeps it.',
				'impact'   => 2,
				'priority' => 'medium',
			);
		}

		return array_slice( $actions, 0, 4 );
	}

	/** Written from the rows, never from the score — so the prose cannot tell
	    someone they are invisible while the table above shows two models naming
	    them. */
	public static function key_insight( array $phase1, array $signals, array $retrieval ) {
		$brand     = $phase1['brand'];
		$measured  = array_filter(
			$phase1['providers'],
			static function ( $p ) {
				return empty( $p['error'] );
			}
		);
		$named     = array_filter(
			$measured,
			static function ( $p ) {
				return $p['mentions'] > 0;
			}
		);
		$blocked   = false;
		foreach ( $signals as $signal ) {
			if ( 'ai-crawlers' === $signal['id'] && 'fail' === $signal['status'] ) {
				$blocked = true;
			}
		}

		$retrievable = false;
		foreach ( $retrieval as $r ) {
			if ( in_array( $r['status'], array( 'cited', 'partial' ), true ) ) {
				$retrievable = true;
			}
		}

		if ( empty( $measured ) ) {
			return 'No model could be reached for this scan, so there is no finding to report. Check the API keys in the plugin settings and run it again.';
		}

		if ( $blocked ) {
			return sprintf(
				'%s is blocking the crawlers these models read the web with. Whatever else is true of the content, that single line in robots.txt caps everything below it — it is the first thing to fix.',
				$brand
			);
		}

		if ( empty( $named ) ) {
			return sprintf(
				'No model named %s in any of the %d answers. %s',
				$brand,
				$phase1['totalAnswers'],
				$retrievable
					? 'It is findable through live search, though — so the content exists and nobody authoritative is citing it. That is a citation problem, not a website one.'
					: 'It is absent from live retrieval too, so there is nothing for a model to find in the moment or to have learned earlier. This starts with being written about somewhere other than your own site.'
			);
		}

		if ( count( $named ) === count( $measured ) ) {
			return null !== $phase1['avgPosition'] && $phase1['avgPosition'] > 3
				? sprintf(
					'%s is named by every model tested, but at an average rank of %s. The gap is ranking, not recognition — the models know you and are still reaching for someone else first.',
					$brand,
					$phase1['avgPosition']
				)
				: sprintf(
					'%s is named by every model tested and near the top of the list. This is a position to defend rather than build: it erodes as rivals publish.',
					$brand
				);
		}

		return sprintf(
			'%s is recognised by some models and absent from others. Uneven coverage almost always means the citations exist but are concentrated in too few sources for every model to have picked them up.',
			$brand
		);
	}
}
