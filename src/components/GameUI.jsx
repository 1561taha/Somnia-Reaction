import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGameStore } from '../stores/gameStore'
import GameBoard from './GameBoard'
import blockchainService from '../services/blockchainService.js'
import toast from 'react-hot-toast'

const GameUI = () => {
  const navigate = useNavigate()
  const {
    players,
    currentPlayer,
    turn,
    gameStatus,
    winner,
    boardSize,
    board,
    gameMode,
    pauseGame,
    resumeGame,
    restartGame,
    resetGame,
    getPlayerScore,
    undo,
    canUndo,
    placeOrb,
  } = useGameStore()

  console.log('GameUI rendering - gameMode:', gameMode, 'boardSize:', boardSize)

  const getPlayerColor = (playerIndex) => {
    const colors = [
      { bg: 'bg-red-500', border: 'border-red-400', text: 'text-red-400', glow: 'shadow-red-400/30' },
      { bg: 'bg-blue-500', border: 'border-blue-400', text: 'text-blue-400', glow: 'shadow-blue-400/30' },
      { bg: 'bg-green-500', border: 'border-green-400', text: 'text-green-400', glow: 'shadow-green-400/30' },
      { bg: 'bg-yellow-500', border: 'border-yellow-400', text: 'text-yellow-400', glow: 'shadow-yellow-400/30' },
      { bg: 'bg-purple-500', border: 'border-purple-400', text: 'text-purple-400', glow: 'shadow-purple-400/30' },
      { bg: 'bg-pink-500', border: 'border-pink-400', text: 'text-pink-400', glow: 'shadow-pink-400/30' },
      { bg: 'bg-orange-500', border: 'border-orange-400', text: 'text-orange-400', glow: 'shadow-orange-400/30' },
      { bg: 'bg-cyan-500', border: 'border-cyan-400', text: 'text-cyan-400', glow: 'shadow-cyan-400/30' },
    ]
    return colors[playerIndex % colors.length] || colors[0]
  }

  const handlePause = () => {
    if (gameStatus === 'playing') {
      pauseGame()
    } else if (gameStatus === 'paused') {
      resumeGame()
    }
  }

  const handleRestart = () => {
    restartGame()
  }

  const handleMainMenu = () => {
    resetGame()
    navigate('/')
  }

  const handleUndo = () => {
    if (canUndo()) {
      undo()
    }
  }

  const handleCellClick = async (x, y) => {
    if (gameStatus === 'playing') {
      await placeOrb(x, y)
    }
  }

  const activePlayers = players.filter(player => !player.eliminated).length
  const eliminatedPlayers = players.length - activePlayers

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blockchainProcessed, setBlockchainProcessed] = useState(false);

  // Handle blockchain integration when game ends
  useEffect(() => {
    if (gameStatus === 'gameOver' && !blockchainProcessed) {
      handleGameEndBlockchain();
    }
  }, [gameStatus, winner, blockchainProcessed]);

  const handleGameEndBlockchain = async () => {
    if (blockchainProcessed) return;
    
    try {
      const isConnected = blockchainService.getConnectionStatus().isConnected;
      if (!isConnected) {
        console.log('Blockchain not connected, skipping blockchain integration');
        setBlockchainProcessed(true);
        return;
      }

      const isRegistered = await blockchainService.isUserRegistered();
      if (!isRegistered) {
        console.log('User not registered, skipping blockchain integration');
        setBlockchainProcessed(true);
        return;
      }

      // Calculate points and achievements based on game mode and result
      let vsAiPointsToAdd = 0;
      let achievementToUnlock = null;

      if (gameMode === 'ai') {
        if (winner && players.indexOf(winner) === 0) {
          // Player won against AI
          vsAiPointsToAdd = 50;
          achievementToUnlock = 'AI_VICTORY';
        } else if (winner && players.indexOf(winner) === 1) {
          // AI won, but player gets some points for playing
          vsAiPointsToAdd = 10;
        }
      } else if (gameMode === 'puzzle') {
        // Puzzle mode points (handled separately in puzzle store)
        return;
      }

      // Update game statistics
      const currentUserData = await blockchainService.loadUserData();
      const newGamesPlayed = (currentUserData?.gamesPlayed || 0) + 1;
      const newGamesWon = winner && players.indexOf(winner) === 0 ? 
        (currentUserData?.gamesWon || 0) + 1 : (currentUserData?.gamesWon || 0);
      
      await blockchainService.updateGameStats(newGamesPlayed, newGamesWon);
      
      // Add points if any were earned
      if (vsAiPointsToAdd > 0) {
        await blockchainService.addPoints(vsAiPointsToAdd, 0, 0);
        toast.success(`+${vsAiPointsToAdd} points earned!`);
      }

      // Unlock achievement if applicable
      if (achievementToUnlock) {
        try {
          await blockchainService.unlockAchievement(achievementToUnlock);
        } catch (error) {
          console.log('Achievement already unlocked or error:', error);
        }
      }

      setBlockchainProcessed(true);
    } catch (error) {
      console.error('Blockchain integration failed:', error);
      setBlockchainProcessed(true);
    }
  };

  return (
    <div className="relative h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Main Game Area */}
      <div className="absolute left-0 top-0 right-0 lg:pr-64 bottom-0 flex flex-col">
        {/* Mobile Sidebar Toggle */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 text-slate-300 hover:bg-slate-700/80 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800/70 to-slate-900/70 backdrop-blur-md border-b border-slate-700/50 shadow-lg p-3 sm:p-4 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-gradient">
                  Turn {turn}
                </h2>
                <div className="text-slate-400 text-xs sm:text-sm">
                  {activePlayers} players remaining
                </div>
              </div>
              
              {/* Current Player Indicator */}
              {players[currentPlayer] && !players[currentPlayer].eliminated && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50"
                >
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${getPlayerColor(currentPlayer).bg} border-2 ${getPlayerColor(currentPlayer).border} ${getPlayerColor(currentPlayer).glow} shadow-lg flex items-center justify-center`}>
                    <span className="text-white font-bold text-xs sm:text-sm">
                      {players[currentPlayer].name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs sm:text-sm">
                      {players[currentPlayer].name}'s Turn
                      {(gameMode === 'ai' || gameMode === 'learn') && currentPlayer === 1 && (
                        <span className="ml-1 sm:ml-2 text-xs bg-blue-500 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">AI</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">
                      Score: {getPlayerScore(currentPlayer)}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Game Status Indicator */}
              {gameStatus === 'playing' && activePlayers <= 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/50"
                >
                  <div className="text-yellow-400 font-semibold text-xs sm:text-sm">
                    🏆 Game Ending...
                  </div>
                </motion.div>
              )}

              {/* AI Turn Indicator */}
              {gameStatus === 'playing' && (gameMode === 'ai' || gameMode === 'learn') && currentPlayer === 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-3 sm:px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/50"
                >
                  <div className="text-blue-400 font-semibold text-xs sm:text-sm flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 bg-blue-400 rounded-full"
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    AI is thinking...
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              {gameMode === 'learn' && (
                <button
                  onClick={() => {
                    const { showNextCommentary } = useGameStore.getState()
                    showNextCommentary()
                  }}
                  className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                  disabled={gameStatus === 'gameOver'}
                >
                  💡 Hint
                </button>
              )}
              {canUndo() && gameMode !== 'learn' && (
                <button
                  onClick={handleUndo}
                  className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                  disabled={gameStatus === 'gameOver'}
                >
                  ↩️ Undo
                </button>
              )}
              <button
                onClick={handlePause}
                className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                disabled={gameStatus === 'gameOver'}
              >
                {gameStatus === 'paused' ? '▶️' : '⏸️'}
              </button>
              <button
                onClick={handleRestart}
                className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                🔄
              </button>
              <button
                onClick={handleMainMenu}
                className="btn btn-secondary text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
              >
                🏠
              </button>
            </div>
          </div>

          {/* Game Board */}
          <div className="flex-1 flex items-center justify-center overflow-hidden md:justify-start md:pl-4 min-h-0">
            {/* Commentary Display */}
            {gameMode === 'learn' && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-2xl mx-4 md:left-auto md:transform-none md:top-4 md:left-4"
              >
                <div className={`backdrop-blur-md rounded-xl border shadow-2xl p-4 ${
                  (useGameStore.getState().commentary.tipIndex === 999) 
                    ? 'bg-gradient-to-r from-green-600/95 to-blue-600/95 border-green-400/50' 
                    : 'bg-gradient-to-r from-purple-600/95 to-blue-600/95 border-purple-400/50'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {(useGameStore.getState().commentary.tipIndex === 999) ? '🎉' : '💡'}
                    </div>
                    <div>
                      <h3 className={`font-semibold text-sm mb-1 ${
                        (useGameStore.getState().commentary.tipIndex === 999) ? 'text-green-100' : 'text-white'
                      }`}>
                        {(useGameStore.getState().commentary.tipIndex === 999) ? 'Level Completed!' : 'Strategic Guidance'}
                      </h3>
                      <p className={`text-sm leading-relaxed ${
                        (useGameStore.getState().commentary.tipIndex === 999) ? 'text-green-50' : 'text-white/90'
                      }`}>
                        {useGameStore.getState().commentary.currentTip}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const { hideCommentary } = useGameStore.getState()
                        hideCommentary()
                      }}
                      className={`text-lg ml-2 ${
                        (useGameStore.getState().commentary.tipIndex === 999) ? 'text-green-200 hover:text-green-100' : 'text-white/70 hover:text-white'
                      }`}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div className="w-full max-w-full lg:max-w-none lg:flex-1 flex items-center justify-center p-8">
              <GameBoard 
                board={board}
                boardSize={boardSize}
                currentPlayer={currentPlayer}
                players={players}
                onCellClick={handleCellClick}
                gameMode={gameMode}
              />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-10"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed top-0 right-0 w-64 h-full bg-gradient-to-br from-slate-800/95 via-slate-900/90 to-slate-800/95 backdrop-blur-xl border-l border-slate-600/30 shadow-2xl overflow-y-auto flex-shrink-0 z-20 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}>
          {/* Mobile Close Button */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-full bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Players List */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <h3 className="text-lg font-bold text-blue-400 mb-4 px-4 pt-4 border-b border-slate-700/50 pb-2">
              Players
            </h3>
            <div className="space-y-3 px-4">
              {players.map((player, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  className={`relative p-3 rounded-xl border transition-all duration-300 ${
                    currentPlayer === index
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50 shadow-lg shadow-blue-500/20'
                      : 'bg-slate-800/50 border-slate-600/30 hover:border-slate-500/50 hover:bg-slate-700/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${
                      index === 0 ? 'bg-gradient-to-br from-red-500 to-red-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {index === 0 ? 'P' : 'A'}
                      {currentPlayer === index && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-200 truncate">
                        {index === 0 ? 'Player' : 'AI'}
                      </div>
                      <div className="text-xs text-slate-400">
                        Score: <span className="text-yellow-400 font-bold">{player.score}</span>
                      </div>
                    </div>
                  </div>
                  {player.eliminated && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Game Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6"
          >
            <h3 className="text-lg font-bold text-blue-400 mb-4 px-4 border-b border-slate-700/50 pb-2">
              Game Stats
            </h3>
            <div className="space-y-3 px-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-3 rounded-xl border border-slate-600/30"
              >
                <div className="text-sm text-slate-300 mb-1">Turn</div>
                <div className="text-xl font-bold text-white">{turn}</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-3 rounded-xl border border-slate-600/30"
              >
                <div className="text-sm text-slate-300 mb-1">Active Players</div>
                <div className="text-xl font-bold text-green-400">{activePlayers}</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-3 rounded-xl border border-slate-600/30"
              >
                <div className="text-sm text-slate-300 mb-1">Eliminated</div>
                <div className="text-xl font-bold text-red-400">{eliminatedPlayers}</div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.8 }}
                className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 p-3 rounded-xl border border-slate-600/30"
              >
                <div className="text-sm text-slate-300 mb-1">Board Size</div>
                <div className="text-lg font-bold text-blue-400">{boardSize.width} × {boardSize.height}</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="px-4 pb-4"
          >
            <h3 className="text-lg font-bold text-blue-400 mb-4 border-b border-slate-700/50 pb-2">
              Actions
            </h3>
            <div className="space-y-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUndo}
                disabled={!canUndo}
                className={`w-full p-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  canUndo
                    ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg hover:shadow-xl'
                    : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <span>Undo Move</span>
                </div>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRestart}
                className="w-full p-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-600/80 to-red-600/80 hover:from-orange-500 hover:to-red-500 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Restart Game</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Game Over Modal */}
        {gameStatus === 'gameOver' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="modal"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="modal-content"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-6 text-gradient">
                  {gameMode === 'learn' ? '🎓 Learning Complete!' : '🎉 Game Over!'}
                </h2>
                {winner ? (
                  <div className="mb-8">
                    <div className="text-lg text-slate-300 mb-4">
                      🏆 Winner:
                    </div>
                    <div className="flex items-center justify-center gap-4 p-6 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                      <div className={`w-16 h-16 rounded-full ${getPlayerColor(players.indexOf(winner)).bg} border-4 ${getPlayerColor(players.indexOf(winner)).border} shadow-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-xl">
                          {winner.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {winner.name}
                          {(gameMode === 'ai' || gameMode === 'learn') && players.indexOf(winner) === 1 && (
                            <span className="ml-2 text-sm bg-blue-500 px-2 py-1 rounded-full">AI</span>
                          )}
                          {gameMode === 'learn' && players.indexOf(winner) === 1 && (
                            <span className="ml-2 text-sm bg-purple-500 px-2 py-1 rounded-full">AI Teacher</span>
                          )}
                        </div>
                        <div className="text-yellow-400 font-medium">
                          Final Score: {getPlayerScore(players.indexOf(winner))}
                        </div>
                        {gameMode === 'ai' && (
                          <div className="text-sm text-slate-400 mt-1">
                            {players.indexOf(winner) === 1 ? 'AI Victory!' : 'Human Victory!'}
                          </div>
                        )}
                        {gameMode === 'learn' && (
                          <div className="text-sm text-slate-400 mt-1">
                            {players.indexOf(winner) === 1 ? 'Keep practicing!' : 'Excellent work!'}
                          </div>
                        )}
                        {gameMode === 'learn' && useGameStore.getState().levelProgress.levelCompleted && (
                          <div className="text-sm text-green-400 mt-1 font-semibold">
                            🎉 Level Completed Successfully!
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Learning Summary */}
                    {gameMode === 'learn' && useGameStore.getState().learningStats && (
                      <div className="mt-6 p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                        <h4 className="text-lg font-semibold text-purple-400 mb-3">📈 Your Performance Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{useGameStore.getState().learningStats.explosionsCreated}</div>
                            <div className="text-slate-300">Explosions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{useGameStore.getState().learningStats.chainReactionsTriggered}</div>
                            <div className="text-slate-300">Somnia Reactions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{useGameStore.getState().learningStats.maxChainLength}</div>
                            <div className="text-slate-300">Max Chain</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">{useGameStore.getState().learningStats.cornersControlled}/4</div>
                            <div className="text-slate-300">Corners</div>
                          </div>
                        </div>
                        {players.indexOf(winner) === 0 && (
                          <div className="mt-3 text-green-400 text-sm font-medium">
                            🎉 Level completed! You're ready for the next challenge!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center mb-8 text-slate-300">
                    🤝 It's a draw!
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleRestart}
                    className="btn btn-primary flex-1"
                  >
                    {gameMode === 'learn' ? '🔄 Try Again' : '🎮 Play Again'}
                  </button>
                  <button
                    onClick={handleMainMenu}
                    className="btn btn-secondary flex-1"
                  >
                    {gameMode === 'learn' ? '📚 Choose Level' : '🏠 Main Menu'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Pause Modal */}
        {gameStatus === 'paused' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="modal"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="modal-content"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-6 text-gradient">
                  ⏸️ Game Paused
                </h2>
                <p className="text-slate-300 mb-8">
                  Take a break! The game will resume right where you left off.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={resumeGame}
                    className="btn btn-primary flex-1"
                  >
                    ▶️ Resume
                  </button>
                  <button
                    onClick={handleMainMenu}
                    className="btn btn-secondary flex-1"
                  >
                    🏠 Main Menu
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Level Completion Screen */}
        {useGameStore.getState().levelCompletionScreen.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="modal"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="modal-content max-w-2xl"
            >
              <div className="text-center">
                {/* Celebration Header */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="text-6xl mb-4"
                >
                  ��
                </motion.div>
                
                <h2 className="text-4xl font-bold mb-2 text-gradient">
                  Level {useGameStore.getState().levelCompletionScreen.levelId} Complete!
                </h2>
                
                <p className="text-slate-300 mb-8 text-lg">
                  Congratulations! You've mastered this level's challenges.
                </p>

                {/* Performance Stats */}
                {useGameStore.getState().levelCompletionScreen.stats && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8 p-6 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-xl border border-green-500/30"
                  >
                    <h3 className="text-xl font-semibold text-green-400 mb-4">
                      📊 Your Performance
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400">
                          {useGameStore.getState().levelCompletionScreen.stats.explosionsCreated}
                        </div>
                        <div className="text-slate-300 text-sm">Explosions Created</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400">
                          {useGameStore.getState().levelCompletionScreen.stats.chainReactionsTriggered}
                        </div>
                        <div className="text-slate-300 text-sm">Somnia Reactions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400">
                          {useGameStore.getState().levelCompletionScreen.stats.maxChainLength}
                        </div>
                        <div className="text-slate-300 text-sm">Max Chain Length</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400">
                          {useGameStore.getState().levelCompletionScreen.stats.cornersControlled}/4
                        </div>
                        <div className="text-slate-300 text-sm">Corners Controlled</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <button
                    onClick={() => {
                      const { hideLevelCompletionScreen } = useGameStore.getState()
                      hideLevelCompletionScreen()
                      restartGame()
                    }}
                    className="btn btn-primary flex-1 text-lg py-4"
                  >
                    🔄 Play Again
                  </button>
                  <button
                    onClick={() => {
                      const { hideLevelCompletionScreen } = useGameStore.getState()
                      hideLevelCompletionScreen()
                      resetGame()
                      navigate('/learn')
                    }}
                    className="btn btn-secondary flex-1 text-lg py-4"
                  >
                    ⬆️ Next Level
                  </button>
                  <button
                    onClick={() => {
                      const { hideLevelCompletionScreen } = useGameStore.getState()
                      hideLevelCompletionScreen()
                      resetGame()
                      navigate('/')
                    }}
                    className="btn btn-secondary flex-1 text-lg py-4"
                  >
                    🏠 Home
                  </button>
                </motion.div>

                {/* Encouragement Message */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-slate-400 mt-6 text-sm"
                >
                  Ready for the next challenge? Keep learning and improving!
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default GameUI 