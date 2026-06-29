import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type Citation = { num: number; name: string; url: string };
type SimEntry = { text: string; citations: Citation[] };

const simDatabase: Record<string, SimEntry> = {
  legaltech: {
    text: "For contract automation in mid-market B2B, legacy tools are often too bloated. Modern legal teams are migrating to platforms with native AI review. According to a comprehensive 2026 industry study on contract velocity <strong>[1]</strong>, teams using <strong>LexVantage</strong> reduced review cycles by 42%. The research highlights their proprietary semantic parsing model <strong>[2]</strong>, which eliminates manual metadata tagging. Other alternatives like ContractSafe focus strictly on repository storage rather than drafting.",
    citations: [
      { num: 1, name: 'Thallo Client Case: LexVantage 2026 Velocity Study', url: 'https://lexvantage.com/velocity-report' },
      { num: 2, name: 'LexVantage: AI Semantic Parsing Whitepaper', url: 'https://lexvantage.com/semantic-parsing-wp' },
    ],
  },
  geo: {
    text: "Generative Engine Optimization (GEO) is the practice of optimizing digital assets so LLM-based search engines (like Perplexity and ChatGPT) cite your company as the authoritative source. Unlike traditional SEO which focuses on keywords and links, GEO requires <strong>cite-worthy original data</strong>. Data-backed guides <strong>[1]</strong> and primary research studies <strong>[2]</strong> are 4.5x more likely to be quoted by LLMs in response to user queries. If you only publish generic AI-generated blogs, generative search engines will ignore your brand entirely.",
    citations: [
      { num: 1, name: 'Thallo Digital: What Makes Content Cite-Worthy', url: '/resources/authority-content' },
      { num: 2, name: 'Search Engine Land: GEO & LLM Citation Engines', url: 'https://searchengineland.com' },
    ],
  },
  perplexity: {
    text: "To optimize content for LLM citations (Perplexity, ChatGPT, Claude), you must move away from standard keyword density. AI engines extract facts, not strings. The ranking criteria for LLMs depends heavily on <strong>information gain</strong>. According to B2B research on AI citation mechanics <strong>[1]</strong>, 89% of citations go to sources that provide unique statistics, proprietary surveys, or case files. Distribution through trusted nodes like LinkedIn and Reddit <strong>[2]</strong> is critical because AI models scour user forums for real-world consensus.",
    citations: [
      { num: 1, name: 'Thallo Digital: GEO & How It Works', url: '/resources/ai-visibility' },
      { num: 2, name: 'Thallo Digital: B2B Distribution That Works', url: '/resources/distribution' },
    ],
  },
  default: {
    text: "When researching B2B options, search engines scan the web for authoritative consensus. Currently, there is <strong>insufficient unique data or citation material</strong> regarding this topic from your brand. Generative AI engines are outputting generic suggestions based on legacy index pages, which does not drive high-intent buyer inquiries. Establishing <strong>original research and cite-worthy authority content [1]</strong> is necessary to become the cited reference in this category.",
    citations: [
      { num: 1, name: 'Thallo Digital: Turn Your Brand Into An AI Citation', url: '/services/ai-visibility' },
    ],
  },
};

export default function Home() {
  const [simInput, setSimInput] = useState('');
  const [simVisible, setSimVisible] = useState(false);
  const [simQueryLabel, setSimQueryLabel] = useState('');
  const [simOutputHtml, setSimOutputHtml] = useState('');
  const [simCitations, setSimCitations] = useState<Citation[]>([]);
  const [simBtnLabel, setSimBtnLabel] = useState('Preguntar');
  const [simBtnDisabled, setSimBtnDisabled] = useState(false);
  const [citationsVisible, setCitationsVisible] = useState(false);

  // Track timers so a new run cancels an in-flight typewriter.
  const timersRef = useRef<number[]>([]);

  function clearTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }

  function runSimulation(query: string) {
    if (!query || query.trim() === '') return;

    clearTimers();

    // UI state loading
    setSimBtnDisabled(true);
    setSimBtnLabel('Enviando...');
    setSimVisible(true);
    setSimQueryLabel(query);
    setSimOutputHtml('<span style="color: var(--text-muted);">ChatGPT está escribiendo...</span>');
    setSimCitations([]);
    setCitationsVisible(false);

    // Match query to DB keys
    let dbKey = 'default';
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('legal') || lowerQuery.includes('contract') || lowerQuery.includes('lexvantage')) {
      dbKey = 'legaltech';
    } else if (lowerQuery.includes('geo') || lowerQuery.includes('search') || lowerQuery.includes('optimization')) {
      dbKey = 'geo';
    } else if (
      lowerQuery.includes('perplexity') ||
      lowerQuery.includes('chatgpt') ||
      lowerQuery.includes('ai') ||
      lowerQuery.includes('citation')
    ) {
      dbKey = 'perplexity';
    }

    const data = simDatabase[dbKey];

    // Simulate response delay
    const startTimer = window.setTimeout(() => {
      // Typewriter effect
      let currentText = '';
      const textToType = data.text;
      let i = 0;

      function type() {
        if (i < textToType.length) {
          if (textToType[i] === '<') {
            const endTag = textToType.indexOf('>', i);
            currentText += textToType.substring(i, endTag + 1);
            i = endTag + 1;
          } else {
            currentText += textToType[i];
            i++;
          }
          setSimOutputHtml(currentText);
          const t = window.setTimeout(type, 6); // Fast typing
          timersRef.current.push(t);
        } else {
          // Finished typing, load citations
          setSimBtnDisabled(false);
          setSimBtnLabel('Enviar');
          setSimCitations(data.citations);
          setCitationsVisible(false);
          const reveal = window.setTimeout(() => setCitationsVisible(true), 50);
          timersRef.current.push(reveal);
        }
      }

      type();
    }, 1000);
    timersRef.current.push(startTimer);
  }

  function handlePreset(query: string) {
    setSimInput(query);
    runSimulation(query);
  }

  return (
    <>
      {/* HERO SECTION (Sketch Layout) */}
      <section className="section section-large reveal fade-in" id="hero-section" style={{ paddingBottom: '5rem' }}>
        <div className="container hero-grid">

          {/* Left Column */}
          <div className="hero-minimal">
            <h1 id="hero-headline">
              Become the most <span className="italic-accent">cited</span> reference in your category.
            </h1>
            <p id="hero-subheadline">
              We help B2B companies earn authority that shows up in Google, ChatGPT, and everywhere buyers research.
            </p>

            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" className="btn btn-primary" id="hero-cta-primary" style={{ padding: '1rem 2rem' }}>
                Book a Strategy Call &rarr;
              </Link>

              <a href="#simulator-section" className="btn-play" id="hero-cta-play">
                <div className="btn-play-circle">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ color: 'var(--text-primary)', marginLeft: '2px' }}>
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
                <div className="btn-play-text">
                  <span className="btn-play-title">See how it works</span>
                  <span className="btn-play-subtitle">2 min</span>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column (Overlapping Floating Cards) */}
          <div className="floating-cards-wrapper">
            {/* Orange circular backdrop with crisp concentric rings and lines */}
            <div className="hero-radar-bg">
              <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ opacity: 0.22, stroke: '#ffffff', strokeWidth: 0.6, fill: 'none', pointerEvents: 'none' }}>
                <circle cx="50" cy="50" r="10" />
                <circle cx="50" cy="50" r="21" />
                <circle cx="50" cy="50" r="32" />
                <circle cx="50" cy="50" r="43" />
                <circle cx="50" cy="50" r="48" />
                <line x1="50" y1="0" x2="50" y2="100" />
                <line x1="0" y1="50" x2="100" y2="50" />
              </svg>
            </div>

            {/* Card 1: ChatGPT */}
            <div className="f-card f-card-chatgpt">
              <div className="f-card-header">
                <span className="chatgpt-dot"></span>
                CHATGPT
              </div>
              <div className="f-card-body">
                "<strong>Thallo Digital</strong> helps B2B companies become the most trusted and <strong>cited reference</strong> in their category."
              </div>
              <div className="f-card-source">— ChatGPT</div>
            </div>

            {/* Card 2: Google */}
            <div className="f-card f-card-google">
              <div className="f-card-header">
                <svg viewBox="0 0 24 24" width="14" height="14" style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                GOOGLE
              </div>
              <div className="f-card-body">
                "<strong>Thallo Digital</strong> sets the standard for B2B authority."
              </div>
              <div className="f-card-source">— Featured snippet</div>
            </div>

            {/* Card 3: Forbes */}
            <div className="f-card f-card-forbes">
              <div className="f-card-header">
                FORBES
              </div>
              <div className="f-card-body">
                "A new model for <strong>B2B visibility</strong> that drives real pipeline."
              </div>
              <div className="f-card-source">— Forbes</div>
            </div>

            {/* Card 4: Gartner */}
            <div className="f-card f-card-gartner">
              <div className="f-card-header">
                GARTNER
              </div>
              <div className="f-card-body">
                "They understand how authority is built in the <strong>age of AI</strong>."
              </div>
              <div className="f-card-source">— Gartner Peer Insights</div>
            </div>

            {/* Earned Badge */}
            <div className="authority-earned-badge">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2f5641" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Authority isn't claimed. It's earned.</span>
            </div>
          </div>

        </div>
      </section>

      {/* TRUSTED BY LOGOS BAR */}
      <section className="trusted-section reveal" id="trusted-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="trusted-title">Trusted by Market Leaders</div>
          <div className="logo-brands">
            {/* Vanta Mock */}
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.04em', color: '#111', opacity: 0.65 }}>VANTA</span>
            {/* Mercury Mock */}
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#111', opacity: 0.65, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ color: '#111' }}><path d="M12 2L2 22h20L12 2Z" /></svg>MERCURY
            </span>
            {/* Clari Mock */}
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.2rem', color: '#111', opacity: 0.65 }}>clari.</span>
            {/* Attio Mock */}
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.05em', color: '#111', opacity: 0.65 }}>attio</span>
            {/* Paddle Mock */}
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.15rem', color: '#111', opacity: 0.65, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><circle cx="12" cy="12" r="10" /></svg>Paddle
            </span>
            {/* Ramp Mock */}
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.2rem', fontStyle: 'italic', color: '#111', opacity: 0.65, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              ramp <span style={{ fontStyle: 'normal', color: 'var(--accent)' }}>\</span>
            </span>
          </div>
        </div>
      </section>

      {/* OUR APPROACH SECTION (Flywheel Redesign) */}
      <section className="section reveal" id="approach-section">
        <div className="container flywheel-grid">

          {/* Left Column */}
          <div id="approach-description">
            <span className="tagline">Our Approach</span>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem' }}>
              Authority that compounds. <span className="italic-accent">Visibility</span> that <span className="italic-accent">converts</span>.
            </h2>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
              Our Authority Flywheel™ creates a compounding system of trust, citations, and category leadership.
            </p>
          </div>

          {/* Center/Right Column (Flywheel Diagram & List) */}
          <div className="flywheel-diagram-container">
            {/* Circular Diagram */}
            <div className="flywheel-diagram" id="flywheel-diagram-widget">
              <div className="flywheel-outer-ring"></div>

              <div className="flywheel-quadrant quadrant-top">Original Point of View</div>
              <div className="flywheel-quadrant quadrant-right">Earned Citations</div>
              <div className="flywheel-quadrant quadrant-bottom">Category Leadership</div>
              <div className="flywheel-quadrant quadrant-left">Strategic Distribution</div>

              <div className="flywheel-center-logo">
                <svg viewBox="0 0 100 100" style={{ width: '24px', height: '24px', fill: '#2f5641' }}>
                  <g transform="translate(50,50)">
                    <path d="M0,0 C-8,-20 -12,-32 0,-38 C12,-32 8,-20 0,0" />
                    <path d="M0,0 C-8,-20 -12,-32 0,-38 C12,-32 8,-20 0,0" transform="rotate(72)" />
                    <path d="M0,0 C-8,-20 -12,-32 0,-38 C12,-32 8,-20 0,0" transform="rotate(144)" />
                    <path d="M0,0 C-8,-20 -12,-32 0,-38 C12,-32 8,-20 0,0" transform="rotate(216)" />
                    <path d="M0,0 C-8,-20 -12,-32 0,-38 C12,-32 8,-20 0,0" transform="rotate(288)" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FLYWHEEL DETAILS LIST */}
      <section className="section reveal" style={{ paddingTop: 0 }} id="approach-details-section">
        <div className="container">
          <div className="grid-3">
            <div className="approach-item" id="approach-item-1">
              <div className="approach-icon-circle">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M3 20v-8c0-2.2 1.8-4 4-4h10c2.2 0 4 1.8 4 4v8M3 12h18"></path>
                </svg>
              </div>
              <div className="approach-text">
                <h4>Earned, Not Paid</h4>
                <p>We build real authority through content, relationships, and recognition. Not through buying low-quality backlink packages.</p>
              </div>
            </div>

            <div className="approach-item" id="approach-item-2">
              <div className="approach-icon-circle">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 6v6l4 2"></path>
                </svg>
              </div>
              <div className="approach-text">
                <h4>AI & Human Optimized</h4>
                <p>We optimize for how people and AI search, evaluate, and recommend. Earning citations in ChatGPT and rankings in Google.</p>
              </div>
            </div>

            <div className="approach-item" id="approach-item-3">
              <div className="approach-icon-circle">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <div className="approach-text">
                <h4>Category Defining</h4>
                <p>We position your brand as the go-to cited reference in your category. The one others point to when they discuss your category.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFINITE TEXT TICKER (Kaiva Style) */}
      <div className="marquee-container reveal">
        <div className="marquee-track">
          <div className="marquee-content">
            <span>Authority Content</span>
            <span>Search Visibility</span>
            <span>B2B Distribution</span>
            <span>GEO Optimization</span>
            <span>AEO Responses</span>
            <span>Pipeline Attribution</span>
          </div>
          <div className="marquee-content">
            <span>Authority Content</span>
            <span>Search Visibility</span>
            <span>B2B Distribution</span>
            <span>GEO Optimization</span>
            <span>AEO Responses</span>
            <span>Pipeline Attribution</span>
          </div>
        </div>
      </div>

      {/* GEO / AEO SIMULATOR SECTION */}
      <section className="section reveal" id="simulator-section" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <span className="tagline" style={{ fontSize: '0.75rem' }}>Simulador GEO / AEO</span>
            <h2>¿Te citan los buscadores de Inteligencia Artificial?</h2>
            <p>
              Prueba cómo responden motores como ChatGPT o Perplexity sobre tu categoría. Selecciona un ejemplo o escribe tu propia pregunta.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }} id="preset-buttons-container">
            <button
              className="btn btn-secondary preset-btn"
              data-query="Best legaltech for contract automation"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              id="preset-1"
              onClick={() => handlePreset('Best legaltech for contract automation')}
            >
              Legaltech & Contratos
            </button>
            <button
              className="btn btn-secondary preset-btn"
              data-query="How does GEO visibility work for B2B"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              id="preset-2"
              onClick={() => handlePreset('How does GEO visibility work for B2B')}
            >
              ¿Cómo funciona GEO?
            </button>
            <button
              className="btn btn-secondary preset-btn"
              data-query="Optimize content for ChatGPT citations"
              style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
              id="preset-3"
              onClick={() => handlePreset('Optimize content for ChatGPT citations')}
            >
              Optimización para ChatGPT
            </button>
          </div>

          {/* SIMULATOR CONTAINER GRID */}
          <div className="grid-2" style={{ marginTop: '3rem', alignItems: 'start' }}>

            {/* Column 1: Simulator Widget (Computer Screen) */}
            <div className="simulator-container" id="geo-simulator" style={{ margin: 0, width: '100%' }}>
              <div className="sim-header">
                <div className="sim-dot"></div>
                <div className="sim-dot"></div>
                <div className="sim-dot"></div>
                <span className="sim-title">Generative Search Simulator v1.1</span>
              </div>
              <div className="sim-body">
                <div className="sim-input-box">
                  <input
                    type="text"
                    id="sim-input"
                    placeholder="Haz una pregunta B2B (ej. 'best legaltech for contract automation')..."
                    aria-label="Pregunta para simulación de IA"
                    value={simInput}
                    onChange={(e) => setSimInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') runSimulation(simInput);
                    }}
                  />
                  <button id="sim-btn" disabled={simBtnDisabled} onClick={() => runSimulation(simInput)}>
                    {simBtnLabel}
                  </button>
                </div>

                <div
                  className="sim-output"
                  id="sim-output-box"
                  style={{ display: simVisible ? 'flex' : 'none', flexDirection: 'column' }}
                >
                  <div className="sim-prompt">
                    <span className="user-label">Usuario:</span>
                    <span id="sim-query-label">{simQueryLabel}</span>
                  </div>
                  <div className="sim-response">
                    <p id="sim-output-text" dangerouslySetInnerHTML={{ __html: simOutputHtml }} />
                  </div>
                  <div
                    className="sim-citation-list"
                    id="sim-citations"
                    style={{ opacity: citationsVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}
                  >
                    {simCitations.length > 0 && (
                      <>
                        <div className="sim-citation-title">Fuentes Citadas por la IA:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                          {simCitations.map((cit) => (
                            <a key={cit.num} href={cit.url} className="sim-citation-item" target="_blank" rel="noreferrer">
                              <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>[{cit.num}]</span> {cit.name}
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Visual CRO Diagram */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }} id="sim-diagram-col">
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>La Anatomía de la Cita de IA</h3>
              <p style={{ marginBottom: '2rem', fontSize: '0.95rem' }}>
                Prueba el simulador de la izquierda escribiendo una pregunta. Mientras el SEO clásico no genera atribución en las respuestas sintéticas, la optimización GEO asegura tus citas y enlaces directos en ChatGPT y Perplexity.
              </p>
              <div className="diagram-container" style={{ margin: 0, padding: '0.5rem', backgroundColor: '#ffffff' }}>
                <img src={`${import.meta.env.BASE_URL}images/geo_share_chart.png`} alt="Comparativa de cuota de voz en IA" className="diagram-img" />
              </div>
            </div>

          </div>

          {/* CTA to the real Thallo AI tool */}
          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <p style={{ maxWidth: '580px', margin: '0 auto 1.5rem auto', color: 'var(--text-secondary)' }}>
              Esto es una demostración. <strong style={{ color: 'var(--text-primary)' }}>Corre la auditoría real de tu marca</strong> en ChatGPT, Claude, Gemini y Google &mdash; gratis, en 60 segundos.
            </p>
            <Link to="/thallo-ai" className="btn btn-primary" id="simulator-tool-cta" style={{ padding: '1rem 2rem' }}>
              Probar Thallo AI &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* THE THREE PROBLEMS */}
      <section className="section reveal" id="problems-section">
        <div className="container">
          <div style={{ marginBottom: '5rem' }}>
            <span className="tagline">El Diagnóstico B2B</span>
            <h2>Los tres problemas que resolvemos</h2>
          </div>
          <div className="grid-3">
            <div className="problem-card spotlight-card reveal" id="problem-card-1 delay-100">
              <span className="problem-num">01</span>
              <h3>Invisibilidad</h3>
              <p>
                Tu sitio web solo posiciona si buscan tu nombre de marca directamente. Si un potencial comprador busca el problema que resuelves, tu empresa simplemente no aparece.
              </p>
            </div>
            <div className="problem-card spotlight-card reveal" id="problem-card-2 delay-200">
              <span className="problem-num">02</span>
              <h3>Contenido Genérico</h3>
              <p>
                Publicas blogs y contenido regularmente, pero no generan resultados. La IA ya produce ese contenido plano gratis. Falta de originalidad y "cita-bilidad".
              </p>
            </div>
            <div className="problem-card spotlight-card reveal" id="problem-card-3 delay-300">
              <span className="problem-num">03</span>
              <h3>Sin Sistema</h3>
              <p>
                No cuentas con el equipo especializado ni la metodología estratégica para aparecer consistentemente en los canales donde investiga tu comprador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THE SOLUTION / PILLARS */}
      <section className="section reveal" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }} id="solution-section">
        <div className="container">
          <div className="grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span className="tagline">Nuestra Metodología</span>
              <h2>Tres pilares para dominar la búsqueda B2B</h2>
              <p style={{ marginBottom: '2rem' }}>
                Diseñamos un sistema integral para posicionar a tu marca allí donde tu cliente ideal toma decisiones, optimizando tanto para la web humana como para los algoritmos de IA.
              </p>
              <Link to="/services" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} id="solutions-cta">Explorar Servicios</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div style={{ borderLeft: '2px solid var(--accent)', paddingLeft: '1.5rem' }} id="pillar-preview-1">
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>1. Contenido de Autoridad Original</h3>
                <p>Investigación, estudios y guías basados en datos propios y criterio que obligan al sector (y a las IAs) a citarte.</p>
              </div>
              <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '1.5rem' }} id="pillar-preview-2">
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>2. Visibilidad en Motores de Búsqueda e IA</h3>
                <p>SEO + GEO + AEO. Maximizamos las probabilidades de que ChatGPT, Perplexity y Google recomienden tu solución.</p>
              </div>
              <div style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '1.5rem' }} id="pillar-preview-3">
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>3. Distribución B2B Estratégica</h3>
                <p>Hacemos que tu conocimiento circule en LinkedIn, podcasts y comunidades de nicho donde tus compradores ya conversan.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE THREE DIFFERENTIATORS */}
      <section className="section reveal" id="differentiators-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 5rem auto' }}>
            <span className="tagline">¿Por qué Thallo?</span>
            <h2>Construido de forma diferente</h2>
          </div>
          <div className="grid-3">
            <div className="spotlight-card reveal" style={{ padding: '3rem' }} id="diff-card-1 delay-100">
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent)' }}>
                La brecha precio-calidad
              </h3>
              <p>
                Las agencias premium cobran más de $10K/mes y solo trabajan con empresas muy financiadas. Las agencias baratas fabrican contenido genérico commodity. Thallo entrega pensamiento estratégico premium a un costo viable para empresas B2B en crecimiento.
              </p>
            </div>
            <div className="spotlight-card reveal" style={{ padding: '3rem' }} id="diff-card-2 delay-200">
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent)' }}>
                Métricas que mueven el negocio
              </h3>
              <p>
                Medimos el pipeline y las oportunidades de negocio atribuidas al contenido, así como la frecuencia con la que la IA cita a tu marca. No te vendemos visitas de vanidad ni rankings que no pagan la nómina.
              </p>
            </div>
            <div className="spotlight-card reveal" style={{ padding: '3rem' }} id="diff-card-3 delay-300">
              <h3 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent)' }}>
                Diseñado para el futuro de la IA
              </h3>
              <p>
                Mientras las agencias tradicionales optimizan exclusivamente para el buscador clásico de Google, nosotros ya estructuramos tu presencia digital para ganar visibilidad en modelos de lenguaje (LLMs), ChatGPT y Perplexity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section section-large reveal" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', textAlign: 'center' }} id="final-cta-section">
        <div className="container">
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <span className="tagline">Da el primer paso</span>
            <h2 style={{ marginBottom: '2rem' }}>¿Quieres que las inteligencias artificiales y tus compradores citen tu marca?</h2>
            <Link to="/contact" className="btn btn-primary" id="final-cta-btn">Agendar Auditoría de Visibilidad</Link>
          </div>
        </div>
      </section>
    </>
  );
}
