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

/**
 * True in a browser driven by automation — Playwright, Puppeteer, Selenium,
 * and the AI agents built on them, which all set `navigator.webdriver`.
 *
 * An agent reads the page from screenshots and the accessibility tree, and it
 * scrolls in jumps. Every entrance on this site starts hidden and waits for a
 * scroll to cross it, so an agent's screenshot catches headings mid-slide and
 * cards at opacity 0. The motion is for people; a machine is better served by
 * the page at rest.
 */
export function isAutomated(): boolean {
  return typeof navigator !== 'undefined' && navigator.webdriver === true;
}

/**
 * Whether to skip motion: the visitor asked for less of it, or the visitor is
 * a machine (see `isAutomated`). Every motion primitive already checks this,
 * so answering yes here gives an agent the finished page — no smooth-scroll
 * hijack, no hidden entrances, final figures — with no change to each of them.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return true;
  return isAutomated() || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Runs `play` once the reader is level with `el` or past it, however they got
 * there.
 *
 * A ScrollTrigger entrance plays when the scroll *crosses* its start. A jump
 * that lands beyond it — the End key, an anchor link, `scrollIntoView`, an
 * agent scrolling to the pricing table — skips the crossing, and everything it
 * jumped over stays hidden above the viewport for good: measured on the home
 * page, 31 blocks of text including the prices. So each entrance also listens
 * for the scroll coming to rest and plays if its element is no longer below
 * the fold. `play` must be safe to call twice; a finished tween's is.
 *
 * Returns the cleanup, for useGSAP's.
 */
export function whenPassed(el: Element, play: () => void): () => void {
  const check = () => {
    if (el.getBoundingClientRect().top < window.innerHeight) play();
  };
  ScrollTrigger.addEventListener('scrollEnd', check);
  return () => ScrollTrigger.removeEventListener('scrollEnd', check);
}

export function isTouch(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

export { gsap, ScrollTrigger, SplitText, useGSAP };
