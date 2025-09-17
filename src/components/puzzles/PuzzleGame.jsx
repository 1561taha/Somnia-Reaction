import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePuzzleStore } from '../../stores/puzzleStore'
import { useGameStore } from '../../stores/gameStore'
import GameBoard from '../GameBoard'

const PuzzleGame = () => {
  const navigate = useNavigate()
  const {
    currentPuzzle,
    currentMove,
    maxMoves,
    gameStatus,
    hintsUsed,
    startTime,
    showHint,
    currentHint,
    hintLevel,
    aiThinking,
    makeMove,
    useHint,
    hideHint,
    restartPuzzle,
    nextPuzzle,
    previousPuzzle
  } = usePuzzleStore()

  const { board, boardSize, currentPlayer, players } = useGameStore()

  if (!currentPuzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Puzzle Loaded</h2>
          <button
            onClick={() => navigate('/puzzles')}
            className="btn-primary"
          >
            Select a Puzzle
          </button>
        </div>
      </div>
    )
  }

  const handleCellClick = async (x, y) => {
    if (gameStatus !== 'playing' || aiThinking) return
    
    await makeMove(x, y)
  }

  const handleHint = () => {
    useHint()
  }

  const handleRestart = () => {
    restartPuzzle()
  }

  const handleNextPuzzle = () => {
    nextPuzzle()
  }

  const handlePreviousPuzzle = () => {
    previousPuzzle()
  }

  const handleBackToMenu = () => {
    navigate('/puzzles')
  }

  const handleBackToMainMenu = () => {
    navigate('/')
  }

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getElapsedTime = () => {
    if (!startTime) return 0
    return Date.now() - startTime
  }

  const getDifficultyColor = (difficulty) => {
    const colors = [
      'text-green-400', // Beginner
      'text-blue-400',  // Easy
      'text-yellow-400', // Medium
      'text-orange-400', // Hard
      'text-red-400'    // Expert
    ]
    return colors[difficulty - 1] || 'text-gray-400'
  }

  const getDifficultyLabel = (difficulty) => {
    const labels = ['Beginner', 'Easy', 'Medium', 'Hard', 'Expert']
    return labels[difficulty - 1] || 'Unknown'
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Main Game Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800/70 to-slate-900/70 backdrop-blur-md border-b border-slate-700/50 shadow-lg p-2 sm:p-3 lg:p-4 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-3 lg:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 lg:gap-6">
              <div className="text-center sm:text-left">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gradient">
                  {currentPuzzle.title}
                </h2>
                <div className="text-slate-400 text-xs sm:text-sm">
                  Move {currentMove + 1} of {maxMoves}
                </div>
              </div>
              
              {/* Difficulty Badge */}
              <div className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-slate-700/50 border border-slate-600/50`}>
                <div className={`font-semibold text-xs sm:text-sm ${getDifficultyColor(currentPuzzle.difficulty)}`}>
                  {getDifficultyLabel(currentPuzzle.difficulty)}
                </div>
                <div className="text-xs text-slate-400">
                  Difficulty {currentPuzzle.difficulty}/5
                </div>
              </div>

              {/* Timer */}
              <div className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-slate-700/50 border border-slate-600/50">
                <div className="text-white font-semibold text-xs sm:text-sm">
                  {formatTime(getElapsedTime())}
                </div>
                <div className="text-xs text-slate-400">Time</div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {gameStatus === 'playing' && (
                <>
                  <button
                    onClick={handleHint}
                    className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                    disabled={hintLevel >= currentPuzzle.hints.length}
                  >
                    💡 Hint ({hintLevel}/{currentPuzzle.hints.length})
                  </button>
                  <button
                    onClick={handleRestart}
                    className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                  >
                    🔄 Restart
                  </button>
                </>
              )}
              <button
                onClick={handleBackToMenu}
                className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                🏠 Menu
              </button>
              <button
                onClick={handleBackToMainMenu}
                className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                🏠 Main Menu
              </button>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0 p-1 sm:p-2 lg:p-4">
          {/* AI Thinking Indicator */}
          {aiThinking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-12 sm:top-16 lg:top-20 left-1/2 transform -translate-x-1/2 z-40"
            >
              <div className="bg-gradient-to-r from-blue-600/95 to-purple-600/95 backdrop-blur-md rounded-xl border border-blue-400/50 shadow-2xl p-2 sm:p-3 lg:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.div
                    className="w-2 h-2 sm:w-3 sm:h-3 lg:w-4 lg:h-4 bg-blue-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <div>
                    <h3 className="font-semibold text-white text-xs sm:text-sm">AI is thinking...</h3>
                    <p className="text-white/80 text-xs">Please wait</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="w-full h-full flex items-center justify-center">
            <GameBoard 
              board={board}
              boardSize={boardSize}
              currentPlayer={currentPlayer}
              players={players}
              onCellClick={handleCellClick}
              gameMode="puzzle"
            />
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 bg-gradient-to-b from-slate-800/60 to-slate-900/60 backdrop-blur-md border-t lg:border-l border-slate-700/50 p-2 sm:p-3 lg:p-6 overflow-y-auto max-h-48 sm:max-h-64 lg:max-h-none flex-shrink-0">
        {/* Objective */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          className="card mb-2 sm:mb-3 lg:mb-6"
        >
          <h3 className="text-sm sm:text-base lg:text-xl font-bold mb-1 sm:mb-2 lg:mb-4 text-gradient">Objective</h3>
          <div className="space-y-1 sm:space-y-2 lg:space-y-3">
            <div className="p-1 sm:p-2 lg:p-3 rounded-lg bg-slate-700/30">
              <p className="text-white text-xs sm:text-sm lg:text-base leading-relaxed">
                {currentPuzzle.objective}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Game Status */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-2 sm:mb-3 lg:mb-6"
        >
          <h3 className="text-sm sm:text-base lg:text-xl font-bold mb-1 sm:mb-2 lg:mb-4 text-gradient">Game Status</h3>
          <div className="space-y-1 sm:space-y-2 lg:space-y-3">
            <div className="flex justify-between items-center p-1 sm:p-2 lg:p-3 rounded-lg bg-slate-700/30">
              <span className="text-slate-300 font-medium text-xs sm:text-sm lg:text-base">Status:</span>
              <span className={`font-bold text-xs sm:text-sm lg:text-lg ${
                gameStatus === 'playing' ? 'text-blue-400' :
                gameStatus === 'completed' ? 'text-green-400' :
                gameStatus === 'failed' ? 'text-red-400' : 'text-slate-400'
              }`}>
                {gameStatus === 'playing' ? 'Playing' :
                 gameStatus === 'completed' ? 'Completed!' :
                 gameStatus === 'failed' ? 'Failed' : 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center p-1 sm:p-2 lg:p-3 rounded-lg bg-slate-700/30">
              <span className="text-slate-300 font-medium text-xs sm:text-sm lg:text-base">Moves:</span>
              <span className="text-white font-bold text-xs sm:text-sm lg:text-lg">{currentMove + 1}/{maxMoves}</span>
            </div>
            <div className="flex justify-between items-center p-1 sm:p-2 lg:p-3 rounded-lg bg-slate-700/30">
              <span className="text-slate-300 font-medium text-xs sm:text-sm lg:text-base">Hints Used:</span>
              <span className="text-yellow-400 font-bold text-xs sm:text-sm lg:text-lg">{hintsUsed}</span>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <h3 className="text-sm sm:text-base lg:text-xl font-bold mb-1 sm:mb-2 lg:mb-4 text-gradient">Navigation</h3>
          <div className="space-y-1 sm:space-y-2 lg:space-y-3">
            <button
              onClick={handlePreviousPuzzle}
              className="w-full btn-secondary text-center py-1 sm:py-2 text-xs sm:text-sm lg:text-base"
            >
              ← Previous Puzzle
            </button>
            <button
              onClick={handleNextPuzzle}
              className="w-full btn-secondary text-center py-1 sm:py-2 text-xs sm:text-sm lg:text-base"
            >
              Next Puzzle →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Hint Modal */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={hideHint}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-r from-purple-600/95 to-blue-600/95 backdrop-blur-md rounded-xl border border-purple-400/50 shadow-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-lg mb-2">Hint #{hintLevel}</h3>
                  <p className="text-white/90 text-sm leading-relaxed mb-4">
                    {currentHint}
                  </p>
                  <button
                    onClick={hideHint}
                    className="btn-primary w-full py-2"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {(gameStatus === 'completed' || gameStatus === 'failed') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`backdrop-blur-md rounded-xl border shadow-2xl p-8 max-w-md w-full ${
                gameStatus === 'completed' 
                  ? 'bg-gradient-to-r from-green-600/95 to-emerald-600/95 border-green-400/50'
                  : 'bg-gradient-to-r from-red-600/95 to-pink-600/95 border-red-400/50'
              }`}
            >
              <div className="text-center">
                {/* Success Icon */}
                {gameStatus === 'completed' ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                    className="text-6xl mb-4"
                  >
                    😔
                  </motion.div>
                )}

                {/* Title */}
                <h2 className={`text-2xl font-bold mb-2 ${
                  gameStatus === 'completed' ? 'text-green-100' : 'text-red-100'
                }`}>
                  {gameStatus === 'completed' ? 'Puzzle Completed!' : 'Puzzle Failed'}
                </h2>

                {/* Subtitle */}
                <p className={`text-lg mb-6 ${
                  gameStatus === 'completed' ? 'text-green-200' : 'text-red-200'
                }`}>
                  {gameStatus === 'completed' 
                    ? `You solved "${currentPuzzle.title}"!`
                    : `You ran out of moves for "${currentPuzzle.title}"`
                  }
                </p>

                {/* Stats */}
                <div className="bg-white/10 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-white/70">Time</div>
                      <div className="text-white font-semibold">{formatTime(getElapsedTime())}</div>
                    </div>
                    <div>
                      <div className="text-white/70">Moves Used</div>
                      <div className="text-white font-semibold">{currentMove}/{maxMoves}</div>
                    </div>
                    <div>
                      <div className="text-white/70">Hints Used</div>
                      <div className="text-white font-semibold">{hintsUsed}</div>
                    </div>
                    <div>
                      <div className="text-white/70">Difficulty</div>
                      <div className={`font-semibold ${getDifficultyColor(currentPuzzle.difficulty)}`}>
                        {getDifficultyLabel(currentPuzzle.difficulty)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {gameStatus === 'completed' ? (
                    <>
                      <button
                        onClick={handleNextPuzzle}
                        className="w-full btn-primary py-3 text-lg font-semibold"
                      >
                        Next Puzzle →
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleRestart}
                        className="w-full btn-primary py-3 text-lg font-semibold"
                      >
                        Try Again
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={handleBackToMenu}
                    className="w-full btn-secondary py-2"
                  >
                    Back to Menu
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PuzzleGame 