import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../stores/gameStore'

const LocalGame = () => {
  const navigate = useNavigate()
  const { initializeGame } = useGameStore()
  const [setupData, setSetupData] = useState({
    boardSize: { width: 8, height: 6 },
    explosionCapacity: 4,
    playerCount: 2
  })

  const boardSizeOptions = [
    { label: 'Small (6×4)', value: { width: 6, height: 4 } },
    { label: 'Medium (6×6)', value: { width: 6, height: 6 } },
    { label: 'Standard (8×6)', value: { width: 8, height: 6 } },
    { label: 'Large (8×8)', value: { width: 8, height: 8 } },
    { label: 'XL (10×8)', value: { width: 10, height: 8 } },
    { label: 'XXL (12×10)', value: { width: 12, height: 10 } },
  ]

  const playerColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Orange
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16'  // Lime
  ]

  const handleStartGame = () => {
    const players = []
    for (let i = 0; i < setupData.playerCount; i++) {
      players.push({
        id: i,
        name: `Player ${i + 1}`,
        color: playerColors[i]
      })
    }

    const config = {
      gameMode: 'local',
      boardSize: setupData.boardSize,
      explosionCapacity: setupData.explosionCapacity,
      players: players
    }
    
    initializeGame(config)
    navigate('/game')
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient mb-4">
            Local Multiplayer
          </h1>
          <p className="text-lg sm:text-xl text-slate-300">
            Play with friends on the same device
          </p>
        </div>

        {/* Game Options */}
        <div className="space-y-6">
          {/* Board Size Selection */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Board Size</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {boardSizeOptions.map((option) => (
                <button
                  key={option.label}
                  className={`btn-secondary text-center py-3 transition-all ${
                    JSON.stringify(setupData.boardSize) === JSON.stringify(option.value)
                      ? 'ring-2 ring-blue-500 bg-blue-600/20'
                      : ''
                  }`}
                  onClick={() => setSetupData(prev => ({
                    ...prev,
                    boardSize: option.value
                  }))}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Player Count */}
          <div className="glass p-6 rounded-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Number of Players</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  className={`btn-secondary text-center py-3 transition-all ${
                    setupData.playerCount === count
                      ? 'ring-2 ring-blue-500 bg-blue-600/20'
                      : ''
                  }`}
                  onClick={() => setSetupData(prev => ({
                    ...prev,
                    playerCount: count
                  }))}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={handleStartGame}
              className="btn-primary flex-1 py-4 text-lg font-semibold"
            >
              Start Game
            </button>
            <button
              onClick={handleBack}
              className="btn-secondary flex-1 py-4 text-lg font-semibold"
            >
              Back to Menu
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 glass p-6 rounded-2xl">
          <h3 className="text-lg font-semibold text-white mb-3">How to Play</h3>
          <ul className="text-slate-300 space-y-2 text-sm sm:text-base">
            <li>• Players take turns placing orbs on the board</li>
            <li>• When a cell reaches critical mass, it explodes</li>
            <li>• Explosions send orbs to neighboring cells</li>
            <li>• Last player with orbs on the board wins!</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}

export default LocalGame 