import React from 'react'
import { useNavigate } from 'react-router-dom'
import Leaderboard from '../components/Leaderboard'
import { IoMdDownload } from 'react-icons/io'
import logo from '../assets/Photo/EndgamePage/logo.png'
import checklistPdfUrl from '../assets/PDF/pdf.pdf'
import ScoreDisplay from '../components/ScoreDisplay'
import { usePrivacyBudget } from '../context/PrivacyBudgetContext'
import { getSessionTitleFromScore } from '../utils/sessionTitle'

export default function EndgamePage() {
  const navigate = useNavigate()
  const { privacyTotalScore, privacyBudgetCompletedAt, levels, reset, username } = usePrivacyBudget()
  const { title, blurb, badgeId } = getSessionTitleFromScore(privacyTotalScore)
  const totalLevels = levels?.length ?? 10
  const scenariosCleared = privacyBudgetCompletedAt ? totalLevels : null

  const exitToMenu = () => {
    reset()
    navigate('/welcome', { replace: true })
  }

  return (
    <div className='relative z-10 flex flex-col w-full min-h-[100dvh] items-center py-6 sm:py-8 px-3 bg-[#d2ccfa] pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(0.5rem,env(safe-area-inset-top))]'>
      <img
        src={logo}
        alt='Friend or Foe logo'
        className='w-[min(240px,75vw)] sm:w-44 lg:w-[350px] h-auto object-contain mb-4 sm:mb-6'
      />

      <h2 className='text-center text-base sm:text-lg md:text-xl font-semibold text-[#1b2244] px-2 max-w-lg'>
        Tune what you share — before you post.
      </h2>
      <div className='w-[min(90%,28rem)] border-t-2 border-dotted border-gray-800 mt-4' />

      <div className='flex flex-col lg:flex-row items-stretch lg:items-center justify-center w-full max-w-6xl px-2 sm:px-6 gap-6 lg:gap-10 mt-4 sm:mt-8'>
        <div className='w-full lg:w-auto flex justify-center h-fit'>
          <ScoreDisplay
            title={title}
            blurb={blurb}
            badgeId={badgeId}
            totalScore={privacyTotalScore}
            scenariosCleared={scenariosCleared}
            scenariosTotal={totalLevels}
          />
        </div>

        <Leaderboard currentPlayerName={username} />
      </div>

      <div className='flex flex-col sm:flex-row mt-8 sm:mt-10 gap-3 sm:gap-8 justify-center w-full max-w-xl sm:max-w-none px-4 sm:px-6 pb-8'>
        <a
          href={checklistPdfUrl}
          download='Privacy-Budget-Safety-Checklist.pdf'
          className='bg-[#ddecff] text-blue-900 px-4 py-3 rounded-md text-base sm:text-lg md:text-xl font-bold flex items-center justify-center gap-2 min-h-[48px] w-full sm:w-auto touch-manipulation no-underline text-center'
        >
          <IoMdDownload aria-hidden /> Download Safety Checklist!
        </a>
        <button
          type='button'
          className='bg-[#ddecff] text-blue-900 px-4 py-3 rounded-md text-base sm:text-lg md:text-xl font-bold min-h-[48px] w-full sm:w-auto touch-manipulation'
          onClick={exitToMenu}
        >
          Exit To Menu
        </button>
      </div>

      <p className='text-center text-xs sm:text-sm font-semibold text-[#1b2244] opacity-80 pb-3'>
        Design & development by Minh Doan
      </p>
    </div>
  )
}
