import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const Help = () => {
  const navigate = useNavigate()

  const sections = [
    {
      title: '🎯 Objective',
      content: 'Eliminate all other players by controlling territory and triggering chain reactions. The last player standing wins!',
      items: []
    },
    {
      title: '🎮 How to Play',
      content: '',
      items: [
        'On your turn, click any empty cell or a cell you already own to place an orb of your color.',
        'Each cell has a critical mass: 2 (corners), 3 (edges), 4 (center).',
        'When a cell reaches its critical mass, it explodes, sending one orb to each neighboring cell.',
        'Explosions convert neighboring cells to your color and can trigger chain reactions.',
        'Chain reactions occur when neighboring cells also reach critical mass from the explosion.',
        'You capture territory by converting enemy or empty cells to your color through explosions.',
        'A player is eliminated when they have no orbs left on the board after the early game phase.',
        'The last player remaining wins the game.'
      ]
    },
    {
      title: '⚡ Game Mechanics',
      content: '',
      items: [
        'Each player has a unique color for their orbs (Red, Blue, Green, Yellow, Purple, Pink, Orange, Cyan)',
        'Orbs accumulate in cells when placed or distributed from explosions',
        'Critical mass is fixed: 2 for corners, 3 for edges, 4 for center cells',
        'Neighboring cells are those directly adjacent (up, down, left, right)',
        'Chain reactions continue until no more cells can explode',
        'Territory is controlled by the player who owns the orbs in a cell',
        'Players cannot be eliminated in the very early game (first few moves)',
        'Explosions happen asynchronously with visual animations showing orb movement'
      ]
    },
    {
      title: '🏆 Strategy Tips',
      content: '',
      items: [
        'Plan your moves to create chain reactions that benefit you',
        'Control key positions on the board, especially center areas',
        'Watch for opportunities to eliminate opponents through strategic explosions',
        'Don\'t overextend - protect your territory from enemy attacks',
        'Use chain reactions to capture multiple cells at once',
        'Pay attention to cells close to critical mass (they pulse red)',
        'Consider the board layout and plan multiple moves ahead',
        'In corners, you only need 2 orbs to explode - use this strategically',
        'Block enemy chain reactions by placing orbs in their path'
      ]
    },
    {
      title: '🎲 Game Modes',
      content: '',
      items: [
        'Local Multiplayer: 2-8 players on the same device with customizable board sizes (6×4 to 12×10)',
        'VS AI: Challenge our advanced AI with 5 difficulty levels (Beginner to Expert)',
        'Play & Learn: Guided gameplay with commentary and level-based learning',
        'Online Multiplayer: Coming soon - play with friends online'
      ]
    },
    {
      title: '🎮 AI Features',
      content: '',
      items: [
        'Beginner: Simple moves with 30% randomness and 40% mistakes',
        'Easy: Basic strategy with 20% randomness and 20% mistakes',
        'Medium: Balanced gameplay with 10% randomness and 10% mistakes',
        'Hard: Advanced strategy with 5% randomness and 5% mistakes',
        'Expert: Chess-like strategic thinking with no randomness or mistakes',
        'AI shows thinking indicator and move preview',
        'AI uses minimax algorithm with territory evaluation'
      ]
    },
    {
      title: '🎓 Learning Mode',
      content: '',
      items: [
        'Guided gameplay with strategic commentary',
        'Level-based progression with specific objectives',
        'Real-time hints and move suggestions',
        'Educational content about game strategies',
        'Progress tracking and completion rewards',
        'Commentary appears before each player move',
        'Level completion screen with next level option'
      ]
    },
    {
      title: '⌨️ Controls',
      content: '',
      items: [
        'Mouse Click: Place orb on cell',
        'P: Pause/Resume game',
        'R: Restart current game',
        'Esc: Return to main menu',
        '↩️ Undo: Undo last move (not available in learning mode)',
        'Touch: Works on mobile and tablet devices',
        'Show Hint: Get strategic advice (learning mode only)'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gradient mb-2 sm:mb-4">
            How to Play
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Master the art of chain reactions and strategic territory control
          </p>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-4 sm:space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-4 sm:p-6"
            >
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
                {section.title}
              </h2>
              {section.content && (
                <p className="text-slate-300 text-sm sm:text-base mb-3 sm:mb-4 leading-relaxed">
                  {section.content}
                </p>
              )}
              {section.items.length > 0 && (
                <ul className="space-y-2 sm:space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 sm:gap-3">
                      <span className="text-blue-400 text-xs sm:text-sm mt-1 flex-shrink-0">•</span>
                      <span className="text-slate-300 text-sm sm:text-base leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>

        {/* Visual Examples */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-4 sm:p-6 mt-6"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
            🎯 Visual Examples
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Critical Mass */}
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-medium text-white mb-2 sm:mb-3">Critical Mass</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-700 rounded-lg border-2 border-red-500 flex items-center justify-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                      2
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">Corner (2)</p>
                
                <div className="flex justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-700 rounded-lg border-2 border-yellow-500 flex items-center justify-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                      3
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">Edge (3)</p>
                
                <div className="flex justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-700 rounded-lg border-2 border-green-500 flex items-center justify-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                      4
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-400">Center (4)</p>
              </div>
            </div>

            {/* Explosion Example */}
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-medium text-white mb-2 sm:mb-3">Explosion</h3>
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-700 rounded-lg border-2 border-red-500 flex items-center justify-center mb-2 mx-auto animate-pulse">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  4
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">Ready to explode</p>
              <div className="text-xs text-slate-500 mt-2">
                Sends 1 orb to each neighbor
              </div>
            </div>

            {/* Territory Control */}
            <div className="text-center">
              <h3 className="text-base sm:text-lg font-medium text-white mb-2 sm:mb-3">Territory Control</h3>
              <div className="grid grid-cols-3 gap-1 max-w-xs mx-auto">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700 rounded-lg border-2 border-blue-500 flex items-center justify-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full"></div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700 rounded-lg border-2 border-red-500 flex items-center justify-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700 rounded-lg border-2 border-green-500 flex items-center justify-center">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">Different player territories</p>
            </div>
          </div>
        </motion.div>

        {/* Board Size Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card p-4 sm:p-6 mt-6"
        >
          <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
            📏 Board Sizes
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-2 sm:p-3 bg-slate-700/30 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-blue-400">6×4</div>
              <div className="text-xs sm:text-sm text-slate-400">Small</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-slate-700/30 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-blue-400">6×6</div>
              <div className="text-xs sm:text-sm text-slate-400">Medium</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-slate-700/30 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-blue-400">8×6</div>
              <div className="text-xs sm:text-sm text-slate-400">Standard</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-slate-700/30 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-blue-400">8×8</div>
              <div className="text-xs sm:text-sm text-slate-400">Large</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-slate-700/30 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-blue-400">10×8</div>
              <div className="text-xs sm:text-sm text-slate-400">XL</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-slate-700/30 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-blue-400">12×10</div>
              <div className="text-xs sm:text-sm text-slate-400">XXL</div>
            </div>
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-6 sm:mt-8"
        >
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            ← Back to Main Menu
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default Help 