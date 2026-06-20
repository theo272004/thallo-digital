import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Placeholder from './pages/Placeholder';
import ThalloAI from './pages/ThalloAI';
import { useScrollReveal } from './hooks/useScrollReveal';

function ScrollManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  useScrollReveal(pathname);

  // The Thallo AI tool is a full-screen embedded app with its own top bar.
  const fullBleed = pathname === '/thallo-ai';

  return (
    <>
      <ScrollManager />
      {!fullBleed && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Placeholder tagline="Servicios B2B" title="Nuestros Servicios" blurb="Contenido de autoridad original, visibilidad en búsqueda e IA (SEO + GEO + AEO), y distribución B2B estratégica." />} />
          <Route path="/results" element={<Placeholder tagline="Resultados" title="Resultados reales" blurb="Casos de éxito B2B con atribución financiera directa al pipeline." />} />
          <Route path="/insights" element={<Placeholder tagline="Recursos" title="Ideas de Autoridad" blurb="Guías sobre GEO, AEO y cómo construir autoridad citable en la era de la IA." />} />
          <Route path="/about" element={<Placeholder tagline="Filosofía" title="Nuestra Filosofía" blurb="Consultora boutique especializada en autoridad y visibilidad B2B." />} />
          <Route path="/contact" element={<Placeholder tagline="Contacto" title="Hablemos" blurb="Agenda una auditoría de visibilidad en IA sin costo." />} />
          <Route path="/thallo-ai" element={<ThalloAI />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!fullBleed && <Footer />}
    </>
  );
}
