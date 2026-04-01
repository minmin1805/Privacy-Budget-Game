import React from 'react'
import { useNavigate } from 'react-router-dom';
export default function InstructionPage() {

    const NAVY = '#1A365D'
const SKY = '#BFE3FF'
const BTN = '#007BFF'


  const navigate = useNavigate();
  const handleNext = () => {
    navigate('/game');
  }
  return (
    <div>
      <h1>InstructionPage</h1>
      <button
          type="button"
          onClick={handleNext}
          className="w-full sm:w-auto min-w-[140px] mx-auto rounded-full py-3 px-10 text-base font-bold text-white shadow-md transition hover:brightness-110 active:scale-[0.98]"
          style={{ backgroundColor: BTN }}
        >
          Begin
        </button>
    </div>
  )
}
