'use client';

import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion, whenPassed } from '@/lib/gsap';

type Props = {
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
};

/** Counts up from 0 → `to` once in view. Tabular figures avoid width jitter. */
export function Counter({ to, prefix = '', suffix = '', decimals = 0, duration = 1.6, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      const fmt = (v: number) =>
        prefix +
        v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) +
        suffix;

      // The markup ships the FINAL figure so JS-less crawlers never read a zero.
      if (prefersReducedMotion()) return;
      // useGSAP runs in the layout phase, so rewinding to zero here happens
      // before paint — no flash of the real number snapping back to 0.
      el.textContent = fmt(0);
      const obj = { val: 0 };
      const count = gsap.to(obj, {
        val: to,
        duration,
        ease: 'power2.out',
        snap: { val: decimals ? 1 / 10 ** decimals : 1 },
        onUpdate: () => {
          el.textContent = fmt(obj.val);
        },
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
      // Jumped past, it would read 0 for good. See `whenPassed`.
      return whenPassed(el, () => count.play());
    },
    { scope: ref }
  );
  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {/* The real figure, as the comment above promises: a crawler or an
          agent reading the HTML must never be told the figure is zero. */}
      {prefix}
      {to.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}
