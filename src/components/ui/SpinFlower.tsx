'use client';

import React, { useEffect, useRef } from 'react';
import { BASE } from '@/lib/site';

/**
 * The turning isotipo, but you can grab it and flick it.
 *
 * It used to be a CSS keyframe, which can be watched and nothing more. The
 * rotation is driven by a rAF loop now, so a drag can push angular velocity
 * into it and friction can bleed that back down to the idle drift — throw it
 * and it spins fast, coasts, and settles into the same slow turn it had
 * before. Nothing about the resting state changed.
 *
 * The angle lives in a ref and is written straight to the transform: putting
 * it in state would re-render this on every frame for no benefit.
 */

type Props = {
  /** Layout classes — size, position, opacity. They land on the wrapper, so
   *  a caller's own `translate` never fights the rotation transform. */
  className?: string;
  /** Seconds per turn at rest. */
  secondsPerTurn?: number;
  alt?: string;
};

const SRC = `${BASE}/flower.webp`;

export default function SpinFlower({ className = '', secondsPerTurn = 30, alt = '' }: Props) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const IDLE = 360 / secondsPerTurn;   // deg/s at rest
    const FRICTION = 1.1;                // how fast a throw bleeds back to IDLE
    const MAX = 2200;                    // deg/s ceiling, so a hard flick stays legible

    let angle = 0;
    let velocity = IDLE;
    let raf = 0;
    let last = 0;

    // Drag bookkeeping
    let dragging = false;
    let pointerId = -1;
    let lastPointerAngle = 0;
    let lastMoveAt = 0;

    /** Pointer angle around the element's centre, in degrees. */
    const angleFrom = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * (180 / Math.PI);
    };

    /** Shortest way round, so crossing the ±180 seam doesn't read as a jump. */
    const shortest = (d: number) => ((d + 540) % 360) - 180;

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp: a backgrounded tab
      last = now;                                     // must not bank up rotation

      if (!dragging) {
        // Exponential decay towards the idle speed — no abrupt stop, and it
        // never falls below the drift it started with.
        velocity += (IDLE - velocity) * (1 - Math.exp(-FRICTION * dt));
        angle += velocity * dt;
        img.style.transform = `rotate(${angle}deg)`;
      }

      raf = requestAnimationFrame(frame);
    };

    const onDown = (e: PointerEvent) => {
      // Touch is left alone: claiming the gesture here would mean a finger
      // that happens to land on the flower can no longer scroll the page.
      if (e.pointerType === 'touch') return;

      dragging = true;
      pointerId = e.pointerId;
      lastPointerAngle = angleFrom(e);
      lastMoveAt = performance.now();
      velocity = 0;
      // Capture keeps the drag alive once the cursor leaves the flower, which
      // it always does — you throw it by swinging past the edge. It can refuse
      // for a pointer the browser no longer considers active; the drag still
      // works within bounds, so that is not worth failing the handler over.
      try { wrap.setPointerCapture(e.pointerId); } catch { /* not capturable */ }
      wrap.style.cursor = 'grabbing';
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;

      const now = performance.now();
      const current = angleFrom(e);
      const delta = shortest(current - lastPointerAngle);
      const dt = Math.max((now - lastMoveAt) / 1000, 1 / 240);

      angle += delta;
      // Smoothed, or a single jittery sample at release decides the throw.
      velocity = velocity * 0.6 + (delta / dt) * 0.4;

      lastPointerAngle = current;
      lastMoveAt = now;
      img.style.transform = `rotate(${angle}deg)`;
    };

    const onUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      pointerId = -1;
      wrap.style.cursor = 'grab';

      // A pointer held still before release should let go, not fling.
      if (performance.now() - lastMoveAt > 120) velocity = IDLE;
      velocity = Math.max(-MAX, Math.min(MAX, velocity));
    };

    wrap.addEventListener('pointerdown', onDown);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerup', onUp);
    wrap.addEventListener('pointercancel', onUp);

    last = performance.now();
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      wrap.removeEventListener('pointerdown', onDown);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerup', onUp);
      wrap.removeEventListener('pointercancel', onUp);
    };
  }, [secondsPerTurn]);

  return (
    <span
      ref={wrapRef}
      /* No display utility of its own: the compare mark passes `hidden lg:block`
         and a base `inline-block` would be a coin toss between them, since
         same-group Tailwind utilities are settled by stylesheet order rather
         than by the order they appear in the attribute. */
      className={`cursor-grab touch-pan-y ${className}`}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      <img
        ref={imgRef}
        src={SRC}
        alt={alt}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="h-full w-full select-none object-contain"
        style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
      />
    </span>
  );
}
