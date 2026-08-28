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
	/**
	 * ## This carries more than the screen does, on purpose
	 *
	 * The web report is the lead magnet: it has to be read in three minutes by
	 * somebody who has just handed over an address, and everything in it earns
	 * its place by being immediately legible. This is the document that gets
	 * forwarded. At this price point the person who ran the scan is very often
	 * not the person who approves the spend, so this has to survive being sent
	 * on to a director with no context and no tab open — which means it carries
	 * the parts the screen deliberately compresses:
	 *
	 *   · the full technical read, row by row, rather than a strip of ticks;
	 *   · the scan on record — when it ran, what was asked, which models, in
	 *     what market — so the numbers are defensible inside a company;
	 *   · the sources the searching models actually opened.
	 *
	 * Nothing here is a figure the screen did not show. It is the same scan,
	 * written for a reader who cannot ask the sender what a panel meant.
	 */
	public static function report( array $state, array $phase1, array $phase2 ) {
		$brand    = $state['brand'];
		$grounded = isset( $phase2['grounded'] ) && ! empty( $phase2['grounded']['totalAnswers'] )
			? $phase2['grounded']
			: null;

		$body = self::paragraph(
			sprintf(
				/* translators: 1: the brand, 2: the category, 3: the country. */
				__( 'Here is where %1$s stands in %2$s, %3$s.', 'thallo-visibility' ),
				$brand,
				strtolower( $state['industry'] ),
				self::country_of( $state )
			)
		);

		/* Two readings, side by side, never one.
		 *
		 * The screen makes a point of refusing to average them, because they
		 * have different causes and different fixes — reputation the model
		 * carries with it, and presence it can discover when it looks. An email
		 * that collapsed them into a single "share of voice" would be the same
		 * report contradicting itself between two surfaces, which is the fastest
		 * way to lose a reader who is checking. */
		$body .= self::reading_block( $phase1, $grounded );

		$body .= self::note(
			sprintf(
				/* translators: 1: how many questions, 2: the category. */
				__( 'We put %1$d buying questions about %2$s to ChatGPT, Claude and Gemini. Your name never appeared in a question, so an answer that names you was not led there.', 'thallo-visibility' ),
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

		if ( ! empty( $phase2['keyInsight'] ) ) {
			$body .= self::heading( __( 'What this says', 'thallo-visibility' ) );
			$body .= self::paragraph( $phase2['keyInsight'] );
		}

		/* Early, and above the leaderboard. When the share of answer is zero —
		   which it is for most brands that run this — the leaderboard is a list
		   of other people's names and this is the only section with something to
		   say about the reader's own company. */
		if ( ! empty( $phase2['entity'] ) ) {
			$body .= self::divider();
			$body .= self::heading( __( 'How the models describe you', 'thallo-visibility' ) );
			$body .= self::rows( self::entity_rows( $phase2['entity'], $state['domain'] ) );

			if ( ! empty( $phase2['entityReading'] ) ) {
				$body .= self::note( $phase2['entityReading'] );
			}
		}

		$body .= self::heading( __( 'Model by model', 'thallo-visibility' ) );
		$body .= self::rows( self::provider_rows( $phase1 ) );

		if ( ! empty( $phase2['competitors'] ) ) {
			$body .= self::divider();
			$body .= self::heading( __( 'Recommended instead of you', 'thallo-visibility' ) );
			$body .= self::rows( self::competitor_rows( $phase2['competitors'] ) );
		}

		if ( ! empty( $phase2['sources'] ) ) {
			$body .= self::divider();
			$body .= self::heading( __( 'Where those answers were read from', 'thallo-visibility' ) );
			$body .= self::note(
				__( 'The pages the models opened before answering. This is the shortest description available of what earns a recommendation in your category.', 'thallo-visibility' )
			);
			$body .= self::rows( self::source_rows( $phase2['sources'], $brand ) );
		}

		if ( ! empty( $phase2['actions'] ) ) {
			$body .= self::divider();
			$body .= self::heading( __( 'What to do first', 'thallo-visibility' ) );
			foreach ( $phase2['actions'] as $index => $action ) {
				$body .= self::step( $index + 1, $action['title'], $action['detail'] );
			}
		}

		/* The full breakdown, which the screen deliberately compresses to a
		   strip of ticks. It is genuinely useful to a technical reader and it is
		   the least interesting thing on a page somebody has ten seconds for —
		   so it lives here, where a reader has arrived on purpose. */
		if ( ! empty( $phase2['signals'] ) ) {
			$body .= self::divider();
			$body .= self::heading(
				sprintf(
					/* translators: %s: the website that was checked. */
					__( 'Technical read of %s', 'thallo-visibility' ),
					$state['domain']
				)
			);
			$body .= self::rows( self::signal_rows( $phase2['signals'] ) );
		}

		$body .= self::divider();
		$body .= self::heading( __( 'The scan on record', 'thallo-visibility' ) );
		$body .= self::rows( self::record_rows( $state, $phase1, $grounded ) );

		$body .= self::divider();
		$body .= self::paragraph(
			__( 'Measuring it is the easy half. If you want the research, the citations and the structure that move these numbers, reply to this email — a person reads it.', 'thallo-visibility' )
		);
		$body .= self::button( __( 'Talk to us', 'thallo-visibility' ), self::site_url( '/contact/' ) );

		return self::wrap(
			sprintf( 'Your AI visibility scan — %s', $brand ),
			sprintf(
				/* translators: 1: times named, 2: answers read, 3: the category. */
				__( 'Named in %1$d of %2$d answers about %3$s. Here is who was named instead, and where those answers were read from.', 'thallo-visibility' ),
				$phase1['mentions'],
				$phase1['totalAnswers'],
				strtolower( $state['industry'] )
			),
			$body
		);
	}

	/** The market's country, for the opening sentence. */
	private static function country_of( array $state ) {
		$market = isset( $state['market'] ) ? $state['market'] : Thallo_Vis_Questions::DEFAULT_MARKET;

		return preg_replace( '/^the /', '', Thallo_Vis_Questions::country_of( $market ) );
	}

	/**
	 * The two readings, in one tinted block.
	 *
	 * Two cells of a table rather than two stacked blocks, because side by side
	 * is the whole argument: these are two measurements of different things, and
	 * anything that presents one above the other invites a reader to treat the
	 * first as the real number and the second as a footnote. Collapses to one
	 * column on a phone through the `.stack` class in the head, which is the
	 * only responsive tool an email reliably has.
	 *
	 * When the searching half did not run, the block says so in words rather
	 * than showing a second 0% — "not measured" and "zero" are different
	 * findings and only one of them is about the reader.
	 */
	private static function reading_block( array $phase1, $grounded ) {
		$cell = static function ( $pct, $label, $caption ) {
			return '<td class="stack" width="50%" valign="top" style="padding:20px 18px;text-align:center;">'
				. '<div style="font:700 40px/1 Helvetica,Arial,sans-serif;color:' . self::OLIVE . ';">' . esc_html( $pct ) . '</div>'
				. '<div style="font:700 10px/1.4 Helvetica,Arial,sans-serif;color:' . self::OLIVE . ';letter-spacing:.14em;text-transform:uppercase;padding-top:8px;">' . esc_html( $label ) . '</div>'
				. '<div style="font:400 12px/1.55 Helvetica,Arial,sans-serif;color:' . self::INK . ';padding-top:8px;">' . esc_html( $caption ) . '</div>'
				. '</td>';
		};

		$left = $cell(
			$phase1['sovPct'] . '%',
			__( 'Brand knowledge', 'thallo-visibility' ),
			sprintf(
				/* translators: 1: times named, 2: answers read. */
				__( 'Named in %1$d of %2$d answers given with the web shut.', 'thallo-visibility' ),
				$phase1['mentions'],
				$phase1['totalAnswers']
			)
		);

		$right = $grounded
			? $cell(
				$grounded['sovPct'] . '%',
				__( 'AI visibility', 'thallo-visibility' ),
				sprintf(
					/* translators: 1: times named, 2: answers read. */
					__( 'Named in %1$d of %2$d answers given with the web open.', 'thallo-visibility' ),
					$grounded['mentions'],
					$grounded['totalAnswers']
				)
			)
			: $cell(
				'—',
				__( 'AI visibility', 'thallo-visibility' ),
				__( 'Not measured on this scan. That is not a zero — the searching half did not run.', 'thallo-visibility' )
			);

		return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' . self::TINT . ';border-radius:12px;margin:0 0 18px;">'
			. '<tr>' . $left . $right . '</tr></table>'
			. '<p style="margin:0 0 18px;font:400 12px/1.6 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';">'
			. esc_html__( 'Both are share of answer — how often you are named across every answer read. They are never added together or averaged: the first is reputation the models carry with them, earned off your own site and slow to move; the second is presence they can discover when they look, which your own pages and citations control. The distance between the two is the diagnosis.', 'thallo-visibility' )
			. '</p>';
	}

	/**
	 * One row per model for the direct question.
	 *
	 * The verdict alone is an assertion, so the model's own sentence is printed
	 * beside it — and on a wrong-company verdict the website it named goes in
	 * too, because that string is the entire evidence and an accusation nobody
	 * can check is worse than no row at all.
	 */
	private static function entity_rows( array $entity, $domain ) {
		$labels   = Thallo_Vis_Runner::STEP_LABELS;
		$verdicts = array(
			'resolved'    => __( 'Resolved', 'thallo-visibility' ),
			'partial'     => __( 'Partial', 'thallo-visibility' ),
			'mismatch'    => __( 'Wrong company', 'thallo-visibility' ),
			'unknown'     => __( 'Not recognised', 'thallo-visibility' ),
			'unavailable' => __( 'Not measured', 'thallo-visibility' ),
		);

		$rows = '';

		foreach ( $entity as $row ) {
			$label   = isset( $labels[ $row['provider'] ] ) ? $labels[ $row['provider'] ] : $row['provider'];
			$verdict = isset( $verdicts[ $row['verdict'] ] ) ? $verdicts[ $row['verdict'] ] : $row['verdict'];
			$colour  = 'resolved' === $row['verdict'] ? self::OLIVE : ( 'partial' === $row['verdict'] ? self::MUTED : '#A9502F' );

			if ( 'unknown' === $row['verdict'] ) {
				$detail = __( 'Asked directly, it says it does not recognise the name.', 'thallo-visibility' );
			} elseif ( 'unavailable' === $row['verdict'] ) {
				$detail = __( 'Could not be reached — a fault at our end, not a finding.', 'thallo-visibility' );
			} elseif ( 'mismatch' === $row['verdict'] && ! empty( $row['claimedDomain'] ) ) {
				$detail = sprintf(
					/* translators: 1: the website the model named, 2: the website being scanned. */
					__( 'It gives the website as %1$s, not %2$s. A buyer asking about you by name is being shown that company.', 'thallo-visibility' ),
					$row['claimedDomain'],
					$domain
				);
			} elseif ( 'partial' === $row['verdict'] ) {
				$detail = trim( $row['what'] ) . ' ' . __( 'It cannot say who you are for.', 'thallo-visibility' );
			} else {
				$detail = trim( $row['what'] . ( '' !== $row['serves'] ? ' ' . $row['serves'] : '' ) );
			}

			$rows .= '<tr><td style="padding:9px 0;border-bottom:1px solid ' . self::LINE . ';">'
				. '<div style="font:700 13px/1.5 Helvetica,Arial,sans-serif;color:' . self::INK . ';">'
				. esc_html( $label )
				. ' <span style="font-weight:400;color:' . $colour . ';">· ' . esc_html( $verdict ) . '</span>'
				. '</div>'
				. '<div style="font:400 12.5px/1.6 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';padding-top:3px;">' . esc_html( $detail ) . '</div>'
				. '</td></tr>';
		}

		return $rows;
	}

	/**
	 * One row per source the searching models opened.
	 *
	 * The right-hand column is the finding, not the count: whether the reader's
	 * own brand was in the answers that came off that page. "Not in it", five
	 * times down a column, is the sentence this whole section exists to make.
	 */
	private static function source_rows( array $sources, $brand ) {
		$rows = '';

		foreach ( array_slice( $sources, 0, 8 ) as $source ) {
			if ( ! empty( $source['own'] ) ) {
				$verdict = __( 'Your own site', 'thallo-visibility' );
				$colour  = self::MUTED;
			} elseif ( ! empty( $source['brand'] ) ) {
				$verdict = sprintf(
					/* translators: %s: the brand. */
					__( '%s is in it', 'thallo-visibility' ),
					$brand
				);
				$colour = self::OLIVE;
			} else {
				$verdict = __( 'Not in it', 'thallo-visibility' );
				$colour  = '#A9502F';
			}

			$named = ! empty( $source['names'] )
				? implode( ', ', array_slice( $source['names'], 0, 3 ) )
				: __( 'no company named', 'thallo-visibility' );

			$rows .= '<tr>'
				. '<td style="padding:9px 10px 9px 0;border-bottom:1px solid ' . self::LINE . ';font:600 12.5px/1.5 Menlo,Consolas,monospace;color:' . self::INK . ';">'
				. esc_html( $source['host'] )
				. '<div style="font:400 11.5px/1.5 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';padding-top:2px;">' . esc_html( $named ) . '</div>'
				. '</td>'
				. '<td align="right" valign="top" style="padding:9px 0;border-bottom:1px solid ' . self::LINE . ';font:600 12px/1.5 Helvetica,Arial,sans-serif;color:' . $colour . ';white-space:nowrap;">'
				. esc_html( $verdict )
				. '</td>'
				. '</tr>';
		}

		return $rows;
	}

	/**
	 * The technical checks, every one of them, with the note that explains it.
	 *
	 * A tick and a cross rather than a score per row. The points are printed
	 * because they are what the total is made of and somebody will add them up —
	 * but an unscored check prints "not scored" rather than "0 / 0", which reads
	 * as a failure.
	 */
	private static function signal_rows( array $signals ) {
		$rows = '';

		foreach ( $signals as $signal ) {
			$mark   = 'pass' === $signal['status'] ? '✓' : ( 'warn' === $signal['status'] ? '!' : '✕' );
			$colour = 'pass' === $signal['status'] ? self::OLIVE : ( 'warn' === $signal['status'] ? self::MUTED : '#A9502F' );

			$rows .= '<tr>'
				. '<td valign="top" style="width:20px;padding:8px 0;border-bottom:1px solid #F0F0EA;font:700 13px/1.5 Helvetica,Arial,sans-serif;color:' . $colour . ';">' . esc_html( $mark ) . '</td>'
				. '<td style="padding:8px 0;border-bottom:1px solid #F0F0EA;">'
				. '<div style="font:600 13px/1.5 Helvetica,Arial,sans-serif;color:' . self::INK . ';">' . esc_html( $signal['label'] ) . '</div>'
				. ( ! empty( $signal['note'] )
					? '<div style="font:400 11.5px/1.55 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';padding-top:2px;">' . esc_html( $signal['note'] ) . '</div>'
					: '' )
				. '</td>'
				. '<td align="right" valign="top" style="padding:8px 0;border-bottom:1px solid #F0F0EA;font:400 11px/1.6 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';white-space:nowrap;">'
				. esc_html( 0 === (int) $signal['weight'] ? __( 'not scored', 'thallo-visibility' ) : $signal['earned'] . ' / ' . $signal['weight'] )
				. '</td>'
				. '</tr>';
		}

		return $rows;
	}

	/**
	 * When it ran, what was asked, and of what.
	 *
	 * The section that makes this forwardable. A percentage with no method
	 * attached is an opinion inside somebody else's company; the same
	 * percentage with the date, the models, the market and the three exact
	 * questions under it is a measurement a reader can argue from — or check,
	 * which is the same thing.
	 */
	private static function record_rows( array $state, array $phase1, $grounded ) {
		$market = isset( $state['market'] ) ? $state['market'] : Thallo_Vis_Questions::DEFAULT_MARKET;
		$models = array();

		foreach ( $phase1['providers'] as $provider ) {
			if ( ! empty( $provider['model'] ) ) {
				$models[] = $provider['model'];
			}
		}

		$asked = count( $phase1['questions'] );

		/* Formatted from the stored timestamp with `gmdate`, not through
		   WordPress's date helpers. `scannedAt` is an ISO 8601 string already in
		   UTC, and passing it through the site's timezone would print a time
		   that disagrees with the "UTC" printed after it. */
		$ran  = strtotime( (string) $phase1['scannedAt'] );
		$rows = self::detail_row(
			__( 'Run', 'thallo-visibility' ),
			( $ran ? gmdate( 'j F Y, H:i', $ran ) : gmdate( 'j F Y, H:i' ) ) . ' UTC'
		);

		$rows .= self::detail_row(
			__( 'Market', 'thallo-visibility' ),
			$market . ' · ' . preg_replace( '/^the /', '', Thallo_Vis_Questions::country_of( $market ) )
		);

		$rows .= self::detail_row(
			__( 'Sample', 'thallo-visibility' ),
			$grounded
				? sprintf(
					/* translators: 1: questions asked, 2: answers from memory, 3: answers when searching. */
					__( '%1$d questions · %2$d answers from memory, %3$d when searching', 'thallo-visibility' ),
					$asked,
					(int) $phase1['totalAnswers'],
					(int) $grounded['totalAnswers']
				)
				: sprintf(
					/* translators: 1: questions asked, 2: answers read. */
					__( '%1$d questions · %2$d answers read', 'thallo-visibility' ),
					$asked,
					(int) $phase1['totalAnswers']
				)
		);

		if ( $models ) {
			$rows .= self::detail_row( __( 'Models', 'thallo-visibility' ), implode( ', ', array_unique( $models ) ) );
		}

		$rows .= '<tr><td colspan="2" style="padding:12px 0 4px;font:700 13px/1.5 Helvetica,Arial,sans-serif;color:' . self::INK . ';">'
			. esc_html__( 'Questions asked', 'thallo-visibility' ) . '</td></tr>';

		foreach ( $phase1['questions'] as $index => $question ) {
			$rows .= '<tr><td colspan="2" style="padding:2px 0;font:400 12.5px/1.6 Helvetica,Arial,sans-serif;color:' . self::MUTED . ';">'
				. esc_html( ( $index + 1 ) . ' · ' . $question ) . '</td></tr>';
		}

		return $rows;
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
			/* The only stylesheet in the whole message, and everything in it is
			   optional by construction: a client that strips <style> — Gmail's
			   web app does, on forwarded mail — gets two 50%-wide cells side by
			   side, which is legible on a phone, just tighter. Nothing here is
			   load-bearing, which is the only way a <style> block belongs in an
			   email at all. */
			. '<style>@media only screen and (max-width:480px){'
			. '.stack{display:block!important;width:100%!important;box-sizing:border-box!important;}'
			. '}</style>'
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

	/**
	 * A single headline figure, stated with its denominator and with a label
	 * given by the caller.
	 *
	 * The report no longer uses this — it prints the two readings side by side
	 * through `reading_block()`, because collapsing them into one number is
	 * exactly the thing the web report refuses to do and two surfaces of one
	 * scan must not disagree about that. It is kept for any message that
	 * genuinely has one figure to give, and the label is a parameter now rather
	 * than the hardcoded "Share of voice" it used to be: that string was a third
	 * name for a number the screen already called two other things.
	 */
	public static function score_block( $pct, $caption, $label = '' ) {
		$label = '' !== $label ? $label : __( 'Share of answer', 'thallo-visibility' );

		return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:' . self::TINT . ';border-radius:12px;margin:0 0 22px;">'
			. '<tr><td style="padding:22px 24px;text-align:center;">'
			. '<div style="font:700 46px/1 Helvetica,Arial,sans-serif;color:' . self::OLIVE . ';">' . esc_html( $pct ) . '%</div>'
			. '<div style="font:600 11px/1.4 Helvetica,Arial,sans-serif;color:' . self::OLIVE . ';letter-spacing:.14em;text-transform:uppercase;padding-top:8px;">' . esc_html( $label ) . '</div>'
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
