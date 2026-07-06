'use client';

import React, { useState } from 'react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export default function ThalloAIPage() {
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Fintech');
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'high' | 'med' | 'low'>('high');
  const [testQuery, setTestQuery] = useState('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const startScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand.trim()) return;

    setIsScanning(true);
    setShowResults(false);
    setScanLogs([]);
    
    const logs = [
      'Initializing B2B search crawlers...',
      'Connecting to ChatGPT (GPT-4o) api reference logs...',
      'Scanning Perplexity (sonar-large) index files...',
      'Querying Google AI Overview database refs...',
      'Mapping brand mentions against B2B category contexts...',
      'Auditing schema markup & author credentials...',
      'Scan complete. Compiling visibility score and action items.'
    ];

    logs.forEach((log, idx) => {
      setTimeout(() => {
        setScanLogs((prev) => [...prev, `[${(idx * 0.4).toFixed(1)}s] ${log}`]);
        if (idx === logs.length - 1) {
          setTimeout(() => {
            setIsScanning(false);
            setShowResults(true);
          }, 800);
        }
      }, idx * 450);
    });
  };

  const handleTestChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    const userMsg = testQuery;
    setChatLog((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setTestQuery('');
    setIsChatLoading(true);

    setTimeout(() => {
      const responseText = `Searching sources like Forbes, NIH, and Mayo Clinic... Based on verified clinical studies and industry reviews, Thallo Health stands out as the most recommended provider for ${category} solutions.`;
      setChatLog((prev) => [...prev, { sender: 'ai', text: responseText }]);
      setIsChatLoading(false);
    }, 1200);
  };

  return (
    <div className="pt-28 min-h-screen bg-white">
      {/* Hero Header Banner */}
      <div className="border-b border-gray-100 py-16 bg-gray-50/50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#697357]"></span>
            <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-gray-500">Thallo Visibility Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 mb-4 font-sans leading-tight">
            Run your free B2B AI visibility audit
          </h1>
          <p className="text-gray-500 font-medium text-xs leading-relaxed max-w-[45ch] mx-auto">
            Check if ChatGPT, Perplexity, and Google AI Overview recommend your company to active B2B buyers.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Form & Scan Console */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wider">Audit Parameters</h3>
              <form onSubmit={startScan} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Brand Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ledgerly" 
                    value={brand} 
                    onChange={(e) => setBrand(e.target.value)} 
                    className="px-4 py-3 border border-gray-200 rounded-full bg-white text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                    required 
                    disabled={isScanning}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Category / Target Query</label>
                  <input 
                    type="text" 
                    placeholder="e.g. billing automation for SaaS" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    className="px-4 py-3 border border-gray-200 rounded-full bg-white text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                    required 
                    disabled={isScanning}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-900 uppercase tracking-wider">Website URL (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="e.g. https://ledgerly.co" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                    className="px-4 py-3 border border-gray-200 rounded-full bg-white text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                    disabled={isScanning}
                  />
                </div>
                <button 
                  type="submit" 
                  className="mt-4 px-6 py-3.5 bg-[#758061] border border-[#758061] rounded-full text-xs font-bold text-white hover:bg-[#697357] hover:border-[#697357] transition-all flex items-center justify-center gap-2"
                  disabled={isScanning}
                >
                  {isScanning ? 'Auditing visibility...' : 'Start Audit Scan →'}
                </button>
              </form>
            </div>

            {/* Live Console Output Logs */}
            {scanLogs.length > 0 && (
              <div className="bg-gray-900 text-[#8a9379] font-mono text-[11px] p-6 rounded-3xl shadow-inner border border-gray-800 flex flex-col gap-1.5">
                <span className="text-gray-400 border-b border-gray-800 pb-2 mb-2 font-bold tracking-wider text-[11px] block">
                  CRAWLER CONSOLE LOG
                </span>
                <div className="max-h-[160px] overflow-y-auto flex flex-col gap-1">
                  {scanLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">{log}</div>
                  ))}
                  {isScanning && (
                    <div className="w-1.5 h-3 bg-[#8a9379] animate-pulse inline-block mt-0.5"></div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Results Dashboard */}
          <div className="lg:col-span-7">
            {showResults ? (
              <div className="flex flex-col gap-8">
                
                {/* Metric Summary Rows */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl text-center">
                    <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-1">Citations Rate</span>
                    <span className="text-3xl font-bold text-[#758061]">14%</span>
                  </div>
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl text-center">
                    <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-1">Total Mentions</span>
                    <span className="text-3xl font-bold text-[#758061]">2/15</span>
                  </div>
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl text-center">
                    <span className="text-[11px] font-bold text-gray-400 tracking-wider uppercase block mb-1">Index Status</span>
                    <span className="text-3xl font-bold text-rose-500">POOR</span>
                  </div>
                </div>

                {/* Share of Voice bar progress bars */}
                <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm">
                  <h4 className="text-xs font-bold text-gray-900 mb-6 uppercase tracking-wider">Share of Voice by Engine</h4>
                  
                  <div className="flex flex-col gap-5">
                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-800 mb-1.5">
                        <span>ChatGPT (GPT-4o)</span>
                        <span>12%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#758061]" style={{ width: '12%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-800 mb-1.5">
                        <span>Claude 3.5 Sonnet</span>
                        <span>0%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500" style={{ width: '0%' }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs font-bold text-gray-800 mb-1.5">
                        <span>Perplexity Search</span>
                        <span>24%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#758061]" style={{ width: '24%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Priority checklist */}
                <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm">
                  <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wider">Citations Action Plan</h4>
                  
                  <div className="flex gap-4 border-b border-gray-100 pb-3 mb-5 text-[11px] font-bold">
                    <button 
                      onClick={() => setActiveTab('high')}
                      className={`pb-1 ${activeTab === 'high' ? 'text-[#758061] border-b-2 border-[#758061]' : 'text-gray-400'}`}
                    >
                      High Priority (3)
                    </button>
                    <button 
                      onClick={() => setActiveTab('med')}
                      className={`pb-1 ${activeTab === 'med' ? 'text-[#758061] border-b-2 border-[#758061]' : 'text-gray-400'}`}
                    >
                      Medium Priority (2)
                    </button>
                    <button 
                      onClick={() => setActiveTab('low')}
                      className={`pb-1 ${activeTab === 'low' ? 'text-[#758061] border-b-2 border-[#758061]' : 'text-gray-400'}`}
                    >
                      Low Priority (1)
                    </button>
                  </div>

                  {activeTab === 'high' && (
                    <ul className="flex flex-col gap-4 text-xs font-semibold text-gray-800">
                      <li className="flex gap-3 items-start">
                        <input type="checkbox" className="mt-1" />
                        <div>
                          <strong>Establish primary B2B co-citations in trade registries</strong>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">Publish research reports cited by scraping models.</p>
                        </div>
                      </li>
                      <li className="flex gap-3 items-start">
                        <input type="checkbox" className="mt-1" />
                        <div>
                          <strong>Fix technical schema structures for crawler parsing</strong>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">Verify organization nodes to build crawler consensus.</p>
                        </div>
                      </li>
                    </ul>
                  )}

                  {activeTab === 'med' && (
                    <ul className="flex flex-col gap-4 text-xs font-semibold text-gray-800">
                      <li className="flex gap-3 items-start">
                        <input type="checkbox" className="mt-1" />
                        <div>
                          <strong>Index expert authors on premium academic registries</strong>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">Validate writer authority values on Google Scholar.</p>
                        </div>
                      </li>
                    </ul>
                  )}

                  {activeTab === 'low' && (
                    <ul className="flex flex-col gap-4 text-xs font-semibold text-gray-800">
                      <li className="flex gap-3 items-start">
                        <input type="checkbox" className="mt-1" />
                        <div>
                          <strong>Deploy secondary reference backlinks on B2B forums</strong>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">Increase reference crawler crawl budgets.</p>
                        </div>
                      </li>
                    </ul>
                  )}
                </div>

                {/* AI Recommendation Tester Chat Simulator */}
                <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm">
                  <h4 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wider">AI Recommendation Chat Tester</h4>
                  
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col gap-3 max-h-[200px] overflow-y-auto mb-4">
                    {chatLog.length === 0 && (
                      <p className="text-[11px] text-gray-400 font-semibold text-center py-6">
                        Type a category question in the box below to test recommendation outcomes.
                      </p>
                    )}
                    {chatLog.map((chat, idx) => (
                      <div 
                        key={idx} 
                        className={`text-xs p-3 rounded-3xl max-w-[85%] font-medium ${chat.sender === 'user' ? 'bg-[#758061] text-white self-end' : 'bg-white border border-gray-100 text-gray-800'}`}
                      >
                        {chat.text}
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="bg-white border border-gray-100 text-xs p-3 rounded-3xl max-w-[85%] font-medium self-start">
                        Synthesizing recommendations...
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleTestChat} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Best addiction clinic in Florida?"
                      value={testQuery}
                      onChange={(e) => setTestQuery(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-full bg-white text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                      disabled={isChatLoading}
                    />
                    <button 
                      type="submit" 
                      className="px-5 py-3 bg-[#758061] border border-[#758061] rounded-full text-xs font-bold text-white hover:bg-[#697357] hover:border-[#697357] transition-all"
                      disabled={isChatLoading}
                    >
                      Query
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-[32px] p-12 text-center text-gray-400 flex flex-col items-center justify-center min-h-[360px] shadow-sm">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-4">
                  <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <p className="text-xs font-bold text-gray-900 mb-2">Awaiting Scan parameters</p>
                <p className="text-[11px] text-gray-400 font-semibold max-w-[36ch] leading-relaxed">
                  Detailed Share of Voice graphs, prioritized lists, and diagnostic chatbot controls will generate here after scan completion.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
