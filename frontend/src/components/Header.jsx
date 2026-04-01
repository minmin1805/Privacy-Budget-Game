import React from 'react'
import logo from '../assets/Photo/Header/logo.png'
import { FaQuestionCircle } from 'react-icons/fa'

function Header({
  currentLevel = 1,
  totalLevels = 10,
  totalScore = 0,
  budgetRemaining = 10,
  budgetTotal = 10,
}) {
  return (
    <div className='w-full min-h-[5.5rem] bg-[#4860bd] border-b border-gray-200 flex items-center justify-between px-2 sm:px-4'>
      <img src={logo} alt='Privacy Budget' className='h-16 sm:h-20 object-contain ml-2 sm:ml-6' />
      <h2 className='text-black text-lg sm:text-2xl font-bold p-2 sm:p-3 bg-white rounded-full py-2 px-6 sm:px-10 text-center shrink-0'>
        Level {currentLevel}/{totalLevels}
      </h2>
      <div className='flex items-center gap-1 sm:gap-2 mr-1 sm:mr-3 shrink-0'>
        <h2 className='text-white text-base sm:text-2xl font-bold whitespace-nowrap'>
          {totalScore.toLocaleString()} pts
        </h2>
        <h2 className='text-white text-base sm:text-2xl font-bold'>|</h2>
        <h2 className='text-black text-sm sm:text-2xl font-bold bg-white rounded-xl py-2 px-2 sm:px-3 text-center whitespace-nowrap'>
          Budget: {budgetRemaining}/{budgetTotal} left
        </h2>
        <FaQuestionCircle className='text-white text-xl sm:text-2xl cursor-pointer hover:text-gray-300 transition-all duration-300 ml-2 sm:ml-4 hidden sm:block' />
      </div>
    </div>
  )
}

export default Header
