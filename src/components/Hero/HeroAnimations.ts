import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Gentle scroll parallax for the hero phone: it drifts up slightly as you
 * scroll. This is the ONLY transform driver on the phone wrapper — no infinite
 * float loop — so it never trembles.
 */
export function initHeroAnimations(container: HTMLElement, phone: HTMLElement, _cards: HTMLElement[]) {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.to(phone, {
    y: -48,
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5,
    },
  });
}
