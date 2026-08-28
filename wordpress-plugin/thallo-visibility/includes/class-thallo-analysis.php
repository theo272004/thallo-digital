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
		$domain = self::clean_host( $domain );
		$parts  = explode( '.', $domain );
		return self::normalize( $parts[0] );
	}

	/**
	 * Whatever was handed over, reduced to a bare host.
	 *
	 * The visitor's own domain arrives already cleaned by the REST layer, but
	 * the entity check compares it against a string a *model* wrote — and a
	 * model asked for "their website" returns `https://example.com/about` about
	 * as often as `example.com`. Split on dots without this, that becomes the
	 * label `https`, and every model that answered with a URL would be reported
	 * as having resolved the brand to a different company. A false accusation is
	 * the one failure this panel cannot have.
	 */
	public static function clean_host( $value ) {
		$value = strtolower( trim( (string) $value ) );
		$value = preg_replace( '#^[a-z][a-z0-9+.-]*://#', '', $value );
		$value = preg_replace( '#^www\.#', '', $value );
		$value = preg_replace( '#[/?\#].*$#', '', $value );

		return trim( $value, ". \t\n\r" );
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
			'crawlable-text' => array(
				'title'  => 'Serve your content in the HTML, not from JavaScript',
				'detail' => 'The crawlers these models read the web with do not run JavaScript, so a page assembled in the browser reaches them blank. Server-render the pages that describe what you do, or pre-render them at build time.',
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
	 * The plan, ordered by what the scan found.
	 *
	 * It used to open with the two heaviest failed technical signals and treat
	 * the answers as a postscript. Those checks no longer run — see the note in
	 * the runner's `phase2_steps()` — so `$signals` arrives empty and the plan is
	 * built entirely from what the models said. That is the right way round: a
	 * plan whose first two rows were "add Organization schema" and "mark up your
	 * FAQ" was answering a question nobody asked, on a report about what the
	 * models recommend.
	 *
	 * `$state` is optional so the old three-argument call still works. With it,
	 * the plan can name the sources the brand is missing from and read the gap
	 * between the two readings, which are the two findings a person can actually
	 * act on this week.
	 */
	public static function actions( array $signals, array $phase1, array $competitors, array $state = array() ) {
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

		/* ── The findings that outrank everything ────────────────────────────
		 *
		 * A model answering "who is this company" with somebody else's website
		 * is not a ranking problem and no amount of publishing fixes it. It goes
		 * first whenever it happens. */
		$entity = isset( $state['phase2']['entity'] ) && is_array( $state['phase2']['entity'] ) ? $state['phase2']['entity'] : array();

		foreach ( $entity as $row ) {
			if ( isset( $row['verdict'] ) && 'mismatch' === $row['verdict'] ) {
				$actions[] = array(
					'title'    => 'Claim your own name before anything else',
					'detail'   => sprintf(
						/* translators: 1: model name, 2: the website the model named instead. */
						__( '%1$s answers a question about you by describing a different company at %2$s. Until the name resolves to you, every other line on this list is being credited to somebody else. One consistent name, description and website across your own site, Wikidata, LinkedIn and the directories your industry uses.', 'thallo-visibility' ),
						isset( $row['provider'] ) ? ucfirst( $row['provider'] ) : __( 'A model', 'thallo-visibility' ),
						isset( $row['claimedDomain'] ) ? $row['claimedDomain'] : __( 'another site', 'thallo-visibility' )
					),
					'impact'   => 4,
					'priority' => 'high',
				);
				$used[] = 'entity-mismatch';
				break;
			}
		}

		/* The sources the models actually opened, and whether the brand is in
		   any of them. This is the most actionable row the scan produces: it
		   names specific websites rather than a category of work. */
		$sources = isset( $state['phase2']['sources'] ) ? $state['phase2']['sources'] : array();
		$missing = array();

		foreach ( $sources as $source ) {
			if ( empty( $source['own'] ) && empty( $source['brand'] ) && ! empty( $source['host'] ) ) {
				$missing[] = $source['host'];
			}
		}

		if ( count( $missing ) > 0 ) {
			$actions[] = array(
				'title'    => sprintf(
					/* translators: %d: how many third-party sites the models read. */
					_n(
						'Get named on the %d website the models read for this category',
						'Get named on the %d websites the models read for this category',
						count( $missing ),
						'thallo-visibility'
					),
					count( $missing )
				),
				'detail'   => sprintf(
					/* translators: %s: a comma-separated list of hostnames. */
					__( 'These are the pages the models opened before answering, and you are not on any of them: %s. This is the shortest route between the two figures at the top of this report — the models cannot recommend what the sources they read do not mention.', 'thallo-visibility' ),
					implode( ', ', array_slice( $missing, 0, 4 ) )
				),
				'impact'   => 4,
				'priority' => 'high',
			);
			$used[] = 'citations';
		}

		/* The gap between the two readings, which is a different instruction in
		   each direction and was previously left entirely to the key insight. */
		$grounded_pct = isset( $state['phase2']['grounded']['sovPct'] ) ? (int) $state['phase2']['grounded']['sovPct'] : null;

		if ( null !== $grounded_pct ) {
			$gap = $grounded_pct - (int) $phase1['sovPct'];

			if ( $gap >= 20 ) {
				$actions[] = array(
					'title'    => __( 'Turn what searching finds into what the model remembers', 'thallo-visibility' ),
					'detail'   => __( 'The models find you when they look and do not recall you when they do not. That is a young footprint: the pages exist but nothing durable has been written about you. Sustained third-party coverage — reviews, comparisons, category roundups — is what moves the reading that does not depend on a search.', 'thallo-visibility' ),
					'impact'   => 3,
					'priority' => 'medium',
				);
			} elseif ( $gap <= -20 ) {
				$actions[] = array(
					'title'    => __( 'Your reputation is ahead of your pages — close the gap', 'thallo-visibility' ),
					'detail'   => __( 'The models know you but stop recommending you once they search, which means the pages being retrieved today are not yours and do not mention you. Publish the comparison and category pages buyers ask for, and make sure the roundups that rank in your category are current.', 'thallo-visibility' ),
					'impact'   => 3,
					'priority' => 'high',
				);
			}
		}

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

	// -----------------------------------------------------------------------
	// Where the answers were read from
	// -----------------------------------------------------------------------

	/**
	 * The pages the searching models actually opened, grouped by host, crossed
	 * against the companies each of those answers went on to name.
	 *
	 * ## Why this is the panel worth having
	 *
	 * Every other figure in this report tells somebody where they stand. This
	 * one tells them where the ground is. When a model searches before it
	 * answers, the sources it opened are the shortest available description of
	 * what earns a recommendation in that category — and unlike a share of
	 * answer, it names things a person can go and do something about: get into
	 * that roundup, get reviewed on that directory, get quoted in that trade
	 * publication.
	 *
	 * It is also the part a reader cannot reconstruct on their own in an
	 * afternoon, which is the honest test of whether a free report is worth
	 * anybody's email address.
	 *
	 * ## The rules, and why each one is there
	 *
	 * **Two appearances minimum.** A host cited once is a model following a link;
	 * cited twice across different answers it is part of how the category is
	 * read. Everything below the threshold is noise that makes the table longer
	 * and less true.
	 *
	 * **The brand's own domain is kept and flagged, not dropped.** "Every source
	 * that mentioned you was your own website" is one of the strongest findings
	 * this report can produce, and dropping the row would delete it.
	 *
	 * **Names come from the same answer, not from the whole run.** A host is
	 * credited with a company only when the answer that opened it named that
	 * company. Crediting from the run as a whole would put every leader against
	 * every source and turn a finding into a matrix of ticks.
	 */
	public static function sources( array $state, $limit = 8 ) {
		if ( empty( $state['results_grounded'] ) ) {
			return array();
		}

		$brand_norm  = self::normalize( $state['brand'] );
		$domain_root = self::domain_root( $state['domain'] );
		$own_host    = self::clean_host( $state['domain'] );

		$hosts = array();

		foreach ( array( 'chatgpt', 'claude', 'gemini' ) as $provider ) {
			$results = isset( $state['results_grounded'][ $provider ] ) ? $state['results_grounded'][ $provider ] : array();

			foreach ( $results as $result ) {
				if ( ! empty( $result['error'] ) || empty( $result['citations'] ) ) {
					continue;
				}

				/* De-duplicated within one answer: a model that opens four pages
				   of the same directory has consulted that directory once, and
				   counting it four times would put it on top of a table it does
				   not belong on top of. */
				$seen = array();

				foreach ( $result['citations'] as $url ) {
					$host = self::clean_host( $url );
					if ( '' === $host || false === strpos( $host, '.' ) || isset( $seen[ $host ] ) ) {
						continue;
					}
					$seen[ $host ] = true;

					if ( ! isset( $hosts[ $host ] ) ) {
						$hosts[ $host ] = array(
							'host'  => $host,
							'times' => 0,
							'own'   => $host === $own_host || self::domain_root( $host ) === $domain_root,
							'names' => array(),
							'brand' => false,
						);
					}

					++$hosts[ $host ]['times'];

					foreach ( (array) $result['companies'] as $company ) {
						if ( self::is_brand( $company, $brand_norm, $domain_root ) ) {
							$hosts[ $host ]['brand'] = true;
							continue;
						}

						$key = self::normalize( $company );
						if ( '' === $key ) {
							continue;
						}

						if ( ! isset( $hosts[ $host ]['names'][ $key ] ) ) {
							$hosts[ $host ]['names'][ $key ] = array(
								'label' => trim( $company ),
								'count' => 0,
							);
						}
						++$hosts[ $host ]['names'][ $key ]['count'];
					}
				}
			}
		}

		$out = array();

		foreach ( $hosts as $row ) {
			/* A host seen once is a model following a link. Twice, across
			   different answers, it is part of how the category gets read. The
			   brand's own site is exempt — being read from your own domain three
			   times and once are the same finding, and dropping the row would
			   delete the sentence the panel exists to make. */
			if ( $row['times'] < 2 && ! $row['own'] ) {
				continue;
			}

			$names = array_values( $row['names'] );
			usort(
				$names,
				static function ( $a, $b ) {
					return $b['count'] === $a['count']
						? strcmp( $a['label'], $b['label'] )
						: $b['count'] - $a['count'];
				}
			);

			$out[] = array(
				'host'  => $row['host'],
				'times' => (int) $row['times'],
				'own'   => (bool) $row['own'],
				'brand' => (bool) $row['brand'],
				'names' => array_slice( array_column( $names, 'label' ), 0, 4 ),
			);
		}

		/* Most-read first, with the brand's own domain last however often it was
		   opened. The panel is about what carries the category, and a company's
		   own website at the top of that table reads as reassurance when the
		   finding underneath it is usually the opposite. */
		usort(
			$out,
			static function ( $a, $b ) {
				if ( $a['own'] !== $b['own'] ) {
					return $a['own'] ? 1 : -1;
				}
				return $b['times'] === $a['times'] ? strcmp( $a['host'], $b['host'] ) : $b['times'] - $a['times'];
			}
		);

		return array_slice( $out, 0, $limit );
	}

	// -----------------------------------------------------------------------
	// Entity accuracy
	// -----------------------------------------------------------------------

	/**
	 * What each model said when asked, by name, what this company is — and which
	 * of four things that answer actually was.
	 *
	 * ## Why this is classified here and not by another model
	 *
	 * Judging an answer with a second call would double the cost of the check and
	 * replace a fact with an opinion. Every branch below is a comparison against
	 * something we already hold: whether the model admitted it did not know,
	 * whether the website it named is the one being scanned, whether it could
	 * state a customer. A reader can check each of those for themselves, which is
	 * the whole standard this report is held to.
	 *
	 * ## The four verdicts
	 *
	 *   `unknown`  — the model said it does not recognise the name. This is the
	 *                honest zero, and it is a different finding from the next one.
	 *   `mismatch` — the model named a website that is not yours. It has resolved
	 *                your name to somebody else's company, and a buyer asking
	 *                about you is being shown them. The domain it named is kept
	 *                and printed, because the finding is only worth anything if
	 *                the reader can see the evidence.
	 *   `partial`  — it knows the company and cannot say who the company is for.
	 *                Common, and the reason a recommendation has nothing to
	 *                attach to: a model that cannot state a buyer cannot match
	 *                you to one.
	 *   `resolved` — it knows what you do and who you do it for.
	 *
	 * A model that volunteers doubt (`certain: false`) is capped at `partial`
	 * however complete its answer looks. Confidence is only ever read downwards:
	 * a model claiming certainty tells us nothing, a model admitting doubt tells
	 * us something.
	 */
	public static function entity_verdict( array $answer, $domain ) {
		if ( ! empty( $answer['error'] ) ) {
			return 'unavailable';
		}

		if ( empty( $answer['known'] ) ) {
			return 'unknown';
		}

		$what   = trim( (string) ( isset( $answer['what'] ) ? $answer['what'] : '' ) );
		$serves = trim( (string) ( isset( $answer['serves'] ) ? $answer['serves'] : '' ) );

		/* Claimed to know it and then described nothing. Treated as not knowing
		   rather than as a partial, because there is no content to be partial
		   about — this is a model saying yes to the first field out of habit. */
		if ( '' === $what ) {
			return 'unknown';
		}

		/* The wrong-company case. Checked on the registrable root so that
		   `www.example.com`, `example.com/about` and `EXAMPLE.COM` all agree, and
		   only when the model actually named a site — an empty domain is a model
		   that did not know the website, which is not the same as naming the
		   wrong one and must not be reported as though it were. */
		$claimed = self::domain_root( (string) ( isset( $answer['domain'] ) ? $answer['domain'] : '' ) );
		if ( '' !== $claimed && $claimed !== self::domain_root( $domain ) ) {
			return 'mismatch';
		}

		if ( '' === $serves || ! empty( $answer['uncertain'] ) ) {
			return 'partial';
		}

		return 'resolved';
	}

	/**
	 * One row per model, in the order the report prints them.
	 *
	 * Providers that were skipped or errored appear as `unavailable` rather than
	 * being dropped. "We could not ask Claude" and "Claude does not know you" are
	 * different findings and only one of them is about the visitor — the same
	 * rule the share-of-answer table has always followed.
	 */
	public static function entity( array $state ) {
		$out    = array();
		$domain = isset( $state['domain'] ) ? $state['domain'] : '';

		foreach ( array( 'chatgpt', 'claude', 'gemini' ) as $provider ) {
			$answer = isset( $state['entity'][ $provider ] ) ? $state['entity'][ $provider ] : null;

			if ( ! is_array( $answer ) ) {
				continue;
			}

			$row = array(
				'provider' => $provider,
				'model'    => isset( $state['models'][ $provider ] ) ? $state['models'][ $provider ] : '',
				'verdict'  => self::entity_verdict( $answer, $domain ),
				'what'     => mb_substr( trim( (string) ( isset( $answer['what'] ) ? $answer['what'] : '' ) ), 0, 300 ),
				'serves'   => mb_substr( trim( (string) ( isset( $answer['serves'] ) ? $answer['serves'] : '' ) ), 0, 300 ),
			);

			/* Printed whole — `example.com`, not the `example` the matcher
			   compares on — because this is the evidence for the accusation and
			   a reader has to be able to open it. */
			if ( 'mismatch' === $row['verdict'] ) {
				$row['claimedDomain'] = self::clean_host( (string) $answer['domain'] );
			}

			if ( ! empty( $answer['error'] ) ) {
				$row['error'] = (string) $answer['error'];
			}

			$out[] = $row;
		}

		return $out;
	}

	/**
	 * The sentence under the entity panel.
	 *
	 * Counted from the rows rather than written per case, because the interesting
	 * combinations are more numerous than anybody would enumerate by hand and a
	 * prose template that does not match the table above it is exactly the fault
	 * this report cannot afford.
	 */
	public static function entity_reading( array $rows, $brand ) {
		$measured = array_values(
			array_filter(
				$rows,
				static function ( $row ) {
					return 'unavailable' !== $row['verdict'];
				}
			)
		);

		if ( ! $measured ) {
			return '';
		}

		$count = static function ( $verdict ) use ( $measured ) {
			return count(
				array_filter(
					$measured,
					static function ( $row ) use ( $verdict ) {
						return $verdict === $row['verdict'];
					}
				)
			);
		};

		$total    = count( $measured );
		$mismatch = $count( 'mismatch' );
		$unknown  = $count( 'unknown' );
		$partial  = $count( 'partial' );
		$resolved = $count( 'resolved' );

		/* Ordered by what the reader should act on first, not by how many models
		   voted for it. One model handing a buyer a different company under your
		   name outranks two models describing you correctly. */
		if ( $mismatch > 0 ) {
			return sprintf(
				/* translators: 1: how many models, 2: how many were asked, 3: the brand. */
				_n(
					'%1$d model out of %2$d resolves the name %3$s to a different company. A buyer who asks about you by name is being shown somebody else, and no amount of ranking work fixes that — until the entity resolves to you everywhere, a recommendation has nothing to attach to.',
					'%1$d models out of %2$d resolve the name %3$s to a different company. A buyer who asks about you by name is being shown somebody else, and no amount of ranking work fixes that — until the entity resolves to you everywhere, a recommendation has nothing to attach to.',
					$mismatch,
					'thallo-visibility'
				),
				$mismatch,
				$total,
				$brand
			);
		}

		if ( $unknown === $total ) {
			return sprintf(
				/* translators: 1: the brand, 2: how many models were asked. */
				__( 'None of the %2$d models recognises %1$s by name. That is the honest starting point rather than a verdict on the company: a model can only know what it has read somewhere other than your own site.', 'thallo-visibility' ),
				$brand,
				$total
			);
		}

		if ( $resolved === $total ) {
			return sprintf(
				/* translators: %s: the brand. */
				__( 'Every model knows what %s does and who it is for. The entity is solid, which means the share-of-answer figures above are about ranking rather than about recognition — a different problem, and a more tractable one.', 'thallo-visibility' ),
				$brand
			);
		}

		if ( $partial > 0 && 0 === $resolved ) {
			return sprintf(
				/* translators: 1: how many models, 2: the brand. */
				_n(
					'%1$d model knows %2$s exists and cannot say who it is for. A model that cannot state your buyer cannot match you to one, which is how a company ends up known and still never recommended.',
					'%1$d models know %2$s exists and cannot say who it is for. A model that cannot state your buyer cannot match you to one, which is how a company ends up known and still never recommended.',
					$partial,
					'thallo-visibility'
				),
				$partial,
				$brand
			);
		}

		return sprintf(
			/* translators: 1: the brand, 2: how many models describe it correctly, 3: how many were asked. */
			__( '%1$s resolves correctly in %2$d of %3$d models. Uneven recognition usually means the sources that describe you exist but are too few for every model to have read them.', 'thallo-visibility' ),
			$brand,
			$resolved,
			$total
		);
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
