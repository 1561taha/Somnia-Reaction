// Puzzle Library for Somnia Reaction Game
export const PUZZLE_CATEGORIES = {
  TUTORIAL: 'tutorial',
  TACTICAL: 'tactical',
  STRATEGIC: 'strategic',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
}

// Sample puzzles data
const SAMPLE_PUZZLES = [
  {
    id: 'tutorial_001',
    title: 'First Steps',
    description: 'Learn the basics of Somnia Reaction',
    category: PUZZLE_CATEGORIES.TUTORIAL,
    difficulty: 'beginner',
    boardSize: { width: 4, height: 4 },
    initialBoard: [
      [0, 0, 0, 0],
      [0, 1, 2, 0],
      [0, 2, 1, 0],
      [0, 0, 0, 0]
    ],
    objectives: [
      { type: 'eliminate_opponent', target: 1, description: 'Eliminate all opponent orbs' }
    ],
    moveLimit: 3
  },
  {
    id: 'tactical_001',
    title: 'Tactical Challenge',
    description: 'Use strategy to win',
    category: PUZZLE_CATEGORIES.TACTICAL,
    difficulty: 'intermediate',
    boardSize: { width: 5, height: 5 },
    initialBoard: [
      [0, 0, 0, 0, 0],
      [0, 1, 0, 2, 0],
      [0, 0, 0, 0, 0],
      [0, 2, 0, 1, 0],
      [0, 0, 0, 0, 0]
    ],
    objectives: [
      { type: 'eliminate_opponent', target: 1, description: 'Eliminate all opponent orbs' }
    ],
    moveLimit: 5
  }
]

// Get puzzle by ID
export function getPuzzleById(id) {
  return SAMPLE_PUZZLES.find(puzzle => puzzle.id === id) || null
}

// Get puzzles by category
export function getPuzzlesByCategory(category) {
  return SAMPLE_PUZZLES.filter(puzzle => puzzle.category === category)
}

// Get puzzles by difficulty
export function getPuzzlesByDifficulty(difficulty) {
  return SAMPLE_PUZZLES.filter(puzzle => puzzle.difficulty === difficulty)
}

// Get all puzzles
export function getAllPuzzles() {
  return SAMPLE_PUZZLES
}
