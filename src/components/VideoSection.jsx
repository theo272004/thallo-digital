import React, { useState } from 'react';

export default function VideoSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section style={{ padding: '80px 0' }}>
      <div className="wrap">
        <div 
          className="video-block" 
          id="videoBlock"
          onClick={() => setIsOpen(true)}
        >
          <div className="play">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
          <div className="video-cap">
            <span className="k">Watch Walkthrough</span>
            <h3>How AI recommendations shape modern enterprise purchasing decisions.</h3>
          </div>
        </div>

        {/* Video Player Modal */}
        <div className={`modal ${isOpen ? 'open' : ''}`} onClick={(e) => { if (e.target.classList.contains('modal')) setIsOpen(false); }}>
          <div className="box">
            <button className="x" onClick={() => setIsOpen(false)}>✕</button>
            <div style={{ fontSize: '1rem', color: '#9CA3AF', fontFamily: 'var(--f-mono)', textAlign: 'center' }}>
              <p style={{ marginBottom: '10px' }}>Video Player Mockup</p>
              <p style={{ fontSize: '0.8rem' }}>Drop in your case study, demo video, or Loom embed code here.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
