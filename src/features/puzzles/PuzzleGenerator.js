// Puzzle Generator for Somnia Reaction Game

export function generatePuzzle(category, difficulty) {
  // Basic puzzle generation logic
  const boardSizes = {
    beginner: { width: 4, height: 4 },
    intermediate: { width: 5, height: 5 },
    advanced: { width: 6, height: 6 },
    expert: { width: 7, height: 7 }
  }

  const moveLimits = {
    beginner: 3,
    intermediate: 5,
    advanced: 7,
    expert: 10
  }

  const boardSize = boardSizes[difficulty] || boardSizes.beginner
  const moveLimit = moveLimits[difficulty] || moveLimits.beginner

  // Generate a simple board with some initial orbs
  const board = Array(boardSize.height).fill().map(() => Array(boardSize.width).fill(0))
  
  // Add some initial orbs
  board[1][1] = 1 // Player 1
  board[2][2] = 2 // Player 2

  return {
    id: `generated_${category}_${difficulty}_${Date.now()}`,
    title: `${category.charAt(0).toUpperCase() + category.slice(1)} Challenge`,
    description: `Generated ${difficulty} level puzzle`,
    category,
    difficulty,
    boardSize,
    initialBoard: board,
    objectives: [
      { type: 'eliminate_opponent', target: 1, description: 'Eliminate all opponent orbs' }
    ],
    moveLimit
  }
}
