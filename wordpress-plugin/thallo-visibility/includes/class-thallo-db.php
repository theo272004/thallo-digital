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
			email VARCHAR(190) NOT NULL DEFAULT '',
			state LONGTEXT NOT NULL,
			created_at DATETIME NOT NULL,
			updated_at DATETIME NOT NULL,
			PRIMARY KEY  (id),
			UNIQUE KEY scan_id (scan_id),
			KEY ip_hash (ip_hash),
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
		$ip = '';
		foreach ( array( 'HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR' ) as $key ) {
			if ( ! empty( $_SERVER[ $key ] ) ) {
				$raw = sanitize_text_field( wp_unslash( $_SERVER[ $key ] ) );
				// X-Forwarded-For is a chain; the client is the first entry.
				$ip  = trim( explode( ',', $raw )[0] );
				break;
			}
		}
		return hash( 'sha256', $ip . wp_salt( 'nonce' ) );
	}

	public static function create( $scan_id, $brand, $domain, $industry, array $state ) {
		global $wpdb;
		$now = current_time( 'mysql', true );

		$wpdb->insert(
			self::scans_table(),
			array(
				'scan_id'    => $scan_id,
				'brand'      => $brand,
				'domain'     => $domain,
				'industry'   => $industry,
				'status'     => 'running',
				'ip_hash'    => self::ip_hash(),
				'state'      => wp_json_encode( $state ),
				'created_at' => $now,
				'updated_at' => $now,
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
