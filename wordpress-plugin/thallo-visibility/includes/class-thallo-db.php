<?php
/**
 * Storage.
 *
 * Four tables, because the four things have different lifetimes.
 *
 * A **scan** is working state — it exists so the client can tick a job forward
 * and reload a report — and it is pruned after a fortnight. A **lead** is a
 * record, and it is not pruned.
 *
 * A **history** row is the handful of numbers a scan produced, kept forever.
 * It is deliberately not the scan: a few integers per run cost nothing to keep
 * for years, while the scan they came from is megabytes of answers nobody reads
 * twice. Keeping them apart is what lets the working data be thrown away on
 * schedule without throwing away the trend, and the trend is the product — a
 * snapshot tells a brand where it stands, only a series tells it whether
 * anything it did worked.
 *
 * A **monitor** is a standing instruction to re-run a scan on a schedule. It
 * outlives every scan it creates.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_DB {

	public static function scans_table() {
		global $wpdb;
		return $wpdb->prefix . 'thallo_scans';
	}

	public static function leads_table() {
		global $wpdb;
		return $wpdb->prefix . 'thallo_leads';
	}

	public static function history_table() {
		global $wpdb;
		return $wpdb->prefix . 'thallo_history';
	}

	public static function monitors_table() {
		global $wpdb;
		return $wpdb->prefix . 'thallo_monitors';
	}

	public static function enquiries_table() {
		global $wpdb;
		return $wpdb->prefix . 'thallo_enquiries';
	}

	public static function install() {
		global $wpdb;
		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset = $wpdb->get_charset_collate();
		$scans   = self::scans_table();
		$leads   = self::leads_table();

		/*
		 * `state` is the whole job as JSON: the questions, the pending work, the
		 * answers as they land, the finished phases. Normalising it would mean
		 * four more tables and a migration every time the report grows a field,
		 * for data that is deleted within a fortnight and never queried across
		 * rows. `ip_hash` is indexed because the rate limiter counts on it, and
		 * it is a hash because we have no reason to keep the address itself.
		 */
		$sql_scans = "CREATE TABLE $scans (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			scan_id VARCHAR(32) NOT NULL,
			brand VARCHAR(190) NOT NULL,
			domain VARCHAR(190) NOT NULL,
			industry VARCHAR(190) NOT NULL,
			status VARCHAR(20) NOT NULL DEFAULT 'running',
			ip_hash CHAR(64) NOT NULL DEFAULT '',
			session_hash CHAR(64) NOT NULL DEFAULT '',
			email VARCHAR(190) NOT NULL DEFAULT '',
			state LONGTEXT NOT NULL,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY scan_id (scan_id),
			KEY ip_hash (ip_hash),
			KEY session_hash (session_hash),
			KEY email_created (email, created_at),
			KEY domain_created (domain, created_at),
			KEY created_at (created_at)
		) $charset;";

		$sql_leads = "CREATE TABLE $leads (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			scan_id VARCHAR(32) NOT NULL,
			email VARCHAR(190) NOT NULL,
			brand VARCHAR(190) NOT NULL,
			domain VARCHAR(190) NOT NULL,
			industry VARCHAR(190) NOT NULL,
			market VARCHAR(12) NOT NULL DEFAULT 'en-US',
			sov_pct SMALLINT NOT NULL DEFAULT 0,
			grade CHAR(1) NOT NULL DEFAULT '',
			ip_hash CHAR(64) NOT NULL DEFAULT '',
			mail_status VARCHAR(20) NOT NULL DEFAULT '',
			mail_error TEXT,
			mail_sent_at DATETIME NULL DEFAULT NULL,
			created_at DATETIME NOT NULL,
			PRIMARY KEY  (id),
			KEY email (email),
			KEY created_at (created_at)
		) $charset;";

		/*
		 * `series_key` is a hash of domain + market, and it is what a trend is
		 * drawn against. Not the brand name: the same company is typed
		 * "Ledgerly", "Ledgerly Inc" and "ledgerly" across three runs, and three
		 * spellings would become three series with one point each. The domain is
		 * the one field a visitor cannot spell three ways and still be scanning
		 * the same company. Market is in the key because es-CO and en-US are
		 * different answers about the same brand, and averaging them would
		 * produce a number that is true of neither.
		 *
		 * `scan_date` is a DATE and unique with the key, so a series holds at most
		 * one point per day. Somebody re-running a scan four times in an
		 * afternoon should not turn a trend line into a sawtooth, and the last
		 * run of a day is the one that stands.
		 */
		$history = self::history_table();
		$sql_history = "CREATE TABLE $history (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			series_key CHAR(64) NOT NULL,
			scan_date DATE NOT NULL,
			scan_id VARCHAR(32) NOT NULL DEFAULT '',
			brand VARCHAR(190) NOT NULL,
			domain VARCHAR(190) NOT NULL,
			industry VARCHAR(190) NOT NULL DEFAULT '',
			market VARCHAR(12) NOT NULL DEFAULT 'en-US',
			sov_pct SMALLINT NOT NULL DEFAULT 0,
			avg_position DECIMAL(4,1) NULL DEFAULT NULL,
			mentions SMALLINT NOT NULL DEFAULT 0,
			total_answers SMALLINT NOT NULL DEFAULT 0,
			grade CHAR(1) NOT NULL DEFAULT '',
			source VARCHAR(12) NOT NULL DEFAULT 'visitor',
			created_at DATETIME NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY series_day (series_key, scan_date),
			KEY domain (domain)
		) $charset;";

		/*
		 * A standing instruction to re-run a scan. `next_run_at` is what the cron
		 * chain reads, and it is a stored column rather than something derived
		 * from `last_run_at` + frequency so that a monitor can be pushed forward
		 * — after a failure, or by hand — without lying about when it last ran.
		 */
		$monitors = self::monitors_table();
		$sql_monitors = "CREATE TABLE $monitors (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			brand VARCHAR(190) NOT NULL,
			domain VARCHAR(190) NOT NULL,
			industry VARCHAR(190) NOT NULL DEFAULT '',
			market VARCHAR(12) NOT NULL DEFAULT 'en-US',
			email VARCHAR(190) NOT NULL DEFAULT '',
			frequency VARCHAR(10) NOT NULL DEFAULT 'weekly',
			active TINYINT(1) NOT NULL DEFAULT 1,
			running_scan_id VARCHAR(32) NOT NULL DEFAULT '',
			last_run_at DATETIME NULL DEFAULT NULL,
			next_run_at DATETIME NOT NULL,
			last_error VARCHAR(255) NOT NULL DEFAULT '',
			created_at DATETIME NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY target (domain, market),
			KEY due (active, next_run_at)
		) $charset;";

		/*
		 * Somebody who wrote to us through the site.
		 *
		 * Its own table rather than a row in `leads` with the scan columns left
		 * empty: a lead is a measurement with an address attached, an enquiry is
		 * a person with a sentence, and the screens that read them want
		 * different things. Kept until deleted by hand — unlike scan working
		 * data, which is pruned — because it is correspondence, and `consent` is
		 * stored with it because consent you cannot show is not much use later.
		 */
		$enquiries   = self::enquiries_table();
		$sql_enquiry = "CREATE TABLE $enquiries (
			id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
			name VARCHAR(190) NOT NULL DEFAULT '',
			company VARCHAR(190) NOT NULL DEFAULT '',
			email VARCHAR(190) NOT NULL,
			plans VARCHAR(255) NOT NULL DEFAULT '',
			message TEXT,
			page VARCHAR(255) NOT NULL DEFAULT '',
			consent TINYINT(1) NOT NULL DEFAULT 0,
			ip_hash CHAR(64) NOT NULL DEFAULT '',
			mail_status VARCHAR(20) NOT NULL DEFAULT '',
			mail_error TEXT,
			created_at DATETIME NOT NULL,
			PRIMARY KEY  (id),
			KEY email (email),
			KEY created_at (created_at)
		) $charset;";

		dbDelta( $sql_scans );
		dbDelta( $sql_leads );
		dbDelta( $sql_history );
		dbDelta( $sql_monitors );
		dbDelta( $sql_enquiry );

		update_option( 'thallo_visibility_db_version', THALLO_VIS_VERSION );
	}

	/** 32 hex characters. Long enough that a scan id is not guessable, which is
	    the only thing standing between one visitor's report and another's. */
	public static function new_scan_id() {
		return bin2hex( random_bytes( 16 ) );
	}

	/**
	 * Addresses are hashed with the site's own salt so the table cannot be used
	 * to look up who ran a scan, while still supporting "three a day per
	 * visitor".
	 */
	public static function ip_hash() {
		return hash( 'sha256', self::client_ip() . wp_salt( 'nonce' ) );
	}

	/**
	 * The caller's address in the clear.
	 *
	 * Everything that *stores* an address stores `ip_hash()` instead — the
	 * table should not be usable to look up who ran a scan. This exists for the
	 * one job the hash cannot do: comparing against a list somebody typed into
	 * the settings screen, which is how the exemption in
	 * `Thallo_Vis_REST::allowance()` works. Nothing here is written anywhere.
	 */
	public static function client_ip() {
		/* REMOTE_ADDR is the only address the server observed for itself.
		   Everything else here is a header the caller typed.

		   This used to read CF-Connecting-IP and X-Forwarded-For first and
		   believe whichever turned up. Nothing on this site sets either one:
		   WordPress answers on Bluehost's Apache directly, with no proxy in
		   front to overwrite a forged header. So a visitor could send
		   `X-Forwarded-For: <anything>` and arrive as a different person on
		   every request — which is the entire per-visitor allowance, the
		   five-enquiries-a-day limit, and the exempt-address list in settings,
		   all bypassed by one header. The daily site-wide cap was the only
		   thing left standing between a loop and the whole API budget.

		   The headers are still read when the site really is behind a proxy,
		   which has to be said out loud in wp-config.php:

		       define( 'THALLO_VIS_TRUST_PROXY', true );

		   Only turn that on once something in front of the server is
		   overwriting these headers on every request. A proxy that merely
		   passes them through is no safer than no proxy at all. */
		if ( defined( 'THALLO_VIS_TRUST_PROXY' ) && THALLO_VIS_TRUST_PROXY ) {
			foreach ( array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR' ) as $key ) {
				if ( empty( $_SERVER[ $key ] ) ) {
					continue;
				}

				$raw = sanitize_text_field( wp_unslash( $_SERVER[ $key ] ) );
				// X-Forwarded-For is a chain; the client is the first entry.
				$candidate = trim( explode( ',', $raw )[0] );

				if ( filter_var( $candidate, FILTER_VALIDATE_IP ) ) {
					return $candidate;
				}
			}
		}

		$remote = isset( $_SERVER['REMOTE_ADDR'] )
			? trim( sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) )
			: '';

		/* An address that is not an address hashes to something as good as any
		   other constant, and would put every such caller in one bucket. Empty
		   is the honest answer. */
		return filter_var( $remote, FILTER_VALIDATE_IP ) ? $remote : '';
	}

	/**
	 * @param string $email   Written at creation now that the address is
	 *                        collected on the setup screen. It used to be
	 *                        filled in only when phase 2 opened, which meant the
	 *                        allowance could not be counted per address — a
	 *                        scan that was abandoned halfway left a row with no
	 *                        address on it and did not count against anybody.
	 *                        Clearing cookies then reset the counter to zero.
	 * @param string $session The browser session this scan belongs to, hashed.
	 */
	public static function create( $scan_id, $brand, $domain, $industry, array $state, $email = '', $session = '' ) {
		global $wpdb;
		$now = current_time( 'mysql', true );

		$wpdb->insert(
			self::scans_table(),
			array(
				'scan_id'      => $scan_id,
				'brand'        => $brand,
				'domain'       => $domain,
				'industry'     => $industry,
				'status'       => 'running',
				'ip_hash'      => self::ip_hash(),
				'session_hash' => $session,
				'email'        => $email,
				'state'        => wp_json_encode( $state ),
				'created_at'   => $now,
				'updated_at'   => $now,
			)
		);

		return (bool) $wpdb->insert_id;
	}

	public static function get( $scan_id ) {
		global $wpdb;
		$table = self::scans_table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		$row = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE scan_id = %s", $scan_id ), ARRAY_A );
		if ( ! $row ) {
			return null;
		}

		$row['state'] = json_decode( $row['state'], true );
		if ( ! is_array( $row['state'] ) ) {
			$row['state'] = array();
		}

		return $row;
	}

	public static function save_state( $scan_id, array $state, $status = null, $email = null ) {
		global $wpdb;

		$data = array(
			'state'      => wp_json_encode( $state ),
			'updated_at' => current_time( 'mysql', true ),
		);
		if ( null !== $status ) {
			$data['status'] = $status;
		}
		if ( null !== $email ) {
			$data['email'] = $email;
		}

		$wpdb->update( self::scans_table(), $data, array( 'scan_id' => $scan_id ) );
	}

	/** Scans started by this visitor since `$since` (a MySQL UTC datetime). */
	public static function count_recent_for_ip( $since ) {
		global $wpdb;
		$table = self::scans_table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return (int) $wpdb->get_var(
			$wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE ip_hash = %s AND created_at > %s", self::ip_hash(), $since )
		);
	}

	/**
	 * Scans this browser has run, ever.
	 *
	 * Not "since yesterday". The other three layers are windowed because they
	 * are about abuse rate; this one is the allowance itself — three free scans
	 * is three free scans, not three a day — and a window would turn the free
	 * tier into an unlimited one for anybody patient enough to come back
	 * tomorrow. An empty session hash counts nothing, so a client that sends no
	 * cookie falls through to the layers that do not need one.
	 */
	public static function count_for_session( $session ) {
		global $wpdb;

		if ( '' === $session ) {
			return 0;
		}

		$table = self::scans_table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return (int) $wpdb->get_var(
			$wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE session_hash = %s", $session )
		);
	}

	/**
	 * Scans this address has run, ever.
	 *
	 * The layer that survives cleared cookies, and the reason the address is
	 * written at creation rather than at unlock.
	 *
	 * Counted across both tables and de-duplicated on the scan id, because
	 * neither one alone is the whole answer. Scan rows are working data and are
	 * pruned after a fortnight — counting only those would hand everybody a
	 * fresh three every two weeks. Lead rows are never pruned, but one is only
	 * written when phase 2 opens, so a scan that failed before that has no lead
	 * and would not be counted at all. The union of the two is the durable
	 * record, and the `DISTINCT` is what stops a completed scan counting twice.
	 */
	public static function count_for_email( $email ) {
		global $wpdb;

		if ( '' === $email ) {
			return 0;
		}

		$scans = self::scans_table();
		$leads = self::leads_table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table names are not user input.
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(DISTINCT scan_id) FROM (
					SELECT scan_id FROM $scans WHERE email = %s
					UNION ALL
					SELECT scan_id FROM $leads WHERE email = %s
				) AS runs",
				$email,
				$email
			)
		);
	}

	/**
	 * Scans run against one website since `$since`.
	 *
	 * The layer nobody thinks of until it happens: a competitor, or an agency
	 * pitching them, scanning the same domain over and over. Every one of those
	 * costs us a call and none of them is a lead — and worse, they consume the
	 * daily site-wide ceiling that protects the bill. Windowed rather than
	 * absolute, because re-running a brand next month is exactly the behaviour
	 * the trend chart asks for.
	 */
	public static function count_recent_for_domain( $domain, $since ) {
		global $wpdb;

		if ( '' === $domain ) {
			return 0;
		}

		$table = self::scans_table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return (int) $wpdb->get_var(
			$wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE domain = %s AND created_at > %s", $domain, $since )
		);
	}

	/** Scans started by anyone since `$since`. The guard on the API bill. */
	public static function count_recent_total( $since ) {
		global $wpdb;
		$table = self::scans_table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE created_at > %s", $since ) );
	}

	// -----------------------------------------------------------------------
	// History
	// -----------------------------------------------------------------------

	/** The series a brand's runs accumulate against: this domain, this market. */
	public static function series_key( $domain, $market ) {
		return hash( 'sha256', strtolower( trim( $domain ) ) . '|' . $market );
	}

	/**
	 * Records — or, for a second run the same day, replaces — one point.
	 *
	 * Called at the end of phase 1, which is the point at which a share of voice
	 * exists. Phase 2 comes back later with a grade and updates the same row, so
	 * a visitor who never hands over an email still leaves a data point behind:
	 * the free half is a real measurement and the series should not have a hole
	 * in it just because nobody paid for the second half.
	 */
	public static function record_history( array $state, $source = 'visitor' ) {
		global $wpdb;

		if ( empty( $state['phase1'] ) ) {
			return;
		}

		/* A demo run measures nothing. Writing it to the history table would put
		   invented numbers into the one place in this system that is supposed to
		   be a record, where nothing marks them as invented and where they would
		   outlive every banner that said so. */
		if ( ! empty( $state['demo'] ) ) {
			return;
		}

		$phase1 = $state['phase1'];
		$market = isset( $state['market'] ) ? $state['market'] : Thallo_Vis_Questions::DEFAULT_MARKET;
		$now    = current_time( 'mysql', true );

		$row = array(
			'series_key'    => self::series_key( $state['domain'], $market ),
			'scan_date'     => substr( $now, 0, 10 ),
			'scan_id'       => $state['scan_id'],
			'brand'         => $state['brand'],
			'domain'        => $state['domain'],
			'industry'      => isset( $state['industry'] ) ? $state['industry'] : '',
			'market'        => $market,
			'sov_pct'       => (int) $phase1['sovPct'],
			'avg_position'  => null === $phase1['avgPosition'] ? null : (float) $phase1['avgPosition'],
			'mentions'      => (int) $phase1['mentions'],
			'total_answers' => (int) $phase1['totalAnswers'],
			'grade'         => isset( $state['phase2']['grade'] ) ? $state['phase2']['grade'] : '',
			'source'        => $source,
			'created_at'    => $now,
		);

		$table = self::history_table();

		/* ON DUPLICATE KEY against the (series_key, scan_date) unique index, so
		   the day's last run stands. Built by hand because $wpdb->replace() would
		   delete and re-insert, changing the row's id for no reason, and because
		   an upsert is one round trip where select-then-branch is two and can
		   race with a second tab. */
		$columns      = array_keys( $row );
		$placeholders = array();
		$values       = array();

		foreach ( $columns as $column ) {
			if ( null === $row[ $column ] ) {
				$placeholders[] = 'NULL';
				continue;
			}
			$placeholders[] = 'avg_position' === $column ? '%f' : ( in_array( $column, array( 'sov_pct', 'mentions', 'total_answers' ), true ) ? '%d' : '%s' );
			$values[]       = $row[ $column ];
		}

		$updates = array();
		foreach ( $columns as $column ) {
			if ( in_array( $column, array( 'series_key', 'scan_date' ), true ) ) {
				continue;
			}
			$updates[] = "`$column` = VALUES(`$column`)";
		}

		$sql = sprintf(
			'INSERT INTO %s (`%s`) VALUES (%s) ON DUPLICATE KEY UPDATE %s',
			$table,
			implode( '`, `', $columns ),
			implode( ', ', $placeholders ),
			implode( ', ', $updates )
		);

		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared -- placeholders built above; values are bound.
		$wpdb->query( $values ? $wpdb->prepare( $sql, $values ) : $sql );
	}

	/**
	 * The series for one domain in one market, oldest first.
	 *
	 * Capped rather than unbounded: a monitored brand accumulates a point a week
	 * for years, and a report is a chart, not an archive. The newest are the ones
	 * kept, then flipped back into chronological order.
	 */
	public static function history_for( $domain, $market, $limit = 52 ) {
		global $wpdb;
		$table = self::history_table();
		$limit = max( 1, min( 200, (int) $limit ) );

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT scan_date, sov_pct, avg_position, grade FROM $table WHERE series_key = %s ORDER BY scan_date DESC LIMIT %d",
				self::series_key( $domain, $market ),
				$limit
			),
			ARRAY_A
		);

		if ( ! $rows ) {
			return array();
		}

		$out = array();
		foreach ( array_reverse( $rows ) as $row ) {
			$point = array(
				'date'        => $row['scan_date'],
				'sovPct'      => (int) $row['sov_pct'],
				'avgPosition' => null === $row['avg_position'] ? null : (float) $row['avg_position'],
			);
			if ( '' !== $row['grade'] ) {
				$point['grade'] = $row['grade'];
			}
			$out[] = $point;
		}

		return $out;
	}

	public static function prune() {
		global $wpdb;
		$table = self::scans_table();
		$days  = max( 1, (int) Thallo_Vis_Settings::get( 'retention_days', 14 ) );
		$since = gmdate( 'Y-m-d H:i:s', time() - ( $days * DAY_IN_SECONDS ) );

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		$wpdb->query( $wpdb->prepare( "DELETE FROM $table WHERE created_at < %s", $since ) );
	}
}
