'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import SpinFlower from '@/components/ui/SpinFlower';
import AuditCTA from '@/components/AuditCTA';
import { BASE } from '@/lib/site';
// EngagementSteps and Magnetic left with the hidden process strip and plan
// builder — restore them there and here together.

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    idx: '01',
    kicker: 'Diagnosis',
    tab: 'Audit',
    title: 'AI Visibility Audit',
    desc: 'See exactly where you show up when buyers ask AI, where competitors beat you, and what it would take to lead.',
    deliverables: [
      'Visibility benchmark against rivals',
      'Share-of-answer scoring',
      'Technical readiness review',
      'Content and authority gaps',
      'Prioritized 90-day roadmap',
    ],
    /* Amount and terms split rather than run together on one line. A figure
       reads as a price; a figure with its conditions welded onto it reads as a
       sentence, and the eye stops looking for the number. */
    price: 'From $800',
    terms: 'One-time. No lock-in. The roadmap is yours either way.',
    cta: 'Book an audit',
  },
  {
    idx: '02',
    kicker: 'The full program',
    tab: 'Authority Engine',
    title: 'The Authority Engine',
    desc: 'The monthly operation that builds, publishes and compounds your authority across search and AI, so you keep winning the research phase.',
    deliverables: [
      'Deeply researched original content',
      'Technical AI-readiness build',
      'Search and AI visibility',
      'Distribution to buyer channels',
      'Consistent brand narrative',
      'Monthly outcome reporting',
    ],
    price: 'From $2,500 / month',
    /* Three months, not six. The FAQ below explains the reasoning and the two
       have to agree — a page that states one term in the card and another in
       the answer underneath it is a page nobody can quote back to you. */
    terms: '3-month initial term. Scales with the size of the operation.',
    cta: 'Talk about the Engine',
  },
  {
    idx: '03',
    kicker: 'One-off work',
    tab: 'Projects',
    title: 'Standalone Projects',
    desc: 'A single high-value piece of work, built end to end. Take one on its own, or layer it onto the Engine.',
    deliverables: [
      'Original research studies',
      'Definitive guides',
      'AI visibility build',
      'Digital PR and podcasts',
      'Interactive tools',
    ],
    price: 'Priced by scope',
    terms: 'Quoted per project. Tell us what you have in mind.',
    cta: 'Request a quote',
  },
];

/**
 * What the monthly operation actually produces.
 *
 * Six cells rather than a paragraph, because the argument is that these are one
 * operation rather than six services bought separately — and a list makes that
 * claim visible in a way prose has to assert.
 */
const ENGINE = [
  { title: 'Original research', copy: 'Studies and data only you could produce, built on your own numbers and expertise.' },
  { title: 'Published work', copy: 'Written, structured and shipped every month. Not drafts sitting in your review queue.' },
  { title: 'Technical build', copy: 'A site search engines and AI models can read, parse and cite without guessing.' },
  { title: 'Distribution', copy: 'Each piece carried to LinkedIn, communities, podcasts and newsletters where buyers already are.' },
  { title: 'Citation tracking', copy: 'How often the models name you across a fixed set of buying questions, measured against rivals.' },
  { title: 'Monthly reporting', copy: 'What moved, what didn’t, and what changes next. Tied to pipeline, not traffic.' },
];

/** The five one-off pieces, at more length than the card bullets carry. */
const PROJECTS = [
  {
    title: 'Original research studies',
    copy: 'Numbers nobody else has, from a focused study to a full state-of-the-category report. The asset that earns citations for years.',
  },
  {
    title: 'Definitive guides',
    copy: 'The most complete answer that exists on a question your category keeps asking. Built to be the one that gets quoted.',
  },
  {
    title: 'AI visibility build',
    copy: 'The structural work that lets the models read, understand and cite you. Schema, architecture, and the pages that answer real buying questions.',
  },
  {
    title: 'Digital PR and podcasts',
    copy: 'Placement in the publications and shows your buyers already listen to.',
  },
  {
    title: 'Interactive tools',
    copy: 'Calculators and benchmarks that attract links and capture demand on their own.',
  },
];

/**
 * The questions that come up at the point of choosing, not the ones about the
 * category. Someone on this page has already accepted the argument; what they
 * are deciding is which of the three to buy and what they are committing to.
 */
const FAQS = [
  {
    q: 'Do I have to start with the audit?',
    a: 'No. The three plans are independent. Most people start with the audit because it costs least and tells you what you actually need, but you can go straight into the Engine or commission a single project if you already know what you are missing.',
  },
  {
    q: 'Why a three-month minimum?',
    a: 'Because nothing meaningful happens in thirty days, and we would rather say so than sell you a month and let you draw your own conclusions. Three months is the shortest window where you can judge the work fairly. Worth knowing upfront: movement in how the models describe you usually shows up between month three and month six. The first quarter builds the foundation the rest compounds on.',
  },
  {
    q: 'What does a project cost?',
    a: 'It depends entirely on scope. A focused data study and a full industry report with original survey work are different sizes of project. Tell us what you have in mind and you will get a fixed quote before anything starts.',
  },
  {
    q: 'Can I add a project to the Engine later?',
    a: 'Yes, and that is how most of them get commissioned. The engine surfaces the opportunity, you decide whether it is worth the extra scope, and it gets quoted separately.',
  },
  {
    q: 'What happens if we stop?',
    a: 'Everything we built stays yours. The research, the pages, the structure, the reports. Unlike ads, the work does not disappear the moment you stop paying, which is most of the reason it is worth doing.',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Check({ featured }: { featured: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none"
      stroke={featured ? '#CBD0AC' : '#55672E'}
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className="mt-0.5 flex-shrink-0">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/*
 * Two helpers left with the plan builder: `Tick`, the filled disc with the
 * tick cut out of it, and `FeatureIcon`, the glyph-per-deliverable map. Both
 * were the builder's alone — the cards use `Check`, above.
 *
 * The builder itself was ~170 lines of interactive markup with its own state,
 * so it is not parked in a comment here the way the smaller hidden blocks on
 * About and Case Studies are; a block that size in comment makes the file
 * unreadable and rots the moment anything around it moves. It lives in git.
 * To bring it back, with these two helpers:
 *
 *     git show 326c3e5:src/components/ServicesLanding.tsx
 */

/**
 * Desktop lays the three side by side and puts the active one in the middle;
 * stacked on a phone the middle is nowhere, so the active one goes on top and
 * the other two keep their natural sequence below it.
 *
 * Written as whole class strings because Tailwind reads the source as text —
 * a built-up `lg:order-${n}` is invisible to it and never gets generated.
 */
const ORDER = {
  mobile: ['order-1', 'order-2', 'order-3'],
  desktop: ['lg:order-1', 'lg:order-2', 'lg:order-3'],
};

function orderClasses(cardIdx: number, active: number): string {
  const others = [0, 1, 2].filter(i => i !== active);
  const rank = cardIdx === active ? 0 : others.indexOf(cardIdx) + 1; // 0-based
  const desktop = cardIdx === active ? 1 : (cardIdx === others[0] ? 0 : 2);
  return `${ORDER.mobile[rank]} ${ORDER.desktop[desktop]}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [activeService, setActiveService] = useState(1);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  /* Which of the Engine's six cells is open. Never null — a row of six closed
     cards would say nothing about what the section does, and pointing away
     from one leaves it open rather than collapsing the row to nothing. */
  const [activeCell, setActiveCell] = useState(2);

  /* The plan builder's state lived here — a base plan, a list of add-ons, and
     the summary it fed into the enquiry form as `activePlans`. It went out with
     the builder; restoring one restores the other. */

  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const savedRects = useRef<(DOMRect | null)[]>([]);

  function handleServiceChange(idx: number) {
    if (idx === activeService) return;
    savedRects.current = wrapperRefs.current.map(el =>
      el ? el.getBoundingClientRect() : null
    );
    setActiveService(idx);
  }

  // FLIP: after state update (DOM now reflects new order), animate from old positions
  useLayoutEffect(() => {
    const oldRects = savedRects.current;
    if (!oldRects.length) return;

    wrapperRefs.current.forEach((el, i) => {
      if (!el || !oldRects[i]) return;
      const newRect = el.getBoundingClientRect();
      const dx = oldRects[i]!.left - newRect.left;
      if (Math.abs(dx) < 1) return;

      // Place card at old visual position instantly
      el.style.transition = 'none';
      el.style.transform = `translateX(${dx}px)`;

      // Force layout flush
      void el.offsetWidth;

      // Animate to actual new position
      el.style.transition = 'transform 0.55s cubic-bezier(0.22,1,0.36,1)';
      el.style.transform = '';
    });

    savedRects.current = [];
  }, [activeService]);

  return (
    <>

      {/* ── Hero (centered) ───────────────────────────────────────────────── */}
      <section className="bg-white pt-32 pb-10 2xl:pt-40 2xl:pb-12 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans max-w-2xl">
            Three ways to <span className="italic text-[#39471D]">work with us.</span>
          </h1>
          <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch] mb-10">
            Start with a diagnosis, commission a single project, or run the full engine.{' '}
            <strong className="text-gray-900 font-semibold">Pick one, or combine them.</strong> None of them requires
            the others.
          </p>
          <SpinFlower alt="Thallo" className="block w-20 h-20 opacity-80" />
        </div>
      </section>

      {/* ── Service Cards ─────────────────────────────────────────────────── */}
      {/* Asymmetric on purpose: the hero above already ends in whitespace, so
          the full py-16/py-28 on top of it stacked into a blank band. The
          bottom keeps its generosity — it is the one separating two dense
          sections. */}
      <section className="bg-white pt-10 pb-16 2xl:pt-14 2xl:pb-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">

          {/* Tab switcher */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center bg-gray-100/80 rounded-full p-1 gap-1">
              {SERVICES.map((svc, i) => (
                <button
                  key={svc.idx}
                  onClick={() => handleServiceChange(i)}
                  className={`px-3.5 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                    activeService === i
                      ? 'bg-[#39471D] text-white shadow-[0_2px_8px_rgba(57,71,29,0.35)]'
                      : 'text-gray-500 hover:text-[#39471D]'
                  }`}
                >
                  {svc.tab}
                </button>
              ))}
            </div>
          </div>

          {/* Cards grid — FLIP-animated across, stacked down on phones */}
          <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch" style={{ minHeight: 0 }}>
            {SERVICES.map((svc, i) => {
              const isFeatured = i === activeService;
              return (
                <div
                  key={svc.idx}
                  ref={el => { wrapperRefs.current[i] = el; }}
                  onClick={() => handleServiceChange(i)}
                  className={`cursor-pointer w-full lg:w-[calc((100%-48px)/3)] lg:flex-none ${orderClasses(i, activeService)}`}
                >
                  {/* The 1.08 lift is desktop-only: stacked, the cards are the
                      full column width, so scaling one just pushes it past the
                      screen edge. */}
                  <div
                    className={`h-full origin-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isFeatured ? 'lg:scale-[1.08]' : ''
                    }`}
                  >
                  <div
                    className={`relative overflow-hidden p-8 rounded-3xl flex flex-col h-full transition-all duration-500 hover:-translate-y-1 ${
                      isFeatured
                        ? 'bg-[#39471D] border border-[#39471D] shadow-[0_2px_6px_rgba(57,71,29,0.35),0_10px_28px_-4px_rgba(57,71,29,0.55)]'
                        : 'bg-gray-50/60 border border-gray-200 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] hover:border-[#55672E]/20'
                    }`}
                  >
                    {isFeatured && (
                      <img loading="lazy" decoding="async"
                        src={`${BASE}/isotipo.png`}
                        alt=""
                        aria-hidden="true"
                        /* Sat on the corner rather than tucked inside it. At
                           -64px of a 288px mark the whole flower cleared the
                           edge with room to spare, so it read as a sticker
                           dropped in the card. Half of it hangs out now and
                           the card crops the rest — the mark belongs to the
                           corner instead of floating near it. */
                        className="absolute -top-[10.5rem] -right-[10.5rem] w-[26rem] rotate-[18deg] opacity-[0.11] pointer-events-none select-none"
                        style={{ filter: 'brightness(0) invert(1)' }}
                      />
                    )}

                    <div className="relative flex-1">
                      <div className="flex items-center justify-between gap-3 mb-6">
                        <span className={`text-[11px] font-bold tracking-[0.18em] uppercase transition-colors duration-500 ${isFeatured ? 'text-white/70' : 'text-gray-400'}`}>
                          {svc.idx} / {svc.kicker}
                        </span>
                        {i === 1 && (
                          <span className="text-[11px] font-bold tracking-widest uppercase text-[#39471D] bg-[#CBD0AC] px-2 py-1 rounded-full">
                            Most chosen
                          </span>
                        )}
                        {/* "Optional add-on" sat here on the third card and is
                            not in the design this page follows — the only badge
                            it carries is "Most chosen". The card's own copy
                            already says the work layers onto the Engine. */}
                      </div>

                      <h3 className={`text-2xl font-semibold mb-3 transition-colors duration-500 ${isFeatured ? 'text-white' : 'text-gray-900'}`}>
                        {svc.title}
                      </h3>
                      <p className={`text-sm leading-relaxed font-medium mb-7 transition-colors duration-500 ${isFeatured ? 'text-[#CBD0AC]' : 'text-gray-500'}`}>
                        {svc.desc}
                      </p>

                      <ul className="flex flex-col gap-3">
                        {svc.deliverables.map((item, j) => (
                          <li key={j} className={`flex items-start gap-2.5 text-sm font-medium transition-colors duration-500 ${isFeatured ? 'text-gray-100' : 'text-gray-700'}`}>
                            <Check featured={isFeatured} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`relative mt-8 pt-6 border-t transition-colors duration-500 ${isFeatured ? 'border-white/15' : 'border-gray-200/70'}`}>
                      <span className={`block text-base font-bold tracking-tight transition-colors duration-500 ${isFeatured ? 'text-white' : 'text-gray-900'}`}>
                        {svc.price}
                      </span>
                      <span className={`mt-1 block text-[13px] font-medium leading-snug transition-colors duration-500 ${isFeatured ? 'text-[#CBD0AC]' : 'text-gray-500'}`}>
                        {svc.terms}
                      </span>

                      {/* Each plan asks for itself. `stopPropagation` because
                          the whole card is also the tab control — without it,
                          following the link would first swap the featured card
                          out from under the finger that pressed it. */}
                      <a
                        href="#enquiry"
                        onClick={(e) => e.stopPropagation()}
                        className={`mt-5 block rounded-full px-5 py-3 text-center text-sm font-semibold transition-colors ${
                          isFeatured
                            ? 'bg-white text-[#39471D] hover:bg-[#E7ECD9]'
                            : 'border border-gray-200 text-gray-900 hover:border-[#39471D] hover:text-[#39471D]'
                        }`}
                      >
                        {svc.cta} <ArrowUpRight className="ml-0.5" />
                      </a>
                    </div>
                  </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* The single "Book an audit" button that stood here is gone: each
              card now carries its own ask, and this is the line the design puts
              in its place — a pointer for the reader who cannot choose. */}
          <p className="mt-12 text-center text-base font-medium leading-relaxed text-gray-500">
            Not sure which one fits?{' '}
            <strong className="font-semibold text-gray-900">Start with the audit.</strong> It tells you what you
            actually need, and you keep the roadmap whether you continue with us or not.
          </p>
        </div>
      </section>

      {/* ── HIDDEN: process, and the plan builder ─────────────────────────────
          <EngagementSteps /> — the "how an engagement runs" strip — and the
          interactive plan builder that stood under it are both absent from the
          design this page follows, so both come off the page.

          The builder is the bigger loss and worth naming: it let a visitor pick
          a base plan, tick add-ons, and have that selection arrive pre-ticked in
          the enquiry form below. That wiring is why `basePlan`/`addons` existed
          and why the closing panel took an `activePlans` prop. Restoring the
          builder means restoring that state and the prop with it.
       ─────────────────────────────────────────────────────────────────────── */}

      {/* ── What the Engine runs ────────────────────────────────────────────
          The photograph is the section, edge to edge — not a picture inside a
          card sitting on a white page.

          ## Why nothing changes width

          The first pass widened the hovered card and let the other five give
          the room back. It read badly: every card's text re-wrapped on every
          frame of the animation, so six paragraphs shuffled their line breaks
          while one opened. Words moving is the thing the eye cannot ignore.

          So the columns are equal and they stay equal. The only thing that
          animates is the open card's body, on `grid-template-rows` 0fr → 1fr —
          the same mechanism the FAQ below uses. One property, no reflow, and
          the row's height is fixed with the cards sitting on its floor, so the
          one that opens grows upward into space that was already empty and
          nothing else on the page moves at all.

          ## Why one is always open

          A row of six closed cards says nothing about what it does. The third
          starts open, and pointing at another moves the selection rather than
          opening a second — so the section always reads as one thing showing
          and five waiting, and it never collapses into an empty state.

          Selection follows the pointer and also focus, so a keyboard reaches
          every card. Below `lg` there is no pointer worth speaking of: the
          cards stack and every body is open.

          No new words. The heading, the paragraph, and all six titles and
          bodies are the ones the grey version carried.
       ─────────────────────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden border-b border-gray-100">
        <img
          loading="lazy"
          decoding="async"
          src={`${BASE}/engine-bg.webp`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        {/* Darkest where the type is — the top, and the floor the cards sit on
            — and lightest across the middle, which is the part of the picture
            worth seeing. The photograph carries a lit wall down its right,
            exactly where the paragraph falls. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(to bottom, rgba(23,26,16,.86) 0%, rgba(23,26,16,.46) 34%, rgba(23,26,16,.62) 62%, rgba(23,26,16,.9) 100%)',
          }}
        />

        <div className="mx-auto max-w-[1440px] px-6 py-16 2xl:py-24">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-14">
            <h2 className="max-w-[16ch] font-sans text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
              {/* Sage, not the olive the light sections use — #39471D on this
                  ground is very nearly invisible. */}
              What the <span className="italic text-[#CBD0AC]">Engine</span> runs every month.
            </h2>
            <p className="max-w-[56ch] text-base font-medium leading-relaxed text-white/75">
              One operation, not a list of services bought separately. Research feeds the content, the
              content feeds the structure, the structure feeds distribution, and the reporting tells
              you what moved.
            </p>
          </div>

          {/* The row reserves the height of the tallest card it can ever open,
              so opening one never moves the section below it. That height is a
              function of card width, and card width is a function of the
              breakpoint: measured at 225px when the six share 1024, 176px at
              1280, 154px at 1440 and above, where the container stops growing.
              A single value would either clip the narrow case or leave a band
              of bare photograph above the wide one. Each carries a little
              headroom over the measurement — the copy is text, and text gets
              reworded. */}
          <div className="mt-10 flex flex-col gap-3 lg:mt-14 lg:h-[248px] lg:flex-row lg:items-end xl:h-[196px] 2xl:h-[176px]">
            {ENGINE.map((cell, i) => {
              const open = i === activeCell;
              return (
                <div
                  key={cell.title}
                  tabIndex={0}
                  onMouseEnter={() => setActiveCell(i)}
                  onFocus={() => setActiveCell(i)}
                  aria-expanded={open}
                  className={`rounded-2xl border p-5 backdrop-blur-md transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#CBD0AC] lg:flex-1 ${
                    open
                      ? 'border-white bg-white shadow-[0_24px_60px_-24px_rgba(23,26,16,0.7)]'
                      : 'border-white/15 bg-white/[0.08]'
                  }`}
                >
                  <h3
                    className={`font-sans text-[15px] font-semibold leading-snug tracking-tight transition-colors duration-500 ${
                      open ? 'lg:text-gray-900' : 'text-white'
                    }`}
                  >
                    {cell.title}
                  </h3>

                  {/* 0fr → 1fr rather than a max-height guessed at: the body is
                      whatever it measures, so the easing runs over the real
                      distance from first pixel to last. Open at every width
                      below lg, where there is no pointer to open it with. */}
                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] grid-rows-[1fr] ${
                      open ? 'lg:grid-rows-[1fr]' : 'lg:grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`pt-2.5 text-[13px] font-medium leading-relaxed transition-opacity duration-500 ${
                          open ? 'text-gray-600 lg:opacity-100' : 'text-white/70 lg:opacity-0'
                        }`}
                      >
                        {cell.copy}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Standalone Projects, at length ────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-24 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans mb-4">
                Standalone <span className="italic text-[#39471D]">Projects.</span>
              </h2>
              <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[52ch]">
                Each one is a complete piece of work with its own scope and price. Commission one on its
                own, or add it to the Engine when you want to accelerate.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {PROJECTS.map((p) => (
                <div
                  key={p.title}
                  className="min-w-[240px] flex-1 rounded-2xl border border-gray-200 bg-gray-50/60 p-6"
                >
                  <h3 className="mb-2 font-sans text-base font-semibold tracking-tight text-gray-900">{p.title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-gray-500">{p.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ (centered) ────────────────────────────────────────────────── */}
      <section className="bg-white py-16 2xl:py-28 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.05] font-sans">
              Before you <span className="italic text-[#39471D]">decide.</span>
            </h2>
            <p className="mt-5 text-gray-500 font-medium text-base leading-relaxed max-w-[52ch] mx-auto">
              The questions that usually come up at this point.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="border-b border-gray-100">
                  <button
                    id={`faq-q-${i}`}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    className="w-full text-left py-6 flex justify-between items-center gap-5 group"
                  >
                    <span className="text-base font-semibold text-gray-900 group-hover:text-[#39471D] transition-colors">
                      {faq.q}
                    </span>
                    <span className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen
                        ? 'bg-[#39471D] border-[#39471D] text-white rotate-45'
                        : 'border-gray-200 text-gray-400'
                    }`}>
                      +
                    </span>
                  </button>
                  {/* Grid rows from 0fr to 1fr, rather than a max-height to a
                      guessed pixel value.

                      The old 300px was far taller than any answer — 138px at
                      desktop width, 229px at 375px. Height is min(content,
                      max-height), so the panel finished opening once max-height
                      passed the content, at roughly half the duration, and the
                      other half ran on an element that had already stopped. It
                      opened through the fast middle of the curve and never
                      reached the ease-out, which is what made it feel abrupt;
                      closing was the same in reverse, a pause and then a drop.

                      1fr is whatever the answer actually measures, so the easing
                      applies to the real distance from first pixel to last. */}
                  <div
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`pb-6 text-sm text-gray-500 font-medium leading-relaxed max-w-[68ch] transition-opacity duration-300 ${
                          isOpen ? 'opacity-100 delay-150' : 'opacity-0'
                        }`}
                      >
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA, with the enquiry form inside it ──────────────────────────── */}
      {/* After the FAQ rather than before it, which is where the design puts
          it: the questions are what a reader has left before deciding, so the
          ask belongs on the other side of them.

          No `activePlans` any more — that prop carried the hidden builder's
          selection. The form opens on the three plans, the same as everywhere
          else on the site. */}
      <AuditCTA
        image={`${BASE}/cta-bg-services.webp`}
        /* Broken by hand: left to wrap it took three lines and stretched the
           panel with it. */
        heading={<>Still not sure<br />which one fits?</>}
        copy="Tell us where you are and what you're trying to reach. You'll get a straight recommendation, including if the answer is that you don't need us yet."
      />

    </>
  );
}
