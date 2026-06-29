import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Results from './pages/Results';
import Insights from './pages/Insights';
import About from './pages/About';
import Contact from './pages/Contact';
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
          <Route path="/services" element={<Services />} />
          <Route path="/results" element={<Results />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/thallo-ai" element={<ThalloAI />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!fullBleed && <Footer />}
    </>
  );
}
