import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useState, useEffect } from 'react'
import blockchainService from '../services/blockchainService.js'

const MainMenu = () => {
  const navigate = useNavigate()
  const { resetGame } = useGame()
  const [blockchainStatus, setBlockchainStatus] = useState({ isConnected: false, userData: null })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkBlockchainStatus()
    
    // Refresh blockchain status when user returns to main menu (after playing games)
    const handleFocus = () => {
      checkBlockchainStatus()
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const checkBlockchainStatus = async () => {
    try {
      const status = blockchainService.getConnectionStatus()
      if (status.isConnected) {
        // Check if user is registered first
        const isRegistered = await blockchainService.isUserRegistered()
        if (isRegistered) {
          // Load fresh user data
          const userData = await blockchainService.loadUserData()
          setBlockchainStatus({
            ...status,
            userData
          })
        } else {
          // User is connected but not registered
          setBlockchainStatus({
            ...status,
            userData: null
          })
        }
      } else {
        setBlockchainStatus(status)
      }
    } catch (error) {
      console.error('Failed to check blockchain status:', error)
      setBlockchainStatus({ isConnected: false, userData: null })
    } finally {
      setIsLoading(false)
    }
  }

  const menuItems = [
    {
      title: 'Local Multiplayer',
      description: 'Play with friends on the same device',
      icon: '👥',
      path: '/local',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'VS AI',
      description: 'Challenge our advanced AI opponent',
      icon: '🤖',
      path: '/ai',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Puzzle Mode',
      description: 'Solve strategic puzzles and challenges',
      icon: '🧩',
      path: '/puzzles',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Online Multiplayer',
      description: 'Play with players worldwide',
      icon: '🌐',
      path: '/online',
      color: 'from-indigo-500 to-purple-500',
      requiresBlockchain: true
    },
    {
      title: 'Social Hub',
      description: 'Connect with friends and find players',
      icon: '👥',
      path: '/social',
      color: 'from-teal-500 to-cyan-500',
      requiresBlockchain: true
    },
    {
      title: 'Profile & Achievements',
      description: 'View your stats and unlock achievements',
      icon: '🏆',
      path: '/profile',
      color: 'from-yellow-500 to-orange-500',
      requiresBlockchain: true
    },
    {
      title: 'Settings',
      description: 'Customize your game experience',
      icon: '⚙️',
      path: '/settings',
      color: 'from-slate-500 to-gray-500'
    },
    {
      title: 'Help',
      description: 'Learn how to play and strategies',
      icon: '❓',
      path: '/help',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const handleMenuClick = (path) => {
    resetGame()
    navigate(path)
  }

  const handleBlockchainConnect = async () => {
    try {
      const success = await blockchainService.initialize()
      if (success) {
        // Check if user is registered
        const isRegistered = await blockchainService.isUserRegistered()
        if (!isRegistered) {
          // User is connected but not registered, redirect to registration
          navigate('/register')
        } else {
          // User is registered, update status
          await checkBlockchainStatus()
        }
      }
    } catch (error) {
      console.error('Failed to connect to blockchain:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-gradient mb-3 sm:mb-4">
            Somnia Reaction
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto px-4">
            Strategic multiplayer game where every move can trigger spectacular chain reactions
          </p>
        </motion.div>

        {/* Blockchain Status */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex justify-center"
          >
            {blockchainStatus.isConnected ? (
              <div className="flex flex-col items-center space-y-3">
                {blockchainStatus.userData ? (
                  // User is connected and registered
                  <div className="flex items-center space-x-4 bg-green-900/20 border border-green-500/30 rounded-lg px-4 py-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">
                      Connected to Somnia Network
                    </span>
                    <span className="text-green-300 text-sm">
                      • {blockchainStatus.userData.nickname}
                    </span>
                  </div>
                ) : (
                  // User is connected but not registered
                  <div className="flex items-center space-x-4 bg-orange-900/20 border border-orange-500/30 rounded-lg px-4 py-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-orange-400 text-sm">
                      Wallet connected but not registered
                    </span>
                    <button
                      onClick={() => navigate('/register')}
                      className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                    >
                      Register
                    </button>
                  </div>
                )}
                
                {/* User Stats */}
                {blockchainStatus.userData && (
                  <div className="bg-slate-800/50 border border-slate-600/50 rounded-lg p-4 w-full max-w-md">
                    <h3 className="text-white font-semibold mb-3 text-center">Your Stats</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-400">
                          {blockchainStatus.userData.vsAiPoints || 0}
                        </div>
                        <div className="text-xs text-slate-400">VS AI Points</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-400">
                          {blockchainStatus.userData.puzzlePoints || 0}
                        </div>
                        <div className="text-xs text-slate-400">Puzzle Points</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-400">
                          {blockchainStatus.userData.totalPoints || 0}
                        </div>
                        <div className="text-xs text-slate-400">Total Points</div>
                      </div>
                    </div>
                    <div className="mt-3 text-center text-sm text-slate-400">
                      Games: {blockchainStatus.userData.gamesPlayed || 0} • 
                      Wins: {blockchainStatus.userData.gamesWon || 0}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg px-4 py-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-400 text-sm">
                  Connect wallet for full features
                </span>
                <button
                  onClick={handleBlockchainConnect}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                >
                  Connect
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 px-2 sm:px-0">
          {menuItems.map((item, index) => {
            const isDisabled = item.requiresBlockchain && !blockchainStatus.isConnected
            
            return (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                whileTap={{ scale: isDisabled ? 1 : 0.98 }}
              >
                <button
                  onClick={() => !isDisabled && handleMenuClick(item.path)}
                  disabled={isDisabled}
                  className={`
                    w-full p-4 sm:p-6 rounded-xl sm:rounded-2xl text-left transition-all duration-300
                    bg-gradient-to-br ${item.color} hover:shadow-xl
                    ${isDisabled 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-105 cursor-pointer'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="text-3xl sm:text-4xl">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-white mb-1 truncate">
                        {item.title}
                      </h3>
                      <p className="text-white/80 text-xs sm:text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    {isDisabled && (
                      <div className="text-white/60 text-xs sm:text-sm flex-shrink-0">
                        Connect Wallet
                      </div>
                    )}
                  </div>
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Registration Prompt */}
        {blockchainStatus.isConnected && !blockchainStatus.userData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center"
          >
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm mb-3">
                Complete your registration to unlock all features
              </p>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Register Now
              </button>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-8 sm:mt-12 text-slate-500 px-4"
        >
          <p className="text-xs sm:text-sm">
            Built with React, Framer Motion, and Tailwind CSS • Powered by Somnia Network
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default MainMenu 