// Puzzle Library - Mix of Static and Dynamic AI Opponents
// Progressive learning from basic to advanced

export const PUZZLE_CATEGORIES = {
  TUTORIAL: 'tutorial',
  TACTICAL: 'tactical', 
  STRATEGIC: 'strategic',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
}

export const OPPONENT_TYPES = {
  STATIC: 'static',
  AI: 'ai'
}

// Helper function to create board state
const createBoard = (width, height, initialOrbs = []) => {
  const board = []
  for (let y = 0; y < height; y++) {
    board[y] = []
    for (let x = 0; x < width; x++) {
      const cell = {
        orbs: 0,
        owner: null,
        criticalMass: getCriticalMass(x, y, width, height),
        exploding: false
      }
      board[y][x] = cell
    }
  }
  
  // Set initial orbs
  initialOrbs.forEach(({ x, y, orbs, owner }) => {
    board[y][x].orbs = orbs
    board[y][x].owner = owner
  })
  
  return board
}

const getCriticalMass = (x, y, width, height) => {
  const isCorner = (x === 0 || x === width - 1) && (y === 0 || y === height - 1)
  const isEdge = (x === 0 || x === width - 1 || y === 0 || y === height - 1)
  
  if (isCorner) return 2
  if (isEdge) return 3
  return 4
}

// Tutorial Puzzles - Static opponents, basic concepts
export const TUTORIAL_PUZZLES = [
  {
    id: 'tutorial_001',
    title: 'First Steps',
    category: PUZZLE_CATEGORIES.TUTORIAL,
    difficulty: 1,
    opponentType: OPPONENT_TYPES.STATIC,
    boardSize: { width: 6, height: 4 },
    objective: 'Learn basic chain reactions - Create an explosion in 1 move',
    maxMoves: 1,
    initialBoard: createBoard(6, 4, [
      { x: 2, y: 1, orbs: 3, owner: 0 }, // Player cell ready to explode
      { x: 3, y: 1, orbs: 2, owner: 1 }, // Opponent cell
      { x: 2, y: 2, orbs: 1, owner: 1 }  // Opponent cell
    ]),
    opponentMoves: [], // No opponent moves in tutorial
    solution: [{ x: 2, y: 1 }],
    hints: [
      'Look for cells that are close to their critical mass',
      'The cell with 3 orbs is ready to explode!'
    ],
    explanation: 'This puzzle teaches the basic concept of chain reactions. When a cell reaches its critical mass, it explodes and distributes orbs to neighboring cells.',
    rating: 4.8,
    attempts: 0,
    successRate: 0.0
  },
  
  {
    id: 'tutorial_002', 
    title: 'Strategic Capture',
    category: PUZZLE_CATEGORIES.TUTORIAL,
    difficulty: 2,
    opponentType: OPPONENT_TYPES.STATIC,
    boardSize: { width: 6, height: 4 },
    objective: 'Capture exactly 3 opponent cells in 2 moves using strategic positioning',
    maxMoves: 2,
    initialBoard: createBoard(6, 4, [
      { x: 2, y: 1, orbs: 3, owner: 0 }, // Player cell (BLUE) ready to explode
      { x: 3, y: 1, orbs: 2, owner: 1 }, // Opponent cell (RED) needs 1 more orb
      { x: 3, y: 2, orbs: 1, owner: 1 }, // Opponent cell (RED) weak
      { x: 2, y: 2, orbs: 1, owner: 1 }  // Opponent cell (RED) weak - 3rd cell
    ]),
    opponentMoves: [], // No opponent moves in this puzzle
    solution: [
      { x: 2, y: 1 }, // First move: explode and capture 2 opponent cells
      { x: 3, y: 1 }  // Second move: capture the remaining opponent cell
    ],
    hints: [
      'You have a cell ready to explode! Use it strategically',
      'The first explosion should capture 2 opponent cells',
      'Use your second move to capture the remaining opponent cell'
    ],
    explanation: 'This puzzle teaches strategic positioning. Your first cell is ready to explode and can capture 2 opponent cells. Use your second move to capture the remaining opponent cell.',
    rating: 4.6,
    attempts: 0,
    successRate: 0.0
  },
  
  {
    id: 'tutorial_003',
    title: 'Somnia Reaction Mastery',
    category: PUZZLE_CATEGORIES.TUTORIAL,
    difficulty: 3,
    opponentType: OPPONENT_TYPES.STATIC,
    boardSize: { width: 6, height: 4 },
    objective: 'Create a chain reaction to eliminate all opponent cells in exactly 3 moves',
    maxMoves: 3,
    initialBoard: createBoard(6, 4, [
      { x: 2, y: 1, orbs: 3, owner: 0 }, // Player cell ready to explode
      { x: 3, y: 1, orbs: 1, owner: 0 }, // Player cell
      { x: 1, y: 1, orbs: 1, owner: 1 }, // Opponent cell
      { x: 4, y: 1, orbs: 1, owner: 1 }, // Opponent cell
      { x: 2, y: 2, orbs: 1, owner: 1 }, // Opponent cell
      { x: 3, y: 2, orbs: 1, owner: 1 }, // Opponent cell
       // Opponent cell
    ]),
    opponentMoves: [], // No opponent moves - static puzzle
    solution: [
      { x: 2, y: 1 }, // First move: explode and capture 2 opponent cells
      { x: 3, y: 1 }, // Second move: add orb to create chain reaction
      { x: 1, y: 1 }  // Third move: capture remaining opponent cells
    ],
    hints: [
      'Start by exploding your cell that\'s ready to explode',
      'The first explosion should capture 2 opponent cells',
      'Use your remaining moves to create a chain reaction and eliminate all opponents'
    ],
    explanation: 'This puzzle teaches chain reactions. Start with an explosion that captures multiple opponent cells, then use your remaining moves to create a chain reaction that eliminates all opponents.',
    rating: 4.7,
    attempts: 0,
    successRate: 0.0
  },
  {
    id: 'tutorial_004',
    title: 'AI Challenge',
    category: PUZZLE_CATEGORIES.TUTORIAL,
    difficulty: 3,
    opponentType: OPPONENT_TYPES.AI,
    boardSize: { width: 6, height: 4 },
    objective: 'Defeat the AI opponent by eliminating all their cells in 4 moves',
    maxMoves: 4,
    initialBoard: createBoard(6, 4, [
      { x: 2, y: 1, orbs: 2, owner: 0 }, // Player cell (reduced from 3 to 2)
      { x: 3, y: 1, orbs: 1, owner: 0 }, // Player cell
      { x: 1, y: 1, orbs: 2, owner: 1 }, // AI opponent cell (increased from 1 to 2)
      { x: 4, y: 1, orbs: 1, owner: 1 }, // AI opponent cell
      { x: 2, y: 2, orbs: 1, owner: 1 }, // AI opponent cell
      { x: 3, y: 2, orbs: 1, owner: 1 }  // AI opponent cell
    ]),
    opponentMoves: [], // AI will make moves dynamically
    solution: [
      { x: 2, y: 1 }, // First move: build up to 3 orbs
      { x: 2, y: 1 }, // Second move: explode and capture AI cells
      { x: 1, y: 1 }, // Third move: capture remaining AI cells
      { x: 4, y: 1 }  // Fourth move: final capture
    ],
    hints: [
      'Start by building up your cell to 3 orbs - you need to explode to capture AI cells',
      'The AI will try to build up its cells, so you need to be strategic about your captures',
      'Try to eliminate AI cells before they can build up too many orbs',
      'Use your remaining moves to capture any remaining AI cells - you need exactly 4 moves'
    ],
    explanation: 'This is your first challenge against an AI opponent. You have a cell ready to explode that can capture multiple AI cells. Plan your moves carefully to eliminate all AI cells before they eliminate yours.',
    rating: 4.8,
    attempts: 0,
    successRate: 0.0
  },
  {
    id: 'tutorial_005',
    title: 'Somnia Reaction Mastery',
    category: PUZZLE_CATEGORIES.TUTORIAL,
    difficulty: 4,
    opponentType: OPPONENT_TYPES.AI,
    boardSize: { width: 8, height: 6 },
    objective: 'Create a chain reaction and eliminate at least 6 AI cells in 4 moves',
    maxMoves: 4,
    initialBoard: createBoard(8, 6, [
      { x: 3, y: 2, orbs: 3, owner: 0 }, // Player cell ready to explode
      { x: 4, y: 2, orbs: 1, owner: 0 }, // Player cell
      { x: 2, y: 3, orbs: 1, owner: 0 }, // Player cell
      { x: 5, y: 3, orbs: 1, owner: 0 }, // Player cell
      { x: 5, y: 3, orbs: 2, owner: 1 }, // AI cell
      { x: 5, y: 2, orbs: 2, owner: 1 }, // AI cell
      { x: 2, y: 1, orbs: 1, owner: 1 }, // AI cell
      { x: 5, y: 1, orbs: 1, owner: 1 }, // AI cell
      { x: 1, y: 4, orbs: 1, owner: 1 }, // AI cell
      { x: 6, y: 4, orbs: 1, owner: 1 }, // AI cell
      { x: 3, y: 3, orbs: 2, owner: 1 }, // AI cell
      { x: 4, y: 3, orbs: 2, owner: 1 }  // AI cell
    ]),
    opponentMoves: [], // AI will make moves dynamically
    solution: [
      { x: 3, y: 2 }, // Move 1: Trigger explosion, capture AI cells
      { x: 4, y: 2 }, // Move 2: Build up for chain reaction
      { x: 4, y: 2 }, // Move 3: Create chain reaction
      { x: 2, y: 3 }, // Move 4: Capture remaining AI cells
      { x: 5, y: 3 }  // Move 5: Final capture
    ],
    hints: [
      'You have a cell ready to explode that can trigger a chain reaction',
      'The AI has cells positioned to create multiple explosions when captured',
      'Plan your moves to create cascading explosions that eliminate AI cells',
      'Use the chain reaction to capture AI cells efficiently',
      'You need to eliminate at least 6 AI cells and create a chain reaction'
    ],
    explanation: 'This puzzle introduces chain reactions - when one explosion triggers another explosion. You have a cell ready to explode that can capture AI cells, which will then trigger more explosions. Your goal is to create a chain reaction and eliminate at least 6 AI cells within 5 moves.',
    rating: 4.9,
    attempts: 0,
    successRate: 0.0
  },
  {
    id: 'tutorial_006',
    title: 'Grandmaster Challenge',
    category: PUZZLE_CATEGORIES.TUTORIAL,
    difficulty: 5,
    opponentType: OPPONENT_TYPES.AI,
    boardSize: { width: 10, height: 8 },
    objective: 'Control at least 3 corners and eliminate at least 8 AI cells in 6 moves',
    maxMoves: 8,
    initialBoard: createBoard(10, 8, [
      { x: 4, y: 3, orbs: 3, owner: 0 }, // Player cell ready to explode
      { x: 5, y: 3, orbs: 2, owner: 0 }, // Player cell
      { x: 3, y: 4, orbs: 1, owner: 0 }, // Player cell
      { x: 6, y: 4, orbs: 1, owner: 0 }, // Player cell
      { x: 3, y: 3, orbs: 2, owner: 1 }, // AI cell
      { x: 6, y: 3, orbs: 2, owner: 1 }, // AI cell
      { x: 1, y: 2, orbs: 1, owner: 1 }, // AI cell
      { x: 8, y: 2, orbs: 1, owner: 1 }, // AI cell
      { x: 2, y: 5, orbs: 1, owner: 1 }, // AI cell
      { x: 7, y: 5, orbs: 1, owner: 1 }, // AI cell
      { x: 4, y: 4, orbs: 2, owner: 1 }, // AI cell
      { x: 5, y: 4, orbs: 2, owner: 1 }, // AI cell
      { x: 0, y: 0, orbs: 1, owner: 1 }, // AI corner
      { x: 9, y: 0, orbs: 1, owner: 1 }, // AI corner
      { x: 0, y: 7, orbs: 1, owner: 1 }, // AI corner
      { x: 9, y: 7, orbs: 1, owner: 1 }  // AI corner
    ]),
    opponentMoves: [], // AI will make moves dynamically
    solution: [
      { x: 4, y: 3 }, // Move 1: Trigger explosion, capture AI cells
      { x: 0, y: 0 }, // Move 2: Capture corner
      { x: 9, y: 0 }, // Move 3: Capture corner
      { x: 0, y: 7 }, // Move 4: Capture corner
      { x: 5, y: 3 }, // Move 5: Build up for more captures
      { x: 2, y: 3 }  // Move 6: Final capture
    ],
    hints: [
      'You have a cell ready to explode that can capture multiple AI cells',
      'The corners are strategically important - control them to limit AI options',
      'Plan your moves to eliminate AI cells while capturing corners',
      'Use chain reactions to efficiently capture multiple cells',
      'You need to control at least 3 corners and eliminate 8 AI cells',
      'Remember: corners provide strategic advantage in larger boards'
    ],
    explanation: 'This is the ultimate tutorial challenge! You must control at least 3 corners while eliminating at least 8 AI cells. The larger board size and strategic corner positions make this a true test of your mastery. Plan your moves carefully to achieve both objectives within the move limit.',
    rating: 5.0,
    attempts: 0,
    successRate: 0.0
  }
]

// Tactical Puzzles - Focus on specific tactics and combinations
export const TACTICAL_PUZZLES = [
  {
    id: 'tactical_001',
    title: 'Corner Trap',
    category: PUZZLE_CATEGORIES.TACTICAL,
    difficulty: 3,
    opponentType: OPPONENT_TYPES.STATIC,
    boardSize: { width: 8, height: 6 },
    objective: 'Eliminate all opponent cells by creating a corner trap in 4 moves',
    maxMoves: 4,
    initialBoard: createBoard(8, 6, [
      { x: 0, y: 0, orbs: 1, owner: 0 }, // Player corner
      { x: 1, y: 0, orbs: 2, owner: 0 }, // Player cell ready to explode
      { x: 0, y: 1, orbs: 2, owner: 0 }, // Player cell ready to explode
      { x: 1, y: 1, orbs: 1, owner: 1 }, // Opponent cell
      { x: 2, y: 0, orbs: 1, owner: 1 }, // Opponent cell
      { x: 0, y: 2, orbs: 1, owner: 1 }, // Opponent cell
      { x: 2, y: 1, orbs: 1, owner: 1 }, // Opponent cell
      { x: 1, y: 2, orbs: 1, owner: 1 }, // Opponent cell
      { x: 3, y: 0, orbs: 1, owner: 1 }, // Opponent cell
      { x: 0, y: 3, orbs: 1, owner: 1 }, // Opponent cell
    ]),
    opponentMoves: [], // Static puzzle - no opponent moves
    solution: [
      { x: 1, y: 0 }, // Move 1: Trigger explosion, capture opponent cells
      { x: 0, y: 1 }, // Move 2: Trigger second explosion, capture more cells
      { x: 2, y: 0 }, // Move 3: Place orb to set up final capture
      { x: 0, y: 2 }  // Move 4: Final move to eliminate remaining opponent cells
    ],
    hints: [
      'You control a corner with cells ready to explode',
      'Use the corner position to trap opponent cells',
      'Chain your explosions to capture multiple cells at once',
      'Plan your moves to eliminate all opponent cells efficiently'
    ],
    explanation: 'This tactical puzzle teaches the power of corner control. By using your corner position strategically, you can trap and eliminate opponent cells through chain reactions. The key is to trigger explosions in the right sequence to maximize captures.',
    rating: 3.5,
    attempts: 0,
    successRate: 0.0
  },
  {
    id: 'tactical_002',
    title: 'AI Counter-Attack',
    category: PUZZLE_CATEGORIES.TACTICAL,
    difficulty: 4,
    opponentType: OPPONENT_TYPES.AI,
    boardSize: { width: 8, height: 6 },
    objective: 'Defeat the AI by controlling the center and eliminating 6+ AI cells in 5 moves',
    maxMoves: 4,
    initialBoard: createBoard(8, 6, [
      { x: 3, y: 2, orbs: 3, owner: 0 }, // Player center cell ready to explode
      { x: 4, y: 2, orbs: 2, owner: 0 }, // Player cell
      { x: 3, y: 3, orbs: 2, owner: 0 }, // Player cell
      { x: 4, y: 3, orbs: 2, owner: 0 }, // Player cell
      { x: 2, y: 2, orbs: 2, owner: 1 }, // AI cell
      { x: 5, y: 2, orbs: 2, owner: 1 }, // AI cell
      { x: 2, y: 3, orbs: 1, owner: 1 }, // AI cell
      { x: 5, y: 3, orbs: 1, owner: 1 }, // AI cell
      { x: 1, y: 2, orbs: 1, owner: 1 }, // AI cell
      { x: 6, y: 2, orbs: 1, owner: 1 }, // AI cell
      { x: 1, y: 3, orbs: 1, owner: 1 }, // AI cell
      { x: 6, y: 3, orbs: 1, owner: 1 }, // AI cell
      { x: 0, y: 0, orbs: 1, owner: 1 }, // AI corner
      { x: 7, y: 0, orbs: 1, owner: 1 }, // AI corner
      { x: 0, y: 5, orbs: 1, owner: 1 }, // AI corner
      { x: 7, y: 5, orbs: 1, owner: 1 }  // AI corner
    ]),
    opponentMoves: [], // AI will make moves dynamically
    solution: [
      { x: 3, y: 2 }, // Move 1: Trigger center explosion, capture AI cells
      { x: 4, y: 2 }, // Move 2: Build up for next explosion
      { x: 3, y: 3 }, // Move 3: Trigger second explosion
      { x: 2, y: 2 }, // Move 4: Capture more AI territory
      { x: 5, y: 2 }  // Move 5: Final capture to eliminate AI cells
    ],
    hints: [
      'You control the center with a cell ready to explode',
      'The AI will try to counter your moves - plan accordingly',
      'Use your center position to control the board',
      'Focus on eliminating AI cells while maintaining your position',
      'The AI may try to escape - block its escape routes'
    ],
    explanation: 'This tactical puzzle teaches how to handle AI opponents. You start with a strong center position, but the AI will actively counter your moves. The key is to use your tactical advantage while anticipating and responding to AI counter-attacks.',
    rating: 4.0,
    attempts: 0,
    successRate: 0.0
  }
]

// Combined puzzle library
export const PUZZLE_LIBRARY = {
  [PUZZLE_CATEGORIES.TUTORIAL]: TUTORIAL_PUZZLES,
  [PUZZLE_CATEGORIES.TACTICAL]: TACTICAL_PUZZLES,
  [PUZZLE_CATEGORIES.EXPERT]: []
}

// Helper functions
export const getPuzzleById = (id) => {
  for (const category of Object.values(PUZZLE_LIBRARY)) {
    const puzzle = category.find(p => p.id === id)
    if (puzzle) return puzzle
  }
  return null
}

export const getPuzzlesByCategory = (category) => {
  return PUZZLE_LIBRARY[category] || []
}

export const getPuzzlesByDifficulty = (minDifficulty, maxDifficulty) => {
  const puzzles = []
  for (const category of Object.values(PUZZLE_LIBRARY)) {
    puzzles.push(...category.filter(p => p.difficulty >= minDifficulty && p.difficulty <= maxDifficulty))
  }
  return puzzles
}

export const getTotalPuzzleCount = () => {
  return Object.values(PUZZLE_LIBRARY).reduce((total, category) => total + category.length, 0)
} 