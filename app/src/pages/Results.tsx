import { Link } from 'react-router-dom';

export default function Results() {
  return (
    <>
      {/* RESULTS HERO */}
      <section className="section section-large reveal fade-in" id="results-hero">
        <div className="container">
          <div style={{ maxWidth: '700px' }}>
            <span className="tagline">Prueba Social Cuantitativa</span>
            <h1 id="results-title">Resultados reales</h1>
            <p style={{ fontSize: '1.25rem' }} id="results-intro">
              No te mostramos clics vacíos ni gráficos de impresiones sin valor comercial. Medimos oportunidades de negocio creadas y citas en modelos de lenguaje.
            </p>
          </div>
        </div>
      </section>

      {/* CRM PIPELINE DASHBOARD DIAGRAM */}
      <section className="section reveal" style={{ paddingTop: 0, paddingBottom: '4rem' }} id="dashboard-diagram-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <h3>Atribución Financiera Directa</h3>
            <p>
              Así es como se visualizan las fuentes de ingresos reales en el CRM de un cliente típico de Thallo tras 6 meses de estrategia GEO y contenido de autoridad.
            </p>
          </div>
          <div className="diagram-container" style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff' }}>
            <img src={`${import.meta.env.BASE_URL}images/pipeline_dashboard.png`} alt="Dashboard de atribución de pipeline e ingresos de IA" className="diagram-img" />
          </div>
        </div>
      </section>

      {/* CASE STUDIES */}
      <section className="section reveal" style={{ paddingTop: 0 }} id="case-studies-section">
        <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: '8rem' }}>

          {/* CASE 1 */}
          <div className="grid-2 reveal delay-100" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }} id="case-block-1">
            <div>
              <span className="problem-num" style={{ color: 'var(--accent)' }}>Caso de Estudio 1</span>
              <h2>LexVantage: De la invisibilidad a ser la referencia en LegalTech</h2>
              <p style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                LexVantage facturaba $1.2M ARR pero era invisible para los compradores de software de automatización de contratos. Diseñamos un reporte analítico de velocidad de contratos recopilando datos de 300 despachos.
              </p>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }} id="case-stats-1">
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--accent)', lineHeight: 1 }}>+312%</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Pipeline Atribuido</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--accent)', lineHeight: 1 }}>14x</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Citas en Perplexity/ChatGPT</div>
                </div>
              </div>
              <Link to="/insights" className="text-link" id="case-link-1">Ver Metodología de Contenido &rarr;</Link>
            </div>
            <div className="spotlight-card reveal" style={{ alignSelf: 'center' }} id="case-result-1">
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>El Impacto Comercial:</h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                "El reporte diseñado por Thallo fue citado por más de 40 blogs del sector legal. Lo más importante: cuando un comprador le pregunta a ChatGPT '¿cuál es la mejor herramienta de contratos para medianas empresas?', la IA redacta una respuesta recomendándonos y citando los datos del reporte de velocidad."
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>— Carlos M., CEO de LexVantage</span>
            </div>
          </div>

          {/* CASE 2 */}
          <div className="grid-2 reveal delay-200" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '4rem' }} id="case-block-2">
            <div>
              <span className="problem-num" style={{ color: 'var(--accent)' }}>Caso de Estudio 2</span>
              <h2>FinFlow: Dominando la visibilidad GEO en el sector FinTech</h2>
              <p style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                FinFlow competía contra gigantes muy financiados por las palabras clave principales de Google. Optimizamos su web para Generative Engine Optimization (GEO) y distribuimos su framework de flujos de caja en LinkedIn.
              </p>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }} id="case-stats-2">
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--accent)', lineHeight: 1 }}>$240K</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Nuevos contratos cerrados</div>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--accent)', lineHeight: 1 }}>Top 3</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '0.5rem' }}>Recomendación IA en FinTech</div>
                </div>
              </div>
              <Link to="/insights" className="text-link" id="case-link-2">Ver Metodología GEO &rarr;</Link>
            </div>
            <div className="spotlight-card reveal" style={{ alignSelf: 'center' }} id="case-result-2">
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '1.5rem' }}>El Impacto Comercial:</h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                "En lugar de pelearnos en Google tradicional pagando costes altos por clic, nos enfocamos en que las inteligencias artificiales nos recomendaran en sus respuestas. Capturamos leads calificados que venían directamente educados por las IAs."
              </p>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>— Sarah D., Head of Marketing de FinFlow</span>
            </div>
          </div>

        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="section section-large reveal" style={{ textAlign: 'center' }} id="results-cta">
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Consigue estos resultados para tu negocio</h2>
            <p style={{ marginTop: '1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
              Hablemos sobre tu producto y tu mercado para diseñar un sistema a tu medida.
            </p>
            <Link to="/contact" className="btn btn-primary" id="cta-btn">Agendar Auditoría</Link>
          </div>
        </div>
      </section>
    </>
  );
}
