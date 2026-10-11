/**
 * Whether this visitor has agreed to be counted.
 *
 * The site ran Google Analytics from the first byte of every page. That is the
 * default almost everywhere and it is the wrong one: under the GDPR and the
 * ePrivacy directive an analytics cookie needs permission BEFORE it is set, not
 * an opt-out afterwards, and the schema on the home page says `areaServed:
 * Worldwide`. Colombia's Ley 1581 asks for authorisation too. So the tag now
 * waits.
 *
 * ── Why there is no Consent Mode here ───────────────────────────────────────
 * Google's answer to this is Consent Mode v2: load the tag anyway, tell it
 * `analytics_storage: denied`, and let it send cookieless pings it models
 * behaviour from. It is defensible and it is what most sites do. This does the
 * stricter thing instead — until someone says yes, googletagmanager.com is not
 * contacted at all — because it is the version that is simple to explain on the
 * privacy page and impossible to get subtly wrong. The cost is that declined
 * visitors are invisible rather than modelled, which for a site this size is
 * not a real cost.
 *
 * ── Why localStorage and not a cookie ───────────────────────────────────────
 * The choice never needs to reach the server: this is a static export and the
 * decision is acted on in the browser, by rendering the tag or not. A cookie
 * would be sent on every request to no purpose. Note that this makes the site's
 * only use of localStorage, which the privacy page says out loud.
 */

export type Consent = 'granted' | 'denied';

const KEY = 'thallo:analytics-consent';

/**
 * Fired on the window when the choice changes, so the banner and the tag can
 * live in different components without one having to own the other.
 *
 * `storage` would not do: the browser fires that only in OTHER tabs, never in
 * the one that wrote the value.
 */
export const CONSENT_EVENT = 'thallo:consent';

/**
 * The stored choice, or null if there is not one yet.
 *
 * Wrapped because a browser in private mode, or one set to block site data,
 * throws on access rather than returning nothing — and an exception here would
 * take the whole page down over a cookie banner. An unreadable store means "not
 * asked yet", which shows the banner again; that is the safe way round.
 */
export function readConsent(): Consent | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Delete the cookies Google Analytics has already set.
 *
 * Withdrawing consent has to actually withdraw it. Not rendering the tag stops
 * anything new, but `_ga` and `_ga_<STREAM>` were written on the accepted visit
 * and would sit in the browser for two years afterwards — still identifying the
 * same browser the moment consent was ever given again. Turning it off has to
 * mean the identifier is gone, not dormant.
 *
 * Both the bare host and the dot-prefixed parent are tried, because that is how
 * gtag sets them (`.thallodigital.com`) and a cookie can only be deleted with
 * the domain and path it was written with. Expiring a cookie that does not
 * exist is a no-op, so trying every combination is safe and is cheaper than
 * guessing right.
 */
function dropAnalyticsCookies(): void {
  const names = document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((n) => '_ga' === n || n.startsWith('_ga_') || n.startsWith('_gid'));

  const host = window.location.hostname;
  /* '' means "whatever the cookie was written with" and covers the host-only
     case; the other two cover the shared-across-subdomains case. */
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`];

  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}

/** Record the choice and tell the rest of the page about it. */
export function writeConsent(value: Consent): void {
  /* Before the event, so that anything re-rendering on the back of it is
     already looking at a browser with no analytics cookies in it. */
  if ('denied' === value) {
    dropAnalyticsCookies();
  }

  try {
    window.localStorage.setItem(KEY, value);
  } catch {
    /* Blocked. The choice still applies for this page view — the event below
       carries it — it just will not survive a reload. Better than refusing to
       accept an answer we cannot file. */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}
