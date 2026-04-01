import React from 'react'
import logo from '../assets/Photo/Header/logo.png'
import { FaQuestionCircle } from "react-icons/fa";

function Header() {
  return (
    <div className='w-full h-22 bg-[#4860bd] border-b border-gray-200 flex items-center justify-between'>
        <img src={logo} alt="logo" className=' h-20 object-contain ml-6 ' />
        <h2 className='text-black text-2xl font-bold p-3 bg-white rounded-full py-2 px-10 text-center ml-25'>3/10</h2>
        <div className='flex items-center gap-2 mr-3'>
            <h2 className='text-white text-2xl font-bold'>1126 pts</h2>
            <h2 className='text-blacke text-2xl font-bold'>|</h2>
            <h2 className='text-black text-2xl font-bold bg-white rounded-xl py-2 px-3 text-center' >Budget: 3/10</h2>
            <FaQuestionCircle className='text-white text-2xl cursor-pointer hover:text-gray-300 transition-all duration-300 w-13 h-13 ml-8' />
        </div>
    </div>
  )
}

export default Header
