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

      // A jump past an item skips its batch (see `whenPassed`). When the
      // scroll comes to rest, anything still hidden that is no longer below
      // the fold is shown — quickly, since the reader is already there.
      const sweep = () => {
        const missed = items.filter(
          (el) => el.style.visibility === 'hidden' && el.getBoundingClientRect().top < window.innerHeight
        );
        if (missed.length) gsap.to(missed, { autoAlpha: 1, y: 0, duration: 0.4, ease: EASE.out, overwrite: true });
      };
      ScrollTrigger.addEventListener('scrollEnd', sweep);

      // Recalculate after fonts settle.
      document.fonts?.ready.then(() => ScrollTrigger.refresh());

      return () => ScrollTrigger.removeEventListener('scrollEnd', sweep);
    },
    { dependencies: [dep], revertOnUpdate: true }
  );
}
