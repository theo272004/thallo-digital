<?php
/**
 * Leads.
 *
 * The email is the price of the second half of the report, so it is stored the
 * moment it is given — before phase 2 runs, not after. A scan that falls over
 * halfway must not also lose the contact, because the person still handed it
 * over in good faith and we still owe them the report.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Leads {

	public static function record( array $state, $email ) {
		global $wpdb;

		$wpdb->insert(
			Thallo_Vis_DB::leads_table(),
			array(
				'scan_id'    => $state['scan_id'],
				'email'      => $email,
				'brand'      => $state['brand'],
				'domain'     => $state['domain'],
				'industry'   => $state['industry'],
				'sov_pct'    => isset( $state['phase1']['sovPct'] ) ? (int) $state['phase1']['sovPct'] : 0,
				'ip_hash'    => Thallo_Vis_DB::ip_hash(),
				'created_at' => current_time( 'mysql', true ),
			)
		);
	}

	/** Called once the report exists, to fill in the grade and send the mail. */
	public static function after_complete( array $state ) {
		global $wpdb;

		if ( empty( $state['email'] ) ) {
			return;
		}

		$wpdb->update(
			Thallo_Vis_DB::leads_table(),
			array( 'grade' => isset( $state['phase2']['grade'] ) ? $state['phase2']['grade'] : '' ),
			array( 'scan_id' => $state['scan_id'] )
		);

		self::notify_owner( $state );

		if ( Thallo_Vis_Settings::get( 'send_report_to_lead' ) ) {
			self::send_report( $state );
		}
	}

	private static function notify_owner( array $state ) {
		$to = Thallo_Vis_Settings::get( 'notify_email' );
		if ( ! $to ) {
			return;
		}

		$phase1 = $state['phase1'];
		$phase2 = isset( $state['phase2'] ) ? $state['phase2'] : array();

		$lines = array(
			'A new visibility scan was unlocked.',
			'',
			'Brand:    ' . $state['brand'],
			'Website:  ' . $state['domain'],
			'Category: ' . $state['industry'],
			'Email:    ' . $state['email'],
			'',
			'Share of voice: ' . $phase1['sovPct'] . '% (' . $phase1['mentions'] . ' of ' . $phase1['totalAnswers'] . ' answers)',
			'Average rank:   ' . ( null === $phase1['avgPosition'] ? 'never named' : $phase1['avgPosition'] ),
			'Grade:          ' . ( isset( $phase2['grade'] ) ? $phase2['grade'] : '—' ),
			'',
		);

		if ( ! empty( $phase2['competitors'] ) ) {
			$lines[] = 'Recommended instead of them:';
			foreach ( array_slice( $phase2['competitors'], 0, 5 ) as $competitor ) {
				$lines[] = '  · ' . $competitor['name'] . ' (' . $competitor['mentions'] . ')';
			}
			$lines[] = '';
		}

		if ( ! empty( $phase2['keyInsight'] ) ) {
			$lines[] = 'Key insight: ' . $phase2['keyInsight'];
		}

		wp_mail(
			$to,
			sprintf( '[Thallo] Visibility scan · %s (%s)', $state['brand'], $state['domain'] ),
			implode( "\n", $lines )
		);
	}

	/**
	 * The report, sent to the person who asked for it.
	 *
	 * Plain text on purpose. The full thing is on screen in front of them; this
	 * is the copy they forward to a colleague, and a wall of styled HTML from a
	 * company they met four minutes ago is what gets marked as spam.
	 */
	private static function send_report( array $state ) {
		$phase1 = $state['phase1'];
		$phase2 = isset( $state['phase2'] ) ? $state['phase2'] : array();

		$lines = array(
			sprintf( 'Your AI visibility scan — %s', $state['brand'] ),
			str_repeat( '=', 48 ),
			'',
			sprintf(
				'We put %d buying questions about %s to ChatGPT, Claude and Gemini. Your brand was never named in the questions.',
				count( $phase1['questions'] ),
				strtolower( $state['industry'] )
			),
			'',
			sprintf( 'Share of voice: %d%% — named in %d of %d answers.', $phase1['sovPct'], $phase1['mentions'], $phase1['totalAnswers'] ),
		);

		if ( null !== $phase1['avgPosition'] ) {
			$lines[] = sprintf( 'Average rank when named: %s.', $phase1['avgPosition'] );
		}

		$lines[] = '';

		foreach ( $phase1['providers'] as $provider ) {
			$label = ucfirst( $provider['provider'] );
			$lines[] = empty( $provider['error'] )
				? sprintf( '  %-10s %d of %d answers', $label, $provider['mentions'], count( $phase1['questions'] ) )
				: sprintf( '  %-10s not measured (%s)', $label, $provider['error'] );
		}

		if ( ! empty( $phase2['keyInsight'] ) ) {
			$lines[] = '';
			$lines[] = 'WHAT IT MEANS';
			$lines[] = $phase2['keyInsight'];
		}

		if ( ! empty( $phase2['competitors'] ) ) {
			$lines[] = '';
			$lines[] = 'RECOMMENDED INSTEAD OF YOU';
			foreach ( array_slice( $phase2['competitors'], 0, 5 ) as $index => $competitor ) {
				$lines[] = sprintf( '  %d. %s — %d mentions', $index + 1, $competitor['name'], $competitor['mentions'] );
			}
		}

		if ( ! empty( $phase2['actions'] ) ) {
			$lines[] = '';
			$lines[] = 'WHAT TO DO FIRST';
			foreach ( $phase2['actions'] as $index => $action ) {
				$lines[] = sprintf( '  %d. %s', $index + 1, $action['title'] );
				$lines[] = '     ' . $action['detail'];
			}
		}

		$lines[] = '';
		$lines[] = 'Measuring it is the easy half. If you want the content, citations and structure';
		$lines[] = 'that move these numbers, reply to this email and we will take a look properly.';
		$lines[] = '';
		$lines[] = '— Thallo Digital';
		$lines[] = home_url();

		wp_mail(
			$state['email'],
			sprintf( 'Your AI visibility scan — %s', $state['brand'] ),
			implode( "\n", $lines )
		);
	}

	public static function all( $limit = 200 ) {
		global $wpdb;
		$table = Thallo_Vis_DB::leads_table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table ORDER BY created_at DESC LIMIT %d", $limit ), ARRAY_A );
	}

	public static function export_csv() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to export leads.', 'thallo-visibility' ) );
		}

		check_admin_referer( 'thallo_export_leads' );

		global $wpdb;
		$table = Thallo_Vis_DB::leads_table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		$rows = $wpdb->get_results( "SELECT created_at, email, brand, domain, industry, sov_pct, grade FROM $table ORDER BY created_at DESC", ARRAY_A );

		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=thallo-visibility-leads-' . gmdate( 'Y-m-d' ) . '.csv' );

		$out = fopen( 'php://output', 'w' );
		fputcsv( $out, array( 'Date (UTC)', 'Email', 'Brand', 'Website', 'Category', 'Share of voice %', 'Grade' ) );

		foreach ( (array) $rows as $row ) {
			fputcsv( $out, $row );
		}

		fclose( $out );
		exit;
	}
}
