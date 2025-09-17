// Puzzle Types and Definitions
import { PuzzleEngine } from '../../core/puzzle/PuzzleEngine'

const puzzleEngine = new PuzzleEngine()

export const PUZZLE_CATEGORIES = {
  ELIMINATION: 'elimination',
  TERRITORY: 'territory',
  CHAIN_REACTION: 'chain_reaction',
  SURVIVAL: 'survival',
  EFFICIENCY: 'efficiency',
  TIMING: 'timing',
  CORNERS: 'corners',
  EXPLOSIONS: 'explosions',
  MIXED: 'mixed'
}

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert'
}

// Puzzle template structure
export const createPuzzleTemplate = (config) => ({
  id: config.id,
  title: config.title,
  description: config.description,
  category: config.category,
  difficulty: config.difficulty,
  boardSize: config.boardSize,
  moveLimit: config.moveLimit,
  objectives: config.objectives,
  initialBoard: config.initialBoard,
  players: config.players,
  hints: config.hints || [],
  solution: config.solution || [],
  tags: config.tags || [],
  rating: config.rating || 0,
  playCount: config.playCount || 0,
  completionRate: config.completionRate || 0,
  averageMoves: config.averageMoves || 0,
  bestSolution: config.bestSolution || null,
  createdAt: config.createdAt || Date.now(),
  updatedAt: config.updatedAt || Date.now()
})

// Sample puzzle data structure
export const SAMPLE_PUZZLE = createPuzzleTemplate({
  id: 'puzzle_001',
  title: 'First Steps',
  description: 'Learn the basics of Somnia Reaction with this simple elimination puzzle',
  category: PUZZLE_CATEGORIES.ELIMINATION,
  difficulty: DIFFICULTY_LEVELS.BEGINNER,
  boardSize: { width: 4, height: 4 },
  moveLimit: 3,
  objectives: [
    {
      type: puzzleEngine.objectiveTypes.ELIMINATE_OPPONENT,
      description: 'Eliminate the red opponent',
      target: 1,
      completed: false
    }
  ],
  initialBoard: [
    [
      { orbs: 0, owner: null, criticalMass: 2, exploding: false },
      { orbs: 0, owner: null, criticalMass: 3, exploding: false },
      { orbs: 0, owner: null, criticalMass: 3, exploding: false },
      { orbs: 0, owner: null, criticalMass: 2, exploding: false }
    ],
    [
      { orbs: 0, owner: null, criticalMass: 3, exploding: false },
      { orbs: 1, owner: 0, criticalMass: 4, exploding: false },
      { orbs: 1, owner: 1, criticalMass: 4, exploding: false },
      { orbs: 0, owner: null, criticalMass: 3, exploding: false }
    ],
    [
      { orbs: 0, owner: null, criticalMass: 3, exploding: false },
      { orbs: 1, owner: 1, criticalMass: 4, exploding: false },
      { orbs: 1, owner: 0, criticalMass: 4, exploding: false },
      { orbs: 0, owner: null, criticalMass: 3, exploding: false }
    ],
    [
      { orbs: 0, owner: null, criticalMass: 2, exploding: false },
      { orbs: 0, owner: null, criticalMass: 3, exploding: false },
      { orbs: 0, owner: null, criticalMass: 3, exploding: false },
      { orbs: 0, owner: null, criticalMass: 2, exploding: false }
    ]
  ],
  players: [
    { name: 'Player', color: 'blue', isAI: false },
    { name: 'Opponent', color: 'red', isAI: true }
  ],
  hints: [
    'Start by controlling the center',
    'Use chain reactions to your advantage',
    'Think about the critical mass of each cell'
  ],
  solution: [
    { x: 1, y: 1, description: 'Place orb in center to create chain reaction' },
    { x: 2, y: 2, description: 'Continue the chain to eliminate opponent' }
  ],
  tags: ['beginner', 'elimination', 'chain-reaction'],
  rating: 4.5,
  playCount: 1250,
  completionRate: 85,
  averageMoves: 2.3,
  bestSolution: { moves: 2, player: 'Player123' }
})

// Puzzle categories with descriptions
export const PUZZLE_CATEGORY_INFO = {
  [PUZZLE_CATEGORIES.ELIMINATION]: {
    name: 'Elimination',
    description: 'Eliminate all opponents to win',
    icon: '💀',
    color: '#ef4444'
  },
  [PUZZLE_CATEGORIES.TERRITORY]: {
    name: 'Territory Control',
    description: 'Control a percentage of the board',
    icon: '🗺️',
    color: '#3b82f6'
  },
  [PUZZLE_CATEGORIES.CHAIN_REACTION]: {
    name: 'Somnia Reactions',
    description: 'Create spectacular chain reactions',
    icon: '⚡',
    color: '#f59e0b'
  },
  [PUZZLE_CATEGORIES.SURVIVAL]: {
    name: 'Survival',
    description: 'Survive for a number of turns',
    icon: '🛡️',
    color: '#10b981'
  },
  [PUZZLE_CATEGORIES.EFFICIENCY]: {
    name: 'Efficiency',
    description: 'Complete objectives with minimal moves',
    icon: '⚡',
    color: '#8b5cf6'
  },
  [PUZZLE_CATEGORIES.TIMING]: {
    name: 'Timing',
    description: 'Complete objectives within time limits',
    icon: '⏱️',
    color: '#ec4899'
  },
  [PUZZLE_CATEGORIES.CORNERS]: {
    name: 'Corner Capture',
    description: 'Capture strategic corner positions',
    icon: '🔲',
    color: '#06b6d4'
  },
  [PUZZLE_CATEGORIES.EXPLOSIONS]: {
    name: 'Explosions',
    description: 'Maximize explosion count',
    icon: '💥',
    color: '#f97316'
  },
  [PUZZLE_CATEGORIES.MIXED]: {
    name: 'Mixed Challenges',
    description: 'Combination of multiple objectives',
    icon: '🎯',
    color: '#6366f1'
  }
}

// Difficulty level info
export const DIFFICULTY_INFO = {
  [DIFFICULTY_LEVELS.BEGINNER]: {
    name: 'Beginner',
    description: 'Learn the basics',
    color: '#10b981',
    icon: '🌱',
    moveRange: [3, 5],
    objectiveRange: [1, 2]
  },
  [DIFFICULTY_LEVELS.EASY]: {
    name: 'Easy',
    description: 'Simple strategies',
    color: '#3b82f6',
    icon: '📚',
    moveRange: [5, 8],
    objectiveRange: [2, 3]
  },
  [DIFFICULTY_LEVELS.MEDIUM]: {
    name: 'Medium',
    description: 'Strategic thinking',
    color: '#f59e0b',
    icon: '🎯',
    moveRange: [8, 12],
    objectiveRange: [3, 4]
  },
  [DIFFICULTY_LEVELS.HARD]: {
    name: 'Hard',
    description: 'Advanced tactics',
    color: '#ef4444',
    icon: '🔥',
    moveRange: [12, 18],
    objectiveRange: [4, 5]
  },
  [DIFFICULTY_LEVELS.EXPERT]: {
    name: 'Expert',
    description: 'Master challenges',
    color: '#8b5cf6',
    icon: '👑',
    moveRange: [18, 25],
    objectiveRange: [5, 8]
  }
}

// Board size presets
export const BOARD_SIZE_PRESETS = {
  SMALL: { width: 4, height: 4, name: 'Small (4×4)' },
  MEDIUM: { width: 6, height: 4, name: 'Medium (6×4)' },
  STANDARD: { width: 6, height: 6, name: 'Standard (6×6)' },
  LARGE: { width: 8, height: 6, name: 'Large (8×6)' },
  XL: { width: 8, height: 8, name: 'XL (8×8)' },
  XXL: { width: 10, height: 8, name: 'XXL (10×8)' }
}

// Helper functions
export const getPuzzleCategoryInfo = (category) => {
  return PUZZLE_CATEGORY_INFO[category] || PUZZLE_CATEGORY_INFO[PUZZLE_CATEGORIES.MIXED]
}

export const getDifficultyInfo = (difficulty) => {
  return DIFFICULTY_INFO[difficulty] || DIFFICULTY_INFO[DIFFICULTY_LEVELS.MEDIUM]
}

export const getBoardSizeInfo = (boardSize) => {
  const sizeKey = Object.keys(BOARD_SIZE_PRESETS).find(key => {
    const preset = BOARD_SIZE_PRESETS[key]
    return preset.width === boardSize.width && preset.height === boardSize.height
  })
  return BOARD_SIZE_PRESETS[sizeKey] || { name: `${boardSize.width}×${boardSize.height}` }
}

export const calculatePuzzleStats = (puzzle) => {
  const difficultyScore = puzzleEngine.calculateDifficulty(
    puzzle.objectives,
    puzzle.boardSize,
    puzzle.moveLimit
  )
  const difficultyLevel = puzzleEngine.getDifficultyLevel(difficultyScore)
  
  return {
    difficultyScore,
    difficultyLevel,
    estimatedTime: Math.ceil(puzzle.moveLimit * 0.5), // minutes
    complexity: Math.ceil(difficultyScore / 10)
  }
} 