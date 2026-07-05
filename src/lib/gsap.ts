// Single registration point for GSAP + plugins. Import gsap ONLY from here in
// client components so plugins are registered first. The free GSAP 3.13+ package
// ships every plugin (ScrollTrigger, SplitText, …) under 'gsap/*'.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

// Guard for Next.js static export / SSR pre-render (no window).
if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });
  gsap.defaults({ ease: 'power3.out', duration: 0.9 });
}

// Shared motion tokens — calm, editorial, Ramp-like restraint.
export const EASE = {
  out: 'expo.out',
  quint: 'power4.out',
  inOut: 'expo.inOut',
} as const;

export const DUR = { hover: 0.25, reveal: 0.8, big: 1.0 } as const;
export const STAGGER = 0.1;

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isTouch(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
