'use client';

import React, { useEffect, useRef } from 'react';
import { Cookie } from 'lucide-react';
import type { Consent } from '@/lib/consent';
import { BASE } from '@/lib/site';

/**
 * The question, asked once.
 *
 * ── Shape ───────────────────────────────────────────────────────────────────
 * A single card pinned to the bottom of the window, not a full-screen scrim.
 * The scrim version tests better for acceptance rates and that is exactly the
 * objection to it: consent extracted by blocking the page is not freely given,
 * which is the standard the GDPR sets. The page stays readable and the visitor
 * can ignore this.
 *
 * ── The two buttons are the same size ───────────────────────────────────────
 * Deliberate, and the part most sites get wrong. "Accept" in a filled green
 * pill next to a grey "Decline" link is a dark pattern with a name — and it is
 * the specific thing the EDPB and the Colombian SIC have both fined people
 * over. Same width, same weight, same prominence. The green sits on Accept
 * because one of them has to be the primary and it is the affirmative answer,
 * not because it is the one we want.
 *
 * There is no third "Manage" button because there is nothing to manage: this
 * site runs one tag and no advertising anything, so the honest choice is
 * binary and a preferences panel would be theatre.
 */
export default function CookieBanner({ onChoice }: { onChoice: (value: Consent) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  /**
   * The banner takes focus when it appears, so a keyboard or screen-reader
   * visitor meets the question rather than tabbing past it into the page. It
   * does NOT trap focus — trapping would make it a modal, which is the blocking
   * behaviour the comment above rejects.
   */
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      tabIndex={-1}
      /* max-w rather than full width: at 1440px a bar spanning the window
         reads as chrome and gets ignored. A card reads as something asked.

         The fixed box is the card's own size, not a transparent strip across
         the window with the card centred inside it, so whatever this box
         draws stays on the card. The strip once drew its focus ring — see
         `[tabindex='-1']:focus-visible` in globals.css — as an olive line
         across the whole hero. inset-x + mx-auto + max-w centres it without a
         transform. */
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-[560px] outline-none sm:inset-x-6 sm:bottom-6"
    >
      <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_12px_40px_-12px_rgba(23,26,16,0.28)]">
        <div>
          {/* The cookie is the sign people already read as "this is the cookie
              question" — it saves them reading the sentence to know what it is. */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#39471D]/10 text-[#39471D]"
            >
              <Cookie className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <p id="cookie-banner-title" className="text-sm font-bold tracking-tight text-gray-900">
              Can we count this visit?
            </p>
          </div>
          {/* Says what it is and what it is not, in two lines. A visitor who
              reads nothing else should still know that declining costs them
              nothing — which is true, and is why it is worth saying. */}
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-500">
            Google Analytics, and nothing else — no advertising, no profiles, no sharing. Decline and the site works
            exactly the same. Details in our{' '}
            <a
              href={`${BASE}/privacy/`}
              className="font-semibold text-[#39471D] underline underline-offset-2"
            >
              privacy policy
            </a>
            .
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={() => onChoice('denied')}
            className="flex-1 rounded-full border border-gray-200 px-5 py-2.5 text-[13px] font-bold text-gray-900 transition-colors hover:border-[#39471D] hover:text-[#39471D]"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => onChoice('granted')}
            className="flex-1 rounded-full border border-[#39471D] bg-[#39471D] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:border-[#55672E] hover:bg-[#55672E]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
