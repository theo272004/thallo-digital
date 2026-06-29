import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Insights() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Fake submit — no backend. Show a thank-you state.
    setSubscribed(true);
  };

  return (
    <main>
      {/* RESOURCES HERO */}
      <section className="section section-large reveal fade-in" id="resources-hero">
        <div className="container">
          <div style={{ maxWidth: '700px' }}>
            <span className="tagline">Recursos &amp; Conocimiento</span>
            <h1 id="resources-title">Ideas de Autoridad</h1>
            <p style={{ fontSize: '1.25rem' }} id="resources-intro">
              Analizamos la ciencia detrás del marketing B2B moderno. Guías detalladas sin filtros ni relleno para dueños de negocio sofisticados.
            </p>
          </div>
        </div>
      </section>

      {/* RESOURCES GRID */}
      <section className="section reveal" style={{ paddingTop: 0 }} id="resources-grid-section">
        <div className="container">
          <div className="grid-3">

            {/* PILLAR CARD 1 */}
            <div className="problem-card spotlight-card reveal delay-100" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '400px' }} id="resource-card-1">
              <div>
                <span className="problem-num" style={{ fontSize: '0.85rem', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Authority Content</span>
                <h3 style={{ marginTop: '1rem', fontSize: '1.5rem', lineHeight: 1.25 }}>¿Qué hace que un contenido sea citable?</h3>
                <p style={{ fontSize: '0.95rem', marginTop: '1rem' }}>
                  Por qué el contenido commodity generado por IA está fallando y cuáles son los tipos de contenido que obligan a las marcas y algoritmos a citarte como fuente original.
                </p>
              </div>
              <Link to="/insights" className="text-link" style={{ marginTop: '2rem' }} id="link-resource-1">Leer Guía Pillar &rarr;</Link>
            </div>

            {/* PILLAR CARD 2 */}
            <div className="problem-card spotlight-card reveal delay-200" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '400px' }} id="resource-card-2">
              <div>
                <span className="problem-num" style={{ fontSize: '0.85rem', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Search &amp; AI Visibility</span>
                <h3 style={{ marginTop: '1rem', fontSize: '1.5rem', lineHeight: 1.25 }}>¿Qué es GEO y cómo funciona?</h3>
                <p style={{ fontSize: '0.95rem', marginTop: '1rem' }}>
                  Una explicación técnica y estratégica del Generative Engine Optimization. Entiende cómo indexan la información los LLMs y cómo posicionar tu marca en respuestas de ChatGPT y Perplexity.
                </p>
              </div>
              <Link to="/insights" className="text-link" style={{ marginTop: '2rem' }} id="link-resource-2">Leer Guía Pillar &rarr;</Link>
            </div>

            {/* PILLAR CARD 3 */}
            <div className="problem-card spotlight-card reveal delay-300" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '400px' }} id="resource-card-3">
              <div>
                <span className="problem-num" style={{ fontSize: '0.85rem', color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>B2B Distribution</span>
                <h3 style={{ marginTop: '1rem', fontSize: '1.5rem', lineHeight: 1.25 }}>Distribución B2B que realmente funciona</h3>
                <p style={{ fontSize: '0.95rem', marginTop: '1rem' }}>
                  Nuestro framework de amplificación orgánica. Cómo estructurar contenidos nativos para LinkedIn y foros sectoriales para generar leads calificados y entrenar los rastreadores de IA.
                </p>
              </div>
              <Link to="/insights" className="text-link" style={{ marginTop: '2rem' }} id="link-resource-3">Leer Guía Pillar &rarr;</Link>
            </div>

          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="section section-large reveal" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', textAlign: 'center' }} id="resources-cta">
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Suscríbete a nuestra editorial de análisis</h2>
            <p style={{ marginTop: '1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
              Recibe un correo bimensual con análisis de datos propios de la industria y estrategias GEO aplicadas directamente.
            </p>

            {subscribed ? (
              <p style={{ maxWidth: '450px', margin: '0 auto', color: 'var(--accent)', fontWeight: 'bold' }} id="newsletter-success">
                ¡Gracias por suscribirte! Revisa tu correo para confirmar.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.5rem', maxWidth: '450px', margin: '0 auto' }} id="newsletter-form">
                <input
                  type="email"
                  placeholder="Tu correo corporativo..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
                  id="newsletter-email"
                  aria-label="Correo electrónico para suscripción"
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }} id="newsletter-submit">Suscribirme</button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
