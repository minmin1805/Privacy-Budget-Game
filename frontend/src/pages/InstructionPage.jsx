import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivacyBudget } from '../context/PrivacyBudgetContext'
import InstructionContent, { INSTR_BTN, INSTR_MUTED } from '../components/InstructionContent'

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
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#BFE3FF] via-[#cfeaff] to-[#e4f3fc]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(26, 54, 93, 0.08) 0%, transparent 45%),
            radial-gradient(circle at 80% 10%, rgba(0, 123, 255, 0.06) 0%, transparent 40%),
            radial-gradient(circle at 50% 100%, rgba(26, 54, 93, 0.05) 0%, transparent 50%)
          `,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231A365D' fill-opacity='0.35'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-4 py-6 sm:px-8 sm:py-12 lg:px-10 lg:py-14 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]">
        <InstructionContent headingId="instruction-page-heading" />

        <div className="mt-8 flex flex-col items-center pb-4 sm:mt-10">
          <button
            type="button"
            onClick={handleStartGame}
            disabled={!hydrated || !playerId}
            className="w-full max-w-2xl min-h-[48px] rounded-full py-3.5 px-8 text-base font-bold text-white shadow-[0_4px_20px_rgba(0,123,255,0.35)] transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-lg touch-manipulation"
            style={{ backgroundColor: INSTR_BTN }}
          >
            Start game
          </button>
          <p className="mt-4 max-w-2xl text-center text-xs leading-relaxed sm:text-sm" style={{ color: INSTR_MUTED }}>
            Take your time—there’s no countdown on this screen. Thoughtful choices beat fast taps.
          </p>
        </div>
      </div>
    </div>
  )
}
