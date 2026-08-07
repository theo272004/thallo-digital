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

		add_submenu_page(
			'thallo-visibility',
			__( 'Monitoring', 'thallo-visibility' ),
			__( 'Monitoring', 'thallo-visibility' ),
			'manage_options',
			'thallo-visibility-monitors',
			array( __CLASS__, 'monitors_page' )
		);
	}

	/**
	 * Every monitoring action arrives here.
	 *
	 * One handler rather than four, because they share the whole preamble —
	 * capability, nonce, id — and four copies of that is four places for one of
	 * them to be forgotten. Each of these changes what the site spends money on,
	 * so none of them is a GET anybody can be linked into.
	 */
	public static function handle_monitor_action() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to do that.', 'thallo-visibility' ) );
		}

		check_admin_referer( 'thallo_monitor_action' );

		$action = isset( $_POST['monitor_action'] ) ? sanitize_key( wp_unslash( $_POST['monitor_action'] ) ) : '';
		$id     = isset( $_POST['monitor_id'] ) ? (int) $_POST['monitor_id'] : 0;

		switch ( $action ) {
			case 'enrol':
				$lead_id = isset( $_POST['lead_id'] ) ? (int) $_POST['lead_id'] : 0;
				$lead    = Thallo_Vis_Leads::get( $lead_id );

				if ( $lead ) {
					Thallo_Vis_Monitors::add(
						$lead['brand'],
						$lead['domain'],
						$lead['industry'],
						isset( $lead['market'] ) ? $lead['market'] : Thallo_Vis_Questions::DEFAULT_MARKET,
						$lead['email'],
						isset( $_POST['frequency'] ) ? sanitize_key( wp_unslash( $_POST['frequency'] ) ) : 'weekly'
					);
				}
				break;

			case 'pause':
				Thallo_Vis_Monitors::set_active( $id, false );
				break;

			case 'resume':
				Thallo_Vis_Monitors::set_active( $id, true );
				break;

			case 'remove':
				Thallo_Vis_Monitors::remove( $id );
				break;
		}

		wp_safe_redirect(
			add_query_arg(
				'thallo_done',
				$action,
				admin_url( 'admin.php?page=thallo-visibility-monitors' )
			)
		);
		exit;
	}

	public static function monitors_page() {
		$monitors = Thallo_Vis_Monitors::all();
		$enabled  = Thallo_Vis_Settings::get( 'monitoring_enabled' );
		$cap      = (int) Thallo_Vis_Settings::get( 'monitor_daily_cap', 20 );
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Scheduled monitoring', 'thallo-visibility' ); ?></h1>

			<p style="max-width:46em">
				<?php esc_html_e( 'A monitor re-runs one brand\'s scan on a schedule and adds a point to its history. A single scan tells a client where they stand; the line is what a retainer is for.', 'thallo-visibility' ); ?>
			</p>

			<?php if ( ! $enabled ) : ?>
				<div class="notice notice-warning">
					<p>
						<strong><?php esc_html_e( 'Monitoring is switched off.', 'thallo-visibility' ); ?></strong>
						<?php esc_html_e( 'Nothing below will run. This is the only part of the tool that spends money with nobody watching, so it stays off until you turn it on under Settings.', 'thallo-visibility' ); ?>
					</p>
				</div>
			<?php else : ?>
				<div class="notice notice-success">
					<p>
						<?php
						printf(
							/* translators: 1: scans run in the last day, 2: the daily ceiling. */
							esc_html__( 'Running. %1$d of a maximum %2$d scheduled scans in the last 24 hours.', 'thallo-visibility' ),
							(int) Thallo_Vis_Monitors::ran_today(),
							(int) $cap
						);
						?>
					</p>
				</div>
			<?php endif; ?>

			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Brand', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Website', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Market', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Every', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Last run', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Next run', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'State', 'thallo-visibility' ); ?></th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $monitors ) ) : ?>
						<tr><td colspan="8"><?php esc_html_e( 'Nothing is being monitored. Add one from the Leads screen.', 'thallo-visibility' ); ?></td></tr>
					<?php else : ?>
						<?php foreach ( $monitors as $monitor ) : ?>
							<tr>
								<td><strong><?php echo esc_html( $monitor['brand'] ); ?></strong></td>
								<td><?php echo esc_html( $monitor['domain'] ); ?></td>
								<td><code><?php echo esc_html( $monitor['market'] ); ?></code></td>
								<td><?php echo esc_html( $monitor['frequency'] ); ?></td>
								<td><?php echo esc_html( $monitor['last_run_at'] ? $monitor['last_run_at'] : '—' ); ?></td>
								<td><?php echo esc_html( $monitor['next_run_at'] ); ?></td>
								<td>
									<?php if ( ! $monitor['active'] ) : ?>
										<?php esc_html_e( 'Paused', 'thallo-visibility' ); ?>
									<?php elseif ( '' !== $monitor['running_scan_id'] ) : ?>
										<?php esc_html_e( 'Scanning now', 'thallo-visibility' ); ?>
									<?php else : ?>
										<?php esc_html_e( 'Scheduled', 'thallo-visibility' ); ?>
									<?php endif; ?>
									<?php if ( '' !== $monitor['last_error'] ) : ?>
										<br><span style="color:#b32d2e"><?php echo esc_html( $monitor['last_error'] ); ?></span>
									<?php endif; ?>
								</td>
								<td>
									<?php
									self::action_button(
										$monitor['active'] ? 'pause' : 'resume',
										$monitor['active'] ? __( 'Pause', 'thallo-visibility' ) : __( 'Resume', 'thallo-visibility' ),
										array( 'monitor_id' => $monitor['id'] )
									);
									self::action_button( 'remove', __( 'Remove', 'thallo-visibility' ), array( 'monitor_id' => $monitor['id'] ) );
									?>
								</td>
							</tr>
						<?php endforeach; ?>
					<?php endif; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	/**
	 * A one-button POST form.
	 *
	 * Inline rather than a link because every one of these spends money or stops
	 * money being spent, and a GET can be prefetched, crawled or linked into.
	 */
	private static function action_button( $action, $label, array $fields = array() ) {
		?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline">
			<?php wp_nonce_field( 'thallo_monitor_action' ); ?>
			<input type="hidden" name="action" value="thallo_monitor_action">
			<input type="hidden" name="monitor_action" value="<?php echo esc_attr( $action ); ?>">
			<?php foreach ( $fields as $key => $value ) : ?>
				<input type="hidden" name="<?php echo esc_attr( $key ); ?>" value="<?php echo esc_attr( $value ); ?>">
			<?php endforeach; ?>
			<button type="submit" class="button button-small"><?php echo esc_html( $label ); ?></button>
		</form>
		<?php
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
					?>
				</table>
				<p class="description">
					<?php esc_html_e( 'The country and language of the lookup are taken from the market the visitor chose for that scan, not set here — a single site-wide locale could only ever be right for one of the markets on offer.', 'thallo-visibility' ); ?>
				</p>

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
						<th scope="row"><?php esc_html_e( 'Scheduled monitoring', 'thallo-visibility' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="<?php echo esc_attr( $name ); ?>[monitoring_enabled]" value="1" <?php checked( $s['monitoring_enabled'], 1 ); ?>>
								<?php esc_html_e( 'Re-run monitored brands automatically', 'thallo-visibility' ); ?>
							</label>
							<p class="description"><?php esc_html_e( 'The only thing here that spends money with nobody present. Off until you switch it on. Choose which brands under Visibility → Monitoring.', 'thallo-visibility' ); ?></p>
						</td>
					</tr>
					<?php self::number_field( $name, 'monitor_daily_cap', $s, __( 'Scheduled scans per day', 'thallo-visibility' ), 1, 500, __( 'A separate ceiling from the site-wide one. That protects you from a stranger; this protects you from twenty monitors falling due on the same morning.', 'thallo-visibility' ) ); ?>
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
						<th><?php esc_html_e( 'Monitor', 'thallo-visibility' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $leads ) ) : ?>
						<tr><td colspan="8"><?php esc_html_e( 'Nobody has unlocked a report yet.', 'thallo-visibility' ); ?></td></tr>
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
								<td>
									<?php
									$market   = isset( $lead['market'] ) ? $lead['market'] : Thallo_Vis_Questions::DEFAULT_MARKET;
									$existing = Thallo_Vis_Monitors::find( $lead['domain'], $market );

									if ( $existing && $existing['active'] ) {
										esc_html_e( 'Monitored', 'thallo-visibility' );
									} else {
										self::action_button(
											'enrol',
											__( 'Monitor weekly', 'thallo-visibility' ),
											array( 'lead_id' => $lead['id'], 'frequency' => 'weekly' )
										);
									}
									?>
								</td>
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
