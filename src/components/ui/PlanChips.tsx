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
              className={`cursor-pointer rounded-lg border px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                on
                  ? 'border-[#39471D] bg-[#39471D] text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
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
