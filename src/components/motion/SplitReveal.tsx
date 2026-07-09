'use client';

import { useRef, type ElementType, type CSSProperties } from 'react';
import { gsap, useGSAP, SplitText, EASE, prefersReducedMotion } from '@/lib/gsap';

type Props = {
  as?: ElementType;
  /** Heading HTML — inline markup (spans/em) is preserved. */
  html: string;
  scroll?: boolean;
  /** Animate opacity too. Leave FALSE for the LCP hero H1 (masked, transform-only). */
  fade?: boolean;
  id?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Masked, line-by-line slide-up for headings — the signature reveal.
 * GSAP 3.13 SplitText: built-in line masks, autoSplit re-splitting on font
 * load / resize, aria:'auto' so screen readers & SEO keep intact text.
 */
export function SplitReveal({ as: Tag = 'h2', html, scroll = true, fade = true, id, className, style }: Props) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const el = ref.current!;
      if (prefersReducedMotion()) return; // stays visible

      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        aria: 'auto',
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            ...(fade ? { opacity: 0 } : {}),
            duration: 1,
            ease: EASE.quint,
            stagger: 0.12,
            scrollTrigger: scroll ? { trigger: el, start: 'top 85%', once: true } : undefined,
            // Once the entrance finishes, revert the split so the resting heading
            // is the original element again. The line masks use overflow:clip
            // sized to the (tight) line-height, which otherwise permanently clips
            // glyph descenders (g, y, p, j). Reverting removes the masks so
            // descenders render fully — across every heading on the page.
            onComplete: () => self.revert(),
          }),
      });
    },
    { scope: ref }
  );
  return <Tag ref={ref as never} id={id} className={className} style={style} dangerouslySetInnerHTML={{ __html: html }} />;
}
