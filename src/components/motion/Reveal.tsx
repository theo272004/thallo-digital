'use client';

import { useRef, type ElementType, type ReactNode, type CSSProperties } from 'react';
import { gsap, useGSAP, EASE, DUR, STAGGER, prefersReducedMotion } from '@/lib/gsap';

type Props = {
  as?: ElementType;
  /** If true, animate the element's DIRECT children with a stagger instead of itself. */
  stagger?: boolean;
  y?: number;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  id?: string;
  children: ReactNode;
};

/**
 * Fade + rise on scroll into view, once. With `stagger`, its direct children
 * animate in sequence (for card grids). Reduced-motion → instant final state.
 */
export function Reveal({ as: Tag = 'div', stagger = false, y = 28, delay = 0, className, style, id, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      const targets = stagger ? (Array.from(el.children) as HTMLElement[]) : el;
      if (prefersReducedMotion()) {
        gsap.set(targets, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        targets,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration: DUR.reveal,
          ease: EASE.out,
          delay,
          stagger: stagger ? STAGGER : 0,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        }
      );
    },
    { scope: ref }
  );
  return (
    <Tag ref={ref as never} id={id} className={className} style={style}>
      {children}
    </Tag>
  );
}
