import React from 'react'
import { useNavigate } from 'react-router-dom'
import Leaderboard from '../components/Leaderboard'
import { IoMdDownload } from 'react-icons/io'
import logo from '../assets/Photo/EndgamePage/logo.png'
import ScoreDisplay from '../components/ScoreDisplay'
import { usePrivacyBudget } from '../context/PrivacyBudgetContext'
import { getSessionTitleFromScore } from '../utils/sessionTitle'

export default function EndgamePage() {
  const navigate = useNavigate()
  const { privacyTotalScore, privacyBudgetCompletedAt, levels } = usePrivacyBudget()
  const { title, blurb } = getSessionTitleFromScore(privacyTotalScore)
  const totalLevels = levels?.length ?? 10
  const scenariosCleared = privacyBudgetCompletedAt ? totalLevels : null

  return (
    <div className="relative z-10 flex flex-col w-full items-center py-6 sm:py-8 bg-[#d2ccfa]" >
    {/* Logo – same style as EndgamePage */}
    <img
      src={logo}
      alt="Friend or Foe logo"
      className="w-60 sm:w-44 lg:w-[350px] items-center ml-4 sm:ml-6 mb-4 sm:mb-6 "
    />

    <h2>Tune what you share - before you post.</h2>
    <div className="w-[70%] border-t-2 border-dotted border-gray-800 mt-4"></div>
    
    {/* Main content: two columns on large screens, stacked on small */}
    <div className="flex flex-col lg:flex-row items-center justify-center w-full max-w-6xl px-4 sm:px-6 gap-6 lg:gap-10 mt-4 sm:mt-8">
      {/* Left: score / badge card (styled like ScoreDisplay) */}
      <div className="w-full lg:w-auto flex justify-center h-fit">
        <ScoreDisplay
          title={title}
          blurb={blurb}
          totalScore={privacyTotalScore}
          scenariosCleared={scenariosCleared}
          scenariosTotal={totalLevels}
        />
      </div>

      {/* Right: leaderboard + learnings, styled like LeaderBoard */}
      <Leaderboard />

    </div>

    {/* Bottom buttons – reuse style from Sextortion EndgamePage */}
    <div className="flex flex-col sm:flex-row mt-8 sm:mt-10 gap-4 sm:gap-8 justify-center w-full px-4 sm:px-6 pb-8">
      <button
        type="button"
        className="bg-[#ddecff] text-blue-900 px-4 py-2 rounded-md text-lg sm:text-xl font-bold flex items-center justify-center gap-2"
      >
        <IoMdDownload /> Download Safety Checklist!
      </button>
      <button
        type="button"
        className="bg-[#ddecff] text-blue-900 px-4 py-2 rounded-md text-lg sm:text-xl font-bold"
        onClick={() => navigate("/welcome")}
      >
        Exit To Menu
      </button>
    </div>
  </div>
  )
}