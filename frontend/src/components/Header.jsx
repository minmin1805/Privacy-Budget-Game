import React from 'react'
import logo from '../assets/Photo/Header/logo.png'
import { FaQuestionCircle } from 'react-icons/fa'

function Header({ currentLevel = 1, totalLevels = 10, totalScore = 0, onHelpClick }) {
  return (
    <div className='w-full min-h-[4.5rem] sm:min-h-[5.5rem] bg-[#4860bd] border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 gap-1 sm:gap-2 relative z-10 pt-[max(0px,env(safe-area-inset-top))]'>
      <img
        src={logo}
        alt='Privacy Budget'
        className='h-11 w-auto max-w-[38%] object-contain ml-1 sm:ml-6 shrink-0 sm:h-20 sm:max-w-none'
      />
      <h2 className='text-black text-xs sm:text-lg md:text-2xl font-bold bg-white rounded-full py-1.5 px-3 sm:py-2 sm:px-6 md:px-10 text-center shrink-0 max-w-[34vw] sm:max-w-none truncate'>
        Level {currentLevel}/{totalLevels}
      </h2>
      <div className='flex items-center gap-1 sm:gap-3 mr-1 sm:mr-3 shrink-0 min-w-0'>
        <h2 className='text-white text-xs sm:text-base md:text-2xl font-bold whitespace-nowrap tabular-nums'>
          {totalScore.toLocaleString()}{' '}
          <span className='hidden sm:inline'>pts</span>
        </h2>
        <button
          type='button'
          onClick={() => onHelpClick?.()}
          className='rounded-full p-1.5 sm:p-1 text-white transition hover:bg-white/10 hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-h-0 sm:min-w-0'
          aria-label='Open how to play instructions'
        >
          <FaQuestionCircle className='text-2xl sm:text-3xl md:text-4xl' />
        </button>
      </div>
    </div>
  )
}

export default Header
