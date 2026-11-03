'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import CookieBanner from '@/components/CookieBanner';
import { CONSENT_EVENT, readConsent, writeConsent, type Consent } from '@/lib/consent';

/**
 * GA4 and Microsoft Clarity, baked in at build time.
 *
 * This is a static export, so there is no server to read an environment
 * variable at request time — `NEXT_PUBLIC_GA_ID` is substituted into the bundle
 * by `next build` and nothing else. Two consequences:
 *
 *  · Changing the property means rebuilding and redeploying.
 *  · A build without the variable ships no tag at all. That is the point. Local
 *    development and the GitHub Pages mirror both run without it, so neither
 *    pollutes the property with traffic that is not the real site.
 *
 * ── Nothing loads until someone says yes ────────────────────────────────────
 * This component also owns the consent question, because the two facts are the
 * same fact: there is a banner exactly when there is a tag to consent to. A
 * build with neither `NEXT_PUBLIC_GA_ID` nor `NEXT_PUBLIC_CLARITY_ID` returns
 * null below and the banner never
 * renders — no cookie notice on a site that sets no cookies, which is the
 * other way of lying about this.
 *
 * The reasoning behind refusing to load the tag at all — rather than loading it
 * in Consent Mode's denied state — is in `src/lib/consent.ts`.
 */
/* Exported so the privacy page's consent control can ask the same question
   this file answers — is there a tag on this build at all — rather than
   re-reading the variable and drifting from it. */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

/**
 * Microsoft Clarity — heatmaps and session recordings. Same rules as GA: baked
 * in at build time, set only by the Bluehost workflow, and behind the same
 * consent. One question covers both tags; the banner names both.
 */
export const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID ?? '';

/** Is there any tag on this build to ask about? The banner exists exactly when this is true. */
export const HAS_ANALYTICS = Boolean(GA_ID || CLARITY_ID);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export default function Analytics() {
  const pathname = usePathname();
  const mounted = useRef(false);

  /**
   * `undefined` while the answer is still unknown, which is every render on the
   * server and the first one in the browser. It matters: rendering the banner
   * straight away would flash it at everyone who already answered, and
   * `localStorage` cannot be read until the component is mounted. So the first
   * paint shows neither the tag nor the banner, and the effect below decides.
   */
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);

  useEffect(() => {
    const sync = () => setConsent(readConsent());
    sync();

    /* Same tab: the privacy page's withdraw button dispatches this.
       Other tabs: `storage`, which fires everywhere except where it was
       written. Both, so a choice made anywhere takes effect everywhere. */
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  /**
   * A page view per client-side navigation. Dormant today, on purpose.
   *
   * `gtag('config', …)` reports the page the browser loaded and then nothing
   * more — it cannot see the router move. Right now the router never does:
   * this codebase writes every internal link as a plain `<a href>` (44 of them,
   * `${BASE}/…` from `src/lib/site.ts`) and imports `next/link` nowhere, so
   * every navigation is a real document load and every load reports itself.
   *
   * Which is exactly why this stays. The day someone reaches for `<Link>` —
   * and it is the obvious thing to reach for — page views would quietly stop
   * being counted past the landing page, and nothing would fail loudly enough
   * to notice. Twelve lines to make that a non-event.
   *
   * The first run is skipped because `config` has already reported it.
   */
  useEffect(() => {
    if (!GA_ID || consent !== 'granted') return;

    /* Also the guard for consent given mid-visit: the tag mounts at that
       moment and its own `config` call reports the page, so this skips one. */
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    window.gtag?.('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, consent]);

  if (!HAS_ANALYTICS) return null;

  return (
    <>
      {/* The only place googletagmanager.com is named. Declined or unanswered,
          these do not render, no request is made and no cookie is set. */}
      {GA_ID && 'granted' === consent && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', {
                allow_google_signals: false,
                allow_ad_personalization_signals: false
              });
            `}
          </Script>
        </>
      )}

      {/* Microsoft's own snippet, verbatim but for the ID. The consentv2 call
          tells Clarity the visitor said yes — without it, Clarity treats EEA
          visitors as unconsented and runs cookieless. Ads stay denied: the
          banner promises no advertising, and Clarity has no business there. */}
      {CLARITY_ID && 'granted' === consent && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
            window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' });
          `}
        </Script>
      )}

      {/* Only when the answer is a known absence. `undefined` is "not read
          yet" and must not show anything. */}
      {null === consent && (
        <CookieBanner
          onChoice={(value) => {
            writeConsent(value);
            setConsent(value);
          }}
        />
      )}
    </>
  );
}
