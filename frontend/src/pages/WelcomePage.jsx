import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivacyBudget } from '../context/PrivacyBudgetContext'
import { HiOutlineDocumentMagnifyingGlass } from 'react-icons/hi2'
import { GiReceiveMoney } from 'react-icons/gi'
import { FaRegThumbsUp } from 'react-icons/fa'
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5'
import logo from '../assets/Photo/WelcomePage/logo.png'

const NAVY = '#1A365D'
const SKY = '#BFE3FF'
const BTN = '#007BFF'

function WelcomePage() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const { createPlayerAndRegister, loading, error, setError } = usePrivacyBudget()

  const handleBegin = async () => {
    setError(null)
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    try {
      await createPlayerAndRegister(name)
      navigate('/instruction')
    } catch {
      // error message already set in context
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center px-5 py-10 sm:py-14"
      style={{ backgroundColor: SKY }}
    >
      {/* Brand + hero copy — centered, generous spacing like mockup 1 */}
      <header className="flex flex-col items-center text-center max-w-xl w-full mb-10 sm:mb-14">
        <img
          src={logo}
          alt="Privacy Budget"
          className="w-[70%] h-auto object-contain mb-5"
        />
        <p
          className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase mb-3"
          style={{ color: NAVY }}
        >
          CHOICE-BASED PRACTICE
        </p>
        <h1
          className="text-xl sm:text-2xl font-bold leading-snug mb-4 px-1"
          style={{ color: NAVY }}
        >
          Tune what you share — before you post.
        </h1>
        <p
          className="text-sm sm:text-[15px] leading-relaxed font-medium max-w-[28rem]"
          style={{ color: NAVY }}
        >
          Each scenario gives you a limited privacy budget. Adjust caption, audience,
          location, and crop — then see how close your choices are to a strong balance.
        </p>
      </header>

      {/* Card: white, dark outline, segmented feature bar */}
      <div
        className="w-full max-w-2xl rounded-2xl bg-white px-6 sm:px-8 py-7 sm:py-8 flex flex-col items-stretch gap-6 shadow-sm"
        style={{ border: `2px solid ${NAVY}` }}
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor="welcome-name"
            className="text-center text-sm font-semibold"
            style={{ color: NAVY }}
          >
            Your name (or nickname)
          </label>
          <input
            id="welcome-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name here…."
            className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500"
            style={{ color: NAVY }}
          />
        </div>

        {/* Segmented bar: one row, vertical dividers (mockup 1) */}
        <div
          className="flex w-full rounded-xl overflow-hidden border-2"
          style={{ borderColor: NAVY }}
        >
          <div
            className="flex flex-1 flex-col items-center justify-center gap-1.5 py-3 px-2 text-center bg-white"
            style={{ borderRight: `1px solid ${NAVY}` }}
          >
            <HiOutlineDocumentMagnifyingGlass className="text-2xl shrink-0" style={{ color: NAVY }} aria-hidden />
            <span className="text-[11px] sm:text-xs font-semibold leading-tight" style={{ color: NAVY }}>
              Scenarios
            </span>
          </div>
          <div
            className="flex flex-1 flex-col items-center justify-center gap-1.5 py-3 px-2 text-center bg-white"
            style={{ borderRight: `1px solid ${NAVY}` }}
          >
            <GiReceiveMoney className="text-2xl shrink-0" style={{ color: NAVY }} aria-hidden />
            <span className="text-[11px] sm:text-xs font-semibold leading-tight" style={{ color: NAVY }}>
              Budget + trade-offs
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 py-3 px-2 text-center bg-white">
            <div className="flex items-center gap-0.5" aria-hidden>
              <FaRegThumbsUp className="text-lg" style={{ color: NAVY }} />
              <IoChatbubbleEllipsesOutline className="text-xl" style={{ color: NAVY }} />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold leading-tight" style={{ color: NAVY }}>
              Guidance feedback
            </span>
          </div>
        </div>

        {error && (
          <p className="text-center text-sm text-red-600 font-medium" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleBegin}
          disabled={loading}
          className="w-full sm:w-auto min-w-[140px] mx-auto rounded-full py-3 px-10 text-base font-bold text-white shadow-md transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: BTN }}
        >
          {loading ? 'Starting…' : 'Begin'}
        </button>
      </div>
    </div>
  )
}

export default WelcomePage
