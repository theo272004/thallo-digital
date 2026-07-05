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

    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(update);
      instance.destroy();
      lenis = null;
    };
  }, []);

  return <>{children}</>;
}
