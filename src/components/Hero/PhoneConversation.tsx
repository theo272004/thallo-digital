import React from 'react';

interface PhoneConversationProps {
  query: string;
  step: number;
  answer: string;
}

export default function PhoneConversation({ query, step, answer }: PhoneConversationProps) {
  return (
    <div className="phone-inner-screen">
      {/* Premium Phone Top Status Bar */}
      <div className="flex justify-between items-center text-[10px] font-bold text-gray-900 mb-6 mt-1 px-1">
        <span>9:41</span>
        <div className="flex gap-1.5 items-center">
          {/* Signal Indicator */}
          <svg viewBox="0 0 10 10" width="12" height="12" fill="currentColor">
            <rect x="0" y="8" width="1.5" height="2" rx="0.5" />
            <rect x="2.5" y="6" width="1.5" height="4" rx="0.5" />
            <rect x="5" y="4" width="1.5" height="6" rx="0.5" />
            <rect x="7.5" y="1" width="1.5" height="9" rx="0.5" />
          </svg>
          {/* Wifi Indicator */}
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none">
            <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.1a6 6 0 0 1 6.95 0M12 20h.01" />
          </svg>
          {/* Battery */}
          <div className="w-5 h-2.5 border border-gray-900 rounded-sm p-0.5 flex items-center">
            <div className="w-full h-full bg-gray-900 rounded-2xs"></div>
          </div>
        </div>
      </div>

      {/* Dynamic Island */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[90px] h-[25px] bg-[#0c0c0c] rounded-full z-20"></div>

      {/* Conversation Thread */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4 scrollbar-none">
        {/* User Message */}
        {step >= 1 && (
          <div className="flex gap-2.5 items-start animate-fade-in duration-300">
            {/* Minimal Profile Avatar */}
            <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
              <span className="text-[10px] font-bold text-gray-500">U</span>
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-semibold text-gray-400 mb-0.5">You</div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs text-gray-800 font-medium max-w-[90%] leading-relaxed">
                {query}
                {step === 1 && <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-gray-900 animate-pulse"></span>}
              </div>
            </div>
          </div>
        )}

        {/* AI Processing / Thinking Loader */}
        {step >= 2 && step < 6 && (
          <div className="flex gap-2.5 items-start mt-2">
            <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 text-xs">
              ✨
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-semibold text-emerald-800 mb-1">Synthesizing...</div>
              <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl rounded-tl-none p-3.5 max-w-[90%] flex flex-col gap-2">
                <span className="text-xs text-emerald-900 font-medium">
                  {step === 2 && "Thinking..."}
                  {step === 3 && "Searching trusted sources..."}
                  {step >= 4 && "Building recommendation..."}
                </span>
                {/* Horizontal Progress Bar */}
                <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-700 rounded-full transition-all duration-1000"
                    style={{
                      width: step === 2 ? '30%' : step === 3 ? '65%' : '90%'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Final recommendation answer */}
        {step >= 6 && (
          <div className="flex gap-2.5 items-start mt-2 animate-fade-in duration-500">
            <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 text-xs">
              ✨
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-semibold text-emerald-800 mb-0.5">AI Engine</div>
              <div className="border border-emerald-100 rounded-2xl rounded-tl-none p-3.5 text-xs text-gray-800 font-medium max-w-[90%] leading-relaxed bg-[#FFFFFF]">
                {answer}
                {answer.length < 162 && <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-emerald-800 animate-pulse"></span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
