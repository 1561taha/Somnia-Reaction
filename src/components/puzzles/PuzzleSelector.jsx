import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePuzzleStore } from '../../stores/puzzleStore'
import { PUZZLE_CATEGORIES, getPuzzlesByCategory } from '../../features/puzzles/PuzzleLibrary'

const PuzzleSelector = () => {
  const navigate = useNavigate()
  const { getCategoryStats, getAvailablePuzzles, loadPuzzle } = usePuzzleStore()
  const [selectedCategory, setSelectedCategory] = useState(PUZZLE_CATEGORIES.TUTORIAL)
  const [selectedDifficulty, setSelectedDifficulty] = useState(null)

  const categories = [
    {
      id: PUZZLE_CATEGORIES.TUTORIAL,
      title: 'Tutorial',
      description: 'Learn the basics with guided puzzles',
      icon: '🎓',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: PUZZLE_CATEGORIES.TACTICAL,
      title: 'Tactical',
      description: 'Master specific tactics and combinations',
      icon: '⚔️',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: PUZZLE_CATEGORIES.STRATEGIC,
      title: 'Strategic',
      description: 'Develop long-term strategic thinking',
      icon: '🧠',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: PUZZLE_CATEGORIES.ADVANCED,
      title: 'Advanced',
      description: 'Challenge yourself with complex scenarios',
      icon: '🔥',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: PUZZLE_CATEGORIES.EXPERT,
      title: 'Expert',
      description: 'Master-level challenges for experts',
      icon: '👑',
      color: 'from-yellow-500 to-orange-500'
    }
  ]

  const difficulties = [
    { value: null, label: 'All Difficulties', color: 'from-gray-500 to-gray-600' },
    { value: 1, label: 'Beginner', color: 'from-green-500 to-green-600' },
    { value: 2, label: 'Easy', color: 'from-blue-500 to-blue-600' },
    { value: 3, label: 'Medium', color: 'from-yellow-500 to-yellow-600' },
    { value: 4, label: 'Hard', color: 'from-orange-500 to-orange-600' },
    { value: 5, label: 'Expert', color: 'from-red-500 to-red-600' }
  ]

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId)
    setSelectedDifficulty(null) // Reset difficulty filter
  }

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty)
  }

  const handlePuzzleSelect = (puzzleId) => {
    const success = loadPuzzle(puzzleId)
    if (success) {
      navigate('/puzzle-game')
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  const getPuzzlesForDisplay = () => {
    const puzzles = getAvailablePuzzles(selectedCategory, selectedDifficulty)
    return puzzles.sort((a, b) => a.difficulty - b.difficulty)
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

  const categoryStats = getCategoryStats(selectedCategory)
  const puzzles = getPuzzlesForDisplay()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-2 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          {/* Back to Main Menu Button */}
          <div className="flex justify-start mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
            >
              <span>←</span>
              Back to Main Menu
            </motion.button>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gradient mb-3 sm:mb-4">
            Puzzle Mode
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto px-2">
            Master Somnia Reaction through strategic puzzles and challenges
          </p>
        </motion.div>

        {/* Category Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {categories.map((category, index) => {
              const stats = getCategoryStats(category.id)
              const isSelected = selectedCategory === category.id
              
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`
                    p-3 sm:p-4 rounded-xl text-left transition-all duration-300
                    bg-gradient-to-br ${category.color}
                    ${isSelected ? 'ring-2 ring-white shadow-lg' : 'hover:shadow-lg'}
                  `}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="text-xl sm:text-2xl">{category.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-base sm:text-lg">{category.title}</h3>
                      <p className="text-white/80 text-xs sm:text-sm">{category.description}</p>
                    </div>
                  </div>
                  <div className="text-white/90 text-xs sm:text-sm">
                    {stats.completed}/{stats.total} completed
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5 sm:h-2 mt-2">
                    <div 
                      className="bg-white rounded-full h-1.5 sm:h-2 transition-all duration-300"
                      style={{ width: `${stats.completionRate}%` }}
                    />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* Difficulty Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8"
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Difficulty Filter</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {difficulties.map((difficulty, index) => (
              <motion.button
                key={difficulty.value}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDifficultySelect(difficulty.value)}
                className={`
                  px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-300 text-sm sm:text-base
                  bg-gradient-to-r ${difficulty.color}
                  ${selectedDifficulty === difficulty.value 
                    ? 'ring-2 ring-white shadow-lg' 
                    : 'hover:shadow-md'
                  }
                `}
              >
                {difficulty.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Puzzles List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Puzzles
            </h3>
            <div className="text-slate-400 text-sm sm:text-base">
              {puzzles.length} puzzle{puzzles.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {puzzles.map((puzzle, index) => (
              <motion.div
                key={puzzle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handlePuzzleSelect(puzzle.id)}
                className={`
                  glass p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-300
                  ${puzzle.completed ? 'ring-2 ring-green-500' : ''}
                  hover:shadow-lg
                `}
              >
                <div className="flex justify-between items-start mb-2 sm:mb-3">
                  <h4 className="font-bold text-white text-base sm:text-lg">{puzzle.title}</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(puzzle.difficulty)} bg-slate-700/50`}>
                    {getDifficultyLabel(puzzle.difficulty)}
                  </div>
                </div>
                
                <p className="text-slate-300 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
                  {puzzle.objective}
                </p>
                
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Moves: {puzzle.maxMoves}</span>
                  <span>Board: {puzzle.boardSize.width}×{puzzle.boardSize.height}</span>
                </div>
                
                {puzzle.completed && (
                  <div className="absolute top-2 right-2 text-green-400">
                    ✓
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={handleBack}
            className="btn-secondary px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold"
          >
            ← Back to Menu
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default PuzzleSelector 