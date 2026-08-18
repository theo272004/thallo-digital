<?php
/**
 * Model adapters.
 *
 * Two ways to reach the same three models:
 *
 *   OpenRouter — one key, one bill, one OpenAI-shaped API in front of every
 *   model. Recommended, and the default, because the alternative is four
 *   billing relationships and four sets of rate limits to keep an eye on for a
 *   tool that spends single-digit cents a run.
 *
 *   Native — straight to OpenAI, Anthropic and Google. Worth using if you are
 *   already holding credit with them. Costs a little less per token and three
 *   more things to keep working.
 *
 * Either way, web search stays OFF for the three memory models. That is the
 * whole point of phase 1: we are asking what the model absorbed about a
 * category, not what it can look up while we watch.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_LLM {

	/**
	 * Builds one HTTP job for one question.
	 *
	 * @return array|null Null when the provider has no key configured.
	 */
	public static function build_job( $provider, $question, $system = null, $grounded = false ) {
		$system = null === $system ? Thallo_Vis_Questions::system_prompt() : $system;
		$mode   = Thallo_Vis_Settings::get( 'provider_mode' );

		/* The grounded reading exists on the OpenRouter path only — see
		   Settings::has_grounded_model() for why. Asked for anywhere else it
		   returns null, which the runner already treats as "not measured". */
		if ( $grounded ) {
			if ( ! Thallo_Vis_Settings::has_grounded_model( $provider ) ) {
				return null;
			}

			$key   = Thallo_Vis_Settings::get( 'openrouter_key' );
			$model = Thallo_Vis_Settings::model_for( $provider, 'grounded' );
			/* No JSON mode on this half, and this one is not a preference.
			 *
			 * "[Azure] Web Search cannot be used with JSON mode." — the
			 * provider's own sentence, printed at last by the error reader added
			 * in 1.5.1. Searching and `response_format: json_object` cannot be
			 * asked for in the same call, and every grounded ChatGPT call had
			 * been asking for both. That is the 400 that emptied this column for
			 * weeks, through three attempts at fixing it: the parameter was
			 * never the problem, the pair was.
			 *
			 * The format is still asked for, in words, by the system prompt —
			 * and `Thallo_Vis_HTTP::extract_json()` already reads a JSON object
			 * out of an answer that arrives wrapped in prose or a fence, which is
			 * exactly the case this creates. What is lost is the guarantee; what
			 * is gained is the reading existing at all. */
			$body  = self::openai_body( $model, $system, $question, false );

			/* No `temperature` on this half, deliberately.
			 *
			 * Phase 1 pins it because two scans of the same brand a month apart
			 * have to be comparable — that series is the product. This reading
			 * measures a moving target: the web changed between the two runs,
			 * and no sampling setting makes that reproducible. Pinning it here
			 * tightens a screw on a part that moves anyway.
			 *
			 * What it buys instead is that the model field is safe to edit. The
			 * newer OpenAI families do not accept `temperature` at all, so
			 * sending it turned a perfectly good model id into five failed calls
			 * and a blank column — the operator picks a better model and the
			 * report quietly gets worse. A parameter that is not load-bearing
			 * here should not be able to do that. */
			unset( $body['temperature'] );

			/* `:online` is OpenRouter's shorthand for the web plugin, and for
			   OpenAI, Anthropic and Google models it routes to that provider's
			   own native search rather than a third-party index. That matters
			   here more than convenience does: the claim on the report is "this
			   is what Gemini says when it searches", so it had better be
			   Google's search doing the looking. */
			$body['model'] = $model . ':online';

			/* `web_search_options` is OpenAI's own parameter, and OpenRouter
			   only strips it for providers that have no equivalent — Anthropic
			   and Google never saw it. Sent to an OpenAI model that does not
			   accept it, it is passed straight through and every call comes
			   back `HTTP 400: Provider returned error`. That is what blanked the
			   ChatGPT column of the search reading while Claude and Gemini
			   answered normally, and it was doing nothing for any of the three
			   defaults even when it did not fail.

			   OpenRouter publishes which models take it, in the
			   `supported_parameters` of `GET /api/v1/models` — today the gpt-4o
			   search family and Perplexity's own models, and none of the three
			   in the grounded slots. So it goes only where it is accepted. The
			   search itself is asked for with `:online`, which every model on
			   the route understands. */
			if ( self::takes_web_search_options( $model ) ) {
				$body['web_search_options'] = array(
					'search_context_size' => Thallo_Vis_Settings::get( 'grounded_context', 'low' ),
				);
			}

			return array(
				'url'     => 'https://openrouter.ai/api/v1/chat/completions',
				'headers' => array(
					'Authorization' => 'Bearer ' . $key,
					'Content-Type'  => 'application/json',
					'HTTP-Referer'  => home_url(),
					'X-Title'       => 'Thallo Visibility Engine',
				),
				'body'    => wp_json_encode( $body ),
				'model'   => $body['model'],
				'shape'   => 'openai',
			);
		}

		if ( 'openrouter' === $mode ) {
			$key   = Thallo_Vis_Settings::get( 'openrouter_key' );
			$model = Thallo_Vis_Settings::model_for( $provider );
			if ( '' === $key || '' === $model ) {
				return null;
			}

			return array(
				'url'     => 'https://openrouter.ai/api/v1/chat/completions',
				'headers' => array(
					'Authorization' => 'Bearer ' . $key,
					'Content-Type'  => 'application/json',
					/* OpenRouter attributes usage to these, and being identifiable
					   is what keeps an account off the shared rate limit. */
					'HTTP-Referer'  => home_url(),
					'X-Title'       => 'Thallo Visibility Engine',
				),
				/* Perplexity is the exception to the JSON mode, here as much as
				   on its own API: it rejects `response_format` outright and the
				   call comes back 400. The native branch below has always known
				   that; this one did not, so the whole live-retrieval half of
				   the report went unmeasured whenever OpenRouter was the route
				   — which is the recommended route, so in practice always. */
				'body'    => wp_json_encode( self::openai_body( $model, $system, $question, 'perplexity' !== $provider ) ),
				'model'   => $model,
				'shape'   => 'openai',
			);
		}

		switch ( $provider ) {
			case 'chatgpt':
				$key   = Thallo_Vis_Settings::get( 'openai_key' );
				$model = Thallo_Vis_Settings::model_for( 'chatgpt' );
				if ( '' === $key ) {
					return null;
				}
				return array(
					'url'     => 'https://api.openai.com/v1/chat/completions',
					'headers' => array(
						'Authorization' => 'Bearer ' . $key,
						'Content-Type'  => 'application/json',
					),
					'body'    => wp_json_encode( self::openai_body( $model, $system, $question ) ),
					'model'   => $model,
					'shape'   => 'openai',
				);

			case 'claude':
				$key   = Thallo_Vis_Settings::get( 'anthropic_key' );
				$model = Thallo_Vis_Settings::model_for( 'claude' );
				if ( '' === $key ) {
					return null;
				}
				return array(
					'url'     => 'https://api.anthropic.com/v1/messages',
					'headers' => array(
						'x-api-key'         => $key,
						'anthropic-version' => '2023-06-01',
						'Content-Type'      => 'application/json',
					),
					'body'    => wp_json_encode(
						array(
							'model'      => $model,
							'max_tokens' => 400,
							'system'     => $system,
							'messages'   => array(
								array(
									'role'    => 'user',
									'content' => $question,
								),
							),
						)
					),
					'model'   => $model,
					'shape'   => 'anthropic',
				);

			case 'gemini':
				$key   = Thallo_Vis_Settings::get( 'google_key' );
				$model = Thallo_Vis_Settings::model_for( 'gemini' );
				if ( '' === $key ) {
					return null;
				}
				return array(
					'url'     => 'https://generativelanguage.googleapis.com/v1beta/models/'
						. rawurlencode( $model ) . ':generateContent?key=' . rawurlencode( $key ),
					'headers' => array( 'Content-Type' => 'application/json' ),
					'body'    => wp_json_encode(
						array(
							'systemInstruction' => array( 'parts' => array( array( 'text' => $system ) ) ),
							'contents'          => array(
								array(
									'role'  => 'user',
									'parts' => array( array( 'text' => $question ) ),
								),
							),
							'generationConfig'  => array(
								'temperature'      => 0.2,
								'maxOutputTokens'  => 400,
								'responseMimeType' => 'application/json',
							),
						)
					),
					'model'   => $model,
					'shape'   => 'gemini',
				);

			case 'perplexity':
				$key   = Thallo_Vis_Settings::get( 'perplexity_key' );
				$model = Thallo_Vis_Settings::model_for( 'perplexity' );
				if ( '' === $key ) {
					return null;
				}
				return array(
					'url'     => 'https://api.perplexity.ai/chat/completions',
					'headers' => array(
						'Authorization' => 'Bearer ' . $key,
						'Content-Type'  => 'application/json',
					),
					'body'    => wp_json_encode( self::openai_body( $model, $system, $question, false ) ),
					'model'   => $model,
					'shape'   => 'openai',
				);
		}

		return null;
	}

	/**
	 * Does this model accept `web_search_options`?
	 *
	 * A pattern rather than a list, because the alternative is a lookup against
	 * OpenRouter's models endpoint on a request that is already spending money
	 * and already slow. Wrong in the safe direction by construction: a model
	 * that would have accepted it merely searches with the plugin's own default
	 * breadth, where a model that would not accept it fails every call.
	 */
	private static function takes_web_search_options( $model ) {
		return (bool) preg_match( '#^(openai/gpt-4o|perplexity/)#', (string) $model );
	}

	/**
	 * The part of a failure worth printing.
	 *
	 * OpenRouter answers a refused call with `"Provider returned error"`, which
	 * says only that somebody downstream said no. The sentence that tells you
	 * *what* was wrong — a rejected parameter, a retired model id, a quota — is
	 * one level further in, under `error.metadata.raw`, and was being discarded
	 * for reading only `error.message`.
	 *
	 * That cost a working diagnosis. A grounded ChatGPT slot failed every call
	 * for weeks reporting nothing but "Provider returned error", the cause was
	 * guessed at from the request shape, the guess was wrong, and the second
	 * scan said exactly the same eight words as the first. An error that cannot
	 * distinguish two causes cannot be debugged — only guessed at again.
	 *
	 * `raw` is whatever the provider sent, so it is length-capped: some come
	 * back as a paragraph, and the useful clause is always at the front.
	 */
	private static function error_detail( $raw_body ) {
		$body = json_decode( (string) $raw_body, true );
		if ( ! is_array( $body ) ) {
			return '';
		}

		$parts = array();

		if ( isset( $body['error']['message'] ) ) {
			$parts[] = (string) $body['error']['message'];
		} elseif ( isset( $body['message'] ) ) {
			$parts[] = (string) $body['message'];
		}

		/* Names the provider that refused, which is the difference between "our
		   key is wrong" and "OpenAI does not accept this". */
		if ( isset( $body['error']['metadata']['provider_name'] ) ) {
			$parts[] = '[' . (string) $body['error']['metadata']['provider_name'] . ']';
		}

		if ( isset( $body['error']['metadata']['raw'] ) ) {
			$upstream = $body['error']['metadata']['raw'];

			/* Sometimes a JSON string, sometimes an object already decoded. */
			if ( is_string( $upstream ) ) {
				$decoded = json_decode( $upstream, true );
				if ( isset( $decoded['error']['message'] ) ) {
					$upstream = $decoded['error']['message'];
				}
			} elseif ( is_array( $upstream ) ) {
				$upstream = isset( $upstream['error']['message'] )
					? $upstream['error']['message']
					: wp_json_encode( $upstream );
			}

			if ( is_string( $upstream ) && '' !== trim( $upstream ) ) {
				$parts[] = mb_substr( trim( $upstream ), 0, 300 );
			}
		}

		return $parts ? ': ' . implode( ' ', $parts ) : '';
	}

	private static function openai_body( $model, $system, $question, $json_mode = true ) {
		$body = array(
			'model'       => $model,
			'max_tokens'  => 400,
			'messages'    => array(
				array(
					'role'    => 'system',
					'content' => $system,
				),
				array(
					'role'    => 'user',
					'content' => $question,
				),
			),
		);

		/* `temperature` only where it is taken.
		 *
		 * It is worth having: two scans of the same brand a month apart are only
		 * comparable if the sampling was the same, and that series is the
		 * product. But OpenAI's entire current lineup has dropped the parameter —
		 * nano, mini and Luna alike — and a rejected parameter is not a slightly
		 * worse answer, it is a 400 on every call and an empty column on the
		 * report. That asymmetry decides the default: a model that accepts it
		 * answers fine without it; a model that refuses it answers nothing.
		 *
		 * `Thallo_Vis_Models::learn()` fills this in when a scan starts, so for a
		 * configured model the answer is known rather than assumed. It is also
		 * what makes the model field safe to edit again: an id that has dropped
		 * the parameter no longer takes the column down with it.
		 */
		if ( Thallo_Vis_Models::accepts_temperature( $model ) ) {
			$body['temperature'] = 0.2;
		}

		/* A thinking model, told not to think.
		 *
		 * Reasoning tokens are charged against `max_tokens` before a single
		 * character of the answer is written, so a reasoning model given a
		 * 400-token budget spends it deliberating and returns an empty message.
		 * That is exactly what happened to `google/gemini-3.6-flash`: every call
		 * came back "Provider returned an empty response", the column rendered
		 * as "not measured", and the two models that do not reason answered
		 * normally — which made it look like Gemini's opinion rather than our
		 * request.
		 *
		 * Off rather than budgeted for, and the reason is the measurement, not
		 * the bill: this asks which companies a model names in a category. That
		 * is recall, not a problem to work through, and a model that reasons its
		 * way to an answer is doing something a person typing the same question
		 * into the app does not get. The budget is raised anyway, so a model
		 * that ignores the instruction still has room to finish the list. */
		if ( Thallo_Vis_Models::reasons( $model ) ) {
			$body['reasoning']  = array( 'enabled' => false );
			/* And room to answer even if the instruction is ignored. Providers
			   differ on whether reasoning can be switched off at all, and a
			   model that thinks anyway needs the budget to cover the thinking
			   and the list. `max_tokens` is a ceiling, not a purchase: what is
			   billed is what is generated, and the answer this asks for is eight
			   company names. */
			$body['max_tokens'] = 1600;
		}

		/* Perplexity rejects response_format on some models, and it is the one
		   provider whose answer we want in prose anyway — the citations are the
		   point there, not the ranking. */
		if ( $json_mode ) {
			$body['response_format'] = array( 'type' => 'json_object' );
		}

		return $body;
	}

	/**
	 * Pulls the answer out of whichever response shape came back.
	 *
	 * @return array array( 'text' => string, 'companies' => string[], 'citations' => string[], 'error' => string )
	 */
	/**
	 * @param bool $expect_json Whether this job asked for the JSON company list.
	 *                          False for the retrieval reading, which asks for
	 *                          prose on purpose — its evidence is the citations,
	 *                          not a ranking. Judging prose against a format it
	 *                          was never asked for is how a working answer gets
	 *                          reported as unreadable.
	 */
	public static function parse( $shape, array $response, $expect_json = true ) {
		$out = array(
			'text'      => '',
			'companies' => array(),
			'citations' => array(),
			/* Which model actually answered, in its own words, rather than the id
			   we asked for. They are not always the same thing — an alias
			   resolves to a dated snapshot, and a router is free to serve a
			   request from whatever it has. The report prints a model id beside
			   every column, and that line is a claim about how the number was
			   produced, so it should be the answer's own account of itself. */
			'model'     => '',
			'error'     => '',
		);

		if ( $response['error'] ) {
			$out['error'] = $response['error'];
			return $out;
		}

		if ( $response['code'] < 200 || $response['code'] >= 300 ) {
			$out['error'] = 'HTTP ' . $response['code'] . self::error_detail( $response['body'] );
			return $out;
		}

		$body = json_decode( $response['body'], true );
		if ( ! is_array( $body ) ) {
			$out['error'] = 'unreadable response';
			return $out;
		}

		/* A 200 that carries an error. OpenRouter answers this way when the
		   upstream provider refuses mid-stream, and so does Google when a
		   request is filtered — the HTTP call succeeded, the generation did not.
		   Read only for `choices`, that body has no text in it and came back as
		   "empty answer", throwing away the one sentence that says what went
		   wrong. Same reader as the non-200 path, so it names the provider too. */
		if ( isset( $body['error'] ) ) {
			$detail       = trim( self::error_detail( $response['body'] ), ': ' );
			$out['error'] = '' !== $detail ? $detail : 'the provider returned an error';
			return $out;
		}

		/* Read before the text, and kept even when the answer turns out to be
		   unusable: "gpt-4.1-nano answered and the JSON was malformed" is a
		   different problem from "something else answered". */
		if ( isset( $body['model'] ) && is_string( $body['model'] ) ) {
			$out['model'] = $body['model'];
		} elseif ( isset( $body['modelVersion'] ) && is_string( $body['modelVersion'] ) ) {
			// Google's name for the same field.
			$out['model'] = $body['modelVersion'];
		}

		switch ( $shape ) {
			case 'anthropic':
				if ( isset( $body['content'][0]['text'] ) ) {
					$out['text'] = (string) $body['content'][0]['text'];
				}
				break;

			case 'gemini':
				if ( isset( $body['candidates'][0]['content']['parts'] ) ) {
					foreach ( $body['candidates'][0]['content']['parts'] as $part ) {
						if ( isset( $part['text'] ) ) {
							$out['text'] .= $part['text'];
						}
					}
				}
				break;

			case 'openai':
			default:
				if ( isset( $body['choices'][0]['message']['content'] ) ) {
					$out['text'] = (string) $body['choices'][0]['message']['content'];
				}
				/* Perplexity returns its sources alongside the message. They are
				   the most useful thing it gives us — a citation list is evidence
				   in a way a percentage is not.

				   Three shapes, because the same answer arrives differently
				   depending on the road it took. `citations` and `search_results`
				   are Perplexity's own API. Through OpenRouter the sources are
				   normalised onto OpenAI's `annotations` schema instead, and
				   nothing in the body carries the native field names — so a
				   parser that only knew the first two read every grounded answer
				   as having no sources at all. */
				if ( isset( $body['citations'] ) && is_array( $body['citations'] ) ) {
					$out['citations'] = array_values( array_filter( array_map( 'strval', $body['citations'] ) ) );
				} elseif ( isset( $body['search_results'] ) && is_array( $body['search_results'] ) ) {
					foreach ( $body['search_results'] as $result ) {
						if ( isset( $result['url'] ) ) {
							$out['citations'][] = (string) $result['url'];
						}
					}
				} elseif ( isset( $body['choices'][0]['message']['annotations'] ) && is_array( $body['choices'][0]['message']['annotations'] ) ) {
					foreach ( $body['choices'][0]['message']['annotations'] as $annotation ) {
						if ( isset( $annotation['url_citation']['url'] ) ) {
							$out['citations'][] = (string) $annotation['url_citation']['url'];
						}
					}
					$out['citations'] = array_values( array_unique( $out['citations'] ) );
				}
				break;
		}

		if ( '' === trim( $out['text'] ) && ! $out['citations'] ) {
			$out['error'] = 'empty answer';
			return $out;
		}

		$json = Thallo_Vis_HTTP::extract_json( $out['text'] );

		/* An answer we could not read is not an answer of "nobody". The counter
		   downstream treats an empty company list as a measured zero — the model
		   named nobody — and that is only true when the model actually returned
		   a companies array that was empty. Prose with no JSON in it means the
		   model ignored the format, which happens when a model is asked to
		   search and answer in JSON at once. Reporting that as "you were not
		   named" would put a finding in front of someone with nothing behind it.
		   Gated on $expect_json, not on whether citations happen to be present:
		   citations are evidence the answer is real, but their absence is not
		   evidence it is broken, and hanging the check on them made a working
		   prose answer unreadable the moment its sources arrived under a field
		   name this parser did not yet read. */
		if ( $expect_json && ( ! is_array( $json ) || ! isset( $json['companies'] ) || ! is_array( $json['companies'] ) ) ) {
			$out['error'] = 'unreadable answer: the model did not return the list in the format asked for';
			return $out;
		}

		if ( is_array( $json ) && isset( $json['companies'] ) && is_array( $json['companies'] ) ) {
			foreach ( $json['companies'] as $name ) {
				if ( is_string( $name ) ) {
					$name = trim( $name );
				} elseif ( is_array( $name ) && isset( $name['name'] ) ) {
					// Some models wrap each entry in an object however the prompt is worded.
					$name = trim( (string) $name['name'] );
				} else {
					continue;
				}

				if ( '' !== $name && mb_strlen( $name ) <= 80 ) {
					$out['companies'][] = $name;
				}
			}
		}

		return $out;
	}

	// -----------------------------------------------------------------------
	// Checking the models before a visitor does it for us
	// -----------------------------------------------------------------------

	/**
	 * Who each column is supposed to be.
	 *
	 * The report prints "ChatGPT" over a column, and that word is the finding as
	 * much as the percentage under it is: a client reads it as what the assistant
	 * they use says about them. So the id in the ChatGPT slot has to be an OpenAI
	 * model. A router will happily serve `anthropic/claude-haiku-4.5` from the
	 * field labelled ChatGPT, answer every call successfully, and produce a report
	 * that is wrong in the one way nobody would think to check.
	 */
	const EXPECTED_AUTHOR = array(
		'chatgpt'    => 'openai',
		'claude'     => 'anthropic',
		'gemini'     => 'google',
		'perplexity' => 'perplexity',
	);

	/**
	 * Is the model that answered the model we asked for?
	 *
	 * Not a string comparison, because an exact match is not what "the right
	 * model" means on any of these APIs. Aliases resolve to dated snapshots —
	 * `claude-3-5-haiku-latest` answers as `claude-3-5-haiku-20241022`,
	 * `gpt-4.1-nano` as `gpt-4.1-nano-2025-04-14` — and that is the id doing
	 * exactly what it was asked to. What is worth flagging is a different model
	 * altogether.
	 *
	 * @return bool|null Null when the response carried no model id to compare.
	 */
	public static function same_model( $requested, $answered ) {
		$answered = strtolower( trim( (string) $answered ) );
		if ( '' === $answered ) {
			return null;
		}

		$requested = strtolower( trim( (string) $requested ) );
		/* `:online` is a routing instruction, not part of the id, and OpenRouter
		   answers with the bare model. */
		$requested = preg_replace( '/:online$/', '', $requested );
		$requested = preg_replace( '/-latest$/', '', $requested );

		if ( '' === $requested ) {
			return null;
		}

		return $requested === $answered || 0 === strpos( $answered, $requested );
	}

	/** The author half of an OpenRouter id: `openai/gpt-4.1-nano` → `openai`. */
	private static function author_of( $model ) {
		$model = strtolower( trim( (string) $model ) );
		$slash = strpos( $model, '/' );

		return false === $slash ? '' : substr( $model, 0, $slash );
	}

	/**
	 * Every configured model, checked.
	 *
	 * Run from the settings screen. Model ids are the one part of this plugin
	 * with an expiry date — a provider retires one and every scan afterwards
	 * reports that column as unavailable, which the visitor reads as a finding
	 * about their brand rather than as our configuration going stale. This is the
	 * screen that says so before a visitor finds out.
	 *
	 * @return array[] One row per configured slot.
	 */
	public static function verify_all() {
		$slots = array();

		foreach ( array( 'chatgpt', 'claude', 'gemini', 'perplexity' ) as $provider ) {
			$slots[] = array( $provider, false );
		}

		if ( Thallo_Vis_Settings::get( 'grounded_enabled' ) ) {
			foreach ( array( 'chatgpt', 'claude', 'gemini' ) as $provider ) {
				$slots[] = array( $provider, true );
			}
		}

		/* Look up what these models accept before calling them, so the check
		   sends the same body a scan will and a "Working" verdict means the real
		   call works. Without it the first check after a model change would send
		   no `temperature` and the first scan afterwards would send one. */
		$learn = array();
		foreach ( $slots as $slot ) {
			$learn[] = Thallo_Vis_Settings::model_for( $slot[0], $slot[1] ? 'grounded' : 'memory' );
		}
		Thallo_Vis_Models::learn( $learn );

		$checks   = array();
		$requests = array();

		foreach ( $slots as $slot ) {
			$check    = self::prepare( $slot[0], $slot[1] );
			$checks[] = $check;

			if ( $check['request'] ) {
				$requests[ count( $checks ) - 1 ] = $check['request'];
			}
		}

		/* All of them at once, and on a short leash.
		 *
		 * Seven slots asked one after another at the scan's own timeout is over
		 * two minutes of wall clock, and a shared host will cut the request off
		 * long before that — leaving somebody looking at a white screen having
		 * been charged for whichever calls did complete. They have nothing to do
		 * with each other, so they go out together, and a model too slow to
		 * answer a one-line question in fifteen seconds is a finding in itself. */
		$responses = Thallo_Vis_HTTP::post_many( array_values( $requests ), 15 );
		$positions = array_keys( $requests );
		$rows      = array();

		foreach ( $positions as $offset => $position ) {
			$checks[ $position ]['response'] = $responses[ $offset ];
		}

		foreach ( $checks as $check ) {
			$rows[] = self::finish( $check );
		}

		return $rows;
	}

	/**
	 * One slot, checked the way the scan will use it.
	 *
	 * The memory slots are checked by making the call — the same job the runner
	 * builds, with the same body — because that is the only thing that proves the
	 * key, the id and the parameters all work together. It is one short call,
	 * a hundredth of a cent, and it answers the question the settings screen
	 * cannot: not "is this id plausible" but "what came back when we asked".
	 *
	 * The grounded slots are checked against OpenRouter's catalogue instead, and
	 * deliberately not called: `:online` carries a per-call search fee, and
	 * pressing a button on a settings screen should not cost fifteen cents. The
	 * catalogue answers the two things that actually go wrong there — the id has
	 * been retired, or it belongs to the wrong provider so `:online` would route
	 * to a third-party index rather than that provider's own search.
	 *
	 * Split in two — everything that can be decided without the network here,
	 * everything that reads a response in `finish()` — so that all of the calls
	 * can go out in one batch between them.
	 *
	 * @return array array( 'row' => array, 'kind' => 'done'|'call'|'catalogue', 'job' => array|null, 'request' => array|null )
	 */
	private static function prepare( $provider, $grounded = false ) {
		$check = array(
			'row'      => array(),
			'kind'     => 'done',
			'job'      => null,
			'request'  => null,
			'response' => null,
		);

		$row = array(
			'provider'  => $provider,
			'slot'      => $grounded ? 'grounded' : 'memory',
			'requested' => '',
			'answered'  => '',
			'status'    => 'unconfigured',
			'detail'    => '',
		);

		$mode             = Thallo_Vis_Settings::get( 'provider_mode' );
		$row['requested'] = Thallo_Vis_Settings::model_for( $provider, $grounded ? 'grounded' : 'memory' );

		$job = self::build_job(
			$provider,
			/* A real question in the real format, not a "say OK". The point of
			   asking at all is to exercise the exact call the scan makes — a
			   model that answers a greeting and then refuses `response_format`
			   would pass a cheaper check and fail every scan. */
			'Which companies would you recommend for business accounting software?',
			null,
			$grounded
		);

		if ( ! $job ) {
			$row['detail'] = $grounded
				? __( 'Not checked — the second reading is off, or this installation is not on OpenRouter.', 'thallo-visibility' )
				: __( 'No key or no model id configured for this slot, so the scan will skip it and the report will say so.', 'thallo-visibility' );

			$check['row'] = $row;
			return $check;
		}

		/* The family check first, because it needs no network and it is the
		   failure that hides best: everything works, and the column is labelled
		   with somebody else's name. Only on the OpenRouter path — a native id
		   carries no author, and the key it goes out with is the provider. */
		if ( 'openrouter' === $mode || $grounded ) {
			$author   = self::author_of( $row['requested'] );
			$expected = isset( self::EXPECTED_AUTHOR[ $provider ] ) ? self::EXPECTED_AUTHOR[ $provider ] : '';

			if ( '' === $author ) {
				$row['status'] = 'wrong-model';
				$row['detail'] = sprintf(
					/* translators: %s: the model id as configured. */
					__( '“%s” is not an OpenRouter id. They are written author/model, for example openai/gpt-4.1-nano.', 'thallo-visibility' ),
					$row['requested']
				);

				$check['row'] = $row;
				return $check;
			}

			if ( '' !== $expected && $author !== $expected ) {
				$row['status'] = 'wrong-model';
				$row['detail'] = sprintf(
					/* translators: 1: expected author, 2: configured author. */
					__( 'This column is reported to the client as %1$s, but the id belongs to %2$s. The scan would run, and the report would be wrong in the one way nobody checks.', 'thallo-visibility' ),
					ucfirst( $expected ),
					ucfirst( $author )
				);

				$check['row'] = $row;
				return $check;
			}
		}

		$check['row'] = $row;
		$check['job'] = $job;

		if ( $grounded ) {
			$check['kind']    = 'catalogue';
			$check['request'] = array(
				'url'     => 'https://openrouter.ai/api/v1/models/' . $row['requested'] . '/endpoints',
				'headers' => array( 'Authorization' => 'Bearer ' . Thallo_Vis_Settings::get( 'openrouter_key' ) ),
				'body'    => null,
				'method'  => 'GET',
			);

			return $check;
		}

		$check['kind']    = 'call';
		$check['request'] = $job;

		return $check;
	}

	/** Reads whatever came back for one slot. */
	private static function finish( array $check ) {
		if ( 'done' === $check['kind'] ) {
			return $check['row'];
		}

		$row      = $check['row'];
		$response = $check['response'];

		if ( ! is_array( $response ) ) {
			$row['status'] = 'error';
			$row['detail'] = __( 'No response — the request was never made.', 'thallo-visibility' );
			return $row;
		}

		return 'catalogue' === $check['kind']
			? self::finish_catalogue( $row, $response )
			: self::finish_call( $row, $check['job'], $response );
	}

	private static function finish_call( array $row, array $job, array $response ) {
		$parsed          = self::parse( $job['shape'], $response, 'perplexity' !== $row['provider'] );
		$row['answered'] = $parsed['model'];

		if ( '' !== $parsed['error'] ) {
			$row['status'] = 'error';
			$row['detail'] = $parsed['error'];
			return $row;
		}

		$same = self::same_model( $job['model'], $parsed['model'] );

		if ( false === $same ) {
			$row['status'] = 'wrong-model';
			$row['detail'] = sprintf(
				/* translators: 1: the id asked for, 2: the id that answered. */
				__( 'Asked for %1$s and %2$s answered. The report would print the id we asked for over numbers somebody else produced.', 'thallo-visibility' ),
				$job['model'],
				$parsed['model']
			);
			return $row;
		}

		$row['status'] = 'ok';
		$row['detail'] = null === $same
			? __( 'Answered, and the answer was readable. This API does not say which model produced it, so the id cannot be confirmed from the response.', 'thallo-visibility' )
			: __( 'Answered, in the format the scan needs, as the model asked for.', 'thallo-visibility' );

		return $row;
	}

	/**
	 * Is this id still served? OpenRouter keeps the metadata for models nobody
	 * runs any more, so `/models/{id}` resolving proves nothing — the endpoints
	 * list is what says whether a call would find a provider to answer it. This
	 * is how the two retired defaults were caught, by hand, in August.
	 */
	private static function finish_catalogue( array $row, array $response ) {
		if ( $response['error'] ) {
			$row['status'] = 'error';
			$row['detail'] = $response['error'];
			return $row;
		}

		if ( 404 === (int) $response['code'] ) {
			$row['status'] = 'wrong-model';
			$row['detail'] = __( 'OpenRouter has no model with that id.', 'thallo-visibility' );
			return $row;
		}

		$body = json_decode( $response['body'], true );

		if ( $response['code'] < 200 || $response['code'] >= 300 || ! is_array( $body ) ) {
			$row['status'] = 'error';
			$row['detail'] = 'HTTP ' . $response['code'];
			return $row;
		}

		$endpoints = isset( $body['data']['endpoints'] ) && is_array( $body['data']['endpoints'] )
			? $body['data']['endpoints']
			: array();

		if ( ! $endpoints ) {
			$row['status'] = 'wrong-model';
			$row['detail'] = __( 'The id still resolves but nothing serves it any more — a retired model. Every call would fail and the column would report as unavailable.', 'thallo-visibility' );
			return $row;
		}

		$row['answered'] = isset( $body['data']['id'] ) ? (string) $body['data']['id'] : $row['requested'];
		$row['status']   = 'ok';
		$row['detail']   = sprintf(
			/* translators: %d: how many providers serve the model. */
			_n(
				'Served by %d provider. Not called: with search on, a test call carries the same per-call search fee a real scan does.',
				'Served by %d providers. Not called: with search on, a test call carries the same per-call search fee a real scan does.',
				count( $endpoints ),
				'thallo-visibility'
			),
			count( $endpoints )
		);

		return $row;
	}
}
