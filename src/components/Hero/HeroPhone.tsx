import React from 'react';
import PhoneConversation from './PhoneConversation';

interface HeroPhoneProps {
  query: string;
  step: number;
  answer: string;
}

export default function HeroPhone({ query, step, answer }: HeroPhoneProps) {
  return (
    <div className="phone-crop-container relative flex items-start justify-center overflow-hidden w-full h-[540px]">
      <div 
        className="phone-mockup-frame relative w-[300px] h-[640px] border-[12px] border-[#0c0c0c] bg-white rounded-[44px] shadow-[0_30px_80px_rgba(0,0,0,0.08)] overflow-hidden"
        style={{
          transform: 'translateY(30px)' // Rises up slightly during animations
        }}
      >
        <PhoneConversation query={query} step={step} answer={answer} />
      </div>
    </div>
  );
}
