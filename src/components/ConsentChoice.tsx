'use client';

import React, { useEffect, useState } from 'react';
import { GA_ID } from '@/components/Analytics';
import { CONSENT_EVENT, readConsent, writeConsent, type Consent } from '@/lib/consent';

/**
 * The withdraw button, printed inside the privacy policy.
 *
 * Article 7(3) of the GDPR: withdrawing consent must be as easy as giving it.
 * A banner with an Accept button and no way back — short of clearing site data
 * — does not meet that, and "install Google's opt-out add-on" is not a way
 * back either; it is Google's control, not ours, and it does not stop us
 * loading the tag.
 *
 * So this states what the visitor chose, in their own browser, and lets them
 * choose again. It renders nothing on a build with no tag: a control for
 * switching off something that was never on would be a lie in the other
 * direction.
 */
export default function ConsentChoice() {
  /* `undefined` until the effect below has read the browser's storage — see the
     same pattern, and the same reason, in Analytics.tsx. */
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);

  useEffect(() => {
    const sync = () => setConsent(readConsent());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (!GA_ID || undefined === consent) return null;

  const BUTTON =
    'shrink-0 rounded-full border border-gray-200 px-5 py-2.5 text-[13px] font-bold text-gray-900 transition-colors hover:border-[#39471D] hover:text-[#39471D]';

  return (
    <div className="mt-2 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-[#F7F8F9] p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[13px] font-medium leading-relaxed text-gray-600">
        {'granted' === consent && (
          <>
            <strong className="font-bold text-gray-900">Analytics is on</strong> in this browser, because you accepted
            it. Turning it off takes effect immediately and deletes nothing already collected — for that, write to us.
          </>
        )}
        {'denied' === consent && (
          <>
            <strong className="font-bold text-gray-900">Analytics is off</strong> in this browser. Nothing is loaded,
            and any cookie it had set has been deleted.
          </>
        )}
        {null === consent && (
          <>
            <strong className="font-bold text-gray-900">You have not answered yet.</strong> Until you do, nothing is
            loaded — the banner is waiting at the bottom of the page.
          </>
        )}
      </p>

      {/* One button: whichever answer is not the current one. There is none in
          the unanswered state — the banner is on screen asking, and a button
          here that re-opened it would do nothing at all. */}
      {'granted' === consent && (
        <button type="button" className={BUTTON} onClick={() => writeConsent('denied')}>
          Turn it off
        </button>
      )}
      {'denied' === consent && (
        <button type="button" className={BUTTON} onClick={() => writeConsent('granted')}>
          Turn it on
        </button>
      )}
    </div>
  );
}
