<?php
/**
 * HTTP, in parallel where the host allows it.
 *
 * A tick may need to make five model calls. Done one after another at two
 * seconds each that is ten seconds of wall clock for work that has no reason to
 * be sequential — so they go out together through the Requests library that
 * ships with WordPress, which multiplexes them over curl_multi.
 *
 * Requests moved namespace in WordPress 6.2 and some hosts disable curl_multi
 * outright, so both are checked and there is a sequential path behind them. The
 * scan is slower on those hosts and otherwise identical.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_HTTP {

	/**
	 * @param array $jobs Each: array( 'url' => string, 'headers' => array, 'body' => string|null, 'method' => 'POST'|'GET' ).
	 * @return array Same keys as $jobs, each array( 'code' => int, 'body' => string, 'error' => string ).
	 */
	public static function post_many( array $jobs, $timeout = 25 ) {
		if ( empty( $jobs ) ) {
			return array();
		}

		$class = self::requests_class();

		if ( $class && count( $jobs ) > 1 ) {
			$parallel = self::run_parallel( $class, $jobs, $timeout );
			if ( null !== $parallel ) {
				return $parallel;
			}
		}

		return self::run_sequential( $jobs, $timeout );
	}

	public static function post_one( $url, array $headers, $body, $timeout = 25, $method = 'POST' ) {
		$result = self::post_many(
			array(
				array(
					'url'     => $url,
					'headers' => $headers,
					'body'    => $body,
					'method'  => $method,
				),
			),
			$timeout
		);

		return $result[0];
	}

	private static function requests_class() {
		if ( class_exists( '\WpOrg\Requests\Requests' ) ) {
			return '\WpOrg\Requests\Requests';
		}
		if ( class_exists( 'Requests' ) ) {
			return 'Requests';
		}
		return null;
	}

	/** @return array|null Null when the library throws, so the caller can fall back. */
	private static function run_parallel( $class, array $jobs, $timeout ) {
		$requests = array();

		foreach ( $jobs as $key => $job ) {
			$requests[ $key ] = array(
				'url'     => $job['url'],
				'headers' => isset( $job['headers'] ) ? $job['headers'] : array(),
				'data'    => isset( $job['body'] ) ? $job['body'] : null,
				'type'    => isset( $job['method'] ) ? $job['method'] : 'POST',
			);
		}

		try {
			$responses = call_user_func(
				array( $class, 'request_multiple' ),
				$requests,
				array(
					'timeout'         => $timeout,
					'connect_timeout' => 10,
					/* One model refusing to answer must not take the other four
					   down with it — every failure is reported per job below. */
					'verify'          => true,
				)
			);
		} catch ( \Throwable $e ) {
			return null;
		}

		$out = array();
		foreach ( $jobs as $key => $job ) {
			$response = isset( $responses[ $key ] ) ? $responses[ $key ] : null;

			if ( ! $response || $response instanceof \Exception || $response instanceof \Throwable ) {
				$out[ $key ] = array(
					'code'  => 0,
					'body'  => '',
					'error' => $response ? $response->getMessage() : 'no response',
				);
				continue;
			}

			$out[ $key ] = array(
				'code'  => isset( $response->status_code ) ? (int) $response->status_code : 0,
				'body'  => isset( $response->body ) ? (string) $response->body : '',
				'error' => '',
			);
		}

		return $out;
	}

	private static function run_sequential( array $jobs, $timeout ) {
		$out = array();

		foreach ( $jobs as $key => $job ) {
			$args = array(
				'timeout'     => $timeout,
				'headers'     => isset( $job['headers'] ) ? $job['headers'] : array(),
				'body'        => isset( $job['body'] ) ? $job['body'] : null,
				'method'      => isset( $job['method'] ) ? $job['method'] : 'POST',
				'redirection' => 3,
			);

			$response = wp_remote_request( $job['url'], $args );

			if ( is_wp_error( $response ) ) {
				$out[ $key ] = array(
					'code'  => 0,
					'body'  => '',
					'error' => $response->get_error_message(),
				);
				continue;
			}

			$out[ $key ] = array(
				'code'  => (int) wp_remote_retrieve_response_code( $response ),
				'body'  => (string) wp_remote_retrieve_body( $response ),
				'error' => '',
			);
		}

		return $out;
	}

	/**
	 * Models are asked for JSON and mostly comply, but a fenced block or a
	 * sentence of preamble is common enough that failing on it would throw away
	 * good answers. So: try the whole string, then the first balanced object in
	 * it.
	 */
	public static function extract_json( $text ) {
		$text = trim( (string) $text );
		if ( '' === $text ) {
			return null;
		}

		$decoded = json_decode( $text, true );
		if ( is_array( $decoded ) ) {
			return $decoded;
		}

		$text = preg_replace( '/^```(?:json)?\s*|\s*```$/m', '', $text );

		$start = strpos( $text, '{' );
		$end   = strrpos( $text, '}' );
		if ( false !== $start && false !== $end && $end > $start ) {
			$decoded = json_decode( substr( $text, $start, $end - $start + 1 ), true );
			if ( is_array( $decoded ) ) {
				return $decoded;
			}
		}

		return null;
	}
}
