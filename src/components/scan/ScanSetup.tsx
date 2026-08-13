'use client';

/**
 * The two screens that stand between a visitor and a scan.
 *
 * ## Step 1 — who is being measured
 *
 * Brand, website, industry, country, language. All five are load-bearing and
 * none can be inferred from the others:
 *
 *   · the **brand** is the string matched against every answer, so a scan
 *     cannot derive it from the domain — `seoforstartups.co` is not what a
 *     model would call the company, and matching on the wrong token reports a
 *     zero that isn't real. It briefly did exactly that.
 *   · the **industry** decides the phase-2 search query and is printed on the
 *     report.
 *   · **country** and **language** are separate on purpose — see `markets.ts`.
 *     The language picks the words; the country tells the model who is asking.
 *
 * ## Step 2 — what gets asked
 *
 * The visitor writes their own prompts, up to fifteen. This is a deliberate
 * trade: a fixed question set makes two brands comparable and makes the same
 * brand comparable to itself next month, and letting people write their own
 * gives that up. What it buys is a tool that fits businesses the eight-item
 * industry list does not describe. The audit trail prints exactly what was
 * sent, so a run is always traceable even when it is not a benchmark.
 *
 * The one piece of guidance shown here is worth more than the rest of the
 * screen: **the brand's own name must not appear in the question.** "Is Thallo
 * any good?" invites a model to be agreeable about a company it has never
 * heard of, and measures nothing. That failure is silent — it returns a
 * flattering number — so the hint sits next to the field rather than in a help
 * page nobody opens.
 */

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Globe2, Link2, LockKeyhole, Plus, Sparkles, X } from 'lucide-react';
import { FIELD, Notice, Panel } from './ui';
import { Combo, Select } from './Dropdown';
import ConsentCheck from '@/components/ui/ConsentCheck';
import { buildQuestions } from '@/lib/scan/questions';
import { DEFAULT_MARKET, MARKETS, marketById } from '@/lib/scan/markets';
import { INDUSTRIES, MAX_QUESTIONS, cleanDomain, isDomain, type ScanInput } from '@/lib/scan/types';

type Step = 1 | 2;

/* Deliberately loose. The server validates properly with `is_email()`, and the
   only job here is to catch the typo before an expensive scan starts — a
   stricter pattern in the browser rejects real addresses and teaches nobody
   anything. */
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
] as const;

const COUNTRIES = Array.from(new Map(MARKETS.map((m) => [m.country, m])).values());

function StepBadge({ n }: { n: number }) {
  /* Filled olive with the numeral in white, rather than a pale disc with olive
     type. It is the marker for which of two steps you are on, and a tint reads
     as decoration where a filled one reads as a position. */
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#39471D] text-[15px] font-bold text-white">{n}.</span>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[13px] font-bold text-gray-900">{children}</span>;
}

export default function ScanSetup({
  onStart,
  /* Reported up because the page around this changes with it: step 1 sits in
     the right half of a photograph with the heading beside it, and step 2 —
     which grows a row every time a question is added — takes the full width on
     the plain ground. ScanFlow cannot lay that out without knowing the step,
     and lifting the whole step state up there would have dragged the
     validation with it. */
  onStepChange,
}: {
  onStart: (input: ScanInput) => void;
  onStepChange?: (step: Step) => void;
}) {
  const [step, setStepState] = useState<Step>(1);
  const setStep = (next: Step) => {
    setStepState(next);
    onStepChange?.(next);
  };
  const [brand, setBrand] = useState('');
  const [domain, setDomain] = useState('');
  /* Empty, not pre-filled with the first suggestion. A default here is the
     answer most people would leave alone, and it is wrong for all but one of
     them — that is exactly how every scan came to be measured against fintech. */
  const [industry, setIndustry] = useState('');
  const [market, setMarket] = useState(DEFAULT_MARKET);
  /** One empty row to start, so the first thing on screen is a cursor. */
  const [questions, setQuestions] = useState<string[]>(['']);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');

  const selectedMarket = marketById(market);
  const country = selectedMarket.country;
  const language = selectedMarket.language;

  /* One real question, in the chosen language, for the chosen category. Not a
     list to pick from — a single example of the shape, so that "leave your
     brand out of it" is demonstrated rather than only asserted. Falls back to
     a suggestion so the sentence reads even if the field is somehow empty. */
  const example = buildQuestions(industry.trim() || INDUSTRIES[0], market)[0];

  const filled = questions.map((q) => q.trim()).filter(Boolean);

  const setCountry = (nextCountry: string) => {
    const matching = MARKETS.find((m) => m.country === nextCountry && m.language === language) ?? MARKETS.find((m) => m.country === nextCountry);
    if (matching) setMarket(matching.id);
  };

  const setLanguage = (nextLanguage: string) => {
    const matching = MARKETS.find((m) => m.country === country && m.language === nextLanguage) ?? MARKETS.find((m) => m.language === nextLanguage);
    if (matching) setMarket(matching.id);
  };

  const editQuestion = (i: number, value: string) =>
    setQuestions((prev) => prev.map((q, n) => (n === i ? value : q)));

  const addQuestion = () =>
    setQuestions((prev) => (prev.length >= MAX_QUESTIONS ? prev : [...prev, '']));

  /* Never leaves the list empty — removing the last row clears it instead, so
     the screen cannot reach a state with nothing to type into. */
  const removeQuestion = (i: number) =>
    setQuestions((prev) => (prev.length === 1 ? [''] : prev.filter((_, n) => n !== i)));

  const continueToPrompts = (e: React.FormEvent) => {
    e.preventDefault();
    const name = brand.trim().slice(0, 80);
    if (!name) {
      setError('Enter the brand name buyers would search for.');
      return;
    }
    if (!isDomain(cleanDomain(domain))) {
      setError('Enter a valid website, e.g. yourcompany.com');
      return;
    }
    if (!industry.trim()) {
      setError('Say what category you want to be found in — anything from “pizzerias” to “legal tech”.');
      return;
    }
    setError('');
    setStep(2);
  };

  const runScan = () => {
    /* Deduped case-insensitively: the same prompt twice is the same answer
       twice, and it would be paid for twice and counted twice in the share of
       voice. */
    const seen = new Set<string>();
    const list: string[] = [];
    for (const q of filled) {
      const key = q.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(q.slice(0, 200));
      if (list.length === MAX_QUESTIONS) break;
    }

    if (!list.length) {
      setError('Write at least one question you want the models asked.');
      return;
    }

    /* Asked for here rather than halfway through the report. Every question is
       put to three models with web search on, and each of those calls is billed
       the moment it is made — so there is no free half to hand out first, and
       nothing is spent on somebody we could not send the result to. */
    if (!isEmail(email)) {
      setError('Enter a valid email address — the report is sent there when it is ready.');
      return;
    }

    if (!consent) {
      setError('Tick the box to say we may email you the report.');
      return;
    }

    setError('');
    onStart({
      brand: brand.trim().slice(0, 80),
      domain: cleanDomain(domain),
      industry: industry.trim().slice(0, 120),
      market,
      questions: list,
      email: email.trim(),
    });
  };

  if (step === 1) {
    return (
      /* No width of its own any more: this card is the right-hand half of the
         photograph now, and the column it sits in sets how wide it is. It was
         720px centred in a 1392 container with five fields stacked down it —
         the proportions of a phone screen shown on a desktop, which is exactly
         what it looked like. The fields still pair up two to a row, which is
         what keeps the whole step above the fold. */
      <div className="w-full">
        <Panel className="p-6 sm:p-8">
          <form onSubmit={continueToPrompts}>
            <div className="flex items-start gap-3">
              <StepBadge n={1} />
              <div>
                <h2 className="text-[22px] font-bold tracking-tight text-gray-900">Your brand</h2>
                <p className="mt-1 text-[14px] font-medium text-gray-500">The essentials to start your scan</p>
              </div>
            </div>

            {/* Brand and website pair, category takes the full width because it
                carries the longest hint, country and language pair. Everything
                collapses to one column below `sm`, where a single column is the
                right answer rather than a symptom. */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2.5">
                <FieldLabel>Brand name</FieldLabel>
                <span className="relative">
                  <Building2 size={17} className="pointer-events-none absolute left-4 top-3.5 text-gray-400" />
                  <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Ledgerly" maxLength={80} autoComplete="organization" className={`${FIELD} rounded-xl py-3.5 pl-11 text-[15px]`} />
                </span>
                <span className="text-[11px] font-medium text-gray-400">The name we look for in every answer</span>
              </label>

              <label className="flex flex-col gap-2.5">
                <FieldLabel>Website</FieldLabel>
                <span className="relative">
                  <Link2 size={17} className="pointer-events-none absolute left-4 top-3.5 text-gray-400" />
                  <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourcompany.com" autoComplete="url" className={`${FIELD} rounded-xl py-3.5 pl-11 text-[15px]`} />
                </span>
                <span className="text-[11px] font-medium text-gray-400">We&apos;ll analyze your site and content signals</span>
              </label>

              {/* Free text with the catalogue as suggestions, not a closed
                  dropdown. The eight entries never were a backend constraint —
                  `industry_label()` passes anything it does not recognise
                  straight through — and a closed list quietly forces a pizzeria
                  to file itself under "Professional services", which is then
                  the category phase 2 searches Google for. A wrong answer
                  chosen from a menu still reads as a real one. */}
              {/* Not a <datalist>. The native one is drawn by the operating
                  system — on Windows a black panel with violet rows — and takes
                  no styling whatsoever. `Combo` is a real input with our own
                  list under it, so it stays typeable and free text still wins. */}
              <div className="flex flex-col gap-2.5 sm:col-span-2">
                <FieldLabel>Category</FieldLabel>
                <Combo
                  label="Category"
                  value={industry}
                  onChange={setIndustry}
                  options={INDUSTRIES}
                  maxLength={120}
                  placeholder="e.g. pizzerias, legal tech, wedding photography"
                  className={`${FIELD} rounded-xl py-3.5 text-[15px]`}
                />
                <span className="text-[11px] font-medium text-gray-400">What you want to be found as — anything you like, or pick a suggestion</span>
              </div>

              {/* Direct children of the grid above rather than a nested
                  two-column grid of their own — nested, they shared one cell
                  and each ended up a quarter of the card wide. */}
              <div className="flex min-w-0 flex-col gap-2.5">
                <FieldLabel>Country</FieldLabel>
                <Select
                  label="Country"
                  value={country}
                  onChange={setCountry}
                  icon={<Globe2 size={17} className="shrink-0 text-gray-400" />}
                  options={COUNTRIES.map((m) => ({ value: m.country, label: m.country.replace(/^the /, '') }))}
                  className={`${FIELD} rounded-xl py-3.5 text-[15px]`}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-2.5">
                <FieldLabel>Language</FieldLabel>
                <Select
                  label="Language"
                  value={language}
                  onChange={setLanguage}
                  options={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
                  className={`${FIELD} rounded-xl py-3.5 text-[15px]`}
                />
              </div>
            </div>

            {error && <div className="mt-5"><Notice>{error}</Notice></div>}

            {/* Button and reassurance share a row instead of stacking, which
                is another 60px of height back and reads better on a card this
                wide: a full-width button across 1040px is a banner, not a
                button. Stacked again below `sm`. */}
            <div className="mt-6 flex flex-col-reverse items-center gap-5 border-t border-gray-100 pt-5 sm:flex-row sm:justify-between">
              <span className="flex items-start gap-2 text-center sm:text-left">
                <LockKeyhole size={14} className="mt-0.5 shrink-0 text-[#39471D]" />
                <span className="text-[12px] font-medium leading-relaxed text-gray-500">
                  <strong className="font-bold text-gray-700">No credit card required</strong>
                  <br />Free scan · Results in under a minute
                </span>
              </span>

              <button type="submit" className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#39471D] px-8 py-4 text-[14px] font-bold text-white transition-colors hover:bg-[#55672E] sm:w-auto">
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </Panel>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[820px]">
      {/* Tighter padding than step 1 on small screens. Step 1 is five short
          fields; this is fifteen rows of free text, and at the step-1 padding
          the field a visitor types a whole sentence into was 191px wide on a
          375px phone. The row chrome gives way for the same reason — see the
          numeral and the remove button below. */}
      <Panel className="p-5 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <StepBadge n={2} />
            <div>
              <h2 className="text-[22px] font-bold tracking-tight text-gray-900">Your questions</h2>
              <p className="mt-1 text-[14px] font-medium text-gray-500">Write what you want the models asked — up to {MAX_QUESTIONS}</p>
            </div>
          </div>
          <span className="rounded-full bg-[#39471D]/10 px-3.5 py-2 text-[12px] font-bold tabular-nums text-[#39471D]">{filled.length} / {MAX_QUESTIONS}</span>
        </div>

        {/* The one thing that silently invalidates a scan, said before the
            first keystroke rather than after the results. */}
        <div className="mt-7 flex items-start gap-3 rounded-xl border border-[#D9E2C8] bg-[#F7FAF2] px-4 py-4 sm:px-5">
          <Sparkles size={19} className="mt-0.5 shrink-0 text-[#39471D]" />
          {/* The example is the generated question for this industry and market,
              not a hardcoded English one — a Spanish scan shown an English
              sample teaches the wrong shape. Written as a template literal
              because `{expr} companies` loses its space the moment a formatter
              rewraps the line; that bug has shipped here before. */}
          <p className="text-[12.5px] font-medium leading-relaxed text-[#55672E]">
            <strong className="font-bold">Leave your brand name out of the question.</strong>{' '}
            {`Ask what a buyer would type before they know you exist — like “${example}”. A question that names you only measures whether the model will agree with you.`}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {questions.map((question, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              <span className="hidden w-5 shrink-0 text-right text-[12px] font-bold tabular-nums text-gray-300 sm:block">{i + 1}</span>
              <input
                type="text"
                value={question}
                onChange={(e) => editQuestion(i, e.target.value)}
                onKeyDown={(e) => {
                  /* Enter adds the next row instead of submitting — this list
                     is the whole screen, and typing fifteen questions should
                     not mean reaching for the mouse fifteen times. */
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (question.trim() && questions.length < MAX_QUESTIONS && i === questions.length - 1) addQuestion();
                  }
                }}
                maxLength={200}
                placeholder={i === 0 ? 'Write your first question…' : 'Add another question…'}
                className={`${FIELD} min-w-0 flex-1 rounded-xl py-3.5 text-[14px]`}
              />
              <button
                type="button"
                onClick={() => removeQuestion(i)}
                aria-label={`Remove question ${i + 1}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-600 sm:h-9 sm:w-9"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addQuestion}
          disabled={questions.length >= MAX_QUESTIONS}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-[13px] font-semibold text-gray-600 transition-colors hover:border-[#39471D] hover:text-[#39471D] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-gray-600"
        >
          <Plus size={16} /> Add question
        </button>

        {/* Asked here, not after a free half. Every question is put to three
            models with the web open and each of those calls is billed as it is
            made, so there is nothing to give away first — and the report is
            sent rather than only shown, which is the thing the address buys. */}
        <div className="mt-7 rounded-xl bg-[#F4FAF5] p-4 sm:p-5">
          <label htmlFor="scan-email" className="text-[13px] font-bold tracking-tight text-gray-900">
            Where should we send the report?
          </label>
          <p className="mt-1.5 mb-3.5 max-w-[54ch] text-[12px] font-medium leading-relaxed text-gray-500">
            The full report opens on screen as soon as it is ready, and we email you a copy so you do not have to keep
            this tab open.
          </p>
          <input
            id="scan-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            className={`${FIELD} rounded-xl py-3.5 text-[15px] sm:max-w-[340px]`}
          />
          <div className="mt-3.5">
            <ConsentCheck id="scan-setup-consent" checked={consent} onChange={setConsent} />
          </div>
        </div>

        {error && <div className="mt-5"><Notice>{error}</Notice></div>}

        {/* `country` keeps its article here — "a buyer in the United States".
            The picker above strips it because a label is not a sentence; this
            is a sentence. */}
        <p className="mt-6 border-t border-gray-100 pt-5 text-[12px] font-medium leading-relaxed text-gray-500">
          {`Each question is put to ChatGPT, Claude and Gemini, in ${selectedMarket.languageLabel}, as a buyer in ${country}. We count how often ${brand.trim() || 'your brand'} is named and where it ranks.`}
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button type="button" onClick={() => setStep(1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-50"><ArrowLeft size={16} /> Back</button>
          <button
            type="button"
            onClick={runScan}
            disabled={!filled.length}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#39471D] px-6 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#55672E] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#39471D]"
          >
            Run scan <ArrowRight size={17} />
          </button>
        </div>
      </Panel>
    </div>
  );
}
