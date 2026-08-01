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
	public static function build_job( $provider, $question, $system = null ) {
		$system = null === $system ? Thallo_Vis_Questions::system_prompt() : $system;
		$mode   = Thallo_Vis_Settings::get( 'provider_mode' );

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
				'body'    => wp_json_encode( self::openai_body( $model, $system, $question ) ),
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
	public static function parse( $shape, array $response ) {
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
			$detail = '';
			$body   = json_decode( $response['body'], true );
			if ( is_array( $body ) ) {
				if ( isset( $body['error']['message'] ) ) {
					$detail = ': ' . $body['error']['message'];
				} elseif ( isset( $body['message'] ) ) {
					$detail = ': ' . $body['message'];
				}
			}
			$out['error'] = 'HTTP ' . $response['code'] . $detail;
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
				   in a way a percentage is not. */
				if ( isset( $body['citations'] ) && is_array( $body['citations'] ) ) {
					$out['citations'] = array_values( array_filter( array_map( 'strval', $body['citations'] ) ) );
				} elseif ( isset( $body['search_results'] ) && is_array( $body['search_results'] ) ) {
					foreach ( $body['search_results'] as $result ) {
						if ( isset( $result['url'] ) ) {
							$out['citations'][] = (string) $result['url'];
						}
					}
				}
				break;
		}

		if ( '' === trim( $out['text'] ) && ! $out['citations'] ) {
			$out['error'] = 'empty answer';
			return $out;
		}

		$json = Thallo_Vis_HTTP::extract_json( $out['text'] );
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
