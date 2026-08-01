<?php
/**
 * Storage.
 *
 * Two tables, because the two things have different lifetimes. A scan is
 * working state — it exists so the client can tick a job forward and reload a
 * report — and it is pruned. A lead is a record, and it is not.
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
			sov_pct SMALLINT NOT NULL DEFAULT 0,
			grade CHAR(1) NOT NULL DEFAULT '',
			ip_hash CHAR(64) NOT NULL DEFAULT '',
			created_at DATETIME NOT NULL,
			PRIMARY KEY  (id),
			KEY email (email),
			KEY created_at (created_at)
		) $charset;";

		dbDelta( $sql_scans );
		dbDelta( $sql_leads );

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

	public static function prune() {
		global $wpdb;
		$table = self::scans_table();
		$days  = max( 1, (int) Thallo_Vis_Settings::get( 'retention_days', 14 ) );
		$since = gmdate( 'Y-m-d H:i:s', time() - ( $days * DAY_IN_SECONDS ) );

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		$wpdb->query( $wpdb->prepare( "DELETE FROM $table WHERE created_at < %s", $since ) );
	}
}
