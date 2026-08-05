'use client';

import React from 'react';
import ArrowUpRight from '@/components/ui/ArrowUpRight';
import { SplitReveal } from '@/components/motion';
import AuditCTA from '@/components/AuditCTA';
import { QUESTION_TEMPLATES } from '@/lib/scan/questions';
import { LIMITS } from '@/lib/scan/limits';
import { BASE } from '@/lib/site';

/* The site-wide card shadow — one edge, one shadow, everywhere. */
const SOFT = { boxShadow: '0 6px 20px -8px rgba(23,26,16,0.14)' };

/**
 * The method behind the console above.
 *
 * This page used to be a mock-up: a dashboard of invented percentages labelled
 * "sample report". With a working tool directly above it, invented figures are
 * no longer illustrative — they are a second, conflicting answer to the same
 * question. So every number here now describes the *method* (how many questions,
 * how many points a signal is worth) and none of them describe a result.
 */

const ANGLES: [string, string][] = [
  ['Open recommendation', 'The bare question a buyer starts with, with no constraints attached.'],
  ['Shortlist & procurement', 'The question asked when a list is being drawn up and budget exists.'],
  ['Trust & reputation', 'Who the model considers safe to vouch for, which is not the same as who it knows.'],
  ['Segment fit', 'Startup, enterprise, international — the same market, different answers.'],
  ['Alternatives & switching', 'Where a model sends someone already unhappy with a competitor.'],
];

const SIGNALS: [string, number, string][] = [
  ['AI crawlers allowed in robots.txt', 25, 'GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot. Blocked here and nothing else on this list matters.'],
  ['Cited on third-party authority sites', 25, 'Whether anyone but you says you exist. The heaviest signal, and the slowest to move.'],
  ['Organization schema markup', 15, 'Lets a model resolve who you are rather than infer it from prose.'],
  ['About page with named people', 10, 'Anonymous companies are hard for a model to vouch for.'],
  ['Content published in the last 6 months', 10, 'Retrieval pulls what is current, however good the older pages are.'],
  ['Structured FAQ schema', 10, 'A marked-up answer can be lifted whole; a paragraph gets paraphrased away.'],
  ['HTTPS', 5, 'Table stakes, scored because its absence is disqualifying.'],
  ['llms.txt', 0, 'Listed and deliberately not scored — no major AI system is known to read it, so its absence costs nothing.'],
];

/* ── Primitives ─────────────────────────────────────────────────────────── */

/** Stage number + label. Space Mono, per guidelines §1 — "números de procesos". */
function Rail({ n, label, blurb }: { n: string; label: string; blurb: string }) {
  return (
    <div className="lg:pt-1">
      <p className="mb-4 font-mono text-[13px] font-bold tracking-[0.2em] text-[#55672E]">{n}</p>
      <h3 className="mb-3 text-2xl font-bold leading-[1.1] tracking-tight text-gray-900">{label}</h3>
      <p className="max-w-[30ch] text-sm font-medium leading-relaxed text-gray-500">{blurb}</p>
    </div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">{children}</span>
);

/**
 * The category the sample questions are rendered with.
 *
 * A real one, not a stand-in. The templates read "the best {industry}
 * companies", so dropping the words "your category" in produced "the best your
 * category companies" — ungrammatical, and it made a page about precision look
 * careless. Substituting a genuine category reads the way the prompt actually
 * reads when it is sent, and highlighting the swapped words shows the mechanism
 * better than a placeholder ever did.
 */
const SAMPLE_CATEGORY = 'fintech & payments';

/** Renders a template with the category filled in and marked. */
function Filled({ template }: { template: string }) {
  const parts = template.split('{industry}');
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {/* Underlined rather than a filled chip: a chip needs horizontal
              padding, and that padding renders as a gap in front of the "?"
              whenever the phrase wraps. An underline marks the substitution
              just as clearly and sits flush against the punctuation. */}
          {i < parts.length - 1 && (
            <span className="font-semibold text-[#39471D] underline decoration-[#CBD0AC] decoration-2 underline-offset-[3px]">
              {SAMPLE_CATEGORY}
            </span>
          )}
        </React.Fragment>
      ))}
    </>
  );
}

/** Section shell — white ground, the site's vertical rhythm, hairline divider. */
const Section = ({ children }: { children: React.ReactNode }) => (
  <section className="border-b border-gray-100 bg-white py-16 2xl:py-28">
    <div className="mx-auto max-w-[1440px] px-6">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[300px_1fr] lg:gap-16">{children}</div>
    </div>
  </section>
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-[28px] border border-gray-200 bg-white ${className}`} style={SOFT}>
    {children}
  </div>
);

export default function ThalloAIPage() {
  return (
    <>
      {/* ── Intro ────────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white pt-32 pb-16 2xl:pt-40 2xl:pb-24">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center px-6 text-center">
          <h1 className="mb-6 max-w-3xl text-balance font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
            No black box. Here is exactly what it measures.
          </h1>
          <p className="mb-8 max-w-[58ch] text-base font-medium leading-relaxed text-gray-500">
            A visibility score you cannot check is a number somebody made up. Everything below describes the method —
            the questions, the models, the weights and the limits — so you can decide for yourself whether the figure
            the console gives you means anything.
          </p>
          <a
            href={`${BASE}/thallo-ai/`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#39471D] transition-colors hover:text-[#55672E]"
          >
            Run the scan <ArrowUpRight className="text-[11px]" />
          </a>
        </div>
      </section>

      {/* ── 01 · What we ask ─────────────────────────────────────────────── */}
      <Section>
        <Rail
          n="01"
          label="What we ask"
          blurb="Fifteen questions a buyer would actually type, across five angles. Your brand is never one of the words in them."
        />
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="border-gray-100 p-8 sm:p-10 md:border-r">
              <Label>The five angles</Label>
              <p className="mt-6 max-w-[38ch] text-sm font-medium leading-relaxed text-gray-500">
                Three questions each. One phrasing measures a phrasing; five angles measure a market. And because your
                name never appears in the question, a model cannot agree with a premise we handed it.
              </p>
              <dl className="mt-7">
                {ANGLES.map(([term, def]) => (
                  <div key={term} className="mb-5 last:mb-0">
                    <dt className="mb-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                      {term}
                    </dt>
                    <dd className="max-w-[38ch] text-sm font-medium leading-relaxed text-gray-900">{def}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative overflow-hidden bg-gray-50/60 p-8 sm:p-10">
              <Label>The questions, in full</Label>
              <p className="mt-5 text-[13px] font-medium leading-relaxed text-gray-500">
                Shown for <span className="font-bold text-[#39471D]">{SAMPLE_CATEGORY}</span>. Whichever category you
                pick is swapped into the highlighted words — the rest is sent exactly as written.
              </p>
              <ol className="relative z-10 mt-6 flex flex-col gap-2.5">
                {QUESTION_TEMPLATES.map((q, i) => (
                  <li key={q} className="flex gap-3">
                    <span className="font-mono text-[11px] font-bold tabular-nums text-gray-300">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[13px] font-medium leading-snug text-gray-700">
                      <Filled template={q} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </Card>
      </Section>

      {/* ── 02 · Who we ask ──────────────────────────────────────────────── */}
      <Section>
        <Rail
          n="02"
          label="Who we ask"
          blurb="Three models answering from memory, two answering from live search. They measure two different things."
        />
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card className="p-8 sm:p-10">
              <Label>From memory</Label>
              <p className="mt-5 text-xl font-bold tracking-tight text-gray-900">ChatGPT · Claude · Gemini</p>
              <p className="mt-3 max-w-[42ch] text-sm font-medium leading-relaxed text-gray-500">
                Asked with web search off, so the answer comes from what the model absorbed during training. This is
                the question &ldquo;does the industry talk about you enough that a model learned your name?&rdquo; It
                moves slowly and it is the harder one to fake.
              </p>
              <p className="mt-6 border-t border-gray-100 pt-5 text-[13px] font-semibold text-gray-900">
                45 answers · this is the free half
              </p>
            </Card>

            <Card className="p-8 sm:p-10">
              <Label>From live search</Label>
              <p className="mt-5 text-xl font-bold tracking-tight text-gray-900">Perplexity · Google AI Overview</p>
              <p className="mt-3 max-w-[42ch] text-sm font-medium leading-relaxed text-gray-500">
                Asked with retrieval on, so they read the web while answering. This is the question &ldquo;are your
                pages findable and quotable today?&rdquo; It moves fast, and it is the one you can influence this
                quarter.
              </p>
              <p className="mt-6 border-t border-gray-100 pt-5 text-[13px] font-semibold text-gray-900">
                Unlocked with an email · costs us money to run
              </p>
            </Card>
          </div>

          <Card className="p-8 sm:p-10">
            <Label>Why the split matters</Label>
            <p className="mt-5 max-w-[76ch] text-sm font-medium leading-relaxed text-gray-500">
              Most tools report one number and call it AI visibility. But a brand can be famous and unreadable, or
              unknown and perfectly structured, and those two problems have opposite fixes. Being absent from memory
              but present in retrieval means your content is fine and nobody is citing it. Being present in memory but
              absent from retrieval usually means a robots.txt line is undoing years of reputation.
            </p>
          </Card>
        </div>
      </Section>

      {/* ── 03 · What we count ───────────────────────────────────────────── */}
      <Section>
        <Rail
          n="03"
          label="What we count"
          blurb="Three things per answer, and one of them is the rank you held."
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            ['Named or not', 'Whether the answer contains your brand at all. Aggregated, this is your share of voice — the headline percentage.'],
            ['Where you ranked', 'A model that lists you eighth is not recommending you. Average rank is reported next to the share of voice for exactly that reason.'],
            ['Who was named instead', 'Every other company in every answer, tallied. That list is the competitive picture, and it is usually the part that changes the conversation internally.'],
          ].map(([t, d]) => (
            <Card key={t} className="p-7 sm:p-8">
              <p className="text-[15px] font-bold text-gray-900">{t}</p>
              <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">{d}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* ── 04 · What we score ───────────────────────────────────────────── */}
      <Section>
        <Rail
          n="04"
          label="What we score"
          blurb="A hundred points across your own site, weighted by how much each one actually moves."
        />
        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 px-8 pt-8 pb-6 sm:px-10">
            <h4 className="text-xl font-bold tracking-tight text-gray-900">Technical readiness</h4>
            <p className="mt-2 max-w-[60ch] text-sm font-medium text-gray-500">
              Checked live against the domain you enter. Every point in your score traces to one of these rows — there
              is no hidden component.
            </p>
          </div>
          <ul>
            {SIGNALS.map(([label, weight, note]) => (
              <li key={label} className="flex items-start gap-5 border-b border-gray-100 px-8 py-5 last:border-0 sm:px-10">
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold text-gray-900">{label}</span>
                  <span className="mt-1.5 block max-w-[62ch] text-[13px] font-medium leading-relaxed text-gray-500">
                    {note}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 font-mono text-[11px] font-bold tabular-nums ${
                    weight === 0 ? 'bg-gray-50 text-gray-400' : 'bg-[#E7ECD9] text-[#39471D]'
                  }`}
                >
                  {weight === 0 ? 'not scored' : `${weight} pts`}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      {/* ── 05 · What you get ────────────────────────────────────────────── */}
      <Section>
        <Rail
          n="05"
          label="What you get"
          blurb="The finding is free. The diagnosis costs an email — and nothing else."
        />
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card className="p-8 sm:p-10">
            <Label>Free, no account</Label>
            <ul className="mt-6 flex flex-col gap-3.5">
              {[
                'Your share of voice across the three models',
                'Your average rank in the answers that named you',
                'Every question we sent and every result, in a table',
              ].map((x) => (
                <li key={x} className="flex items-start gap-3">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#39471D]" />
                  <span className="text-sm font-medium leading-snug text-gray-700">{x}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-8 sm:p-10">
            <Label>Unlocked with an email</Label>
            <ul className="mt-6 flex flex-col gap-3.5">
              {[
                'The competitors recommended in your place, ranked',
                'Perplexity and Google AI Overview presence',
                'The full technical scorecard against your domain',
                'A prioritised plan, ordered by what the scan found',
              ].map((x) => (
                <li key={x} className="flex items-start gap-3">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#39471D]" />
                  <span className="text-sm font-medium leading-snug text-gray-700">{x}</span>
                </li>
              ))}
            </ul>
            <p className="mt-7 border-t border-gray-100 pt-5 text-[12px] font-medium leading-relaxed text-gray-500">
              One email, used to send you the report and to reply. We do not sell or share it, and you can ask us to
              delete it.
            </p>
          </Card>
        </div>
      </Section>

      {/* ── 06 · What it does not do ─────────────────────────────────────── */}
      <Section>
        <Rail
          n="06"
          label="What it does not do"
          blurb="Stated here rather than discovered later. Every one of these is a real limit of the method."
        />
        <Card className="p-8 sm:p-10">
          <ul className="flex flex-col gap-5">
            {LIMITS.map((l) => (
              <li key={l} className="flex items-start gap-4 border-b border-gray-100 pb-5 last:border-0 last:pb-0">
                <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gray-200">
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#55672E" strokeWidth="3" strokeLinecap="round">
                    <path d="M12 8v5m0 3.5v.5" />
                  </svg>
                </span>
                <span className="max-w-[74ch] text-sm font-medium leading-relaxed text-gray-600">{l}</span>
              </li>
            ))}
          </ul>
        </Card>
      </Section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <AuditCTA
        image={`${BASE}/cta-bg.webp`}
        headingSlot={
          <SplitReveal
            as="h2"
            className="mb-8 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl"
            html="Measuring it is the easy half."
          />
        }
        copy="The scan tells you where you stand. Moving it takes the content, the citations and the structure that put you in the answer — which is the work we do."
      />
    </>
  );
}
