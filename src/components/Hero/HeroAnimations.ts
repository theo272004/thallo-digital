import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHeroAnimations(
  container: HTMLElement,
  phone: HTMLElement,
  cards: HTMLElement[],
  onScrollStep: (step: number) => void
) {
  // 1. Phone rising translation on scroll
  gsap.to(phone, {
    y: -80,
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    }
  });

  // 2. Parallax card translation on scroll (reorganize cards slightly)
  cards.forEach((card, idx) => {
    if (card) {
      const speed = (idx + 1) * -30;
      gsap.to(card, {
        y: speed,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    }
  });

  // 3. ScrollTrigger to update simulation steps based on scroll progress
  ScrollTrigger.create({
    trigger: container,
    start: 'top top',
    end: 'bottom 40%',
    scrub: true,
    onUpdate: (self) => {
      // Map progress (0 to 1) to step index (1 to 6)
      const currentStep = Math.min(Math.floor(self.progress * 6) + 1, 6);
      onScrollStep(currentStep);
    }
  });
}

// 4. Subtle, slow float animation loop for the phone and cards
export function playFloatingLoop(phone: HTMLElement) {
  gsap.to(phone, {
    y: '+=6px',
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
  });
}
