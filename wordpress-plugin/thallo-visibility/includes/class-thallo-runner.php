<?php
/**
 * The job.
 *
 * A scan is a queue of small pieces of work and a record of what has come back.
 * `start()` builds the queue, each `tick()` drains a few items from it, and the
 * whole session is returned every time so the client only ever has to render
 * what it was handed.
 *
 * The reason for the shape is boring and non-negotiable: forty-five calls to
 * other people's servers will not fit inside one PHP request on shared hosting.
 * The pleasant side effect is that the progress bar the visitor watches is
 * reporting real work — when Gemini is slow, the Gemini row is what spins.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Runner {

	const MEMORY_PROVIDERS = array( 'chatgpt', 'claude', 'gemini' );

	const STEP_LABELS = array(
		'chatgpt'    => 'ChatGPT',
		'claude'     => 'Claude',
		'gemini'     => 'Gemini',
		'perplexity' => 'Perplexity',
		'ai-overview' => 'Google AI Overview',
		'technical'  => 'Website & technical signals',
	);

	// -----------------------------------------------------------------------
	// Starting
	// -----------------------------------------------------------------------

	public static function start( $brand, $domain, $industry ) {
		$count     = (int) Thallo_Vis_Settings::get( 'questions', 15 );
		$questions = Thallo_Vis_Questions::build( $industry, $count );
		$demo      = Thallo_Vis_Settings::is_demo();
		$scan_id   = Thallo_Vis_DB::new_scan_id();

		$queue   = array();
		$models  = array();
		$skipped = array();

		foreach ( self::MEMORY_PROVIDERS as $provider ) {
			if ( ! $demo && ! Thallo_Vis_Settings::has_model( $provider ) ) {
				/* Recorded as skipped rather than queued, so the report can say
				   "not measured" instead of showing a zero. "We could not ask"
				   and "you were not named" are different findings and only one
				   of them is about the visitor. */
				$skipped[ $provider ] = 'no API key configured';
				continue;
			}

			$models[ $provider ] = self::model_id( $provider, $demo );

			foreach ( array_keys( $questions ) as $index ) {
				$queue[] = array(
					'p' => $provider,
					'q' => $index,
				);
			}
		}

		$state = array(
			'scan_id'        => $scan_id,
			'brand'          => $brand,
			'domain'         => $domain,
			'industry'       => $industry,
			'created_at'     => gmdate( 'c' ),
			'questions'      => $questions,
			'models'         => $models,
			'skipped'        => $skipped,
			'queue'          => $queue,
			'results'        => array(),
			'phase'          => 1,
			'phase2_queue'   => array(),
			'phase2_done'    => array(),
			'citation_hosts' => array(),
			'retrieval'      => array(),
			'demo'           => $demo,
		);

		if ( ! Thallo_Vis_DB::create( $scan_id, $brand, $domain, $industry, $state ) ) {
			return new WP_Error( 'scan_not_created', __( 'The scan could not be started. Please try again.', 'thallo-visibility' ), array( 'status' => 500 ) );
		}

		return self::session( $state, 'running' );
	}

	private static function model_id( $provider, $demo ) {
		if ( $demo ) {
			return 'sample data';
		}

		return 'openrouter' === Thallo_Vis_Settings::get( 'provider_mode' )
			? Thallo_Vis_Settings::get( 'or_model_' . $provider, '' )
			: Thallo_Vis_Settings::get( 'nv_model_' . $provider, '' );
	}

	// -----------------------------------------------------------------------
	// Ticking
	// -----------------------------------------------------------------------

	public static function tick( $scan_id ) {
		$row = Thallo_Vis_DB::get( $scan_id );
		if ( ! $row ) {
			return new WP_Error( 'scan_not_found', __( 'That scan no longer exists. Please run a new one.', 'thallo-visibility' ), array( 'status' => 404 ) );
		}

		$state = $row['state'];

		if ( 1 === (int) $state['phase'] ) {
			return self::tick_phase1( $state );
		}

		return self::tick_phase2( $state );
	}

	private static function tick_phase1( array $state ) {
		if ( empty( $state['queue'] ) ) {
			return self::finish_phase1( $state );
		}

		$batch_size = max( 1, (int) Thallo_Vis_Settings::get( 'jobs_per_tick', 5 ) );

		/* One provider per tick. Mixing providers in a batch would make the
		   progress rows advance together, which is both less legible and a lie
		   about how the work is actually being done. */
		$provider = $state['queue'][0]['p'];
		$batch    = array();

		foreach ( $state['queue'] as $position => $item ) {
			if ( $item['p'] !== $provider ) {
				break;
			}
			$batch[ $position ] = $item;
			if ( count( $batch ) >= $batch_size ) {
				break;
			}
		}

		if ( ! empty( $state['demo'] ) ) {
			foreach ( $batch as $position => $item ) {
				$state['results'][ $item['p'] ][ $item['q'] ] = self::demo_answer( $state, $item['p'], $item['q'] );
				unset( $state['queue'][ $position ] );
			}
			$state['queue'] = array_values( $state['queue'] );

			Thallo_Vis_DB::save_state( $state['scan_id'], $state );
			return self::session( $state, empty( $state['queue'] ) ? null : 'running' );
		}

		$jobs  = array();
		$shape = 'openai';

		foreach ( $batch as $position => $item ) {
			$job = Thallo_Vis_LLM::build_job( $item['p'], $state['questions'][ $item['q'] ] );

			if ( ! $job ) {
				// The key was removed between starting and ticking.
				$state['results'][ $item['p'] ][ $item['q'] ] = array(
					'companies' => array(),
					'error'     => 'no API key configured',
				);
				unset( $state['queue'][ $position ] );
				continue;
			}

			$shape            = $job['shape'];
			$jobs[ $position ] = $job;
		}

		if ( $jobs ) {
			$timeout   = (int) Thallo_Vis_Settings::get( 'request_timeout', 25 );
			$responses = Thallo_Vis_HTTP::post_many( array_values( $jobs ), $timeout );
			$positions = array_keys( $jobs );

			foreach ( $positions as $offset => $position ) {
				$item   = $state['queue'][ $position ];
				$parsed = Thallo_Vis_LLM::parse( $shape, $responses[ $offset ] );

				$state['results'][ $item['p'] ][ $item['q'] ] = array(
					'companies' => $parsed['companies'],
					'error'     => $parsed['error'],
				);

				unset( $state['queue'][ $position ] );
			}
		}

		$state['queue'] = array_values( $state['queue'] );

		if ( empty( $state['queue'] ) ) {
			return self::finish_phase1( $state );
		}

		Thallo_Vis_DB::save_state( $state['scan_id'], $state );
		return self::session( $state, 'running' );
	}

	private static function finish_phase1( array $state ) {
		$state['phase1'] = Thallo_Vis_Analysis::phase1( $state );

		/* Every provider failed. Reporting a 0% share of voice here would be a
		   fabrication — we did not measure anything — so the scan fails loudly
		   instead. */
		if ( 0 === (int) $state['phase1']['totalAnswers'] ) {
			$state['error'] = __( 'No AI model could be reached for this scan. This is a problem at our end, not yours — please try again shortly.', 'thallo-visibility' );
			Thallo_Vis_DB::save_state( $state['scan_id'], $state, 'failed' );
			return self::session( $state, 'failed' );
		}

		Thallo_Vis_DB::save_state( $state['scan_id'], $state, 'awaiting-email' );
		return self::session( $state, 'awaiting-email' );
	}

	// -----------------------------------------------------------------------
	// Unlocking
	// -----------------------------------------------------------------------

	public static function unlock( $scan_id, $email ) {
		$row = Thallo_Vis_DB::get( $scan_id );
		if ( ! $row ) {
			return new WP_Error( 'scan_not_found', __( 'That scan no longer exists. Please run a new one.', 'thallo-visibility' ), array( 'status' => 404 ) );
		}

		$state = $row['state'];

		if ( empty( $state['phase1'] ) ) {
			return new WP_Error( 'scan_incomplete', __( 'The first half of the scan has not finished yet.', 'thallo-visibility' ), array( 'status' => 409 ) );
		}

		// Already unlocked — hand back what we have rather than charging for it twice.
		if ( (int) $state['phase'] > 1 ) {
			return self::session( $state, 'complete' === $row['status'] ? 'complete' : 'unlocking' );
		}

		$state['phase']        = 2;
		$state['phase2_queue'] = array( 'perplexity', 'ai-overview', 'technical' );
		$state['email']        = $email;

		Thallo_Vis_Leads::record( $state, $email );
		Thallo_Vis_DB::save_state( $scan_id, $state, 'unlocking', $email );

		return self::session( $state, 'unlocking' );
	}

	private static function tick_phase2( array $state ) {
		if ( empty( $state['phase2_queue'] ) ) {
			return self::finish_phase2( $state );
		}

		$step = array_shift( $state['phase2_queue'] );

		switch ( $step ) {
			case 'perplexity':
				if ( ! empty( $state['demo'] ) ) {
					/* 'unavailable', not a status. Nothing was retrieved, so any
					   verdict here would be a finding about the visitor's brand
					   with nothing behind it. */
					$state['retrieval'][]     = array(
						'provider' => 'perplexity',
						'status'   => 'unavailable',
						'detail'   => 'Sample data — no Perplexity key is connected, so live retrieval was not run.',
					);
					$state['citation_hosts'] = array( 'example-review-site.com', 'techdirectory.example' );
					break;
				}

				$run                      = Thallo_Vis_Retrieval::perplexity( $state['brand'], $state['domain'], $state['industry'] );
				$state['retrieval'][]     = $run['result'];
				$state['citation_hosts']  = array_values( array_unique( array_merge( $state['citation_hosts'], $run['citation_hosts'] ) ) );
				$state['citations_known'] = $run['known'];
				break;

			case 'ai-overview':
				if ( ! empty( $state['demo'] ) ) {
					$state['retrieval'][] = array(
						'provider' => 'ai-overview',
						'status'   => 'unavailable',
						'detail'   => 'Sample data — no search-results provider is connected, so the AI Overview was not read.',
					);
					break;
				}

				$run                     = Thallo_Vis_Retrieval::ai_overview( $state['brand'], $state['domain'], $state['industry'] );
				$state['retrieval'][]    = $run['result'];
				$state['citation_hosts'] = array_values( array_unique( array_merge( $state['citation_hosts'], $run['citation_hosts'] ) ) );
				break;

			case 'technical':
				if ( ! empty( $state['demo'] ) ) {
					$state['tech'] = self::demo_tech();
					break;
				}

				$state['tech'] = Thallo_Vis_Tech::run(
					$state['domain'],
					$state['citation_hosts'],
					! empty( $state['citations_known'] )
				);
				break;
		}

		$state['phase2_done'][] = $step;

		if ( empty( $state['phase2_queue'] ) ) {
			return self::finish_phase2( $state );
		}

		Thallo_Vis_DB::save_state( $state['scan_id'], $state, 'unlocking' );
		return self::session( $state, 'unlocking' );
	}

	private static function finish_phase2( array $state ) {
		$phase1      = $state['phase1'];
		$signals     = isset( $state['tech']['signals'] ) ? $state['tech']['signals'] : array();
		$tech_score  = isset( $state['tech']['score'] ) ? (int) $state['tech']['score'] : 0;
		$tech_max    = isset( $state['tech']['max'] ) ? (int) $state['tech']['max'] : 0;
		$competitors = Thallo_Vis_Analysis::competitors( $state );
		$retrieval   = $state['retrieval'];
		$serp_score  = Thallo_Vis_Retrieval::score( $retrieval );

		/* The grade averages only the components that were actually measured.
		   Folding an unmeasured retrieval score in as a zero would hand someone a
		   worse grade because we could not afford a SERP subscription. */
		$parts = array( $phase1['sovPct'] );
		if ( $tech_max > 0 ) {
			$parts[] = (int) round( ( $tech_score / $tech_max ) * 100 );
		}
		if ( $serp_score >= 0 ) {
			$parts[] = $serp_score;
		}

		$combined = (int) round( array_sum( $parts ) / count( $parts ) );

		$state['phase2'] = array(
			'competitors' => $competitors,
			'retrieval'   => $retrieval,
			'signals'     => $signals,
			'techScore'   => $tech_score,
			'serpScore'   => $serp_score,
			'grade'       => Thallo_Vis_Analysis::grade_for( $combined ),
			'keyInsight'  => Thallo_Vis_Analysis::key_insight( $phase1, $signals, $retrieval ),
			'actions'     => Thallo_Vis_Analysis::actions( $signals, $phase1, $competitors ),
		);

		Thallo_Vis_DB::save_state( $state['scan_id'], $state, 'complete' );
		Thallo_Vis_Leads::after_complete( $state );

		return self::session( $state, 'complete' );
	}

	// -----------------------------------------------------------------------
	// Serialising
	// -----------------------------------------------------------------------

	/** Reads a stored scan back without advancing it. */
	public static function read( $scan_id ) {
		$row = Thallo_Vis_DB::get( $scan_id );
		if ( ! $row ) {
			return new WP_Error( 'scan_not_found', __( 'That scan no longer exists.', 'thallo-visibility' ), array( 'status' => 404 ) );
		}

		return self::session( $row['state'], $row['status'] );
	}

	/** The ScanSession the front end renders. */
	public static function session( array $state, $status = null ) {
		if ( null === $status ) {
			$status = empty( $state['queue'] ) ? 'awaiting-email' : 'running';
		}

		$session = array(
			'scanId' => $state['scan_id'],
			'status' => $status,
			'demo'   => ! empty( $state['demo'] ),
			'steps'  => self::steps( $state, $status ),
		);

		if ( ! empty( $state['phase1'] ) ) {
			$session['phase1'] = $state['phase1'];
		}
		if ( ! empty( $state['phase2'] ) ) {
			$session['phase2'] = $state['phase2'];
		}
		if ( ! empty( $state['error'] ) ) {
			$session['error'] = $state['error'];
		}

		return $session;
	}

	private static function steps( array $state, $status ) {
		$total   = count( $state['questions'] );
		$steps   = array();
		$pending = array();

		foreach ( $state['queue'] as $item ) {
			$pending[ $item['p'] ] = isset( $pending[ $item['p'] ] ) ? $pending[ $item['p'] ] + 1 : 1;
		}

		// The provider currently being worked through, so only one row spins.
		$current = isset( $state['queue'][0]['p'] ) ? $state['queue'][0]['p'] : null;

		foreach ( self::MEMORY_PROVIDERS as $provider ) {
			if ( isset( $state['skipped'][ $provider ] ) ) {
				$steps[] = array(
					'id'     => $provider,
					'label'  => self::STEP_LABELS[ $provider ],
					'phase'  => 1,
					'state'  => 'skipped',
					'detail' => $state['skipped'][ $provider ],
				);
				continue;
			}

			$left = isset( $pending[ $provider ] ) ? $pending[ $provider ] : 0;
			$done = $total - $left;

			if ( 0 === $left ) {
				$state_name = 'done';
				$detail     = $total . ' asked';
			} elseif ( $provider === $current ) {
				$state_name = 'running';
				$detail     = $done . ' of ' . $total;
			} else {
				$state_name = 'queued';
				$detail     = '';
			}

			$steps[] = array(
				'id'     => $provider,
				'label'  => self::STEP_LABELS[ $provider ],
				'phase'  => 1,
				'state'  => $state_name,
				'detail' => $detail,
			);
		}

		$locked = (int) $state['phase'] < 2;

		foreach ( array( 'perplexity', 'ai-overview', 'technical' ) as $id ) {
			if ( $locked ) {
				$steps[] = array(
					'id'     => $id,
					'label'  => self::STEP_LABELS[ $id ],
					'phase'  => 2,
					'state'  => 'locked',
					'detail' => 'Locked',
				);
				continue;
			}

			if ( in_array( $id, $state['phase2_done'], true ) ) {
				$steps[] = array(
					'id'     => $id,
					'label'  => self::STEP_LABELS[ $id ],
					'phase'  => 2,
					'state'  => 'done',
					'detail' => 'checked',
				);
				continue;
			}

			$running = isset( $state['phase2_queue'][0] ) && $state['phase2_queue'][0] === $id && 'unlocking' === $status;

			$steps[] = array(
				'id'     => $id,
				'label'  => self::STEP_LABELS[ $id ],
				'phase'  => 2,
				'state'  => $running ? 'running' : 'queued',
				'detail' => $running ? 'working…' : '',
			);
		}

		return $steps;
	}

	// -----------------------------------------------------------------------
	// Sample data
	// -----------------------------------------------------------------------

	/**
	 * Used when no key is configured, or when demo mode is switched on to show
	 * the tool without spending anything. Every response carrying it also sets
	 * `demo: true`, and the front end shows an unmissable banner as long as it
	 * does. Numbers a visitor cannot tell apart from a measurement are the one
	 * thing this tool must never ship.
	 */
	private static function demo_answer( array $state, $provider, $question_index ) {
		$rivals = array( 'Northwind', 'Sable & Co', 'Lumen Group', 'Vertex Partners', 'Arbor Systems', 'Kestrel Labs' );
		$seed   = crc32( $state['brand'] . $provider . $question_index );

		$companies = array_slice( $rivals, $seed % 3, 4 );

		// Roughly a third of answers name the brand, at a varying rank.
		if ( 0 === $seed % 3 ) {
			array_splice( $companies, $seed % 4, 0, array( $state['brand'] ) );
		}

		return array(
			'companies' => array_values( $companies ),
			'error'     => '',
		);
	}

	private static function demo_tech() {
		$signals = array(
			array( 'id' => 'https', 'label' => 'HTTPS enabled', 'status' => 'pass', 'weight' => 5, 'earned' => 5, 'note' => 'Sample data.' ),
			array( 'id' => 'ai-crawlers', 'label' => 'AI crawlers allowed in robots.txt', 'status' => 'pass', 'weight' => 25, 'earned' => 25, 'note' => 'Sample data.' ),
			array( 'id' => 'schema', 'label' => 'Organization schema markup', 'status' => 'fail', 'weight' => 15, 'earned' => 0, 'note' => 'Sample data.' ),
			array( 'id' => 'about', 'label' => 'About page with named people', 'status' => 'warn', 'weight' => 10, 'earned' => 5, 'note' => 'Sample data.' ),
			array( 'id' => 'freshness', 'label' => 'Content published in the last 6 months', 'status' => 'fail', 'weight' => 10, 'earned' => 0, 'note' => 'Sample data.' ),
			array( 'id' => 'faq', 'label' => 'Structured FAQ schema', 'status' => 'fail', 'weight' => 10, 'earned' => 0, 'note' => 'Sample data.' ),
			array( 'id' => 'citations', 'label' => 'Cited on third-party authority sites', 'status' => 'warn', 'weight' => 25, 'earned' => 13, 'note' => 'Sample data.' ),
			array( 'id' => 'llms-txt', 'label' => 'llms.txt file', 'status' => 'warn', 'weight' => 0, 'earned' => 0, 'note' => 'Not scored.' ),
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
}
