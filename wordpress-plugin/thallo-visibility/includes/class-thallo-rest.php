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

	/**
	 * The cookie that carries a visitor's free allowance.
	 *
	 * Not a login and not a nonce — an opaque random id with nothing in it but
	 * itself, hashed before it is stored, so the table cannot be read backwards
	 * into "who ran this scan". Clearing it is trivial and expected; that is why
	 * it is one of four layers rather than the whole rule.
	 */
	const SESSION_COOKIE = 'thallo_scan_sid';

	/**
	 * Mailbox providers that are not a company.
	 *
	 * The site ships the same list in `FREE_EMAIL_DOMAINS` so the refusal can
	 * appear beside the field, but this is the copy that binds: the front end is
	 * a static export and a cached bundle cannot be trusted to have the current
	 * one.
	 *
	 * Deliberately short. It catches the consumer mailboxes and the disposable
	 * ones and stops there — a rule broad enough to catch every free provider on
	 * earth would start rejecting the small hosts real companies actually use,
	 * and a false refusal here costs a lead that was qualified.
	 */
	const FREE_MAIL_DOMAINS = array(
		'gmail.com',
		'googlemail.com',
		'outlook.com',
		'outlook.es',
		'hotmail.com',
		'hotmail.es',
		'hotmail.co.uk',
		'hotmail.com.br',
		'hotmail.com.ar',
		'live.com',
		'live.com.mx',
		'msn.com',
		'yahoo.com',
		'yahoo.es',
		'yahoo.com.mx',
		'yahoo.com.br',
		'yahoo.com.ar',
		'ymail.com',
		'icloud.com',
		'me.com',
		'mac.com',
		'aol.com',
		'gmx.com',
		'gmx.net',
		'mail.com',
		'zoho.com',
		'yandex.com',
		'yandex.ru',
		'protonmail.com',
		'proton.me',
		'pm.me',
		'tutanota.com',
		'mail.ru',
		'inbox.ru',
		'bol.com.br',
		'uol.com.br',
		'terra.com.br',
		// Disposable. These exist to be thrown away, which is the opposite of a lead.
		'mailinator.com',
		'guerrillamail.com',
		'yopmail.com',
		'10minutemail.com',
		'temp-mail.org',
		'trashmail.com',
		'sharklasers.com',
		'dispostable.com',
		'getnada.com',
		'maildrop.cc',
	);

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

		/*
		 * How many free scans are left, before one is started.
		 *
		 * Public, because the visitor it answers for has no account — and it
		 * reveals nothing about anybody else: it counts only this browser and
		 * this address. It exists so the setup screen can print "Scan 1 of 3"
		 * rather than letting the limit be discovered by hitting it, which is
		 * how it worked until now: a visitor ran a third scan and learned from a
		 * 429 that there had been an allowance all along.
		 *
		 * It also sets the session cookie, which is why it is a GET the front
		 * end makes on load rather than something folded into `/scan`.
		 */
		register_rest_route(
			self::NS,
			'/quota',
			array(
				/* GET is the one the page makes on load, and the one that mints
				   the cookie. POST is the same answer for an address the
				   visitor has just typed — a body rather than a query string
				   because an address in a URL ends up in the access log of
				   every hop between here and there, and this one is a lead. */
				'methods'             => array( 'GET', 'POST' ),
				'callback'            => array( __CLASS__, 'quota' ),
				'permission_callback' => '__return_true',
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

		if ( ! preg_match( '/^[a-z0-9-]+(\.[a-z0-9-]+)+$/', $domain ) || ! self::is_public_domain( $domain ) ) {
			return new WP_Error( 'bad_domain', __( 'Enter a valid public website, for example yourcompany.com', 'thallo-visibility' ), array( 'status' => 400 ) );
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

		/* A company domain, not a mailbox provider. Checked before the limits so
		   that a personal address is told what is wrong with it rather than
		   being told the allowance is spent — and before anything is started, so
		   a refusal costs nothing. */
		if ( '' !== $email && Thallo_Vis_Settings::get( 'require_work_email' ) && ! self::is_work_email( $email ) ) {
			return new WP_Error(
				'personal_email',
				__( 'Free scans are for company email addresses. Use your work address and we will send the report there.', 'thallo-visibility' ),
				array( 'status' => 400 )
			);
		}

		$limited = self::check_limits( $domain, $email );
		if ( is_wp_error( $limited ) ) {
			return $limited;
		}

		$session = Thallo_Vis_Runner::start( $brand, $domain, $industry, $market, 'visitor', $prompts, $email, self::session_hash() );

		return is_wp_error( $session ) ? $session : rest_ensure_response( self::with_quota( $session ) );
	}

	public static function tick( WP_REST_Request $request ) {
		$session = Thallo_Vis_Runner::tick( $request->get_param( 'id' ) );

		return is_wp_error( $session ) ? $session : rest_ensure_response( self::with_quota( $session ) );
	}

	public static function unlock( WP_REST_Request $request ) {
		$email = sanitize_email( (string) $request->get_param( 'email' ) );

		if ( ! is_email( $email ) ) {
			return new WP_Error( 'bad_email', __( 'That email address does not look right.', 'thallo-visibility' ), array( 'status' => 400 ) );
		}

		if ( Thallo_Vis_Settings::get( 'require_work_email' ) && ! self::is_work_email( $email ) ) {
			return new WP_Error(
				'personal_email',
				__( 'Free scans are for company email addresses. Use your work address and we will send the report there.', 'thallo-visibility' ),
				array( 'status' => 400 )
			);
		}

		$session = Thallo_Vis_Runner::unlock( $request->get_param( 'id' ), $email );

		return is_wp_error( $session ) ? $session : rest_ensure_response( self::with_quota( $session ) );
	}

	public static function read( WP_REST_Request $request ) {
		$session = Thallo_Vis_Runner::read( $request->get_param( 'id' ) );

		return is_wp_error( $session ) ? $session : rest_ensure_response( self::with_quota( $session ) );
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

	/**
	 * A name on the public internet, rather than an address inside this server.
	 *
	 * The hostname pattern beside this one cannot make the distinction: every
	 * label it allows is letters, digits and hyphens, and `127.0.0.1` is four
	 * such labels. So a scan could be pointed at the machine WordPress runs on
	 * and would faithfully report what answered.
	 *
	 * `wp_safe_remote_get()` in the crawl is the guard that actually holds —
	 * it resolves the name and refuses private addresses, which a list of
	 * strings can never do. This is the half that can be said to the visitor:
	 * a refusal at the form, in words, instead of a scan that runs and comes
	 * back empty.
	 */
	private static function is_public_domain( $domain ) {
		// An IP literal is not a website anybody typed by accident.
		if ( filter_var( $domain, FILTER_VALIDATE_IP ) ) {
			return false;
		}

		$dot = strrchr( $domain, '.' );
		$tld = false === $dot ? '' : substr( $dot, 1 );

		/* RFC 6761/6762 special-use names and the conventional intranet
		   suffixes. None of them resolves to anything a buyer can visit. */
		$reserved = array( 'local', 'localhost', 'localdomain', 'internal', 'intranet', 'private', 'corp', 'home', 'lan', 'test', 'example', 'invalid', 'onion' );

		return ! in_array( $tld, $reserved, true );
	}

	private static function clean_domain( $raw ) {
		$raw = strtolower( trim( $raw ) );
		$raw = preg_replace( '#^https?://#', '', $raw );
		$raw = preg_replace( '/^www\./', '', $raw );
		$raw = preg_replace( '#[/?\#].*$#', '', $raw );

		return $raw;
	}

	// -----------------------------------------------------------------------
	// The free allowance
	// -----------------------------------------------------------------------

	/**
	 * This browser, as an opaque id.
	 *
	 * Reads the cookie and mints one when there is not one yet, hashing it with
	 * the site's own salt before it is stored — the same treatment the IP gets,
	 * for the same reason: the table should not be usable to look up who ran a
	 * scan.
	 *
	 * `$mint` is false everywhere except `/quota`. A cookie is only settable
	 * before output, and a GET the front end makes on load is a clean place to
	 * do it; minting from `/scan` as well would hand a fresh allowance to
	 * anything that skips the setup screen, which is precisely the client this
	 * layer is counting.
	 */
	private static function session_hash( $mint = false ) {
		// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotValidated -- validated by the pattern below.
		$raw = isset( $_COOKIE[ self::SESSION_COOKIE ] ) ? (string) $_COOKIE[ self::SESSION_COOKIE ] : '';
		$raw = preg_match( '/^[a-f0-9]{32}$/', $raw ) ? $raw : '';

		if ( '' === $raw && $mint && ! headers_sent() ) {
			$raw = bin2hex( random_bytes( 16 ) );

			setcookie(
				self::SESSION_COOKIE,
				$raw,
				array(
					'expires'  => time() + YEAR_IN_SECONDS,
					'path'     => '/',
					'secure'   => is_ssl(),
					'httponly' => true,
					/* Lax, not Strict: the visitor often arrives from an email or
					   a search result, and Strict would withhold the cookie on
					   that first navigation — handing a fresh allowance to every
					   visitor who did not type the URL by hand. */
					'samesite' => 'Lax',
				)
			);

			/* Written back so the rest of THIS request sees it. Without it the
			   scan started in the same request as the mint would be stored
			   against an empty session and would not count against anybody. */
			$_COOKIE[ self::SESSION_COOKIE ] = $raw;
		}

		return '' === $raw ? '' : hash( 'sha256', $raw . wp_salt( 'nonce' ) );
	}

	/** True when the address is on a company domain rather than a mailbox provider. */
	public static function is_work_email( $email ) {
		$at = strrpos( (string) $email, '@' );
		if ( false === $at ) {
			return false;
		}

		return ! in_array( strtolower( substr( $email, $at + 1 ) ), self::FREE_MAIL_DOMAINS, true );
	}

	/**
	 * Whether this caller is exempt from the allowance entirely.
	 *
	 * Matched on the address in the clear against `rate_exempt_ips`, which is a
	 * list an administrator typed into the settings screen. Nothing a visitor
	 * sends can put them on it, and nothing is stored as a result of the
	 * comparison.
	 *
	 * Exact matches only — no ranges, no prefixes. A range would be the natural
	 * next feature and it is deliberately absent: this is the single hole in
	 * the thing that protects the API bill, and a mistyped CIDR mask is how a
	 * hole becomes a door.
	 */
	private static function ip_exempt() {
		$list = (string) Thallo_Vis_Settings::get( 'rate_exempt_ips', '' );
		if ( '' === trim( $list ) ) {
			return false;
		}

		$ip = Thallo_Vis_DB::client_ip();
		if ( '' === $ip ) {
			return false;
		}

		foreach ( preg_split( '/[\s,;]+/', $list ) as $entry ) {
			if ( '' !== $entry && $entry === $ip ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * What is left of the free allowance, and which layer is binding.
	 *
	 * One function, two callers: `/quota` renders it as "Scan 1 of 3" before
	 * anything is spent, and `check_limits()` refuses on it. They must not be
	 * able to disagree — a counter that says two left in front of a server that
	 * says none is worse than no counter at all.
	 *
	 * `$domain` and `$email` are empty when this is called from `/quota`, which
	 * is before the visitor has typed either. Those two layers simply do not
	 * apply yet, and the ones that do — the session and the network — are
	 * enough for the number on screen. Both are checked properly at `/scan`.
	 */
	private static function allowance( $domain = '', $email = '' ) {
		$since = gmdate( 'Y-m-d H:i:s', time() - DAY_IN_SECONDS );

		/* The office, before anything is counted. See `ip_exempt()` — this is
		   the one way past the limiter, and it is a list somebody typed rather
		   than anything a visitor can present. */
		if ( self::ip_exempt() ) {
			$limit = max( 1, (int) Thallo_Vis_Settings::get( 'rate_per_session', 3 ) );

			/* A full allowance rather than an infinite one. The counter on the
			   setup screen reads `limit - remaining + 1`, so anything larger
			   than the limit prints a nonsense scan number — and "Scan 1 of 3",
			   every time, is a fair description of what an exempt visitor is
			   experiencing anyway. `exempt` is there for anyone reading the
			   response rather than for the interface. */
			return array(
				'remaining' => $limit,
				'limit'     => $limit,
				'exempt'    => true,
			);
		}

		/* The headline: what "1 of 3" counts against. The session and the
		   address share it deliberately — they are two ways of counting the same
		   person, not two separate budgets. */
		$limit = max(
			1,
			(int) Thallo_Vis_Settings::get( 'rate_per_session', 3 )
		);

		$layers = array(
			array(
				'id'    => 'session',
				'left'  => $limit - Thallo_Vis_DB::count_for_session( self::session_hash() ),
				'reason' => __( 'You have reached the limit of free scans. Book an audit and we will run the full question set against your category, with the sources behind every answer.', 'thallo-visibility' ),
			),
			array(
				'id'    => 'ip',
				'left'  => (int) Thallo_Vis_Settings::get( 'rate_per_ip', 6 ) - Thallo_Vis_DB::count_recent_for_ip( $since ),
				'reason' => __( 'This network has run its scans for today. Book an audit and we will run the full question set against your category — or come back tomorrow.', 'thallo-visibility' ),
			),
		);

		if ( '' !== $email ) {
			$layers[] = array(
				'id'    => 'email',
				'left'  => max( 1, (int) Thallo_Vis_Settings::get( 'rate_per_email', 3 ) ) - Thallo_Vis_DB::count_for_email( $email ),
				/* Not "that address has used its free scans." It is the same
				   sentence as the session layer on purpose: told which counter
				   is binding, the obvious next move is to try a second address,
				   and the message would have been the instructions for getting
				   around it. */
				'reason' => __( 'You have reached the limit of free scans. Book an audit and we will run the full question set against your category, with the sources behind every answer.', 'thallo-visibility' ),
			);
		}

		if ( '' !== $domain ) {
			$layers[] = array(
				'id'    => 'domain',
				'left'  => (int) Thallo_Vis_Settings::get( 'rate_per_domain', 2 ) - Thallo_Vis_DB::count_recent_for_domain( $domain, $since ),
				/* Named as a fact about the website rather than about the person
				   asking, because usually it is not the same person: this layer
				   fires on an agency scanning a prospect, or a competitor
				   checking a rival. */
				'reason' => sprintf(
					/* translators: %s: the website being scanned. */
					__( '%s has already been scanned today. A brand is measured once a day so a single site cannot use up the day\'s runs — book an audit if you need it looked at properly.', 'thallo-visibility' ),
					$domain
				),
			);
		}

		/* The site-wide ceiling. Last, because it is the only one that is not
		   about this visitor at all, and it should never be the sentence
		   somebody reads if one of the personal layers also applies. */
		$layers[] = array(
			'id'    => 'site',
			'left'  => (int) Thallo_Vis_Settings::get( 'rate_global', 200 ) - Thallo_Vis_DB::count_recent_total( $since ),
			'reason' => __( 'The scanner has hit its limit for today. Please try again tomorrow, or get in touch and we will run it for you.', 'thallo-visibility' ),
		);

		$binding = $layers[0];
		foreach ( $layers as $layer ) {
			if ( $layer['left'] < $binding['left'] ) {
				$binding = $layer;
			}
		}

		$remaining = max( 0, (int) $binding['left'] );

		$out = array(
			'remaining' => $remaining,
			/* Never below what is actually left. A visitor who somehow has four
			   left against a limit of three should not be shown "Scan 0 of 3". */
			'limit'     => max( $limit, $remaining ),
		);

		if ( 0 === $remaining ) {
			$out['limitedBy'] = $binding['id'];
			$out['reason']    = $binding['reason'];
		}

		return $out;
	}

	/**
	 * Four ceilings, and none of them an error.
	 *
	 * A cookie alone is cleared in ten seconds, an address alone is defeated by
	 * a second address, and an IP alone punishes an office of forty people who
	 * share one — so the four are counted together and the tightest binds. See
	 * `Thallo_Vis_Settings::defaults()` for what each is actually protecting.
	 *
	 * The status code is still 429 because that is what it is, but the sentence
	 * behind it is written as an invitation. Somebody who has run three scans
	 * and is reaching for a fourth is the most interested visitor of the week,
	 * and "rate limit exceeded" is the worst possible thing to say to them.
	 */
	private static function check_limits( $domain = '', $email = '' ) {
		$quota = self::allowance( $domain, $email );

		if ( $quota['remaining'] > 0 ) {
			return true;
		}

		return new WP_Error(
			'site' === $quota['limitedBy'] ? 'busy' : 'rate_limited',
			$quota['reason'],
			array(
				'status' => 'site' === $quota['limitedBy'] ? 503 : 429,
				'quota'  => $quota,
			)
		);
	}

	/**
	 * `GET /quota` — the allowance before a scan is started.
	 *
	 * Optionally for a given address and website. Without them it answers for
	 * the browser and the network only, which is all there is to answer for
	 * when the page has just loaded and nothing has been typed.
	 *
	 * With them it is the same answer `/scan` would give, which is the whole
	 * point: a visitor used to fill in two screens, press the button, watch a
	 * scan appear to start and *then* be told the address had no runs left —
	 * with the form behind them already gone. The setup screen now asks this
	 * question when the address is entered and refuses beside the field.
	 *
	 * It reveals nothing it should not. The count is per address and per site,
	 * both of which the caller has just typed, and a wrong guess returns the
	 * same "3 of 3" an unused address would.
	 */
	public static function quota( $request = null ) {
		/* The one place the cookie is minted. It is a GET the setup screen makes
		   on load, so there is no output yet and `setcookie` still works. */
		self::session_hash( true );

		$email  = '';
		$domain = '';

		if ( $request instanceof WP_REST_Request ) {
			$candidate = sanitize_email( (string) $request->get_param( 'email' ) );
			$email     = is_email( $candidate ) ? strtolower( $candidate ) : '';
			$domain    = self::clean_domain( (string) $request->get_param( 'domain' ) );
		}

		return rest_ensure_response( self::allowance( $domain, $email ) );
	}

	/**
	 * The allowance, attached to a session response.
	 *
	 * Every scan response carries it so the report can print "scan 2 of 3" and
	 * the CTA can say how many are left without a second round trip — and so
	 * the two numbers cannot drift apart, which they would the moment they came
	 * from different calls at different times.
	 */
	private static function with_quota( $session ) {
		if ( is_array( $session ) ) {
			$session['quota'] = self::allowance();
		}

		return $session;
	}
}
