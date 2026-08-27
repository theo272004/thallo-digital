'use client';

import React from 'react';
import { FileText, Gauge, Link2, ListChecks, MessagesSquare, TrendingUp, Trophy } from 'lucide-react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import AnswerLists from './AnswerLists';
import AuditTrail from './AuditTrail';
import TrendChart from './TrendChart';
import { DownloadReport, Diagnosis, Indicator, Rivals, SignalRow } from './FullReport';
import { BTN_PRIMARY, BTN_SECONDARY, Head, Micro, Panel, ProviderMark, Stat, Tint, Verdict } from './ui';
import {
  MEMORY_PROVIDERS,
  PROVIDER_LABEL,
  type AnyProvider,
  type ProviderResult,
  type ScanPhase1,
  type ScanPhase2,
} from '@/lib/scan/types';
import { BASE } from '@/lib/site';

/**
 * The report, as a console.
 *
 * ## Why this exists
 *
 * The report was one page and it had earned every one of its panels — two
 * indicators, the diagnosis, the rivals of both readings, seventy-two answers,
 * the signals, the plan, the trail. Read top to bottom it argues well. The
 * trouble is that nobody reads a report top to bottom twice: the second visit
 * is somebody looking for one thing, and a page you scroll is a page where
 * finding that thing is your problem.
 *
 * So the same material, addressed. Seven destinations down the left, each one
 * answering a single question, and the summary carrying the answer to "how did
 * we do" with a way through to everything under it.
 *
 * ## Sections, not routes
 *
 * The obvious build is a route per section. It is the wrong one here, and for a
 * reason that has nothing to do with taste: a scan lives in React state and
 * nowhere else — the site is a static export and the run is not persisted
 * anywhere the browser could read back — so a real navigation between routes
 * would unmount the scan and land the reader on an empty console. The URL hash
 * carries the section instead, which survives a reload of the same tab no
 * better, but which makes the back button work inside a session and costs
 * nothing.
 *
 * ## Everything stays mounted
 *
 * The inactive sections are `hidden`, not unrendered, because the download
 * button prints the page — and a printed report that stops at whichever tab was
 * open is not the report. `@media print` in globals.css puts all seven back,
 * in the same block where it is already resolving the reveals.
 */

type SectionId = 'summary' | 'answers' | 'rivals' | 'sources' | 'trend' | 'actions' | 'reports';

const SECTIONS: { id: SectionId; label: string; icon: React.ReactNode }[] = [
  { id: 'summary', label: 'Summary', icon: <Gauge size={15} /> },
  { id: 'answers', label: 'Questions & answers', icon: <MessagesSquare size={15} /> },
  { id: 'rivals', label: 'Competitors', icon: <Trophy size={15} /> },
  { id: 'sources', label: 'Sources found', icon: <Link2 size={15} /> },
  { id: 'trend', label: 'Over time', icon: <TrendingUp size={15} /> },
  { id: 'actions', label: 'What to do now', icon: <ListChecks size={15} /> },
  { id: 'reports', label: 'Method & report', icon: <FileText size={15} /> },
];

const isSection = (value: string): value is SectionId => SECTIONS.some((s) => s.id === value);

export default function ReportConsole({ phase1, phase2 }: { phase1: ScanPhase1; phase2: ScanPhase2 }) {
  /* The hash is read as the initial value rather than assigned from an effect.
     A `setState` in an effect body renders the console twice on every mount and
     the linter rejects it — rightly — but the reason to avoid it here is that
     the first of those two renders would paint the summary before swapping to
     the section that was actually asked for.

     Reading `window` in an initialiser is safe in this one component and
     nowhere else on the page: the console only ever mounts after a scan has
     run, so it is not in the prerendered HTML and has no server render to
     disagree with. */
  const [section, setSection] = React.useState<SectionId>(() => {
    if (typeof window === 'undefined') return 'summary';
    const fromHash = window.location.hash.replace('#', '');
    return isSection(fromHash) ? fromHash : 'summary';
  });

  /* Written on every change, so a reader can hand somebody "…/scan/#rivals"
     inside a session and the back button walks the sections rather than
     leaving the tool. */
  React.useEffect(() => {
    const onHash = () => {
      const next = window.location.hash.replace('#', '');
      if (isSection(next)) setSection(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = React.useCallback((next: SectionId) => {
    setSection(next);
    /* `replaceState` rather than assigning `location.hash`: the assignment
       makes the browser jump to an element with that id, and this page has
       one — the section it just switched to — so choosing a tab scrolled the
       console half off the top of the window. */
    window.history.replaceState(null, '', `#${next}`);
  }, []);

  /* The searching reading, or nothing. `totalAnswers` rather than mere
     presence: an object that came back with no answers in it is a reading that
     was attempted and failed, and every panel below has to say "not measured"
     rather than draw a zero. */
  const grounded = phase2.grounded && phase2.grounded.totalAnswers > 0 ? phase2.grounded : null;
  const history = phase2.history ?? [];
  const scoredSignals = phase2.signals.filter((s) => s.weight > 0);
  const maxTech = scoredSignals.reduce((sum, s) => sum + s.weight, 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:gap-8">
      <ConsoleNav current={section} onGo={go} brand={phase1.brand} />

      <div className="min-w-0">
        <ConsoleHeader phase1={phase1} />

        <Pane active={section === 'summary'} id="summary">
          <Summary phase1={phase1} phase2={phase2} grounded={grounded} maxTech={maxTech} onGo={go} />
        </Pane>

        <Pane active={section === 'answers'} id="answers">
          <Panel>
            <Head
              badge={<MessagesSquare size={18} />}
              level="section"
              title="What the models answered"
              sub={`Every list, in the order each model gave it. Both indicators are simply how often ${phase1.brand} appears in these lists — open a question to see it.`}
            />
            <div className="mt-6">
              <AnswerLists phase1={phase1} grounded={phase2.grounded} />
            </div>
          </Panel>
        </Pane>

        <Pane active={section === 'rivals'} id="rivals">
          <Panel>
            <Rivals phase1={phase1} grounded={grounded ?? undefined} retrieval={phase2.retrieval} />
          </Panel>
        </Pane>

        <Pane active={section === 'sources'} id="sources">
          <SourcesSection phase1={phase1} phase2={phase2} grounded={grounded} />
        </Pane>

        <Pane active={section === 'trend'} id="trend">
          <Panel>
            <Head
              badge={<TrendingUp size={18} />}
              level="section"
              title="Brand knowledge over time"
              sub={`Every scan of ${phase1.domain} in this market, oldest first — the no-search reading. AI visibility is measured on every scan but not yet kept as a series.`}
            />
            {history.length > 0 ? (
              <div className="mt-6">
                <TrendChart history={history} brand={phase1.brand} />
              </div>
            ) : (
              <p className="mt-6 text-[13px] font-medium leading-relaxed text-gray-600">
                This is the first scan of {phase1.domain} in this market, so there is nothing to compare it against yet.
                The line starts here.
              </p>
            )}
          </Panel>
        </Pane>

        <Pane active={section === 'actions'} id="actions">
          <div className="flex flex-col gap-5">
            <Panel>
              <Head
                badge={<ListChecks size={18} />}
                level="section"
                title="What to do first"
                sub="Ordered by what the scan found, heaviest unmet signal first — not by a fixed script."
              />
              <div className="mt-6 flex flex-col gap-2.5">
                {phase2.actions.map((a, i) => (
                  <ActionRow key={a.title} index={i} action={a} />
                ))}
              </div>
            </Panel>

            <Panel>
              <Head
                badge={<Gauge size={18} />}
                level="section"
                title="Website & technical signals"
                sub={`Checked against ${phase1.domain}. Every action above is the remedy for a row here.`}
                chip={`${phase2.techScore} / ${maxTech}`}
              />
              <div className="mt-6">
                {phase2.signals.map((s) => (
                  <SignalRow key={s.id} signal={s} />
                ))}
              </div>
            </Panel>
          </div>
        </Pane>

        <Pane active={section === 'reports'} id="reports">
          <Panel>
            <AuditTrail phase1={phase1} grounded={phase2.grounded} />

            <div className="mt-7 flex flex-col gap-6 border-t border-gray-100 pt-7 lg:flex-row lg:items-center lg:justify-between">
              <Head
                badge={<FileText size={18} />}
                level="section"
                title="This is the measurement. The work is the other half."
                sub="A commissioned engagement takes the plan above and executes it — the content, the citations and the structure that move these numbers."
              />
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <a href={`${BASE}/contact/`} className={BTN_PRIMARY}>
                  Talk to us <ArrowUpRight className="text-[12px]" />
                </a>
                <a href={`${BASE}/services/`} className={BTN_SECONDARY}>
                  See what we do
                </a>
              </div>
            </div>
          </Panel>
        </Pane>
      </div>
    </div>
  );
}

/**
 * One section of the console.
 *
 * Hidden rather than unrendered — see the note at the top of the file. The id
 * is on the wrapper so the hash has something to name; `aria-hidden` keeps the
 * six sections nobody is looking at out of a screen reader's way; and
 * `data-console-pane` is what the print stylesheet reaches for to bring all
 * seven back for a printed copy.
 */
function Pane({ active, id, children }: { active: boolean; id: SectionId; children: React.ReactNode }) {
  return (
    <div
      id={id}
      data-console-pane=""
      hidden={!active}
      aria-hidden={!active}
      className={active ? 'block' : 'hidden'}
    >
      {children}
    </div>
  );
}

/**
 * The rail down the left.
 *
 * White type on the console's own dark ground rather than a panel of its own:
 * it is the furniture the panels sit in, and drawing it as another white card
 * would make the navigation look like a first section of the report.
 */
function ConsoleNav({
  current,
  onGo,
  brand,
}: {
  current: SectionId;
  onGo: (id: SectionId) => void;
  brand: string;
}) {
  return (
    <nav data-print="hide" aria-label="Report sections" className="lg:sticky lg:top-24 lg:self-start">
      {/* Below `lg` the rail is a scrolling row of chips above the report. A
          column of seven full-width buttons there is a screen of navigation
          before the first number. */}
      <div className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
        {SECTIONS.map((s) => {
          const on = s.id === current;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onGo(s.id)}
              aria-current={on ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-control px-3.5 py-2.5 text-left text-[13px] font-semibold transition-colors lg:w-full ${
                on ? 'bg-white/12 text-white' : 'text-[#CBD0AC]/75 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <span className={on ? 'text-[#CBD0AC]' : 'text-[#CBD0AC]/60'}>{s.icon}</span>
              <span className="whitespace-nowrap">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Whose report this is, at the foot of the rail. One line, because the
          brand is already in the heading beside it — this is the console saying
          which brand it is currently pointed at, which is the thing a second
          scan in the same session makes ambiguous. */}
      <div className="mt-5 hidden items-center gap-2.5 border-t border-white/12 pt-4 lg:flex">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#CBD0AC] text-[12px] font-bold text-[#171A10]">
          {brand.trim().charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 truncate text-[12.5px] font-semibold text-white/80">{brand}</span>
      </div>
    </nav>
  );
}

/** The console's own masthead: what this is, and the button that takes it away. */
function ConsoleHeader({ phase1 }: { phase1: ScanPhase1 }) {
  const when = new Date(phase1.scannedAt);
  const stamp = Number.isNaN(when.getTime())
    ? null
    : when.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h2 className="text-[22px] font-bold leading-tight tracking-tight text-white sm:text-[26px]">
          What AI knows about {phase1.brand}
        </h2>
        <p className="mt-1.5 max-w-[62ch] text-[13px] font-medium leading-relaxed text-[#CBD0AC]">
          Whether the models know you from memory, and whether they find you when they can search the web. Measured
          against {phase1.domain}
          {stamp ? ` · ${stamp}` : ''}.
        </p>
      </div>
      <div data-print="hide" className="shrink-0">
        <DownloadReport />
      </div>
    </div>
  );
}

/* ── Summary ─────────────────────────────────────────────────────────────── */

function Summary({
  phase1,
  phase2,
  grounded,
  maxTech,
  onGo,
}: {
  phase1: ScanPhase1;
  phase2: ScanPhase2;
  grounded: ScanPhase1 | null;
  maxTech: number;
  onGo: (id: SectionId) => void;
}) {
  const answered = phase1.providers.filter((p) => !p.error).length;
  const total = phase1.totalAnswers + (grounded?.totalAnswers ?? 0);

  return (
    <div className="flex flex-col gap-5">
      {/* ── The two indicators, and what the run consisted of ─────────────
          The pair is the report's whole thesis and it stays exactly as it was
          — two measurements, side by side, never averaged. What is new beside
          them is the count: three questions, four models, eighteen answers.
          It is the sentence that turns a percentage into a measurement, and it
          was buried in the audit trail at the bottom of the old page. */}
      <Panel>
        <Head
          badge={<Gauge size={18} />}
          level="lead"
          title="Overall reading"
          sub="Two indicators, read separately: whether the models already know you, and whether they find you when they look."
        />

        <div className="mt-6 grid grid-cols-1 gap-8 border-t border-gray-100 pt-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col divide-y divide-gray-100">
            <Indicator
              pct={phase1.sovPct}
              name="Brand knowledge"
              gloss="The models recommend you without looking anything up."
              detail={`Recognition inside the model. ${phase1.totalAnswers} ${
                phase1.totalAnswers === 1 ? 'answer' : 'answers'
              } with the web shut.`}
              className="pb-6"
            />

            {grounded ? (
              <Indicator
                pct={grounded.sovPct}
                name="AI visibility"
                gloss="The models find and recommend you when they search the web."
                detail={`Presence an assistant can discover. ${grounded.totalAnswers} ${
                  grounded.totalAnswers === 1 ? 'answer' : 'answers'
                } with the web open.`}
                className="pt-6"
              />
            ) : (
              <div className="pt-6">
                <p className="text-[14px] font-bold tracking-tight text-gray-900">AI visibility — not measured</p>
                <p className="mt-2 text-[13px] font-medium leading-relaxed text-gray-600">
                  The searching half of this scan did not run. The figure above answers a different question and cannot
                  stand in for it.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <Tint>
              <Micro className="text-white/70">Key insight</Micro>
              <p className="mt-2.5 text-[14px] font-medium leading-relaxed text-white">{phase2.keyInsight}</p>
            </Tint>

            {/* What the run was made of. A percentage with no denominator on
                screen is a number a reader has to take on trust. */}
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-[14px] font-bold text-gray-900">{phase1.questions.length}</span>
                <span className="text-[13px] font-medium text-gray-600">
                  {phase1.questions.length === 1 ? 'question' : 'questions'}
                </span>
                <span className="text-gray-300">·</span>
                <span className="text-[14px] font-bold text-gray-900">{answered}</span>
                <span className="text-[13px] font-medium text-gray-600">{answered === 1 ? 'model' : 'models'}</span>
              </div>
              <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-gray-500">
                {total} {total === 1 ? 'answer' : 'answers'} read
                {grounded ? ` — ${phase1.totalAnswers} from memory and ${grounded.totalAnswers} with search` : ''}.
              </p>
              <button
                type="button"
                onClick={() => onGo('answers')}
                className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#39471D] hover:underline"
              >
                See the questions we asked <ArrowUpRight className="text-[10px]" />
              </button>
            </div>

            <div className="grid grid-cols-1 divide-y divide-gray-100 border-y border-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <Stat
                value={`${phase2.techScore}`}
                label={`Your site · ${phase2.techScore} of ${maxTech}`}
                note="Whether the crawlers can read you at all"
              />
              <Stat
                value={phase2.serpScore < 0 ? '—' : String(phase2.serpScore)}
                label="Live retrieval / 100"
                note={
                  phase2.serpScore < 0 ? 'Not measured on this scan' : 'Whether Perplexity and Google can find you now'
                }
                muted={phase2.serpScore < 0}
              />
            </div>
          </div>
        </div>

        {phase2.grounded && <Diagnosis memory={phase1} grounded={phase2.grounded} />}
      </Panel>

      {/* ── Memory → search, model by model ───────────────────────────────── */}
      {grounded && (
        <Panel>
          <Head
            badge={<TrendingUp size={18} />}
            level="section"
            title="Memory → web search"
            sub="The same questions, asked twice of each model. The gap between the two columns is what searching is worth to you today."
          />
          <div className="mt-6">
            <ModelLadder memory={phase1} grounded={grounded} />
          </div>
        </Panel>
      )}

      {/* ── Question by question ──────────────────────────────────────────── */}
      <Panel>
        <Head
          badge={<MessagesSquare size={18} />}
          level="section"
          title="Question by question"
          sub="A brand can be named for one question and invisible for the next. Pooled into one percentage, that difference disappears."
        />
        <div className="mt-6">
          <QuestionBoard memory={phase1} grounded={grounded} />
        </div>
        <button
          type="button"
          onClick={() => onGo('answers')}
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#39471D] hover:underline"
        >
          Read what each model actually said <ArrowUpRight className="text-[11px]" />
        </button>
      </Panel>

      {/* ── How each model sees you ───────────────────────────────────────── */}
      <Panel>
        <Head
          badge={<Trophy size={18} />}
          level="section"
          title="How each model sees you"
          sub="One card per model: what it says from memory, what it says after searching, and where it went to find out."
        />
        <div className="mt-6">
          <ModelViews phase1={phase1} phase2={phase2} grounded={grounded} onGo={onGo} />
        </div>
      </Panel>
    </div>
  );
}

/* ── Memory → search ladder ──────────────────────────────────────────────── */

/** One model's two readings, as percentages of the questions it answered. */
function rate(result: ProviderResult | undefined, questions: number): number | null {
  if (!result || result.error || questions === 0) return null;
  return Math.round((result.mentions / questions) * 100);
}

/**
 * Memory against search, one row per model.
 *
 * The report already said both numbers; it said them as two rings pooled across
 * every model, so "searching helps" and "searching helps *on Gemini*" were the
 * same sentence. They are not: a brand that Perplexity finds and ChatGPT does
 * not has a different problem from a brand nobody finds, and the fix is
 * different too. The delta on the right is in percentage points and says so,
 * because a jump from 0% to 33% is not "up 33%".
 */
function ModelLadder({ memory, grounded }: { memory: ScanPhase1; grounded: ScanPhase1 }) {
  const qs = memory.questions.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="pb-2.5 pr-4">
              <Micro className="text-gray-400">Model</Micro>
            </th>
            <th className="pb-2.5 pr-4">
              <Micro className="text-gray-400">Memory · no search</Micro>
            </th>
            <th className="pb-2.5 pr-4">
              <Micro className="text-gray-400">Web search</Micro>
            </th>
            <th className="pb-2.5 text-right">
              <Micro className="text-gray-400">Change</Micro>
            </th>
          </tr>
        </thead>
        <tbody>
          {MEMORY_PROVIDERS.map((id) => {
            const mem = rate(
              memory.providers.find((p) => p.provider === id),
              qs
            );
            const web = rate(
              grounded.providers.find((p) => p.provider === id),
              grounded.questions.length
            );
            const delta = mem !== null && web !== null ? web - mem : null;

            return (
              <tr key={id} className="border-b border-gray-100 last:border-0">
                <td className="py-3.5 pr-4">
                  <span className="flex items-center gap-2.5">
                    <ProviderMark provider={id} />
                    <span className="text-[13.5px] font-bold text-gray-900">{PROVIDER_LABEL[id]}</span>
                  </span>
                </td>
                <td className="py-3.5 pr-4">
                  <Reading pct={mem} />
                </td>
                <td className="py-3.5 pr-4">
                  <Reading pct={web} />
                </td>
                <td className="py-3.5 text-right">
                  {delta === null ? (
                    <span className="text-[12px] font-semibold text-gray-400">—</span>
                  ) : (
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[11.5px] font-bold ${
                        delta > 0 ? 'bg-[#E7ECD9] text-[#39471D]' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {delta > 0 ? '+' : ''}
                      {delta} pp
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-[11.5px] font-medium text-gray-500">
        pp = percentage points. 0% = never named · 100% = named in every answer.
      </p>
    </div>
  );
}

/** A percentage with its own bar, or the honest blank when the model errored. */
function Reading({ pct }: { pct: number | null }) {
  if (pct === null) {
    return <span className="text-[12px] font-semibold text-gray-400">Not measured</span>;
  }
  return (
    <span className="flex items-center gap-2.5">
      <span className="w-9 shrink-0 text-[13.5px] font-bold tabular-nums text-gray-900">{pct}%</span>
      <span className="block h-1.5 w-full max-w-[140px] overflow-hidden rounded-sm bg-gray-100">
        <span className="block h-full rounded-sm bg-[#39471D]" style={{ width: `${Math.max(pct, 0)}%` }} />
      </span>
    </span>
  );
}

/* ── Question board ──────────────────────────────────────────────────────── */

/** How many models named the brand for one question, in one reading. */
function hitsFor(reading: ScanPhase1 | null, q: number): { hits: number; asked: number } {
  if (!reading) return { hits: 0, asked: 0 };
  let hits = 0;
  let asked = 0;
  for (const provider of reading.providers) {
    if (provider.error) continue;
    const answer = provider.answers.find((a) => a.q === q);
    if (!answer) continue;
    asked += 1;
    if (answer.mentioned) hits += 1;
  }
  return { hits, asked };
}

/**
 * One card per question, each carrying both readings.
 *
 * This is the panel that answers the question a client actually asks first —
 * "named for what?" — and the one the old report could not answer without
 * opening seventy-two rows of evidence.
 */
function QuestionBoard({ memory, grounded }: { memory: ScanPhase1; grounded: ScanPhase1 | null }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {memory.questions.map((question, q) => {
        const mem = hitsFor(memory, q);
        const web = hitsFor(grounded, q);
        const asked = Math.max(mem.asked, web.asked);
        const named = mem.hits + web.hits;

        return (
          <div key={question} className="flex flex-col rounded-xl border border-gray-200 p-4">
            <div className="flex items-start gap-2.5">
              <Micro className="mt-0.5 shrink-0 text-gray-300">{String(q + 1).padStart(2, '0')}</Micro>
              <p className="min-w-0 flex-1 text-[13.5px] font-bold leading-snug text-gray-900">{question}</p>
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-3.5">
              <ReadingRow label="Memory" hits={mem.hits} asked={mem.asked} />
              {grounded ? (
                <ReadingRow label="Web search" hits={web.hits} asked={web.asked} />
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12.5px] font-semibold text-gray-500">Web search</span>
                  <span className="text-[12px] font-semibold text-gray-400">Not measured</span>
                </div>
              )}
            </div>

            <p className="mt-3.5 border-t border-gray-100 pt-3 text-[12px] font-semibold text-gray-500">
              <span className="text-[13.5px] font-bold text-gray-900">
                {named} / {asked * (grounded ? 2 : 1)}
              </span>{' '}
              answers name you
            </p>
          </div>
        );
      })}
    </div>
  );
}

function ReadingRow({ label, hits, asked }: { label: string; hits: number; asked: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12.5px] font-semibold text-gray-500">{label}</span>
      {asked === 0 ? (
        <span className="text-[12px] font-semibold text-gray-400">Not measured</span>
      ) : (
        <Verdict tone={hits === 0 ? 'off' : hits === asked ? 'on' : 'mid'}>
          {hits === 0 ? 'Not named' : `${hits} of ${asked}`}
        </Verdict>
      )}
    </div>
  );
}

/* ── How each model sees you ─────────────────────────────────────────────── */

/**
 * Where a searching answer went to find out.
 *
 * Only the searching half can have these: a model answering from memory reads
 * nothing, so a source list beside its verdict would be a claim about a lookup
 * that never happened. The domains come from `sources` on the provider when the
 * backend keeps them, and from the retrieval engines' own citations meanwhile —
 * which is why Perplexity is the one card with a full list today.
 */
function sourcesFor(provider: AnyProvider, phase2: ScanPhase2, grounded: ScanPhase1 | null): string[] {
  const fromGrounded = grounded?.providers.find((p) => p.provider === provider)?.sources ?? [];
  const fromRetrieval = phase2.retrieval.find((r) => r.provider === provider)?.citations ?? [];
  const all = [...fromGrounded, ...fromRetrieval]
    .map((s) => s.replace(/^https?:\/\//i, '').replace(/^www\./i, '').split('/')[0].toLowerCase())
    .filter(Boolean);
  return [...new Set(all)];
}

/** Local marks only. A favicon service would put every reader's IP address in
    front of a third party to decorate a list of domains, which is not a trade
    this tool gets to make on their behalf. */
const SOURCE_LOGO: Record<string, string> = {
  'google.com': 'google.svg',
  'forbes.com': 'forbes.svg',
};

function SourceMark({ host }: { host: string }) {
  const file = SOURCE_LOGO[host];
  return (
    <span
      title={host}
      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white py-1 pl-1 pr-2.5"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E7ECD9] text-[10px] font-bold uppercase text-[#39471D]">
        {file ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`${BASE}/logos/${file}`} alt="" aria-hidden="true" className="h-3.5 w-3.5 object-contain" />
        ) : (
          host.charAt(0)
        )}
      </span>
      <span className="text-[11.5px] font-semibold text-gray-700">{host}</span>
    </span>
  );
}

function ModelViews({
  phase1,
  phase2,
  grounded,
  onGo,
}: {
  phase1: ScanPhase1;
  phase2: ScanPhase2;
  grounded: ScanPhase1 | null;
  onGo: (id: SectionId) => void;
}) {
  const qs = phase1.questions.length;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {MEMORY_PROVIDERS.map((id) => {
        const mem = phase1.providers.find((p) => p.provider === id);
        const web = grounded?.providers.find((p) => p.provider === id);
        const sources = sourcesFor(id, phase2, grounded);
        const hits = (mem?.mentions ?? 0) + (web?.mentions ?? 0);
        const asked = (mem && !mem.error ? qs : 0) + (web && !web.error ? grounded!.questions.length : 0);

        return (
          <div key={id} className="flex flex-col rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2.5">
              <ProviderMark provider={id} />
              <p className="text-[14px] font-bold text-gray-900">{PROVIDER_LABEL[id]}</p>
            </div>

            <div className="mt-3.5 flex flex-col gap-3 border-t border-gray-100 pt-3.5">
              <div>
                <Micro className="text-gray-400">Memory</Micro>
                <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-gray-600">
                  {mem?.error
                    ? 'The model did not answer, so this reading is missing rather than zero.'
                    : mem && mem.mentions > 0
                      ? `Names you in ${mem.mentions} of ${qs} answers without looking anything up.`
                      : 'Does not name you when it answers from memory.'}
                </p>
              </div>

              <div>
                <Micro className="text-gray-400">Web search</Micro>
                <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-gray-600">
                  {!grounded || !web
                    ? 'Not measured on this scan.'
                    : web.error
                      ? 'The searching call did not come back, so this reading is missing.'
                      : web.mentions > 0
                        ? `Finds and recommends you in ${web.mentions} of ${grounded.questions.length} answers.`
                        : 'Searched, and still did not recommend you.'}
                </p>
              </div>
            </div>

            <div className="mt-3.5 border-t border-gray-100 pt-3.5">
              <div className="flex items-baseline justify-between gap-3">
                <Micro className="text-gray-400">You were named</Micro>
                <span className="text-[13.5px] font-bold tabular-nums text-gray-900">
                  {hits} / {asked}
                </span>
              </div>

              <Micro className="mt-3 block text-gray-400">Sources it cited</Micro>
              {sources.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {sources.slice(0, 4).map((host) => (
                    <SourceMark key={host} host={host} />
                  ))}
                  {sources.length > 4 && (
                    <button
                      type="button"
                      onClick={() => onGo('sources')}
                      className="rounded-full border border-gray-200 px-2.5 py-1 text-[11.5px] font-bold text-gray-600 hover:border-[#39471D] hover:text-[#39471D]"
                    >
                      +{sources.length - 4}
                    </button>
                  )}
                </div>
              ) : (
                <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-gray-500">
                  {grounded && web && !web.error
                    ? 'This model did not return its sources on this run.'
                    : 'Nothing to cite — a model answering from memory reads nothing.'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Sources ─────────────────────────────────────────────────────────────── */

/**
 * Every domain the searching answers leaned on, in one place.
 *
 * The section a reader arrives at asking "why does it say that about me?" — and
 * the one that turns "earn citations on authority sites" from advice into a
 * list of named sites. It is deliberately honest about how much of it is filled
 * in: the models that search do return their citations, and this scan keeps
 * only the retrieval engines' own, so the panel says which is which rather than
 * presenting a short list as a complete one.
 */
function SourcesSection({
  phase1,
  phase2,
  grounded,
}: {
  phase1: ScanPhase1;
  phase2: ScanPhase2;
  grounded: ScanPhase1 | null;
}) {
  const rows = ([...MEMORY_PROVIDERS, 'perplexity', 'ai-overview'] as AnyProvider[])
    .map((id) => ({ id, hosts: sourcesFor(id, phase2, grounded) }))
    .filter((row) => row.hosts.length > 0);

  const everyHost = [...new Set(rows.flatMap((r) => r.hosts))];
  const yours = everyHost.filter((h) => h === phase1.domain || h.endsWith(`.${phase1.domain}`));
  const others = everyHost.filter((h) => !yours.includes(h));

  return (
    <div className="flex flex-col gap-5">
      <Panel>
        <Head
          badge={<Link2 size={18} />}
          level="section"
          title="Where the answers came from"
          sub="The pages a searching model read before it answered. These are the sites that decide what AI says about your category — and being on them is how a brand gets into an answer it is not already in."
        />

        {rows.length === 0 ? (
          <div className="mt-6 rounded-xl border border-gray-200 p-5">
            <p className="text-[13px] font-medium leading-relaxed text-gray-600">
              No model returned its sources on this scan. Only the searching half can have them — a model answering from
              memory reads nothing — and the engines that do search did not hand back a citation list this time.
            </p>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            {rows.map(({ id, hosts }) => (
              <div key={id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2.5">
                  <ProviderMark provider={id} />
                  <p className="text-[13.5px] font-bold text-gray-900">{PROVIDER_LABEL[id]}</p>
                  <span className="ml-auto text-[12px] font-semibold text-gray-500">
                    {hosts.length} {hosts.length === 1 ? 'source' : 'sources'}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {hosts.map((host) => (
                    <SourceMark key={host} host={host} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {everyHost.length > 0 && (
        <Panel>
          <Head
            badge={<Trophy size={18} />}
            level="section"
            title="Are you one of them?"
            sub="Your own domain appearing here means a model read your site before answering. Everything else is somebody else's page shaping what it said about your category."
          />
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <Micro className="text-gray-400">Your site</Micro>
              <div className="mt-2">
                {yours.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {yours.map((host) => (
                      <SourceMark key={host} host={host} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[12.5px] font-medium leading-relaxed text-gray-600">
                    {phase1.domain} was not among the pages any model read. That is the gap the plan under &ldquo;What
                    to do now&rdquo; is written to close.
                  </p>
                )}
              </div>
            </div>
            <div>
              <Micro className="text-gray-400">Everyone else · {others.length}</Micro>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {others.slice(0, 12).map((host) => (
                  <SourceMark key={host} host={host} />
                ))}
              </div>
            </div>
          </div>
        </Panel>
      )}
    </div>
  );
}

/* ── Actions ─────────────────────────────────────────────────────────────── */

function ActionRow({ index, action }: { index: number; action: ScanPhase2['actions'][number] }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <Micro className="mt-0.5 shrink-0 text-gray-300">{String(index + 1).padStart(2, '0')}</Micro>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
            <p className="text-[14px] font-bold text-gray-900">{action.title}</p>
            <Verdict tone={action.priority === 'high' ? 'on' : action.priority === 'medium' ? 'mid' : 'off'}>
              {action.priority}
            </Verdict>
          </div>
          <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-gray-600">{action.detail}</p>
          <span className="mt-3 flex items-center gap-2">
            <Micro className="text-gray-400">Impact</Micro>
            <span className="flex gap-1">
              {Array.from({ length: 4 }).map((_, d) => (
                <span
                  key={d}
                  className={`h-[6px] w-[6px] rounded-full ${d < action.impact ? 'bg-[#39471D]' : 'bg-gray-200'}`}
                />
              ))}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
