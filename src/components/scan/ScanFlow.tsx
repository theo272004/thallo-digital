'use client';

import React, { useEffect, useRef, useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import ScanSetup from './ScanSetup';
import ScanProgress from './ScanProgress';
import ScanResults from './ScanResults';
import FullReport from './FullReport';
import { MODE, runPhase1, runPhase2 } from '@/lib/scan/engine';
import type { ScanInput, ScanResult } from '@/lib/scan/types';

type Stage = 'setup' | 'scanning' | 'results' | 'report';

export default function ScanFlow() {
  const [stage, setStage] = useState<Stage>('setup');
  const [scan, setScan] = useState<ScanResult | null>(null);
  /** Kept separately so the scanning screen can name the brand before results land. */
  const [pending, setPending] = useState<ScanInput | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState('');
  const topRef = useRef<HTMLDivElement>(null);

  // Each stage is a full screen change — start the reader at the top of it.
  useEffect(() => {
    if (stage !== 'setup') topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [stage]);

  const start = async (input: ScanInput) => {
    setError('');
    setPending(input);
    setStage('scanning');
    try {
      const phase1 = await runPhase1(input);
      setScan(phase1);
      setStage('results');
    } catch {
      setError('The scan could not be completed. Please try again.');
      setStage('setup');
    }
  };

  const unlock = async (email: string) => {
    if (!scan) return;
    setUnlocking(true);
    setError('');
    try {
      const phase2 = await runPhase2(scan, email);
      setScan({ ...scan, phase2 });
      setStage('report');
    } catch {
      setError('We could not unlock the report. Please try again.');
    } finally {
      setUnlocking(false);
    }
  };

  const reset = () => {
    setScan(null);
    setPending(null);
    setError('');
    setStage('setup');
  };

  return (
    <section className="bg-white pt-32 sm:pt-40 pb-24">
      <div className="max-w-[1100px] mx-auto px-6">
        {MODE === 'demo' && <DemoNotice />}

        {/* Header — collapses to a compact bar once a scan is running. */}
        <div ref={topRef} className="scroll-mt-28">
          {stage === 'setup' ? (
            <div className="text-center mb-12">
              <Eyebrow center className="mb-7">
                Thallo visibility engine
              </Eyebrow>
              <h1 className="font-serif text-4xl sm:text-6xl text-gray-900 leading-[1.05] mb-6 max-w-[20ch] mx-auto">
                Do the models recommend you?
              </h1>
              <p className="text-[16px] sm:text-[17px] text-gray-500 font-medium leading-relaxed max-w-[54ch] mx-auto">
                We ask ChatGPT, Claude and Gemini the questions your buyers ask, and count how often your name comes
                up. Free, and you can see every question we sent.
              </p>
            </div>
          ) : (
            scan && (
              <div className="flex items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-100">
                <div>
                  <p className="font-serif text-2xl text-gray-900 leading-tight">{scan.brand}</p>
                  <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-gray-400 mt-1">
                    {scan.domain} · {scan.industry}
                  </p>
                </div>
                <button
                  onClick={reset}
                  className="text-[13px] font-bold text-[#39471D] hover:underline shrink-0"
                >
                  Scan another brand
                </button>
              </div>
            )
          )}
        </div>

        {stage === 'setup' && (
          <>
            <ScanSetup onStart={start} />
            {error && <p className="text-[13px] font-semibold text-rose-600 mt-5 text-center">{error}</p>}
          </>
        )}

        {stage === 'scanning' && <ScanProgress brand={pending?.brand ?? scan?.brand ?? 'your brand'} />}

        {stage === 'results' && scan && (
          <ScanResults scan={scan} onUnlock={unlock} unlocking={unlocking} error={error} />
        )}

        {stage === 'report' && scan?.phase2 && <FullReport scan={scan} />}
      </div>
    </section>
  );
}

/**
 * Visible for as long as the engine returns sample data. The predecessor to
 * this tool showed invented numbers as though they were measured; that is the
 * one failure mode worth a permanent banner.
 */
function DemoNotice() {
  return (
    <div className="flex items-start gap-4 bg-[#FBFFE8] border border-[#DFFF3B] rounded-2xl px-6 py-4 mb-10">
      <span className="mt-0.5 shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#39471D" strokeWidth="2.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5m0 3.5v.5" />
        </svg>
      </span>
      <p className="text-[13px] text-[#39471D] font-medium leading-relaxed">
        <strong className="font-bold">Preview mode.</strong> The model APIs are not connected yet, so the numbers
        below are sample data used to build and review the interface. Nothing here is a real measurement.
      </p>
    </div>
  );
}
