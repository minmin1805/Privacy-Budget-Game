import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PrivacyBudgetProvider } from './context/PrivacyBudgetContext'
import ContentWarningPage from './pages/ContentWarningPage'
import WelcomePage from './pages/WelcomePage'
import InstructionPage from './pages/InstructionPage'
import GamePage from './pages/GamePage'
import EndgamePage from './pages/EndgamePage'

function App() {
  return (
    <Router>
      <PrivacyBudgetProvider>
        <Routes>
          <Route path="/" element={<ContentWarningPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/instruction" element={<InstructionPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/endgame" element={<EndgamePage />} />
        </Routes>
      </PrivacyBudgetProvider>
    </Router>
  )
}

export default App
