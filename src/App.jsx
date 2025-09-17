import { Routes, Route } from 'react-router-dom'
import { GameProvider } from './contexts/GameContext'
import { Toaster } from 'react-hot-toast'
import MainMenu from './components/MainMenu'
import LocalGame from './components/LocalGame'
import AIGame from './components/AIGame'
import OnlineGame from './components/OnlineGame'
import Settings from './components/Settings'
import Help from './components/Help'
import GameUI from './components/GameUI'
import PuzzleSelector from './components/puzzles/PuzzleSelector'
import PuzzleGame from './components/puzzles/PuzzleGame'
import UserRegistration from './components/blockchain/UserRegistration'
import SocialFeatures from './components/blockchain/SocialFeatures'
import ProfileAndAchievements from './components/blockchain/ProfileAndAchievements'

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/local" element={<LocalGame />} />
          <Route path="/ai" element={<AIGame />} />
          <Route path="/online" element={<OnlineGame />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/help" element={<Help />} />
          <Route path="/game" element={<GameUI />} />
          <Route path="/puzzles" element={<PuzzleSelector />} />
          <Route path="/puzzle-game" element={<PuzzleGame />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/social" element={<SocialFeatures />} />
          <Route path="/profile" element={<ProfileAndAchievements />} />
        </Routes>
      </div>
    </GameProvider>
  )
}

export default App 