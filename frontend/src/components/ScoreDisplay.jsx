import React from 'react'
import mockBadge from '../assets/Photo/ScoreDisplay/mockbadge.png'

function ScoreDisplay({ title = 'Steady Learner', blurb, totalScore = 0, scenariosCleared, scenariosTotal = 10 }) {
  const scoreLabel = typeof totalScore === 'number' ? totalScore.toLocaleString() : String(totalScore)
  const scenariosLine =
    scenariosCleared != null && scenariosTotal != null
      ? `${scenariosCleared}/${scenariosTotal} scenarios cleared`
      : null

  return (
    <div className='w-full max-w-[460px] rounded-3xl bg-[#ddecff] p-3'>
      <div className='rounded-[20px] bg-white overflow-hidden border border-[#a8afcb]'>
        <div className='bg-[#4e33b5] py-3 px-4'>
          <h2 className='text-center text-white text-3xl font-extrabold tracking-wide'>
            SESSION COMPLETE
          </h2>
        </div>

        <div className='px-4 py-4 text-center text-[#334684]'>
          <img
            src={mockBadge}
            alt={`${title} badge`}
            className='w-[66%] max-w-[300px] mx-auto object-contain'
          />

          <h3 className='mt-2 text-4xl font-bold'>{title}</h3>
          {blurb ? <p className='mt-2 text-lg leading-snug text-[#334684] max-w-[390px] mx-auto'>{blurb}</p> : null}

          <div className='my-3 border-t-6 border-dotted border-black' />

          <p className='text-xl font-extrabold'>YOUR FINAL SCORE</p>
          <p className='text-3xl mt-1.5 font-medium'>{scoreLabel} points</p>

          <div className='my-3 border-t-6 border-dotted border-black' />

          {scenariosLine ? (
            <ul className='text-left text-[20px] leading-tight text-[#1f1f27] space-y-1.5 max-w-[390px] mx-auto pb-1'>
              <li>• {scenariosLine}</li>
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default ScoreDisplay
