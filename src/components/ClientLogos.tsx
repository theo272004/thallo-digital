import React from 'react';

export default function ClientLogos() {
  const logos = ['Meridian', 'Northwind', 'Calderon & Co', 'Vireo Health', 'Ledgerly', 'Ashfield'];
  const doubleLogos = [...logos, ...logos, ...logos];

  return (
    <div className="border-b border-gray-100 bg-white py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-center uppercase text-gray-400 mb-6">
          Cited across the answers your buyers trust
        </p>
        <div className="relative w-full overflow-hidden flex">
          <div className="flex gap-16 animate-marquee whitespace-nowrap">
            {doubleLogos.map((logo, idx) => (
              <span key={idx} className="text-gray-400 text-sm font-bold tracking-wider hover:text-gray-600 transition-colors">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
