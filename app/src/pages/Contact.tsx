import { useState } from 'react';

type Step = 'form' | 'calendar' | 'booking';

export default function Contact() {
  const [step, setStep] = useState<Step>('form');
  const [selectedSlot, setSelectedSlot] = useState('');

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep('calendar');
  };

  const confirmBooking = (time: string) => {
    setSelectedSlot(time);
    setStep('booking');
  };

  return (
    <main>
      {/* CONTACT HERO */}
      <section className="section section-large reveal fade-in" id="contact-hero">
        <div className="container">
          <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
            <span className="tagline">Calificación &amp; Agenda</span>
            <h1 id="contact-title">Hablemos</h1>
            <p style={{ fontSize: '1.15rem' }} id="contact-intro">
              Queremos entender tu producto y mercado. Si cumples con nuestro perfil de cliente ideal, agendaremos una auditoría de visibilidad en IA sin costo.
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT FORM SECTION */}
      <section className="section reveal" style={{ paddingTop: 0 }} id="contact-form-section">
        <div className="container">
          <div className="grid-2">

            {/* Trust Column / Benefits */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }} id="contact-trust-col">
              <span className="tagline">¿Qué puedes esperar?</span>
              <h2 style={{ fontSize: '2rem' }}>Desbloquea tu cuota de voz en la IA</h2>
              <p style={{ marginBottom: '2rem' }}>
                Analizaremos la huella digital de tu marca antes de la reunión. Hablarás directamente con un socio estratega para evaluar tus datos, sin discursos de ventas agresivos.
              </p>

              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }} id="value-promise-card">
                <h4 style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: '1.05rem', color: 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Nuestra Promesa de Valor:
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Te enviaremos una **Mini-Auditoría en PDF** de la presencia de tu marca en ChatGPT y Perplexity 2 horas antes de nuestra llamada, lista para que la revises con tu equipo.
                </p>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}><span style={{ color: 'var(--accent)', position: 'absolute', left: 0 }}>✓</span> Cero SPAM. Tu información es privada.</li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}><span style={{ color: 'var(--accent)', position: 'absolute', left: 0 }}>✓</span> Calificación inmediata tras el envío.</li>
                <li style={{ position: 'relative', paddingLeft: '1.5rem' }}><span style={{ color: 'var(--accent)', position: 'absolute', left: 0 }}>✓</span> Propuesta estratégica a la medida si calificas.</li>
              </ul>
            </div>

            {/* Form Column */}
            <div className="contact-container" id="contact-box" style={{ margin: 0, width: '100%' }}>
              {step === 'form' && (
                <form id="qualify-form" onSubmit={handleFormSubmit}>

                  <div className="form-group">
                    <label htmlFor="name">Nombre Completo</label>
                    <input type="text" id="name" required placeholder="Ej. Nicolas Gomez" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Correo Corporativo</label>
                    <input type="email" id="email" required placeholder="nicolas@empresa.com" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="website">Sitio Web de la Empresa</label>
                    <input type="url" id="website" required placeholder="https://empresa.com" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="arr">Facturación Anual (ARR)</label>
                    <select id="arr" required defaultValue="">
                      <option value="" disabled>Selecciona tu rango de ingresos...</option>
                      <option value="less">&lt; $1M USD/año</option>
                      <option value="ideal">$1M - $2M USD/año (Perfil Ideal)</option>
                      <option value="more">&gt; $2M USD/año</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="challenge">Mayor desafío de visibilidad</label>
                    <select id="challenge" required defaultValue="">
                      <option value="" disabled>Selecciona tu mayor dolor...</option>
                      <option value="invisibilidad">Invisibilidad: Solo nos encuentran por marca</option>
                      <option value="commodity">Contenido Genérico: Publicamos sin resultados</option>
                      <option value="no-system">Sin Sistema: No tenemos estrategia de SEO/GEO consistente</option>
                    </select>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '99px' }} id="submit-btn">
                    Enviar &amp; Calificar
                  </button>

                </form>
              )}

              {/* CALENDAR SIMULATION (SUCCESS STATE) */}
              {step === 'calendar' && (
                <div id="calendar-sim" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2.5rem', borderRadius: '8px', textAlign: 'center', animation: 'fadeIn 0.5s ease forwards' }}>
                  <div style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '1rem' }}>✓</div>
                  <h3 style={{ marginBottom: '1rem' }}>Perfil Pre-Calificado</h3>
                  <p style={{ marginBottom: '2rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    Gracias por tu información. Tu empresa califica para nuestra sesión estratégica. Por favor, selecciona un espacio disponible en nuestro calendario de socios.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }} id="time-slots-container">
                    <button className="btn btn-secondary slot-btn" onClick={() => confirmBooking('Lunes 10:00 AM')} id="slot-1" style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', borderRadius: '8px' }}>Lunes 10:00 AM</button>
                    <button className="btn btn-secondary slot-btn" onClick={() => confirmBooking('Martes 2:00 PM')} id="slot-2" style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', borderRadius: '8px' }}>Martes 2:00 PM</button>
                    <button className="btn btn-secondary slot-btn" onClick={() => confirmBooking('Miércoles 4:00 PM')} id="slot-3" style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', borderRadius: '8px' }}>Miércoles 4:00 PM</button>
                  </div>
                </div>
              )}

              {step === 'booking' && (
                <div id="booking-success" style={{ textAlign: 'center', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '2.5rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2.5rem', color: 'var(--accent)', marginBottom: '1rem' }}>📅</div>
                  <h3>Llamada Confirmada</h3>
                  <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }} id="booking-details">
                    Tu auditoría estratégica está agendada para: <strong style={{ color: 'var(--accent)' }}>{selectedSlot} (Zona Horaria Local)</strong>.
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2rem' }}>
                    Recibirás una invitación de Google Meet en tu bandeja de entrada en los próximos minutos.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
