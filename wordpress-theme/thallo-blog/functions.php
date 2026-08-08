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
		wp_get_theme()->get( 'Version' )
	);
}
add_action( 'wp_enqueue_scripts', 'thallo_blog_fonts' );

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
