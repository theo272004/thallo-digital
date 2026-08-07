'use client';

import React from 'react';
import { BASE } from '@/lib/site';

/**
 * The consent tick every form has to carry before it sends anything.
 *
 * `required` on the input means the browser blocks submission until it is
 * ticked — the consent is a precondition, not a preference, and it is never
 * pre-ticked. The wording states what the details are used for and that they
 * are not passed on, which is the substance of the ask.
 *
 * The policy it links to is `/privacy/`. It opens in a new tab: a form this
 * sits under is usually half filled in, and sending the reader away to read the
 * terms would cost them the answers they had already typed.
 */
export default function ConsentCheck({ id = 'consent' }: { id?: string }) {
  return (
    <label htmlFor={id} className="flex items-start gap-2.5 cursor-pointer">
      <input
        id={id}
        name="consent"
        type="checkbox"
        required
        className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#39471D]"
      />
      {/* Two lines at the width this sits in. Every clause is load-bearing —
          purpose, no onward sharing, right to deletion — so it is tightened
          rather than trimmed. */}
      <span className="text-[12px] font-medium leading-relaxed text-gray-500">
        I agree Thallo may use these details to reply. We never sell or share
        them, and you can ask us to delete them. See our{' '}
        <a
          href={`${BASE}/privacy/`}
          target="_blank"
          rel="noopener noreferrer"
          /* The link sits inside the label, and a click on anything a label
             contains toggles the box it points at. Stopping it here means
             reading the policy does not silently untick the consent. */
          onClick={(e) => e.stopPropagation()}
          className="underline underline-offset-2 hover:text-[#39471D]"
        >
          privacy policy
        </a>
        .
      </span>
    </label>
  );
}
