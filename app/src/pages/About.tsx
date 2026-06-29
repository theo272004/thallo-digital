import { Link } from 'react-router-dom';

export default function About() {
  return (
    <>
      {/* ABOUT HERO */}
      <section className="section section-large reveal fade-in" id="about-hero">
        <div className="container">
          <div style={{ maxWidth: '700px' }}>
            <span className="tagline">Quiénes Somos</span>
            <h1 id="about-title">Nuestra Filosofía</h1>
            <p style={{ fontSize: '1.25rem' }} id="about-intro">
              No somos una fábrica masiva de contenidos ni una agencia de SEO tradicional enfocada en palabras clave irrelevantes. Somos una consultora boutique especializada en autoridad B2B.
            </p>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY CONTENT */}
      <section className="section reveal" style={{ paddingTop: 0 }} id="philosophy-section">
        <div className="container">
          <div className="grid-2" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '4rem' }}>

            <div className="service-content" id="philosophy-text">
              <h3>El problema con las agencias tradicionales</h3>
              <p>
                La mayoría de las agencias de marketing se estructuran como fábricas de volumen: contratan a redactores junior para escribir artículos genéricos con el fin de cumplir con una cuota mensual de publicaciones. Este modelo está obsoleto. La IA hace ese trabajo gratis.
              </p>
              <p>
                Por otro lado, las agencias premium de consultoría estratégica cobran tarifas prohibitivas (desde $10K/mes) que solo las empresas altamente financiadas por capital riesgo pueden pagar.
              </p>

              <h3 style={{ marginTop: '3rem' }}>El posicionamiento de Thallo</h3>
              <p>
                Thallo nace para cubrir ese espacio. Operamos como un **equipo especializado de alto nivel (1-2 consultores senior)** que trabaja directamente con los fundadores y directores de marketing. Entregamos pensamiento estratégico y análisis cuantitativos premium a un costo viable para empresas B2B en crecimiento (con facturación de entre $1M y $2M USD/año).
              </p>

              <h3 style={{ marginTop: '3rem' }}>Nuestros tres principios innegociables</h3>
              <ul>
                <li><strong>Criterio sobre volumen:</strong> Preferimos publicar un único reporte de investigación al trimestre que sea citable, en lugar de 20 posts de blog genéricos que nadie leerá.</li>
                <li><strong>Atribución al negocio:</strong> Si nuestro trabajo no genera pipeline o no aumenta la frecuencia con la que los motores de IA citan tu producto, consideramos que hemos fallado.</li>
                <li><strong>Construido para el futuro:</strong> No optimizamos para el Google de hace cinco años. Creamos activos digitales adaptados a los modelos de lenguaje natural que dominarán la búsqueda mañana.</li>
              </ul>
            </div>

            <div className="spotlight-card reveal" style={{ alignSelf: 'start' }} id="about-manifesto">
              <span className="tagline" style={{ fontSize: '0.75rem' }}>Manifiesto Thallo</span>
              <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1.5rem' }}>El nuevo comprador B2B</h4>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                "El comprador B2B ya no llama al vendedor como primer paso. Investiga por su cuenta en ChatGPT, lee posts y debates en Reddit, y revisa perfiles clave en LinkedIn."
              </p>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                El proveedor que no aparezca citado de forma natural y creíble en esos momentos, simplemente no existe en el proceso de decisión de compra.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="section section-large reveal" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', textAlign: 'center' }} id="about-cta">
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Trabaja directamente con estrategas</h2>
            <p style={{ marginTop: '1rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
              Sin intermediarios ni ejecutivos de cuentas junior. Hablemos sobre el posicionamiento de tu marca.
            </p>
            <Link to="/contact" className="btn btn-primary" id="cta-btn">Agendar Llamada con Socios</Link>
          </div>
        </div>
      </section>
    </>
  );
}
