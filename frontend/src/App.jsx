import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PrivacyBudgetProvider } from './context/PrivacyBudgetContext'
import ContentWarningPage from './pages/ContentWarningPage'
import WelcomePage from './pages/WelcomePage'
import InstructionPage from './pages/InstructionPage'
import GamePage from './pages/GamePage'
import EndgamePage from './pages/EndgamePage'
import MusicToggleButton from './components/MusicToggleButton'
import { SoundProvider, useSounds } from './context/SoundContext'
import { MusicProvider, useMusic } from './context/MusicContext'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function AppContent() {
  const { playClickSound, playButtonClickSound } = useSounds()
  const { startMusic } = useMusic()
  const location = useLocation()

  useEffect(() => {
    const handleGlobalClick = (ev) => {
      if (ev.target.closest('[data-skip-global-click-sound]')) return
      if (ev.target.closest('button, [role="button"]')) {
        playButtonClickSound()
      } else {
        playClickSound()
      }
    }
    document.addEventListener('click', handleGlobalClick, true)
    return () => document.removeEventListener('click', handleGlobalClick, true)
  }, [playClickSound, playButtonClickSound])

  // Attempt to start background music after leaving content warning (autoplay may still be blocked until user gesture).
  useEffect(() => {
    if (location.pathname === '/') return
    startMusic()
  }, [location.pathname, startMusic])

  return (
    <>
      {location.pathname !== '/' && <MusicToggleButton />}
      <Routes>
        <Route path="/" element={<ContentWarningPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/instruction" element={<InstructionPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/endgame" element={<EndgamePage />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <PrivacyBudgetProvider>
        <SoundProvider>
          <MusicProvider>
            <AppContent />
          </MusicProvider>
        </SoundProvider>
      </PrivacyBudgetProvider>
    </Router>
  )
}

export default App
