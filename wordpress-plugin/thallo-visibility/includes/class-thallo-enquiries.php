<?php
/**
 * Somebody wrote to us.
 *
 * Until now the contact forms had no backend at all. `FORM_ENDPOINT` was an
 * empty string in both of them, so submitting opened the visitor's own mail
 * client with the fields pre-filled and hoped. That works when the visitor has
 * a mail client configured and does nothing at all when they do not — no row,
 * no notification, no way to know it happened. An enquiry from somebody who
 * read three pages and asked for the flagship engagement is the most valuable
 * event on the site, and it was the one thing not being recorded.
 *
 * So: the same shape as a scan lead. Stored first, then two messages — one to
 * us, one back to them. Stored first because that order is what makes the other
 * two recoverable: mail can fail, and a row with a failure written on it can be
 * answered by hand, where a message that never sent leaves nothing behind.
 *
 * The reply is not an autoresponder in the sales sense. It says what was
 * received, what happens next, and when — and then gets out of the way. The
 * thing it is really for is that a person who has just handed over their email
 * finds something in the inbox that proves the form worked.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Enquiries {

	/**
	 * @param array $input Already sanitised by the REST layer.
	 * @return int|WP_Error The new row id.
	 */
	public static function record( array $input ) {
		global $wpdb;

		$row = array(
			'name'       => $input['name'],
			'company'    => $input['company'],
			'email'      => $input['email'],
			'plans'      => implode( ', ', $input['plans'] ),
			'message'    => $input['message'],
			'page'       => $input['page'],
			'consent'    => $input['consent'] ? 1 : 0,
			'ip_hash'    => Thallo_Vis_DB::ip_hash(),
			'created_at' => current_time( 'mysql', true ),
		);

		if ( ! $wpdb->insert( Thallo_Vis_DB::enquiries_table(), $row ) ) {
			return new WP_Error(
				'enquiry_not_saved',
				__( 'We could not record that just now. Please email us directly and we will pick it up.', 'thallo-visibility' ),
				array( 'status' => 500 )
			);
		}

		$id       = (int) $wpdb->insert_id;
		$row['id'] = $id;

		self::notify_owner( $row );

		/* The reply is sent second and its outcome written onto the row. If it
		   fails, the enquiry is still ours and the Enquiries screen says the
		   person never heard back — which is the one thing worth knowing. */
		$result = self::reply( $row );

		$wpdb->update(
			Thallo_Vis_DB::enquiries_table(),
			array(
				'mail_status' => $result['ok'] ? 'sent' : 'failed',
				'mail_error'  => mb_substr( (string) $result['error'], 0, 500 ),
			),
			array( 'id' => $id )
		);

		return $id;
	}

	/**
	 * The copy that lands with us.
	 *
	 * Reply-To is the enquirer, so hitting reply in the inbox answers the person
	 * rather than the plugin. That one header is the difference between a
	 * notification and a conversation.
	 */
	private static function notify_owner( array $row ) {
		$to = Thallo_Vis_Settings::get( 'notify_email' );
		if ( ! $to || ! is_email( $to ) ) {
			return;
		}

		$body  = Thallo_Vis_Email_Template::paragraph(
			sprintf(
				/* translators: %s: the person's name. */
				__( '%s wrote to us through the website.', 'thallo-visibility' ),
				$row['name'] ? $row['name'] : $row['email']
			)
		);
		$body .= Thallo_Vis_Email_Template::rows(
			Thallo_Vis_Email_Template::detail_row( __( 'Email', 'thallo-visibility' ), $row['email'] )
			. Thallo_Vis_Email_Template::detail_row( __( 'Business', 'thallo-visibility' ), $row['company'] ? $row['company'] : '—' )
			. Thallo_Vis_Email_Template::detail_row( __( 'Interested in', 'thallo-visibility' ), $row['plans'] ? $row['plans'] : __( 'not stated', 'thallo-visibility' ) )
			. Thallo_Vis_Email_Template::detail_row( __( 'Came from', 'thallo-visibility' ), $row['page'] ? $row['page'] : '—' )
			. Thallo_Vis_Email_Template::detail_row( __( 'Consent', 'thallo-visibility' ), $row['consent'] ? __( 'given', 'thallo-visibility' ) : __( 'not given', 'thallo-visibility' ) )
		);

		if ( '' !== trim( (string) $row['message'] ) ) {
			$body .= Thallo_Vis_Email_Template::divider();
			$body .= Thallo_Vis_Email_Template::heading( __( 'What they said', 'thallo-visibility' ) );
			$body .= Thallo_Vis_Email_Template::paragraph( $row['message'] );
		}

		Thallo_Vis_Leads::send_message(
			$to,
			sprintf(
				/* translators: 1: company or name, 2: plans of interest. */
				__( '[Enquiry] %1$s — %2$s', 'thallo-visibility' ),
				$row['company'] ? $row['company'] : $row['name'],
				$row['plans'] ? $row['plans'] : __( 'no plan named', 'thallo-visibility' )
			),
			self::owner_text( $row ),
			Thallo_Vis_Email_Template::wrap(
				__( 'New enquiry', 'thallo-visibility' ),
				sprintf( '%s · %s', $row['email'], $row['plans'] ? $row['plans'] : __( 'no plan named', 'thallo-visibility' ) ),
				$body,
				__( 'Sent by the visibility plugin on this site. Replying to this message answers the person who wrote in.', 'thallo-visibility' )
			),
			$row['email']
		);
	}

	/**
	 * The reply that lands with them.
	 *
	 * Three things and nothing else: we have it, here is what you asked about,
	 * here is when you will hear from a person. No pitch — they have just read
	 * the site, and selling to somebody who has already put their hand up is how
	 * a first impression gets spent for nothing.
	 */
	private static function reply( array $row ) {
		$first = self::first_name( $row['name'] );

		$body  = Thallo_Vis_Email_Template::paragraph(
			$first
				/* translators: %s: the person's first name. */
				? sprintf( __( 'Thanks, %s — we have your message.', 'thallo-visibility' ), $first )
				: __( 'Thanks — we have your message.', 'thallo-visibility' )
		);
		$body .= Thallo_Vis_Email_Template::paragraph(
			__( 'A person reads every one of these, so this is the last automatic email you will get from us. You will hear back within one working day, from someone who has looked at your site first.', 'thallo-visibility' )
		);

		if ( '' !== $row['plans'] ) {
			$body .= Thallo_Vis_Email_Template::heading( __( 'What you asked about', 'thallo-visibility' ) );
			$body .= Thallo_Vis_Email_Template::paragraph( $row['plans'] );
		}

		if ( '' !== trim( (string) $row['message'] ) ) {
			$body .= Thallo_Vis_Email_Template::heading( __( 'What you sent us', 'thallo-visibility' ) );
			/* Their own words back to them: it is the receipt. A confirmation
			   that does not show what was received is asking to be trusted. */
			$body .= Thallo_Vis_Email_Template::quote( $row['message'] );
		}

		$body .= Thallo_Vis_Email_Template::divider();
		$body .= Thallo_Vis_Email_Template::paragraph(
			__( 'While you wait, you can run our AI visibility scan on your own site. It is the same measurement we start a client engagement with: which models name you when a buyer asks, and who they name instead.', 'thallo-visibility' )
		);
		$body .= Thallo_Vis_Email_Template::button(
			__( 'Run the scan', 'thallo-visibility' ),
			Thallo_Vis_Email_Template::site_url( '/thallo-ai/scan/' )
		);

		return Thallo_Vis_Leads::send_message(
			$row['email'],
			__( 'We have your message', 'thallo-visibility' ),
			self::reply_text( $row, $first ),
			Thallo_Vis_Email_Template::wrap(
				__( 'We have your message', 'thallo-visibility' ),
				__( 'A person will come back to you within one working day. Here is what we received.', 'thallo-visibility' ),
				$body,
				__( 'You are receiving this because you wrote to us through our website. Reply to this email and it reaches a person directly.', 'thallo-visibility' )
			)
		);
	}

	/** The plain-text half, written rather than stripped out of the HTML. */
	private static function reply_text( array $row, $first ) {
		$lines = array(
			$first ? sprintf( 'Thanks, %s — we have your message.', $first ) : 'Thanks — we have your message.',
			'',
			'A person reads every one of these, so this is the last automatic email you will get from us. You will hear back within one working day, from someone who has looked at your site first.',
		);

		if ( '' !== $row['plans'] ) {
			$lines[] = '';
			$lines[] = 'What you asked about: ' . $row['plans'];
		}

		if ( '' !== trim( (string) $row['message'] ) ) {
			$lines[] = '';
			$lines[] = 'What you sent us:';
			$lines[] = $row['message'];
		}

		$lines[] = '';
		$lines[] = 'While you wait, you can run our AI visibility scan on your own site:';
		$lines[] = Thallo_Vis_Email_Template::site_url( '/thallo-ai/scan/' );
		$lines[] = '';
		$lines[] = '— ' . get_bloginfo( 'name' );

		return implode( "\n", $lines );
	}

	private static function owner_text( array $row ) {
		return implode(
			"\n",
			array(
				sprintf( '%s wrote to us through the website.', $row['name'] ? $row['name'] : $row['email'] ),
				'',
				'Email:         ' . $row['email'],
				'Business:      ' . ( $row['company'] ? $row['company'] : '—' ),
				'Interested in: ' . ( $row['plans'] ? $row['plans'] : 'not stated' ),
				'Came from:     ' . ( $row['page'] ? $row['page'] : '—' ),
				'Consent:       ' . ( $row['consent'] ? 'given' : 'not given' ),
				'',
				(string) $row['message'],
			)
		);
	}

	/** First word of whatever they typed, and nothing if that is not a name. */
	private static function first_name( $name ) {
		$name  = trim( (string) $name );
		$first = $name ? strtok( $name, ' ' ) : '';

		return ( $first && mb_strlen( $first ) <= 40 ) ? $first : '';
	}

	public static function all( $limit = 200 ) {
		global $wpdb;
		$table = Thallo_Vis_DB::enquiries_table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table ORDER BY created_at DESC LIMIT %d", $limit ), ARRAY_A );
	}

	/** How many this address has sent lately. The only thing standing between a
	    public endpoint and a mailbox full of the same form. */
	public static function count_recent_for_ip( $since ) {
		global $wpdb;
		$table = Thallo_Vis_DB::enquiries_table();

		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- table name is not user input.
		return (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table WHERE ip_hash = %s AND created_at >= %s", Thallo_Vis_DB::ip_hash(), $since ) );
	}
}
