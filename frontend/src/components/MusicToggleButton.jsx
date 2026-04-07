import React from 'react'
import { SiYoutubemusic } from 'react-icons/si'
import { useMusic } from '../context/MusicContext'

export default function MusicToggleButton() {
  const { isPlaying, toggleMusic } = useMusic()

  return (
    <button
      type="button"
      onClick={toggleMusic}
      data-skip-global-click-sound
      className={[
        // z-50 above most UI; must not set BOTH top+bottom (would stretch full height on mobile)
        'fixed z-50 flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white/95 shadow-md transition-colors',
        'hover:bg-white active:scale-95 touch-manipulation',
        // Mobile: single corner (bottom + right only) — explicit size so nothing expands
        'right-[max(0.75rem,env(safe-area-inset-right))] bottom-[max(0.75rem,env(safe-area-inset-bottom))] h-11 w-11 p-0 sm:h-auto sm:w-auto sm:p-2.5',
        // Desktop / larger phones: bottom-left with optional label
        'sm:bottom-[max(1rem,env(safe-area-inset-bottom))] sm:left-[max(1rem,env(safe-area-inset-left))] sm:right-auto sm:top-auto',
      ].join(' ')}
      aria-label={isPlaying ? 'Mute music' : 'Play music'}
      title={isPlaying ? 'Mute music' : 'Play music'}
    >
      <SiYoutubemusic
        className={`h-6 w-6 shrink-0 text-red-600 sm:h-7 sm:w-7 ${isPlaying ? '' : 'opacity-60'}`}
      />
      <span className="hidden font-semibold text-gray-700 sm:inline text-sm">
        {isPlaying ? 'Music on' : 'Toggle on music'}
      </span>
      {!isPlaying && (
        <svg
          className="hidden h-4 w-4 text-gray-600 sm:block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      )}
    </button>
  )
}
