<?php
/**
 * The REST API the static site talks to.
 *
 *   POST thallo/v1/scan                 → start a scan
 *   POST thallo/v1/scan/{id}/tick       → advance it one step
 *   POST thallo/v1/scan/{id}/unlock     → hand over an email, open phase 2
 *   GET  thallo/v1/scan/{id}            → read it back without advancing
 *   GET  thallo/v1/status               → what is configured (administrators only)
 *
 * These endpoints are public and unauthenticated, because the visitor they
 * serve has no account and the tool would be worthless if they needed one. What
 * stands between them and somebody running the API bill up is: a per-visitor
 * daily limit, a whole-site daily limit, and an unguessable scan id.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_REST {

	const NS = 'thallo/v1';

	public static function register_routes() {
		register_rest_route(
			self::NS,
			'/scan',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'start' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'brand'    => array( 'required' => true ),
					'domain'   => array( 'required' => true ),
					'industry' => array( 'required' => true ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/scan/(?P<id>[a-f0-9]{32})/tick',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'tick' ),
				'permission_callback' => '__return_true',
			)
		);

		register_rest_route(
			self::NS,
			'/scan/(?P<id>[a-f0-9]{32})/unlock',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'unlock' ),
				'permission_callback' => '__return_true',
				'args'                => array( 'email' => array( 'required' => true ) ),
			)
		);

		register_rest_route(
			self::NS,
			'/scan/(?P<id>[a-f0-9]{32})',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'read' ),
				'permission_callback' => '__return_true',
			)
		);

		/*
		 * The contact forms.
		 *
		 * Public and unauthenticated, like the scan, and for the same reason:
		 * the person on the other end has no account and would not make one to
		 * ask a question. What stands between it and a mailbox full of the same
		 * form is a honeypot, a per-address daily cap, and the fact that there
		 * is nothing here worth spamming — no reply is published anywhere.
		 */
		register_rest_route(
			self::NS,
			'/enquiry',
			array(
				'methods'             => 'POST',
				'callback'            => array( __CLASS__, 'enquiry' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'email' => array( 'required' => true ),
				),
			)
		);

		register_rest_route(
			self::NS,
			'/status',
			array(
				'methods'             => 'GET',
				'callback'            => array( __CLASS__, 'status' ),
				'permission_callback' => static function () {
					// Which keys exist is not the public's business.
					return current_user_can( 'manage_options' );
				},
			)
		);

		self::send_cors_headers();
	}

	/**
	 * CORS.
	 *
	 * Not needed in the intended setup — the site sits at the domain root and
	 * WordPress at /blog/, so the API is same-origin. It exists for local
	 * development against a remote WordPress, and for the case where the site
	 * ends up on a different host from the blog. Empty by default: an
	 * `Access-Control-Allow-Origin: *` on an endpoint that spends money is not a
	 * default anyone should inherit by accident.
	 */
	private static function send_cors_headers() {
		$allowed = Thallo_Vis_Settings::allowed_origins();
		if ( ! $allowed ) {
			return;
		}

		add_filter(
			'rest_pre_serve_request',
			static function ( $served ) use ( $allowed ) {
				$origin = get_http_origin();

				if ( $origin && in_array( untrailingslashit( $origin ), $allowed, true ) ) {
					header( 'Access-Control-Allow-Origin: ' . esc_url_raw( $origin ) );
					header( 'Access-Control-Allow-Methods: POST, GET, OPTIONS' );
					header( 'Access-Control-Allow-Headers: Content-Type' );
					header( 'Vary: Origin', false );
				}

				return $served;
			}
		);
	}

	public static function start( WP_REST_Request $request ) {
		$brand    = trim( sanitize_text_field( (string) $request->get_param( 'brand' ) ) );
		$domain   = self::clean_domain( (string) $request->get_param( 'domain' ) );
		$industry = trim( sanitize_text_field( (string) $request->get_param( 'industry' ) ) );
		$market   = trim( sanitize_text_field( (string) $request->get_param( 'market' ) ) );

		if ( '' === $brand || mb_strlen( $brand ) > 80 ) {
			return new WP_Error( 'bad_brand', __( 'Enter the brand name buyers would search for.', 'thallo-visibility' ), array( 'status' => 400 ) );
		}

		if ( ! preg_match( '/^[a-z0-9-]+(\.[a-z0-9-]+)+$/', $domain ) ) {
			return new WP_Error( 'bad_domain', __( 'Enter a valid website, for example yourcompany.com', 'thallo-visibility' ), array( 'status' => 400 ) );
		}

		if ( '' === $industry || mb_strlen( $industry ) > 120 ) {
			return new WP_Error( 'bad_industry', __( 'Choose the category you want to be found in.', 'thallo-visibility' ), array( 'status' => 400 ) );
		}

		/* Not an error when it is missing or unknown. `market` is newer than the
		   deployed front end, and a cached bundle that predates it must keep
		   working — it was asking in English, and en-US is what it was asking.
		   A rejected scan would be a worse answer than the right default. */
		if ( ! Thallo_Vis_Questions::is_market( $market ) ) {
			$market = Thallo_Vis_Questions::DEFAULT_MARKET;
		}

		/* The visitor's own prompts. Optional at this layer on purpose: a cached
		   bundle predating the question editor sends no list at all, and the
		   right answer for it is the generated set it was already getting, not
		   a rejected scan. Anything that does arrive is trimmed, de-duplicated
		   and capped — a scan costs `questions × models` upstream calls, so the
		   ceiling is enforced on the server and not only in the form. */
		$questions = $request->get_param( 'questions' );
		$prompts   = array();

		if ( is_array( $questions ) ) {
			$max  = (int) Thallo_Vis_Settings::get( 'questions', 15 );
			$seen = array();

			foreach ( $questions as $question ) {
				if ( ! is_string( $question ) ) {
					continue;
				}

				$question = trim( sanitize_text_field( $question ) );
				if ( '' === $question ) {
					continue;
				}

				$question = mb_substr( $question, 0, 200 );
				$key      = mb_strtolower( $question );
				if ( isset( $seen[ $key ] ) ) {
					continue;
				}

				$seen[ $key ] = true;
				$prompts[]    = $question;

				if ( count( $prompts ) >= $max ) {
					break;
				}
			}

			/* A list that arrived non-empty and sanitised down to nothing was a
			   real attempt at asking something, so say so rather than silently
			   falling back to questions the visitor did not write. */
			if ( ! $prompts && $questions ) {
				return new WP_Error( 'bad_questions', __( 'Write at least one question you want the models asked.', 'thallo-visibility' ), array( 'status' => 400 ) );
			}
		}

		/* Collected before the scan runs when the front end asks for it there.
		   Optional at this layer: a cached bundle that predates the change sends
		   none, and the right answer for it is the two-step flow it was built
		   for, not a rejected scan. An address that arrives and is not an
		   address is rejected, though — silently running an expensive scan and
		   then having nowhere to send it is the one outcome nobody wanted. */
		$email = trim( (string) $request->get_param( 'email' ) );
		if ( '' !== $email && ! is_email( $email ) ) {
			return new WP_Error( 'bad_email', __( 'Enter a valid email address so we can send you the report.', 'thallo-visibility' ), array( 'status' => 400 ) );
		}
		$email = '' === $email ? '' : sanitize_email( $email );

		$limited = self::check_limits();
		if ( is_wp_error( $limited ) ) {
			return $limited;
		}

		$session = Thallo_Vis_Runner::start( $brand, $domain, $industry, $market, 'visitor', $prompts, $email );

		return is_wp_error( $session ) ? $session : rest_ensure_response( $session );
	}

	public static function tick( WP_REST_Request $request ) {
		$session = Thallo_Vis_Runner::tick( $request->get_param( 'id' ) );

		return is_wp_error( $session ) ? $session : rest_ensure_response( $session );
	}

	public static function unlock( WP_REST_Request $request ) {
		$email = sanitize_email( (string) $request->get_param( 'email' ) );

		if ( ! is_email( $email ) ) {
			return new WP_Error( 'bad_email', __( 'That email address does not look right.', 'thallo-visibility' ), array( 'status' => 400 ) );
		}

		$session = Thallo_Vis_Runner::unlock( $request->get_param( 'id' ), $email );

		return is_wp_error( $session ) ? $session : rest_ensure_response( $session );
	}

	public static function read( WP_REST_Request $request ) {
		$session = Thallo_Vis_Runner::read( $request->get_param( 'id' ) );

		return is_wp_error( $session ) ? $session : rest_ensure_response( $session );
	}

	/**
	 * Somebody asking about the work.
	 *
	 * Deliberately forgiving about everything except the address: a name, a
	 * company and a chosen plan are all nice to have, and rejecting an enquiry
	 * over a missing one would lose the enquiry to protect a database column.
	 * The address is the exception, because without it there is nobody to
	 * answer.
	 */
	public static function enquiry( WP_REST_Request $request ) {
		/* The honeypot. Bots fill every field they find; a human never sees this
		   one. Answered with the same success the form shows a person, because
		   telling a bot it was caught only teaches whoever wrote it. */
		if ( '' !== trim( (string) $request->get_param( 'website_url' ) ) ) {
			return rest_ensure_response( array( 'ok' => true ) );
		}

		$email = sanitize_email( (string) $request->get_param( 'email' ) );

		if ( ! is_email( $email ) ) {
			return new WP_Error( 'bad_email', __( 'Enter an email address we can reply to.', 'thallo-visibility' ), array( 'status' => 400 ) );
		}

		$since = gmdate( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS );

		/* Five a day from one address. High enough that nobody legitimate meets
		   it — a person who sends a second enquiry because they forgot something
		   should not be told off — and low enough that a script gets bored. */
		if ( Thallo_Vis_Enquiries::count_recent_for_ip( $since ) >= 5 ) {
			return new WP_Error(
				'rate_limited',
				__( 'We already have your messages from today and we are reading them. Email us directly if it is urgent.', 'thallo-visibility' ),
				array( 'status' => 429 )
			);
		}

		$plans = $request->get_param( 'plans' );
		$clean = array();

		if ( is_array( $plans ) ) {
			foreach ( array_slice( $plans, 0, 8 ) as $plan ) {
				if ( is_string( $plan ) && '' !== trim( $plan ) ) {
					$clean[] = mb_substr( sanitize_text_field( $plan ), 0, 80 );
				}
			}
		}

		$id = Thallo_Vis_Enquiries::record(
			array(
				'name'    => mb_substr( sanitize_text_field( (string) $request->get_param( 'name' ) ), 0, 120 ),
				'company' => mb_substr( sanitize_text_field( (string) $request->get_param( 'company' ) ), 0, 120 ),
				'email'   => $email,
				'plans'   => $clean,
				/* `sanitize_textarea_field` rather than `sanitize_text_field`: the
				   message is where somebody explains what they need, and the
				   second one flattens their paragraphs into a single line. */
				'message' => mb_substr( sanitize_textarea_field( (string) $request->get_param( 'message' ) ), 0, 4000 ),
				'page'    => esc_url_raw( (string) $request->get_param( 'page' ) ),
				'consent' => (bool) $request->get_param( 'consent' ),
			)
		);

		if ( is_wp_error( $id ) ) {
			return $id;
		}

		return rest_ensure_response( array( 'ok' => true ) );
	}

	/** A diagnostics endpoint for whoever installs this. Never reveals a key. */
	public static function status() {
		$serp = Thallo_Vis_Settings::get( 'serp_provider' );

		return rest_ensure_response(
			array(
				'version'      => THALLO_VIS_VERSION,
				'demo'         => Thallo_Vis_Settings::is_demo(),
				'mode'         => Thallo_Vis_Settings::get( 'provider_mode' ),
				'models'       => array(
					'chatgpt'    => Thallo_Vis_Settings::has_model( 'chatgpt' ),
					'claude'     => Thallo_Vis_Settings::has_model( 'claude' ),
					'gemini'     => Thallo_Vis_Settings::has_model( 'gemini' ),
					'perplexity' => Thallo_Vis_Settings::has_model( 'perplexity' ),
				),
				'aiOverview'   => 'none' !== $serp ? $serp : false,
				'markets'      => Thallo_Vis_Questions::market_ids(),
				'questions'    => (int) Thallo_Vis_Settings::get( 'questions' ),
				'scansToday'   => Thallo_Vis_DB::count_recent_total( gmdate( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS ) ),
				'dailyLimit'   => (int) Thallo_Vis_Settings::get( 'rate_global' ),
				'perIpLimit'   => (int) Thallo_Vis_Settings::get( 'rate_per_ip' ),
			)
		);
	}

	private static function clean_domain( $raw ) {
		$raw = strtolower( trim( $raw ) );
		$raw = preg_replace( '#^https?://#', '', $raw );
		$raw = preg_replace( '/^www\./', '', $raw );
		$raw = preg_replace( '#[/?\#].*$#', '', $raw );

		return $raw;
	}

	/**
	 * Two ceilings.
	 *
	 * The per-visitor one keeps one person from sitting on the button; the
	 * whole-site one is the actual protection, because the per-visitor count is
	 * keyed on an address and addresses are cheap. Neither is security — they
	 * are a cap on how large a surprise the API bill can be.
	 */
	private static function check_limits() {
		$since = gmdate( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS );

		$per_ip = (int) Thallo_Vis_Settings::get( 'rate_per_ip', 3 );
		if ( Thallo_Vis_DB::count_recent_for_ip( $since ) >= $per_ip ) {
			return new WP_Error(
				'rate_limited',
				sprintf(
					/* translators: %d: number of free scans allowed per day. */
					_n(
						'That is your free scan for today. Get in touch and we will run the full audit against your category properly.',
						'That is your %d free scans for today. Get in touch and we will run the full audit against your category properly.',
						$per_ip,
						'thallo-visibility'
					),
					$per_ip
				),
				array( 'status' => 429 )
			);
		}

		$global = (int) Thallo_Vis_Settings::get( 'rate_global', 200 );
		if ( Thallo_Vis_DB::count_recent_total( $since ) >= $global ) {
			return new WP_Error(
				'busy',
				__( 'The scanner has hit its limit for today. Please try again tomorrow, or get in touch and we will run it for you.', 'thallo-visibility' ),
				array( 'status' => 503 )
			);
		}

		return true;
	}
}
