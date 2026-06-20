import { Link } from 'react-router-dom';

const PETALS = [0, 72, 144, 216, 288];

export default function Footer() {
  return (
    <footer id="main-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand" id="footer-brand-section">
            <Link to="/" className="logo" style={{ marginBottom: '1rem' }}>
              <svg viewBox="0 0 100 100" style={{ width: 26, height: 26, fill: '#2f5641', flexShrink: 0 }}>
                <g transform="translate(50,50)">
                  {PETALS.map((r) => (
                    <path key={r} d="M0,0 C-8,-20 -12,-32 0,-38 C12,-32 8,-20 0,0" transform={`rotate(${r})`} />
                  ))}
                </g>
              </svg>
              thallo <span>digital</span>
            </Link>
            <p style={{ maxWidth: 320 }}>
              Agencia B2B de autoridad y visibilidad. Convertimos empresas en la referencia de su categoría.
            </p>
          </div>

          <div className="footer-links" id="footer-services-links">
            <h4>Servicios</h4>
            <ul>
              <li><Link to="/services">Contenido de Autoridad</Link></li>
              <li><Link to="/services">Visibilidad en IA &amp; Búsqueda</Link></li>
              <li><Link to="/services">Distribución B2B</Link></li>
              <li><Link to="/thallo-ai">Thallo AI — Auditoría gratis</Link></li>
            </ul>
          </div>

          <div className="footer-links" id="footer-company-links">
            <h4>Compañía</h4>
            <ul>
              <li><Link to="/about">Filosofía</Link></li>
              <li><Link to="/results">Resultados</Link></li>
              <li><Link to="/insights">Recursos / Blog</Link></li>
              <li><Link to="/contact">Contacto</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Thallo Digital. Todos los derechos reservados.</span>
          <span>Optimizado para Google, Perplexity y ChatGPT.</span>
        </div>
      </div>
    </footer>
  );
}
