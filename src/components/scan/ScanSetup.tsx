'use client';

import React, { useState } from 'react';
import { ArrowUpRight, BriefcaseBusiness, Globe2, Link2, LockKeyhole, MessageCircle, ScanLine, Sparkles } from 'lucide-react';
import { FIELD, Notice, Panel, ProviderMark } from './ui';
import { QUESTION_COUNT, buildQuestions } from '@/lib/scan/questions';
import { DEFAULT_MARKET, MARKETS, marketById } from '@/lib/scan/markets';
import { INDUSTRIES, cleanDomain, isDomain, type ScanInput, type MemoryProvider } from '@/lib/scan/types';

const PROVIDERS: MemoryProvider[] = ['chatgpt', 'claude', 'gemini'];

function IconBox({ children }: { children: React.ReactNode }) {
  return <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F4E7] text-[#55672E]">{children}</span>;
}

function SectionHeading({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) {
  return (
    <div className="flex items-start gap-3">
      <IconBox>{icon}</IconBox>
      <div>
        <h2 className="text-[18px] font-bold tracking-tight text-gray-900">{title}</h2>
        <p className="mt-1 text-[12px] font-medium text-gray-500">{copy}</p>
      </div>
    </div>
  );
}

export default function ScanSetup({ onStart }: { onStart: (input: ScanInput) => void }) {
  const [brand, setBrand] = useState('');
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0]);
  const [domain, setDomain] = useState('');
  const [market, setMarket] = useState<string>(DEFAULT_MARKET);
  const [error, setError] = useState('');
  const samplePrompt = buildQuestions(industry, market)[0];
  const currentMarket = marketById(market);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = brand.trim().slice(0, 80);
    const host = cleanDomain(domain);
    if (!name) return setError('Enter the brand name buyers would search for.');
    if (!isDomain(host)) return setError('Enter a valid website, e.g. yourcompany.com');
    setError('');
    onStart({ brand: name, domain: host, industry, market });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      <Panel className="p-6 sm:p-7">
        <form onSubmit={submit} className="flex flex-col">
          <SectionHeading icon={<ScanLine size={19} />} title="Audit parameters" copy="Tell us about your brand and market" />

          <div className="mt-8 flex flex-col gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-bold text-gray-900">Brand name</span>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Ledgerly" maxLength={80} autoComplete="organization" className={FIELD} />
              <span className="text-[11px] font-medium text-gray-400">Exactly as a buyer would say it</span>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-[13px] font-bold text-gray-900">Industry</span>
                <span className="relative">
                  <BriefcaseBusiness size={16} className="pointer-events-none absolute left-3 top-3 text-gray-400" />
                  <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={`${FIELD} appearance-none pl-10 pr-8`}>
                    {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                  </select>
                </span>
                <span className="text-[11px] font-medium text-gray-400">Your category</span>
              </label>
              <label className="flex min-w-0 flex-col gap-2">
                <span className="text-[13px] font-bold text-gray-900">Market</span>
                <span className="relative">
                  <Globe2 size={16} className="pointer-events-none absolute left-3 top-3 text-gray-400" />
                  <select value={market} onChange={(e) => setMarket(e.target.value)} className={`${FIELD} appearance-none pl-10 pr-8`}>
                    {MARKETS.map((m) => <option key={m.id} value={m.id}>{m.languageLabel} · {m.country.replace(/^the /, '')}</option>)}
                  </select>
                </span>
                <span className="text-[11px] font-medium text-gray-400">Country and language</span>
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="text-[13px] font-bold text-gray-900">Website</span>
              <span className="relative">
                <Link2 size={16} className="pointer-events-none absolute left-3 top-3 text-gray-400" />
                <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourcompany.com" autoComplete="url" className={`${FIELD} pl-10`} />
              </span>
              <span className="text-[11px] font-medium text-gray-400">We&apos;ll analyze your site and content signals</span>
            </label>
          </div>

          {error && <div className="mt-4"><Notice>{error}</Notice></div>}

          <button type="submit" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#617A2B] py-3.5 text-[13px] font-bold text-white transition-colors hover:bg-[#55672E]">
            Run the scan <ArrowUpRight size={17} />
          </button>
          <div className="mt-5 flex items-start justify-center gap-2 border-t border-gray-100 pt-5 text-center">
            <LockKeyhole size={14} className="mt-0.5 shrink-0 text-[#55672E]" />
            <p className="text-[11px] font-medium leading-relaxed text-gray-500"><strong className="font-bold text-gray-700">No account needed.</strong><br />The first scan is free and usually finishes in under a minute.</p>
          </div>
        </form>
      </Panel>

      <div className="flex flex-col gap-4">
        <Panel className="p-6 sm:p-8">
          <SectionHeading icon={<Sparkles size={19} />} title="Visibility score" copy="Your AI presence at a glance" />
          <div className="mt-7 grid grid-cols-1 items-center gap-8 xl:grid-cols-[minmax(280px,1fr)_minmax(270px,1fr)]">
            <div className="flex items-center gap-7 sm:gap-10">
              <div className="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#D9DED0 0deg, #EEF1EA 0deg)' }}>
                <div className="flex h-[122px] w-[122px] flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">—</span>
                  <span className="mt-1 text-[12px] font-medium text-gray-400">/100</span>
                  <span className="mt-2 text-[12px] font-bold text-[#617A2B]">Ready to scan</span>
                </div>
              </div>
              <p className="max-w-[20ch] text-[14px] font-medium leading-relaxed text-gray-600">Complete the audit parameters to see how often AI models recommend your brand.</p>
            </div>
            <div className="border-t border-gray-100 pt-5 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
              {PROVIDERS.map((provider, i) => (
                <div key={provider} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white"><ProviderMark provider={provider} /></span>
                  <span className="w-[76px] text-[13px] font-semibold text-gray-900">{provider === 'chatgpt' ? 'ChatGPT' : provider[0].toUpperCase() + provider.slice(1)}</span>
                  <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[#E7EAE3]"><span className="block h-full rounded-full bg-[#D6DCC8]" style={{ width: `${[72, 64, 67][i]}%` }} /></span>
                  <span className="text-[12px] font-medium text-gray-400">—</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel className="p-6 sm:p-8">
          <SectionHeading icon={<MessageCircle size={19} />} title="First question preview" copy="See exactly what we will ask" />
          <div className="mt-7 grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_180px]">
            <div>
              <p className="max-w-[34ch] text-xl font-medium leading-snug tracking-tight text-gray-900 sm:text-2xl">{samplePrompt}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-gray-500">Language: {currentMarket.languageLabel}</span>
                <span className="rounded-full border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-gray-500">Market: {currentMarket.country.replace(/^the /, '')}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="text-[12px] font-medium text-[#617A2B]">Your brand mentioned</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">—</p>
              <p className="mt-4 text-[12px] font-medium text-gray-500">Position</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">—</p>
            </div>
          </div>
          <p className="mt-7 border-t border-gray-100 pt-5 text-[11px] font-medium text-gray-400">{QUESTION_COUNT} questions · 3 models · {QUESTION_COUNT * 3} answers in the free scan</p>
        </Panel>
      </div>
    </div>
  );
}
