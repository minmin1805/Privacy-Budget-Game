import React from 'react'
import logo from '../assets/Photo/Header/logo.png'
import { FaQuestionCircle } from 'react-icons/fa'

function Header({ currentLevel = 1, totalLevels = 10, totalScore = 0, onHelpClick }) {
  return (
    <div className='w-full min-h-[5.5rem] bg-[#4860bd] border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 gap-2 relative z-10'>
      <img src={logo} alt='Privacy Budget' className='h-16 sm:h-20 object-contain ml-2 sm:ml-6 shrink-0' />
      <h2 className='text-black text-lg sm:text-2xl font-bold p-2 sm:p-3 bg-white rounded-full py-2 px-6 sm:px-10 text-center shrink-0'>
        Level {currentLevel}/{totalLevels}
      </h2>
      <div className='flex items-center gap-2 sm:gap-3 mr-5 sm:mr-3 shrink-0'>
        <h2 className='text-white text-base sm:text-3xl mr-3 font-bold whitespace-nowrap'>
          {totalScore.toLocaleString()} pts
        </h2>
        <button
          type='button'
          onClick={() => onHelpClick?.()}
          className='rounded-full p-1 text-white transition hover:bg-white/10 hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80'
          aria-label='Open how to play instructions'
        >
          <FaQuestionCircle className='text-xl sm:text-5xl' />
        </button>
      </div>
    </div>
  )
}

export default Header
