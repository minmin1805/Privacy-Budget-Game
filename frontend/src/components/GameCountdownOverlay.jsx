import React from 'react'

/**
 * Full-screen dim + large number (3, 2, or 1). z-index above game and modals.
 */
export default function GameCountdownOverlay({ value }) {
  if (value == null || value < 1) return null

  return (
    <div
      className='fixed inset-0 z-[200] flex items-center justify-center bg-black/55 pointer-events-auto'
      aria-live='polite'
      aria-label={`Countdown ${value}`}
    >
      <span className='text-[min(28vw,12rem)] sm:text-[min(22vw,14rem)] font-black text-white tabular-nums drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] select-none'>
        {value}
      </span>
    </div>
  )
}
