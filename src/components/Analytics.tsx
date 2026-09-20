'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

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
 */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

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
    if (!GA_ID) return;

    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    window.gtag?.('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  if (!GA_ID) return null;

  return (
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
  );
}
