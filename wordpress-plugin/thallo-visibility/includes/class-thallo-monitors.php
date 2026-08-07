<?php
/**
 * Monitoring — the same scan, run again on a schedule.
 *
 * ## Why this exists
 *
 * A scan tells a brand where it stands on the day it was run. That is worth
 * something in a sales conversation exactly once. What a client pays a retainer
 * for is the line: whether the work is landing, and whether the competitors who
 * were being recommended instead are still being recommended instead. Model
 * answers also drift on their own, which means a single reading cannot tell you
 * whether a change was yours or the weather — only a series can.
 *
 * ## Why it is a chain of single events rather than one cron job
 *
 * The same constraint that made a scan a job in the first place. Forty-five
 * calls to other people's servers do not fit inside one PHP request on shared
 * hosting, and WP-Cron is a PHP request like any other — a naive
 * "run all due scans" hook would hit `max_execution_time` and die halfway,
 * leaving rows in a state nothing ever finishes.
 *
 * So: a sweep finds what is due and starts it, then each advance event ticks
 * that one scan once and schedules the next advance. Every request stays small,
 * and a scan that dies mid-flight is picked up by `reap()` rather than blocking
 * its monitor forever.
 *
 * ## Why it is off by default
 *
 * This is the only part of the system that spends money without a human
 * present. Everything here is inert until somebody switches it on, and it has
 * its own daily ceiling separate from the visitor-facing one — the visitor cap
 * protects against a stranger, this one protects against us.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Monitors {

	/** How long a monitor waits before the next run, by frequency. */
	const INTERVALS = array(
		'weekly'  => 7 * DAY_IN_SECONDS,
		'monthly' => 30 * DAY_IN_SECONDS,
	);

	/**
	 * Seconds between one tick of a monitored scan and the next.
	 *
	 * Deliberately slack. Nobody is watching a progress bar here, and a
	 * scheduled scan that takes twenty minutes in the background costs exactly
	 * as much as one that takes forty seconds — while a tighter loop competes
	 * with real visitors for the same shared-hosting worker.
	 */
	const TICK_DELAY = 30;

	/**
	 * How many monitors one sweep will start.
	 *
	 * A dozen monitors all falling due on the same Monday would otherwise open a
	 * dozen concurrent scan chains. They are not urgent; the ones that miss this
	 * sweep are still due at the next one an hour later.
	 */
	const STARTS_PER_SWEEP = 3;

	/** A scan that has not moved in this long is presumed dead and released. */
	const STALE_AFTER = 2 * HOUR_IN_SECONDS;

	// -----------------------------------------------------------------------
	// Reading and writing monitors
	// -----------------------------------------------------------------------

	public static function all() {
		global $wpdb;
		$table = self::table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return $wpdb->get_results( "SELECT * FROM $table ORDER BY active DESC, next_run_at ASC", ARRAY_A );
	}

	public static function get( $id ) {
		global $wpdb;
		$table = self::table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", (int) $id ), ARRAY_A );
	}

	/**
	 * Adds a monitor, or revives the one that already covers this target.
	 *
	 * The unique key is (domain, market) — the same pairing a history series is
	 * keyed on, because a monitor exists to extend exactly one series. Enrolling
	 * the same brand twice should reactivate what is there rather than create a
	 * second schedule that scans the same thing on a different day.
	 */
	public static function add( $brand, $domain, $industry, $market, $email, $frequency = 'weekly' ) {
		global $wpdb;

		$frequency = isset( self::INTERVALS[ $frequency ] ) ? $frequency : 'weekly';
		$market    = Thallo_Vis_Questions::is_market( $market ) ? $market : Thallo_Vis_Questions::DEFAULT_MARKET;
		$now       = current_time( 'mysql', true );

		$existing = self::find( $domain, $market );

		if ( $existing ) {
			$wpdb->update(
				self::table(),
				array(
					'brand'      => $brand,
					'industry'   => $industry,
					'email'      => $email,
					'frequency'  => $frequency,
					'active'     => 1,
					'last_error' => '',
				),
				array( 'id' => $existing['id'] )
			);

			return (int) $existing['id'];
		}

		$wpdb->insert(
			self::table(),
			array(
				'brand'      => $brand,
				'domain'     => $domain,
				'industry'   => $industry,
				'market'     => $market,
				'email'      => $email,
				'frequency'  => $frequency,
				'active'     => 1,
				/* Due immediately. The brand was just scanned, so today's point
				   already exists and today's run would be replaced by its own
				   upsert — but the person enrolling wants to see the thing work,
				   and the next sweep proving it works is worth one scan. */
				'next_run_at' => $now,
				'created_at'  => $now,
			)
		);

		return (int) $wpdb->insert_id;
	}

	public static function find( $domain, $market ) {
		global $wpdb;
		$table = self::table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return $wpdb->get_row(
			$wpdb->prepare( "SELECT * FROM $table WHERE domain = %s AND market = %s", $domain, $market ),
			ARRAY_A
		);
	}

	public static function set_active( $id, $active ) {
		global $wpdb;
		$wpdb->update( self::table(), array( 'active' => $active ? 1 : 0 ), array( 'id' => (int) $id ) );
	}

	public static function remove( $id ) {
		global $wpdb;
		$wpdb->delete( self::table(), array( 'id' => (int) $id ) );
	}

	// -----------------------------------------------------------------------
	// The sweep
	// -----------------------------------------------------------------------

	/**
	 * Hourly. Starts whatever is due, and releases whatever died.
	 *
	 * Every reason to do nothing is checked before any money is spent, and each
	 * one writes what it decided onto the row it skipped — a monitor that
	 * silently stops running is indistinguishable from a monitor that is
	 * working, and the admin screen has to be able to tell them apart.
	 */
	public static function sweep() {
		if ( ! Thallo_Vis_Settings::get( 'monitoring_enabled' ) ) {
			return;
		}

		self::reap();

		/* WP-Cron fires on traffic, and two requests arriving together can run
		   the same event twice. The lock is short-lived and only guards the
		   window in which a monitor is picked up but not yet marked running. */
		if ( ! self::lock() ) {
			return;
		}

		$started = 0;

		foreach ( self::due() as $monitor ) {
			if ( $started >= self::STARTS_PER_SWEEP ) {
				break;
			}

			$result = self::begin( $monitor );

			if ( is_wp_error( $result ) ) {
				self::fail( $monitor, $result->get_error_message() );
				continue;
			}

			$started++;
		}

		self::unlock();
	}

	private static function due() {
		global $wpdb;
		$table = self::table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM $table WHERE active = 1 AND running_scan_id = '' AND next_run_at <= %s ORDER BY next_run_at ASC LIMIT 20",
				current_time( 'mysql', true )
			),
			ARRAY_A
		);
	}

	/** Starts one monitored scan and schedules its first advance. */
	private static function begin( array $monitor ) {
		if ( Thallo_Vis_Settings::is_demo() ) {
			return new WP_Error( 'demo', __( 'No API key is configured, so there is nothing to measure.', 'thallo-visibility' ) );
		}

		$cap = (int) Thallo_Vis_Settings::get( 'monitor_daily_cap', 20 );
		if ( self::ran_today() >= $cap ) {
			return new WP_Error( 'capped', __( 'The daily ceiling for scheduled scans has been reached.', 'thallo-visibility' ) );
		}

		$session = Thallo_Vis_Runner::start(
			$monitor['brand'],
			$monitor['domain'],
			$monitor['industry'],
			$monitor['market'],
			'monitor'
		);

		if ( is_wp_error( $session ) ) {
			return $session;
		}

		global $wpdb;
		$wpdb->update(
			self::table(),
			array(
				'running_scan_id' => $session['scanId'],
				/* Stamped at the start, not only at the end. It is what `reap()`
				   measures staleness against, and it is the only column that
				   says when this run began — `next_run_at` is still sitting at
				   the time the monitor came due, which for a sweep three hours
				   later already looks hours old. */
				'last_run_at'     => current_time( 'mysql', true ),
				'last_error'      => '',
			),
			array( 'id' => (int) $monitor['id'] )
		);

		self::schedule_advance( (int) $monitor['id'] );

		return true;
	}

	// -----------------------------------------------------------------------
	// The advance chain
	// -----------------------------------------------------------------------

	public static function schedule_advance( $monitor_id ) {
		wp_schedule_single_event( time() + self::TICK_DELAY, 'thallo_vis_monitor_advance', array( (int) $monitor_id ) );
	}

	/**
	 * One tick of one monitored scan, then either the next tick or the finish.
	 *
	 * The email gate is opened here rather than by a person, because the person
	 * gave their address the first time and this run exists to send them the
	 * result. Phase 2 is what makes it a comparable report — a series of phase-1
	 * numbers with no grade beside them measures half of what the first report
	 * they were sent measured.
	 */
	public static function advance( $monitor_id ) {
		$monitor = self::get( $monitor_id );

		if ( ! $monitor || '' === $monitor['running_scan_id'] ) {
			return;
		}

		$session = Thallo_Vis_Runner::tick( $monitor['running_scan_id'] );

		if ( is_wp_error( $session ) ) {
			self::fail( $monitor, $session->get_error_message() );
			return;
		}

		switch ( $session['status'] ) {
			case 'awaiting-email':
				$unlocked = Thallo_Vis_Runner::unlock( $monitor['running_scan_id'], $monitor['email'] );

				if ( is_wp_error( $unlocked ) ) {
					/* Phase 1 measured something and it is already recorded, so
					   the series does not lose its point. Only the second half
					   failed, and that is what the row is told. */
					self::finish( $monitor, $unlocked->get_error_message() );
					return;
				}

				self::schedule_advance( $monitor_id );
				return;

			case 'complete':
				self::finish( $monitor, '' );
				return;

			case 'failed':
				self::fail( $monitor, isset( $session['error'] ) ? $session['error'] : __( 'The scan failed.', 'thallo-visibility' ) );
				return;

			default:
				self::schedule_advance( $monitor_id );
		}
	}

	/**
	 * Releases monitors whose scan stopped moving.
	 *
	 * A cron event can be lost — the site gets no traffic for a day, a deploy
	 * lands mid-chain, PHP dies. Without this, one lost event pins a monitor to
	 * a `running_scan_id` that will never complete and it silently never runs
	 * again. Two hours is far longer than any real scan and short enough that a
	 * weekly monitor still makes its week.
	 */
	private static function reap() {
		global $wpdb;
		$table = self::table();
		$since = gmdate( 'Y-m-d H:i:s', time() - self::STALE_AFTER );

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		$stuck = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM $table WHERE running_scan_id <> '' AND last_run_at IS NOT NULL AND last_run_at < %s",
				$since
			),
			ARRAY_A
		);

		foreach ( $stuck as $monitor ) {
			self::fail( $monitor, __( 'The scheduled scan stopped responding and was abandoned.', 'thallo-visibility' ) );
		}
	}

	// -----------------------------------------------------------------------
	// Ending a run
	// -----------------------------------------------------------------------

	private static function finish( array $monitor, $error ) {
		global $wpdb;
		$now = current_time( 'mysql', true );

		$wpdb->update(
			self::table(),
			array(
				'running_scan_id' => '',
				'last_run_at'     => $now,
				'next_run_at'     => gmdate( 'Y-m-d H:i:s', time() + self::interval( $monitor['frequency'] ) ),
				'last_error'      => $error,
			),
			array( 'id' => (int) $monitor['id'] )
		);
	}

	/**
	 * A failed run still moves the schedule forward.
	 *
	 * Leaving `next_run_at` in the past would make the monitor due again on the
	 * next sweep, an hour later, and a target that fails for a structural reason
	 * — a domain that no longer resolves, a model id that was retired — would
	 * then be retried twenty-four times a day, every day, at our expense. The
	 * error is written where the admin screen shows it instead.
	 */
	private static function fail( array $monitor, $message ) {
		global $wpdb;

		$wpdb->update(
			self::table(),
			array(
				'running_scan_id' => '',
				'next_run_at'     => gmdate( 'Y-m-d H:i:s', time() + self::interval( $monitor['frequency'] ) ),
				'last_error'      => mb_substr( (string) $message, 0, 250 ),
			),
			array( 'id' => (int) $monitor['id'] )
		);
	}

	// -----------------------------------------------------------------------
	// Small pieces
	// -----------------------------------------------------------------------

	private static function interval( $frequency ) {
		return isset( self::INTERVALS[ $frequency ] ) ? self::INTERVALS[ $frequency ] : self::INTERVALS['weekly'];
	}

	/** Scheduled scans recorded today. The ceiling is counted, not estimated. */
	public static function ran_today() {
		global $wpdb;
		$table = Thallo_Vis_DB::history_table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM $table WHERE source = 'monitor' AND created_at > %s",
				gmdate( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS )
			)
		);
	}

	private static function table() {
		return Thallo_Vis_DB::monitors_table();
	}

	private static function lock() {
		if ( get_transient( 'thallo_vis_sweep_lock' ) ) {
			return false;
		}
		set_transient( 'thallo_vis_sweep_lock', 1, 5 * MINUTE_IN_SECONDS );

		return true;
	}

	private static function unlock() {
		delete_transient( 'thallo_vis_sweep_lock' );
	}
}
