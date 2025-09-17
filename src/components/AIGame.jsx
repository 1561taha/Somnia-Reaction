import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../stores/gameStore'
import GameUI from './GameUI'

const AIGame = () => {
  const navigate = useNavigate()
  const { gameStatus, initializeGame } = useGameStore()
  const [setupData, setSetupData] = useState({
    playerName: 'Player',
    boardSize: { width: 8, height: 6 },
    explosionCapacity: 4,
    aiDifficulty: 3, // Changed from 'advanced' to 3 (Medium)
  })

  const boardSizeOptions = [
    { label: 'Small (6×4)', value: { width: 6, height: 4 } },
    { label: 'Medium (6×6)', value: { width: 6, height: 6 } },
    { label: 'Standard (8×6)', value: { width: 8, height: 6 } },
    { label: 'Large (8×8)', value: { width: 8, height: 8 } },
    { label: 'XL (10×8)', value: { width: 10, height: 8 } },
    { label: 'XXL (12×10)', value: { width: 12, height: 10 } },
  ]

  const aiDifficultyOptions = [
    { label: 'Beginner', value: 1, description: 'Simple moves with 30% randomness and 40% mistakes' },
    { label: 'Easy', value: 2, description: 'Basic strategy with 20% randomness and 20% mistakes' },
    { label: 'Medium', value: 3, description: 'Balanced gameplay with 10% randomness and 10% mistakes' },
    { label: 'Hard', value: 4, description: 'Advanced strategy with 5% randomness and 5% mistakes' },
    { label: 'Expert', value: 5, description: 'Chess-like strategic thinking with no randomness or mistakes' },
  ]

  const handleStartGame = () => {
    const config = {
      gameMode: 'ai',
      boardSize: setupData.boardSize,
      explosionCapacity: setupData.explosionCapacity,
      players: [
        { name: setupData.playerName, color: 'blue' },
        { name: 'AI Opponent', color: 'red' },
      ],
      aiDifficulty: setupData.aiDifficulty,
    }
    initializeGame(config)
  }

  const handleBack = () => {
    navigate('/')
  }

  if (gameStatus === 'playing' || gameStatus === 'paused' || gameStatus === 'gameOver') {
    return <GameUI />
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">
              VS AI Setup
            </h1>
            <p className="text-slate-400">
              Challenge our advanced AI opponent with strategic gameplay
            </p>
          </div>

          <div className="space-y-6">
            {/* Player Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Your Name
              </label>
              <input
                type="text"
                value={setupData.playerName}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  playerName: e.target.value
                }))}
                placeholder="Enter your name"
                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Board Size */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Board Size
              </label>
              <select
                value={JSON.stringify(setupData.boardSize)}
                onChange={(e) => setSetupData(prev => ({
                  ...prev,
                  boardSize: JSON.parse(e.target.value)
                }))}
                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                {boardSizeOptions.map(option => (
                  <option key={option.label} value={JSON.stringify(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Difficulty */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">
                AI Difficulty
              </label>
              <div className="space-y-2">
                {aiDifficultyOptions.map(option => (
                  <motion.div
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => setSetupData(prev => ({
                        ...prev,
                        aiDifficulty: option.value
                      }))}
                      className={`
                        w-full p-4 rounded-lg text-left transition-all
                        ${setupData.aiDifficulty === option.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }
                      `}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className={`text-sm mt-1 ${
                        setupData.aiDifficulty === option.value
                          ? 'text-blue-100'
                          : 'text-slate-400'
                      }`}>
                        {option.description}
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* AI Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50"
            >
              <h3 className="font-medium text-white mb-2">🤖 AI Features</h3>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Chess-like strategic evaluation</li>
                <li>• Multi-turn planning and prediction</li>
                <li>• Territory control optimization</li>
                <li>• Chain reaction anticipation</li>
                <li>• Adaptive strategy based on game state</li>
              </ul>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleBack}
                className="btn btn-secondary flex-1"
              >
                ← Back
              </button>
              <button
                onClick={handleStartGame}
                className="btn btn-primary flex-1"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AIGame 