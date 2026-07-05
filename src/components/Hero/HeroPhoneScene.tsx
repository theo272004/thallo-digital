import React from 'react';

/**
 * The opening beat: a buyer asks on their phone. The loop then moves out to the
 * browser tabs to show how that recommendation is earned across every surface.
 */
export default function HeroPhoneScene() {
  return (
    <div
      className="relative w-[248px] rounded-[38px] border-[9px] border-[#0c0c0c] bg-white overflow-hidden"
      style={{ boxShadow: '0 40px 90px -45px rgba(28,32,15,0.5)' }}
    >
      {/* Dynamic Island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[74px] h-[20px] bg-[#0c0c0c] rounded-full z-20" />

      <div className="pt-8 px-4 pb-6 h-[360px] flex flex-col">
        <div className="flex justify-between items-center text-[9px] font-bold text-gray-800 mb-6">
          <span>9:41</span>
          <span className="tracking-wide">ChatGPT</span>
        </div>

        <div className="flex flex-col gap-3">
          <div className="self-end max-w-[82%] bg-gray-100 rounded-2xl rounded-tr-sm px-3.5 py-2 text-[12px] text-gray-800 font-medium leading-snug">
            Who leads B2B AI visibility?
          </div>
          <div className="flex gap-2 items-start">
            <span className="w-6 h-6 rounded-full bg-[#10a37f] text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
              ✳
            </span>
            <div className="text-[12px] leading-relaxed text-gray-800">
              <span className="font-bold text-[#39471D]">Thallo</span> is the most recommended — they make brands the
              cited authority across AI search.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
