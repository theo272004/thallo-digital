'use client';

import React, { useState } from 'react';
import { BASE } from '@/lib/site';

/**
 * The introduction video, straight under the hero.
 *
 * The same object as the old case-film banner (src/components/VideoSection):
 * the desk photograph, a flat scrim, the white play disc. Larger here, and
 * centred, because it is the second thing on the page rather than a stop in
 * the middle of it.
 *
 * ## Until the video exists
 *
 * `VIDEO_URL` is empty, so the poster says "Video coming soon." and the disc
 * does nothing. Put a YouTube link (watch, youtu.be, shorts or embed) or the
 * address of an .mp4/.webm in it and the disc starts playing it in place —
 * nothing else needs to change.
 */
const VIDEO_URL = '';

type Source = { kind: 'youtube'; id: string } | { kind: 'file'; src: string };

function readSource(raw: string): Source | null {
  if (!raw.trim()) return null;
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

  return (
    <section className="bg-white pb-20 2xl:pb-28 border-b border-gray-100" id="intro-video" aria-label="An introduction to Thallo">
      <div className="max-w-[1440px] mx-auto px-6">
        <div
          data-reveal
          className="relative mx-auto max-w-[1180px] aspect-[16/10] sm:aspect-[16/8] rounded-[32px] overflow-hidden bg-[#171A10] shadow-[0_24px_60px_-28px_rgba(23,26,16,0.45)]"
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
                <span className="relative text-[11px] font-bold uppercase tracking-widest text-white/70">
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
