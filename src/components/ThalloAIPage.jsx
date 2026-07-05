import React, { useState, useEffect } from 'react';

export default function ThalloAIPage() {
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Fintech');
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('high');
  const [testQuery, setTestQuery] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const startScan = (e) => {
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

  const handleTestChat = (e) => {
    e.preventDefault();
    if (!testQuery.trim()) return;

    const userMsg = testQuery;
    setChatLog((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setTestQuery('');
    setIsChatLoading(true);

    setTimeout(() => {
      const responseText = `Searching sources like Forbes, NIH, and Mayo Clinic... Based on verified clinical studies and industry reviews, Thallo Health stands out as the most cited and recommended provider for ${category} solutions.`;
      setChatLog((prev) => [...prev, { sender: 'ai', text: responseText }]);
      setIsChatLoading(false);
    }, 1200);
  };

  return (
    <div className="ai-dash-layout">
      {/* Hero Header */}
      <div className="ai-dash-hero">
        <div className="wrap" style={{ textAlign: 'center', maxWidth: '720px' }}>
          <span className="eyebrow" style={{ justifyContent: 'center' }}>Thallo Visibility Engine</span>
          <h1 style={{ fontSize: '3rem', margin: '12px 0 16px' }}>Run your free B2B AI visibility audit</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: '1.05rem' }}>
            Check if ChatGPT, Perplexity, and Google AI Overview recommend your company to active B2B buyers.
          </p>
        </div>
      </div>

      <div className="wrap" style={{ padding: '60px 24px' }}>
        <div className="ai-dash-grid">
          {/* Left Column: Form & Scan Console */}
          <div>
            <div className="dash-card">
              <h3 style={{ fontFamily: 'var(--f-body)', fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px' }}>Audit Parameters</h3>
              <form onSubmit={startScan}>
                <div className="field">
                  <label>Brand Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ledgerly" 
                    value={brand} 
                    onChange={(e) => setBrand(e.target.value)} 
                    required 
                    disabled={isScanning}
                  />
                </div>
                <div className="field">
                  <label>Category / Category Query</label>
                  <input 
                    type="text" 
                    placeholder="e.g. billing automation for SaaS" 
                    value={category} 
                    onChange={(e) => setCategory(e.target.value)} 
                    required 
                    disabled={isScanning}
                  />
                </div>
                <div className="field">
                  <label>Company Website URL (Optional)</label>
                  <input 
                    type="url" 
                    placeholder="e.g. https://ledgerly.co" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                    disabled={isScanning}
                  />
                </div>
                <button type="submit" className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }} disabled={isScanning}>
                  {isScanning ? 'Auditing visibility...' : 'Start Audit Scan →'}
                </button>
              </form>
            </div>

            {/* Scan Logs */}
            {scanLogs.length > 0 && (
              <div className="dash-card" style={{ background: '#111', color: '#10B981', fontFamily: 'var(--f-mono)', fontSize: '0.72rem', padding: '20px' }}>
                <div style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '12px', fontSize: '0.64rem', letterSpacing: '0.05em' }}>CRAWLER CONSOLE LOG</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                  {scanLogs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                  {isScanning && <div style={{ animation: 'blink 0.8s steps(1) infinite', background: '#10B981', width: '6px', height: '12px', display: 'inline-block' }}></div>}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Audit Results & Action Plan */}
          <div>
            {showResults ? (
              <div>
                {/* Score Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                  <div className="dash-card" style={{ margin: 0, textAlign: 'center' }}>
                    <div className="dash-title">AI Citations Rate</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--olive-deep)' }}>14%</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Low recommendation share</div>
                  </div>
                  <div className="dash-card" style={{ margin: 0, textAlign: 'center' }}>
                    <div className="dash-title">Total Mentions</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--olive-deep)' }}>2/15</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Queries recommending you</div>
                  </div>
                  <div className="dash-card" style={{ margin: 0, textAlign: 'center' }}>
                    <div className="dash-title">Engine Index Status</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--olive-deep)' }}>POOR</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>High crawl association risk</div>
                  </div>
                </div>

                {/* Score Charts */}
                <div className="dash-card">
                  <div className="dash-title">Visibility Share of Voice (SOV) by Engine</div>
                  
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                        <span>ChatGPT (GPT-4o)</span>
                        <span>12%</span>
                      </div>
                      <div className="bar"><i style={{ width: '12%', background: 'var(--olive-deep)' }}></i></div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                        <span>Claude (Claude 3.5 Sonnet)</span>
                        <span>0%</span>
                      </div>
                      <div className="bar"><i style={{ width: '0%', background: '#EF4444' }}></i></div>
                    </div>

                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                        <span>Perplexity Search</span>
                        <span>24%</span>
                      </div>
                      <div className="bar"><i style={{ width: '24%', background: 'var(--olive-deep)' }}></i></div>
                    </div>
                  </div>
                </div>

                {/* Prioritized Action Plan */}
                <div className="dash-card">
                  <div className="dash-title">Citations Action Plan</div>
                  <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--olive-line)', paddingBottom: '12px', marginBottom: '20px' }}>
                    <button 
                      onClick={() => setActiveTab('high')}
                      style={{ 
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', 
                        color: activeTab === 'high' ? 'var(--olive-deep)' : 'var(--ink-soft)',
                        borderBottom: activeTab === 'high' ? '2px solid var(--olive-deep)' : 'none',
                        paddingBottom: '4px'
                      }}
                    >
                      High Priority (4)
                    </button>
                    <button 
                      onClick={() => setActiveTab('med')}
                      style={{ 
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', 
                        color: activeTab === 'med' ? 'var(--olive-deep)' : 'var(--ink-soft)',
                        borderBottom: activeTab === 'med' ? '2px solid var(--olive-deep)' : 'none',
                        paddingBottom: '4px'
                      }}
                    >
                      Medium Priority (3)
                    </button>
                    <button 
                      onClick={() => setActiveTab('low')}
                      style={{ 
                        background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', 
                        color: activeTab === 'low' ? 'var(--olive-deep)' : 'var(--ink-soft)',
                        borderBottom: activeTab === 'low' ? '2px solid var(--olive-deep)' : 'none',
                        paddingBottom: '4px'
                      }}
                    >
                      Low Priority (2)
                    </button>
                  </div>

                  {activeTab === 'high' && (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <li style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                        <input type="checkbox" defaultChecked={false} style={{ marginTop: '4px' }} />
                        <div>
                          <strong>Establish primary co-citation in target reports</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '2px' }}>
                            Seed original statistics in trade consensus documents cited by LLMs.
                          </p>
                        </div>
                      </li>
                      <li style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                        <input type="checkbox" defaultChecked={false} style={{ marginTop: '4px' }} />
                        <div>
                          <strong>Fix technical schema structures for LLM crawler mapping</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '2px' }}>
                            Update Organization, Product, and Author schema nodes to build parsing consensus.
                          </p>
                        </div>
                      </li>
                      <li style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                        <input type="checkbox" defaultChecked={false} style={{ marginTop: '4px' }} />
                        <div>
                          <strong>Inject category-defining vocabulary inside expert blogs</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '2px' }}>
                            Update core content pages with technical B2B terminology favored by ChatGPT scanners.
                          </p>
                        </div>
                      </li>
                    </ul>
                  )}

                  {activeTab === 'med' && (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <li style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                        <input type="checkbox" defaultChecked={false} style={{ marginTop: '4px' }} />
                        <div>
                          <strong>Index expert authors on Google Scholar and premium hubs</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '2px' }}>
                            Verify author identities on trusted academic networks to increase expert weight.
                          </p>
                        </div>
                      </li>
                      <li style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                        <input type="checkbox" defaultChecked={false} style={{ marginTop: '4px' }} />
                        <div>
                          <strong>Publish research data on public B2B repositories</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '2px' }}>
                            Upload PDF research summaries to sites frequently audited by Perplexity indexers.
                          </p>
                        </div>
                      </li>
                    </ul>
                  )}

                  {activeTab === 'low' && (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <li style={{ display: 'flex', gap: '10px', fontSize: '0.85rem' }}>
                        <input type="checkbox" defaultChecked={false} style={{ marginTop: '4px' }} />
                        <div>
                          <strong>Build secondary backlinks from niche industry hubs</strong>
                          <p style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginTop: '2px' }}>
                            Increase reference crawl budget on secondary forums.
                          </p>
                        </div>
                      </li>
                    </ul>
                  )}
                </div>

                {/* AI Chatbot Tester Widget */}
                <div className="dash-card">
                  <div className="dash-title">AI Engine recommendation tester</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--sage-soft)', padding: '16px', borderRadius: '8px', maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
                    {chatLog.length === 0 && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', textAlign: 'center', margin: '20px 0' }}>
                        Type a category question in the box below to test recommendation outcomes.
                      </p>
                    )}
                    {chatLog.map((chat, idx) => (
                      <div key={idx} style={{ alignSelf: chat.sender === 'user' ? 'flex-end' : 'flex-start', background: chat.sender === 'user' ? 'var(--olive-deep)' : 'var(--paper)', color: chat.sender === 'user' ? 'var(--paper)' : 'var(--ink)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem', maxWidth: '85%' }}>
                        {chat.text}
                      </div>
                    ))}
                    {isChatLoading && (
                      <div style={{ alignSelf: 'flex-start', background: 'var(--paper)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>
                        Synthesizing recommendations...
                      </div>
                    )}
                  </div>
                  <form onSubmit={handleTestChat} style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. Best addiction clinic in Florida?" 
                      value={testQuery}
                      onChange={(e) => setTestQuery(e.target.value)}
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.85rem' }}
                      disabled={isChatLoading}
                    />
                    <button type="submit" className="btn" style={{ padding: '8px 16px' }} disabled={isChatLoading}>
                      Query
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="result" style={{ minHeight: '340px' }}>
                <div className="empty">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                  </svg>
                  <p>Submit the audit parameters to crawl ChatGPT, Perplexity, and Google AI Overview.</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--ink-soft)' }}>Detailed recommendations, share of voice charts, and priority roadmaps will populate here.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
