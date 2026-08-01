<?php
/**
 * The admin screens.
 *
 * Two pages: where the keys go, and where the leads land. Written for the
 * person who owns the site rather than for the person who wrote the plugin, so
 * every field says what it costs and what happens if it is left empty.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Thallo_Vis_Admin {

	public static function menu() {
		add_menu_page(
			__( 'Visibility Engine', 'thallo-visibility' ),
			__( 'Visibility', 'thallo-visibility' ),
			'manage_options',
			'thallo-visibility',
			array( __CLASS__, 'settings_page' ),
			'dashicons-chart-line',
			58
		);

		add_submenu_page(
			'thallo-visibility',
			__( 'Settings', 'thallo-visibility' ),
			__( 'Settings', 'thallo-visibility' ),
			'manage_options',
			'thallo-visibility',
			array( __CLASS__, 'settings_page' )
		);

		add_submenu_page(
			'thallo-visibility',
			__( 'Leads', 'thallo-visibility' ),
			__( 'Leads', 'thallo-visibility' ),
			'manage_options',
			'thallo-visibility-leads',
			array( __CLASS__, 'leads_page' )
		);
	}

	public static function settings_page() {
		$s    = Thallo_Vis_Settings::all();
		$demo = Thallo_Vis_Settings::is_demo();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Thallo Visibility Engine', 'thallo-visibility' ); ?></h1>

			<?php if ( $demo ) : ?>
				<div class="notice notice-warning">
					<p>
						<strong><?php esc_html_e( 'Preview mode.', 'thallo-visibility' ); ?></strong>
						<?php esc_html_e( 'No model can be called yet, so the tool is returning sample data and the website is showing a banner saying so. Add a key below to make it real.', 'thallo-visibility' ); ?>
					</p>
				</div>
			<?php else : ?>
				<div class="notice notice-success">
					<p><?php esc_html_e( 'Live. Scans are querying real models.', 'thallo-visibility' ); ?></p>
				</div>
			<?php endif; ?>

			<p style="max-width:46em">
				<?php esc_html_e( 'The front end talks to this endpoint:', 'thallo-visibility' ); ?>
				<code><?php echo esc_html( rest_url( 'thallo/v1' ) ); ?></code><br>
				<?php esc_html_e( 'Set it as NEXT_PUBLIC_SCAN_API when building the site.', 'thallo-visibility' ); ?>
			</p>

			<form method="post" action="options.php">
				<?php settings_fields( 'thallo_visibility' ); ?>
				<?php $name = THALLO_VIS_OPTION; ?>

				<h2><?php esc_html_e( 'How we reach the models', 'thallo-visibility' ); ?></h2>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><?php esc_html_e( 'Provider', 'thallo-visibility' ); ?></th>
						<td>
							<label>
								<input type="radio" name="<?php echo esc_attr( $name ); ?>[provider_mode]" value="openrouter" <?php checked( $s['provider_mode'], 'openrouter' ); ?>>
								<?php esc_html_e( 'OpenRouter — one key for every model (recommended)', 'thallo-visibility' ); ?>
							</label><br>
							<label>
								<input type="radio" name="<?php echo esc_attr( $name ); ?>[provider_mode]" value="native" <?php checked( $s['provider_mode'], 'native' ); ?>>
								<?php esc_html_e( 'Native — separate keys for OpenAI, Anthropic, Google and Perplexity', 'thallo-visibility' ); ?>
							</label>
							<p class="description">
								<?php esc_html_e( 'One scan is roughly 45 short calls. On the cheap models below that is about US$0.01–0.03 a scan either way. OpenRouter means one bill and one place to top up; native is slightly cheaper per token and four accounts to keep working.', 'thallo-visibility' ); ?>
							</p>
						</td>
					</tr>
				</table>

				<h3><?php esc_html_e( 'OpenRouter', 'thallo-visibility' ); ?></h3>
				<table class="form-table" role="presentation">
					<?php
					self::password_field( $name, 'openrouter_key', $s, __( 'API key', 'thallo-visibility' ), 'openrouter.ai → Keys' );
					self::text_field( $name, 'or_model_chatgpt', $s, __( 'ChatGPT model', 'thallo-visibility' ) );
					self::text_field( $name, 'or_model_claude', $s, __( 'Claude model', 'thallo-visibility' ) );
					self::text_field( $name, 'or_model_gemini', $s, __( 'Gemini model', 'thallo-visibility' ) );
					self::text_field( $name, 'or_model_perplexity', $s, __( 'Perplexity model', 'thallo-visibility' ), __( 'Used for live retrieval in the second half. Must be a model that searches the web.', 'thallo-visibility' ) );
					?>
				</table>

				<h3><?php esc_html_e( 'Native keys', 'thallo-visibility' ); ?></h3>
				<table class="form-table" role="presentation">
					<?php
					self::password_field( $name, 'openai_key', $s, __( 'OpenAI key', 'thallo-visibility' ) );
					self::password_field( $name, 'anthropic_key', $s, __( 'Anthropic key', 'thallo-visibility' ) );
					self::password_field( $name, 'google_key', $s, __( 'Google AI Studio key', 'thallo-visibility' ) );
					self::password_field( $name, 'perplexity_key', $s, __( 'Perplexity key', 'thallo-visibility' ) );
					self::text_field( $name, 'nv_model_chatgpt', $s, __( 'OpenAI model', 'thallo-visibility' ) );
					self::text_field( $name, 'nv_model_claude', $s, __( 'Anthropic model', 'thallo-visibility' ) );
					self::text_field( $name, 'nv_model_gemini', $s, __( 'Gemini model', 'thallo-visibility' ) );
					self::text_field( $name, 'nv_model_perplexity', $s, __( 'Perplexity model', 'thallo-visibility' ) );
					?>
				</table>

				<h2><?php esc_html_e( 'Google AI Overview', 'thallo-visibility' ); ?></h2>
				<p style="max-width:46em" class="description">
					<?php esc_html_e( 'Google publishes no API for the AI Overview, so it has to be read through a search-results provider. Leave this on “None” and the report says the AI Overview was not measured — which is honest, and better than a guess.', 'thallo-visibility' ); ?>
				</p>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><?php esc_html_e( 'Provider', 'thallo-visibility' ); ?></th>
						<td>
							<select name="<?php echo esc_attr( $name ); ?>[serp_provider]">
								<option value="none" <?php selected( $s['serp_provider'], 'none' ); ?>><?php esc_html_e( 'None — do not measure it', 'thallo-visibility' ); ?></option>
								<option value="serpapi" <?php selected( $s['serp_provider'], 'serpapi' ); ?>>SerpApi</option>
								<option value="dataforseo" <?php selected( $s['serp_provider'], 'dataforseo' ); ?>>DataForSEO</option>
							</select>
						</td>
					</tr>
					<?php
					self::password_field( $name, 'serpapi_key', $s, __( 'SerpApi key', 'thallo-visibility' ) );
					self::text_field( $name, 'dataforseo_login', $s, __( 'DataForSEO login', 'thallo-visibility' ) );
					self::password_field( $name, 'dataforseo_password', $s, __( 'DataForSEO password', 'thallo-visibility' ) );
					self::text_field( $name, 'serp_location', $s, __( 'Search location', 'thallo-visibility' ), __( 'Google shows a different AI Overview by country. This is the market the lookup is performed in.', 'thallo-visibility' ) );
					self::text_field( $name, 'serp_language', $s, __( 'Search language', 'thallo-visibility' ), __( 'Two-letter code, e.g. en or es.', 'thallo-visibility' ) );
					?>
				</table>

				<h2><?php esc_html_e( 'Limits and behaviour', 'thallo-visibility' ); ?></h2>
				<table class="form-table" role="presentation">
					<?php
					self::number_field( $name, 'questions', $s, __( 'Questions per model', 'thallo-visibility' ), 3, 15, __( 'Fifteen is the full set and what the website describes. Lowering it costs less and measures less.', 'thallo-visibility' ) );
					self::number_field( $name, 'jobs_per_tick', $s, __( 'Questions per request', 'thallo-visibility' ), 1, 15, __( 'How many are sent at once. Lower this if your host times out mid-scan.', 'thallo-visibility' ) );
					self::number_field( $name, 'request_timeout', $s, __( 'Request timeout (seconds)', 'thallo-visibility' ), 5, 60 );
					self::number_field( $name, 'rate_per_ip', $s, __( 'Free scans per visitor per day', 'thallo-visibility' ), 1, 100 );
					self::number_field( $name, 'rate_global', $s, __( 'Scans per day, site-wide', 'thallo-visibility' ), 1, 10000, __( 'The ceiling on what a bad day can cost you. This is the setting that actually protects the bill.', 'thallo-visibility' ) );
					self::number_field( $name, 'retention_days', $s, __( 'Keep scan data for (days)', 'thallo-visibility' ), 1, 365, __( 'Scan working data is deleted after this. Leads are kept until you delete them.', 'thallo-visibility' ) );
					?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Preview mode', 'thallo-visibility' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="<?php echo esc_attr( $name ); ?>[demo_mode]" value="1" <?php checked( $s['demo_mode'], 1 ); ?>>
								<?php esc_html_e( 'Return sample data even when keys are configured', 'thallo-visibility' ); ?>
							</label>
							<p class="description"><?php esc_html_e( 'For demonstrating the tool without spending anything. The website shows a banner saying the figures are samples the whole time this is on.', 'thallo-visibility' ); ?></p>
						</td>
					</tr>
				</table>

				<h2><?php esc_html_e( 'Leads and access', 'thallo-visibility' ); ?></h2>
				<table class="form-table" role="presentation">
					<?php self::text_field( $name, 'notify_email', $s, __( 'Notify this address', 'thallo-visibility' ), __( 'Emailed a summary each time somebody unlocks a report. Leave empty for none.', 'thallo-visibility' ) ); ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Send the report', 'thallo-visibility' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="<?php echo esc_attr( $name ); ?>[send_report_to_lead]" value="1" <?php checked( $s['send_report_to_lead'], 1 ); ?>>
								<?php esc_html_e( 'Email the report to the person who unlocked it', 'thallo-visibility' ); ?>
							</label>
							<p class="description"><?php esc_html_e( 'They gave an address in exchange for the report, so sending it is the deal. Needs working outbound mail — on Bluehost, an SMTP plugin.', 'thallo-visibility' ); ?></p>
						</td>
					</tr>
					<tr>
						<th scope="row"><?php esc_html_e( 'Allowed origins', 'thallo-visibility' ); ?></th>
						<td>
							<textarea name="<?php echo esc_attr( $name ); ?>[allowed_origins]" rows="3" class="large-text code"><?php echo esc_textarea( $s['allowed_origins'] ); ?></textarea>
							<p class="description">
								<?php esc_html_e( 'One per line, e.g. http://localhost:3000. Only needed when the website is on a different origin from this WordPress — if the site is at the domain root and this is at /blog/, leave it empty.', 'thallo-visibility' ); ?>
							</p>
						</td>
					</tr>
				</table>

				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}

	public static function leads_page() {
		$leads = Thallo_Vis_Leads::all();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Visibility scan leads', 'thallo-visibility' ); ?></h1>

			<p>
				<a class="button" href="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-post.php?action=thallo_export_leads' ), 'thallo_export_leads' ) ); ?>">
					<?php esc_html_e( 'Export all as CSV', 'thallo-visibility' ); ?>
				</a>
			</p>

			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Date', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Email', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Brand', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Website', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Category', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Share of voice', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Grade', 'thallo-visibility' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $leads ) ) : ?>
						<tr><td colspan="7"><?php esc_html_e( 'Nobody has unlocked a report yet.', 'thallo-visibility' ); ?></td></tr>
					<?php else : ?>
						<?php foreach ( $leads as $lead ) : ?>
							<tr>
								<td><?php echo esc_html( $lead['created_at'] ); ?></td>
								<td><a href="mailto:<?php echo esc_attr( $lead['email'] ); ?>"><?php echo esc_html( $lead['email'] ); ?></a></td>
								<td><?php echo esc_html( $lead['brand'] ); ?></td>
								<td><a href="<?php echo esc_url( 'https://' . $lead['domain'] ); ?>" target="_blank" rel="noreferrer noopener"><?php echo esc_html( $lead['domain'] ); ?></a></td>
								<td><?php echo esc_html( $lead['industry'] ); ?></td>
								<td><?php echo esc_html( $lead['sov_pct'] . '%' ); ?></td>
								<td><?php echo esc_html( $lead['grade'] ? $lead['grade'] : '—' ); ?></td>
							</tr>
						<?php endforeach; ?>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	// -- Field helpers -------------------------------------------------------

	private static function text_field( $name, $key, $s, $label, $description = '' ) {
		?>
		<tr>
			<th scope="row"><label for="thallo-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th>
			<td>
				<input type="text" id="thallo-<?php echo esc_attr( $key ); ?>" class="regular-text"
					name="<?php echo esc_attr( $name ); ?>[<?php echo esc_attr( $key ); ?>]"
					value="<?php echo esc_attr( $s[ $key ] ); ?>">
				<?php if ( $description ) : ?>
					<p class="description"><?php echo esc_html( $description ); ?></p>
				<?php endif; ?>
			</td>
		</tr>
		<?php
	}

	/**
	 * Keys are rendered as password fields and shown in full when saved.
	 * Masking a stored key sounds safer but means nobody can ever check they
	 * pasted the right one, and this screen is already behind manage_options.
	 */
	private static function password_field( $name, $key, $s, $label, $description = '' ) {
		?>
		<tr>
			<th scope="row"><label for="thallo-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th>
			<td>
				<input type="password" id="thallo-<?php echo esc_attr( $key ); ?>" class="regular-text" autocomplete="off"
					name="<?php echo esc_attr( $name ); ?>[<?php echo esc_attr( $key ); ?>]"
					value="<?php echo esc_attr( $s[ $key ] ); ?>">
				<?php if ( $description ) : ?>
					<p class="description"><?php echo esc_html( $description ); ?></p>
				<?php endif; ?>
			</td>
		</tr>
		<?php
	}

	private static function number_field( $name, $key, $s, $label, $min, $max, $description = '' ) {
		?>
		<tr>
			<th scope="row"><label for="thallo-<?php echo esc_attr( $key ); ?>"><?php echo esc_html( $label ); ?></label></th>
			<td>
				<input type="number" id="thallo-<?php echo esc_attr( $key ); ?>" class="small-text"
					min="<?php echo esc_attr( $min ); ?>" max="<?php echo esc_attr( $max ); ?>"
					name="<?php echo esc_attr( $name ); ?>[<?php echo esc_attr( $key ); ?>]"
					value="<?php echo esc_attr( $s[ $key ] ); ?>">
				<?php if ( $description ) : ?>
					<p class="description"><?php echo esc_html( $description ); ?></p>
				<?php endif; ?>
			</td>
		</tr>
		<?php
	}
}
