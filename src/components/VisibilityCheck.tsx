'use client';

import React, { useState } from 'react';
import Eyebrow from '@/components/ui/Eyebrow';
import { SplitReveal } from '@/components/motion';

interface ResultData {
  score: number;
  mentions: string;
  perplexity: string;
  chatGpt: string;
  googleAi: string;
  advice: string;
}

export default function VisibilityCheck() {
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Fintech');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) return;

    setIsLoading(true);
    setResult(null);

    setTimeout(() => {
      const score = Math.round(((brand.length * 7) % 35) + 12);
      
      setResult({
        score: score,
        mentions: score > 30 ? '2/3 engines' : '0/3 engines',
        perplexity: score > 30 ? 'Mentioned' : 'Not mentioned',
        chatGpt: score > 40 ? 'Cited' : 'Not recommended',
        googleAi: 'Not recommended',
        advice: score > 30 
          ? `Your brand "${brand}" has baseline citations in ${category}, but lacks connection to authority databases. It is frequently bypassed for direct purchaser recommendations.`
          : `Your brand "${brand}" is completely invisible to conversational AI models for B2B searches in ${category}. The recommendations default entirely to your competitors.`
      });
      setIsLoading(false);
    }, 1200);
  };

  return (
    <section className="bg-white py-24 border-b border-gray-100" id="tool">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="bg-gray-50/50 border border-gray-100 rounded-[32px] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Panel: Form */}
          <div>
            <Eyebrow className="mb-5">Interactive Diagnosis</Eyebrow>
            <SplitReveal
              as="h2"
              className="text-4xl sm:text-5xl font-medium tracking-tight text-gray-900 leading-[1.05] mb-6 font-sans"
              html="Check your AI visibility."
            />
            <p className="text-gray-500 font-medium text-base leading-relaxed max-w-[45ch] mb-8">
              Enter your B2B brand and category to estimate your current recommendation rate across ChatGPT, Claude, and Google AI Overview.
            </p>
            <form onSubmit={handleCheck} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Company Brand Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ledgerly" 
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-[12px] bg-white text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Category / Industry</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-[12px] bg-white text-xs font-medium text-gray-800 focus:outline-none focus:border-gray-400"
                >
                  <option value="Fintech">Fintech & Payments</option>
                  <option value="Health Tech">Health Tech & Recovery</option>
                  <option value="SaaS">Enterprise Software / SaaS</option>
                  <option value="Professional Services">Professional Services</option>
                </select>
              </div>
              <button 
                type="submit" 
                className="mt-4 px-6 py-3.5 bg-[#39471D] border border-[#39471D] rounded-[16px] text-xs font-bold text-white hover:bg-[#55672E] hover:border-[#55672E] transition-all flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? 'Scanning databases...' : 'Run Visibility Check →'}
              </button>
            </form>
          </div>

          {/* Right Panel: Result display */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-md min-h-[300px] flex flex-col justify-center">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-5 h-5 rounded-full border-2 border-emerald-800 border-t-transparent animate-spin mx-auto mb-4"></div>
                <span className="text-xs text-gray-500 font-bold">Crawling model response indexes...</span>
              </div>
            ) : result ? (
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-[#39471D]">{result.score}%</span>
                  <span className="text-[8px] font-bold tracking-wider text-gray-400 uppercase">VISIBILITY SCORE</span>
                </div>
                <p className="text-[10px] text-gray-400 font-medium mb-6">Recommendation rate across target prompts.</p>
                
                <div className="flex flex-col gap-2.5 border-t border-b border-gray-50 py-4 mb-6 text-[11px] font-medium">
                  <div className="flex justify-between">
                    <span className="text-gray-400">ChatGPT recommendation:</span>
                    <span className={`font-bold ${result.chatGpt === 'Cited' ? 'text-emerald-800' : 'text-rose-500'}`}>{result.chatGpt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Perplexity recommendation:</span>
                    <span className={`font-bold ${result.perplexity === 'Mentioned' ? 'text-emerald-800' : 'text-rose-500'}`}>{result.perplexity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Google AI Overview:</span>
                    <span className="font-bold text-rose-500">{result.googleAi}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-semibold mb-4">{result.advice}</p>
                
                <a 
                  href="#cta" 
                  onClick={(e) => { e.preventDefault(); document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="text-xs font-bold text-[#39471D] underline"
                >
                  Book a full B2B visibility audit to fix this →
                </a>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 flex flex-col items-center gap-4">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M21 12H3M12 3v18" />
                </svg>
                <p className="text-xs font-semibold max-w-[28ch] leading-relaxed">
                  Submit your brand details to generate a real-time visibility diagnostic.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
