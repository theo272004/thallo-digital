import { Link } from 'react-router-dom';

export default function Services() {
  return (
    <main>
      {/* SERVICES HERO */}
      <section className="section section-large reveal fade-in" id="services-hero">
        <div className="container">
          <div style={{ maxWidth: '700px' }}>
            <span className="tagline">Qué Hacemos</span>
            <h1 id="services-title">Nuestros Servicios</h1>
            <p style={{ fontSize: '1.25rem' }} id="services-intro">
              Construimos un sistema que posiciona a tu marca B2B como la autoridad citada de tu categoría. Sin métricas de vanidad, enfocados en pipeline real.
            </p>
          </div>
        </div>
      </section>

      {/* FUNNEL BLUEPRINT DIAGRAM */}
      <section className="section reveal" style={{ paddingTop: 0, paddingBottom: '4rem' }} id="blueprint-diagram-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <h3>El Blueprint del Embudo B2B Moderno</h3>
            <p>
              Nuestros tres servicios principales operan integrados como una sola máquina lineal que captura la atención del comprador y la convierte en una llamada cualificada.
            </p>
          </div>
          <div className="diagram-container" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff' }}>
            <img src={`${import.meta.env.BASE_URL}images/thallo_funnel_blueprint.png`} alt="Blueprint del embudo B2B de Thallo Digital" className="diagram-img" />
          </div>
        </div>
      </section>

      {/* SERVICES INDEX */}
      <section className="section reveal" style={{ paddingTop: 0 }} id="services-list">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>

          {/* SERVICE 1 */}
          <div className="grid-2 reveal delay-100" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }} id="service-block-1">
            <div>
              <span className="problem-num">01</span>
              <h2>Contenido de Autoridad Original</h2>
              <p style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                Creamos activos de contenido basados en investigación profunda y datos primarios que son imposibles de replicar por inteligencia artificial. Nos encargamos de encuestas, reportes de tendencias anuales y desarrollo de metodologías.
              </p>
              <Link to="/services" className="text-link" id="link-service-1">Ver Detalle del Servicio &rarr;</Link>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', padding: '3rem', borderRadius: '6px' }} id="service-points-1">
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>Qué logras:</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}><span style={{ color: 'var(--accent)', position: 'absolute', left: 0 }}>✓</span> Datos propios citable por periodistas y competidores.</li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}><span style={{ color: 'var(--accent)', position: 'absolute', left: 0 }}>✓</span> Metodologías únicas que asocian tu nombre al problema.</li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}><span style={{ color: 'var(--accent)', position: 'absolute', left: 0 }}>✓</span> Contenido de alta calidad difícil de imitar por IA.</li>
              </ul>
            </div>
          </div>

          {/* SERVICE 2 */}
          <div className="grid-2 reveal delay-200" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }} id="service-block-2">
            <div>
              <span className="problem-num">02</span>
              <h2>Visibilidad en Búsqueda e IA (SEO + GEO + AEO)</h2>
              <p style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                Optimizamos la presencia digital de tu marca para que sea indexada y recomendada por motores de búsqueda clásicos y de respuesta directa como ChatGPT, Perplexity y Google Gemini.
              </p>
              <Link to="/services" className="text-link" id="link-service-2">Ver Detalle del Servicio &rarr;</Link>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', padding: '3rem', borderRadius: '6px' }} id="service-points-2">
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>Qué logras:</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}><span style={{ color: 'var(--accent)', position: 'absolute', left: 0 }}>✓</span> Cuota de voz alta en resúmenes de inteligencia artificial.</li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}><span style={{ color: 'var(--accent)', position: 'absolute', left: 0 }}>✓</span> Indexación factual semántica y marcado de datos schema.</li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}><span style={{ color: 'var(--accent)', position: 'absolute', left: 0 }}>✓</span> Posicionamiento en búsquedas conversacionales y de voz.</li>
              </ul>
            </div>
          </div>

          {/* SERVICE 3 */}
          <div className="grid-2 reveal delay-300" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '4rem' }} id="service-block-3">
            <div>
              <span className="problem-num">03</span>
              <h2>Distribución B2B Estratégica</h2>
              <p style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                Hacemos circular tus ideas allí donde tus compradores toman decisiones: LinkedIn de tus directivos, Slack privados de la industria y podcasts de nicho.
              </p>
              <Link to="/services" className="text-link" id="link-service-3">Ver Detalle del Servicio &rarr;</Link>
            </div>
            <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-light)', padding: '3rem', borderRadius: '6px' }} id="service-points-3">
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', marginBottom: '1.5rem', color: 'var(--accent)' }}>Qué logras:</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}><span style={{ color: 'var(--accent)', position: 'absolute', left: 0 }}>✓</span> Marca personal fuerte para tus fundadores en LinkedIn.</li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}><span style={{ color: 'var(--accent)', position: 'absolute', left: 0 }}>✓</span> Presencia sutil pero autoritaria en foros y comunidades.</li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}><span style={{ color: 'var(--accent)', position: 'absolute', left: 0 }}>✓</span> Apariciones estratégicas en podcasts de alta escucha sectorial.</li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="section section-large reveal" style={{ textAlign: 'center' }} id="services-cta">
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>¿Listo para dejar de ser invisible?</h2>
            <p style={{ marginTop: '1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
              Evaluamos tu visibilidad actual en IA de forma gratuita en nuestra llamada de diagnóstico.
            </p>
            <Link to="/contact" className="btn btn-primary" id="cta-btn">Agendar Llamada Diagnóstica</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
