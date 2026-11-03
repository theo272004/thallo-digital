'use client';

import React, { useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap';
import { BASE } from '@/lib/site';

/**
 * The introduction video, straight under the hero.
 *
 * The same object as the old case-film banner (src/components/VideoSection):
 * the desk photograph, a flat scrim, the white play disc. Larger here, and
 * centred, because it is the second thing on the page rather than a stop in
 * the middle of it.
 *
 * ## The entrance
 *
 * The hero takes the whole first screen, so on arrival there is only the
 * headline. As the frame comes up from the bottom of the screen it grows
 * from small and faint to full size, tied to the scroll itself: it moves
 * exactly as fast as the reader does, and scrolling back runs it in reverse.
 * The first version was a timed pop with an overshoot; Cami asked for
 * something more fluid. Reduced motion skips it.
 *
 * ## The video
 *
 * `VIDEO_URL` is the 59 s introduction ("The call"), served from this site at
 * public/video/thallo-intro.mp4 — a web encode (~8 MB, H.264, faststart) of
 * the promo master. It is
 * written as a site path under `BASE`, so the GitHub Pages mirror and Bluehost
 * each play their own copy. A YouTube link (watch, youtu.be, shorts or embed)
 * or a full .mp4/.webm address works here too; empty brings back the
 * "Video coming soon." poster.
 *
 * The frame is 16:9 because the film is: at the earlier 16/8.5 (and 16/10 on
 * phones) the playing video sat between black bars.
 */
const VIDEO_URL = `${BASE}/video/thallo-intro.mp4`;

type Source = { kind: 'youtube'; id: string } | { kind: 'file'; src: string };

function readSource(raw: string): Source | null {
  if (!raw.trim()) return null;
  // A path on this site: no host to read, only the extension.
  if (raw.trim().startsWith('/')) return /\.(mp4|webm)$/i.test(raw.trim()) ? { kind: 'file', src: raw.trim() } : null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/^(www\.|m\.)/, '');
  let id = '';
  if (host === 'youtu.be') id = url.pathname.split('/')[1] ?? '';
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v') ?? (/^\/(embed|shorts)\//.test(url.pathname) ? url.pathname.split('/')[2] ?? '' : '');
  }
  if (/^[A-Za-z0-9_-]{11}$/.test(id)) return { kind: 'youtube', id };
  if (/\.(mp4|webm)$/i.test(url.pathname)) return { kind: 'file', src: url.href };
  return null;
}

const SOURCE = readSource(VIDEO_URL);

export default function HomeVideo() {
  const [playing, setPlaying] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!frameRef.current || prefersReducedMotion()) return;
      /* Desktop only. On a phone the scrubbed entrance made the page catch
         under the thumb (Cami, 3 November), so there the video simply sits
         in the page. */
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
      gsap.fromTo(
        frameRef.current,
        { autoAlpha: 0, scale: 0.78, y: 120 },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          ease: 'power2.out',
          /* From the moment the frame's top edge clears the bottom of the
             screen until it is a third of the way up. `scrub: 0.8` lets the
             frame catch up over a beat instead of locking to the wheel, which
             is what keeps it soft. */
          scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'top 30%', scrub: 0.8 },
        }
      );
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-white pb-20 2xl:pb-28 border-b border-gray-100" id="intro-video" aria-label="An introduction to Thallo">
      <div className="max-w-[90rem] xl:max-w-[min(90rem,80vw)] mx-auto px-6">
        <div
          ref={frameRef}
          className="relative mx-auto origin-bottom max-w-[83.75rem] aspect-video rounded-[2rem] overflow-hidden bg-[#171A10] shadow-[0_24px_60px_-28px_rgba(23,26,16,0.45)]"
        >
          {playing && SOURCE ? (
            SOURCE.kind === 'youtube' ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${SOURCE.id}?autoplay=1&rel=0`}
                title="An introduction to Thallo"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <video
                src={SOURCE.src}
                controls
                autoPlay
                playsInline
                aria-label="An introduction to Thallo"
                className="absolute inset-0 h-full w-full bg-black object-contain"
              />
            )
          ) : (
            <button
              type="button"
              disabled={!SOURCE}
              onClick={() => setPlaying(true)}
              aria-label={SOURCE ? 'Play the introduction to Thallo' : 'Video coming soon'}
              className="group absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-5 disabled:cursor-default"
            >
              <img
                loading="lazy"
                decoding="async"
                src={`${BASE}/case-film-bg.webp`}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
              <span aria-hidden className="absolute inset-0 bg-black/45" />

              {/* The disc, with a slow ring breathing out of it so the frame
                  reads as something waiting to play rather than a photo. */}
              <span aria-hidden className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
                <span className="absolute inset-0 rounded-full bg-white/25 motion-safe:animate-ping [animation-duration:2.4s]" />
                <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white text-gray-900 shadow-lg transition-transform duration-300 group-hover:scale-105">
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" className="ml-1">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>

              {!SOURCE && (
                <span className="relative text-xs font-bold uppercase tracking-widest text-white/70">
                  Video coming soon.
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
