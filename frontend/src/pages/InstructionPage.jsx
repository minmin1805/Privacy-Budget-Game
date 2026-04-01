import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivacyBudget } from '../context/PrivacyBudgetContext'

const NAVY = '#1A365D'
const SKY = '#BFE3FF'
const BTN = '#007BFF'

export default function InstructionPage() {
  const navigate = useNavigate()
  const { playerId, hydrated } = usePrivacyBudget()

  useEffect(() => {
    if (!hydrated) return
    if (!playerId) {
      navigate('/welcome', { replace: true })
    }
  }, [hydrated, playerId, navigate])

  const handleStartGame = () => {
    navigate('/game')
  }

  return (
    <div
      className='min-h-screen flex flex-col items-center justify-center px-5 py-10'
      style={{ backgroundColor: SKY }}
    >
      <div className='max-w-2xl w-full rounded-2xl bg-white p-8 border-2 shadow-sm' style={{ borderColor: NAVY }}>
        <h1 className='text-2xl sm:text-3xl font-bold text-center mb-4' style={{ color: NAVY }}>
          How to play
        </h1>
        <ul className='list-disc pl-6 space-y-2 text-[#1b2244] text-sm sm:text-base mb-8'>
          <li>Each level shows a post scenario. Adjust audience, location tag, caption, and photo options.</li>
          <li>Tap <strong>Post Now</strong> to submit your choices and see feedback.</li>
          <li>Complete all 10 scenarios to finish your session.</li>
        </ul>
        <button
          type='button'
          onClick={handleStartGame}
          disabled={!hydrated || !playerId}
          className='w-full rounded-full py-3 px-10 text-base font-bold text-white shadow-md transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
          style={{ backgroundColor: BTN }}
        >
          Start game
        </button>
      </div>
    </div>
  )
}
