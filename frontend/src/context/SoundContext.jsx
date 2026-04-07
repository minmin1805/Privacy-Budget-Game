import { createContext, useContext } from 'react'
import useSound from 'use-sound'
import clickSfx from '../assets/Sound/Click.mp3'
import buttonSfx from '../assets/Sound/Button.mp3'

const SoundContext = createContext(null)

export function SoundProvider({ children }) {
  const [playClick] = useSound(clickSfx, { volume: 0.5 })
  const [playButton] = useSound(buttonSfx, { volume: 0.5 })

  const value = {
    playClickSound: playClick,
    playButtonClickSound: playButton,
  }

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSounds() {
  const ctx = useContext(SoundContext)
  if (!ctx) throw new Error('useSounds must be used inside SoundProvider')
  return ctx
}
