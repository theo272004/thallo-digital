// Temporary page shell while the full content is ported from the static site.
export default function Placeholder({ tagline, title, blurb }: { tagline: string; title: string; blurb: string }) {
  return (
    <section className="section section-large reveal">
      <div className="container" style={{ maxWidth: 760 }}>
        <span className="tagline">{tagline}</span>
        <h1 style={{ marginBottom: '1.5rem' }}>{title}</h1>
        <p style={{ fontSize: '1.125rem' }}>{blurb}</p>
        <p style={{ marginTop: '2.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Esta sección se está migrando a React desde el sitio estático.
        </p>
      </div>
    </section>
  );
}
