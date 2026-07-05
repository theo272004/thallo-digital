import React from 'react';

export default function ClientLogos() {
  const logos = ['Meridian', 'Northwind', 'Calderon & Co', 'Vireo Health', 'Ledgerly', 'Ashfield'];

  // Duplicate list to achieve seamless loop animation
  const doubleLogos = [...logos, ...logos, ...logos];

  return (
    <div className="trust">
      <div className="wrap">
        <p className="trust-lbl">Cited across the answers your buyers trust</p>
        <div className="marquee">
          <div className="marquee-track">
            {doubleLogos.map((logo, idx) => (
              <span key={idx} className="logo-word">
                <span className="m"></span>
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
