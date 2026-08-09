'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Globe2, Link2, LockKeyhole, Sparkles } from 'lucide-react';
import { FIELD, Micro, Notice, Panel } from './ui';
import { QUESTION_COUNT, buildQuestions } from '@/lib/scan/questions';
import { DEFAULT_MARKET, MARKETS, marketById } from '@/lib/scan/markets';
import { INDUSTRIES, cleanDomain, isDomain, type ScanInput } from '@/lib/scan/types';

type Step = 1 | 2;

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
] as const;

const COUNTRIES = Array.from(new Map(MARKETS.map((m) => [m.country, m])).values());

function StepBadge({ n }: { n: number }) {
  return <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F0F4E7] text-[15px] font-bold text-[#617A2B]">{n}.</span>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[13px] font-bold text-gray-900">{children}</span>;
}

export default function ScanSetup({ onStart }: { onStart: (input: ScanInput) => void }) {
  const [step, setStep] = useState<Step>(1);
  const [domain, setDomain] = useState('');
  const [market, setMarket] = useState(DEFAULT_MARKET);
  const [error, setError] = useState('');

  const selectedMarket = marketById(market);
  const country = selectedMarket.country;
  const language = selectedMarket.language;
  const questions = useMemo(() => buildQuestions(INDUSTRIES[0], market), [market]);

  const setCountry = (nextCountry: string) => {
    const matching = MARKETS.find((m) => m.country === nextCountry && m.language === language) ?? MARKETS.find((m) => m.country === nextCountry);
    if (matching) setMarket(matching.id);
  };

  const setLanguage = (nextLanguage: string) => {
    const matching = MARKETS.find((m) => m.country === country && m.language === nextLanguage) ?? MARKETS.find((m) => m.language === nextLanguage);
    if (matching) setMarket(matching.id);
  };

  const continueToPrompts = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDomain(cleanDomain(domain))) {
      setError('Enter a valid website, e.g. yourcompany.com');
      return;
    }
    setError('');
    setStep(2);
  };

  const runFreeScan = () => {
    const host = cleanDomain(domain);
    const brand = host.split('.')[0].replace(/[-_]+/g, ' ').trim() || host;
    onStart({ brand, domain: host, industry: INDUSTRIES[0], market });
  };

  if (step === 1) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Panel className="p-7 sm:p-10">
          <form onSubmit={continueToPrompts}>
            <div className="flex items-start gap-3">
              <StepBadge n={1} />
              <div>
                <h2 className="text-[22px] font-bold tracking-tight text-gray-900">Your brand</h2>
                <p className="mt-1 text-[14px] font-medium text-gray-500">The essentials to start your scan</p>
              </div>
            </div>

            <div className="mt-9 flex flex-col gap-6">
              <label className="flex flex-col gap-2.5">
                <FieldLabel>Website</FieldLabel>
                <span className="relative">
                  <Link2 size={17} className="pointer-events-none absolute left-4 top-3.5 text-gray-400" />
                  <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourcompany.com" autoComplete="url" className={`${FIELD} rounded-xl py-3.5 pl-11 text-[15px]`} />
                </span>
                <span className="text-[11px] font-medium text-gray-400">We&apos;ll analyze your site and content signals</span>
              </label>

              <label className="flex flex-col gap-2.5">
                <FieldLabel>Country</FieldLabel>
                <span className="relative">
                  <Globe2 size={17} className="pointer-events-none absolute left-4 top-3.5 text-gray-400" />
                  <select value={country} onChange={(e) => setCountry(e.target.value)} className={`${FIELD} appearance-none rounded-xl py-3.5 pl-11 text-[15px]`}>
                    {COUNTRIES.map((m) => <option key={m.country} value={m.country}>{m.country.replace(/^the /, '')}</option>)}
                  </select>
                </span>
              </label>

              <label className="flex flex-col gap-2.5">
                <FieldLabel>Language</FieldLabel>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className={`${FIELD} rounded-xl py-3.5 text-[15px]`}>
                  {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </label>
            </div>

            {error && <div className="mt-5"><Notice>{error}</Notice></div>}

            <button type="submit" className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#617A2B] py-4 text-[14px] font-bold text-white transition-colors hover:bg-[#55672E]">
              Continue <ArrowRight size={18} />
            </button>

            <div className="mt-7 flex items-start justify-center gap-2 border-t border-gray-100 pt-6 text-center">
              <LockKeyhole size={14} className="mt-0.5 shrink-0 text-[#617A2B]" />
              <p className="text-[12px] font-medium leading-relaxed text-gray-500"><strong className="font-bold text-gray-700">No credit card required</strong><br />Free scan · Results in under a minute</p>
            </div>
          </form>
        </Panel>
      </div>
    );
  }

  return (
    <Panel className="p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <StepBadge n={2} />
          <div>
            <h2 className="text-[22px] font-bold tracking-tight text-gray-900">What do you want to know?</h2>
            <p className="mt-1 text-[14px] font-medium text-gray-500">Choose the questions for your visibility review</p>
          </div>
        </div>
        <span className="rounded-full bg-[#F0F4E7] px-3.5 py-2 text-[12px] font-bold text-[#617A2B]">0 / {QUESTION_COUNT} selected</span>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {questions.map((question) => (
          <div key={question} className="flex items-center gap-4 border-b border-gray-100 px-4 py-4 last:border-0 sm:px-5">
            <span className="h-5 w-5 shrink-0 rounded border border-gray-300 bg-white" />
            <span className="min-w-0 flex-1 text-[13px] font-medium leading-relaxed text-gray-700">{question}</span>
            <span className="hidden shrink-0 text-gray-300 sm:block">⠿</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-[#D9E2C8] bg-[#F7FAF2] px-4 py-4 sm:px-5">
        <span className="flex items-center gap-3 text-[13px] font-semibold text-[#55672E]"><LockKeyhole size={17} /> Upgrade to Pro to customize prompts</span>
        <span className="hidden items-center gap-1 text-[12px] font-semibold text-[#617A2B] sm:flex">Learn more <ArrowRight size={15} /></span>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#F8FAF7] px-4 py-4 sm:px-5">
        <Sparkles size={19} className="mt-0.5 shrink-0 text-[#617A2B]" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-gray-800">You can run a free scan with the standard questions.</p>
          <p className="mt-1 text-[12px] leading-relaxed text-gray-500">Get AI visibility insights across ChatGPT, Claude, Gemini and more.</p>
        </div>
        <span className="hidden rounded-full bg-[#F0F4E7] px-3 py-1.5 text-[11px] font-bold text-[#617A2B] sm:block">Free scan</span>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button type="button" onClick={() => setStep(1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-[13px] font-semibold text-gray-600 transition-colors hover:bg-gray-50"><ArrowLeft size={16} /> Back</button>
        <button type="button" onClick={runFreeScan} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#617A2B] px-6 py-3 text-[13px] font-bold text-white transition-colors hover:bg-[#55672E]">Run free scan <ArrowRight size={17} /></button>
      </div>
    </Panel>
  );
}
