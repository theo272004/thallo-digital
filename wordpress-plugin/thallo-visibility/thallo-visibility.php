<?php
/**
 * Plugin Name:       Thallo Visibility Engine
 * Plugin URI:        https://thallodigital.com/
 * Description:       Backend for the Check My Visibility tool. Asks ChatGPT, Claude and Gemini the buying questions in a category, counts how often a brand is named, checks live retrieval and crawls the site — and serves it all to the static front end over the REST API.
 * Version:           1.0.1
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Thallo Digital
 * License:           GPL-2.0-or-later
 * Text Domain:       thallo-visibility
 *
 * ---------------------------------------------------------------------------
 * WHY THIS IS A WORDPRESS PLUGIN
 *
 * The marketing site is a Next.js static export. A static export cannot hold a
 * secret, so calling OpenAI from the visitor's browser was never an option —
 * the key would be in the bundle. Something server-side has to hold the keys
 * and make the calls.
 *
 * WordPress is already going onto the same Bluehost account to run the blog, so
 * it is the server we are paying for anyway. Putting the API here means: no
 * second host, no CORS (the site is at the domain root, WordPress at /blog/, so
 * the API is same-origin), a settings screen for the keys that a non-developer
 * can use, and a place for the leads to land.
 *
 * WHY A SCAN IS A JOB RATHER THAN A REQUEST
 *
 * Fifteen questions across three models is forty-five HTTP calls to other
 * people's servers. No shared host will hold a request open for that. So the
 * client starts a scan, then ticks it forward; each tick does a slice of the
 * work inside one comfortable request and returns the whole session. The
 * progress bar the visitor watches is therefore reporting real work.
 * ---------------------------------------------------------------------------
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'THALLO_VIS_VERSION', '1.0.1' );
define( 'THALLO_VIS_FILE', __FILE__ );
define( 'THALLO_VIS_DIR', plugin_dir_path( __FILE__ ) );
define( 'THALLO_VIS_OPTION', 'thallo_visibility_settings' );

require_once THALLO_VIS_DIR . 'includes/class-thallo-db.php';
require_once THALLO_VIS_DIR . 'includes/class-thallo-settings.php';
require_once THALLO_VIS_DIR . 'includes/class-thallo-questions.php';
require_once THALLO_VIS_DIR . 'includes/class-thallo-http.php';
require_once THALLO_VIS_DIR . 'includes/class-thallo-llm.php';
require_once THALLO_VIS_DIR . 'includes/class-thallo-retrieval.php';
require_once THALLO_VIS_DIR . 'includes/class-thallo-tech.php';
require_once THALLO_VIS_DIR . 'includes/class-thallo-analysis.php';
require_once THALLO_VIS_DIR . 'includes/class-thallo-runner.php';
require_once THALLO_VIS_DIR . 'includes/class-thallo-leads.php';
require_once THALLO_VIS_DIR . 'includes/class-thallo-rest.php';
require_once THALLO_VIS_DIR . 'includes/class-thallo-admin.php';

register_activation_hook( __FILE__, array( 'Thallo_Vis_DB', 'install' ) );

/**
 * Schema changes ship in plugin updates, and a plugin can be updated by copying
 * files over FTP without the activation hook ever firing. So the version is
 * checked on every load and the installer re-run when it has moved — dbDelta is
 * idempotent, so this is cheap and safe.
 */
add_action(
	'plugins_loaded',
	static function () {
		if ( get_option( 'thallo_visibility_db_version' ) !== THALLO_VIS_VERSION ) {
			Thallo_Vis_DB::install();
		}
	}
);

add_action( 'rest_api_init', array( 'Thallo_Vis_REST', 'register_routes' ) );
add_action( 'admin_menu', array( 'Thallo_Vis_Admin', 'menu' ) );
add_action( 'admin_init', array( 'Thallo_Vis_Settings', 'register' ) );
add_action( 'admin_post_thallo_export_leads', array( 'Thallo_Vis_Leads', 'export_csv' ) );

/**
 * Housekeeping. Scan rows are working state, not records — the lead is the
 * record, and it is kept in its own table. Anything older than the retention
 * window goes, so a public endpoint cannot quietly fill the customer's database.
 */
add_action( 'thallo_vis_cleanup', array( 'Thallo_Vis_DB', 'prune' ) );

add_action(
	'init',
	static function () {
		if ( ! wp_next_scheduled( 'thallo_vis_cleanup' ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', 'thallo_vis_cleanup' );
		}
	}
);

register_deactivation_hook(
	__FILE__,
	static function () {
		$timestamp = wp_next_scheduled( 'thallo_vis_cleanup' );
		if ( $timestamp ) {
			wp_unschedule_event( $timestamp, 'thallo_vis_cleanup' );
		}
	}
);
