'use client';

import React, { useState } from 'react';

export default function VideoSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="bg-white py-16 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div 
          className="relative bg-gray-900 text-white rounded-3xl p-12 overflow-hidden flex items-center justify-between cursor-pointer group"
          onClick={() => setIsOpen(true)}
        >
          {/* Overlay glow */}
          <div className="absolute inset-0 bg-[#39471D] opacity-10 group-hover:opacity-20 transition-opacity"></div>
          
          <div className="relative z-10 max-w-xl">
            <span className="text-[9px] font-mono tracking-widest text-[#55672E] font-bold block mb-2">CASE STUDY</span>
            <h3 className="text-xl sm:text-2xl font-medium tracking-tight mb-2">
              How AI recommendations shape modern enterprise purchasing decisions.
            </h3>
            <p className="text-xs text-gray-400 font-semibold">Click to watch our 3-minute executive briefing video.</p>
          </div>

          <div className="relative z-10 w-12 h-12 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0">
            {/* Play triangle */}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <polygon points="6 3 20 12 6 21 6 3"></polygon>
            </svg>
          </div>
        </div>

        {/* Modal Player */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setIsOpen(false)}
          >
            <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-lg w-full relative flex flex-col justify-center items-center shadow-2xl">
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
              <div className="text-center font-mono text-gray-400 text-xs py-12">
                <p className="mb-2 font-bold text-gray-700">Video Briefing Player</p>
                <p className="max-w-[32ch] mx-auto text-[10px] leading-relaxed">
                  Loom case-studies, video documentation and interactive demos embed here.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
