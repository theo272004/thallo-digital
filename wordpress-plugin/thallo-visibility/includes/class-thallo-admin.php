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
			__( 'Enquiries', 'thallo-visibility' ),
			__( 'Enquiries', 'thallo-visibility' ),
			'manage_options',
			'thallo-visibility-enquiries',
			array( __CLASS__, 'enquiries_page' )
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

	/** The resend button. POST for the same reason the monitor actions are. */
	private static function mail_button( $label, $lead_id ) {
		?>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" style="display:inline">
			<?php wp_nonce_field( 'thallo_mail_action' ); ?>
			<input type="hidden" name="action" value="thallo_mail_action">
			<input type="hidden" name="mail_action" value="resend">
			<input type="hidden" name="lead_id" value="<?php echo esc_attr( $lead_id ); ?>">
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
					<?php self::password_field( $name, 'openrouter_key', $s, __( 'API key', 'thallo-visibility' ), 'openrouter.ai → Keys' ); ?>
				</table>

				<?php self::models_section( $name, $s ); ?>

				<h2><?php esc_html_e( 'Ask again, with the web open', 'thallo-visibility' ); ?></h2>
				<p style="max-width:46em" class="description">
					<?php esc_html_e( 'The scan asks the models what they already know about a category. This asks the same questions a second time with the web open — whether they pick you once they have looked. The gap between the two readings is the finding.', 'thallo-visibility' ); ?>
				</p>
				<p style="max-width:46em" class="description">
					<strong><?php esc_html_e( 'This is the expensive half:', 'thallo-visibility' ); ?></strong>
					<?php esc_html_e( 'about US$0.17 a scan against US$0.01–0.03, and it only runs after somebody leaves an email — so it is charged per lead, not per visitor.', 'thallo-visibility' ); ?>
				</p>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row"><?php esc_html_e( 'Second reading', 'thallo-visibility' ); ?></th>
						<td>
							<label>
								<input type="checkbox" name="<?php echo esc_attr( $name ); ?>[grounded_enabled]" value="1" <?php checked( $s['grounded_enabled'], 1 ); ?>>
								<?php esc_html_e( 'Ask the three models again, with the web open, after the email', 'thallo-visibility' ); ?>
							</label>
							<p class="description"><?php esc_html_e( 'OpenRouter only. The searching is done by OpenRouter and the results handed to the model — no current Anthropic or Google model does its own. Not offered on the native path, where the report shows no section rather than an empty one.', 'thallo-visibility' ); ?></p>
						</td>
					</tr>
					<?php self::number_field( $name, 'grounded_questions', $s, __( 'Questions asked a second time', 'thallo-visibility' ), 3, 15, __( 'The search fee is per call, so this is the only real lever on what this half costs: five ≈ US$0.17, eight ≈ US$0.27, fifteen ≈ US$0.50. Five still separates "never named" from "sometimes named", which is all this reading is asked to settle.', 'thallo-visibility' ) ); ?>
					<tr>
						<th scope="row"><?php esc_html_e( 'Search depth', 'thallo-visibility' ); ?></th>
						<td>
							<select name="<?php echo esc_attr( $name ); ?>[grounded_context]">
								<option value="low" <?php selected( $s['grounded_context'], 'low' ); ?>><?php esc_html_e( 'Low — cheapest', 'thallo-visibility' ); ?></option>
								<option value="medium" <?php selected( $s['grounded_context'], 'medium' ); ?>><?php esc_html_e( 'Medium', 'thallo-visibility' ); ?></option>
								<option value="high" <?php selected( $s['grounded_context'], 'high' ); ?>><?php esc_html_e( 'High — most context, most expensive', 'thallo-visibility' ); ?></option>
							</select>
							<p class="description"><?php esc_html_e( 'How much of each page the search feeds back to the model. Charged as prompt tokens, so this is the half of the bill that is easy to miss.', 'thallo-visibility' ); ?></p>
						</td>
					</tr>
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
					<?php self::text_field( $name, 'notify_email', $s, __( 'Notify this address', 'thallo-visibility' ), __( 'Emailed a summary each time somebody unlocks a report. Leave empty for none. Replies to the report come back here too.', 'thallo-visibility' ) ); ?>
					<?php self::text_field( $name, 'from_email', $s, __( 'Send mail from', 'thallo-visibility' ), __( 'Must be a real, working mailbox on this domain — hello@yourdomain.com, not no-reply@. Left empty, WordPress sends as wordpress@yourdomain.com, which usually does not exist and is the most common reason a report never arrives.', 'thallo-visibility' ) ); ?>
					<?php self::text_field( $name, 'from_name', $s, __( 'Sender name', 'thallo-visibility' ), __( 'The name on the From line, e.g. Thallo Digital.', 'thallo-visibility' ) ); ?>
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

			<?php
			/*
			 * Outside the settings form, and not only because HTML forbids
			 * nesting one form in another. This button acts on the settings that
			 * are already saved, where Save acts on what is on screen — putting
			 * them in one form would make a test that silently reported on the
			 * wrong configuration, which is worse than no test at all.
			 */
			?>
			<?php self::model_check_panel(); ?>

			<h2><?php esc_html_e( 'Does outbound mail work?', 'thallo-visibility' ); ?></h2>
			<p class="description" style="max-width:46em">
				<?php esc_html_e( 'Sends one plain message using the settings as saved. A report that never arrives is almost never the report — it is the host refusing to send anything at all, and this is how to find that out in ten seconds instead of after a client tells you. If it does not arrive, install an SMTP plugin and send through a real mailbox; nothing on this screen can fix it.', 'thallo-visibility' ); ?>
			</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<?php wp_nonce_field( 'thallo_mail_action' ); ?>
				<input type="hidden" name="action" value="thallo_mail_action">
				<input type="hidden" name="mail_action" value="test">
				<input type="email" name="test_email" class="regular-text" required
					value="<?php echo esc_attr( $s['notify_email'] ? $s['notify_email'] : get_option( 'admin_email' ) ); ?>">
				<button type="submit" class="button"><?php esc_html_e( 'Send a test email', 'thallo-visibility' ); ?></button>
			</form>
		</div>
		<?php
	}

	/**
	 * The test send, and the resend.
	 *
	 * Both report back through a transient rather than a query argument: the
	 * useful half of a failure is the SMTP server's own sentence about why, and
	 * that does not belong in a URL.
	 */
	public static function handle_mail_action() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to do that.', 'thallo-visibility' ) );
		}

		check_admin_referer( 'thallo_mail_action' );

		$action = isset( $_POST['mail_action'] ) ? sanitize_key( wp_unslash( $_POST['mail_action'] ) ) : '';

		if ( 'resend' === $action ) {
			$result   = Thallo_Vis_Leads::resend( isset( $_POST['lead_id'] ) ? (int) $_POST['lead_id'] : 0 );
			$redirect = admin_url( 'admin.php?page=thallo-visibility-leads' );
			$success  = __( 'The report was sent again.', 'thallo-visibility' );
		} else {
			$to       = isset( $_POST['test_email'] ) ? sanitize_email( wp_unslash( $_POST['test_email'] ) ) : '';
			$result   = Thallo_Vis_Leads::send_test( $to );
			$redirect = admin_url( 'admin.php?page=thallo-visibility' );
			/* Handed off, not delivered — and the difference is the whole reason
			   somebody is on this screen. Overstating it here would send them
			   looking for the fault somewhere else. */
			$success  = sprintf(
				/* translators: %s: email address the test was sent to. */
				__( 'The test message was accepted for delivery to %s. If it does not turn up, including in spam, the host took it and dropped it — install an SMTP plugin.', 'thallo-visibility' ),
				$to
			);
		}

		set_transient(
			'thallo_vis_mail_notice',
			array(
				'ok'      => ! empty( $result['ok'] ),
				'message' => ! empty( $result['ok'] ) ? $success : $result['error'],
			),
			60
		);

		wp_safe_redirect( $redirect );
		exit;
	}

	/** Prints whatever the last mail action had to say, once. */
	public static function mail_notice() {
		$notice = get_transient( 'thallo_vis_mail_notice' );
		if ( ! $notice ) {
			return;
		}

		delete_transient( 'thallo_vis_mail_notice' );
		?>
		<div class="notice <?php echo empty( $notice['ok'] ) ? 'notice-error' : 'notice-success'; ?>">
			<p><?php echo esc_html( $notice['message'] ); ?></p>
		</div>
		<?php
	}

	/**
	 * Checks every configured model and parks the result for the settings screen
	 * to render after the redirect.
	 *
	 * A transient rather than a property, because this is a POST that redirects —
	 * without it the result would have to survive in a query string, and a
	 * findings table is not a URL. An hour is long enough to still be on screen
	 * after a save and short enough that nobody mistakes a stale table for a
	 * fresh one; the timestamp is printed with it either way.
	 */
	const CHECK_TRANSIENT = 'thallo_vis_model_check';

	public static function handle_model_check() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to do that.', 'thallo-visibility' ) );
		}

		check_admin_referer( 'thallo_check_models' );

		set_transient(
			self::CHECK_TRANSIENT,
			array(
				'at'   => time(),
				'rows' => Thallo_Vis_LLM::verify_all(),
			),
			HOUR_IN_SECONDS
		);

		wp_safe_redirect( admin_url( 'admin.php?page=thallo-visibility&thallo_checked=1#thallo-model-check' ) );
		exit;
	}

	/**
	 * The result of that check.
	 *
	 * Worth the screen space it takes: a retired model id is the single most
	 * likely way this plugin goes quietly wrong, and its symptom — one column
	 * reporting "unavailable" — looks like a finding about the visitor's brand
	 * rather than like our configuration having expired.
	 */
	private static function model_check_panel() {
		$report = get_transient( self::CHECK_TRANSIENT );
		$tone   = array(
			'ok'           => array( '#2c7a2c', __( 'Working', 'thallo-visibility' ) ),
			'wrong-model'  => array( '#b32d2e', __( 'Wrong model', 'thallo-visibility' ) ),
			'error'        => array( '#b32d2e', __( 'Failed', 'thallo-visibility' ) ),
			'unconfigured' => array( '#8c8f94', __( 'Not configured', 'thallo-visibility' ) ),
		);
		?>
		<h2 id="thallo-model-check"><?php esc_html_e( 'Check the models', 'thallo-visibility' ); ?></h2>
		<p style="max-width:46em" class="description">
			<?php esc_html_e( 'Model ids are the one part of this plugin with an expiry date. Providers retire them, and when that happens every scan reports that column as unavailable — which reads to the client as a finding about their brand rather than as our settings having gone stale. This asks each configured model one real question and reports what came back, including which model actually answered: an id in the ChatGPT field that belongs to somebody else will answer every call quite happily and put the wrong name over the numbers.', 'thallo-visibility' ); ?>
		</p>
		<p style="max-width:46em" class="description">
			<?php esc_html_e( 'It costs about a hundredth of a cent. The second-reading models are checked against OpenRouter\'s catalogue instead of being called, because with search on a test call is charged the same per-call search fee a real scan is.', 'thallo-visibility' ); ?>
		</p>

		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<?php wp_nonce_field( 'thallo_check_models' ); ?>
			<input type="hidden" name="action" value="thallo_check_models">
			<button type="submit" class="button button-secondary"><?php esc_html_e( 'Check the models now', 'thallo-visibility' ); ?></button>
		</form>

		<?php if ( is_array( $report ) && ! empty( $report['rows'] ) ) : ?>
			<table class="widefat striped" style="max-width:60em;margin-top:1em">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Column', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Asked for', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Answered as', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Verdict', 'thallo-visibility' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( $report['rows'] as $row ) : ?>
						<?php $style = isset( $tone[ $row['status'] ] ) ? $tone[ $row['status'] ] : $tone['error']; ?>
						<tr>
							<td>
								<?php $labels = Thallo_Vis_Runner::STEP_LABELS; ?>
								<strong><?php echo esc_html( isset( $labels[ $row['provider'] ] ) ? $labels[ $row['provider'] ] : $row['provider'] ); ?></strong>
								<?php if ( 'grounded' === $row['slot'] ) : ?>
									<br><span class="description"><?php esc_html_e( 'with search on', 'thallo-visibility' ); ?></span>
								<?php endif; ?>
							</td>
							<td><code><?php echo esc_html( '' !== $row['requested'] ? $row['requested'] : '—' ); ?></code></td>
							<td><code><?php echo esc_html( '' !== $row['answered'] ? $row['answered'] : '—' ); ?></code></td>
							<td>
								<strong style="color:<?php echo esc_attr( $style[0] ); ?>"><?php echo esc_html( $style[1] ); ?></strong>
								<br><span class="description"><?php echo esc_html( $row['detail'] ); ?></span>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
			<p class="description">
				<?php
				printf(
					/* translators: %s: how long ago the check was run. */
					esc_html__( 'Checked %s ago.', 'thallo-visibility' ),
					esc_html( human_time_diff( (int) $report['at'], time() ) )
				);
				?>
			</p>
		<?php endif; ?>
		<?php
	}

	/**
	 * Sends the real report email, filled with sample figures, to whoever is
	 * reading the settings screen.
	 *
	 * The alternative is finding out from a lead, and by then the lead is the
	 * person who did not get it. It goes through exactly the code path a live
	 * report does — same template, same sender, same log — because a test that
	 * proves a different path works proves nothing.
	 */
	public static function handle_test_email() {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to do that.', 'thallo-visibility' ) );
		}

		check_admin_referer( 'thallo_test_email' );

		$to = trim( (string) Thallo_Vis_Settings::get( 'notify_email', '' ) );

		if ( ! is_email( $to ) ) {
			$user = wp_get_current_user();
			$to   = $user ? $user->user_email : '';
		}

		if ( is_email( $to ) ) {
			Thallo_Vis_Leads::send_test( $to );
		}

		wp_safe_redirect( admin_url( 'admin.php?page=thallo-visibility&thallo_tested=1#thallo-mail' ) );
		exit;
	}

	/**
	 * What happened to the last few messages.
	 *
	 * `wp_mail()` returning false was the only warning WordPress gave and nobody
	 * was reading it: the lead landed in the table, the report never left the
	 * building, and every screen said the same thing either way. Now the failure
	 * is on the screen you would go and look at.
	 */
	private static function mail_panel() {
		$entries = Thallo_Vis_Mail::log_entries();
		$via     = '' !== (string) Thallo_Vis_Settings::get( 'resend_key', '' )
			? __( 'Resend', 'thallo-visibility' )
			: __( 'WordPress (wp_mail)', 'thallo-visibility' );
		?>
		<h2 id="thallo-mail"><?php esc_html_e( 'Mail', 'thallo-visibility' ); ?></h2>
		<p style="max-width:46em" class="description">
			<?php
			printf(
				/* translators: 1: how mail is sent, 2: the From address. */
				esc_html__( 'Sending through %1$s, as %2$s. The report is the second half of a trade — somebody gave an address to get it — so it is worth proving it arrives before a lead finds out it does not.', 'thallo-visibility' ),
				'<strong>' . esc_html( $via ) . '</strong>',
				'<code>' . esc_html( Thallo_Vis_Mail::from_address() ) . '</code>'
			);
			?>
		</p>

		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<?php wp_nonce_field( 'thallo_test_email' ); ?>
			<input type="hidden" name="action" value="thallo_test_email">
			<button type="submit" class="button button-secondary"><?php esc_html_e( 'Send myself a test report', 'thallo-visibility' ); ?></button>
			<span class="description"><?php esc_html_e( 'Goes to the notify address, or to your own if that is empty.', 'thallo-visibility' ); ?></span>
		</form>

		<?php if ( $entries ) : ?>
			<table class="widefat striped" style="max-width:60em;margin-top:1em">
				<thead>
					<tr>
						<th><?php esc_html_e( 'When', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'To', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Subject', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Result', 'thallo-visibility' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( array_slice( $entries, 0, 10 ) as $entry ) : ?>
						<tr>
							<td>
								<?php
								printf(
									/* translators: %s: a human-readable interval. */
									esc_html__( '%s ago', 'thallo-visibility' ),
									esc_html( human_time_diff( (int) $entry['at'], time() ) )
								);
								?>
							</td>
							<td><?php echo esc_html( $entry['to'] ); ?></td>
							<td><?php echo esc_html( $entry['subject'] ); ?></td>
							<td>
								<?php if ( ! empty( $entry['ok'] ) ) : ?>
									<strong style="color:#2c7a2c"><?php esc_html_e( 'Accepted', 'thallo-visibility' ); ?></strong>
									<span class="description"><?php echo esc_html( $entry['via'] ); ?></span>
								<?php else : ?>
									<strong style="color:#b32d2e"><?php esc_html_e( 'Failed', 'thallo-visibility' ); ?></strong>
									<br><span class="description"><?php echo esc_html( $entry['error'] ); ?></span>
								<?php endif; ?>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
			<p class="description">
				<?php esc_html_e( '“Accepted” means the sender took the message, not that a human read it. It is the strongest thing any sender can honestly tell you.', 'thallo-visibility' ); ?>
			</p>
		<?php endif; ?>
		<?php
	}

	/**
	 * Which model stands behind each column, and the way out if you disagree.
	 *
	 * Read-only by default, and that is the point of it. A model id typed into a
	 * text field is right on the day it is typed and ages from then on with
	 * nothing on the screen to say so — this installation was still asking a
	 * model from 2024 and printing "this is what ChatGPT says" over the answer.
	 * The list ships with the plugin, is dated, and moves when the plugin is
	 * updated. Anyone who wants a different model can still have one; they just
	 * have to say so rather than inherit it by neglect.
	 */
	private static function models_section( $name, $s ) {
		$auto = ! empty( $s['models_auto'] );
		?>
		<h2><?php esc_html_e( 'Which models we ask', 'thallo-visibility' ); ?></h2>
		<p style="max-width:46em" class="description">
			<?php esc_html_e( 'Each row stands for what that assistant says, and the report prints its name over the number — so the model behind it has to be the generation people are actually talking to.', 'thallo-visibility' ); ?>
			<?php
			printf(
				/* translators: %s: the date the shipped model list was last reviewed. */
				esc_html__( 'The plugin keeps this list and it moves when the plugin is updated; last reviewed %s. Use “Check the models” at the bottom of this page to confirm they still answer.', 'thallo-visibility' ),
				esc_html( Thallo_Vis_Models::REVIEWED )
			);
			?>
		</p>

		<table class="widefat striped" style="max-width:46em;margin-bottom:1em">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Column', 'thallo-visibility' ); ?></th>
					<th><?php esc_html_e( 'Model', 'thallo-visibility' ); ?></th>
					<th><?php esc_html_e( 'With the web open', 'thallo-visibility' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<?php foreach ( array( 'chatgpt', 'claude', 'gemini', 'perplexity' ) as $provider ) : ?>
					<?php
					$memory   = Thallo_Vis_Settings::model_for( $provider );
					$grounded = 'perplexity' === $provider
						? ''
						: Thallo_Vis_Settings::model_for( $provider, 'grounded' );
					$labels   = Thallo_Vis_Runner::STEP_LABELS;
					?>
					<tr>
						<td><strong><?php echo esc_html( isset( $labels[ $provider ] ) ? $labels[ $provider ] : $provider ); ?></strong></td>
						<td>
							<code><?php echo esc_html( '' !== $memory ? $memory : '—' ); ?></code>
							<?php if ( 'perplexity' === $provider ) : ?>
								<br><span class="description"><?php esc_html_e( 'Live retrieval in the second half — it searches by default, which is why it is here rather than above.', 'thallo-visibility' ); ?></span>
							<?php endif; ?>
						</td>
						<td>
							<?php if ( '' === $grounded ) : ?>
								<span class="description">—</span>
							<?php elseif ( empty( $s['grounded_enabled'] ) ) : ?>
								<span class="description"><?php esc_html_e( 'off', 'thallo-visibility' ); ?></span>
							<?php else : ?>
								<code><?php echo esc_html( $grounded . ':online' ); ?></code>
							<?php endif; ?>
						</td>
					</tr>
				<?php endforeach; ?>
			</tbody>
		</table>

		<details <?php echo $auto ? '' : 'open'; ?>>
			<summary style="cursor:pointer;margin-bottom:1em"><?php esc_html_e( 'Advanced — choose the model ids yourself, or use the providers directly', 'thallo-visibility' ); ?></summary>

			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?php esc_html_e( 'Model list', 'thallo-visibility' ); ?></th>
					<td>
						<label>
							<input type="checkbox" name="<?php echo esc_attr( $name ); ?>[models_auto]" value="1" <?php checked( $auto, true ); ?>>
							<?php esc_html_e( 'Use the models that ship with the plugin (recommended)', 'thallo-visibility' ); ?>
						</label>
						<p class="description"><?php esc_html_e( 'Untick to use the ids below instead. They are then yours to keep current — nothing else will update them, and a retired id shows up as a column the report cannot measure.', 'thallo-visibility' ); ?></p>
					</td>
				</tr>
			</table>

			<h3><?php esc_html_e( 'Your own ids, through OpenRouter', 'thallo-visibility' ); ?></h3>
			<table class="form-table" role="presentation">
				<?php
				self::text_field( $name, 'or_model_chatgpt', $s, __( 'ChatGPT model', 'thallo-visibility' ) );
				self::text_field( $name, 'or_model_claude', $s, __( 'Claude model', 'thallo-visibility' ) );
				self::text_field( $name, 'or_model_gemini', $s, __( 'Gemini model', 'thallo-visibility' ) );
				self::text_field( $name, 'or_model_perplexity', $s, __( 'Perplexity model', 'thallo-visibility' ), __( 'Must be a model that searches the web.', 'thallo-visibility' ) );
				?>
			</table>

			<h3><?php esc_html_e( 'Your own ids, with the web open', 'thallo-visibility' ); ?></h3>
			<table class="form-table" role="presentation">
				<?php
				self::text_field( $name, 'gr_model_chatgpt', $s, __( 'ChatGPT model', 'thallo-visibility' ), __( 'Same ids as above by default, on purpose: the finding is the gap between the two readings, and a gap measured across two different models is partly a difference between the models.', 'thallo-visibility' ) );
				self::text_field( $name, 'gr_model_claude', $s, __( 'Claude model', 'thallo-visibility' ) );
				self::text_field( $name, 'gr_model_gemini', $s, __( 'Gemini model', 'thallo-visibility' ) );
				?>
			</table>

			<h3><?php esc_html_e( 'Native keys', 'thallo-visibility' ); ?></h3>
			<p style="max-width:46em" class="description">
				<?php esc_html_e( 'Only used when “Native” is selected at the top of this page. Four accounts to keep working instead of one, in exchange for slightly cheaper tokens.', 'thallo-visibility' ); ?>
			</p>
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
		</details>
		<?php
	}

	/**
	 * Everyone who wrote in through the site.
	 *
	 * Separate from Leads on purpose: a lead is somebody who ran a scan and
	 * traded an address for the rest of it, an enquiry is somebody who asked a
	 * question. Reading them in one table would mean sorting the people who want
	 * something from the people who were curious, every morning, by hand.
	 *
	 * The reply column is the point of the screen. If our automatic answer never
	 * left, this is where that shows — before the person concludes we ignored
	 * them.
	 */
	public static function enquiries_page() {
		$rows = Thallo_Vis_Enquiries::all();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Enquiries', 'thallo-visibility' ); ?></h1>

			<p style="max-width:46em">
				<?php esc_html_e( 'Everybody who wrote to us through the contact form or a plan enquiry. Each one was answered automatically with a note saying a person would come back within a working day — the last column says whether that note actually left.', 'thallo-visibility' ); ?>
			</p>

			<table class="widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Date', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Who', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Interested in', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Message', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Our reply', 'thallo-visibility' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $rows ) ) : ?>
						<tr><td colspan="5"><?php esc_html_e( 'Nobody has written in yet.', 'thallo-visibility' ); ?></td></tr>
					<?php else : ?>
						<?php foreach ( $rows as $row ) : ?>
							<tr>
								<td><?php echo esc_html( $row['created_at'] ); ?></td>
								<td>
									<strong><?php echo esc_html( $row['name'] ? $row['name'] : '—' ); ?></strong>
									<?php if ( $row['company'] ) : ?>
										<br><span class="description"><?php echo esc_html( $row['company'] ); ?></span>
									<?php endif; ?>
									<br><a href="mailto:<?php echo esc_attr( $row['email'] ); ?>"><?php echo esc_html( $row['email'] ); ?></a>
								</td>
								<td><?php echo esc_html( $row['plans'] ? $row['plans'] : '—' ); ?></td>
								<td style="max-width:28em"><?php echo esc_html( $row['message'] ); ?></td>
								<td>
									<?php if ( 'sent' === $row['mail_status'] ) : ?>
										<span style="color:#2c7a2c"><?php esc_html_e( 'Sent', 'thallo-visibility' ); ?></span>
									<?php elseif ( 'failed' === $row['mail_status'] ) : ?>
										<strong style="color:#b32d2e"><?php esc_html_e( 'Never left', 'thallo-visibility' ); ?></strong>
										<br><span class="description"><?php echo esc_html( $row['mail_error'] ); ?></span>
									<?php else : ?>
										<span class="description"><?php esc_html_e( 'not recorded', 'thallo-visibility' ); ?></span>
									<?php endif; ?>
								</td>
							</tr>
						<?php endforeach; ?>
					<?php endif; ?>
				</tbody>
			</table>
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
						<th><?php esc_html_e( 'Report email', 'thallo-visibility' ); ?></th>
						<th><?php esc_html_e( 'Monitor', 'thallo-visibility' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php if ( empty( $leads ) ) : ?>
						<tr><td colspan="9"><?php esc_html_e( 'Nobody has unlocked a report yet.', 'thallo-visibility' ); ?></td></tr>
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
									/* Four states, and they are four different
									   problems: sent, refused (with the reason),
									   switched off, and a row from before this
									   was recorded at all. Collapsing the last
									   into "not sent" would invent a failure. */
									$status = isset( $lead['mail_status'] ) ? $lead['mail_status'] : '';

									if ( 'sent' === $status ) {
										echo esc_html__( 'Sent', 'thallo-visibility' );
										if ( ! empty( $lead['mail_sent_at'] ) ) {
											echo '<br><span class="description">' . esc_html( $lead['mail_sent_at'] ) . '</span>';
										}
									} elseif ( 'failed' === $status ) {
										echo '<strong>' . esc_html__( 'Failed', 'thallo-visibility' ) . '</strong>';
										if ( ! empty( $lead['mail_error'] ) ) {
											echo '<br><span class="description">' . esc_html( $lead['mail_error'] ) . '</span>';
										}
									} elseif ( 'off' === $status ) {
										echo esc_html__( 'Not sent — the setting was off', 'thallo-visibility' );
									} else {
										echo esc_html__( 'Not recorded', 'thallo-visibility' );
									}
									?>
									<br>
									<?php self::mail_button( __( 'Send it again', 'thallo-visibility' ), (int) $lead['id'] ); ?>
								</td>
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
