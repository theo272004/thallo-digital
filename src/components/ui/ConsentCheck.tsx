'use client';

import React from 'react';

/**
 * The consent tick every form has to carry before it sends anything.
 *
 * `required` on the input means the browser blocks submission until it is
 * ticked — the consent is a precondition, not a preference, and it is never
 * pre-ticked. The wording states what the details are used for and that they
 * are not passed on, which is the substance of the ask.
 *
 * NOTE FOR WHOEVER OWNS THIS SITE: there is no privacy policy page in this
 * project yet, so there is nothing to link to. Once one exists, link it from
 * the sentence below. A tick without a policy behind it is a courtesy, not
 * compliance, and this component is not legal advice.
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
        them, and you can ask us to delete them.
      </span>
    </label>
  );
}
