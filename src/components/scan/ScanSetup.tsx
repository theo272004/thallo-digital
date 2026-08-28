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
 * The visitor writes their own prompts, up to `MAX_QUESTIONS` — three on the
 * free tier as it stands. This is a deliberate
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

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, Globe2, Link2, LockKeyhole, Plus, RotateCcw, Sparkles, X } from 'lucide-react';
import { BTN_PRIMARY, BTN_SECONDARY, FIELD, Head, Notice, Panel, Tint } from './ui';
import { checkAllowance } from '@/lib/scan/engine';
import { BASE } from '@/lib/site';
import { Combo, Select } from './Dropdown';
import ConsentCheck from '@/components/ui/ConsentCheck';
import { suggestedQuestions } from '@/lib/scan/questions';
import { DEFAULT_MARKET, MARKETS, marketById } from '@/lib/scan/markets';
import {
  INDUSTRIES,
  MAX_QUESTIONS,
  cleanDomain,
  emailDomain,
  isDomain,
  isWorkEmail,
  type Rematch,
  type ScanInput,
  type ScanQuota,
} from '@/lib/scan/types';

type Step = 1 | 2;

/* Deliberately loose. The server validates properly with `is_email()`, and the
   only job here is to catch the typo before an expensive scan starts — a
   stricter pattern in the browser rejects real addresses and teaches nobody
   anything. */
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

/**
 * Where a half-filled form is kept while the visitor is somewhere else.
 *
 * `ScanFlow` unmounts this component the moment a scan starts — the progress
 * screen replaces it — so every field lived only as long as the mount, and a
 * scan the server refused dropped the visitor back onto a blank step 1. That
 * is not a small annoyance: the refusals that send you back here are the ones
 * about the address and the allowance, so the person most likely to lose their
 * three questions is the person who was told something they now have to act
 * on. It was reported as "I had to type everything in three times", and the
 * third time the questions were not the same questions.
 *
 * `sessionStorage`, not React state lifted into the parent: it also survives a
 * reload and a back button, which are the other two ways out of this form.
 * It is per-tab and it is not a cookie, and what it holds is what the visitor
 * has already typed into the page it is on.
 *
 * Consent is deliberately NOT in it. A tick restored from storage is a consent
 * nobody gave in this session, and re-ticking a box costs one click against a
 * form it took a minute to write.
 */
const DRAFT_KEY = 'thallo.scan.draft';

interface Draft {
  step: Step;
  brand: string;
  domain: string;
  industry: string;
  market: string;
  questions: string[];
  email: string;
}

/**
 * Forget the draft.
 *
 * Called by `ScanFlow` when a scan has actually come back, and deliberately
 * NOT when one is started. The refusals this draft exists for — a spent
 * allowance, an address the server will not accept — arrive after the run has
 * begun, so clearing on start would empty the form in the one case it is there
 * to survive. That was the first version of this and it was wrong.
 */
export function clearScanDraft() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* Nothing to do about it, and nothing depending on it. */
  }
}

function readDraft(): Draft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<Draft>;
    if (!Array.isArray(d.questions)) return null;
    return {
      step: d.step === 2 ? 2 : 1,
      brand: typeof d.brand === 'string' ? d.brand : '',
      domain: typeof d.domain === 'string' ? d.domain : '',
      industry: typeof d.industry === 'string' ? d.industry : '',
      market: typeof d.market === 'string' && d.market ? d.market : DEFAULT_MARKET,
      questions: d.questions.filter((q): q is string => typeof q === 'string').slice(0, MAX_QUESTIONS),
      email: typeof d.email === 'string' ? d.email : '',
    };
  } catch {
    return null;
  }
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
] as const;

const COUNTRIES = Array.from(new Map(MARKETS.map((m) => [m.country, m])).values());

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[13px] font-bold text-gray-900">{children}</span>;
}

export default function ScanSetup({
  onStart,
  /* What is left of the free allowance, counted on the server. Optional
     because the setup screen has to render before that call comes back — and
     because a quota lookup that fails must not stand between a visitor and a
     scan the server would have allowed. Absent, the counter simply does not
     print. */
  quota,
  /* A scan to start from rather than a blank form.
   *
   * Set when the visitor pressed "run these same questions against Northmark"
   * at the bottom of a report: everything carries over except the company being
   * measured, because a competitor comparison is only a comparison if the
   * questions, the category and the market are identical. Seeded into state
   * rather than held here — every field stays editable, and the visitor may
   * well want to change the category once they see whose report it is.
   *
   * Read once, on mount. `ScanFlow` remounts this component with a new key
   * when a rematch starts, which is what makes "read once" the whole
   * implementation rather than an effect that would fight the visitor's typing.
   */
  initial,
  /* Reported up because the page around this changes with it: step 1 sits in
     the right half of a photograph with the heading beside it, and step 2 —
     which grows a row every time a question is added — takes the full width on
     the plain ground. ScanFlow cannot lay that out without knowing the step,
     and lifting the whole step state up there would have dragged the
     validation with it. */
  onStepChange,
}: {
  onStart: (input: ScanInput) => void;
  quota?: ScanQuota | null;
  initial?: Rematch | null;
  onStepChange?: (step: Step) => void;
}) {
  const [step, setStepState] = useState<Step>(1);
  const setStep = (next: Step) => {
    setStepState(next);
    onStepChange?.(next);
  };

  const [brand, setBrand] = useState(initial?.brand ?? '');
  /* Blank unless we have evidence, and the evidence is narrow: a host the
     models themselves opened whose name matches the competitor. We will not
     guess a website from a company name — the brand match keys on the domain
     root, so a wrong guess reports a competitor as absent from answers that
     named them, which is the one failure mode this whole report is built to
     avoid. Left empty, the visitor types it, which takes four seconds. */
  const [domain, setDomain] = useState(initial?.domain ?? '');
  /* Empty, not pre-filled with the first suggestion. A default here is the
     answer most people would leave alone, and it is wrong for all but one of
     them — that is exactly how every scan came to be measured against fintech.
     A rematch is the exception: the category is the one thing that must not
     change, or the two reports are not comparable. */
  const [industry, setIndustry] = useState(initial?.industry ?? '');
  const [market, setMarket] = useState(initial?.market ?? DEFAULT_MARKET);
  /** One empty row to start, so the first thing on screen is a cursor. */
  const [questions, setQuestions] = useState<string[]>(initial?.questions?.length ? initial.questions : ['']);
  const [email, setEmail] = useState(initial?.email ?? '');
  /* Never pre-ticked, not even on a rematch where the address carried over.
     Consent under Law 1581 has to be an affirmative act, and a box that arrives
     ticked is the textbook way of not getting one — the two seconds it saves are
     not worth holding a consent we could not show was given. The address is
     different: the visitor typed it, and carrying it forward is remembering what
     they told us rather than deciding something on their behalf. */
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');

  /* ── Restoring the draft ──────────────────────────────────────────────────
   *
   * In an effect, and never in a state initialiser. This page is a static
   * export: the HTML is rendered at build time with an empty form in it, and a
   * first client render that already carried a restored draft is a different
   * tree from the one being hydrated. React does not reconcile that, it throws
   * the server's markup away and warns — which is a real bug and not only a
   * console message, because everything else on this page is prerendered too.
   *
   * So the form mounts empty, matching the HTML, and fills on the first commit.
   * `hydrated` also gates the writer below: without it the writer would run on
   * that same first commit, see the empty form, and overwrite the draft it is
   * about to be restored from.
   */
  const [hydrated, setHydrated] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- restoring in a state
     initialiser is what the rule would have instead, and it is exactly what
     breaks hydration here: this page is prerendered with an empty form, so the
     form has to render empty and fill on the first commit. */
  useEffect(() => {
    /* A rematch seed outranks a draft — it is a deliberate instruction about
       what this form should contain, and the draft is only a memory of what
       was last typed. */
    const d = initial ? null : readDraft();

    if (d) {
      setBrand(d.brand);
      setDomain(d.domain);
      setIndustry(d.industry);
      setMarket(d.market);
      setQuestions(d.questions.length ? d.questions : ['']);
      setEmail(d.email);
      /* Through `setStep`, so `ScanFlow` is told: a restored draft can land on
         step 2, and the page would otherwise draw the step-1 photograph behind
         the step-2 card. */
      if (d.step === 2) setStep(2);
    }

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  /* Written on every change rather than on leaving the step, because the way
     out of this form is not a navigation we get told about — it is a scan
     starting, and by the time we would hear about that this component is
     already gone. */
  useEffect(() => {
    if (typeof window === 'undefined' || !hydrated) return;
    try {
      window.sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ step, brand, domain, industry, market, questions, email } satisfies Draft)
      );
    } catch {
      /* Private browsing, a full quota, a locked-down browser. Losing the
         draft is the old behaviour, and it is not worth a broken form. */
    }
  }, [hydrated, step, brand, domain, industry, market, questions, email]);

  /* ── The address, checked before the button rather than after ─────────────
   *
   * Three things can be wrong with it and only one of them was ever caught
   * here: the shape, which the pattern above handles; the provider, which is a
   * hard gate the server also enforces; and the allowance, which until now was
   * only discoverable by spending an attempt on it.
   *
   * That last one produced the worst sequence in the whole tool. Press Run
   * scan → the progress screen appears → the scan is refused → back to an
   * empty form with a sentence at the top about an address that is no longer
   * on screen. The visitor has been told they have run out AND lost the three
   * questions they wrote, in one move, and the natural reading is that the
   * form is broken rather than that the allowance is spent.
   *
   * So the allowance is asked for as soon as there is a plausible address to
   * ask about, debounced, and the answer sits under the field. `null` means we
   * do not know — a lookup that failed, or one still in flight — and it never
   * blocks anything on its own.
   */
  /* The answer is stored WITH the address it is about, and read back only
     while that is still the address in the field. Storing the answer alone
     meant the previous address's allowance was still standing during the half
     second after the field changed — long enough to open the button against a
     run the server was about to refuse, which is the exact fault this whole
     lookup exists to close. It also means nothing has to be cleared: a stale
     answer stops applying by not matching, rather than by an effect racing to
     wipe it. */
  const [answered, setAnswered] = useState<{ email: string; quota: ScanQuota | null } | null>(null);
  const [looking, setLooking] = useState(false);

  const trimmedEmail = email.trim();
  const checkable = isEmail(trimmedEmail) && isWorkEmail(trimmedEmail);
  const site = cleanDomain(domain);

  const addressQuota = answered && answered.email === trimmedEmail ? answered.quota : null;
  const checking = checkable && looking && !addressQuota;

  useEffect(() => {
    if (!checkable) return;

    let live = true;
    /* Long enough that typing an address does not fire a request per
       keystroke, short enough that the answer is there before anybody has
       finished ticking the consent box. */
    const timer = window.setTimeout(() => {
      if (!live) return;
      setLooking(true);
      checkAllowance(trimmedEmail, isDomain(site) ? site : '')
        .then((q) => {
          if (live) setAnswered({ email: trimmedEmail, quota: q });
        })
        .finally(() => {
          if (live) setLooking(false);
        });
    }, 500);

    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, [checkable, trimmedEmail, site]);

  const selectedMarket = marketById(market);
  const country = selectedMarket.country;
  const language = selectedMarket.language;

  /* Three questions, one per archetype, in the chosen language and already
     carrying the category and the country. They are what step 2 starts from —
     see `continueToPrompts` — rather than a list to pick from, because an empty
     row is where a contaminated question gets written and a free tier is only
     three attempts wide. */
  const suggestions = useMemo(() => suggestedQuestions(industry.trim(), market), [industry, market]);

  const filled = questions.map((q) => q.trim()).filter(Boolean);

  /* Which rows are still exactly as suggested. Drives the small angle label
     beside each one and nothing else: the moment a row is edited it is the
     visitor's question and labelling it "the buyer's problem" would be us
     describing their words back to them. */
  const untouched = questions.map((q, i) => !!suggestions[i] && q === suggestions[i].question);

  const useSuggestions = () => {
    if (!suggestions.length) return;
    setQuestions(suggestions.map((s) => s.question));
    setError('');
  };

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

  /* ── What stands between this form and a scan ─────────────────────────────
   *
   * Every one of these used to be discovered by pressing the button, and two of
   * them were discovered on the far side of a screen that had already thrown
   * the form away. They are computed here so the button can be shut and the
   * reason can be printed beside the field that owns it.
   */

  /** The allowance, as tightly as we currently know it. The address-specific
      answer when we have one, and the browser-and-network answer otherwise. */
  const allowance = addressQuota ?? quota ?? null;
  const spent = allowance ? allowance.remaining <= 0 : false;
  /* Written for somebody who does not know there are four counters and should
     never be told: naming which one is binding is naming what to change. */
  const spentReason =
    allowance?.reason ??
    'You have reached the limit of free scans. Book an audit and we will run the full question set against your category, with the sources behind every answer.';

  const [emailTouched, setEmailTouched] = useState(false);

  /** What is wrong with the address, said under the field. The shape complaint
      waits for the field to be left — nobody needs to be told an address is
      invalid while they are still halfway through typing it. */
  const emailFault: string | null =
    trimmedEmail === ''
      ? null
      : !isEmail(trimmedEmail)
        ? emailTouched
          ? 'That does not look like an email address yet.'
          : null
        : !isWorkEmail(trimmedEmail)
          ? `${emailDomain(trimmedEmail)} is a personal mailbox. Free scans are sent to company addresses — use your work one and the report goes there.`
          : spent
            ? spentReason
            : null;

  /** Why the button is shut, in the order a visitor would fix them. Null when
      it is open.
   *
   * Printed beside the button only when `emailFault` is not already printing
   * the same thing under the field — two copies of "hotmail.com is a personal
   * mailbox" on one screen reads as the form shouting. */
  const blocked: string | null = spent
    ? spentReason
    : !filled.length
      ? 'Write at least one question you want the models asked.'
      : !isEmail(trimmedEmail)
        ? 'Add the work address the report should be sent to.'
        : !isWorkEmail(trimmedEmail)
          ? `Free scans are sent to company addresses — ${emailDomain(trimmedEmail)} is a personal mailbox.`
          : !consent
            ? 'Tick the box to say we may email you the report.'
            : null;

  const continueToPrompts = (e: React.FormEvent) => {
    e.preventDefault();

    /* Refused here rather than three fields later. If the allowance is already
       gone when the page loads, sending somebody through to write three
       questions is asking them to do work we know we will not honour. */
    if (spent) {
      setError(spentReason);
      return;
    }

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
      setError('Say what category you want to be found in — for example “legal tech” or “claims automation software”.');
      return;
    }
    setError('');

    /* Filled here rather than in an effect, and only when there is nothing to
       overwrite. A visitor who typed two questions, went back to fix the
       category and came forward again must find their two questions where they
       left them — an effect keyed on the category would have thrown them away,
       which is the worst possible moment to lose somebody's typing. */
    if (!filled.length && suggestions.length) {
      setQuestions(suggestions.map((s) => s.question));
    }

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

    /* One check, because `blocked` is the same rule the button is drawn from —
       two copies of it are two chances for the button to be open against a run
       that will be refused, which is exactly how this screen got its worst
       sequence. Keyboard submits and anything that beats the disabled state
       land here. */
    if (blocked) {
      setError(blocked);
      return;
    }

    if (!list.length) {
      setError('Write at least one question you want the models asked.');
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
            <Head
              badge="1."
              title="Your brand"
              sub="The essentials to start your scan"
              /* The allowance, before anything is spent. It used to be
                 discoverable only by hitting it: a visitor ran a third scan,
                 got a 429 and learned there had been a limit all along. Three
                 is generous and saying so costs nothing — what it buys is that
                 the person on their third scan knows it is their third. */
              chip={quota ? `Scan ${Math.min(quota.limit, quota.limit - quota.remaining + 1)} of ${quota.limit}` : undefined}
            />

            {/* The allowance, when it is gone, before a single field is
                filled in. It used to be possible to complete both screens and
                press the button before finding this out — and the button threw
                the form away on its way to telling you. */}
            {spent && (
              <div className="mt-6">
                <Notice>
                  <strong className="font-bold">{spentReason}</strong>{' '}
                  <a href={`${BASE}/contact/`} className="underline underline-offset-2">
                    Book an audit
                  </a>
                  .
                </Notice>
              </div>
            )}

            {/* What was carried over, and what is still missing.
                A form that silently arrives full is unsettling — the visitor
                cannot tell what it decided for them — and the one field it
                could not fill is the one thing standing between them and the
                report, so it gets named rather than left to be discovered by
                pressing Continue. */}
            {initial && (
              <div className="mt-6 rounded-xl border border-[#CBD0AC] bg-[#F4F6EE] px-4 py-3.5">
                <p className="text-[12.5px] font-medium leading-relaxed text-[#39471D]">
                  <strong className="font-bold">
                    Same questions, same category, same market — measured against {initial.brand}.
                  </strong>{' '}
                  {domain
                    ? `We took ${domain} from the pages the models opened when they named them. Correct it if that is not their site.`
                    : `Add their website and the two reports will be directly comparable. We do not guess it: a wrong domain reports a company as absent from answers that named them.`}
                </p>
              </div>
            )}

            {/* Brand and website pair, category takes the full width because it
                carries the longest hint, country and language pair. Everything
                collapses to one column below `sm`, where a single column is the
                right answer rather than a symptom. */}
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2.5">
                <FieldLabel>Brand name</FieldLabel>
                <span className="relative">
                  <Building2 size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Ledgerly" maxLength={80} autoComplete="organization" className={`${FIELD} pl-11`} />
                </span>
                <span className="text-[11px] font-medium text-gray-400">The name we look for in every answer</span>
              </label>

              <label className="flex flex-col gap-2.5">
                <FieldLabel>Website</FieldLabel>
                <span className="relative">
                  <Link2 size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourcompany.com" autoComplete="url" className={`${FIELD} pl-11`} />
                </span>
                <span className="text-[11px] font-medium text-gray-400">We&apos;ll analyze your site and content signals</span>
              </label>

              {/* Free text with the catalogue as suggestions, not a closed
                  dropdown. The entries never were a backend constraint —
                  `industry_label()` passes anything it does not recognise
                  straight through — and a closed list quietly forces a business
                  to file itself under the nearest wrong option, which is then
                  the category phase 2 searches Google for. A wrong answer
                  chosen from a menu still reads as a real one.

                  What the suggestions and the placeholder say is a targeting
                  decision, not a copy one. This field is the widest part of the
                  funnel: whatever is printed in it is what most people type,
                  and the placeholder used to read "pizzerias, legal tech,
                  wedding photography" against a service that starts at $2,500 a
                  month. Two of those three were never going to buy, and the
                  scans they ran cost the same as the ones that would. */}
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
                  /* The placeholder is an example of the ANSWER, and the list
                     under it is a shortcut — they were two different registers
                     before, a placeholder of long specific phrases over a menu
                     of short broad ones, and the mismatch read as the field
                     contradicting itself. Both now describe the same kind of
                     thing, and the hint says outright that neither is a
                     constraint. */
                  placeholder="Type your category — e.g. claims automation software"
                  hint="Type your own category — anything a buyer would search for. The list below is only a shortcut."
                  className={`${FIELD}`}
                />
                <span className="text-[11px] font-medium text-gray-400">
                  Write whatever a buyer would search for — you are not limited to the list. Be as specific as you can:
                  “contract lifecycle management” measures something; “software” does not.
                </span>
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
                  className={`${FIELD}`}
                />
              </div>

              <div className="flex min-w-0 flex-col gap-2.5">
                <FieldLabel>Language</FieldLabel>
                <Select
                  label="Language"
                  value={language}
                  onChange={setLanguage}
                  options={LANGUAGES.map((l) => ({ value: l.value, label: l.label }))}
                  className={`${FIELD}`}
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

              <button
                type="submit"
                disabled={spent}
                className={`${BTN_PRIMARY} w-full shrink-0 px-8 py-4 sm:w-auto`}
              >
                Continue <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </Panel>
      </div>
    );
  }

  return (
    /* The full width of the console, not 820px centred in it.
       Centred, this card left 380px of empty ground down either side of a
       1600px window — the proportions of a phone screen again, which is the
       exact fault step 1 was rebuilt to fix, and a visitor who has just come
       off a spread that used the whole screen arrives at a column half its
       width. The width is spent on a spread rather than on stretching a text
       field to 1300px: the questions take the left, and the guidance, the
       address and the summary of what will happen take the right, where they
       can be read while typing instead of only after scrolling past. */
    <div className="w-full">
      {/* Tighter padding than step 1 on small screens. Step 1 is five short
          fields; this is fifteen rows of free text, and at the step-1 padding
          the field a visitor types a whole sentence into was 191px wide on a
          375px phone. The row chrome gives way for the same reason — see the
          numeral and the remove button below. */}
      <Panel className="p-5 sm:p-10">
        <Head
          badge="2."
          title="Your questions"
          sub={`Write what you want the models asked — up to ${MAX_QUESTIONS}`}
          chip={`${filled.length} / ${MAX_QUESTIONS}`}
        />

        {/* One column until `xl`, not `lg`. At 1024 the split leaves the right
            column 278px wide — an email field and two paragraphs in a gutter —
            and a single column is honestly better there. The spread only earns
            its keep once there is something to spread. The rule between the
            halves is the card's own hairline, drawn on the left edge of the
            second column and only at that breakpoint: stacked, a vertical rule
            points at nothing. */}
        <div className="mt-7 grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] xl:gap-12">
          <div className="min-w-0">
            {/* The one thing that silently invalidates a scan, said before the
                first keystroke rather than after the results.

                The rows below arrive filled rather than empty — see
                `continueToPrompts`. A blank field is where the two questions
                that waste an attempt get written: one with the brand's own name
                in it, and one with no category in it at all. Both come back
                looking like answers. Starting from three valid questions and
                editing down is a different task from writing three from
                nothing, and it is the one this screen should be asking for. */}
            <Tint edged className="flex items-start gap-3">
              <Sparkles size={19} className="mt-0.5 shrink-0 text-[#CBD0AC]" />
              <p className="text-[12.5px] font-medium leading-relaxed text-[#E7ECD9]">
                <strong className="font-bold text-white">These are yours to edit — leave your brand name out of them.</strong>{' '}
                {/* `inCountry` and not the bare country name: this is a
                    sentence, and the picker's label is not. It carries the
                    preposition the market's own language takes, so the line
                    reads "in the United States" and "no Brasil" rather than
                    the article-less version a label needs. */}
                {suggestions.length
                  ? `We have written one question per angle for ${industry.trim()} ${selectedMarket.inCountry}: the category, the buyer's problem, and the alternatives to whoever leads it. Change any of them. A question that names you only measures whether the model will agree with you.`
                  : 'Ask what a buyer would type before they know you exist. A question that names you only measures whether the model will agree with you.'}
              </p>
            </Tint>

            <div className="mt-6 flex flex-col gap-3">
              {questions.map((question, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  {/* What this row is playing, and only while it is still ours
                      to describe. The label disappears the moment the row is
                      edited, because at that point the question is the
                      visitor's and captioning their words with our archetype
                      would be describing their intent back to them. */}
                  {untouched[i] && suggestions[i] && (
                    <span className="pl-0 text-[10px] font-bold uppercase tracking-[.1em] text-gray-400 sm:pl-8">
                      {suggestions[i].angle}
                    </span>
                  )}
                  <div className="flex items-center gap-2 sm:gap-3">
                  <span className="hidden w-5 shrink-0 text-right text-[12px] font-bold tabular-nums text-gray-300 sm:block">{i + 1}</span>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => editQuestion(i, e.target.value)}
                    onPaste={(e) => {
                      /* A list pasted in one go becomes a list.
                       *
                       * An <input> flattens newlines, so pasting three questions
                       * into one field silently produced one 200-character question
                       * with all three inside it — and the scan then asked that,
                       * three times, of three models. It looked like a typo in the
                       * report and it was really the form throwing the shape of what
                       * was pasted away. Writing questions somewhere else and
                       * bringing them over is the normal way to arrive here, so the
                       * form should expect it. */
                      const lines = e.clipboardData
                        .getData('text')
                        .split(/\r?\n/)
                        .map((l) => l.trim())
                        .filter(Boolean);

                      if (lines.length < 2) return;
                      e.preventDefault();

                      setQuestions((prev) => {
                        const next = [...prev];
                        /* Fills from the field that was pasted into, and stops at
                           the ceiling rather than dropping the overflow silently —
                           the counter above says how many were taken. */
                        lines.forEach((line, offset) => {
                          const at = i + offset;
                          if (at < MAX_QUESTIONS) next[at] = line.slice(0, 200);
                        });
                        return next.slice(0, MAX_QUESTIONS);
                      });
                    }}
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
                    className={`${FIELD} min-w-0 flex-1`}
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
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={addQuestion}
                disabled={questions.length >= MAX_QUESTIONS}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-3 text-[13px] font-semibold text-gray-600 transition-colors hover:border-[#39471D] hover:text-[#39471D] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-300 disabled:hover:text-gray-600"
              >
                <Plus size={16} /> Add question
              </button>

              {/* The way back. Editing three questions down to nothing useful is
                  a normal thing to do at eleven at night, and without this the
                  only way to recover the suggested set was to go back a step and
                  clear the category. Hidden once there is nothing to restore. */}
              {suggestions.length > 0 && !untouched.every(Boolean) && (
                <button
                  type="button"
                  onClick={useSuggestions}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-[13px] font-semibold text-gray-600 transition-colors hover:border-[#39471D] hover:text-[#39471D]"
                >
                  <RotateCcw size={15} /> Start from our three again
                </button>
              )}
            </div>
          </div>

          {/* ── The right half ────────────────────────────────────────────────
              Where the report goes, and what is about to be spent to make it.
              Both were below the questions before, which on a wide screen meant
              a visitor typed three questions and then scrolled past nothing to
              reach an address field — and the sentence naming the three models
              and the market arrived after the button that runs them. */}
          <div className="min-w-0 xl:border-l xl:border-gray-100 xl:pl-12">
            {/* Asked here, not after a free half. Every question is put to three
                models with the web open and each of those calls is billed as it is
                made, so there is nothing to give away first — and the report is
                sent rather than only shown, which is the thing the address buys. */}
            <Tint>
              <label htmlFor="scan-email" className="text-[13px] font-bold tracking-tight text-white">
                Your work email
              </label>
              <p className="mt-1.5 mb-3.5 max-w-[54ch] text-[12px] font-medium leading-relaxed text-[#E7ECD9]">
                The report opens on screen as soon as it is ready, and the fuller version — every question, every
                source, the technical read of your site — is emailed to you. Company addresses only: a Gmail or Outlook
                address will be turned down.
              </p>
              <input
                id="scan-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@yourcompany.com"
                autoComplete="email"
                aria-invalid={emailFault ? true : undefined}
                aria-describedby={emailFault ? 'scan-email-fault' : undefined}
                /* Capped while the card is one column, where a field running
                   the full 780px to hold "you@company.com" reads as a mistake;
                   uncapped once it is the right half of the spread, where the
                   column is narrower than the cap anyway. */
                className={`${FIELD} sm:max-w-[340px] xl:max-w-none ${
                  emailFault ? 'border-rose-300 focus:border-rose-400' : ''
                }`}
              />

              {/* Under the field it is about, in the moment it becomes true —
                  not in the error strip at the bottom of the card after the
                  button, and above all not on the next screen. A personal
                  address and a spent allowance are both refusals this form can
                  see coming, and both used to be delivered by a scan that
                  appeared to start and then did not. */}
              {emailFault && (
                <p id="scan-email-fault" className="mt-2.5 text-[12px] font-semibold leading-relaxed text-[#FFC9C9]" role="status">
                  {emailFault}
                </p>
              )}

              <div className="mt-3.5">
                <ConsentCheck id="scan-setup-consent" checked={consent} onChange={setConsent} onDark />
              </div>
            </Tint>

            {/* `country` keeps its article here — "a buyer in the United States".
                The picker above strips it because a label is not a sentence; this
                is a sentence. */}
            {/* Names all five, because all five are run and the report prints
                all five. Saying "ChatGPT, Claude and Gemini" described phase 1
                and stopped there — so the two sources a reader is most likely
                to have heard of in this context, Perplexity and the Google
                results page, arrived in the report unannounced. */}
            <p className="mt-5 text-[12px] font-medium leading-relaxed text-gray-500">
              {`Each question is put to ChatGPT, Claude and Gemini, in ${selectedMarket.languageLabel}, as a buyer in ${country} — twice over: once from memory, and once with web search on. We then run the same question through Perplexity and read the Google results page and its AI Overview, and we check what the crawlers can see on ${site || 'your site'}. We count how often ${brand.trim() || 'your brand'} is named and where it ranks.`}
            </p>
          </div>
        </div>

        {error && <div className="mt-6"><Notice>{error}</Notice></div>}

        <div className="mt-7 flex flex-col-reverse items-stretch gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={() => setStep(1)} className={BTN_SECONDARY}>
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:gap-4">
            {/* What is still missing, next to the button that is waiting for
                it. The button being shut is not an explanation, and a disabled
                button with nothing beside it is the version of this screen
                people described as broken. */}
            {blocked && !emailFault && (
              <span className="max-w-[46ch] text-[12px] font-semibold leading-relaxed text-gray-500">{blocked}</span>
            )}
            <button
              type="button"
              onClick={runScan}
              /* Shut until the run would actually be accepted. It used to be
                 open on the questions alone, so a personal address or a spent
                 allowance was something you found out by pressing it — and
                 pressing it is what unmounted the form. `checking` holds it for
                 the half-second the allowance lookup takes rather than letting
                 a run start against an answer we are about to receive. */
              disabled={!!blocked || checking}
              className={`${BTN_PRIMARY} shrink-0`}
            >
              {checking ? 'Checking…' : 'Run scan'} <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
