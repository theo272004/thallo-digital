'use client';

import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
 * ## Why the panel is not where you would expect to find it
 *
 * It is portalled to `<body>` and positioned in viewport coordinates, rather
 * than being an absolutely-positioned child of the field. Two reasons, both of
 * which were live bugs on the scan page:
 *
 *   · The setup card sits inside `#tool`, which is `overflow-hidden` so the
 *     photograph behind it cannot spill. Country and Language are the bottom
 *     row of that card, so their panels opened straight into the clip and the
 *     list was cut off mid-row — measured at 962px against a section ending at
 *     885px. No z-index reaches out of an ancestor's overflow; leaving the
 *     panel in the tree meant choosing between a clipped list and a photograph
 *     with a visible seam.
 *   · An absolute panel always drops downwards. On a laptop the same two fields
 *     sit ~640px down a 720px viewport, so the list opened below the fold and
 *     you had to scroll a page to read a menu.
 *
 * Portalled and measured, it escapes the clip and flips above the field when
 * that is where the room is. See `useAnchored`.
 *
 * ## Lenis
 *
 * The site runs Lenis smooth scroll, which drives `window.scrollTo` from its
 * own rAF loop every frame. Anything else that scrolls — including a wheel over
 * a nested scroll container — is overwritten on the next tick, so spinning the
 * wheel over a long country list scrolled the page underneath and left the list
 * exactly where it was. `data-lenis-prevent` is the opt-out Lenis reads, and it
 * has to be on the element that actually scrolls.
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
  'z-[60] overflow-auto overscroll-contain rounded-xl border border-gray-200 bg-white p-1.5 shadow-[0_24px_60px_-20px_rgba(23,26,16,0.35)]';

/** Room left between the panel and the field, and between it and the viewport edge. */
const GAP = 8;
const EDGE = 16;
/** Below this there is no useful list left, so it is better to flip than to fit. */
const MIN_HEIGHT = 132;

/**
 * One row.
 *
 * Green marks what you are about to choose, the tick marks what is chosen, and
 * they are not the same thing. Point at Português while Español is set and
 * Português goes green — that is the row the click will take — while Español
 * keeps its tick. The two coincide only when you are pointing at the row you
 * already have.
 *
 * The highlight follows the pointer and the arrow keys through the same piece
 * of state, so a mouse and a keyboard cannot disagree about which row is next.
 */
function Row({
  label,
  selected,
  active,
  id,
  onPick,
  onHover,
}: {
  label: string;
  selected: boolean;
  active: boolean;
  id: string;
  onPick: () => void;
  onHover: () => void;
}) {
  return (
    <li
      id={id}
      role="option"
      aria-selected={selected}
      onMouseEnter={onHover}
      /* `onMouseDown` rather than `onClick`: the trigger closes the panel on
         blur, and a click fires after blur — so by the time the click landed
         the row it was aimed at was gone. */
      onMouseDown={(e) => {
        e.preventDefault();
        onPick();
      }}
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[14px] font-medium transition-colors ${
        active ? 'bg-[#39471D] text-white' : selected ? 'text-[#39471D]' : 'text-gray-700'
      }`}
    >
      {label}
      {selected && <Check size={15} className="shrink-0" />}
    </li>
  );
}

/**
 * The floating list itself.
 *
 * Only ever mounted while the list is open, so "where does it go" is a mount
 * question rather than a piece of state to keep in sync.
 *
 * Placed by writing `style` onto the node rather than by rendering coordinates
 * from state. Measuring in a layout effect and then calling `setState` means a
 * second render pass on every scroll frame for a value React does not otherwise
 * care about — and this repositions on every scroll event, which under Lenis is
 * every frame. Written straight to the node, a scroll costs four style writes
 * and no render at all. It starts hidden and is revealed by the same effect, so
 * it is never painted at 0,0 first.
 *
 * The highlighted row is kept in view by moving the panel's own `scrollTop`
 * rather than by calling `scrollIntoView`: that would also scroll every
 * ancestor, which here means arrowing down a country list would walk the page
 * down behind it.
 */
function Popover({
  id,
  label,
  anchor,
  active,
  count,
  panelRef,
  children,
}: {
  id: string;
  label: string;
  anchor: React.RefObject<HTMLElement | null>;
  active: number;
  /** How many rows are in the list. Re-measures the panel when it changes,
      which is what happens as you type into `Combo` and the list narrows. */
  count: number;
  panelRef: React.RefObject<HTMLUListElement | null>;
  children: React.ReactNode;
}) {
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const field = anchor.current;
    if (!panel || !field) return;

    /* How tall the list wants to be, measured uncapped and once per change of
       contents — `count` is in the deps for exactly that. Sizing to the content
       rather than to a fixed 264px is what stops these lists scrolling at all:
       seven countries come to 309px, so the old cap left a scrollbar with 47px
       of travel behind it. A wheel notch is about 100, which meant one notch
       hit the bottom and every notch after it did nothing — a menu that reads
       as broken rather than as short.

       `scrollHeight` is the content box plus padding; `max-height` under
       `box-sizing: border-box` also has to cover the 1px border each side. */
    panel.style.maxHeight = 'none';
    const natural = panel.scrollHeight + 2;

    /* Recomputed on scroll and resize rather than measured once: the page moves
       under a fixed panel, so a panel placed and then left alone drifts away
       from its field. Scroll is listened for in the capture phase, so scrolling
       inside any ancestor counts and not only the window. */
    const place = () => {
      const r = field.getBoundingClientRect();
      const below = window.innerHeight - r.bottom - GAP - EDGE;
      const above = r.top - GAP - EDGE;
      /* Downwards unless the list does not fit there and fits better above — a
         panel that flips up while a perfectly good gap sits under the field
         reads as a glitch, so the test is on the room the list actually needs
         rather than on a fixed threshold. */
      const flip = natural > below && above > below;
      const maxHeight = Math.max(MIN_HEIGHT, Math.min(natural, flip ? above : below));

      panel.style.left = `${r.left}px`;
      panel.style.top = `${flip ? Math.max(EDGE, r.top - GAP - maxHeight) : r.bottom + GAP}px`;
      panel.style.width = `${r.width}px`;
      panel.style.maxHeight = `${maxHeight}px`;
      panel.style.visibility = 'visible';
    };

    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [anchor, panelRef, count]);

  useEffect(() => {
    const panel = panelRef.current;
    const row = panel?.children[active] as HTMLElement | undefined;
    if (!panel || !row) return;
    const top = row.offsetTop;
    const bottom = top + row.offsetHeight;
    if (top < panel.scrollTop) panel.scrollTop = top;
    else if (bottom > panel.scrollTop + panel.clientHeight) panel.scrollTop = bottom - panel.clientHeight;
  }, [active, panelRef]);

  /* There is no `document` to portal into while the page is being prerendered.
     A panel cannot be open before a click, so this only ever guards the build. */
  if (typeof document === 'undefined') return null;

  return createPortal(
    <ul
      ref={panelRef}
      id={id}
      role="listbox"
      aria-label={label}
      /* The opt-out Lenis reads. Without it the wheel over this list scrolls
         the page and the list stays exactly where it was. */
      data-lenis-prevent
      className={PANEL}
      style={{ position: 'fixed', visibility: 'hidden' }}
    >
      {children}
    </ul>,
    document.body
  );
}

/**
 * Closes the panel when the pointer goes anywhere else on the page.
 *
 * Takes both the field and the panel, because the panel is no longer inside the
 * field — pressing on its scrollbar is a mousedown outside the trigger, and
 * with one ref that counted as leaving.
 */
function useDismiss(open: boolean, close: () => void, extra: React.RefObject<HTMLElement | null>) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => {
      const t = e.target as Node;
      if (box.current?.contains(t)) return;
      if (extra.current?.contains(t)) return;
      close();
    };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open, close, extra]);
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
  const panelRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const box = useDismiss(open, () => setOpen(false), panelRef);
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
        ref={triggerRef}
        type="button"
        /* `role="combobox"`, not the implicit button role. A button cannot
           carry `aria-activedescendant`, so without this the pointer to the
           highlighted row is dropped and a screen reader is told a list is open
           but never which row the arrow keys are on. */
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
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
        <Popover id={`${id}-list`} label={label} anchor={triggerRef} active={active} count={options.length} panelRef={panelRef}>
          {options.map((o, i) => (
            <Row
              key={o.value}
              id={`${id}-${i}`}
              label={o.label}
              selected={o.value === value}
              active={i === active}
              onHover={() => setActive(i)}
              onPick={() => commit(i)}
            />
          ))}
        </Popover>
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
  /* Whether the panel is narrowing to what is being typed, or simply listing
     everything. It filters only while you are actually typing; opening it again
     afterwards shows the whole list.

     Without this the field could not be reopened once it held an answer. The
     panel filtered on its own value, so "pizzerías de barrio" — which matches
     none of the eight — left nothing to show and the panel hid itself. Having
     chosen once, you could never see the options again to change your mind. */
  const [typing, setTyping] = useState(false);
  const id = useId();
  const panelRef = useRef<HTMLUListElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const box = useDismiss(open, () => setOpen(false), panelRef);

  const query = value.trim().toLowerCase();
  const shown = typing && query ? options.filter((o) => o.toLowerCase().includes(query)) : options;

  const commit = (label: string) => {
    onChange(label);
    setOpen(false);
    setActive(-1);
    setTyping(false);
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
      <div ref={fieldRef} className="relative">
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
            setTyping(true);
            setOpen(true);
          }}
          onFocus={() => {
            setTyping(false);
            setOpen(true);
          }}
          /* Also on click. Focus fires once; clicking a field that already has
             focus fires nothing, which is exactly the case after picking a
             suggestion — the panel closed, the input kept focus, and the next
             click did nothing at all. */
          onClick={() => {
            setTyping(false);
            setOpen(true);
          }}
          onKeyDown={onKey}
          className={`${className} pr-11`}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => {
            setTyping(false);
            setOpen((o) => !o);
          }}
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-gray-400"
        >
          <ChevronDown size={17} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {open && shown.length > 0 && (
        <Popover id={`${id}-list`} label={label} anchor={fieldRef} active={active} count={shown.length} panelRef={panelRef}>
          {shown.map((o, i) => (
            <Row
              key={o}
              id={`${id}-${i}`}
              label={o}
              selected={o.toLowerCase() === query}
              active={i === active}
              onHover={() => setActive(i)}
              onPick={() => commit(o)}
            />
          ))}
        </Popover>
      )}
    </div>
  );
}
