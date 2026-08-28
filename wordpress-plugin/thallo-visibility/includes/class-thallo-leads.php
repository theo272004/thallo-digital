<?php
/**
 * Leads.
 *
 * The email is the price of the second half of the report, so it is stored the
 * moment it is given — before phase 2 runs, not after. A scan that falls over
 * halfway must not also lose the contact, because the person still handed it
 * over in good faith and we still owe them the report.
 *
 * Whether the report actually reached them is stored too, on the same row.
 * `wp_mail()` returns false when the message was not handed off, and the reason
 * arrives separately on the `wp_mail_failed` action — both were being thrown
 * away, so a shared host quietly refusing every message looked exactly like a
 * host delivering every message, and the first anybody knew of it was a client
 * saying the report never came. A promise made on the screen ("we will send you
 * the report") has to leave a record of whether it was kept.
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
				/* Stored on the lead because it is what a monitor needs to
				   re-run this exact scan, and because a share of voice without
				   the market it was measured in is not a number anybody can act
				   on six weeks later. */
				'market'     => isset( $state['market'] ) ? $state['market'] : Thallo_Vis_Questions::DEFAULT_MARKET,
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

		if ( ! Thallo_Vis_Settings::get( 'send_report_to_lead' ) ) {
			/* Recorded rather than left blank. "Switched off" and "tried and
			   failed" are different answers to "why did they not get it", and
			   the setting can be turned off by accident on a screen with
			   fourteen other fields on it. */
			self::record_mail_result( $state['scan_id'], 'off', '' );
			return;
		}

		self::send_report( $state );
	}

	/**
	 * One place every message goes out through.
	 *
	 * `wp_mail()` answers only whether PHPMailer accepted the message; the
	 * reason it did not arrives on `wp_mail_failed` as a WP_Error, and only if
	 * something is listening at the time. So the listener is added around the
	 * call and taken off again, and the pair is returned together.
	 *
	 * @param string $html When the message is a designed one. The plain body is
	 *                     still passed and still sent — as the text alternative
	 *                     rather than instead of it. A message with no text part
	 *                     scores worse with every filter that looks, and some
	 *                     people do read mail as text.
	 *
	 * @return array array( 'ok' => bool, 'error' => string )
	 */
	/**
	 * The same door, opened for the enquiry side of the plugin.
	 *
	 * One sender for everything this plugin puts in somebody's inbox: one place
	 * that knows the From, one place that captures the failure, one thing to fix
	 * when a host changes. `$reply_to` is the one thing an enquiry needs that a
	 * report does not — hitting reply on "somebody wrote to us" should answer
	 * the person, not us.
	 */
	public static function send_message( $to, $subject, $text, $html = '', $reply_to = '' ) {
		return self::send( $to, $subject, $text, $html, $reply_to );
	}

	private static function send( $to, $subject, $body, $html = '', $reply_to = '' ) {
		$captured = '';

		$listener = static function ( $error ) use ( &$captured ) {
			if ( is_wp_error( $error ) ) {
				$captured = $error->get_error_message();
			}
		};

		$headers = self::headers( $reply_to );
		$alt     = null;

		if ( '' !== $html ) {
			$headers[] = 'Content-Type: text/html; charset=UTF-8';

			/* The text half has to go on through PHPMailer: `wp_mail()` has no
			   way to say "these two are the same message". */
			$alt = static function ( $phpmailer ) use ( $body ) {
				$phpmailer->AltBody = $body; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.NotSnakeCase
			};

			add_action( 'phpmailer_init', $alt );
		}

		add_action( 'wp_mail_failed', $listener );
		$ok = wp_mail( $to, $subject, '' !== $html ? $html : $body, $headers );
		remove_action( 'wp_mail_failed', $listener );

		if ( $alt ) {
			remove_action( 'phpmailer_init', $alt );
		}

		return array(
			'ok'    => (bool) $ok,
			/* A refusal with no message attached is still a refusal, and an
			   empty cell in the admin table would read as "no problem". */
			'error' => $ok ? '' : ( '' !== $captured ? $captured : 'wp_mail() returned false without saying why' ),
		);
	}

	/**
	 * From, and Reply-To.
	 *
	 * WordPress defaults the sender to `wordpress@<domain>`, which on most
	 * shared hosting is a mailbox that does not exist. Some hosts deliver it
	 * anyway, some refuse it outright, and the receiving end is entitled to bin
	 * anything claiming to be from an address the domain cannot vouch for. So
	 * the sender is a setting, and the field says in as many words that it has
	 * to be a real mailbox on this domain.
	 *
	 * Empty by default, which leaves WordPress's own behaviour untouched: this
	 * has to be filled in deliberately, because filling it in wrongly is worse
	 * than leaving it alone.
	 */
	private static function headers( $reply_to = '' ) {
		$from = Thallo_Vis_Settings::get( 'from_email', '' );
		if ( ! $from || ! is_email( $from ) ) {
			/* No sender configured, so WordPress's own defaults stand — but a
			   Reply-To still travels, because it is the only way an answer to an
			   enquiry reaches the person who sent it. */
			return ( $reply_to && is_email( $reply_to ) ) ? array( sprintf( 'Reply-To: %s', $reply_to ) ) : array();
		}

		$name    = Thallo_Vis_Settings::get( 'from_name', '' );
		$headers = array(
			'' !== $name
				? sprintf( 'From: %s <%s>', $name, $from )
				: sprintf( 'From: %s', $from ),
		);

		/* The report closes by inviting a reply. It should land somewhere a
		   person reads, which is not necessarily the address it was sent from —
		   and for a message about somebody's enquiry, the person is them. */
		$reply = ( $reply_to && is_email( $reply_to ) ) ? $reply_to : Thallo_Vis_Settings::get( 'notify_email' );
		if ( $reply && is_email( $reply ) ) {
			$headers[] = sprintf( 'Reply-To: %s', $reply );
		}

		return $headers;
	}

	/** Writes the outcome onto the lead, so the Leads screen can show it. */
	private static function record_mail_result( $scan_id, $status, $error ) {
		global $wpdb;

		$data = array(
			'mail_status' => $status,
			/* Truncated: some SMTP refusals come back as a paragraph, and the
			   useful part is always at the front. */
			'mail_error'  => mb_substr( (string) $error, 0, 500 ),
		);

		/* Only written on success, and left alone otherwise. `$wpdb->update()`
		   passes a null through `prepare()`, which turns it into an empty
		   string — and an empty string in a DATETIME column is either a
		   database error or a row claiming the report was sent in the year
		   zero, depending on how strict the host's MySQL happens to be. */
		if ( 'sent' === $status ) {
			$data['mail_sent_at'] = current_time( 'mysql', true );
		}

		$wpdb->update(
			Thallo_Vis_DB::leads_table(),
			$data,
			array( 'scan_id' => $scan_id )
		);
	}

	/**
	 * Sends the report again for a lead that never got it.
	 *
	 * Rebuilt from the stored scan rather than from anything kept on the lead,
	 * so the person receives the report that was actually run for them. That
	 * ties it to the retention window: once the scan row has been pruned there
	 * is nothing left to send, and saying so is better than sending a report
	 * assembled out of the four columns the lead row happens to keep.
	 *
	 * @return array array( 'ok' => bool, 'error' => string )
	 */
	public static function resend( $lead_id ) {
		$lead = self::get( $lead_id );
		if ( ! $lead ) {
			return array(
				'ok'    => false,
				'error' => __( 'That lead no longer exists.', 'thallo-visibility' ),
			);
		}

		$row = Thallo_Vis_DB::get( $lead['scan_id'] );
		if ( ! $row || empty( $row['state']['phase1'] ) ) {
			return array(
				'ok'    => false,
				'error' => __( 'The scan behind this lead has been pruned, so there is no report left to send. Run a fresh scan for this brand instead.', 'thallo-visibility' ),
			);
		}

		$state          = $row['state'];
		$state['email'] = $lead['email'];

		return self::send_report( $state );
	}

	/**
	 * Sends nothing but proof that sending works.
	 *
	 * The alternative way to find out is to run a whole scan and wait, which
	 * costs money and tells you about one address on one day. This is the check
	 * you want before switching anything on.
	 *
	 * @return array array( 'ok' => bool, 'error' => string )
	 */
	public static function send_test( $to ) {
		if ( ! is_email( $to ) ) {
			return array(
				'ok'    => false,
				'error' => __( 'That is not a valid email address.', 'thallo-visibility' ),
			);
		}

		return self::send(
			$to,
			__( '[Thallo] Test — outbound email is working', 'thallo-visibility' ),
			implode(
				"\n",
				array(
					'This is the test message from Visibility → Settings.',
					'',
					'If you are reading it, WordPress on this host can send mail and the',
					'visibility report will reach the people who ask for one.',
					'',
					'Sent from: ' . home_url(),
				)
			)
		);
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

		self::send(
			$to,
			sprintf( '[Thallo] Visibility scan · %s (%s)', $state['brand'], $state['domain'] ),
			implode( "\n", $lines )
		);
	}

	/**
	 * The report, sent to the person who asked for it.
	 *
	 * It went out as plain text on the argument that styled HTML from a company
	 * you met four minutes ago is what gets marked as spam. The argument was
	 * aimed at the wrong thing: what got it marked as spam was an unauthenticated
	 * From, and that is fixed above in headers(). What the text-only version cost
	 * was the report — a monospaced column of numbers is not something anybody
	 * forwards to a colleague, and being forwarded is most of why it is sent.
	 *
	 * So: a designed message, and the text version still goes with it as the
	 * alternative part rather than being dropped. Both are built here from the
	 * same figures, in the same order, so they cannot drift apart.
	 */
	private static function send_report( array $state ) {
		$phase1 = $state['phase1'];
		$phase2 = isset( $state['phase2'] ) ? $state['phase2'] : array();

		$grounded = isset( $phase2['grounded'] ) && ! empty( $phase2['grounded']['totalAnswers'] )
			? $phase2['grounded']
			: null;

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
			/* Both readings, and never one. The HTML copy and the screen both
			   refuse to collapse them into a single "share of voice", and a
			   plain-text part that did it anyway would be the same scan
			   contradicting itself in the same message. */
			sprintf(
				'Brand knowledge (web shut): %d%% — named in %d of %d answers.',
				$phase1['sovPct'],
				$phase1['mentions'],
				$phase1['totalAnswers']
			),
		);

		$lines[] = $grounded
			? sprintf(
				'AI visibility (web open):   %d%% — named in %d of %d answers.',
				$grounded['sovPct'],
				$grounded['mentions'],
				$grounded['totalAnswers']
			)
			: 'AI visibility (web open):   not measured on this scan — which is not a zero.';

		$lines[] = '';
		$lines[] = 'The two are never averaged. The first is reputation the models carry with them;';
		$lines[] = 'the second is presence they can find when they look. The gap is the diagnosis.';

		if ( null !== $phase1['avgPosition'] ) {
			$lines[] = '';
			$lines[] = sprintf( 'Average rank when named: %s.', $phase1['avgPosition'] );
		}

		$lines[] = '';

		foreach ( $phase1['providers'] as $provider ) {
			$label = ucfirst( $provider['provider'] );

			if ( ! empty( $provider['error'] ) ) {
				$lines[] = sprintf( '  %-10s not measured (%s)', $label, $provider['error'] );
				continue;
			}

			/* Out of the answers this model gave, not the questions it was asked.
			   The two differ whenever a call fails, and the share of voice above
			   counts only answers that came back — so dividing by questions here
			   reported a model whose call failed as having said nothing about the
			   brand, in a message the reader cannot cross-check against the
			   screen. */
			$lines[] = sprintf( '  %-10s %d of %d answers', $label, $provider['mentions'], count( $provider['answers'] ) );
		}

		if ( ! empty( $phase2['keyInsight'] ) ) {
			$lines[] = '';
			$lines[] = 'WHAT THIS SAYS';
			$lines[] = $phase2['keyInsight'];
		}

		if ( ! empty( $phase2['entity'] ) ) {
			$lines[] = '';
			$lines[] = 'HOW THE MODELS DESCRIBE YOU';
			foreach ( $phase2['entity'] as $row ) {
				$lines[] = sprintf( '  %-10s %s', ucfirst( $row['provider'] ), $row['verdict'] );
				if ( 'mismatch' === $row['verdict'] && ! empty( $row['claimedDomain'] ) ) {
					$lines[] = sprintf( '             gives the website as %s, not %s', $row['claimedDomain'], $state['domain'] );
				} elseif ( '' !== trim( (string) $row['what'] ) ) {
					$lines[] = '             ' . $row['what'];
				}
			}
			if ( ! empty( $phase2['entityReading'] ) ) {
				$lines[] = '  ' . $phase2['entityReading'];
			}
		}

		if ( ! empty( $phase2['competitors'] ) ) {
			$lines[] = '';
			$lines[] = 'RECOMMENDED INSTEAD OF YOU';
			foreach ( array_slice( $phase2['competitors'], 0, 5 ) as $index => $competitor ) {
				$lines[] = sprintf( '  %d. %s — %d mentions', $index + 1, $competitor['name'], $competitor['mentions'] );
			}
		}

		if ( ! empty( $phase2['sources'] ) ) {
			$lines[] = '';
			$lines[] = 'WHERE THOSE ANSWERS WERE READ FROM';
			foreach ( array_slice( $phase2['sources'], 0, 8 ) as $source ) {
				$verdict = ! empty( $source['own'] )
					? 'your own site'
					: ( ! empty( $source['brand'] ) ? $state['brand'] . ' is in it' : 'not in it' );
				$lines[] = sprintf( '  %-28s %s', $source['host'], $verdict );
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

		if ( ! empty( $phase2['signals'] ) ) {
			$lines[] = '';
			$lines[] = sprintf( 'TECHNICAL READ OF %s', strtoupper( $state['domain'] ) );
			foreach ( $phase2['signals'] as $signal ) {
				$mark    = 'pass' === $signal['status'] ? '[x]' : ( 'warn' === $signal['status'] ? '[!]' : '[ ]' );
				$lines[] = sprintf( '  %s %s', $mark, $signal['label'] );
			}
		}

		/* The method, at the bottom, where a forwarded copy can be checked
		   against it. A percentage with no method attached is an opinion inside
		   somebody else's company. */
		$lines[] = '';
		$lines[] = 'THE SCAN ON RECORD';
		$lines[] = sprintf( '  Run     %s UTC', gmdate( 'j F Y, H:i', strtotime( (string) $phase1['scannedAt'] ) ?: time() ) );
		$lines[] = sprintf( '  Market  %s', isset( $state['market'] ) ? $state['market'] : 'en-US' );
		$lines[] = '  Questions asked';
		foreach ( $phase1['questions'] as $index => $question ) {
			$lines[] = sprintf( '    %d · %s', $index + 1, $question );
		}

		$lines[] = '';
		$lines[] = 'Measuring it is the easy half. If you want the content, citations and structure';
		$lines[] = 'that move these numbers, reply to this email and we will take a look properly.';
		$lines[] = '';
		$lines[] = '— Thallo Digital';
		$lines[] = home_url();

		$result = self::send(
			$state['email'],
			/* The figure goes in the subject line. "Your AI visibility scan" says
			   only that we sent something; the number is the reason to open it,
			   and it is the same number the screen showed them. */
			sprintf(
				/* translators: 1: brand, 2: share of voice percentage. */
				__( '%1$s: named in %2$d%% of AI answers', 'thallo-visibility' ),
				$state['brand'],
				(int) $phase1['sovPct']
			),
			implode( "\n", $lines ),
			Thallo_Vis_Email_Template::report( $state, $phase1, $phase2 )
		);

		self::record_mail_result( $state['scan_id'], $result['ok'] ? 'sent' : 'failed', $result['error'] );

		return $result;
	}

	/** One lead, by row id. What the "monitor this brand" button acts on. */
	public static function get( $id ) {
		global $wpdb;
		$table = Thallo_Vis_DB::leads_table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $table WHERE id = %d", (int) $id ), ARRAY_A );
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
		$rows = $wpdb->get_results( "SELECT created_at, email, brand, domain, industry, sov_pct, grade, mail_status FROM $table ORDER BY created_at DESC", ARRAY_A );

		nocache_headers();
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename=thallo-visibility-leads-' . gmdate( 'Y-m-d' ) . '.csv' );

		$out = fopen( 'php://output', 'w' );
		fputcsv( $out, array( 'Date (UTC)', 'Email', 'Brand', 'Website', 'Category', 'Share of voice %', 'Grade', 'Report email' ) );

		foreach ( (array) $rows as $row ) {
			fputcsv( $out, $row );
		}

		fclose( $out );
		exit;
	}
}
