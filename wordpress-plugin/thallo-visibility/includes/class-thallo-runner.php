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
		'grounded'   => 'The same three, searching the web',
		'perplexity' => 'Perplexity',
		'ai-overview' => 'Google AI Overview',
		'technical'  => 'Website & technical signals',
	);

	// -----------------------------------------------------------------------
	// Starting
	// -----------------------------------------------------------------------

	/**
	 * @param string $source 'visitor' for somebody on the site, 'monitor' for a
	 *                       scheduled re-run. It decides whether the email gate
	 *                       creates a lead — a monitored brand already handed
	 *                       theirs over, and a duplicate row every week would
	 *                       turn the leads table into a log.
	 */
	/**
	 * @param string $email When the address is collected before the scan runs
	 *                      rather than between the halves. The whole report is
	 *                      then one job: phase 1 rolls into phase 2 without
	 *                      stopping to ask, because there is nothing left to
	 *                      ask for. Empty keeps the two-step flow, where the
	 *                      free half stands alone and the rest is unlocked.
	 */
	public static function start( $brand, $domain, $industry, $market = Thallo_Vis_Questions::DEFAULT_MARKET, $source = 'visitor', array $prompts = array(), $email = '' ) {
		$count = (int) Thallo_Vis_Settings::get( 'questions', 15 );

		/* Written by the visitor when the setup screen sent them; the generated
		   set otherwise. Either way the list is fixed here, stored on the scan,
		   and printed verbatim in the audit trail — what a monitor re-runs next
		   week is what it ran this week, which is the only thing that makes two
		   scans of the same brand comparable. */
		$questions = $prompts
			? array_slice( $prompts, 0, $count )
			: Thallo_Vis_Questions::build( $industry, $count, $market );
		$demo      = Thallo_Vis_Settings::is_demo();
		$scan_id   = Thallo_Vis_DB::new_scan_id();

		$queue   = array();
		$models  = array();
		$skipped = array();

		/* Once per model id per week, here rather than per call: what a model
		   accepts decides what goes in the body, and finding that out mid-scan
		   would mean the fifth question was asked differently from the first. A
		   lookup that fails changes nothing — the answer stays unknown, and
		   unknown means the optional parameter is left out. */
		if ( ! $demo ) {
			$wanted = array();
			foreach ( self::MEMORY_PROVIDERS as $provider ) {
				$wanted[] = Thallo_Vis_Settings::model_for( $provider );
				$wanted[] = Thallo_Vis_Settings::model_for( $provider, 'grounded' );
			}
			Thallo_Vis_Models::learn( $wanted );
		}

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
			'market'         => $market,
			'source'         => $source,
			'created_at'     => gmdate( 'c' ),
			'questions'      => $questions,
			'models'         => $models,
			'skipped'        => $skipped,
			'queue'           => $queue,
			'results'         => array(),
			'phase'           => 1,
			/* The grounded reading is the same three models over these same
			   questions with search on. It is built at unlock rather than here,
			   because it only ever runs behind the email and because the setting
			   that decides whether it runs at all can change while a scan sits
			   waiting for an address. */
			'results_grounded' => array(),
			'models_grounded'  => array(),
			'skipped_grounded' => array(),
			'grounded_queue'   => array(),
			'phase2_queue'    => array(),
			'phase2_done'     => array(),
			'citation_hosts' => array(),
			'retrieval'      => array(),
			'demo'           => $demo,
			/* Held rather than acted on. The lead is recorded when phase 1
			   finishes, so the row carries the numbers it was collected for —
			   an address banked against a scan that then failed is a contact
			   with nothing to say to them. */
			'email'          => $email,
		);

		if ( ! Thallo_Vis_DB::create( $scan_id, $brand, $domain, $industry, $state ) ) {
			return new WP_Error( 'scan_not_created', __( 'The scan could not be started. Please try again.', 'thallo-visibility' ), array( 'status' => 500 ) );
		}

		return self::session( $state, 'running' );
	}

	/**
	 * The market a stored scan was started in.
	 *
	 * Scans created before markets existed have no `market` key in their state,
	 * and one of them can still be mid-flight when this code deploys. They were
	 * asked in English, so that is what they fall back to — reading the key
	 * directly would make every one of them fatal on its next tick.
	 */
	private static function market_of( array $state ) {
		return isset( $state['market'] ) && Thallo_Vis_Questions::is_market( $state['market'] )
			? $state['market']
			: Thallo_Vis_Questions::DEFAULT_MARKET;
	}

	private static function model_id( $provider, $demo ) {
		return $demo ? 'sample data' : Thallo_Vis_Settings::model_for( $provider );
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

			/* Through finish_phase1(), exactly as the live path below does.
			   This used to return the session directly once the queue emptied,
			   which skipped the only place the report is built and the only
			   place the row is marked done: the response said "awaiting-email"
			   while the stored scan still said "running" and carried no report
			   at all. A second branch that thinks it can finish a job is a
			   second branch that has to remember everything finishing means. */
			if ( empty( $state['queue'] ) ) {
				return self::finish_phase1( $state );
			}

			Thallo_Vis_DB::save_state( $state['scan_id'], $state );
			return self::session( $state, 'running' );
		}

		$jobs  = array();
		$shape = 'openai';

		/* Built once per tick rather than per job: it is the same string for
		   every question in the batch, and it is what carries the market — the
		   language the question is in is only half the measurement, the other
		   half is telling the model who is asking. */
		$system = Thallo_Vis_Questions::system_prompt( self::market_of( $state ) );

		foreach ( $batch as $position => $item ) {
			$job = Thallo_Vis_LLM::build_job( $item['p'], $state['questions'][ $item['q'] ], $system );

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
					/* Which model the API says answered, kept per answer rather
					   than per provider. The id we asked for is a setting; this
					   is evidence, and the two coming apart is the fault worth
					   surfacing — a report is only reproducible if the model
					   named on it is the one that produced the numbers. */
					'model'     => $parsed['model'],
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

		/* Recorded here rather than at the end of phase 2, so that a visitor who
		   never hands over an email still leaves a point behind. The free half is
		   a real measurement; a series with a hole in it every time somebody
		   declined to pay would be a worse record than no series at all. Phase 2
		   updates the same row with the grade if it ever runs. */
		Thallo_Vis_DB::record_history( $state, isset( $state['source'] ) ? $state['source'] : 'visitor' );

		/* The address was given before the scan started, so there is nothing to
		   wait for: the second half opens itself and the visitor watches one
		   continuous job rather than being stopped halfway and asked. */
		if ( ! empty( $state['email'] ) ) {
			return self::begin_phase2( $state, $state['email'] );
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

		return self::begin_phase2( $state, $email );
	}

	/**
	 * Opens the second half. Reached two ways — from unlock(), when the address
	 * was traded for the rest of the report, and straight out of finish_phase1()
	 * when it was collected before the scan ran. One function rather than two
	 * paths, because everything opening phase 2 means has to happen either way
	 * and a second copy is a second place to forget one of them.
	 */
	private static function begin_phase2( array $state, $email ) {
		$state['phase'] = 2;
		$state['email'] = $email;

		/* Built here, with the settings as they are now. A visitor who left the
		   tab open overnight gets the grounded half if it was switched on in the
		   meantime, and does not get charged for it if it was switched off. */
		$grounded_queue    = array();
		$models_grounded   = array();
		$skipped_grounded  = array();
		$demo              = ! empty( $state['demo'] );

		foreach ( self::MEMORY_PROVIDERS as $provider ) {
			if ( ! $demo && ! Thallo_Vis_Settings::has_grounded_model( $provider ) ) {
				$skipped_grounded[ $provider ] = Thallo_Vis_Settings::get( 'grounded_enabled' )
					? 'no search-capable model configured'
					: 'the grounded reading is switched off for this installation';
				continue;
			}

			$models_grounded[ $provider ] = $demo
				? 'sample data'
				: Thallo_Vis_Settings::model_for( $provider, 'grounded' ) . ':online';

			/* The first N, not a sample of them: the audit trail prints the
			   questions in order and a reader comparing the two halves should be
			   able to see, question by question, which ones were asked twice. */
			$grounded_count = min(
				count( $state['questions'] ),
				max( 1, (int) Thallo_Vis_Settings::get( 'grounded_questions', 8 ) )
			);

			foreach ( array_slice( array_keys( $state['questions'] ), 0, $grounded_count ) as $index ) {
				$grounded_queue[] = array(
					'p' => $provider,
					'q' => $index,
				);
			}
		}

		$state['models_grounded']  = $models_grounded;
		$state['skipped_grounded'] = $skipped_grounded;
		$state['grounded_queue']   = $grounded_queue;
		/* How many calls this half is actually going to make, recorded where the
		   queue is built. The progress row worked it out as models × every
		   question — but this half asks only the first `grounded_questions` of
		   them, so with more questions than that it opened at "30 of 45" before
		   a call had gone out and finished claiming forty-five answers behind
		   fifteen. A count of work done should be read off the work. */
		$state['grounded_total']   = count( $grounded_queue );

		/* 'grounded' leads, and only when there is something to ask. It is the
		   expensive step and the one the visitor is waiting on, so it runs while
		   they are still watching rather than after the cheap checks. */
		$state['phase2_queue'] = self::phase2_steps( $grounded_queue ? true : false );

		/* A scheduled re-run opens phase 2 with an address that is already in
		   the leads table — it is where the monitor got it. Recording it again
		   every week would turn a list of people into a list of weeks. */
		if ( 'monitor' !== ( isset( $state['source'] ) ? $state['source'] : 'visitor' ) ) {
			Thallo_Vis_Leads::record( $state, $email );
		}
		Thallo_Vis_DB::save_state( $state['scan_id'], $state, 'unlocking', $email );

		return self::session( $state, 'unlocking' );
	}

	/**
	 * The second half's steps, in order.
	 *
	 * The AI Overview drops out entirely when no search-results provider is
	 * configured. It used to run anyway and report "not measured", which is the
	 * wording reserved for something we tried and could not read — this was
	 * never attempted. A permanent grey row on every report that no setting on
	 * this screen can turn green reads as a broken product rather than as an
	 * honest omission. Configure a provider and it comes back.
	 */
	private static function phase2_steps( $with_grounded ) {
		$steps = $with_grounded ? array( 'grounded', 'perplexity' ) : array( 'perplexity' );

		if ( 'none' !== Thallo_Vis_Settings::get( 'serp_provider', 'none' ) ) {
			$steps[] = 'ai-overview';
		}

		$steps[] = 'technical';

		return $steps;
	}

	private static function tick_phase2( array $state ) {
		if ( empty( $state['phase2_queue'] ) ) {
			return self::finish_phase2( $state );
		}

		$step = array_shift( $state['phase2_queue'] );

		/* Forty-five calls, so it cannot be a step in the sense the others are:
		   it drains a batch and puts itself back at the front of the queue until
		   there is nothing left. Same reason phase 1 ticks — no shared host will
		   hold a request open that long — and the same happy side effect, which
		   is that the row the visitor is watching reports real work. */
		if ( 'grounded' === $step ) {
			$state = self::tick_grounded( $state );

			if ( ! empty( $state['grounded_queue'] ) ) {
				array_unshift( $state['phase2_queue'], 'grounded' );
				Thallo_Vis_DB::save_state( $state['scan_id'], $state, 'unlocking' );
				return self::session( $state, 'unlocking' );
			}

			$state['phase2_done'][] = 'grounded';

			if ( empty( $state['phase2_queue'] ) ) {
				return self::finish_phase2( $state );
			}

			Thallo_Vis_DB::save_state( $state['scan_id'], $state, 'unlocking' );
			return self::session( $state, 'unlocking' );
		}

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

				$run                      = Thallo_Vis_Retrieval::perplexity( $state['brand'], $state['domain'], $state['industry'], self::market_of( $state ) );
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

				$run                     = Thallo_Vis_Retrieval::ai_overview( $state['brand'], $state['domain'], $state['industry'], self::market_of( $state ) );
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

	/**
	 * One batch of the grounded reading. Mirrors tick_phase1() deliberately —
	 * same batching, same one-provider-per-tick rule, same treatment of a
	 * missing job — because the two readings are only comparable if the work
	 * behind them was done the same way.
	 */
	private static function tick_grounded( array $state ) {
		if ( empty( $state['grounded_queue'] ) ) {
			return $state;
		}

		$batch_size = max( 1, (int) Thallo_Vis_Settings::get( 'jobs_per_tick', 5 ) );
		$provider   = $state['grounded_queue'][0]['p'];
		$batch      = array();

		foreach ( $state['grounded_queue'] as $position => $item ) {
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
				$state['results_grounded'][ $item['p'] ][ $item['q'] ] = self::demo_answer( $state, $item['p'], $item['q'] );
				unset( $state['grounded_queue'][ $position ] );
			}
			$state['grounded_queue'] = array_values( $state['grounded_queue'] );
			return $state;
		}

		/* The same system prompt as phase 1. The only difference between the two
		   readings is whether the model may look things up — change the wording
		   as well and the comparison stops being a comparison. */
		$system = Thallo_Vis_Questions::system_prompt( self::market_of( $state ) );
		$jobs   = array();
		$shape  = 'openai';

		foreach ( $batch as $position => $item ) {
			$job = Thallo_Vis_LLM::build_job( $item['p'], $state['questions'][ $item['q'] ], $system, true );

			if ( ! $job ) {
				$state['results_grounded'][ $item['p'] ][ $item['q'] ] = array(
					'companies' => array(),
					'error'     => 'no search-capable model configured',
				);
				unset( $state['grounded_queue'][ $position ] );
				continue;
			}

			$shape             = $job['shape'];
			$jobs[ $position ] = $job;
		}

		if ( $jobs ) {
			/* Searching takes longer than answering from memory, and a timeout
			   here is charged for and thrown away. The floor is generous for the
			   same reason the batch is small. */
			$timeout   = max( 45, (int) Thallo_Vis_Settings::get( 'request_timeout', 25 ) );
			$responses = Thallo_Vis_HTTP::post_many( array_values( $jobs ), $timeout );
			$positions = array_keys( $jobs );

			foreach ( $positions as $offset => $position ) {
				$item   = $state['grounded_queue'][ $position ];
				$parsed = Thallo_Vis_LLM::parse( $shape, $responses[ $offset ] );

				/* `citations` is kept, and this is the only place it can be.
				   The searching call returns the pages the model read on its way
				   to the answer — `Thallo_Vis_LLM::parse` has normalised
				   OpenRouter's `citations` and OpenAI's `annotations` onto one
				   list for some time — and until now the runner read that list
				   and threw it away, so the report could say a model
				   recommended somebody else and never say what it had read to
				   get there. It is the evidence under every other number in the
				   report, and it costs nothing: it arrives in the response we
				   have already paid for. */
				$state['results_grounded'][ $item['p'] ][ $item['q'] ] = array(
					'companies' => $parsed['companies'],
					'error'     => $parsed['error'],
					'model'     => $parsed['model'],
					'citations' => isset( $parsed['citations'] ) ? $parsed['citations'] : array(),
				);

				unset( $state['grounded_queue'][ $position ] );
			}
		}

		$state['grounded_queue'] = array_values( $state['grounded_queue'] );

		return $state;
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
			'history'     => array(),
		);

		/* Only when it actually ran. An installation with the grounded reading
		   switched off should show no section rather than a section saying it
		   was not measured — "not measured" is for something we tried to read
		   and could not, and this was never attempted. */
		if ( ! empty( $state['models_grounded'] ) ) {
			$state['phase2']['grounded'] = Thallo_Vis_Analysis::phase1( $state, '_grounded' );
		}

		/* Deliberately kept out of the grade. The grade already averages the
		   memory reading, the technical score and retrieval; folding a second
		   share-of-voice in would weight "are you named" twice against one
		   reading of everything else, and would move the grade for a reason the
		   person reading it could not see. It is a comparison, not a component. */

		/* Written before it is read, so the grade lands on today's row and the
		   series the report renders includes the run being reported. A chart that
		   stopped one point short of the number printed above it would read as a
		   bug in the chart. In demo mode nothing was written, so nothing comes
		   back and the report falls through to the sample series. */
		Thallo_Vis_DB::record_history( $state, isset( $state['source'] ) ? $state['source'] : 'visitor' );
		$state['phase2']['history'] = empty( $state['demo'] )
			? Thallo_Vis_DB::history_for( $state['domain'], self::market_of( $state ) )
			: self::demo_history( $phase1 );

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

		/* Shown only once it is real. Before the unlock we do not yet know
		   whether it will run — the setting is read at unlock — and a locked row
		   promising a reading that never arrives is worse than no row. */
		/* A scan already in flight when this deployed has no `grounded_total`,
		   and models × questions is what it was being counted by, so that is
		   what it keeps being counted by rather than dividing by zero. */
		$grounded_total = isset( $state['grounded_total'] )
			? (int) $state['grounded_total']
			: ( isset( $state['models_grounded'] ) ? count( $state['models_grounded'] ) * $total : 0 );

		if ( ! $locked && $grounded_total > 0 ) {
			$left = isset( $state['grounded_queue'] ) ? count( $state['grounded_queue'] ) : 0;
			$done = $grounded_total - $left;

			if ( 0 === $left ) {
				$grounded_state  = 'done';
				$grounded_detail = $grounded_total . ' asked with search on';
			} else {
				$grounded_state  = 'running';
				$grounded_detail = $done . ' of ' . $grounded_total;
			}

			$steps[] = array(
				'id'     => 'grounded',
				'label'  => self::STEP_LABELS['grounded'],
				'phase'  => 2,
				'state'  => $grounded_state,
				'detail' => $grounded_detail,
			);
		}

		/* Same list the queue was built from, minus the grounded row, which is
		   rendered above with its own progress count. A step the run will never
		   perform must not appear as a row waiting to be performed. */
		$phase2_ids = array_values( array_diff( self::phase2_steps( false ), array( 'grounded' ) ) );

		foreach ( $phase2_ids as $id ) {
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

	/**
	 * A sample series, so the trend is visible before any brand has a second run.
	 *
	 * Nothing was written to the history table for a demo scan — see
	 * `Thallo_Vis_DB::record_history()`, which refuses — so this is assembled for
	 * the response and thrown away. It only ever travels with `demo: true` and
	 * the banner that comes with it.
	 *
	 * It walks backwards from the figure the rest of the demo already reported,
	 * and it does not always climb. A sample chart that goes up and to the right
	 * every time is a sales mock, and this tool does not ship those.
	 */
	private static function demo_history( array $phase1 ) {
		$out  = array();
		$seed = crc32( $phase1['brand'] . $phase1['domain'] );

		for ( $weeks_ago = 4; $weeks_ago >= 0; $weeks_ago-- ) {
			$drift = ( ( $seed >> ( $weeks_ago * 3 ) ) % 11 ) - 5;
			$value = 0 === $weeks_ago
				? (int) $phase1['sovPct']
				: max( 0, min( 100, (int) $phase1['sovPct'] - ( $drift * $weeks_ago ) ) );

			$out[] = array(
				'date'        => gmdate( 'Y-m-d', time() - ( $weeks_ago * 7 * DAY_IN_SECONDS ) ),
				'sovPct'      => $value,
				'avgPosition' => $phase1['avgPosition'],
			);
		}

		return $out;
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
