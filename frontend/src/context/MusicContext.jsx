import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react'
import bgMusicSrc from '../assets/Sound/background.mp3'

const MusicContext = createContext(null)

export function MusicProvider({ children }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const isPlayingRef = useRef(false)
  const [musicEnabled, setMusicEnabled] = useState(true) // user preference (on by default)
  const musicEnabledRef = useRef(true)

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    musicEnabledRef.current = musicEnabled
  }, [musicEnabled])

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlayingRef.current) {
      audio.pause()
      setIsPlaying(false)
      setMusicEnabled(false)
    } else {
      audio.volume = 0.4
      audio.play().then(() => setIsPlaying(true)).catch(() => {})
      setMusicEnabled(true)
    }
  }, [])

  const startMusic = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !musicEnabledRef.current || isPlayingRef.current) return
    audio.volume = 0.4
    audio.play().then(() => setIsPlaying(true)).catch(() => {})
  }, [])

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause()
    }
  }, [])

  const value = { isPlaying, toggleMusic, startMusic }

  return (
    <MusicContext.Provider value={value}>
      <audio
        ref={audioRef}
        src={bgMusicSrc}
        loop
        preload="auto"
        className="hidden"
        aria-hidden
      />
      {children}
    </MusicContext.Provider>
  )
}

export function useMusic() {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic must be used inside MusicProvider')
  return ctx
}
