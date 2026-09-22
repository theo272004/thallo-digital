<?php
/**
 * The AI Shortlist — a research series, published as pages.
 *
 * ## Why pages and not posts
 *
 * A volume of the series is not a blog post. It does not belong in the blog's
 * archive, its feed, its "latest" grid or its category row; it has no reading
 * time and no author line; it is numbered, it is scheduled in advance, and the
 * unpublished ones are part of the page. WordPress's model for a thing with a
 * fixed address, a parent and no place in the chronology is a page, so the
 * whole series is pages:
 *
 *   /ai-shortlist/                        the hub — one page, slug `ai-shortlist`
 *   /ai-shortlist/executive-search-firms/ a volume — a child page of the hub
 *
 * Nothing here is configured. The hub is whichever page carries the slug
 * `ai-shortlist`; a volume is whichever page is filed under it. Make a child
 * page, give it a date, and it is in the series. Schedule it for a future date
 * and it appears on the hub as upcoming — greyed, dated, unlinked — until the
 * date arrives and WordPress publishes it.
 *
 * ## What is computed and what is written
 *
 * The number of a volume is its position among its siblings, so nobody types
 * "Volume 03" and then reorders the calendar. The industry is a term on the
 * page (the Industry box in the editor). The teaser on the hub is the page's
 * excerpt, which is also the italic question under the title of the volume
 * itself. Everything below the title — the finding, the table, the sources,
 * the questions — is the page's content, written into the pattern this theme
 * ships for it.
 *
 * ## The address
 *
 * WordPress lives at /blog/ on the production host, which would put the hub
 * at /blog/ai-shortlist/. The series is meant to sit at the root, beside
 * /services/ and /results/, and that takes one rewrite rule in the ROOT
 * .htaccess — a file the deploy is not allowed to touch. So the theme looks
 * for that rule: while it is absent the links stay under /blog/ and nothing
 * is broken; once it is there the links move to the root on their own. See
 * thallo_shortlist_at_root().
 *
 * @package Thallo_Blog
 */

defined( 'ABSPATH' ) || exit;

/** The slug of the hub page. The one string this file is organised around. */
const THALLO_SHORTLIST_SLUG = 'ai-shortlist';

/**
 * The hub's own <title>, description and Open Graph card, as the brief wrote
 * them. Fixed here rather than read from the page, because they were specified
 * to the word — and because the hub page's excerpt is already doing another
 * job (it is the italic question under the masthead).
 *
 * A volume derives all four from its own title and excerpt; see
 * thallo_shortlist_seo().
 */
function thallo_shortlist_hub_seo() {
	return array(
		'title'          => 'The AI Shortlist — Which Firms AI Names | Thallo Digital',
		'description'    => 'We run the questions buyers ask AI and publish which firms get named, one category at a time. A research series from Thallo Digital.',
		'og_title'       => 'The AI Shortlist',
		'og_description' => 'Buyers build their shortlist before they talk to anyone, and they build it by asking a model. We measure who makes the list.',
	);
}

/* ─────────────────────────────────────────────────────────────────────────
   What a volume is
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Pages get an excerpt box.
 *
 * WordPress gives it to posts and not to pages, and the series needs it twice:
 * it is the teaser on the hub and the question under the title of a volume.
 * One field, written once, read in both places.
 */
function thallo_shortlist_page_excerpts() {
	add_post_type_support( 'page', 'excerpt' );
}
add_action( 'init', 'thallo_shortlist_page_excerpts' );

/**
 * The industry a category belongs to — "Professional Services", "Finance".
 *
 * A taxonomy rather than a custom field or a line in the title, because a
 * taxonomy gets a box in the editor's sidebar with autocomplete against the
 * terms that already exist, and that is what keeps "Professional Services"
 * from being typed three different ways across six volumes. Registered for
 * pages only; the blog's posts keep their categories.
 */
function thallo_shortlist_taxonomy() {
	register_taxonomy(
		'thallo_industry',
		'page',
		array(
			'labels'            => array(
				'name'          => __( 'Industries', 'thallo-blog' ),
				'singular_name' => __( 'Industry', 'thallo-blog' ),
				'add_new_item'  => __( 'Add industry', 'thallo-blog' ),
				'search_items'  => __( 'Search industries', 'thallo-blog' ),
			),
			'public'            => false,
			'show_ui'           => true,
			'show_in_rest'      => true,
			'show_admin_column' => true,
			'hierarchical'      => false,
			'rewrite'           => false,
		)
	);
}
add_action( 'init', 'thallo_shortlist_taxonomy' );

/** The hub page, or null while nobody has made one. */
function thallo_shortlist_hub() {
	static $hub = false;

	if ( false === $hub ) {
		$hub = get_page_by_path( THALLO_SHORTLIST_SLUG, OBJECT, 'page' );
	}

	return $hub instanceof WP_Post ? $hub : null;
}

/** True when the page is the hub itself. */
function thallo_shortlist_is_hub( $post = null ) {
	$post = get_post( $post );
	$hub  = thallo_shortlist_hub();

	return $post && $hub && (int) $post->ID === (int) $hub->ID;
}

/** True when the page is a volume — any page filed under the hub. */
function thallo_shortlist_is_volume( $post = null ) {
	$post = get_post( $post );
	$hub  = thallo_shortlist_hub();

	if ( ! $post || ! $hub || 'page' !== $post->post_type || ! $post->post_parent ) {
		return false;
	}

	return in_array( (int) $hub->ID, array_map( 'intval', get_post_ancestors( $post ) ), true );
}

/**
 * Every volume, in series order.
 *
 * Published and scheduled together, because the calendar is part of the page:
 * a hub that lists only what exists says the series might stop; one that lists
 * the next five dates says it will not. Drafts are left out — a draft is
 * writing that is not ready to be promised.
 *
 * The order is the date, and a volume's number is its place in this list. Set
 * Page Attributes → Order to force a different sequence; menu_order wins over
 * the date when it is set.
 *
 * @return WP_Post[]
 */
function thallo_shortlist_volumes() {
	static $volumes = null;

	if ( null !== $volumes ) {
		return $volumes;
	}

	$hub = thallo_shortlist_hub();
	if ( ! $hub ) {
		$volumes = array();
		return $volumes;
	}

	$volumes = get_posts(
		array(
			'post_type'        => 'page',
			'post_parent'      => $hub->ID,
			'post_status'      => array( 'publish', 'future' ),
			'numberposts'      => -1,
			'orderby'          => array(
				'menu_order' => 'ASC',
				'date'       => 'ASC',
			),
			'suppress_filters' => false,
		)
	);

	return $volumes;
}

/** The 1-based number of a volume, or 0 for a page that is not one. */
function thallo_shortlist_number( $post = null ) {
	$post = get_post( $post );
	if ( ! $post ) {
		return 0;
	}

	foreach ( thallo_shortlist_volumes() as $i => $volume ) {
		if ( (int) $volume->ID === (int) $post->ID ) {
			return $i + 1;
		}
	}

	return 0;
}

/** "01", "02" — two digits, as the series numbers itself. */
function thallo_shortlist_pad( $n ) {
	return str_pad( (string) (int) $n, 2, '0', STR_PAD_LEFT );
}

/** The first industry term on a page, or ''. */
function thallo_shortlist_industry( $post = null ) {
	$terms = get_the_terms( get_post( $post ), 'thallo_industry' );

	if ( ! $terms || is_wp_error( $terms ) ) {
		return '';
	}

	return $terms[0]->name;
}

/** "6 October 2026", in the site's timezone. */
function thallo_shortlist_date( $post ) {
	return get_the_date( 'j F Y', $post );
}

/** "6 October" — for a line in prose, where the year is understood. */
function thallo_shortlist_day( $post ) {
	return get_the_date( 'j F', $post );
}

/* ─────────────────────────────────────────────────────────────────────────
   The address
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Whether the series answers at the root of the domain.
 *
 * Three cases. WordPress installed at the root (the local copy): the pages
 * already are at the root, nothing to do. WordPress in a folder and no rule in
 * the parent .htaccess: the pages are under /blog/, and the links say so.
 * WordPress in a folder AND the parent .htaccess mentions the series: the rule
 * is in, and the links move to the root.
 *
 * Reading the file is how the theme learns the rule exists without an option
 * to set, a constant to define, or a second upload to forget. It is one small
 * file, read once per request.
 */
function thallo_shortlist_at_root() {
	static $at_root = null;

	if ( null !== $at_root ) {
		return $at_root;
	}

	$home_path = trim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
	if ( '' === $home_path ) {
		$at_root = true;
		return $at_root;
	}

	$at_root  = false;
	$htaccess = dirname( untrailingslashit( ABSPATH ) ) . '/.htaccess';

	if ( is_readable( $htaccess ) ) {
		$rules   = (string) file_get_contents( $htaccess ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$at_root = false !== strpos( $rules, THALLO_SHORTLIST_SLUG );
	}

	return $at_root;
}

/**
 * The permalink of the hub and its volumes, lifted out of /blog/.
 *
 * `page_link` runs on every page link WordPress prints — the breadcrumb, the
 * hub list, the canonical tag, the sitemap — so one filter moves all of them
 * together. Only the series moves; the blog's own pages stay where they are.
 */
function thallo_shortlist_page_link( $link, $post_id ) {
	if ( ! thallo_shortlist_at_root() ) {
		return $link;
	}

	$home_path = trim( (string) wp_parse_url( home_url( '/' ), PHP_URL_PATH ), '/' );
	if ( '' === $home_path ) {
		return $link;
	}

	if ( ! thallo_shortlist_is_hub( $post_id ) && ! thallo_shortlist_is_volume( $post_id ) ) {
		return $link;
	}

	return str_replace( '/' . $home_path . '/', '/', $link );
}
add_filter( 'page_link', 'thallo_shortlist_page_link', 10, 2 );

/**
 * No canonical redirect on the series.
 *
 * With the links at the root, WordPress would send /blog/ai-shortlist/ to
 * /ai-shortlist/ — which is right once the rewrite rule is in and a loop of
 * 404s if it is ever taken out. Both addresses simply render; the canonical
 * tag in <head> says which one counts.
 */
function thallo_shortlist_no_canonical( $redirect ) {
	if ( is_page() && ( thallo_shortlist_is_hub() || thallo_shortlist_is_volume() ) ) {
		return false;
	}

	return $redirect;
}
add_filter( 'redirect_canonical', 'thallo_shortlist_no_canonical' );

/* ─────────────────────────────────────────────────────────────────────────
   Which template
   ───────────────────────────────────────────────────────────────────────── */

/**
 * A volume renders with templates/shortlist-volume.html without anyone choosing
 * it. The hub gets templates/page-ai-shortlist.html by WordPress's own rule —
 * a template named after a page's slug applies to that page — so only the
 * children need help: they are matched by parentage, which no file name can
 * express.
 *
 * Prepended, not replaced: a volume given a different template by hand in the
 * editor keeps it, because a template chosen on the page comes before the
 * hierarchy this filter edits.
 */
function thallo_shortlist_template( $templates ) {
	if ( thallo_shortlist_is_volume() ) {
		array_unshift( $templates, 'shortlist-volume.php' );
	}

	return $templates;
}
add_filter( 'page_template_hierarchy', 'thallo_shortlist_template' );

/** Body classes, so the stylesheet can tell a series page from the blog. */
function thallo_shortlist_body_class( $classes ) {
	if ( thallo_shortlist_is_hub() ) {
		$classes[] = 'thallo-shortlist-hub';
	} elseif ( thallo_shortlist_is_volume() ) {
		$classes[] = 'thallo-shortlist-volume';
	}

	return $classes;
}
add_filter( 'body_class', 'thallo_shortlist_body_class' );

/* ─────────────────────────────────────────────────────────────────────────
   The scripts
   ───────────────────────────────────────────────────────────────────────── */

/**
 * On the series only: the entrance — sections rising in, table rows arriving
 * one after another, bars growing to their figure, the big number counting up
 * — and the mailing list, which is the blog's script pointed at the same
 * endpoint with a different note on the row it writes.
 */
function thallo_shortlist_scripts() {
	/* The blog's front page speaks the series' language now — the same cards,
	   filter, pager and mark — so it takes the same script. */
	$blog_home = is_home() || is_front_page();
	if ( ! $blog_home && ( ! is_page() || ( ! thallo_shortlist_is_hub() && ! thallo_shortlist_is_volume() ) ) ) {
		return;
	}

	wp_enqueue_script(
		'thallo-shortlist',
		get_stylesheet_directory_uri() . '/assets/shortlist.js',
		array(),
		thallo_blog_asset_version( 'assets/shortlist.js' ),
		array( 'strategy' => 'defer', 'in_footer' => true )
	);

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
		array(
			'endpoint' => rest_url( 'thallo/v1/enquiry' ),
			'message'  => 'Subscribed from The AI Shortlist.',
			'plans'    => array( 'AI Shortlist' ),
		)
	);
}
add_action( 'wp_enqueue_scripts', 'thallo_shortlist_scripts' );

/* ─────────────────────────────────────────────────────────────────────────
   <head>
   ───────────────────────────────────────────────────────────────────────── */

/**
 * The title tag, the description and the Open Graph card for the series.
 *
 * WordPress writes "Page title – Site name" and nothing else; the site's own
 * pages carry all four of these, and a page meant to be cited by the models
 * the series measures had better say what it is in the place they read it.
 *
 * @return array{title:string,description:string,og_title:string,og_description:string}|null
 */
function thallo_shortlist_seo() {
	if ( ! is_page() ) {
		return null;
	}

	if ( thallo_shortlist_is_hub() ) {
		return thallo_shortlist_hub_seo();
	}

	if ( ! thallo_shortlist_is_volume() ) {
		return null;
	}

	$post     = get_post();
	$title    = wp_strip_all_tags( get_the_title( $post ) );
	$number   = thallo_shortlist_number( $post );
	$vol      = $number ? sprintf( 'Vol. %s', thallo_shortlist_pad( $number ) ) : '';
	$question = trim( wp_strip_all_tags( get_the_excerpt( $post ) ) );

	$og_title = $vol
		? sprintf( 'The AI Shortlist, %1$s — %2$s', $vol, $title )
		: sprintf( 'The AI Shortlist — %s', $title );

	return array(
		'title'          => $og_title . ' | Thallo Digital',
		'description'    => sprintf(
			'We asked ChatGPT, Claude and Gemini the 12 questions buyers ask when choosing between %s. Here is which firms got named, and where the answers came from.',
			strtolower( $title )
		),
		'og_title'       => $og_title,
		'og_description' => '' !== $question ? $question : sprintf( 'Which %s AI names, and where the answer comes from.', strtolower( $title ) ),
	);
}

function thallo_shortlist_document_title( $title ) {
	$seo = thallo_shortlist_seo();

	return $seo ? $seo['title'] : $title;
}
add_filter( 'pre_get_document_title', 'thallo_shortlist_document_title', 20 );

function thallo_shortlist_head() {
	$seo = thallo_shortlist_seo();
	if ( ! $seo ) {
		return;
	}

	$url = get_permalink();

	echo "\n";
	printf( '<meta name="description" content="%s">' . "\n", esc_attr( $seo['description'] ) );
	printf( '<meta property="og:type" content="%s">' . "\n", thallo_shortlist_is_hub() ? 'website' : 'article' );
	printf( '<meta property="og:site_name" content="%s">' . "\n", esc_attr( 'Thallo Digital' ) );
	printf( '<meta property="og:title" content="%s">' . "\n", esc_attr( $seo['og_title'] ) );
	printf( '<meta property="og:description" content="%s">' . "\n", esc_attr( $seo['og_description'] ) );
	printf( '<meta property="og:url" content="%s">' . "\n", esc_url( $url ) );

	/* The site's card, unless the volume was given a picture of its own. */
	$image = is_singular() && has_post_thumbnail() ? get_the_post_thumbnail_url( null, 'full' ) : 'https://thallodigital.com/og.png';
	printf( '<meta property="og:image" content="%s">' . "\n", esc_url( $image ) );
	printf( '<meta name="twitter:card" content="%s">' . "\n", 'summary_large_image' );
	printf( '<meta name="twitter:title" content="%s">' . "\n", esc_attr( $seo['og_title'] ) );
	printf( '<meta name="twitter:description" content="%s">' . "\n", esc_attr( $seo['og_description'] ) );
}
add_action( 'wp_head', 'thallo_shortlist_head', 5 );

/**
 * Structured data: the series as a CollectionPage, a volume as a Dataset
 * inside an Article — which is what it is: a table of measurements with the
 * method printed under it.
 */
function thallo_shortlist_schema() {
	$seo = thallo_shortlist_seo();
	if ( ! $seo ) {
		return;
	}

	$publisher = array(
		'@type' => 'Organization',
		'name'  => 'Thallo Digital',
		'url'   => 'https://thallodigital.com/',
	);

	if ( thallo_shortlist_is_hub() ) {
		$parts = array();
		foreach ( thallo_shortlist_volumes() as $volume ) {
			if ( 'publish' !== $volume->post_status ) {
				continue;
			}
			$parts[] = array(
				'@type'         => 'Article',
				'name'          => wp_strip_all_tags( get_the_title( $volume ) ),
				'url'           => get_permalink( $volume ),
				'datePublished' => get_the_date( 'c', $volume ),
			);
		}

		$graph = array(
			'@context'    => 'https://schema.org',
			'@type'       => 'CollectionPage',
			'name'        => $seo['og_title'],
			'description' => $seo['description'],
			'url'         => get_permalink(),
			'publisher'   => $publisher,
		);
		if ( $parts ) {
			$graph['hasPart'] = $parts;
		}
	} else {
		$post  = get_post();
		$graph = array(
			'@context'         => 'https://schema.org',
			'@type'            => 'Article',
			'headline'         => $seo['og_title'],
			'description'      => $seo['description'],
			'datePublished'    => get_the_date( 'c', $post ),
			'dateModified'     => get_the_modified_date( 'c', $post ),
			'mainEntityOfPage' => get_permalink( $post ),
			'isPartOf'         => array(
				'@type' => 'CreativeWorkSeries',
				'name'  => 'The AI Shortlist',
				'url'   => thallo_shortlist_hub() ? get_permalink( thallo_shortlist_hub() ) : home_url( '/' . THALLO_SHORTLIST_SLUG . '/' ),
			),
			'author'           => $publisher,
			'publisher'        => $publisher,
		);
	}

	echo "\n" . '<script type="application/ld+json">' . wp_json_encode( $graph, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
}
add_action( 'wp_head', 'thallo_shortlist_schema' );

/* ─────────────────────────────────────────────────────────────────────────
   Pieces the templates print
   ───────────────────────────────────────────────────────────────────────── */

/**
 * The title with its last word in the serif italic — the way every masthead
 * on the site says its name. "The AI Shortlist" becomes "The AI *Shortlist*".
 * The italic is a tag around the last word of whatever the title is, so a
 * retitled hub keeps the treatment without anyone touching the template.
 */
function thallo_shortlist_title() {
	$title = trim( wp_strip_all_tags( get_the_title() ) );
	$words = preg_split( '/\s+/', $title );
	$last  = array_pop( $words );

	$out = $words ? esc_html( implode( ' ', $words ) ) . ' ' : '';

	/* Emphasis by colour, as everywhere on the site — /results/ opens with
	   "Companies that became <the answer.>" in olive. It was the serif italic;
	   Cami's rule (2026-09-21) is that the title is not the place for it: the
	   italic is the question underneath, and only there. */
	return $out . '<span class="thallo-mast__accent">' . esc_html( $last ) . '</span>';
}
add_shortcode( 'thallo_shortlist_title', 'thallo_shortlist_title' );

/** The hub's address, for the way back at the top of a volume. */
function thallo_shortlist_hub_url() {
	$hub = thallo_shortlist_hub();

	return esc_url( $hub ? get_permalink( $hub ) : home_url( '/' . THALLO_SHORTLIST_SLUG . '/' ) );
}
add_shortcode( 'thallo_shortlist_hub_url', 'thallo_shortlist_hub_url' );

/**
 * "Volume 01 · Professional Services", over the title of a volume.
 * The number is computed; the industry is the term on the page. Either half
 * can be missing and the line still reads.
 */
function thallo_shortlist_label() {
	if ( ! thallo_shortlist_is_volume() ) {
		return '';
	}

	$parts  = array();
	$number = thallo_shortlist_number();
	if ( $number ) {
		/* translators: %s: two-digit volume number. */
		$parts[] = sprintf( __( 'Volume %s', 'thallo-blog' ), thallo_shortlist_pad( $number ) );
	}

	$industry = thallo_shortlist_industry();
	if ( '' !== $industry ) {
		$parts[] = $industry;
	}

	return esc_html( implode( ' · ', $parts ) );
}
add_shortcode( 'thallo_shortlist_label', 'thallo_shortlist_label' );

/**
 * The photograph beside a volume's title, with the method on a chip.
 *
 * Chosen by the volume's industry, from the pictures the site already keeps
 * for its industry pages — the boardroom for Professional Services, the
 * tower for Finance, the corridor for Health — so a volume opens on the
 * same picture as the page that sells work in its category. Anything else
 * gets the desk with the notebook. Matching is by word, not by slug, so
 * "Finance", "Fintech" and "Financial services" all land on the same one.
 *
 * The chip states the method — three models, 108 responses — because that
 * is what Cami's reference carries in the corner of its opening picture:
 * the scope of the study, said once, where the eye lands first.
 */
function thallo_shortlist_art() {
	if ( ! thallo_shortlist_is_volume() ) {
		return '';
	}

	/* A picture that ships with the theme (assets/img/) is named by its file;
	   one of the site's is a URL. Professional Services has its own — the
	   desk under the window Cami chose for Volume 01 (2026-09-21) — and it
	   travels in the theme zip, so nothing has to be deployed for it. */
	$industry = strtolower( thallo_shortlist_industry() );
	$src      = 'https://thallodigital.com/notebook-desk.webp';
	$map      = array(
		'professional' => get_theme_file_uri( 'assets/img/volume-professional-services.jpg' ),
		'finan'        => 'https://thallodigital.com/industry-fintech-bg.webp',
		'fintech'      => 'https://thallodigital.com/industry-fintech-bg.webp',
		'health'       => 'https://thallodigital.com/industry-health-tech-bg.webp',
	);
	foreach ( $map as $word => $candidate ) {
		if ( false !== strpos( $industry, $word ) ) {
			$src = $candidate;
			break;
		}
	}

	/* The editor's own choice wins over the industry's: a Featured image
	   set on the page (the box in the editor's sidebar) is the picture, so
	   a volume can open on any photograph without touching the theme (Cami,
	   2026-09-21: "¿cómo la cambio desde WordPress?"). */
	if ( has_post_thumbnail() ) {
		$chosen = get_the_post_thumbnail_url( null, 'large' );
		if ( $chosen ) {
			$src = $chosen;
		}
	}

	/* The note beside the picture is the reference's handwritten "key players
	   + trends", in our serif italic; the card at its foot is its "Global
	   analysis 2024 →", carrying the scope of the study. */
	return sprintf(
		'<figure class="thallo-volume__art"><img src="%1$s" alt="" decoding="async" />'
		. '<span class="thallo-volume__note" aria-hidden="true">%2$s</span>'
		. '<a class="thallo-volume__chip" href="#findings"><span class="thallo-volume__chip-i" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg></span>'
		. '<span class="thallo-volume__chip-t"><span class="thallo-volume__chip-l">%3$s</span>%4$s</span>'
		. '<span class="thallo-volume__chip-a" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></span></a>'
		. '</figure>',
		esc_url( $src ),
		esc_html__( 'which firms, and why', 'thallo-blog' ),
		esc_html__( 'The study', 'thallo-blog' ),
		esc_html__( '12 questions · 3 models · 108 responses', 'thallo-blog' )
	);
}
add_shortcode( 'thallo_shortlist_art', 'thallo_shortlist_art' );

/**
 * The volume's opening paragraphs, for the head.
 *
 * Cami's reference opens with the introduction beside the photograph, under
 * the title — not under the whole head. The paragraphs live in the content,
 * where the writer put them (`thallo-lede`), and the template cannot reach
 * into the content; so this lifts them out for the head, and the stylesheet
 * hides them where they sit in the body. One source, shown once.
 */
function thallo_shortlist_lede() {
	if ( ! thallo_shortlist_is_volume() ) {
		return '';
	}

	$content = (string) get_post()->post_content;
	if ( ! preg_match_all( '#<p class="thallo-lede[^"]*"[^>]*>.*?</p>#s', $content, $m ) ) {
		return '';
	}

	return '<div class="thallo-volume__lede">' . implode( '', $m[0] ) . '</div>';
}
add_shortcode( 'thallo_shortlist_lede', 'thallo_shortlist_lede' );

/**
 * The colophon — "How this volume was run" — for the foot of the page.
 *
 * Cami wants it under the closing panel (2026-09-22), and the panel is the
 * template's, after the content. So, as with the lede, the block is lifted
 * out of the content and rendered where the template says; the stylesheet
 * hides it where it sits in the body. The writer keeps editing it in the
 * volume, where the dates and the models are.
 */
function thallo_shortlist_colophon() {
	if ( ! thallo_shortlist_is_volume() ) {
		return '';
	}

	$content = (string) get_post()->post_content;
	$start   = strpos( $content, '<!-- wp:group {"className":"thallo-colophon"' );
	if ( false === $start ) {
		return '';
	}

	$block = substr( $content, $start );
	$blocks = parse_blocks( $block );
	if ( empty( $blocks[0] ) ) {
		return '';
	}

	return '<div class="thallo-volume__colophon">' . render_block( $blocks[0] ) . '</div>';
}
add_shortcode( 'thallo_shortlist_colophon', 'thallo_shortlist_colophon' );

/**
 * The twelve questions, for the foot of the page.
 *
 * Cami moved them under the invitation (2026-09-22): the study ends on its
 * argument, the reader is asked, and the questions are the appendix that
 * lets them check the work. Lifted from the content the same way the
 * colophon is, so the writer keeps every part of a volume in one file.
 */
function thallo_shortlist_questions() {
	if ( ! thallo_shortlist_is_volume() ) {
		return '';
	}

	$content = (string) get_post()->post_content;
	$start   = strpos( $content, '<!-- wp:paragraph {"className":"thallo-kicker"} -->' . "
" . '<p class="thallo-kicker">The questions</p>' );
	if ( false === $start ) {
		return '';
	}

	/* Back up to the section that holds it. */
	$open = strrpos( substr( $content, 0, $start ), '<!-- wp:group {"className":"thallo-sec"' );
	if ( false === $open ) {
		return '';
	}

	$blocks = parse_blocks( substr( $content, $open ) );
	if ( empty( $blocks[0][ 'innerBlocks' ] ) ) {
		return '';
	}

	/*
	 * The twelve are the appendix: worth having, in the way while you read
	 * (Cami, 2026-09-22). So the section keeps its label, its title and the
	 * line under it, and the grid itself goes behind a disclosure.
	 *
	 * A <details> rather than a button and a script: it opens without
	 * JavaScript, it is a disclosure to a screen reader without being told
	 * to be one, and the browser finds the text inside it when a reader
	 * searches the page.
	 */
	$head = '';
	$body = '';

	foreach ( $blocks[0][ 'innerBlocks' ] as $block ) {
		$class = isset( $block[ 'attrs' ][ 'className' ] ) ? (string) $block[ 'attrs' ][ 'className' ] : '';

		if ( false !== strpos( $class, 'thallo-qgrid' ) ) {
			$body .= render_block( $block );
		} else {
			$head .= render_block( $block );
		}
	}

	/* No grid found — print what there is rather than an empty fold. */
	if ( '' === $body ) {
		return '<div class="thallo-volume__questions"><div class="thallo-sec">' . $head . '</div></div>';
	}

	$chevron = '<svg class="thallo-qdrop__chev" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>';

	return '<div class="thallo-volume__questions"><div class="thallo-sec">'
		. $head
		. '<details class="thallo-qdrop">'
		. '<summary class="thallo-qdrop__s">'
		. '<span class="thallo-qdrop__t thallo-qdrop__t--shut">' . esc_html__( 'Show the twelve questions', 'thallo-blog' ) . '</span>'
		. '<span class="thallo-qdrop__t thallo-qdrop__t--open">' . esc_html__( 'Hide the questions', 'thallo-blog' ) . '</span>'
		. $chevron
		. '</summary>'
		. '<div class="thallo-qdrop__body">' . $body . '</div>'
		. '</details>'
		. '</div></div>';
}
add_shortcode( 'thallo_shortlist_questions', 'thallo_shortlist_questions' );

/**
 * The line at the foot of a volume that says what comes next.
 *
 * Read from the calendar rather than typed, so it is never a promise about a
 * date that has already moved. Three states: the next volume is scheduled
 * (name it and its date), it is already out (name it and link it), or there
 * is nothing after this one yet (send the reader to the series).
 */
function thallo_shortlist_next() {
	if ( ! thallo_shortlist_is_volume() ) {
		return '';
	}

	$hub_url = thallo_shortlist_hub() ? get_permalink( thallo_shortlist_hub() ) : home_url( '/' . THALLO_SHORTLIST_SLUG . '/' );
	$series  = sprintf( '<a href="%1$s">%2$s</a>', esc_url( $hub_url ), esc_html__( 'See the full series', 'thallo-blog' ) );

	$volumes = thallo_shortlist_volumes();
	$here    = thallo_shortlist_number();
	$next    = ( $here && isset( $volumes[ $here ] ) ) ? $volumes[ $here ] : null;

	if ( ! $next ) {
		/* translators: %s: link to the series. */
		return '<p>' . sprintf( esc_html__( 'The next volume is in the works. %s.', 'thallo-blog' ), $series ) . '</p>';
	}

	$label = sprintf(
		/* translators: 1: two-digit number, 2: category name. */
		esc_html__( 'Volume %1$s, %2$s,', 'thallo-blog' ),
		thallo_shortlist_pad( $here + 1 ),
		esc_html( lcfirst( wp_strip_all_tags( get_the_title( $next ) ) ) )
	);

	if ( 'future' === $next->post_status ) {
		/* translators: 1: "Volume 02, staffing agencies,", 2: "27 October", 3: link. */
		return '<p>' . sprintf( esc_html__( '%1$s publishes %2$s. %3$s.', 'thallo-blog' ), $label, esc_html( thallo_shortlist_day( $next ) ), $series ) . '</p>';
	}

	return '<p>' . sprintf(
		/* translators: 1: "Volume 02, staffing agencies,", 2: link to it, 3: link to the series. */
		esc_html__( '%1$s is out. %2$s, or %3$s.', 'thallo-blog' ),
		$label,
		sprintf( '<a href="%1$s">%2$s</a>', esc_url( get_permalink( $next ) ), esc_html__( 'Read it', 'thallo-blog' ) ),
		lcfirst( $series )
	) . '</p>';
}
add_shortcode( 'thallo_shortlist_next', 'thallo_shortlist_next' );

/**
 * The headline finding of a volume — the figure and the sentence over it.
 *
 * Read from the study itself: the first `.thallo-finding__stat` in the content
 * ("2 of 12") and the h2 that stands over it ("The firms AI trusts most are
 * nearly invisible on Google"). Nothing has to be typed twice: the card on the
 * hub shows the figure the volume opens with, and if the volume is edited the
 * card follows. A volume with no finding block yet gets an empty pair and the
 * card leaves the line out.
 *
 * @return array{stat:string,label:string}
 */
function thallo_shortlist_finding( $post ) {
	$post    = get_post( $post );
	$content = $post ? (string) $post->post_content : '';
	$finding = array( 'stat' => '', 'label' => '' );

	if ( ! preg_match( '/<p class="thallo-finding__stat[^"]*"[^>]*>(.*?)<\/p>/s', $content, $m, PREG_OFFSET_CAPTURE ) ) {
		return $finding;
	}

	$finding['stat'] = trim( wp_strip_all_tags( $m[1][0] ) );

	/* The last h2 before the figure. */
	if ( preg_match_all( '/<h2[^>]*>(.*?)<\/h2>/s', substr( $content, 0, $m[0][1] ), $hs ) && $hs[1] ) {
		$finding['label'] = trim( wp_strip_all_tags( end( $hs[1] ) ) );
	}

	return $finding;
}

/**
 * The list of volumes on the hub — the cards.
 *
 * Built to read as /results/ does, because Cami asked for the hub to look like
 * Case Studies (2026-09-21): a filter of pills over a grid of three, and one
 * card per volume with the same parts a case card has — the industry pill,
 * the headline, one figure in olive, a line under it, the blurb, and a date
 * against a button. A published volume is a link the whole card; a scheduled
 * one is a plain box on the grey ground with "Coming soon" said on it — never
 * implied by the grey alone — and nothing on it that looks clickable.
 *
 * The filter is markup only; assets/shortlist.js switches the cards. Without
 * the script the pills sit inert and every card shows, which is the page.
 *
 * While there are no volumes at all — the state the series is in before the
 * first study runs — the list says so in a line.
 */
function thallo_shortlist_list() {
	$volumes = thallo_shortlist_volumes();

	if ( ! $volumes ) {
		return '<p class="thallo-cards__empty">' . esc_html__( 'The first volume is being run now. Leave your address below and it comes to you the day it goes up.', 'thallo-blog' ) . '</p>';
	}

	/* One row at a time — three cards — and the rest behind a pager under
	   them (Cami, 2026-09-21): every volume is in the markup, in order, and
	   assets/shortlist.js shows three and draws "‹ 1 2 ›" beneath. Without the
	   script every card shows, which is the page. */
	$industries = array();
	$cards      = '';

	foreach ( $volumes as $i => $volume ) {
		$live     = 'publish' === $volume->post_status;
		$number   = thallo_shortlist_pad( $i + 1 );
		$title    = wp_strip_all_tags( get_the_title( $volume ) );
		$teaser   = trim( wp_strip_all_tags( get_the_excerpt( $volume ) ) );
		$industry = thallo_shortlist_industry( $volume );
		$date     = thallo_shortlist_date( $volume );
		$finding  = $live ? thallo_shortlist_finding( $volume ) : array( 'stat' => '', 'label' => '' );

		if ( '' !== $industry && ! in_array( $industry, $industries, true ) ) {
			$industries[] = $industry;
		}

		if ( ! $live ) {
			/* translators: %s: "27 October". */
			$teaser = sprintf( __( 'Publishing %s.', 'thallo-blog' ), thallo_shortlist_day( $volume ) );
		}

		$pills = '';
		if ( '' !== $industry ) {
			$pills .= sprintf( '<span class="thallo-tag thallo-tag--olive">%s</span>', esc_html( $industry ) );
		}
		if ( ! $live ) {
			$pills .= sprintf( '<span class="thallo-tag thallo-tag--grey">%s</span>', esc_html__( 'Coming soon', 'thallo-blog' ) );
		}

		/* The figure line. A live volume with a finding shows it large, in
		   olive; a scheduled one says the figures are not out, small and grey —
		   set large, it would read as a result whatever the words said. */
		if ( $live && '' !== $finding['stat'] ) {
			$figure = '<span class="thallo-card__stat">' . esc_html( $finding['stat'] ) . '</span>'
				. ( '' !== $finding['label'] ? '<span class="thallo-card__label">' . esc_html( $finding['label'] ) . '</span>' : '' );
		} elseif ( $live ) {
			$figure = '';
		} else {
			$figure = '<span class="thallo-card__soon">' . esc_html__( 'Figures not yet published', 'thallo-blog' ) . '</span>';
		}

		/* On one line, deliberately. The template's output passes through
		   wpautop on its way out, and a newline inside this markup comes back
		   as a <br> between two boxes. */
		$body = '<span class="thallo-card__pills">' . $pills . '</span>'
			. '<span class="thallo-card__h"><span class="thallo-card__sr">' . esc_html( sprintf( /* translators: %s: two-digit volume number. */ __( 'Volume %s: ', 'thallo-blog' ), $number ) ) . '</span>' . esc_html( $title ) . '</span>'
			. $figure
			. ( '' !== $teaser ? '<span class="thallo-card__p">' . esc_html( $teaser ) . '</span>' : '' )
			. '<span class="thallo-card__foot">'
			. '<time class="thallo-card__date" datetime="' . esc_attr( get_the_date( 'Y-m-d', $volume ) ) . '">' . esc_html( $date ) . '</time>'
			. ( $live
				? '<span class="thallo-card__go">' . esc_html__( 'Read the volume', 'thallo-blog' ) . ' <svg class="thallo-arrow" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg></span>'
				: '<span class="thallo-card__go thallo-card__go--soon">' . esc_html__( 'In preparation', 'thallo-blog' ) . '</span>' )
			. '</span>';

		$attr = ' data-industry="' . esc_attr( $industry ) . '"';

		/* Each card in a box of its own: the shortcode block runs this through
		   wpautop, and an <a> standing free in the grid came back with an empty
		   <p> beside it — a seventh cell. The box carries the industry for the
		   filter, so what is switched off is the cell and not the card inside it. */
		$cards .= $live
			? '<div class="thallo-cards__item"' . $attr . '><a class="thallo-card" href="' . esc_url( get_permalink( $volume ) ) . '">' . $body . '</a></div>'
			: '<div class="thallo-cards__item"' . $attr . '><div class="thallo-card thallo-card--soon" aria-disabled="true">' . $body . '</div></div>';
	}

	/* Fewer than three volumes on the calendar and the row has holes. A card
	   for each empty place, saying what it is — the next volume, in
	   preparation — so the row reads as a series from the first day (Cami,
	   2026-09-21). Numbered after the last real one. */
	$count = count( $volumes );
	for ( $n = $count + 1; $n <= 3; $n++ ) {
		$number = thallo_shortlist_pad( $n );
		$cards .= '<div class="thallo-cards__item" data-industry="">'
			. '<div class="thallo-card thallo-card--soon thallo-card--next" aria-disabled="true">'
			. '<span class="thallo-card__pills"><span class="thallo-tag thallo-tag--grey">' . esc_html__( 'Coming soon', 'thallo-blog' ) . '</span></span>'
			/* translators: %s: two-digit volume number. */
			. '<span class="thallo-card__h">' . esc_html( sprintf( __( 'Volume %s', 'thallo-blog' ), $number ) ) . '</span>'
			. '<span class="thallo-card__soon">' . esc_html__( 'Category to be announced', 'thallo-blog' ) . '</span>'
			. '<span class="thallo-card__p">' . esc_html__( 'The next study is being run. It goes up here the day it is published.', 'thallo-blog' ) . '</span>'
			. '<span class="thallo-card__foot"><span class="thallo-card__date">' . esc_html__( 'In preparation', 'thallo-blog' ) . '</span>'
			. '<span class="thallo-card__go thallo-card__go--soon">' . esc_html__( 'In preparation', 'thallo-blog' ) . '</span></span>'
			. '</div></div>';
	}

	/* The filter: every option visible at a glance, "All volumes" first and
	   pressed. One pill per industry that has a volume, in the order the
	   volumes fall — so the count of pills stays honest about how much is
	   published. With one industry there is nothing to filter and the row is
	   left out. */
	$filter = '';
	if ( count( $industries ) > 1 ) {
		$filter = '<div class="thallo-filter" role="group" aria-label="' . esc_attr__( 'Filter volumes by industry', 'thallo-blog' ) . '">'
			. '<button type="button" class="thallo-filter__pill is-on" data-industry="" aria-pressed="true">' . esc_html__( 'All volumes', 'thallo-blog' ) . '</button>';
		foreach ( $industries as $name ) {
			$filter .= '<button type="button" class="thallo-filter__pill" data-industry="' . esc_attr( $name ) . '" aria-pressed="false">' . esc_html( $name ) . '</button>';
		}
		$filter .= '</div>';
	}

	/* The pager is drawn by the script from what is on the page; this is the
	   room it takes, so the list does not jump when it appears. */
	$pager = '<nav class="thallo-pager" aria-label="' . esc_attr__( 'More volumes', 'thallo-blog' ) . '" data-per-page="3"></nav>';

	return '<div class="thallo-cards" data-reveal>' . $filter . '<div class="thallo-cards__grid">' . $cards . '</div>' . $pager . '</div>';
}
add_shortcode( 'thallo_shortlist_volumes', 'thallo_shortlist_list' );

/* ─────────────────────────────────────────────────────────────────────────
   The ranking table
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Draws the bars into a ranking table.
 *
 * The table is an ordinary table block — the writer types "78%" into a cell —
 * and this turns every percentage in a table marked `thallo-rank` into a bar
 * with the figure beside it, at render time, from the number that was typed.
 * No chart library, no field to fill twice, and a reader with the stylesheet
 * off still gets a table of numbers.
 *
 * The header row decides what each column is: a heading containing "rate"
 * gets the bar; "#" is the rank; "firm" is the name; "position" or "google"
 * is the right-aligned figure; anything else is a note. The classes let the
 * stylesheet drop the two note columns on a phone instead of scrolling the
 * table sideways.
 */
function thallo_shortlist_rank_table( $content, $block ) {
	if ( empty( $block['blockName'] ) || 'core/table' !== $block['blockName'] ) {
		return $content;
	}

	$class = isset( $block['attrs']['className'] ) ? (string) $block['attrs']['className'] : '';
	if ( false === strpos( $class, 'thallo-rank' ) || ! class_exists( 'DOMDocument' ) ) {
		return $content;
	}

	/* The per-model table opts out. Its columns are headed "ChatGPT", "Claude"
	   and "Gemini" and hold a percentage each, so without this the rule below
	   would draw three bars across every row — a chart dressed as a table, when
	   the whole point of that table is three figures a reader compares by eye. */
	if ( false !== strpos( $class, 'thallo-models' ) ) {
		return $content;
	}

	$dom      = new DOMDocument();
	$previous = libxml_use_internal_errors( true );
	$dom->loadHTML( '<?xml encoding="UTF-8"><div id="thallo-rank-root">' . $content . '</div>', LIBXML_NOERROR | LIBXML_NOWARNING );
	libxml_clear_errors();
	libxml_use_internal_errors( $previous );

	$xpath = new DOMXPath( $dom );
	$root  = $dom->getElementById( 'thallo-rank-root' );
	if ( ! $root ) {
		return $content;
	}

	/* What each column is, from its heading. */
	$kinds = array();
	foreach ( $xpath->query( './/thead/tr[1]/*', $root ) as $i => $th ) {
		$text = strtolower( trim( $th->textContent ) );
		if ( '#' === $text || 'rank' === $text ) {
			$kinds[ $i ] = 'rank';
		} elseif ( false !== strpos( $text, 'rate' ) || false !== strpos( $text, 'share' ) ) {
			$kinds[ $i ] = 'rate';
		} elseif ( false !== strpos( $text, 'firm' ) || false !== strpos( $text, 'name' ) ) {
			$kinds[ $i ] = 'firm';
		} elseif ( false !== strpos( $text, 'position' ) || false !== strpos( $text, 'google' ) ) {
			$kinds[ $i ] = 'pos';
		} else {
			$kinds[ $i ] = 'note';
		}
		$th->setAttribute( 'class', trim( $th->getAttribute( 'class' ) . ' thallo-rank__' . $kinds[ $i ] ) );
	}

	foreach ( $xpath->query( './/tbody/tr', $root ) as $tr ) {
		$cells = $xpath->query( './td|./th', $tr );
		foreach ( $cells as $i => $td ) {
			$kind = isset( $kinds[ $i ] ) ? $kinds[ $i ] : 'note';
			$td->setAttribute( 'class', trim( $td->getAttribute( 'class' ) . ' thallo-rank__' . $kind ) );

			if ( 'rate' !== $kind ) {
				continue;
			}

			$text = trim( $td->textContent );
			if ( ! preg_match( '/^(\d+(?:[.,]\d+)?)\s*%$/', $text, $m ) ) {
				continue;
			}

			$pct = min( 100, max( 0, (float) str_replace( ',', '.', $m[1] ) ) );

			/* The cell's own text becomes the figure; the bar goes in front of it. */
			while ( $td->firstChild ) {
				$td->removeChild( $td->firstChild );
			}

			$rate = $dom->createElement( 'span' );
			$rate->setAttribute( 'class', 'thallo-rate' );

			$track = $dom->createElement( 'span' );
			$track->setAttribute( 'class', 'thallo-rate__track' );
			$track->setAttribute( 'aria-hidden', 'true' );

			$fill = $dom->createElement( 'span' );
			$fill->setAttribute( 'class', 'thallo-rate__fill' );
			$fill->setAttribute( 'style', '--pct:' . rtrim( rtrim( number_format( $pct, 1, '.', '' ), '0' ), '.' ) );

			$num = $dom->createElement( 'span', $text );
			$num->setAttribute( 'class', 'thallo-rate__num' );
			$num->setAttribute( 'data-count', (string) $pct );

			$track->appendChild( $fill );
			$rate->appendChild( $track );
			$rate->appendChild( $num );
			$td->appendChild( $rate );
		}
	}

	$out = '';
	foreach ( $root->childNodes as $child ) {
		$out .= $dom->saveHTML( $child );
	}

	return $out;
}
add_filter( 'render_block', 'thallo_shortlist_rank_table', 10, 2 );

/* ─────────────────────────────────────────────────────────────────────────
   wp-admin: two doors, clearly labelled
   ───────────────────────────────────────────────────────────────────────── */

/**
 * "Posts" is called "Blog" in the menu.
 *
 * The rule for the two publications is "an article is a post, a study is a
 * page under the hub", and the first time somebody tried it they inserted
 * the article pattern into a page and got neither. The rule is right; the
 * labels were not. With "Blog" on one door and "AI Shortlist" on the other,
 * nobody has to know what a post is.
 */
function thallo_shortlist_blog_labels( $labels ) {
	$labels->menu_name      = __( 'Blog', 'thallo-blog' );
	$labels->all_items      = __( 'All articles', 'thallo-blog' );
	$labels->add_new        = __( 'New article', 'thallo-blog' );
	$labels->add_new_item   = __( 'New article', 'thallo-blog' );
	$labels->name_admin_bar = __( 'Article', 'thallo-blog' );

	return $labels;
}
add_filter( 'post_type_labels_post', 'thallo_shortlist_blog_labels' );

/**
 * The "AI Shortlist" menu: the volumes, a new one, the hub.
 *
 * All three are pages underneath — this adds no post type and stores nothing
 * new. The menu is a set of shortcuts that do the two things a person would
 * otherwise have to know: file the page under the hub, and start it from the
 * volume pattern.
 */
function thallo_shortlist_admin_menu() {
	add_menu_page(
		__( 'The AI Shortlist', 'thallo-blog' ),
		__( 'AI Shortlist', 'thallo-blog' ),
		'edit_pages',
		'thallo-shortlist',
		'__return_null',
		'dashicons-chart-bar',
		5.5
	);
	add_submenu_page( 'thallo-shortlist', __( 'All volumes', 'thallo-blog' ), __( 'All volumes', 'thallo-blog' ), 'edit_pages', 'thallo-shortlist', '__return_null' );
	add_submenu_page( 'thallo-shortlist', __( 'New volume', 'thallo-blog' ), __( 'New volume', 'thallo-blog' ), 'edit_pages', 'thallo-shortlist-new', '__return_null' );
	add_submenu_page( 'thallo-shortlist', __( 'The hub page', 'thallo-blog' ), __( 'The hub page', 'thallo-blog' ), 'edit_pages', 'thallo-shortlist-hub', '__return_null' );
}
add_action( 'admin_menu', 'thallo_shortlist_admin_menu' );

/**
 * The three entries redirect rather than render — to the pages list filtered
 * to the hub's children, to a fresh volume in the editor, to the hub in the
 * editor. Done on `load-*`, before any output, which is the one moment a
 * menu entry can still send somebody somewhere else.
 */
function thallo_shortlist_admin_routes() {
	add_action(
		'load-toplevel_page_thallo-shortlist',
		function () {
			$hub = thallo_shortlist_hub_or_create();
			wp_safe_redirect( admin_url( 'edit.php?post_type=page&thallo_volumes=' . (int) $hub->ID ) );
			exit;
		}
	);
	add_action(
		'load-ai-shortlist_page_thallo-shortlist-new',
		function () {
			$id = thallo_shortlist_create_volume();
			wp_safe_redirect( admin_url( 'post.php?post=' . (int) $id . '&action=edit' ) );
			exit;
		}
	);
	add_action(
		'load-ai-shortlist_page_thallo-shortlist-hub',
		function () {
			$hub = thallo_shortlist_hub_or_create();
			wp_safe_redirect( admin_url( 'post.php?post=' . (int) $hub->ID . '&action=edit' ) );
			exit;
		}
	);
}
add_action( 'admin_init', 'thallo_shortlist_admin_routes' );

/**
 * The hub, made if it is missing.
 *
 * As a draft, with the slug that makes it the hub and the copy from the
 * brief already in it, so the person who opens it has only to read it and
 * press Publish. Nothing goes live on its own.
 */
function thallo_shortlist_hub_or_create() {
	$hub = thallo_shortlist_hub();
	if ( $hub ) {
		return $hub;
	}

	$id = wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_status'  => 'draft',
			'post_title'   => 'The AI Shortlist',
			'post_name'    => THALLO_SHORTLIST_SLUG,
			'post_excerpt' => 'When buyers ask AI for a provider, which firms get named — and where does the answer come from?',
			'post_content' => "<!-- wp:paragraph -->\n<p>Buyers now build their shortlist before they speak to anyone, and they build it by asking a model. We run the questions those buyers actually ask, record every firm the models name, and publish the results one category at a time.</p>\n<!-- /wp:paragraph -->\n\n<!-- wp:paragraph -->\n<p>Nothing is picked in advance. The ranking is whatever comes back.</p>\n<!-- /wp:paragraph -->",
		),
		true
	);

	if ( is_wp_error( $id ) ) {
		wp_die( esc_html( $id->get_error_message() ) );
	}

	return get_post( $id );
}

/**
 * A new volume: a page under the hub, starting as the volume pattern.
 *
 * An auto-draft, which is exactly what WordPress itself makes when somebody
 * presses "Add New" — it shows as an empty editor and is cleaned up on its
 * own if it is abandoned. The only differences from "Add New Page" are the
 * two things this menu exists for: the parent is already the hub, and the
 * content is already the study.
 *
 * @return int
 */
function thallo_shortlist_create_volume() {
	$hub     = thallo_shortlist_hub_or_create();
	$pattern = WP_Block_Patterns_Registry::get_instance()->get_registered( 'thallo-blog/shortlist-volume' );

	$id = wp_insert_post(
		array(
			'post_type'    => 'page',
			'post_status'  => 'auto-draft',
			/* The title WordPress gives its own auto-drafts; the editor knows
			   to show it as empty. */
			'post_title'   => __( 'Auto Draft' ),
			'post_parent'  => (int) $hub->ID,
			'post_content' => $pattern ? $pattern['content'] : '',
			'post_author'  => get_current_user_id(),
		),
		true
	);

	if ( is_wp_error( $id ) ) {
		wp_die( esc_html( $id->get_error_message() ) );
	}

	return (int) $id;
}

/**
 * "All volumes" is the pages list, shown only the hub's children, in series
 * order. `thallo_volumes` is the hub's id in the address, and this is the
 * only place it means anything.
 */
function thallo_shortlist_admin_list( $query ) {
	if ( ! is_admin() || ! $query->is_main_query() ) {
		return;
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- a read-only filter on a list screen.
	$parent = isset( $_GET['thallo_volumes'] ) ? (int) $_GET['thallo_volumes'] : 0;
	if ( ! $parent || 'page' !== $query->get( 'post_type' ) ) {
		return;
	}

	$query->set( 'post_parent', $parent );
	$query->set(
		'orderby',
		array(
			'menu_order' => 'ASC',
			'date'       => 'ASC',
		)
	);
}
add_action( 'pre_get_posts', 'thallo_shortlist_admin_list' );

/** The list says what it is showing, with a button that makes a volume. */
function thallo_shortlist_admin_list_title() {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( ! isset( $_GET['thallo_volumes'] ) ) {
		return;
	}

	printf(
		'<div class="notice notice-info"><p><strong>%1$s</strong> — %2$s <a class="button button-primary" href="%3$s">%4$s</a></p></div>',
		esc_html__( 'The AI Shortlist', 'thallo-blog' ),
		esc_html__( 'the volumes of the series, in order. A scheduled one shows on the hub as "Coming soon" with its date.', 'thallo-blog' ),
		esc_url( admin_url( 'admin.php?page=thallo-shortlist-new' ) ),
		esc_html__( 'New volume', 'thallo-blog' )
	);
}
add_action( 'admin_notices', 'thallo_shortlist_admin_list_title' );

/**
 * The "AI Shortlist" menu stays lit while a volume or the hub is being
 * edited, and "Pages" does not light up for them. Small, and the thing that
 * tells a person which of the two publications they are in.
 */
function thallo_shortlist_admin_parent( $parent_file ) {
	global $post;

	if ( $post && 'page' === $post->post_type && ( thallo_shortlist_is_hub( $post ) || thallo_shortlist_is_volume( $post ) ) ) {
		return 'thallo-shortlist';
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended
	if ( isset( $_GET['thallo_volumes'] ) ) {
		return 'thallo-shortlist';
	}

	return $parent_file;
}
add_filter( 'parent_file', 'thallo_shortlist_admin_parent' );

/**
 * The nav's own link to the series.
 *
 * parts/header.html is a static template part: WordPress prints its hrefs
 * exactly as written, so thallo_shortlist_page_link() above never sees them.
 * The one button that names the series stayed under /blog/ while every other
 * link the theme prints had already moved to the root (Cami, 2026-09-22).
 *
 * This moves it, and only when thallo_shortlist_at_root() says the rewrite is
 * in — so the nav keeps the same fallback as the rest: no rule, no move,
 * nothing broken.
 */
function thallo_shortlist_nav_link( $html ) {
	if ( ! thallo_shortlist_at_root() ) {
		return $html;
	}

	if ( false === strpos( $html, 'data-thallo-nav-research' ) ) {
		return $html;
	}

	return str_replace(
		'/blog/' . THALLO_SHORTLIST_SLUG . '/',
		'/' . THALLO_SHORTLIST_SLUG . '/',
		$html
	);
}
add_filter( 'render_block', 'thallo_shortlist_nav_link' );
