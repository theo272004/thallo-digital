'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import CookieBanner from '@/components/CookieBanner';
import { CONSENT_EVENT, readConsent, writeConsent, type Consent } from '@/lib/consent';

/**
 * GA4, baked in at build time.
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
 * build with no `NEXT_PUBLIC_GA_ID` returns null below and the banner never
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

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
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

  if (!GA_ID) return null;

  return (
    <>
      {/* The only place googletagmanager.com is named. Declined or unanswered,
          these do not render, no request is made and no cookie is set. */}
      {'granted' === consent && (
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
