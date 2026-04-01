import React from 'react'
import logo from '../assets/Photo/WelcomePage/logo.png'
import { useNavigate } from 'react-router-dom';
import { GiReceiveMoney } from "react-icons/gi";
import { MdOutlineFeedback } from "react-icons/md";
import { AiOutlineProfile } from "react-icons/ai";

function WelcomePage() {
  const navigate = useNavigate();
  const handleBegin = () => {
    navigate('/instruction');
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-[#b3d9ff]'>
        <img src={logo} alt="logo" className='w-[25%] mx-auto' />
        <h2>CHOICE-BASED PRACTICE</h2>
        <h2>Tune what you share - before you post</h2>
        <h2>Each scenario gives you a limited privacy budget. Adjust caption, audience, location, and crop - then see how close your choices are to a strong balance</h2>
        <div className='p-10 bg-white border rounded-2xl flex flex-col items-center justify-center'>
            <h2>Your name (or nickname)</h2>
            <input type="text" placeholder='Enter your name' className='w-full p-2 border rounded-md' />
            <div className='flex '>
                <span className='rounded-2xl border py-2 px-4 flex items-center gap-2'><AiOutlineProfile /> Scenarios</span>
                <span className='rounded-2xl border py-2 px-4 flex items-center gap-2'><GiReceiveMoney /> Budget + trade-offs</span>
                <span className='rounded-2xl border py-2 px-4 flex items-center gap-2'><MdOutlineFeedback /> Guildance feedback</span>
            </div>
            <button onClick={handleBegin} className='bg-blue-500 text-white rounded-2xl py-2 px-4'>Begin</button>
        </div>
    </div>
  );
}

export default WelcomePage;