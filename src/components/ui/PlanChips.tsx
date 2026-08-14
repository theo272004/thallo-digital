'use client';

import React from 'react';

/**
 * "Plan of interest" — the same chip group in the enquiry form inside the
 * closing CTA and on the contact page, so an enquiry carries the same field
 * whichever form it came from.
 *
 * Controlled: the parent owns the selection, because on the plans page it is
 * seeded by the plan builder above the form.
 */
export default function PlanChips({
  plans,
  selected,
  onToggle,
  label = 'Plan of interest',
  labelClassName = 'block text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-1.5',
}: {
  plans: string[];
  selected: string[];
  onToggle: (plan: string) => void;
  label?: string;
  labelClassName?: string;
}) {
  return (
    <fieldset>
      <legend className={labelClassName}>{label}</legend>
      <div className="flex flex-wrap gap-2">
        {plans.map((plan) => {
          const on = selected.includes(plan);
          return (
            <label
              key={plan}
              /* The same object as the case-study filter, at chip scale: the
                 selected one is filled olive, and an unselected one lifts and
                 turns its type olive under the cursor. It used to only nudge
                 its border a shade of grey, which read as nothing happening —
                 there was no way to tell the group was clickable at all. */
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all duration-300 ${
                on
                  ? 'border-[#39471D] bg-[#39471D] text-white'
                  : 'border-gray-200 bg-white text-gray-600 lift-sm hover:text-[#39471D]'
              }`}
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => onToggle(plan)}
                className="sr-only"
              />
              {plan}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
