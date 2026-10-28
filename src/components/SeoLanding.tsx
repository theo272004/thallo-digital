'use client';

import React, { useRef, useState } from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import SpinFlower from '@/components/ui/SpinFlower';
import FaqList from '@/components/ui/FaqList';
import AuditCTA from '@/components/AuditCTA';
import { Magnetic, Reveal, SplitReveal, Counter } from '@/components/motion';
import { gsap, useGSAP, ScrollTrigger, EASE, prefersReducedMotion } from '@/lib/gsap';
import { BASE } from '@/lib/site';

/**
 * /services/seo/ — built from the draft Cami wrote as an artifact
 * (claude.ai/artifact/QF7dYxsGqHsN7PLpSCMma6). The words and the order of the
 * sections are the draft's; the look is the site's: Inter with the one italic
 * olive word, grey for what is read, olive for what matters, serif only for
 * the big figures.
 */

// ─── Pending data ────────────────────────────────────────────────────────────
// Everything the draft marked in yellow lives here, so filling it in is one
// edit. `null` renders a dashed "pending" mark instead of a figure. When the
// last one is gone, take the page's `robots: noindex` off and add it to the
// sitemap.

const PENDING = {
  caseLabel: null as string | null, // '[CLIENTE · INDUSTRIA · PERIODO]'
  stats: [
    { to: null as number | null, prefix: '+', suffix: '%', label: 'organic traffic in', months: null as number | null },
    { to: null as number | null, prefix: '', suffix: '', label: 'buying keywords on page one', months: null },
    { to: null as number | null, prefix: '+', suffix: '%', label: 'leads from organic search', months: null },
  ],
  quote: null as string | null,
  quoteBy: null as string | null, // 'Nombre · Cargo · Empresa'
  pagesPerMonth: null as number | null,
  monthlyPrice: null as string | null, // '$0,000'
  minimumTerm: null as string | null, // 'Plazo mínimo'
};

/** The yellow highlight from the draft, in the site's own terms: a dashed
    outline that inherits the colour of whatever it sits in. */
function Pending({ children, className = 'text-[0.78em]' }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      title="Pending data"
      className={`inline-block rounded-md border border-dashed border-current px-1.5 align-middle font-mono font-normal not-italic leading-normal tracking-normal opacity-60 ${className}`}
    >
      {children}
    </span>
  );
}

// ─── Copy ────────────────────────────────────────────────────────────────────

/** Three searches the hero cycles through, one per core industry. Illustrative,
    and labelled as such under the card. */
const SCENES = [
  {
    q: 'best compliance software for regional banks',
    answer:
      'Regional banks usually shortlist platforms that automate reporting and keep audit trails in one place. Guides from established vendors compare the leading options by exam readiness and integration effort.',
    sources: ['yourbrand.com', 'forbes.com', 'g2.com'],
    you: {
      url: 'yourbrand.com › guides › bank-compliance',
      title: 'How Regional Banks Choose Compliance Software (2026 Guide)',
      desc: 'A side-by-side look at audit trails, exam prep and core integrations, written by former bank examiners.',
    },
    others: [
      { url: 'competitor.com › blog', title: '10 Compliance Tools to Consider' },
      { url: 'review-site.com › category', title: 'Top Banking Compliance Platforms' },
    ],
  },
  {
    q: 'how do law firms choose e-discovery software',
    answer:
      'Most firms weigh review speed, defensible audit logs and how the platform fits their matter management. Buyer guides written by litigation specialists are the ones most often cited.',
    sources: ['yourbrand.com', 'law.com', 'capterra.com'],
    you: {
      url: 'yourbrand.com › guides › e-discovery',
      title: 'E-Discovery Software for Mid-Size Firms: A Buyer’s Guide',
      desc: 'Pricing models, review workflows and security standards, explained by litigation support specialists.',
    },
    others: [
      { url: 'competitor.com › resources', title: 'The E-Discovery Checklist' },
      { url: 'review-site.com › legal', title: 'Best E-Discovery Tools This Year' },
    ],
  },
  {
    q: 'what to look for in a telehealth platform for clinics',
    answer:
      'Clinics usually compare HIPAA compliance, EHR integration and effect on no-show rates. Clinician-reviewed comparisons tend to be the most trusted sources.',
    sources: ['yourbrand.com', 'healthit.gov', 'g2.com'],
    you: {
      url: 'yourbrand.com › guides › telehealth',
      title: 'Choosing a Telehealth Platform for Your Clinic (2026)',
      desc: 'Requirements, integrations and real costs, reviewed by practicing clinicians.',
    },
    others: [
      { url: 'competitor.com › blog', title: 'Telehealth Software Compared' },
      { url: 'review-site.com › health', title: 'Top Telemedicine Platforms' },
    ],
  },
];

const WHY = [
  'When a buyer asks an AI model which fintech platform to trust, the model goes looking for sources. It reads the pages it can reach, understand and believe. If your site is hard to crawl, thin on structure, or missing the pages that answer real buying questions, it simply won’t be part of that search.',
  'That’s why we treat SEO as the base of the whole operation. Rankings still bring qualified traffic to the companies that earn them, and the same signals behind those rankings (clear structure, topical depth and links from credible sites) are the ones AI systems lean on when they decide who to cite.',
  'What changes with Thallo is what we optimize for. We build every page around the questions your buyers actually ask, so the work pays off in Google’s results and in the answers that increasingly appear above them.',
];

const INCLUDED = [
  { tag: 'TECH', title: 'Technical SEO audit and fixes', copy: 'Crawlability, indexation, site speed, Core Web Vitals and schema markup, fixed in order of impact.' },
  { tag: 'INTENT', title: 'Keyword and question research', copy: 'The searches that lead to a decision, mapped by buyer intent and stage.' },
  { tag: 'ARCH', title: 'Site architecture and pillar pages', copy: 'Your expertise grouped into clear topic clusters that search engines can follow.' },
  { tag: 'ON-PAGE', title: 'On-page optimization', copy: 'Titles, headings, internal links and content gaps on the pages you already have.' },
  { tag: 'CONTENT', title: 'New content from category specialists', copy: 'Written by people who know your field and reviewed for accuracy before it goes live.' },
  { tag: 'LINKS', title: 'Link earning', copy: 'Original research, digital PR and placements on sites your industry already trusts.' },
  { tag: 'LOCAL', title: 'Local SEO', copy: 'Google Business Profile and location pages, when where you operate shapes how you sell.' },
  { tag: 'REPORT', title: 'Monthly reporting', copy: 'Rankings, organic traffic and the leads that came from them, in one clear report.' },
];

const STEPS = [
  { when: 'Weeks 1–2', title: 'Audit the foundation', copy: 'We crawl the site, review your Search Console data and benchmark you against the competitors ranking where you should be. You get a clear list of what’s holding the site back, ordered by impact.' },
  { when: 'Weeks 2–4', title: 'Map the questions', copy: 'We research the keywords and questions your buyers use at each stage of the decision and connect each one to the page that should own it. Some of those pages already exist and need work, while others still need to be built.' },
  { when: 'Month 2 onward', title: 'Build and fix', copy: 'With the map in place, our team fixes the technical issues, restructures key pages and publishes new content on a steady monthly rhythm. Each piece is written to rank and to be easy for AI models to quote.' },
  { when: 'Ongoing', title: 'Earn authority', copy: 'Good pages still need signals from outside your site. We earn links and mentions through original research, digital PR and relationships with publications in your industry.' },
  { when: 'Every month', title: 'Measure and adjust', copy: 'You see what moved, what didn’t and what we’re changing next. Rankings and traffic matter, and we go one step further by tying the report to the leads and conversations that came from organic search.' },
];

const INDUSTRIES = ['Fintech', 'Health tech', 'Legal tech', 'Specialized software', 'Professional services', 'Health & recovery'];

/** Top to bottom as drawn; built bottom-up when it comes into view. */
const LAYERS = [
  { key: 'PR', copy: 'Your name in the sources models trust', verb: 'Earned', inset: 'lg:mr-[18%]' },
  { key: 'GEO', copy: 'How AI models describe and recommend you', verb: 'Named', inset: 'lg:mr-[12%]' },
  { key: 'AEO', copy: 'Content that becomes the direct answer', verb: 'Quoted', inset: 'lg:mr-[6%]' },
  { key: 'SEO', copy: 'A site that’s found, read and trusted', verb: 'Found', inset: '', here: true },
];

const FAQS = [
  { q: 'How long does SEO take to show results?', a: 'Technical fixes can show impact within a few weeks, once Google recrawls the site. Rankings for competitive terms usually start moving between month three and month six, and the gains keep building for as long as the work continues.' },
  { q: 'Is SEO still worth it now that people use AI to search?', a: 'Yes. Google still handles the large majority of searches, and tools like ChatGPT and Perplexity rely on search indexes to find their sources. A site that ranks well is far more likely to be cited, so good SEO and AI visibility tend to grow together.' },
  { q: 'Do you work alongside our in-house team and developers?', a: 'Yes, and most engagements work that way. We give your developers clear, prioritized tickets for technical changes, or we implement them ourselves when we have access. Your team keeps ownership of the brand while we take care of search.' },
  { q: 'Do you guarantee first-page rankings?', a: 'No one can honestly guarantee a position on Google, and we won’t pretend to. What we commit to is a clear plan, steady execution and monthly reporting, so you can always see whether the work is moving the numbers that matter to you.' },
  { q: 'Do you offer SEO in Spanish and Portuguese?', a: 'We do. Our team produces content in English, Spanish and Portuguese, which helps companies selling across the United States and Latin America reach buyers in the language they actually search in.' },
  {
    q: 'Which platforms do you work with?',
    a: (
      <>
        We work on WordPress, Webflow, HubSpot and custom-built sites. If your platform limits what can be changed,
        the audit will tell you early, along with the workarounds that make sense. <Pending>[VALIDAR PLATAFORMAS]</Pending>
      </>
    ),
  },
];

// ─── Shared pieces ───────────────────────────────────────────────────────────

const H2 = 'font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl';
const KICKER = 'block text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400';
const LEAD = 'text-base font-medium leading-relaxed text-gray-500';

function Check({ light = false }: { light?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke={light ? '#CBD0AC' : '#55672E'}
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// ─── Hero: a search that ends with you quoted ────────────────────────────────

/**
 * The draft's search-results card, made to happen rather than sit there.
 *
 * Each pass types the query, opens the AI Overview with its citations, deals
 * the results in — and then your page climbs from third to first while the
 * other two step down. That climb is the page's whole argument in one move.
 * Three searches, one per industry, then round again. Paused while off
 * screen; a reduced-motion visitor gets the finished first card and no loop.
 */
function SerpCard() {
  const [scene, setScene] = useState(0);
  const s = SCENES[scene];
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const q = el.querySelector<HTMLElement>('[data-q]')!;
      if (prefersReducedMotion()) {
        q.textContent = s.q;
        return;
      }

      const you = el.querySelector<HTMLElement>('[data-row="you"]')!;
      const others = gsap.utils.toArray<HTMLElement>('[data-row="other"]', el);
      const gap = 10;
      const typed = { n: 0 };

      // Hidden now, in the layout phase — inside the timeline they would only
      // hide after its delay, and the finished card would flash first.
      gsap.set('[data-aio], [data-aio-line], [data-cite], [data-src], [data-row], [data-note], [data-badge]', { autoAlpha: 0 });
      gsap.set('[data-caret]', { autoAlpha: 1 });
      q.textContent = '';

      const tl = gsap.timeline({ delay: scene === 0 ? 0.6 : 0.15 });
      tl
        .to(typed, {
          n: s.q.length,
          duration: s.q.length * 0.035,
          ease: 'none',
          onUpdate: () => { q.textContent = s.q.slice(0, Math.round(typed.n)); },
        })
        .to('[data-aio]', { autoAlpha: 1, y: 0, duration: 0.5, ease: EASE.out, startAt: { y: 10 } }, '+=0.25')
        .to('[data-aio-line]', { autoAlpha: 1, duration: 0.6, stagger: 0.15 }, '-=0.2')
        .to('[data-cite]', { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.12, ease: 'back.out(3)', startAt: { scale: 0.3 } }, '-=0.2')
        .to('[data-src]', { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: EASE.out, startAt: { y: 6 } }, '-=0.2')
        // Dealt in already in the losing order: you third, the others above.
        .set(you, { y: () => others.reduce((h, o) => h + o.offsetHeight + gap, 0) })
        .set(others, { y: () => -(you.offsetHeight + gap) })
        .to([...others, you], { autoAlpha: 1, duration: 0.45, stagger: 0.1 }, '+=0.1')
        .addLabel('climb', '+=0.6')
        .to(you, { y: 0, duration: 1.1, ease: EASE.inOut }, 'climb')
        .to(others, { y: 0, duration: 1.1, ease: EASE.inOut, opacity: 0.5 }, 'climb')
        .to(you, { boxShadow: '0 0 0 1.5px #39471D, 0 18px 40px -22px rgba(57,71,29,0.55)', backgroundColor: '#FFFFFF', duration: 0.5 }, 'climb+=0.8')
        .to('[data-badge]', { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(3)', startAt: { scale: 0.4 } }, 'climb+=0.9')
        .to('[data-note]', { autoAlpha: 1, duration: 0.4 }, 'climb+=1')
        .to('[data-caret]', { autoAlpha: 0, duration: 0.01 }, 'climb')
        .to(el.querySelectorAll('[data-fade]'), { autoAlpha: 0, duration: 0.45, stagger: 0.03 }, '+=3.6')
        .call(() => setScene((scene + 1) % SCENES.length));

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? tl.resume() : tl.pause()),
      });
      return () => st.kill();
    },
    { scope: root, dependencies: [scene], revertOnUpdate: true }
  );

  return (
    <div ref={root} className="relative" aria-label="Illustration: a search results page where your guide is cited by the AI Overview and ranks first" role="img">

      <div className="relative rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_30px_70px_-36px_rgba(57,71,29,0.45)] sm:p-6">
        {/* The query bar */}
        <div className="flex items-center gap-3 rounded-full border border-gray-200 px-4 py-2.5 text-[14px] font-medium text-gray-800">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9CA3AF" strokeWidth="2" aria-hidden className="flex-shrink-0">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <span className="min-w-0 truncate">
            <span data-q>{s.q}</span>
            <span data-caret className="ml-px inline-block h-[1.05em] w-[1.5px] translate-y-[2px] animate-pulse bg-[#39471D] opacity-0" />
          </span>
        </div>

        {/* The AI Overview */}
        <div data-aio data-fade className="mt-4 rounded-2xl bg-[#F7F8F3] p-4">
          <div className="flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#39471D]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" /></svg>
            AI Overview
          </div>
          <p className="mt-2 text-[13.5px] font-medium leading-relaxed text-gray-700">
            <span data-aio-line>{s.answer}</span>
            <span data-cite className="ml-1 inline-block rounded bg-[#39471D] px-1.5 align-[1px] font-mono text-[10px] text-white">1</span>
            <span data-cite className="ml-1 inline-block rounded bg-[#39471D] px-1.5 align-[1px] font-mono text-[10px] text-white">2</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {s.sources.map((src, i) => (
              <span
                key={src}
                data-src
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] ${
                  i === 0 ? 'border-[#39471D] bg-white text-[#39471D]' : 'border-gray-200 bg-white text-gray-500'
                }`}
              >
                {src}
              </span>
            ))}
          </div>
        </div>

        {/* The results. Your row is drawn first and dealt in third, then climbs. */}
        <div className="mt-4">
          <div className="flex flex-col gap-[10px]">
            <div data-row="you" data-fade className="relative rounded-xl bg-white p-3">
              <span data-badge className="absolute right-3 top-3 rounded-full bg-[#39471D] px-2 py-0.5 font-mono text-[10.5px] text-white">#1</span>
              <div className="pr-10 font-mono text-[11px] text-gray-400 [overflow-wrap:anywhere]">{s.you.url}</div>
              <div className="mt-0.5 text-[15px] font-semibold leading-snug text-[#39471D]">{s.you.title}</div>
              <div className="mt-1 text-[12.5px] font-medium leading-snug text-gray-500">{s.you.desc}</div>
            </div>
            {s.others.map((o) => (
              <div key={o.url} data-row="other" data-fade className="rounded-xl px-3 py-1">
                <div className="font-mono text-[11px] text-gray-400">{o.url}</div>
                <div className="mt-0.5 text-[14px] font-semibold leading-snug text-gray-600">{o.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
          <span data-note data-fade className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#39471D]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#55672E] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#39471D]" />
            </span>
            Ranked first, and cited in the answer
          </span>
          <span className="font-mono text-[10.5px] text-gray-400">Illustrative example</span>
        </div>
      </div>

      {/* The isotipo on the card's corner, turning: the same flower the other
          heroes carry under their headline. Whole, and above the card. */}
      <SpinFlower className="absolute -right-7 -top-7 z-[2] hidden h-16 w-16 sm:block" secondsPerTurn={40} />
    </div>
  );
}

// ─── How it runs: a rail that fills as you read ──────────────────────────────

function Steps() {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const steps = gsap.utils.toArray<HTMLElement>('[data-step]', el);
      if (prefersReducedMotion()) {
        steps.forEach((s) => (s.dataset.on = 'true'));
        return;
      }

      gsap.fromTo(
        '[data-rail]',
        { scaleY: 0 },
        { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 65%', end: 'bottom 65%', scrub: 0.6 } }
      );

      steps.forEach((step) => {
        gsap.from(step.querySelectorAll('[data-step-part]'), {
          autoAlpha: 0,
          y: 18,
          duration: 0.8,
          ease: EASE.out,
          stagger: 0.08,
          scrollTrigger: { trigger: step, start: 'top 85%', once: true },
        });
        ScrollTrigger.create({
          trigger: step,
          start: 'top 65%',
          onEnter: () => (step.dataset.on = 'true'),
          onLeaveBack: () => (step.dataset.on = 'false'),
        });
      });
    },
    { scope: root }
  );

  return (
    <ol ref={root} className="relative">
      {/* The rail runs through the centres of the 36px markers. */}
      <span aria-hidden className="absolute bottom-10 left-[17px] top-10 w-px bg-gray-200" />
      <span aria-hidden data-rail className="absolute bottom-10 left-[17px] top-10 w-px origin-top bg-[#39471D]" />

      {STEPS.map((st, i) => (
        <li
          key={st.title}
          data-step
          data-on="false"
          className="group/step relative grid grid-cols-[36px_minmax(0,1fr)] gap-x-5 border-b border-gray-100 py-7 last:border-b-0 lg:grid-cols-[36px_150px_minmax(0,0.6fr)_minmax(0,1.3fr)] lg:gap-x-8"
        >
          <span
            className="relative z-[1] flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white font-mono text-[12px] text-gray-400 transition-all duration-500 group-data-[on=true]/step:border-[#39471D] group-data-[on=true]/step:bg-[#39471D] group-data-[on=true]/step:text-white"
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <span data-step-part className="font-mono text-[12px] text-gray-400 lg:pt-2">{st.when}</span>
          <h3 data-step-part className="col-start-2 mt-1 text-xl font-semibold tracking-tight text-gray-900 transition-colors duration-500 group-data-[on=true]/step:text-[#39471D] lg:col-start-auto lg:mt-0 lg:pt-1">
            {st.title}
          </h3>
          <p data-step-part className={`col-start-2 mt-2 max-w-[62ch] lg:col-start-auto lg:mt-0 lg:pt-1.5 ${LEAD}`}>{st.copy}</p>
        </li>
      ))}
    </ol>
  );
}

// ─── How it connects: the stack, built from the ground up ────────────────────

function Stack() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const layers = gsap.utils.toArray<HTMLElement>('[data-layer]', root.current).reverse();
      gsap.from(layers, {
        autoAlpha: 0,
        y: 36,
        scale: 0.96,
        duration: 0.9,
        ease: EASE.out,
        stagger: 0.16,
        scrollTrigger: { trigger: root.current, start: 'top 80%', once: true },
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="flex flex-col gap-2.5" aria-label="Thallo services, from the foundation upward">
      {LAYERS.map((l) =>
        l.here ? (
          <div
            key={l.key}
            data-layer
            aria-current="page"
            className="relative grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-2xl border border-[#39471D] bg-[#39471D] px-6 py-8 text-white shadow-[0_2px_6px_rgba(57,71,29,0.35),0_14px_32px_-8px_rgba(57,71,29,0.5)]"
          >
            <b className="font-mono text-[13px] font-normal text-[#CBD0AC]">{l.key}</b>
            <span className="text-[15px] font-semibold">{l.copy}</span>
            <small className="hidden items-center gap-2 font-mono text-[11px] text-[#CBD0AC] sm:inline-flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
              </span>
              {l.verb} · You are here
            </small>
          </div>
        ) : (
          // GSAP moves the outer box; the hover lift and its CSS transition
          // live on the inner one. On one element the transition fights the
          // tween, and a re-run mid-fade reads opacity 0 as the end value.
          <div key={l.key} data-layer className={l.inset}>
            <div className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50/60 px-6 py-7 transition-all duration-300 hover:bg-white lift">
              <b className="font-mono text-[13px] font-normal text-gray-400">{l.key}</b>
              <span className="text-[15px] font-medium text-gray-700">{l.copy}</span>
              <small className="hidden font-mono text-[11px] text-gray-400 sm:block">{l.verb}</small>
            </div>
          </div>
        )
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SeoLanding() {
  const heroCopy = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('[data-hero-in]', { autoAlpha: 0, y: 22, duration: 1, ease: EASE.out, stagger: 0.1, delay: 0.35 });
    },
    { scope: heroCopy }
  );

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-gray-100 bg-white pb-16 pt-32 2xl:pb-24 2xl:pt-40">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-14 px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-20">
          {/* Top-aligned, not centred: the card changes height a little with each
              search, and centring would nudge the headline every time it did. */}
          <div ref={heroCopy} className="lg:pt-12">
            <nav aria-label="Breadcrumb" data-hero-in className={KICKER}>
              <a href={`${BASE}/services/`} className="transition-colors hover:text-[#39471D]">Services</a>
              <span className="mx-2 text-gray-300">/</span>
              <span className="text-[#39471D]">SEO</span>
            </nav>
            <SplitReveal
              as="h1"
              scroll={false}
              fade={false}
              className="mb-6 mt-5 max-w-[16ch] font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl lg:text-6xl"
              html={'The search foundation your <span class="italic font-light text-[#39471D]">authority</span> is built on.'}
            />
            <p data-hero-in className="max-w-[52ch] text-base font-medium leading-relaxed text-gray-500 sm:text-lg">
              Most AI answers start with a search. ChatGPT, Perplexity and Google’s AI Overviews pull from pages that
              are already crawled, indexed and trusted, so{' '}
              <strong className="font-semibold text-gray-900">strong SEO is still the first step to being found</strong>{' '}
              and, more and more, to being named.
            </p>
            <div data-hero-in className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Magnetic>
                <a href="#start" className="inline-block w-full rounded-full border border-[#39471D] bg-[#39471D] px-7 py-3.5 text-center text-sm font-semibold text-white transition-all hover:border-[#55672E] hover:bg-[#55672E] sm:w-auto">
                  Book an audit <ArrowUpRight className="ml-0.5" />
                </a>
              </Magnetic>
              <a href={`${BASE}/thallo-ai/scan/`} className="inline-block w-full rounded-full border border-gray-200 px-7 py-3.5 text-center text-sm font-semibold text-gray-800 transition-all hover:border-gray-400 hover:bg-gray-50 sm:w-auto">
                Check my visibility <ArrowUpRight className="ml-0.5" />
              </a>
            </div>
          </div>

          <Reveal y={40} delay={0.2}>
            <SerpCard />
          </Reveal>
        </div>
      </section>

      {/* ── Why SEO still matters ─────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-16 2xl:py-24">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
          <div>
            <span className={`${KICKER} mb-4`}>Why SEO still matters</span>
            <SplitReveal className={H2} html={'Visibility still begins in <span class="italic font-light text-[#39471D]">search.</span>'} />
          </div>
          <Reveal stagger className="flex max-w-[64ch] flex-col gap-5">
            {WHY.map((p, i) => (
              <p key={i} className={i === 0 ? 'text-lg font-medium leading-relaxed text-gray-800' : LEAD}>{p}</p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── What's included ───────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-16 2xl:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mb-10 grid grid-cols-1 gap-6 lg:mb-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
            <div>
              <span className={`${KICKER} mb-4`}>What’s included</span>
              <SplitReveal className={H2} html={'What our SEO work <span class="italic font-light text-[#39471D]">covers.</span>'} />
            </div>
            <p className={`max-w-[52ch] ${LEAD}`}>
              Every engagement is scoped to your site and your category, and it usually brings together these pieces.
            </p>
          </div>

          <Reveal stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Reveal moves the outer box and leaves its transform inline; the
                hover lift lives on the inner one so nothing pins it. */}
            {INCLUDED.map((it) => (
              <div key={it.tag}>
              <div className="group/inc h-full rounded-2xl border border-gray-200 bg-gray-50/60 p-6 transition-all duration-300 hover:bg-white lift">
                <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.08em] text-[#55672E]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#55672E] transition-transform duration-300 group-hover/inc:scale-150" />
                  {it.tag}
                </span>
                <h3 className="mb-1.5 mt-4 font-sans text-[16px] font-semibold tracking-tight text-gray-900 transition-colors duration-300 group-hover/inc:text-[#39471D]">
                  {it.title}
                </h3>
                <p className="text-[13.5px] font-medium leading-relaxed text-gray-500">{it.copy}</p>
              </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── How it runs ───────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-16 2xl:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mb-8 grid grid-cols-1 gap-6 lg:mb-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
            <div>
              <span className={`${KICKER} mb-4`}>How it runs</span>
              <SplitReveal className={H2} html={'How an SEO engagement <span class="italic font-light text-[#39471D]">runs.</span>'} />
            </div>
            <p className={`max-w-[52ch] ${LEAD}`}>
              The work follows a clear order, because each step gives the next one something solid to stand on.
            </p>
          </div>
          <Steps />
        </div>
      </section>

      {/* ── Results ───────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-16 2xl:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <Reveal y={40} className="relative overflow-hidden rounded-[28px] bg-[#39471D] px-8 py-12 text-white sm:px-12 sm:py-14 lg:px-16 lg:py-16">
            <SpinFlower
              className="pointer-events-none absolute -bottom-40 -right-40 block h-[26rem] w-[26rem] opacity-[0.1] [&_img]:brightness-0 [&_img]:invert"
              secondsPerTurn={60}
            />
            <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <span className="mb-4 block text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">Results</span>
                <h2 className="font-sans text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
                  What this looks like in <span className="italic font-light text-[#CBD0AC]">practice.</span>
                </h2>
                <p className="mt-6 max-w-[48ch] text-base font-medium leading-relaxed text-[#CBD0AC]">
                  Our team has spent years running SEO for companies in healthcare, legal and financial services. Here is
                  one of those engagements, from the first audit to the numbers twelve months later.
                </p>
                <p className="mt-4 text-sm font-semibold text-white">
                  {PENDING.caseLabel ?? <Pending>[CLIENTE · INDUSTRIA · PERIODO]</Pending>}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-px self-start overflow-hidden rounded-2xl bg-white/15 sm:grid-cols-3">
                {PENDING.stats.map((st, i) => (
                  <div key={i} className="bg-[#39471D] p-6">
                    <b className="block font-serif text-5xl font-normal leading-none text-white">
                      {st.to === null ? (
                        <Pending className="text-xl">{st.prefix}00{st.suffix}</Pending>
                      ) : (
                        <Counter to={st.to} prefix={st.prefix} suffix={st.suffix} />
                      )}
                    </b>
                    <small className="mt-3 block text-[13px] font-medium leading-snug text-[#CBD0AC]">
                      {st.label}
                      {i === 0 && (
                        <> {st.months === null ? <Pending>[X]</Pending> : st.months} months</>
                      )}
                    </small>
                  </div>
                ))}
              </div>

              <blockquote className="border-t border-white/15 pt-8 lg:col-span-2">
                <p className="max-w-[60ch] font-serif text-2xl italic leading-snug text-white sm:text-3xl">
                  {PENDING.quote ?? <Pending className="text-base">[Cita del cliente, una o dos frases sobre el resultado]</Pending>}
                </p>
                <cite className="mt-4 block font-mono text-[12px] not-italic text-[#CBD0AC]">
                  {PENDING.quoteBy ?? <Pending>[Nombre · Cargo · Empresa]</Pending>}
                </cite>
              </blockquote>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Who it's for ──────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-16 2xl:py-24">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
          <div>
            <span className={`${KICKER} mb-4`}>Who it’s for</span>
            <SplitReveal className={H2} html={'Built for industries where trust decides the <span class="italic font-light text-[#39471D]">sale.</span>'} />
          </div>
          <div className="max-w-[64ch]">
            <Reveal stagger className="flex flex-col gap-5">
              <p className="text-lg font-medium leading-relaxed text-gray-800">
                We work with companies in fintech, health tech, legal tech, specialized software, professional services
                and health and recovery. In these categories a buyer researches for weeks before reaching out, and every
                search along the way is a chance to show up as the expert they’re looking for.
              </p>
              <p className={LEAD}>
                These are also industries where accuracy carries real weight. Our writers and editors have spent years
                producing content for healthcare providers, legal teams and financial firms, so the pages we publish are
                built to meet Google’s quality standards for topics that affect people’s health and money.
              </p>
            </Reveal>
            <Reveal stagger className="mt-8 flex flex-wrap gap-2">
              {INDUSTRIES.map((name) => (
                <span key={name} className="inline-flex">
                <a
                  href={`${BASE}/industries/`}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-all duration-300 hover:text-[#39471D] lift-sm"
                >
                  {name}
                </a>
                </span>
              ))}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How it connects ───────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-16 2xl:py-24">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:gap-20">
          <div>
            <span className={`${KICKER} mb-4`}>How it connects</span>
            <SplitReveal className={`${H2} mb-6`} html={'One part of a bigger <span class="italic font-light whitespace-nowrap text-[#39471D]">visibility plan.</span>'} />
            <Reveal stagger className="flex max-w-[60ch] flex-col gap-5">
              <p className={LEAD}>
                SEO makes your site easy to find and easy to trust. From there, AEO shapes your content so it gets pulled
                into direct answers and featured snippets, and GEO focuses on how ChatGPT, Perplexity, Gemini and Claude
                describe and recommend you. Digital PR then places your name in the publications those systems already
                rely on.
              </p>
              <p className={LEAD}>
                You can start with SEO on its own, and many clients do. As the foundation gets stronger, adding the other
                layers usually speeds everything up, because each one feeds the next.
              </p>
            </Reveal>
          </div>
          <Stack />
        </div>
      </section>

      {/* ── Two ways to begin ─────────────────────────────────────────────── */}
      <section id="start" className="scroll-mt-24 border-b border-gray-100 bg-white py-16 2xl:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="mb-10 grid grid-cols-1 gap-6 lg:mb-14 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-14">
            <div>
              <span className={`${KICKER} mb-4`}>How to start</span>
              <SplitReveal className={H2} html={'Two ways to <span class="italic font-light text-[#39471D]">begin.</span>'} />
            </div>
            <p className={`max-w-[52ch] ${LEAD}`}>
              Start with the audit if you want the full picture first, or go straight into SEO if you already know it’s
              what you need.
            </p>
          </div>

          <Reveal stagger className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
            {/* The audit — the same plan, the same price, as on /services/. */}
            <div>
            <div className="flex h-full flex-col rounded-3xl border border-gray-200 bg-gray-50/60 p-8 shadow-[0_6px_20px_-8px_rgba(23,26,16,0.14)] transition-all duration-500 lift sm:p-10">
              <span className="mb-6 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">One-time / Diagnosis</span>
              <h3 className="mb-3 text-2xl font-semibold text-gray-900">AI Visibility Audit</h3>
              <p className="mb-7 text-sm font-medium leading-relaxed text-gray-500">
                A full review of where you stand in search and in AI answers, with a plan you keep whether or not we work
                together.
              </p>
              <ul className="flex flex-col gap-3">
                {['Technical SEO health check', 'Your rankings against your top competitors', 'How AI models describe you today', 'A 90-day plan you can act on'].map((li) => (
                  <li key={li} className="flex items-start gap-2.5 text-sm font-medium text-gray-700"><Check />{li}</li>
                ))}
              </ul>
              <div className="mt-auto pt-8"><div className="border-t border-gray-200/70 pt-6">
                <span className="block text-base font-bold tracking-tight text-gray-900">$1,000</span>
                <span className="mt-1 block text-[13px] font-medium leading-snug text-gray-500">Fixed price, one-time.</span>
                <a href="#enquiry" className="mt-5 block rounded-full border border-gray-200 px-5 py-3 text-center text-sm font-semibold text-gray-900 transition-colors hover:border-[#39471D] hover:text-[#39471D]">
                  Book an audit <ArrowUpRight className="ml-0.5" />
                </a>
              </div></div>
            </div>
            </div>

            {/* The program — featured, so it wears the olive. */}
            <div>
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#39471D] bg-[#39471D] p-8 shadow-[0_2px_6px_rgba(57,71,29,0.35),0_10px_28px_-4px_rgba(57,71,29,0.55)] transition-transform duration-500 hover:-translate-y-1 sm:p-10">
              <img
                loading="lazy"
                decoding="async"
                src={`${BASE}/isotipo.png`}
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute -right-[10.5rem] -top-[10.5rem] w-[26rem] rotate-[18deg] select-none opacity-[0.11]"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <div className="relative mb-6 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Monthly / SEO</span>
              </div>
              <h3 className="relative mb-3 text-2xl font-semibold text-white">SEO Program</h3>
              <p className="relative mb-7 text-sm font-medium leading-relaxed text-[#CBD0AC]">
                The ongoing work of fixing, building and earning authority for your site, reported every month.
              </p>
              <ul className="relative flex flex-col gap-3">
                <li className="flex items-start gap-2.5 text-sm font-medium text-gray-100"><Check light />Technical fixes and site architecture</li>
                <li className="flex items-start gap-2.5 text-sm font-medium text-gray-100">
                  <Check light />
                  <span>{PENDING.pagesPerMonth ?? <Pending>[X]</Pending>} new or optimized pages per month</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm font-medium text-gray-100"><Check light />Link earning and digital PR placements</li>
                <li className="flex items-start gap-2.5 text-sm font-medium text-gray-100"><Check light />Monthly report tied to leads</li>
              </ul>
              <div className="relative mt-auto pt-8"><div className="border-t border-white/15 pt-6">
                <span className="block text-base font-bold tracking-tight text-white">
                  {PENDING.monthlyPrice ?? <Pending>$0,000</Pending>} / month
                </span>
                <span className="mt-1 block text-[13px] font-medium leading-snug text-[#CBD0AC]">
                  {PENDING.minimumTerm ?? <Pending>[Plazo mínimo]</Pending>}. Scales with the size of your site.
                </span>
                <a href="#enquiry" className="mt-5 block rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-[#39471D] transition-colors hover:text-[#171A10]">
                  Talk about SEO <ArrowUpRight className="ml-0.5" />
                </a>
              </div></div>
            </div>
            </div>
          </Reveal>

          <p className="mt-12 text-center text-base font-medium leading-relaxed text-gray-500">
            Want SEO, AI visibility, research and distribution run as one operation?{' '}
            <a href={`${BASE}/services/`} className="font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-[#39471D] hover:decoration-[#39471D]">
              See the Authority Engine
            </a>{' '}
            on Our Plans.
          </p>
        </div>
      </section>

      {/* ── Close, with the enquiry form ──────────────────────────────────────
          Before the questions, as on every other page: the FAQ closes. */}
      <AuditCTA
        image={`${BASE}/cta-bg-services.webp`}
        heading={<>Find out where you<br />stand in search.</>}
        copy="Our audit shows how your site ranks, what’s holding it back and how AI models describe you today. It’s the clearest starting point for any SEO plan."
      />

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white py-16 2xl:py-24">
        <div className="mx-auto max-w-[1440px] px-6">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:gap-20">
            <div>
              <SplitReveal className={`${H2} mb-4`} html={'Questions about <span class="italic font-light text-[#39471D]">SEO.</span>'} />
              <p className={`max-w-[42ch] ${LEAD}`}>What people usually ask before they start.</p>
            </div>
            <FaqList items={FAQS} idPrefix="seo-faq" />
          </div>
        </div>
      </section>
    </>
  );
}
