'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion, isTouch } from '@/lib/gsap';

// Module-level instance so nav/anchor helpers can drive it, with a native
// fallback when smooth scroll is disabled (reduced-motion / touch).
let lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenis;
}

/** Smoothly scroll to an element/selector, clearing the sticky header. */
export function scrollToEl(target: string | HTMLElement, offset = -80): void {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.2 });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: 'smooth' });
}

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Respect reduced-motion; keep native momentum on touch.
    if (prefersReducedMotion() || isTouch()) return;

    const instance = new Lenis({
      autoRaf: false, // we drive raf from gsap.ticker (one shared loop)
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
    });
    lenis = instance;
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      (window as unknown as { __lenis?: Lenis }).__lenis = instance;
    }

    instance.on('scroll', ScrollTrigger.update);

    const update = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    /* Lenis measures the page once and re-measures when its own ResizeObserver
       fires. That observer watches `document.documentElement` — and this site
       sets `h-full` on <html>, so its box is exactly the viewport and never
       changes size however much content is added below it. The observer
       therefore never fires, and Lenis clamps every wheel to a scroll limit it
       worked out at first paint.

       That is not theoretical. On the scan page, moving from step 1 to step 2
       takes the document from 989px to 1509px: the real limit becomes 574px and
       Lenis stays on 54, so the page scrolls fifty pixels and stops dead. Every
       later stage is worse — the full report is several thousand pixels of a
       page Lenis believes is one screen tall.

       <body> is the element that actually grows (`min-h-full`, not `h-full`),
       so it is the one worth watching. Anything that changes the height of the
       page, on any route, now re-measures.  */
    const remeasure = new ResizeObserver(() => instance.resize());
    remeasure.observe(document.body);

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    ScrollTrigger.refresh();

    return () => {
      remeasure.disconnect();
      gsap.ticker.remove(update);
      instance.destroy();
      lenis = null;
    };
  }, []);

  return <>{children}</>;
}
