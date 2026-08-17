<?php
/**
 * Which model stands in for which assistant, and what that model will accept.
 *
 * Two jobs, and they are the same job seen from either end.
 *
 * THE LIST. Each slot in this plugin stands for "what this assistant says", and
 * the report prints that assistant's name over the number. So the id behind the
 * ChatGPT column has to be an OpenAI model of the generation a person is
 * actually talking to — an old id measures a product nobody uses any more and
 * answers a question nobody asked. Model ids are the only part of this plugin
 * with an expiry date, so the recommendation lives in one place, dated, with the
 * reasoning next to it, instead of being typed into a settings field once and
 * quietly ageing there for two years.
 *
 * THE CAPABILITIES. Providers drop parameters between generations. OpenAI's
 * whole current lineup refuses `temperature` — nano, mini and Luna alike — and a
 * rejected parameter is not a degraded answer, it is a 400 on every call and an
 * empty column on the report. So what a model accepts is looked up rather than
 * assumed, cached, and the default when we do not know is to leave the parameter
 * out. That asymmetry is the whole rule: a model that accepts `temperature` will
 * also answer without it, and a model that refuses it answers nothing at all.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Models {

	/** When the list below was last checked against OpenRouter's live catalogue. */
	const REVIEWED = '2026-08-17';

	const CAPS_OPTION = 'thallo_visibility_model_caps';

	/** How long a capability lookup is trusted. Long enough to cost nothing,
	    short enough that a model gaining a parameter is picked up in a week. */
	const CAPS_TTL = 604800;

	/**
	 * The recommended id per slot, as OpenRouter writes them.
	 *
	 * These are the ids that answered a full scan against production, not the
	 * newest ids in the catalogue. The distinction is the whole reason this list
	 * exists: `openai/gpt-5.6-luna` is the model somebody typing into ChatGPT is
	 * actually talking to, and it refused every call in this plugin for weeks
	 * while the report showed an empty column. A reading that is a generation
	 * behind beats a reading that does not exist.
	 *
	 *   ChatGPT · openai/gpt-4.1-nano. A generation behind, and written down as
	 *   a retreat rather than a preference. It accepts every parameter this
	 *   plugin sends and it has OpenAI's own search for the grounded half at the
	 *   same $0.01 a call. Moving to the GPT-5 family is a one-field experiment
	 *   now that the provider's own error message is printed — try it from the
	 *   "Check the models" button before trusting it to a live scan.
	 *
	 *   Claude · anthropic/claude-haiku-4.5. Still the newest model in its tier;
	 *   the only step up is Sonnet at five times the price for a reading this
	 *   size.
	 *
	 *   Gemini · google/gemini-3.6-flash for memory, 3.5-flash-lite with the web
	 *   open, where the search excerpts make prompt tokens the bill. Checked on
	 *   2026-08-17: `google/gemini-3.7-flash` exists, is served, and is cheaper
	 *   than 3.6 on both halves — the obvious next move, and deliberately not
	 *   made blind. Check it first.
	 *
	 *   Perplexity · perplexity/sonar. The base search model; the pro tiers buy
	 *   depth this reading does not use.
	 */
	const RECOMMENDED = array(
		'memory'   => array(
			'chatgpt'    => 'openai/gpt-4.1-nano',
			'claude'     => 'anthropic/claude-haiku-4.5',
			'gemini'     => 'google/gemini-3.6-flash',
			'perplexity' => 'perplexity/sonar',
		),
		'grounded' => array(
			'chatgpt'    => 'openai/gpt-4.1-nano',
			'claude'     => 'anthropic/claude-haiku-4.5',
			'gemini'     => 'google/gemini-3.5-flash-lite',
		),
	);

	/**
	 * @param string $slot 'memory' or 'grounded'.
	 * @param bool   $native Bare ids for the native APIs, which know nothing of
	 *                       OpenRouter's author prefix.
	 */
	public static function recommended( $provider, $slot = 'memory', $native = false ) {
		$list = isset( self::RECOMMENDED[ $slot ] ) ? self::RECOMMENDED[ $slot ] : array();
		$id   = isset( $list[ $provider ] ) ? $list[ $provider ] : '';

		if ( '' === $id || ! $native ) {
			return $id;
		}

		$slash = strpos( $id, '/' );

		return false === $slash ? $id : substr( $id, $slash + 1 );
	}

	// -----------------------------------------------------------------------
	// What a model accepts
	// -----------------------------------------------------------------------

	/**
	 * Whether `temperature` may be sent to this model.
	 *
	 * Unknown is false, and that is the safe direction rather than the cautious
	 * one: the parameter buys reproducibility between two scans a month apart,
	 * and sending it to a model that has dropped it costs the entire reading.
	 *
	 * The cost of being wrong this way is small and invisible — a scan sampled at
	 * the provider's default instead of at 0.2. The cost of being wrong the other
	 * way is a column of five failed calls. `learn()` runs when a scan starts, so
	 * in practice the answer is known for every configured model and this default
	 * only covers the native path and a catalogue that would not answer.
	 */
	public static function accepts_temperature( $model ) {
		$caps  = self::caps();
		$model = self::key( $model );

		return isset( $caps[ $model ]['temperature'] ) && $caps[ $model ]['temperature'];
	}

	/** True when we have never looked this model up, or the answer has expired. */
	public static function is_unknown( $model ) {
		$caps  = self::caps();
		$model = self::key( $model );

		return ! isset( $caps[ $model ]['at'] ) || ( time() - (int) $caps[ $model ]['at'] ) > self::CAPS_TTL;
	}

	/**
	 * Looks up anything on this list we do not already know, in one batch.
	 *
	 * OpenRouter only — it is the one route with a catalogue to ask. On the
	 * native path nothing is learned and every model stays "unknown", which
	 * means the parameter is left out and every model answers. That is the
	 * correct behaviour there, not a gap: three bespoke capability APIs to
	 * recover one sampling parameter is not a trade worth making.
	 *
	 * Called when a scan starts, so it happens once per model id per week rather
	 * than once per call, and never on the visitor's second scan.
	 */
	public static function learn( array $models ) {
		if ( 'openrouter' !== Thallo_Vis_Settings::get( 'provider_mode' ) ) {
			return;
		}

		$wanted = array();
		foreach ( $models as $model ) {
			$model = trim( (string) $model );
			if ( '' !== $model && self::is_unknown( $model ) && ! in_array( $model, $wanted, true ) ) {
				$wanted[] = $model;
			}
		}

		if ( ! $wanted ) {
			return;
		}

		$requests = array();
		foreach ( $wanted as $model ) {
			$requests[] = array(
				'url'     => 'https://openrouter.ai/api/v1/models/' . self::key( $model ) . '/endpoints',
				'headers' => array( 'Authorization' => 'Bearer ' . Thallo_Vis_Settings::get( 'openrouter_key' ) ),
				'body'    => null,
				'method'  => 'GET',
			);
		}

		/* Short, and a failure is not retried. This runs while somebody is
		   waiting for a scan to start; if the catalogue is slow the scan goes
		   ahead without the parameter, which is exactly what it does when the
		   answer is unknown for any other reason. */
		$responses = Thallo_Vis_HTTP::post_many( $requests, 8 );
		$caps      = self::caps();

		foreach ( $wanted as $index => $model ) {
			$response = isset( $responses[ $index ] ) ? $responses[ $index ] : null;

			if ( ! is_array( $response ) || $response['error'] || $response['code'] < 200 || $response['code'] >= 300 ) {
				continue;
			}

			$body = json_decode( $response['body'], true );
			if ( ! is_array( $body ) ) {
				continue;
			}

			$supported = array();
			$endpoints = isset( $body['data']['endpoints'] ) && is_array( $body['data']['endpoints'] )
				? $body['data']['endpoints']
				: array();

			foreach ( $endpoints as $endpoint ) {
				if ( isset( $endpoint['supported_parameters'] ) && is_array( $endpoint['supported_parameters'] ) ) {
					$supported = array_merge( $supported, $endpoint['supported_parameters'] );
				}
			}

			$caps[ self::key( $model ) ] = array(
				'at'          => time(),
				/* Any endpoint accepting it is enough: OpenRouter routes to one
				   of them, and a parameter one provider takes is not rejected by
				   the request, only ignored by the others. */
				'temperature' => in_array( 'temperature', $supported, true ),
				'served'      => (bool) $endpoints,
			);
		}

		update_option( self::CAPS_OPTION, $caps, false );
	}

	/** `:online` is routing, not identity — the catalogue knows the bare id. */
	private static function key( $model ) {
		return preg_replace( '/:online$/', '', strtolower( trim( (string) $model ) ) );
	}

	private static function caps() {
		$caps = get_option( self::CAPS_OPTION, array() );

		return is_array( $caps ) ? $caps : array();
	}
}
