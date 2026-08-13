'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

/**
 * Our own dropdowns, because the browser's cannot be ours.
 *
 * A native `<select>` can be styled shut and not open: the list it drops is
 * drawn by the operating system, in the OS's colours, with the OS's corners.
 * `<datalist>` is worse — on Windows it renders as a black panel with violet
 * text, which is what sent Cami the screenshot. Neither takes a class.
 *
 * So the list is ours. Both of these keep a real form control underneath for
 * the things a custom widget does not get for free — `Combo` is a real
 * `<input>` and stays typeable, which matters because Category accepts
 * anything, not only the eight suggestions.
 *
 * ## What they owe the keyboard
 *
 * Arrow keys move the highlight, Enter takes it, Escape closes without
 * choosing, Tab leaves. The panel carries `role="listbox"` and its rows
 * `role="option"`, and the trigger points at the highlighted row through
 * `aria-activedescendant`, so a screen reader is told what a sighted user can
 * see. A custom dropdown that skips this is worse than the ugly native one it
 * replaced.
 */

const PANEL =
  'absolute z-30 mt-2 max-h-[264px] w-full overflow-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(23,26,16,0.35)]';

function Row({
  label,
  selected,
  active,
  id,
  onPick,
}: {
  label: string;
  selected: boolean;
  active: boolean;
  id: string;
  onPick: () => void;
}) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={selected}
      /* `onMouseDown` rather than `onClick`: the trigger closes the panel on
         blur, and a click fires after blur — so by the time the click landed
         the row it was aimed at was gone. */
      onMouseDown={(e) => {
        e.preventDefault();
        onPick();
      }}
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
        selected ? 'bg-[#39471D] text-white' : active ? 'bg-[#39471D]/8 text-[#39471D]' : 'text-gray-700'
      }`}
    >
      {label}
      {selected && <Check size={15} className="shrink-0" />}
    </li>
  );
}

/** Closes the panel when the pointer goes anywhere else on the page. */
function useDismiss(open: boolean, close: () => void) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open, close]);
  return box;
}

// ---------------------------------------------------------------------------

/** A `<select>` in behaviour, ours in appearance. */
export function Select({
  value,
  onChange,
  options,
  label,
  icon,
  className = '',
}: {
  value: string;
  onChange: (next: string) => void;
  options: { value: string; label: string }[];
  label: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const id = useId();
  const box = useDismiss(open, () => setOpen(false));
  const current = options.find((o) => o.value === value);

  const commit = (i: number) => {
    onChange(options[i].value);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return setOpen(false);
    if (e.key === 'Enter' || (e.key === ' ' && !open)) {
      e.preventDefault();
      if (open) commit(active);
      else {
        setActive(Math.max(0, options.findIndex((o) => o.value === value)));
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) {
        setActive(Math.max(0, options.findIndex((o) => o.value === value)));
        setOpen(true);
        return;
      }
      setActive((i) => (e.key === 'ArrowDown' ? Math.min(options.length - 1, i + 1) : Math.max(0, i - 1)));
    }
  };

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        /* `role="combobox"`, not the implicit button role. A button cannot
           carry `aria-activedescendant`, so without this the pointer to the
           highlighted row is dropped and a screen reader is told a list is open
           but never which row the arrow keys are on. */
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        aria-activedescendant={open ? `${id}-${active}` : undefined}
        onClick={() => {
          setActive(Math.max(0, options.findIndex((o) => o.value === value)));
          setOpen((o) => !o);
        }}
        onKeyDown={onKey}
        className={`flex w-full items-center justify-between gap-2 text-left ${className}`}
      >
        <span className="flex min-w-0 items-center gap-2.5 truncate">
          {icon}
          {current?.label ?? ''}
        </span>
        <ChevronDown
          size={17}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <ul role="listbox" aria-label={label} className={PANEL}>
          {options.map((o, i) => (
            <Row
              key={o.value}
              id={`${id}-${i}`}
              label={o.label}
              selected={o.value === value}
              active={i === active}
              onPick={() => commit(i)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

/**
 * A text field with suggestions under it — the `<datalist>` replacement.
 *
 * Typing is the point: the suggestions narrow as you go, and anything not on
 * the list is still a valid answer. That is the whole reason Category is free
 * text, so the panel must never be in the way of simply typing past it.
 */
export function Combo({
  value,
  onChange,
  options,
  label,
  placeholder,
  maxLength,
  className = '',
}: {
  value: string;
  onChange: (next: string) => void;
  options: readonly string[];
  label: string;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const id = useId();
  const box = useDismiss(open, () => setOpen(false));

  const query = value.trim().toLowerCase();
  const shown = query ? options.filter((o) => o.toLowerCase().includes(query)) : options;

  const commit = (label: string) => {
    onChange(label);
    setOpen(false);
    setActive(-1);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return setOpen(false);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) return setOpen(true);
      setActive((i) => (e.key === 'ArrowDown' ? Math.min(shown.length - 1, i + 1) : Math.max(-1, i - 1)));
      return;
    }
    /* Enter only takes a suggestion when one is actually highlighted —
       otherwise it belongs to the form, which is submitting what was typed. */
    if (e.key === 'Enter' && open && active >= 0) {
      e.preventDefault();
      commit(shown[active]);
    }
  };

  return (
    <div ref={box} className="relative">
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open && active >= 0 ? `${id}-${active}` : undefined}
          aria-label={label}
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => {
            onChange(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          className={`${className} pr-11`}
        />
        <ChevronDown
          size={17}
          aria-hidden
          className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </div>

      {open && shown.length > 0 && (
        <ul id={`${id}-list`} role="listbox" aria-label={label} className={PANEL}>
          {shown.map((o, i) => (
            <Row
              key={o}
              id={`${id}-${i}`}
              label={o}
              selected={o.toLowerCase() === query}
              active={i === active}
              onPick={() => commit(o)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
