'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';

type Props = {
  children: ReactNode;
  /** Kept for API compatibility; no longer used. */
  strength?: number;
  className?: string;
};

/**
 * A subtle hover lift on the wrapped CTA — a gentle scale, NOT cursor-following
 * (the cursor-tracking version was removed per design preference). Fine-pointer
 * devices only.
 */
export function Magnetic({ children, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      if (prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      const scaleTo = gsap.quickTo(el, 'scale', { duration: 0.3, ease: 'power3.out' });
      const enter = () => scaleTo(1.04);
      const leave = () => scaleTo(1);
      el.addEventListener('pointerenter', enter);
      el.addEventListener('pointerleave', leave);
      return () => {
        el.removeEventListener('pointerenter', enter);
        el.removeEventListener('pointerleave', leave);
      };
    },
    { scope: ref }
  );
  return (
    <span ref={ref} className={className} style={{ display: 'inline-flex', willChange: 'transform' }}>
      {children}
    </span>
  );
}
