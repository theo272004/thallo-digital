import React from 'react';

export default function BackgroundGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Subtle Dotted Grid */}
      <div className="absolute inset-0 bg-grid-dots opacity-40"></div>
      
      {/* Soft radial gradients. No blur filter on them: a radial gradient
          that fades to transparent is already soft, and blur(60px)/blur(80px)
          on layers 80vw and 60vw wide made the browser repaint two huge
          blurred surfaces, the main cost of scrolling the home (3 November). */}
      <div 
        className="absolute w-[80vw] h-[80vw] rounded-full" 
        style={{
          left: '20%',
          top: '-10%',
          background: 'radial-gradient(circle, rgba(85, 103, 46, 0.03) 0%, rgba(255, 255, 255, 0) 70%)'
        }}
      ></div>
      <div 
        className="absolute w-[60vw] h-[60vw] rounded-full" 
        style={{
          right: '10%',
          bottom: '-20%',
          background: 'radial-gradient(circle, rgba(85, 103, 46, 0.02) 0%, rgba(255, 255, 255, 0) 80%)'
        }}
      ></div>
    </div>
  );
}
