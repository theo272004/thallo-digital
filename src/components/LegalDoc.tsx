import React from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { LEGAL } from '@/lib/legal';
import { BASE } from '@/lib/site';

/**
 * The shell the three legal documents are printed in.
 *
 * Deliberately plainer than the rest of the site: no reveals, no scroll-driven
 * anything. A terms page that animates reads as marketing, and the one thing
 * these pages have to be is legible — by a customer looking for the refund
 * window, and by whoever at Stripe is checking the business is real.
 */
export default function LegalDoc({
  eyebrow,
  title,
  summary,
  children,
}: {
  eyebrow: string;
  title: string;
  /** One sentence in plain language, before the clauses start. */
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white pt-32 pb-24 2xl:pt-40">
      <div className="mx-auto max-w-[760px] px-6">
        <Eyebrow className="mb-5">{eyebrow}</Eyebrow>

        <h1 className="mb-5 font-sans text-4xl font-bold leading-[1.05] tracking-tight text-gray-900 sm:text-5xl">
          {title}
        </h1>

        <p className="mb-8 text-base font-medium leading-relaxed text-gray-500">{summary}</p>

        <p className="mb-12 border-y border-gray-100 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
          Last updated · {LEGAL.lastUpdated}
        </p>

        <div className="flex flex-col gap-10">{children}</div>

        <Identity />
      </div>
    </section>
  );
}

/** A numbered clause. */
export function Clause({ n, heading, children }: { n: number; heading: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex gap-3 font-sans text-lg font-bold tracking-tight text-gray-900">
        <span className="font-mono text-[13px] font-bold text-gray-300 tabular-nums">
          {String(n).padStart(2, '0')}
        </span>
        {heading}
      </h2>
      <div className="flex flex-col gap-3.5 pl-0 sm:pl-9">{children}</div>
    </section>
  );
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] font-medium leading-relaxed text-gray-600">{children}</p>;
}

export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-[#55672E]" />
          <span className="text-[15px] font-medium leading-relaxed text-gray-600">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Who you are contracting with.
 *
 * The registered name, tax id and address print only once they exist in
 * `lib/legal.ts` — an empty line is preferable to an invented one, and the
 * trading name plus a monitored inbox is a complete contact route on its own.
 */
function Identity() {
  const rows: Array<[string, React.ReactNode]> = [
    [LEGAL.legalName ? 'Trading as' : 'Company', LEGAL.tradingName],
  ];

  if (LEGAL.legalName) rows.unshift(['Registered name', LEGAL.legalName]);
  if (LEGAL.taxId) rows.push(['NIT', LEGAL.taxId]);
  if (LEGAL.address) rows.push(['Registered address', LEGAL.address]);
  rows.push([
    'Email',
    <a key="e" href={`mailto:${LEGAL.email}`} className="underline underline-offset-2 hover:text-[#39471D]">
      {LEGAL.email}
    </a>,
  ]);
  if (LEGAL.phone) rows.push(['Phone', LEGAL.phone]);
  rows.push([
    'Website',
    <a key="w" href={`${BASE}/`} className="underline underline-offset-2 hover:text-[#39471D]">
      thallodigital.com
    </a>,
  ]);

  return (
    <div className="mt-14 rounded-2xl border border-gray-200 bg-gray-50/60 p-7">
      <h2 className="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
        Who you are contracting with
      </h2>
      <dl className="flex flex-col gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <dt className="w-[170px] shrink-0 text-[13px] font-semibold text-gray-400">{label}</dt>
            <dd className="text-[14px] font-medium text-gray-700">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
