'use client';

import React, { useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { INDUSTRIES, type ScanInput } from '@/lib/scan/types';

type Props = {
  onStart: (input: ScanInput) => void;
};

const WILL_ANALYZE = [
  'Whether ChatGPT, Claude and Gemini name you',
  'Which competitors get recommended instead',
  'Google AI Overview and Brand SERP presence',
  'Whether AI crawlers can reach your site',
  'Authority and citation signals',
  'A prioritised action plan',
];

/** Normalises whatever the user pastes into a bare hostname. */
function cleanDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
}

export default function ScanSetup({ onStart }: Props) {
  const [brand, setBrand] = useState('');
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0]);
  const [domain, setDomain] = useState('');
  const [error, setError] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanDomain(domain);
    if (!brand.trim()) return setError('Enter the brand name buyers would search for.');
    // A bare hostname with a dot is the weakest check that still rejects typos.
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(cleaned)) {
      return setError('Enter a valid website, e.g. yourcompany.com');
    }
    setError('');
    onStart({ brand: brand.trim(), domain: cleaned, industry });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-px bg-gray-100 rounded-[28px] overflow-hidden border border-gray-100">
      {/* Form */}
      <form onSubmit={submit} className="bg-white p-8 sm:p-11">
        <Eyebrow className="mb-7">Audit parameters</Eyebrow>

        <div className="flex flex-col gap-6">
          <Field label="Brand name" hint="Exactly as a buyer would say it">
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Ledgerly"
              className="w-full px-5 py-3.5 border border-gray-200 rounded-full bg-white text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#39471D] transition-colors"
            />
          </Field>

          <Field label="Industry" hint="Sets the buying questions we ask">
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full appearance-none px-5 py-3.5 border border-gray-200 rounded-full bg-white text-sm font-medium text-gray-900 focus:outline-none focus:border-[#39471D] transition-colors cursor-pointer"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </Field>

          <Field label="Website" hint="Required — half the analysis runs against your site">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="yourcompany.com"
              className="w-full px-5 py-3.5 border border-gray-200 rounded-full bg-white text-sm font-medium text-gray-900 placeholder-gray-300 focus:outline-none focus:border-[#39471D] transition-colors"
            />
          </Field>

          {error && <p className="text-[12px] font-semibold text-rose-600 -mt-2">{error}</p>}

          <button
            type="submit"
            className="mt-1 px-6 py-4 bg-[#39471D] rounded-full text-sm font-bold text-white hover:bg-[#55672E] transition-colors"
          >
            Run the audit →
          </button>

          <p className="text-[12px] text-gray-400 font-medium leading-relaxed text-center">
            No account needed. Usually finishes in under a minute.
          </p>
        </div>
      </form>

      {/* What we analyse */}
      <div className="bg-[#F7F8F4] p-8 sm:p-11 flex flex-col">
        <Eyebrow className="mb-7">What we analyse</Eyebrow>
        <ul className="flex flex-col gap-4 flex-grow">
          {WILL_ANALYZE.map((item) => (
            <li key={item} className="flex items-start gap-3.5">
              <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-[#39471D] shrink-0" />
              <span className="text-[14px] font-medium text-gray-700 leading-snug">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-9 pt-7 border-t border-[#E0E4D6]">
          <p className="font-mono text-[10px] font-bold tracking-[0.18em] uppercase text-[#55672E] mb-3">
            How it is measured
          </p>
          <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
            We ask <strong className="text-gray-900">5 real buying questions</strong> to{' '}
            <strong className="text-gray-900">3 models</strong> — 15 answers in total — and count how many name you.
            You will see the exact questions with your results.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[10px] font-bold tracking-[0.16em] uppercase text-gray-900">{label}</span>
      {children}
      <span className="text-[11px] text-gray-400 font-medium pl-1">{hint}</span>
    </label>
  );
}
