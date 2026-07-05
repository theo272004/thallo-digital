'use client';

import { gsap, useGSAP, ScrollTrigger, EASE, DUR, STAGGER, prefersReducedMotion } from '@/lib/gsap';

/**
 * Batches every [data-reveal] element on the page into a staggered fade+rise,
 * once, as it enters the viewport. Call once from the page root; pass a `dep`
 * (e.g. the current view) so it re-runs and re-scans when the view swaps.
 * Reduced-motion → everything shown instantly.
 */
export function useRevealBatch(dep?: unknown) {
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      if (!items.length) return;

      if (prefersReducedMotion()) {
        gsap.set(items, { autoAlpha: 1, y: 0 });
        return;
      }

      // Pre-hide so items don't flash before their batch fires.
      gsap.set(items, { autoAlpha: 0, y: 26 });

      ScrollTrigger.batch(items, {
        start: 'top 88%',
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            autoAlpha: 1,
            y: 0,
            duration: DUR.reveal,
            ease: EASE.out,
            stagger: STAGGER,
            overwrite: true,
          }),
      });

      // Recalculate after fonts settle.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
    },
    { dependencies: [dep], revertOnUpdate: true }
  );
}
