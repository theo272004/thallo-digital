import React from 'react';

/**
 * ↗ as a drawn glyph rather than the character.
 *
 * U+2197 carries an emoji presentation, and phones pick it by default — the
 * buttons were rendering a colour emoji instead of the brand arrow. A text
 * variation selector talks most fonts out of it but not all of them, so the
 * shape is drawn here where nothing can substitute it.
 *
 * Sized in `em`, so it follows whatever font-size the button sets.
 */
export default function ArrowUpRight({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`inline-block flex-shrink-0 ${className}`}
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}
