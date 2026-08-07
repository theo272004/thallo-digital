'use client';

import React, { useState } from 'react';
import { BTN_DARK, FIELD, Micro, Notice, Panel } from './ui';
import { QUESTION_COUNT, buildQuestions } from '@/lib/scan/questions';
import { DEFAULT_MARKET, MARKETS, marketById } from '@/lib/scan/markets';
import { INDUSTRIES, cleanDomain, isDomain, type ScanInput } from '@/lib/scan/types';

const WILL_ANALYZE = [
  'Whether ChatGPT, Claude and Gemini name you',
  'Which competitors get recommended instead',
  'Google AI Overview and Perplexity presence',
  'Whether AI crawlers can reach your site',
  'Authority and citation signals',
  'A prioritised action plan',
];

export default function ScanSetup({ onStart }: { onStart: (input: ScanInput) => void }) {
  const [brand, setBrand] = useState('');
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0]);
  const [domain, setDomain] = useState('');
  const [market, setMarket] = useState<string>(DEFAULT_MARKET);
  const [error, setError] = useState('');

  /* The first of the fifteen, in the language the scan will actually use.
     Showing it here rather than only in the audit trail afterwards means the
     market control demonstrates what it does before anything is spent, and it
     is the fastest way to see that a Spanish scan really does ask in Spanish. */
  const samplePrompt = buildQuestions(industry, market)[0];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = brand.trim().slice(0, 80);
    const host = cleanDomain(domain);

    if (!name) return setError('Enter the brand name buyers would search for.');
    // A bare hostname with a dot is the weakest check that still rejects typos,
    // and the crawl in phase 2 will tell us soon enough if it does not resolve.
    if (!isDomain(host)) return setError('Enter a valid website, e.g. yourcompany.com');

    setError('');
    onStart({ brand: name, domain: host, industry, market });
  };

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <Panel>
        <form onSubmit={submit} className="flex flex-col">
          <Micro className="text-gray-400">Audit parameters</Micro>

          <div className="mt-5 flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <Micro className="text-gray-900">Brand name</Micro>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Ledgerly"
                maxLength={80}
                autoComplete="organization"
                className={FIELD}
              />
              <span className="text-[11px] font-medium text-gray-400">Exactly as a buyer would say it</span>
            </label>

            <label className="flex flex-col gap-2">
              <Micro className="text-gray-900">Industry</Micro>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={FIELD}>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
              <span className="text-[11px] font-medium text-gray-400">Sets the buying questions we ask</span>
            </label>

            <label className="flex flex-col gap-2">
              <Micro className="text-gray-900">Market</Micro>
              <select value={market} onChange={(e) => setMarket(e.target.value)} className={FIELD}>
                {MARKETS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.languageLabel} · {m.country.replace(/^the /, '')}
                  </option>
                ))}
              </select>
              <span className="text-[11px] font-medium text-gray-400">
                The language buyers ask in, and the country they ask from
              </span>
            </label>

            <label className="flex flex-col gap-2">
              <Micro className="text-gray-900">Website</Micro>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="yourcompany.com"
                autoComplete="url"
                className={FIELD}
              />
              <span className="text-[11px] font-medium text-gray-400">
                Required — half the analysis runs against your site
              </span>
            </label>
          </div>

          {error && (
            <div className="mt-4">
              <Notice>{error}</Notice>
            </div>
          )}

          <button type="submit" className={`mt-6 w-full ${BTN_DARK}`}>
            Run the scan
          </button>

          <p className="mt-4 border-t border-gray-100 pt-4 text-[11px] font-medium leading-relaxed text-gray-500">
            No account needed. The first half runs free and usually finishes in under a minute.
          </p>
        </form>
      </Panel>

      <Panel className="flex flex-col">
        <Micro className="text-gray-400">What we analyse</Micro>

        <ul className="mt-5 flex flex-col gap-3.5">
          {WILL_ANALYZE.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#39471D]" />
              <span className="text-[13px] font-medium leading-snug text-gray-700">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-3 pt-7">
          <div className="rounded-lg border border-gray-100 p-4 sm:p-5">
            <Micro className="text-gray-400">First of {QUESTION_COUNT}, as it will be sent</Micro>
            <p
              lang={marketById(market).language}
              className="mt-2.5 font-mono text-[12.5px] leading-relaxed text-gray-700"
            >
              {samplePrompt}
            </p>
            <p className="mt-3 text-[11px] font-medium text-gray-400">
              Asked in {marketById(market).languageLabel}, on behalf of a buyer in{' '}
              {marketById(market).country.replace(/^the /, '')}.
            </p>
          </div>

          <div className="rounded-lg bg-[#F4FAF5] p-4 sm:p-5">
            <Micro className="text-[#39471D]">How it is measured</Micro>
            <p className="mt-2.5 text-[13px] font-medium leading-relaxed text-gray-600">
              We put <strong className="font-bold text-gray-900">{QUESTION_COUNT} real buying questions</strong> to{' '}
              <strong className="font-bold text-gray-900">three models</strong> — {QUESTION_COUNT * 3} answers in total
              — and count how many name you. Your brand is never mentioned in the questions, so nothing is leading the
              answer. You will see every question and every result.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
