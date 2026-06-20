import { Link } from 'react-router-dom';

// NOTE: Hero + Trusted bar + Thallo AI CTA are ported faithfully from the
// static site. The middle marketing sections (flywheel, problems, solution,
// differentiators, final CTA) are being ported next.
export default function Home() {
  return (
    <>
      {/* HERO */}
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

              <Link to="/thallo-ai" className="btn-play" id="hero-cta-play">
                <div className="btn-play-circle">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ color: 'var(--text-primary)', marginLeft: 2 }}>
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </div>
                <div className="btn-play-text">
                  <span className="btn-play-title">Try the live audit</span>
                  <span className="btn-play-subtitle">Thallo AI · free</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column — Floating Cards */}
          <div className="floating-cards-wrapper">
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

            <div className="f-card f-card-chatgpt">
              <div className="f-card-header"><span className="chatgpt-dot"></span>CHATGPT</div>
              <div className="f-card-body">
                "<strong>Thallo Digital</strong> helps B2B companies become the most trusted and <strong>cited reference</strong> in their category."
              </div>
              <div className="f-card-source">— ChatGPT</div>
            </div>

            <div className="f-card f-card-google">
              <div className="f-card-header">
                <svg viewBox="0 0 24 24" width="14" height="14" style={{ marginRight: 4, display: 'inline-block', verticalAlign: 'middle' }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                GOOGLE
              </div>
              <div className="f-card-body">"<strong>Thallo Digital</strong> sets the standard for B2B authority."</div>
              <div className="f-card-source">— Featured snippet</div>
            </div>

            <div className="f-card f-card-forbes">
              <div className="f-card-header">FORBES</div>
              <div className="f-card-body">"A new model for <strong>B2B visibility</strong> that drives real pipeline."</div>
              <div className="f-card-source">— Forbes</div>
            </div>

            <div className="f-card f-card-gartner">
              <div className="f-card-header">GARTNER</div>
              <div className="f-card-body">"They understand how authority is built in the <strong>age of AI</strong>."</div>
              <div className="f-card-source">— Gartner Peer Insights</div>
            </div>

            <div className="authority-earned-badge">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#2f5641" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>Authority isn't claimed. It's earned.</span>
            </div>
          </div>
        </div>
      </section>

      {/* TRUSTED BY */}
      <section className="trusted-section reveal" id="trusted-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="trusted-title">Trusted by Market Leaders</div>
          <div className="logo-brands">
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.04em', color: '#111', opacity: 0.65 }}>VANTA</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#111', opacity: 0.65, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ color: '#111' }}><path d="M12 2L2 22h20L12 2Z" /></svg>MERCURY
            </span>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.2rem', color: '#111', opacity: 0.65 }}>clari.</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.05em', color: '#111', opacity: 0.65 }}>attio</span>
            <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: '1.2rem', fontStyle: 'italic', color: '#111', opacity: 0.65, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              ramp <span style={{ fontStyle: 'normal', color: 'var(--accent)' }}>\</span>
            </span>
          </div>
        </div>
      </section>

      {/* THALLO AI CTA BAND */}
      <section className="section reveal" id="thallo-ai-band" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
          <span className="tagline" style={{ fontSize: '0.75rem' }}>Thallo AI — Auditoría gratis</span>
          <h2 style={{ marginBottom: '1.25rem' }}>¿Te citan las inteligencias artificiales?</h2>
          <p style={{ maxWidth: 580, margin: '0 auto 2rem auto' }}>
            Descúbrelo en 60 segundos. Nuestra herramienta audita tu marca en ChatGPT, Claude, Gemini y Google, y te da un plan de acción priorizado — gratis, sin registro.
          </p>
          <Link to="/thallo-ai" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
            Probar Thallo AI &rarr;
          </Link>
        </div>
      </section>
    </>
  );
}
