import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const PETALS = [0, 72, 144, 216, 288];

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header id="main-header">
      <div className="container header-container">
        <Link to="/" className="logo" id="header-logo" onClick={close}>
          <svg viewBox="0 0 100 100" style={{ width: 28, height: 28, fill: '#2f5641', flexShrink: 0 }}>
            <g transform="translate(50,50)">
              {PETALS.map((r) => (
                <path key={r} d="M0,0 C-8,-20 -12,-32 0,-38 C12,-32 8,-20 0,0" transform={`rotate(${r})`} />
              ))}
            </g>
          </svg>
          thallo <span>digital</span>
        </Link>

        <button
          className="burger"
          id="mobile-menu-btn"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav id="main-nav" className={open ? 'active' : ''}>
          <ul>
            <li><Link to="/" onClick={close}>Approach</Link></li>
            <li><NavLink to="/services" onClick={close}>Services</NavLink></li>
            <li><NavLink to="/results" onClick={close}>Case Studies</NavLink></li>
            <li><NavLink to="/insights" onClick={close}>Insights</NavLink></li>
            <li><NavLink to="/thallo-ai" onClick={close}>Thallo AI</NavLink></li>
            <li><NavLink to="/about" onClick={close}>About</NavLink></li>
            <li><Link to="/contact" className="nav-cta" onClick={close}>Book a Strategy Call &rarr;</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
