import Script from 'next/script';

/**
 * Cloudflare Web Analytics, and nothing else.
 *
 * The choice of vendor is a privacy commitment before it is a measurement one.
 * /privacy/ promises no tracking cookie and no profile, and that promise is
 * worth more to an agency selling trust than a funnel report is — so the
 * measurement had to fit the policy rather than the policy bend to the
 * measurement. This beacon sets no cookie, writes no localStorage, and reports
 * page views in aggregate with no cross-site identifier. Clause 4 of the policy
 * describes exactly this and must be changed with it.
 *
 * GA4 was the obvious alternative and was rejected: it sets `_ga`, which would
 * have made clause 4 false and pulled a consent banner in behind it.
 *
 * Token, not a boolean. Unset — every local build, every preview, the GitHub
 * Pages mirror — this renders nothing at all, so the mirror cannot pollute the
 * real site's numbers and a developer cannot accidentally log their own
 * clicking around as traffic.
 */
const BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;

export default function Analytics() {
  if (!BEACON_TOKEN) return null;

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token: BEACON_TOKEN })}
    />
  );
}
