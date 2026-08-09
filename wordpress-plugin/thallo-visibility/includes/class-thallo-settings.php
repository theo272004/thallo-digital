<?php
/**
 * Settings — one option row holding an array, so adding a field never means a
 * migration.
 *
 * The defaults are chosen so that installing the plugin and pasting a single
 * OpenRouter key produces a working scan. Everything else is there for when
 * that is not what you want.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Settings {

	public static function defaults() {
		return array(
			/*
			 * 'openrouter' — one key, one bill, every model behind the same
			 * OpenAI-shaped API. This is the recommended setup and the default.
			 * 'native'     — separate keys straight to OpenAI, Anthropic, Google
			 *                and Perplexity. Use this if you already hold credit
			 *                with them and would rather burn that down.
			 */
			'provider_mode'       => 'openrouter',

			/*
			 * Checked against OpenRouter's live catalogue on 2026-08-09.
			 *
			 * `anthropic/claude-3.5-haiku` and `google/gemini-2.0-flash-001` were
			 * the defaults and both are retired: the ids still resolve — the
			 * metadata is kept — but `/models/{id}/endpoints` returns an empty
			 * list, so nothing serves them. Two of the three providers would
			 * have errored on the very first real scan, and the runner's honest
			 * handling of that ("could not ask", not a zero) would have quietly
			 * turned a three-model scan into a ChatGPT-only one.
			 *
			 * **Re-check these whenever a scan reports a provider unavailable.**
			 * Model ids are the one part of this plugin with an expiry date.
			 */
			'openrouter_key'      => '',
			/* Each slot stands in for "what this assistant says", so the model
			   should be the generation a person actually talks to today. An old
			   model measures a product nobody is using any more, and the report
			   would be honest about a question nobody asked.
			   `gpt-4.1-nano` over `gpt-4o-mini`: newer, and cheaper per token. */
			'or_model_chatgpt'    => 'openai/gpt-4.1-nano',
			/* Haiku 4.5 is the newest model in its tier — there is no later small
			   Anthropic model to move to. The only step up is Sonnet, which
			   doubles the token price for a reading this size. */
			'or_model_claude'     => 'anthropic/claude-haiku-4.5',
			/* Flash rather than flash-lite: this is standing in for "what Gemini
			   says", so the mainstream model is the representative one, and the
			   difference is fractions of a cent on a reading with no search fee. */
			'or_model_gemini'     => 'google/gemini-3.6-flash',
			'or_model_perplexity' => 'perplexity/sonar',

			/*
			 * The same three models again, asked the same questions, with web
			 * search on. Phase 1 measures whether a model knows you; this
			 * measures whether it picks you once it has looked — and those come
			 * apart, which is the whole reason for asking twice.
			 *
			 * Separate ids rather than `:online` bolted onto the ones above,
			 * because the cheapest memory model is not always the one with
			 * native search. `openai/gpt-4o-mini` has none, so asked online it
			 * falls back to a third-party index — measuring somebody else's
			 * search rather than OpenAI's.
			 *
			 * Off by default: it is many times the cost of the memory reading,
			 * so switching it on is a decision the site owner makes with the
			 * price in front of them, not one they inherit from an update.
			 *
			 * Chosen on search fee first, token price second, because the search
			 * fee is per call and dwarfs the tokens at this size — but only
			 * among models that accept the parameters this plugin sends.
			 *
			 * Luna on the ChatGPT slot is a fidelity choice before it is a price
			 * one. The sentence this reading prints is "here is what ChatGPT
			 * says when it searches", and somebody typing into ChatGPT today is
			 * talking to the GPT-5 generation — so the GPT-5-series model is the
			 * representative one. That it also halves the search fee is a
			 * coincidence in our favour, not the reason.
			 *
			 * It went out once as `gpt-4.1-nano` because Luna rejects
			 * `temperature` and `openai_body()` sent it unconditionally: five
			 * failed calls and a blank ChatGPT column. That was the wrong fix —
			 * changing the model to suit a parameter that this half does not
			 * need. The parameter is dropped for the grounded reading instead
			 * (see Thallo_Vis_LLM::build_job), which frees the whole GPT-5 and
			 * reasoning family to be used here.
			 *
			 * What is NOT traded away is native search. All three are the
			 * provider's own model, so `:online` routes to that provider's own
			 * index — the report claims "this is what Gemini says when it
			 * searches", and a cheaper model behind somebody else's search would
			 * make that sentence false.
			 */
			'grounded_enabled'    => 0,
			'gr_model_chatgpt'    => 'openai/gpt-5.6-luna',
			'gr_model_claude'     => 'anthropic/claude-haiku-4.5',
			/* Lite here, mainstream on the memory slot, and the reason is the
			   bill rather than a change of heart: this half sends thousands of
			   search excerpts through the prompt on every call, so the token
			   price actually bites. A current-generation lite costs the same
			   search fee as an old mainstream and is the newer reading. */
			'gr_model_gemini'     => 'google/gemini-3.5-flash-lite',
			/* low/medium/high. Search context is charged as prompt tokens and it
			   is the half of the bill that is easy to miss — the search fee is
			   fixed, the excerpts it stuffs into the prompt are not. */
			'grounded_context'    => 'low',
			/*
			 * How many of the questions get asked a second time. The search fee
			 * is charged per call and cannot be haggled down — $0.005 to $0.014
			 * depending on the provider — so the only real lever on this half of
			 * the bill is how many calls are made.
			 *
			 * Five rather than fifteen by default. Share of voice is a
			 * proportion, and this reading is only asked to settle one thing:
			 * whether searching changes who gets named. Five answers per model
			 * separates "never" from "sometimes", which is the whole finding.
			 * Below three it would separate nothing and should not be reported.
			 *
			 * The report prints both answer counts next to both percentages, so
			 * the two halves being different sizes is visible rather than hidden.
			 */
			'grounded_questions'  => 5,

			'openai_key'          => '',
			'anthropic_key'       => '',
			'google_key'          => '',
			'perplexity_key'      => '',
			'nv_model_chatgpt'    => 'gpt-4o-mini',
			'nv_model_claude'     => 'claude-3-5-haiku-latest',
			'nv_model_gemini'     => 'gemini-2.0-flash',
			'nv_model_perplexity' => 'sonar',

			/*
			 * Google publishes no API for the AI Overview, so it is read through
			 * a search-results provider. With none configured the scan reports it
			 * as "not measured" rather than guessing — which is the whole point of
			 * this tool, so it must never be tempted to fill the gap.
			 */
			'serp_provider'       => 'none',
			'serpapi_key'         => '',
			'dataforseo_login'    => '',
			'dataforseo_password' => '',

			/*
			 * There is deliberately no search location or language here any more.
			 * Google shows a different AI Overview by country and language, and
			 * the answer for a Bogotá buyer is not the answer for a Boston one —
			 * which means the locale belongs to the scan, not to the
			 * installation. It now comes from the market the visitor chose, in
			 * `Thallo_Vis_Questions`. A site-wide setting could only ever have
			 * been right for one of the markets on offer, and silently wrong for
			 * the rest.
			 */

			'questions'           => 5,
			'jobs_per_tick'       => 5,
			'request_timeout'     => 25,

			/*
			 * One free scan per visitor per day.
			 *
			 * The ceiling that protects the bill is `rate_global`, not this — at
			 * ~$0.012 a scan, three per visitor was never the expensive part.
			 * This number is a funnel decision: the second scan is the one a
			 * visitor runs instead of leaving an email.
			 *
			 * It is a speed bump and not a gate, and it should not be mistaken
			 * for one. A shared office or a carrier-grade NAT puts hundreds of
			 * people behind one address, and a VPN or mobile data defeats it in
			 * a tap. The real gates are further down and cost more to pass:
			 * phase 2 asks for an email, monitoring asks for an account.
			 */
			'rate_per_ip'         => 1,
			'rate_global'         => 200,
			'retention_days'      => 14,

			'allowed_origins'     => '',
			'notify_email'        => '',
			'send_report_to_lead' => 1,

			/*
			 * Scheduled re-scans. Off by default, and deliberately so: this is
			 * the only part of the system that spends money with nobody present.
			 * Everything under Visibility → Monitoring is inert until this is on.
			 */
			'monitoring_enabled'  => 0,
			/*
			 * Its own ceiling, separate from `rate_global`. That one protects the
			 * bill from a stranger; this one protects it from us — from twenty
			 * monitors quietly falling due on the same morning.
			 */
			'monitor_daily_cap'   => 20,

			/* Forces sample data even when keys are present, so the front end can
			   be demonstrated without spending anything. The API reports it, and
			   the site shows a banner whenever it is on. */
			'demo_mode'           => 0,
		);
	}

	public static function all() {
		$saved = get_option( THALLO_VIS_OPTION, array() );
		if ( ! is_array( $saved ) ) {
			$saved = array();
		}
		return array_merge( self::defaults(), $saved );
	}

	public static function get( $key, $fallback = null ) {
		$all = self::all();
		return array_key_exists( $key, $all ) ? $all[ $key ] : $fallback;
	}

	public static function register() {
		register_setting(
			'thallo_visibility',
			THALLO_VIS_OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => array( __CLASS__, 'sanitize' ),
				'default'           => self::defaults(),
			)
		);
	}

	public static function sanitize( $input ) {
		$out      = self::all();
		$input    = is_array( $input ) ? $input : array();
		$defaults = self::defaults();

		$text_keys = array(
			'openrouter_key',
			'or_model_chatgpt',
			'or_model_claude',
			'or_model_gemini',
			'or_model_perplexity',
			'gr_model_chatgpt',
			'gr_model_claude',
			'gr_model_gemini',
			'openai_key',
			'anthropic_key',
			'google_key',
			'perplexity_key',
			'nv_model_chatgpt',
			'nv_model_claude',
			'nv_model_gemini',
			'nv_model_perplexity',
			'serpapi_key',
			'dataforseo_login',
			'dataforseo_password',
		);

		foreach ( $text_keys as $key ) {
			if ( isset( $input[ $key ] ) ) {
				$out[ $key ] = trim( sanitize_text_field( $input[ $key ] ) );
			}
		}

		$out['provider_mode'] = isset( $input['provider_mode'] ) && 'native' === $input['provider_mode'] ? 'native' : 'openrouter';

		$serp                 = isset( $input['serp_provider'] ) ? $input['serp_provider'] : 'none';
		$out['serp_provider'] = in_array( $serp, array( 'none', 'serpapi', 'dataforseo' ), true ) ? $serp : 'none';

		/* Bounds rather than blind casts. A zero here would mean "ask nothing"
		   and a thousand would mean a four-figure API bill from one visitor, and
		   both are a typo away in a text field. */
		$out['questions']       = self::clamp_int( $input, 'questions', 3, 15, $defaults['questions'] );
		$out['jobs_per_tick']   = self::clamp_int( $input, 'jobs_per_tick', 1, 15, $defaults['jobs_per_tick'] );
		$out['request_timeout'] = self::clamp_int( $input, 'request_timeout', 5, 60, $defaults['request_timeout'] );
		$out['rate_per_ip']     = self::clamp_int( $input, 'rate_per_ip', 1, 100, $defaults['rate_per_ip'] );
		$out['rate_global']     = self::clamp_int( $input, 'rate_global', 1, 10000, $defaults['rate_global'] );
		$out['retention_days']  = self::clamp_int( $input, 'retention_days', 1, 365, $defaults['retention_days'] );

		$out['allowed_origins'] = isset( $input['allowed_origins'] )
			? sanitize_textarea_field( $input['allowed_origins'] )
			: '';

		$out['notify_email'] = isset( $input['notify_email'] ) && is_email( $input['notify_email'] )
			? sanitize_email( $input['notify_email'] )
			: '';

		$out['monitor_daily_cap'] = self::clamp_int( $input, 'monitor_daily_cap', 1, 500, $defaults['monitor_daily_cap'] );

		$out['grounded_questions'] = self::clamp_int( $input, 'grounded_questions', 3, 15, $defaults['grounded_questions'] );

		$context               = isset( $input['grounded_context'] ) ? $input['grounded_context'] : 'low';
		$out['grounded_context'] = in_array( $context, array( 'low', 'medium', 'high' ), true ) ? $context : 'low';

		$out['grounded_enabled']    = empty( $input['grounded_enabled'] ) ? 0 : 1;
		$out['send_report_to_lead'] = empty( $input['send_report_to_lead'] ) ? 0 : 1;
		$out['monitoring_enabled']  = empty( $input['monitoring_enabled'] ) ? 0 : 1;
		$out['demo_mode']           = empty( $input['demo_mode'] ) ? 0 : 1;

		return $out;
	}

	private static function clamp_int( $input, $key, $min, $max, $fallback ) {
		if ( ! isset( $input[ $key ] ) || '' === $input[ $key ] ) {
			return $fallback;
		}
		return max( $min, min( $max, (int) $input[ $key ] ) );
	}

	/**
	 * Whether a given memory model can actually be called. The runner uses this
	 * to skip a provider rather than record it as a zero — "we could not ask" is
	 * not "you were not named", and conflating the two would put a false finding
	 * in front of someone.
	 */
	public static function has_model( $provider ) {
		if ( 'openrouter' === self::get( 'provider_mode' ) ) {
			return '' !== self::get( 'openrouter_key' ) && '' !== self::get( 'or_model_' . $provider, '' );
		}

		$map = array(
			'chatgpt'    => 'openai_key',
			'claude'     => 'anthropic_key',
			'gemini'     => 'google_key',
			'perplexity' => 'perplexity_key',
		);

		return isset( $map[ $provider ] ) && '' !== self::get( $map[ $provider ] );
	}

	/**
	 * Whether the grounded (web search on) reading can be taken for a provider.
	 *
	 * OpenRouter only. The native APIs each expose search differently — one
	 * parameter for OpenAI, a tool for Anthropic, another for Google — and
	 * three bespoke integrations to measure the same thing is three things to
	 * keep working. On the native path the grounded half is simply not offered,
	 * and the report says it was not measured rather than implying a zero.
	 */
	public static function has_grounded_model( $provider ) {
		if ( ! self::get( 'grounded_enabled' ) ) {
			return false;
		}
		if ( 'openrouter' !== self::get( 'provider_mode' ) ) {
			return false;
		}
		return '' !== self::get( 'openrouter_key' ) && '' !== self::get( 'gr_model_' . $provider, '' );
	}

	/** True when nothing can be called and the API must return sample data. */
	public static function is_demo() {
		if ( self::get( 'demo_mode' ) ) {
			return true;
		}
		foreach ( array( 'chatgpt', 'claude', 'gemini' ) as $provider ) {
			if ( self::has_model( $provider ) ) {
				return false;
			}
		}
		return true;
	}

	public static function allowed_origins() {
		$raw = (string) self::get( 'allowed_origins', '' );
		$out = array();
		foreach ( preg_split( '/[\r\n,]+/', $raw ) as $line ) {
			$line = trim( $line );
			if ( '' !== $line ) {
				$out[] = untrailingslashit( $line );
			}
		}
		return $out;
	}
}
