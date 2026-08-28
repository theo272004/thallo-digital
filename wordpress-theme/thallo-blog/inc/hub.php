<?php
/**
 * The editorial hub — everything the blog's front page is made of.
 *
 * ## Why this is PHP and not a block query
 *
 * The rest of this theme builds its lists out of the query block, which is the
 * right tool while every card is the same card. The front page is not that: the
 * featured composition is one large article beside two small ones, the category
 * row carries a count per term, and — the part no block can express — a slot
 * with nothing in it yet has to render as *something* rather than collapse.
 *
 * That last point is the whole design brief. The blog has one published article
 * and a plan for many, and a hub that shows one card is a hub that says the
 * publication was abandoned. So an empty slot renders as a quiet card that says
 * what is coming, and the page fills in on its own as articles arrive: no
 * placeholder survives the post that replaces it.
 *
 * ## What is invented here and what is not
 *
 * Nothing that looks like an article is invented. A placeholder carries a
 * category and the words "Coming soon" — never a headline, never a date, never
 * a link. A reader can tell at a glance which cards are writing that exists and
 * which are writing that is planned, and no click ever lands on a page that is
 * not there.
 *
 * @package Thallo_Blog
 */

defined( 'ABSPATH' ) || exit;

/**
 * The categories this publication is organised around.
 *
 * Named here rather than read from the database because the row has to be able
 * to show a category before anything has been filed under it — which is the
 * state the blog is in today, and the state every new category passes through.
 * A term that exists in WordPress takes over its own tile: the count and the
 * link come from the database, and the name here is only the key that finds it.
 *
 * Editing this list is how the row changes. Adding a category in wp-admin and
 * forgetting to add it here is the one case the row will not show, so the tail
 * of it is "View all", which is the real archive whatever this list says.
 */
function thallo_blog_hub_categories() {
	return array(
		'AI Visibility'    => 'eye',
		'Brand Authority'  => 'shield',
		'Content Strategy' => 'pen',
		'Digital PR'       => 'megaphone',
		'SEO & Search'     => 'search',
	);
}

/**
 * The line drawings on the category tiles.
 *
 * Inline SVG rather than an icon font or a sprite: five icons is not worth a
 * network request, and a font that fails to load leaves five squares where the
 * icons were.
 */
function thallo_blog_hub_icon( $name ) {
	$paths = array(
		'eye'       => '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
		'shield'    => '<path d="M12 3l7 3v6c0 4.5-3 7.7-7 9-4-1.3-7-4.5-7-9V6l7-3Z"/><path d="m9 12 2 2 4-4"/>',
		'pen'       => '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
		'megaphone' => '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M19 6.5a8 8 0 0 1 0 11"/>',
		'search'    => '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
		'grid'      => '<circle cx="6" cy="6" r="1.4"/><circle cx="12" cy="6" r="1.4"/><circle cx="18" cy="6" r="1.4"/><circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/><circle cx="6" cy="18" r="1.4"/><circle cx="12" cy="18" r="1.4"/><circle cx="18" cy="18" r="1.4"/>',
	);

	$path = isset( $paths[ $name ] ) ? $paths[ $name ] : $paths['grid'];

	return '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' . $path . '</svg>';
}

/** The reading time, reused from the estimate the rest of the theme prints. */
function thallo_blog_hub_minutes( $post_id ) {
	$words   = str_word_count( wp_strip_all_tags( (string) get_post_field( 'post_content', $post_id ) ) );
	$minutes = max( 1, (int) round( $words / 200 ) );

	/* translators: %d: minutes. */
	return sprintf( _n( '%d min read', '%d min read', $minutes, 'thallo-blog' ), $minutes );
}

/** The first category that is not WordPress's default, or nothing. */
function thallo_blog_hub_term( $post_id ) {
	$terms = get_the_category( $post_id );

	foreach ( $terms as $term ) {
		if ( 'uncategorized' !== $term->slug ) {
			return $term->name;
		}
	}

	return '';
}

/**
 * A post's picture, or the tint block that stands in for one.
 *
 * An article without a featured image gets a flat olive tint rather than a
 * stock photograph or a grey rectangle: it reads as a deliberate cover on a
 * page of covers, and it is the one option that cannot look like a broken
 * image.
 */
function thallo_blog_hub_media( $post_id, $class ) {
	if ( has_post_thumbnail( $post_id ) ) {
		return sprintf(
			'<div class="%1$s">%2$s</div>',
			esc_attr( $class ),
			get_the_post_thumbnail( $post_id, 'large', array( 'loading' => 'lazy', 'decoding' => 'async' ) )
		);
	}

	return sprintf( '<div class="%1$s %1$s--bare" aria-hidden="true"></div>', esc_attr( $class ) );
}

/** Posts for the hub, newest first, skipping the ones already used above. */
function thallo_blog_hub_posts( $count, $offset = 0 ) {
	return get_posts(
		array(
			'numberposts'      => $count,
			'offset'           => $offset,
			'post_status'      => 'publish',
			'suppress_filters' => false,
		)
	);
}

/* ─────────────────────────────────────────────────────────────────────────
   The category row
   ───────────────────────────────────────────────────────────────────────── */

function thallo_blog_hub_topics() {
	$out = '<div class="thallo-hub__topics">';

	foreach ( thallo_blog_hub_categories() as $name => $icon ) {
		$term  = get_term_by( 'name', $name, 'category' );
		$count = $term ? (int) $term->count : 0;
		$mark  = '<span class="thallo-topic__mark">' . thallo_blog_hub_icon( $icon ) . '</span>';

		$label = $count > 0
			/* translators: %d: number of articles. */
			? sprintf( _n( '%d article', '%d articles', $count, 'thallo-blog' ), $count )
			: __( 'Coming soon', 'thallo-blog' );

		$body = sprintf(
			'%1$s<span class="thallo-topic__say"><span class="thallo-topic__name">%2$s</span><span class="thallo-topic__count">%3$s</span></span>',
			$mark,
			esc_html( $name ),
			esc_html( $label )
		);

		/* A tile only becomes a link once the archive behind it has something
		   in it. A category page with nothing on it is a dead end dressed as a
		   destination. */
		$out .= $count > 0
			? sprintf( '<a class="thallo-topic" href="%1$s">%2$s</a>', esc_url( get_term_link( $term ) ), $body )
			: sprintf( '<span class="thallo-topic thallo-topic--soon">%1$s</span>', $body );
	}

	$out .= sprintf(
		'<a class="thallo-topic thallo-topic--all" href="%1$s"><span class="thallo-topic__mark">%2$s</span><span class="thallo-topic__say"><span class="thallo-topic__name">%3$s</span></span></a>',
		esc_url( home_url( '/' ) ),
		thallo_blog_hub_icon( 'grid' ),
		esc_html__( 'View all', 'thallo-blog' )
	);

	return $out . '</div>';
}
add_shortcode( 'thallo_hub_topics', 'thallo_blog_hub_topics' );

/* ─────────────────────────────────────────────────────────────────────────
   The topic filter
   ───────────────────────────────────────────────────────────────────────── */

/**
 * "All topics", and the categories that have something in them.
 *
 * Not the core categories dropdown, for two reasons a reader would notice: its
 * first option reads "Select Category", and it lists WordPress's own
 * "Uncategorized" — the term nothing was ever deliberately filed under, which
 * the rest of this theme goes to some trouble to hide.
 *
 * A form rather than a bare select, so it works with JavaScript off: choosing a
 * topic and pressing Enter submits it. `assets/blog.js` submits on change for
 * everybody else, which is the same behaviour without the keystroke.
 *
 * Renders nothing at all while the only category is the default one. A filter
 * offering one choice is furniture.
 */
function thallo_blog_hub_filter() {
	$terms = get_categories(
		array(
			'hide_empty' => true,
			'exclude'    => array( (int) get_option( 'default_category' ) ),
		)
	);

	if ( empty( $terms ) ) {
		return '';
	}

	$options = sprintf( '<option value="">%s</option>', esc_html__( 'All topics', 'thallo-blog' ) );
	$current  = (int) get_query_var( 'cat' );

	foreach ( $terms as $term ) {
		$options .= sprintf(
			'<option value="%1$d"%2$s>%3$s (%4$d)</option>',
			(int) $term->term_id,
			selected( $current, (int) $term->term_id, false ),
			esc_html( $term->name ),
			(int) $term->count
		);
	}

	return sprintf(
		'<form class="thallo-filter" method="get" action="%1$s"><label class="thallo-filter__label" for="thallo-filter">%2$s</label><select id="thallo-filter" name="cat">%3$s</select><button class="thallo-filter__go" type="submit">%4$s</button></form>',
		esc_url( home_url( '/' ) ),
		esc_html__( 'Filter by topic', 'thallo-blog' ),
		$options,
		esc_html__( 'Go', 'thallo-blog' )
	);
}
add_shortcode( 'thallo_hub_filter', 'thallo_blog_hub_filter' );

/* ─────────────────────────────────────────────────────────────────────────
   Featured — one large, two stacked
   ───────────────────────────────────────────────────────────────────────── */

/** The quiet card that stands where an article will be. */
function thallo_blog_hub_soon( $class, $topic = '' ) {
	return sprintf(
		'<div class="%1$s %1$s--soon"><div class="thallo-soon__media" aria-hidden="true"></div><div class="thallo-soon__body">%2$s<p class="thallo-soon__label">%3$s</p></div></div>',
		esc_attr( $class ),
		'' !== $topic ? '<span class="thallo-kind">' . esc_html( $topic ) . '</span>' : '',
		esc_html__( 'Coming soon', 'thallo-blog' )
	);
}

function thallo_blog_hub_featured() {
	$posts = thallo_blog_hub_posts( 3 );
	$lead  = isset( $posts[0] ) ? $posts[0] : null;
	$topics = array_keys( thallo_blog_hub_categories() );

	$out = '<div class="thallo-hub__feature">';

	// ── The lead ──────────────────────────────────────────────────────────
	if ( $lead ) {
		$term = thallo_blog_hub_term( $lead->ID );

		$out .= sprintf(
			'<article class="thallo-lead">%1$s<div class="thallo-lead__body">%2$s<h3 class="thallo-lead__title"><a href="%3$s">%4$s</a></h3><p class="thallo-lead__sum">%5$s</p><p class="thallo-lead__go"><span>%6$s</span><span class="thallo-lead__time">%7$s</span></p></div></article>',
			thallo_blog_hub_media( $lead->ID, 'thallo-lead__media' ),
			'' !== $term ? '<span class="thallo-kind">' . esc_html( $term ) . '</span>' : '',
			esc_url( get_permalink( $lead->ID ) ),
			esc_html( get_the_title( $lead->ID ) ),
			esc_html( wp_trim_words( get_the_excerpt( $lead->ID ), 28 ) ),
			esc_html__( 'Read article →', 'thallo-blog' ),
			esc_html( thallo_blog_hub_minutes( $lead->ID ) )
		);
	} else {
		$out .= thallo_blog_hub_soon( 'thallo-lead', $topics[0] );
	}

	// ── The two beside it ─────────────────────────────────────────────────
	$out .= '<div class="thallo-hub__pair">';

	for ( $i = 1; $i <= 2; $i++ ) {
		if ( isset( $posts[ $i ] ) ) {
			$post = $posts[ $i ];
			$term = thallo_blog_hub_term( $post->ID );

			$out .= sprintf(
				'<article class="thallo-side">%1$s<div class="thallo-side__body">%2$s<h3 class="thallo-side__title"><a href="%3$s">%4$s</a></h3><p class="thallo-side__time">%5$s</p></div></article>',
				thallo_blog_hub_media( $post->ID, 'thallo-side__media' ),
				'' !== $term ? '<span class="thallo-kind">' . esc_html( $term ) . '</span>' : '',
				esc_url( get_permalink( $post->ID ) ),
				esc_html( get_the_title( $post->ID ) ),
				esc_html( thallo_blog_hub_minutes( $post->ID ) )
			);
		} else {
			$out .= thallo_blog_hub_soon( 'thallo-side', $topics[ $i ] );
		}
	}

	return $out . '</div></div>';
}
add_shortcode( 'thallo_hub_featured', 'thallo_blog_hub_featured' );

/* ─────────────────────────────────────────────────────────────────────────
   Latest — the grid under the fold
   ───────────────────────────────────────────────────────────────────────── */

function thallo_blog_hub_latest() {
	$posts = thallo_blog_hub_posts( 4, 3 );
	$topics = array_keys( thallo_blog_hub_categories() );

	$out = '<div class="thallo-hub__grid">';

	for ( $i = 0; $i < 4; $i++ ) {
		if ( isset( $posts[ $i ] ) ) {
			$post = $posts[ $i ];
			$term = thallo_blog_hub_term( $post->ID );

			$out .= sprintf(
				'<article class="thallo-tile">%1$s<div class="thallo-tile__body">%2$s<h3 class="thallo-tile__title"><a href="%3$s">%4$s</a></h3><p class="thallo-tile__sum">%5$s</p><p class="thallo-tile__meta"><span>%6$s</span><span>%7$s</span></p></div></article>',
				thallo_blog_hub_media( $post->ID, 'thallo-tile__media' ),
				'' !== $term ? '<span class="thallo-kind">' . esc_html( $term ) . '</span>' : '',
				esc_url( get_permalink( $post->ID ) ),
				esc_html( get_the_title( $post->ID ) ),
				esc_html( wp_trim_words( get_the_excerpt( $post->ID ), 18 ) ),
				esc_html( thallo_blog_hub_minutes( $post->ID ) ),
				esc_html( get_the_date( 'M j, Y', $post->ID ) )
			);
		} else {
			$out .= thallo_blog_hub_soon( 'thallo-tile', $topics[ ( $i + 3 ) % count( $topics ) ] );
		}
	}

	$out .= '</div>';

	/* The pager appears only once there is a second page of articles to reach.
	   "Load more" over four cards and nothing behind them is a button that
	   argues with the page it is on. */
	$total = (int) wp_count_posts()->publish;

	if ( $total > 7 ) {
		$out .= sprintf(
			'<div class="thallo-hub__more"><a class="thallo-btn thallo-btn--ghost" href="%1$s">%2$s</a></div>',
			esc_url( home_url( '/' ) ),
			esc_html__( 'View all articles', 'thallo-blog' )
		);
	}

	return $out;
}
add_shortcode( 'thallo_hub_latest', 'thallo_blog_hub_latest' );
