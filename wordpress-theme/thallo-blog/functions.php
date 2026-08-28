<?php
/**
 * Thallo Blog — a child of Twenty Twenty-Five.
 *
 * There is almost nothing here on purpose. A block theme is styled from
 * theme.json, which WordPress applies to the editor and the front end from the
 * same file — so what you see while writing is what a reader gets. PHP is only
 * for the two things theme.json cannot do: fetch the fonts, and load this
 * theme's own stylesheet.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The version stamp this theme puts on its own stylesheet and scripts.
 *
 * It was `wp_get_theme()->get( 'Version' )`, which is the version in
 * style.css's header — and that is only a cache key if somebody remembers to
 * change it. Nobody did: style.css was edited perhaps a dozen times while the
 * header said 1.6.0, so `?ver=1.6.0` kept pointing at whatever the browser had
 * cached the first time it saw that number. The blog was correct on the server
 * and a year out of date in the reader's browser, which is the worst of the
 * two — it cannot be found by looking at the site, only by looking at somebody
 * else's screen.
 *
 * The file's own modification time cannot be forgotten. It changes when the
 * file changes and only then, so every visitor gets the new bytes on the first
 * request after a deploy and the old bytes stay cached until there are new
 * ones. The theme version is the fallback, for the case where the file cannot
 * be stat'ed.
 *
 * @param string $file Path inside the theme, e.g. 'assets/nav.js'.
 * @return string
 */
function thallo_blog_asset_version( $file = 'style.css' ) {
	$path  = get_stylesheet_directory() . '/' . ltrim( $file, '/' );
	$mtime = file_exists( $path ) ? filemtime( $path ) : false;

	return $mtime ? (string) $mtime : (string) wp_get_theme()->get( 'Version' );
}

/**
 * The three faces the site uses: Inter for everything, Instrument Serif for the
 * display italics, Space Mono for machine output.
 *
 * Loaded from Google's CDN rather than bundled. The main site self-hosts these
 * through next/font, and self-hosting here would be better for the same reasons
 * — one less third party, no request to Google carrying the reader's address.
 * It is not done yet because it means committing six font files and keeping
 * them current, and the blog has one post. Worth revisiting before it has
 * twenty. `display=swap` so text is readable while they load rather than
 * invisible.
 */
function thallo_blog_fonts() {
	wp_enqueue_style(
		'thallo-blog-fonts',
		'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&display=swap',
		array(),
		null
	);

	/* The child's own stylesheet. Block themes load theme.json automatically
	   but not style.css, and the handful of rules in there — the reading
	   measure, the heading rhythm, table scrolling — are the ones theme.json
	   has no vocabulary for. */
	wp_enqueue_style(
		'thallo-blog',
		get_stylesheet_uri(),
		array( 'thallo-blog-fonts' ),
		thallo_blog_asset_version( 'style.css' )
	);
}
add_action( 'wp_enqueue_scripts', 'thallo_blog_fonts' );

/**
 * The contents list, on posts only.
 *
 * Deferred and tiny. It builds the list from headings that are already in the
 * HTML, so nothing on the page depends on it having run — a reader with the
 * script blocked gets the post, minus a convenience.
 */
function thallo_blog_toc_script() {
	if ( ! is_singular( 'post' ) ) {
		return;
	}

	wp_enqueue_script(
		'thallo-blog-toc',
		get_stylesheet_directory_uri() . '/assets/toc.js',
		array(),
		thallo_blog_asset_version( 'assets/toc.js' ),
		array( 'strategy' => 'defer', 'in_footer' => true )
	);
}
add_action( 'wp_enqueue_scripts', 'thallo_blog_toc_script' );

/**
 * The navbar, on every page of the blog.
 *
 * Not `is_singular` like the contents list: the bar is on the archive too, and
 * hiding on scroll is most of what makes it feel like the site's navbar rather
 * than a strip pinned to the top of somebody else's page.
 */
function thallo_blog_nav_script() {
	wp_enqueue_script(
		'thallo-blog-nav',
		get_stylesheet_directory_uri() . '/assets/nav.js',
		array(),
		thallo_blog_asset_version( 'assets/nav.js' ),
		array( 'strategy' => 'defer', 'in_footer' => true )
	);
}
add_action( 'wp_enqueue_scripts', 'thallo_blog_nav_script' );

/**
 * The same fonts inside the editor.
 *
 * Without this the editor renders the post in its own default face while
 * theme.json applies Thallo's sizes and spacing to it — which looks wrong in a
 * way that is hard to place and makes every judgement about line length and
 * heading weight useless while writing.
 */
function thallo_blog_editor_fonts() {
	add_editor_style(
		array(
			'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&family=Space+Mono:wght@400;700&display=swap',
			'style.css',
		)
	);
}
add_action( 'after_setup_theme', 'thallo_blog_editor_fonts' );

/**
 * How long the post takes to read, as a string.
 *
 * Exposed as a shortcode because a block template is markup, not PHP, and this
 * is the one number on the page that has to be computed. 220 words a minute is
 * the middle of the range the research puts adult silent reading at; the figure
 * is a courtesy to the reader deciding whether to start, not a measurement, so
 * the third decimal place of the constant does not matter.
 */
function thallo_blog_reading_time() {
	$post = get_post();
	if ( ! $post ) {
		return '';
	}

	$words   = str_word_count( wp_strip_all_tags( strip_shortcodes( $post->post_content ) ) );
	$minutes = max( 1, (int) round( $words / 220 ) );

	/* translators: %d: estimated reading time in minutes. */
	return esc_html( sprintf( _n( '%d min read', '%d min read', $minutes, 'thallo-blog' ), $minutes ) );
}
add_shortcode( 'thallo_reading_time', 'thallo_blog_reading_time' );

/**
 * Pulls the questions and answers back out of a post's FAQ section.
 *
 * The pattern at patterns/faq.php writes a plain group with a class on it. This
 * reads that group back and returns [question => answer] pairs, so the markup
 * below is generated from what was actually published rather than typed twice.
 * Structured data that is maintained separately from the prose it describes
 * drifts from it, and then makes a claim about the page that the page no longer
 * supports — which is exactly the failure this whole product exists to find.
 *
 * @return array<string,string>
 */
function thallo_blog_faq_pairs( $content ) {
	if ( false === strpos( $content, 'thallo-faq' ) || ! class_exists( 'DOMDocument' ) ) {
		return array();
	}

	$dom      = new DOMDocument();
	$previous = libxml_use_internal_errors( true );
	/* The block markup is a fragment, not a document, and it is UTF-8. Without
	   the encoding hint DOMDocument reads it as Latin-1 and every accented
	   character comes back broken. */
	$dom->loadHTML( '<?xml encoding="UTF-8"><div>' . $content . '</div>', LIBXML_NOERROR | LIBXML_NOWARNING );
	libxml_clear_errors();
	libxml_use_internal_errors( $previous );

	$xpath = new DOMXPath( $dom );
	$pairs = array();

	$sections = $xpath->query( "//*[contains(concat(' ', normalize-space(@class), ' '), ' thallo-faq ')]" );
	if ( ! $sections || 0 === $sections->length ) {
		return array();
	}

	foreach ( $sections as $section ) {
		foreach ( $xpath->query( './/h3', $section ) as $question ) {
			$text = trim( $question->textContent );
			if ( '' === $text ) {
				continue;
			}

			/* Everything between this h3 and the next one is its answer. */
			$answer = '';
			for ( $node = $question->nextSibling; $node; $node = $node->nextSibling ) {
				if ( XML_ELEMENT_NODE === $node->nodeType && 'h3' === strtolower( $node->nodeName ) ) {
					break;
				}
				$answer .= ' ' . $node->textContent;
			}

			$answer = trim( preg_replace( '/\s+/', ' ', $answer ) );
			if ( '' !== $answer ) {
				$pairs[ $text ] = $answer;
			}
		}
	}

	return $pairs;
}

/**
 * Article and FAQPage structured data on single posts.
 *
 * Thallo's own scan gives a site points for exactly this markup, on the grounds
 * that it lets a model resolve who wrote a page and what it claims instead of
 * inferring both from prose. A blog selling that finding while shipping without
 * it would be a bad look, and — more to the point — the posts are the asset
 * meant to get cited.
 *
 * Emitted from post data rather than hand-written per post, so it cannot fall
 * out of step with the post it describes.
 */
function thallo_blog_schema() {
	if ( ! is_singular( 'post' ) ) {
		return;
	}

	$post = get_post();
	if ( ! $post ) {
		return;
	}

	$graph = array();

	$article = array(
		'@context'         => 'https://schema.org',
		'@type'            => 'BlogPosting',
		'headline'         => wp_strip_all_tags( get_the_title( $post ) ),
		'datePublished'    => get_the_date( 'c', $post ),
		'dateModified'     => get_the_modified_date( 'c', $post ),
		'mainEntityOfPage' => get_permalink( $post ),
		'author'           => array(
			'@type' => 'Organization',
			'name'  => 'Thallo Digital',
			'url'   => 'https://thallodigital.com/',
		),
		'publisher'        => array(
			'@type' => 'Organization',
			'name'  => 'Thallo Digital',
			'url'   => 'https://thallodigital.com/',
		),
	);

	$excerpt = wp_strip_all_tags( get_the_excerpt( $post ) );
	if ( '' !== $excerpt ) {
		$article['description'] = $excerpt;
	}

	$image = get_the_post_thumbnail_url( $post, 'full' );
	if ( $image ) {
		$article['image'] = $image;
	}

	$graph[] = $article;

	$pairs = thallo_blog_faq_pairs( $post->post_content );
	if ( $pairs ) {
		$entities = array();
		foreach ( $pairs as $question => $answer ) {
			$entities[] = array(
				'@type'          => 'Question',
				'name'           => $question,
				'acceptedAnswer' => array(
					'@type' => 'Answer',
					'text'  => $answer,
				),
			);
		}

		$graph[] = array(
			'@context'   => 'https://schema.org',
			'@type'      => 'FAQPage',
			'mainEntity' => $entities,
		);
	}

	foreach ( $graph as $item ) {
		echo "\n" . '<script type="application/ld+json">' . wp_json_encode( $item, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
	}
}
add_action( 'wp_head', 'thallo_blog_schema' );

/**
 * Drops WordPress's default category from anywhere it would be printed.
 *
 * "Uncategorized" is what a post gets when nobody chose, so printing it as a
 * badge announces the omission rather than describing the post — and a filter
 * row whose only option is that word is furniture. Removed at render rather
 * than hidden with CSS, because the string also reaches the RSS feed, the
 * category archive and the structured data, and hiding it in one of the four
 * places it appears is not the same as not saying it.
 *
 * Nothing is deleted. Give a post a real category and the badge returns.
 */
function thallo_blog_hide_default_term( $content, $block ) {
	if ( empty( $block['blockName'] ) ) {
		return $content;
	}

	if ( 'core/post-terms' === $block['blockName'] || 'core/categories' === $block['blockName'] ) {
		$default = (int) get_option( 'default_category' );
		$term    = $default ? get_term( $default ) : null;

		if ( $term && ! is_wp_error( $term ) ) {
			/* Only when it is the *only* thing there. A post filed under both
			   Uncategorized and something real should still show the real one,
			   and stripping a link out of the middle of a comma-separated list
			   leaves the comma behind. */
			$stripped = trim( wp_strip_all_tags( $content ) );

			/* The count comes off before the comparison. The rail asks the
			   Categories block for post counts, so the same lone term arrives
			   here as "Uncategorized (1)" and matched nothing — which is how a
			   list that should not exist ended up in the sidebar. */
			$stripped = trim( preg_replace( '/\(\s*\d+\s*\)\s*$/', '', $stripped ) );

			if ( $stripped === $term->name || '' === $stripped ) {
				return '';
			}
		}
	}

	return $content;
}
add_filter( 'render_block', 'thallo_blog_hide_default_term', 10, 2 );

/**
 * The order of the archive, as a link rather than as a menu.
 *
 * Two orders exist — newest first, which is what a blog is, and oldest first,
 * which is what somebody reading a series wants. A `<select>` for two options
 * needs JavaScript to do anything and hides the second one until it is opened;
 * a link says what it will do and works with the page turned off.
 *
 * The state lives in the URL, so the order survives a reload, a bookmark and a
 * page of pagination, and the server can answer it without asking the browser
 * anything.
 */
function thallo_blog_sorted_oldest_first() {
	return isset( $_GET['orden'] ) && 'antiguos' === sanitize_key( wp_unslash( $_GET['orden'] ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
}

function thallo_blog_sort_control() {
	$oldest = thallo_blog_sorted_oldest_first();

	$here = home_url( add_query_arg( array() ) );
	$to   = $oldest ? remove_query_arg( 'orden', $here ) : add_query_arg( 'orden', 'antiguos', $here );

	return sprintf(
		'<div class="thallo-sort">%1$s <a href="%2$s" rel="nofollow">%3$s</a></div>',
		esc_html__( 'Sort by:', 'thallo-blog' ),
		esc_url( $to ),
		esc_html( $oldest ? __( 'Oldest', 'thallo-blog' ) : __( 'Newest', 'thallo-blog' ) )
	);
}
add_shortcode( 'thallo_sort', 'thallo_blog_sort_control' );

/**
 * And the order itself.
 *
 * `pre_get_posts` cannot do this: a Query Loop with `inherit: false` builds its
 * own arguments and never touches the main query. This filter is the one hook
 * that reaches them, and it reaches all three loops on the index at once —
 * which is the point. A page cannot be half in one order.
 */
function thallo_blog_sort_query( $query ) {
	if ( thallo_blog_sorted_oldest_first() ) {
		$query['order'] = 'ASC';
	}

	return $query;
}
add_filter( 'query_loop_block_query_vars', 'thallo_blog_sort_query' );

/**
 * The mailing list, on the index only.
 *
 * The script is four lines of work: stop the form navigating away, post the
 * address to the endpoint the contact forms already use, and say what
 * happened. Without it the form still submits — to nowhere useful — so it is
 * enqueued rather than optional, and the endpoint is passed in rather than
 * built from `location`, because the blog has moved paths once already.
 */
function thallo_blog_list_script() {
	if ( ! is_home() && ! is_front_page() ) {
		return;
	}

	wp_enqueue_script(
		'thallo-blog-list',
		get_stylesheet_directory_uri() . '/assets/blog.js',
		array(),
		thallo_blog_asset_version( 'assets/blog.js' ),
		array( 'strategy' => 'defer', 'in_footer' => true )
	);

	wp_localize_script(
		'thallo-blog-list',
		'thalloList',
		array( 'endpoint' => rest_url( 'thallo/v1/enquiry' ) )
	);
}
add_action( 'wp_enqueue_scripts', 'thallo_blog_list_script' );
