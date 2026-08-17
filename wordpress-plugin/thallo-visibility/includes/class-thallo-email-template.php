<?php
/**
 * The report, as an email.
 *
 * Written the way email has to be written rather than the way a web page is:
 * tables for layout, styles inline on every element, a fixed 600px column, no
 * external images and no web fonts. Outlook renders with Word's engine, Gmail
 * strips <style> blocks in some clients, and dark mode inverts what it likes —
 * none of that is worth fighting, so nothing here depends on winning.
 *
 * What it is NOT is a brochure. The person reading has the full report open in
 * a tab; this is the copy they keep, forward to a colleague, and find again in
 * six weeks. So the number they came for is the first thing in it, every figure
 * is stated with what it was measured out of, and there is exactly one call to
 * action at the bottom rather than three scattered through.
 *
 * The only image is the logo, and it is treated as optional by construction:
 * most clients block remote images until the reader asks, so its alt text is the
 * company name rather than the word "logo". Blocked, the header still says who
 * this is from. Nothing else in here is an image — every bar and rule is drawn
 * with table cells, because a chart that arrives as a broken-image icon is worse
 * than a number.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Email_Template {

	/**
	 * Where the logo lives.
	 *
	 * The scheme and host of this WordPress, with the path thrown away — not
	 * `home_url( '/logo.png' )`. WordPress runs at /blog/ on this account, so
	 * that would point at /blog/logo.png, which does not exist; the file belongs
	 * to the static site at the domain root. An email cannot use a relative path,
	 * so it has to be built rather than assumed, and getting it wrong shows as a
	 * broken image in every inbox rather than as an error anywhere we would see.
	 */
	public static function logo_url() {
		return self::site_url( '/logo.png' );
	}

	/**
	 * A link back to the website, which is not this WordPress.
	 *
	 * The scheme and host of `home_url()` with the path thrown away. WordPress
	 * runs at /blog/ on this account, so `home_url( '/contact/' )` would point at
	 * /blog/contact/ — a page that does not exist. The pages a reader is being
	 * sent to belong to the static export at the domain root, and a 404 in an
	 * email is a failure nobody at our end ever sees.
	 */
	public static function site_url( $path = '/' ) {
		$parts  = wp_parse_url( home_url() );
		$scheme = isset( $parts['scheme'] ) ? $parts['scheme'] : 'https';
		$host   = isset( $parts['host'] ) ? $parts['host'] : '';

		return $host ? $scheme . '://' . $host . $path : home_url( $path );
	}

	const OLIVE = '#39471D';
	const TINT  = '#E7ECD9';
	const INK   = '#1F2421';
	const MUTED = '#6B7280';
	const LINE  = '#E5E7EB';

	/**
	 * The whole report, assembled.
	 *
	 * Composed here rather than in Thallo_Vis_Leads so that the sending code
	 * stays about sending — what left, whether it arrived, what the server said.
	 * The plain-text version is built alongside it there, from the same figures
	 * in the same order, and the two are sent as one message.
	 */
	public static function report( array $state, array $phase1, array $phase2 ) {
		$body  = self::paragraph( sprintf( 'Here is what the AI models say about %s.', $state['brand'] ) );
		$body .= self::score_block(
			(int) $phase1['sovPct'],
			sprintf(
				/* translators: 1: times named, 2: answers read. */
				__( 'Named in %1$d of the %2$d answers we read.', 'thallo-visibility' ),
				$phase1['mentions'],
				$phase1['totalAnswers']
			)
		);

		$body .= self::note(
			sprintf(
				/* translators: 1: how many questions, 2: the category. */
				__( 'We put %1$d buying questions about %2$s to ChatGPT, Claude and Gemini, with the web shut — so this is what they already knew. Your name never appeared in a question, which means an answer that names you was not led there.', 'thallo-visibility' ),
				count( $phase1['questions'] ),
				strtolower( $state['industry'] )
			)
		);

		if ( null !== $phase1['avgPosition'] ) {
			$body .= self::note(
				sprintf(
					/* translators: %s: average position, e.g. 2.3. */
					__( 'When you were named, your average position in the list was %s.', 'thallo-visibility' ),
					$phase1['avgPosition']
				)
			);
		}

		$body .= self::heading( __( 'Model by model', 'thallo-visibility' ) );
		$body .= self::rows( self::provider_rows( $phase1 ) );

		if ( ! empty( $phase2['keyInsight'] ) ) {
			$body .= self::divider();
			$body .= self::heading( __( 'What it means', 'thallo-visibility' ) );
			$body .= self::paragraph( $phase2['keyInsight'] );
		}

		if ( ! empty( $phase2['competitors'] ) ) {
			$body .= self::heading( __( 'Recommended instead of you', 'thallo-visibility' ) );
			$body .= self::rows( self::competitor_rows( $phase2['competitors'] ) );
		}

		if ( ! empty( $phase2['actions'] ) ) {
			$body .= self::divider();
			$body .= self::heading( __( 'What to do first', 'thallo-visibility' ) );
			foreach ( $phase2['actions'] as $index => $action ) {
				$body .= self::step( $index + 1, $action['title'], $action['detail'] );
			}
		}

		$body .= self::divider();
		$body .= self::paragraph(
			__( 'Measuring it is the easy half. If you want the content, the citations and the structure that move these numbers, reply to this email — a person reads it.', 'thallo-visibility' )
		);
		$body .= self::button( __( 'Talk to us', 'thallo-visibility' ), self::site_url( '/contact/' ) );

		return self::wrap(
			sprintf( 'Your AI visibility scan — %s', $state['brand'] ),
			sprintf(
				/* translators: 1: times named, 2: answers read, 3: the category. */
				__( 'Named in %1$d of %2$d answers about %3$s. Here is who was named instead, and what to do about it.', 'thallo-visibility' ),
				$phase1['mentions'],
				$phase1['totalAnswers'],
				strtolower( $state['industry'] )
			),
			$body
		);
	}

	/**
	 * One row per model.
	 *
	 * Out of the answers that model gave, not the questions it was asked. The
	 * two differ whenever a call fails, and the headline counts only answers
	 * that came back — two figures from one run that do not reconcile is how a
	 * report loses its reader in the ten seconds they spend checking it.
	 */
	private static function provider_rows( array $phase1 ) {
		$labels = Thallo_Vis_Runner::STEP_LABELS;
		$rows   = '';

		foreach ( $phase1['providers'] as $provider ) {
			$label = isset( $labels[ $provider['provider'] ] ) ? $labels[ $provider['provider'] ] : $provider['provider'];

			if ( ! empty( $provider['error'] ) ) {
				$rows .= self::bar_row( $label, __( 'not measured', 'thallo-visibility' ), 0 );
				continue;
			}

			$answers = count( $provider['answers'] );
			$pct     = $answers ? (int) round( ( $provider['mentions'] / $answers ) * 100 ) : 0;

			$rows .= self::bar_row(
				$label,
				sprintf( '%d of %d · %d%%', $provider['mentions'], $answers, $pct ),
				$pct,
				$provider['mentions'] > 0
			);
		}

		return $rows;
	}

	/** Scaled against the strongest rival, so a category nobody dominates does
	    not render as five empty bars and read as a rendering fault. */
	private static function competitor_rows( array $competitors ) {
		$top  = 1;
		$rows = '';

		foreach ( $competitors as $competitor ) {
			$top = max( $top, (int) $competitor['mentions'] );
		}

		foreach ( array_slice( $competitors, 0, 5 ) as $competitor ) {
			$rows .= self::bar_row(
				$competitor['name'],
				sprintf(
					/* translators: %d: how many answers named this company. */
					_n( '%d mention', '%d mentions', (int) $competitor['mentions'], 'thallo-visibility' ),
					(int) $competitor['mentions']
				),
				(int) round( ( $competitor['mentions'] / $top ) * 100 )
			);
		}

		return $rows;
	}

	/**
	 * @param string $preheader The line clients show beside the subject in the
	 *                          inbox list. Left unset it is filled with whatever
	 *                          text comes first, which is usually "View this
	 *                          email" or a stray heading — one of the cheapest
	 *                          things to get right and the most often skipped.
	 */
	public static function wrap( $title, $preheader, $body, $footer = '' ) {
		$site = get_bloginfo( 'name' );

		return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">'
			. '<meta name="viewport" content="width=device-width,initial-scale=1">'
			. '<meta name="color-scheme" content="light">'
			. '<title>' . esc_html( $title ) . '</title></head>'
			. '<body style="margin:0;padding:0;background:#F3F4F1;">'
			/* Hidden, then padded with zero-width joiners so the client does not
			   pull the next line of real copy in after it. */
			. '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">'
			. esc_html( $preheader ) . str_repeat( '&#847;&zwnj;&nbsp;', 30 ) . '</div>'
			. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F3F4F1;">'
			. '<tr><td align="center" style="padding:28px 12px;">'
			. '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#FFFFFF;border:1px solid ' . self::LINE . ';border-radius:14px;overflow:hidden;">'
			/* The logo sits on white, not on the olive band it used to be.
			   The mark is a dark wordmark on a transparent background — on olive
			   it is very nearly invisible, and an invisible logo is worse than
			   none. The olive stays as the rule under it.

			   Two cells rather than a float: Outlook renders with Word's engine
			   and ignores float outright, which would drop the right-hand label
			   onto its own line under the mark.

			   Most clients block remote images until the reader asks for them, so
			   the alt text is the company name rather than "logo" — blocked, the
			   header still says who this is from. */
			. '<tr><td style="padding:22px 28px 18px;background:#FFFFFF;">'
			. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>'
			. '<td><img src="' . esc_url( self::logo_url() ) . '" width="150" alt="' . esc_attr( $site ) . '"'
			. ' style="display:block;border:0;outline:none;text-decoration:none;width:150px;max-width:150px;height:auto;font:700 15px/1.2 Helvetica,Arial,sans-serif;color:' . self::INK . ';"></td>'
			. '<td align="right" style="font:600 10px/1.2 Helvetica,Arial,sans-serif;color:' . self::OLIVE . ';letter-spacing:.14em;text-transform:uppercase;">AI visibility scan</td>'
			. '</tr></table>'
			. '</td></tr>'
			. '<tr><td style="height:4px;background:' . self::OLIVE . ';font-size:0;line-height:0;">&nbsp;</td></tr>'
			. '<tr><td style="padding:28px;">' . $body . '</td></tr>'
			. '</table>'
			. '<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;">'
			. '<tr><td style="padding:16px 8px;font:400 11px/1.7 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';text-align:center;">'
			/* Why this message exists, in the reader's terms — and it is not the
			   same sentence for a report somebody asked for as for a reply to
			   somebody who wrote in. A footer explaining the wrong thing is the
			   detail that makes an email feel automated. */
			. esc_html( '' !== $footer ? $footer : __( 'You are receiving this because you asked for this scan on our website. Reply to this email and a person will read it.', 'thallo-visibility' ) )
			. '<br>' . esc_html( $site ) . ' · <a href="' . esc_url( home_url() ) . '" style="color:' . self::MUTED . ';">' . esc_html( wp_parse_url( home_url(), PHP_URL_HOST ) ) . '</a>'
			. '</td></tr></table>'
			. '</td></tr></table></body></html>';
	}

	/** The headline figure, stated with its denominator so it cannot be misread. */
	public static function score_block( $pct, $caption ) {
		return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' . self::TINT . ';border-radius:12px;margin:0 0 22px;">'
			. '<tr><td style="padding:22px 24px;text-align:center;">'
			. '<div style="font:700 46px/1 Helvetica,Arial,sans-serif;color:' . self::OLIVE . ';">' . esc_html( $pct ) . '%</div>'
			. '<div style="font:600 11px/1.4 Helvetica,Arial,sans-serif;color:' . self::OLIVE . ';letter-spacing:.14em;text-transform:uppercase;padding-top:8px;">' . esc_html__( 'Share of voice', 'thallo-visibility' ) . '</div>'
			. '<div style="font:400 13px/1.6 Helvetica,Arial,sans-serif;color:' . self::INK . ';padding-top:10px;">' . esc_html( $caption ) . '</div>'
			. '</td></tr></table>';
	}

	public static function heading( $text ) {
		return '<h2 style="margin:26px 0 12px;font:700 12px/1.4 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';letter-spacing:.14em;text-transform:uppercase;">'
			. esc_html( $text ) . '</h2>';
	}

	public static function paragraph( $text ) {
		return '<p style="margin:0 0 14px;font:400 14px/1.65 Helvetica,Arial,sans-serif;color:' . self::INK . ';">' . esc_html( $text ) . '</p>';
	}

	/**
	 * A bar drawn as a table cell, because that is the only bar every client
	 * renders. No images, no CSS a filter can strip.
	 */
	public static function bar_row( $label, $value, $pct, $emphasis = false ) {
		$pct   = max( 0, min( 100, (int) $pct ) );
		$track = self::LINE;
		$fill  = $emphasis ? self::OLIVE : '#9CA3AF';

		return '<tr>'
			. '<td style="padding:7px 0;font:600 13px/1.4 Helvetica,Arial,sans-serif;color:' . self::INK . ';width:130px;">' . esc_html( $label ) . '</td>'
			. '<td style="padding:7px 10px;">'
			. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' . $track . ';border-radius:99px;">'
			. '<tr><td style="width:' . $pct . '%;background:' . $fill . ';border-radius:99px;font-size:0;line-height:0;height:7px;">&nbsp;</td>'
			. '<td style="font-size:0;line-height:0;height:7px;">&nbsp;</td></tr></table>'
			. '</td>'
			. '<td style="padding:7px 0;font:400 12px/1.4 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';text-align:right;white-space:nowrap;">' . esc_html( $value ) . '</td>'
			. '</tr>';
	}

	public static function rows( $inner ) {
		return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">' . $inner . '</table>';
	}

	/** A numbered item with a sentence under it — the action plan's shape. */
	public static function step( $index, $title, $detail ) {
		return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 12px;">'
			. '<tr>'
			. '<td valign="top" style="width:26px;font:700 13px/1.5 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';">' . esc_html( sprintf( '%02d', $index ) ) . '</td>'
			. '<td valign="top">'
			. '<div style="font:700 14px/1.5 Helvetica,Arial,sans-serif;color:' . self::INK . ';">' . esc_html( $title ) . '</div>'
			. '<div style="font:400 13px/1.6 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';padding-top:3px;">' . esc_html( $detail ) . '</div>'
			. '</td></tr></table>';
	}

	/**
	 * The one button. Written as a table so Outlook draws the background — a
	 * styled <a> there renders as a bare blue link on a white box.
	 */
	public static function button( $label, $url ) {
		return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:22px 0 6px;">'
			. '<tr><td style="background:' . self::OLIVE . ';border-radius:8px;">'
			. '<a href="' . esc_url( $url ) . '" style="display:inline-block;padding:13px 24px;font:700 13px/1 Helvetica,Arial,sans-serif;color:#FFFFFF;text-decoration:none;">'
			. esc_html( $label ) . '</a>'
			. '</td></tr></table>';
	}

	public static function divider() {
		return '<div style="height:1px;background:' . self::LINE . ';margin:24px 0;font-size:0;line-height:0;">&nbsp;</div>';
	}

	/** A label and its value, for the messages that are a record rather than a
	    finding — who wrote in, from where, about what. */
	public static function detail_row( $label, $value ) {
		return '<tr>'
			. '<td style="padding:5px 0;font:400 13px/1.5 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';width:140px;">' . esc_html( $label ) . '</td>'
			. '<td style="padding:5px 0;font:600 13px/1.5 Helvetica,Arial,sans-serif;color:' . self::INK . ';">' . esc_html( $value ) . '</td>'
			. '</tr>';
	}

	/**
	 * Their own words, quoted back.
	 *
	 * `nl2br` because a message typed into a textarea carries its line breaks,
	 * and HTML throws them away — a paragraph the sender wrote in three parts
	 * coming back as one block reads as though nobody looked at it.
	 */
	public static function quote( $text ) {
		return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;">'
			. '<tr><td style="padding:2px 0 2px 14px;border-left:3px solid ' . self::TINT . ';'
			. 'font:400 14px/1.65 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';">'
			. nl2br( esc_html( trim( (string) $text ) ) )
			. '</td></tr></table>';
	}

	/** Small print under a figure: what it was measured out of, and when. */
	public static function note( $text ) {
		return '<p style="margin:0 0 6px;font:400 12px/1.6 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';">' . esc_html( $text ) . '</p>';
	}
}
