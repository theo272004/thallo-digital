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
			$model = Thallo_Vis_Settings::get( 'gr_model_' . $provider, '' );
			$body  = self::openai_body( $model, $system, $question );

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
			$model = Thallo_Vis_Settings::get( 'or_model_' . $provider, '' );
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
				$model = Thallo_Vis_Settings::get( 'nv_model_chatgpt' );
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
				$model = Thallo_Vis_Settings::get( 'nv_model_claude' );
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
				$model = Thallo_Vis_Settings::get( 'nv_model_gemini' );
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
				$model = Thallo_Vis_Settings::get( 'nv_model_perplexity' );
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
			'temperature' => 0.2,
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
}
