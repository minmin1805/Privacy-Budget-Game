import React from "react";
import { useNavigate } from "react-router-dom";
import { FaLongArrowAltRight } from "react-icons/fa";

function ContentWarningPage() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/welcome");
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#1a0a2e] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-10 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="max-w-2xl w-full bg-[#2d1b4e]/80 rounded-2xl border-2 border-amber-500/50 p-5 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <span className="text-3xl sm:text-4xl" aria-hidden>⚠️</span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-400">
          Legal Disclaimer
          </h1>
        </div>
        <p className="text-white text-base sm:text-lg leading-relaxed mb-4">
          This game is an educational simulation about online safety and digital risks. All characters, scenarios,
          and interactions are fictional and do not represent real people, events, or social media platforms.
          <br />
          <br />
          This content is not legal, mental health, or emergency advice. If you feel unsafe, have experienced
          exploitation, or think someone may be at risk, contact a trusted adult or local authorities immediately.
          <br />
          <br />
          By continuing, you agree to use this game for learning and engage with the content responsibly.
        </p>
        <button
          type="button"
          onClick={handleContinue}
          className="w-full sm:w-auto min-h-[48px] bg-[#8B5CF6] hover:bg-[#7c4ed4] text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors touch-manipulation"
        >
          I understand, continue
          <FaLongArrowAltRight />
        </button>
      </div>
    </div>
  );
}

export default ContentWarningPage;
