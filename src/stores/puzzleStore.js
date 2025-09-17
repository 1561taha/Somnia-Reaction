import { create } from 'zustand'
import { getPuzzleById, getPuzzlesByCategory, getPuzzlesByDifficulty } from '../features/puzzles/PuzzleLibrary'
import { useGameStore } from './gameStore'
import blockchainService from '../services/blockchainService.js'
import toast from 'react-hot-toast'

export const usePuzzleStore = create((set, get) => ({
  // Current puzzle state
  currentPuzzle: null,
  currentBoard: null,
  currentMove: 0,
  maxMoves: 0,
  gameStatus: 'menu', // 'menu', 'playing', 'completed', 'failed'
  
  // Track explosion history locally
  explosionHistory: [],
  
  // Progress tracking
  puzzleProgress: {},
  completedPuzzles: new Set(),
  failedPuzzles: new Set(),
  
  // Game statistics
  hintsUsed: 0,
  startTime: null,
  endTime: null,
  
  // UI state
  showHint: false,
  currentHint: '',
  hintLevel: 0,
  showSolution: false,
  
  // Opponent state
  opponentType: null, // 'static' or 'ai'
  opponentMoves: [],
  aiThinking: false,
  
  // Actions
  loadPuzzle: (puzzleId) => {
    const puzzle = getPuzzleById(puzzleId)
    if (!puzzle) {
      console.error(`Puzzle ${puzzleId} not found`)
      return false
    }
    
    // Initialize game store with puzzle settings
    const gameStore = useGameStore.getState()
    gameStore.initializeGame({
      gameMode: 'puzzle',
      boardSize: puzzle.boardSize,
      explosionCapacity: 4,
      players: [
        { id: 0, name: 'You', color: '#ef4444' }, // Red (matches getPlayerColor index 0)
        { id: 1, name: puzzle.opponentType === 'ai' ? 'AI' : 'Opponent', color: '#3b82f6' } // Blue (matches getPlayerColor index 1)
      ]
    })
    
    // Set initial board state
    gameStore.setBoard(puzzle.initialBoard)
    
    // Set initial state
    set({
      currentPuzzle: puzzle,
      currentBoard: JSON.parse(JSON.stringify(puzzle.initialBoard)),
      currentMove: 0,
      maxMoves: puzzle.maxMoves,
      gameStatus: 'playing',
      opponentType: puzzle.opponentType,
      opponentMoves: puzzle.opponentMoves || [],
      hintsUsed: 0,
      startTime: Date.now(),
      endTime: null,
      showHint: false,
      currentHint: '',
      hintLevel: 0,
      showSolution: false,
      aiThinking: false,
      explosionHistory: [] // Clear explosion history for new puzzle
    })
    
    return true
  },
  
  makeMove: async (x, y) => {
    const { currentPuzzle, currentMove, maxMoves, gameStatus } = get()
    
    if (gameStatus !== 'playing') return false
    
    // Use the game store to make the move
    const gameStore = useGameStore.getState()
    const result = await gameStore.placeOrb(x, y)
    
    if (!result) {
      console.error('Invalid move')
      return false
    }
    
    // Extract explosion history from the result
    const { explosions, chainReactions, explosionHistory } = result
    
    // Accumulate explosion history for this move
    if (explosionHistory && explosionHistory.length > 0) {
      set(state => ({
        explosionHistory: [...state.explosionHistory, ...explosionHistory]
      }))
    }
    
    // Update move count
    set({
      currentMove: currentMove + 1
    })
    
    // For single-move puzzles, check objective immediately
    if (maxMoves === 1) {
      // Short wait to ensure everything is settled
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const gameStoreAfterExplosion = useGameStore.getState()
      const board = gameStoreAfterExplosion.board
      const objectiveAchieved = checkObjective(board, currentPuzzle)
      
      if (objectiveAchieved) {
        get().completePuzzle(true)
      } else {
        get().completePuzzle(false)
      }
      return true
    }
    
    // For multi-move puzzles with static opponent (no opponent moves)
    if (currentPuzzle.opponentType === 'static' && currentPuzzle.opponentMoves.length === 0) {
      // Short wait to ensure everything is settled
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const gameStoreAfterExplosion = useGameStore.getState()
      const board = gameStoreAfterExplosion.board
      const objectiveAchieved = checkObjective(board, currentPuzzle)
      
      // Check if max moves reached or objective achieved
      if (currentMove + 1 >= maxMoves || objectiveAchieved) {
        if (objectiveAchieved) {
          get().completePuzzle(true)
        } else {
          get().completePuzzle(false)
        }
        return true
      }
      
      return true
    }
    
    // For multi-move puzzles with opponent moves, handle opponent move first
    await get().executeOpponentMove()
    
    // Short wait to ensure everything is settled
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Now check if objective is achieved after both moves
    const gameStoreAfterExplosion = useGameStore.getState()
    const board = gameStoreAfterExplosion.board
    const objectiveAchieved = checkObjective(board, currentPuzzle)
    
    // Check if max moves reached
    if (currentMove + 1 >= maxMoves) {
      // If max moves reached, check if objective was achieved
      if (objectiveAchieved) {
        get().completePuzzle(true)
      } else {
        get().completePuzzle(false)
      }
      return true
    }
    
    // If objective achieved before max moves, complete successfully
    if (objectiveAchieved) {
      get().completePuzzle(true)
      return true
    }
    
    return true
  },
  
  executeOpponentMove: async () => {
    const { currentPuzzle, currentMove, opponentType, opponentMoves } = get()
    const gameStore = useGameStore.getState()
    
    if (opponentType === 'static') {
      // Execute static opponent move
      const opponentMove = opponentMoves.find(move => move.turn === currentMove + 1)
      
      if (opponentMove) {
        const { x, y } = opponentMove
        const result = await gameStore.placeOrb(x, y, 1) // Player 1 is opponent
        
        // Capture explosion history from opponent move
        if (result && result.explosionHistory && result.explosionHistory.length > 0) {
          set(state => ({
            explosionHistory: [...state.explosionHistory, ...result.explosionHistory]
          }))
        }
      }
      
    } else if (opponentType === 'ai') {
      // Execute AI opponent move
      set({ aiThinking: true })
      
      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Puzzle-specific AI implementation
      const board = gameStore.board
      const aiMove = getPuzzleSpecificAIMove(board, currentPuzzle)
      
      if (aiMove) {
        const result = await gameStore.placeOrb(aiMove.x, aiMove.y, 1)
        
        // Capture explosion history from AI move
        if (result && result.explosionHistory && result.explosionHistory.length > 0) {
          set(state => ({
            explosionHistory: [...state.explosionHistory, ...result.explosionHistory]
          }))
        }
      }
      
      set({ aiThinking: false })
    }
    
    // Don't automatically complete puzzle here - let makeMove handle objective checking
  },
  
  completePuzzle: async (success) => {
    const { currentPuzzle, hintsUsed, startTime } = get()
    const endTime = Date.now()
    const timeTaken = endTime - startTime
    
    // Update progress
    const puzzleId = currentPuzzle.id
    const progress = {
      completed: success,
      timeTaken,
      hintsUsed,
      completedAt: new Date().toISOString(),
      attempts: (get().puzzleProgress[puzzleId]?.attempts || 0) + 1
    }
    
    set({
      gameStatus: success ? 'completed' : 'failed',
      endTime,
      puzzleProgress: {
        ...get().puzzleProgress,
        [puzzleId]: progress
      }
    })
    
    if (success) {
      get().completedPuzzles.add(puzzleId)
      
      // Handle blockchain integration for successful puzzle completion
      try {
        const isConnected = blockchainService.getConnectionStatus().isConnected;
        if (isConnected) {
          const isRegistered = await blockchainService.isUserRegistered();
          if (isRegistered) {
            // Calculate puzzle points based on difficulty and performance
            const difficulty = currentPuzzle.difficulty || 1;
            const basePoints = difficulty * 10; // 10 points per difficulty level
            const timeBonus = Math.max(0, 20 - Math.floor(timeTaken / 10000)); // Time bonus up to 20 points
            const hintPenalty = hintsUsed * 2; // 2 points penalty per hint
            const pointsToAdd = Math.max(5, basePoints + timeBonus - hintPenalty);
            
            // Add puzzle points using optimized function
            await blockchainService.addPoints(0, 0, pointsToAdd);
            
            toast.success(`+${pointsToAdd} puzzle points earned!`);
            
            // Check for achievements
            const currentUserData = await blockchainService.loadUserData();
            const achievements = currentUserData?.achievements || [];
            const achievementNames = achievements.map(a => a.name);
            
            // First puzzle completion
            if (!achievementNames.includes('PUZZLE_FIRST') && get().completedPuzzles.size === 1) {
              await blockchainService.unlockAchievement('PUZZLE_FIRST');
            }
            
            // Difficulty-based achievements
            if (difficulty >= 3 && !achievementNames.includes('PUZZLE_ADVANCED')) {
              await blockchainService.unlockAchievement('PUZZLE_ADVANCED');
            }
            
            // Speed achievements
            if (timeTaken < 30000 && !achievementNames.includes('PUZZLE_SPEED_DEMON')) { // Under 30 seconds
              await blockchainService.unlockAchievement('PUZZLE_SPEED_DEMON');
            }
            
            // Perfect completion (no hints)
            if (hintsUsed === 0 && !achievementNames.includes('PUZZLE_PERFECT')) {
              await blockchainService.unlockAchievement('PUZZLE_PERFECT');
            }
          }
        }
      } catch (error) {
        console.error('Blockchain integration failed for puzzle completion:', error);
      }
    } else {
      get().failedPuzzles.add(puzzleId)
    }
    
    // Save to localStorage
    localStorage.setItem('puzzleProgress', JSON.stringify(get().puzzleProgress))
    localStorage.setItem('completedPuzzles', JSON.stringify(Array.from(get().completedPuzzles)))
    localStorage.setItem('failedPuzzles', JSON.stringify(Array.from(get().failedPuzzles)))
  },
  
  useHint: () => {
    const { currentPuzzle, hintLevel, hintsUsed } = get()
    
    if (!currentPuzzle || hintLevel >= currentPuzzle.hints.length) {
      return false
    }
    
    const hint = currentPuzzle.hints[hintLevel]
    
    set({
      showHint: true,
      currentHint: hint,
      hintLevel: hintLevel + 1,
      hintsUsed: hintsUsed + 1
    })
    
    return true
  },
  
  hideHint: () => {
    set({
      showHint: false,
      currentHint: ''
    })
  },
  
  showSolution: () => {
    const { currentPuzzle } = get()
    if (!currentPuzzle) return
    
    set({
      showSolution: true
    })
  },
  
  hideSolution: () => {
    set({
      showSolution: false
    })
  },
  
  restartPuzzle: () => {
    const { currentPuzzle } = get()
    if (!currentPuzzle) return
    
    get().loadPuzzle(currentPuzzle.id)
  },
  
  nextPuzzle: () => {
    const { currentPuzzle } = get()
    if (!currentPuzzle) return
    
    // Find next puzzle in same category
    const categoryPuzzles = getPuzzlesByCategory(currentPuzzle.category)
    const currentIndex = categoryPuzzles.findIndex(p => p.id === currentPuzzle.id)
    const nextPuzzle = categoryPuzzles[currentIndex + 1]
    
    if (nextPuzzle) {
      get().loadPuzzle(nextPuzzle.id)
    }
  },
  
  previousPuzzle: () => {
    const { currentPuzzle } = get()
    if (!currentPuzzle) return
    
    // Find previous puzzle in same category
    const categoryPuzzles = getPuzzlesByCategory(currentPuzzle.category)
    const currentIndex = categoryPuzzles.findIndex(p => p.id === currentPuzzle.id)
    const previousPuzzle = categoryPuzzles[currentIndex - 1]
    
    if (previousPuzzle) {
      get().loadPuzzle(previousPuzzle.id)
    }
  },
  
  resetProgress: () => {
    set({
      puzzleProgress: {},
      completedPuzzles: new Set(),
      failedPuzzles: new Set()
    })
    
    localStorage.removeItem('puzzleProgress')
    localStorage.removeItem('completedPuzzles')
    localStorage.removeItem('failedPuzzles')
  },
  
  // Load progress from localStorage
  loadProgress: () => {
    try {
      const progress = JSON.parse(localStorage.getItem('puzzleProgress') || '{}')
      const completed = JSON.parse(localStorage.getItem('completedPuzzles') || '[]')
      const failed = JSON.parse(localStorage.getItem('failedPuzzles') || '[]')
      
      set({
        puzzleProgress: progress,
        completedPuzzles: new Set(completed),
        failedPuzzles: new Set(failed)
      })
    } catch (error) {
      console.error('Error loading puzzle progress:', error)
    }
  },
  
  // Get puzzle statistics
  getPuzzleStats: (puzzleId) => {
    const { puzzleProgress, completedPuzzles, failedPuzzles } = get()
    const progress = puzzleProgress[puzzleId]
    
    if (!progress) {
      return {
        completed: false,
        attempts: 0,
        bestTime: null,
        hintsUsed: 0
      }
    }
    
    return {
      completed: progress.completed,
      attempts: progress.attempts,
      bestTime: progress.timeTaken,
      hintsUsed: progress.hintsUsed
    }
  },
  
  // Get category statistics
  getCategoryStats: (category) => {
    const { completedPuzzles, failedPuzzles } = get()
    const categoryPuzzles = getPuzzlesByCategory(category)
    
    const completed = categoryPuzzles.filter(p => completedPuzzles.has(p.id)).length
    const failed = categoryPuzzles.filter(p => failedPuzzles.has(p.id)).length
    const total = categoryPuzzles.length
    
    return {
      completed,
      failed,
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0
    }
  },
  
  // Get available puzzles
  getAvailablePuzzles: (category = null, difficulty = null) => {
    const { completedPuzzles } = get()
    
    let puzzles = []
    if (category) {
      puzzles = getPuzzlesByCategory(category)
    } else {
      // Get all puzzles
      puzzles = Object.values(getPuzzlesByCategory()).flat()
    }
    
    // Filter by difficulty if specified
    if (difficulty !== null) {
      puzzles = puzzles.filter(p => p.difficulty === difficulty)
    }
    
    // Add availability status
    return puzzles.map(puzzle => ({
      ...puzzle,
      available: true, // All puzzles available for now
      completed: completedPuzzles.has(puzzle.id)
    }))
  }
}))

// Helper functions
const checkObjective = (board, puzzle) => {
  const puzzleId = puzzle.id
  const objective = puzzle.objective.toLowerCase()
  
  console.log('=== PUZZLE OBJECTIVE CHECK ===')
  console.log('Puzzle ID:', puzzleId)
  console.log('Objective:', objective)
  console.log('Max moves:', puzzle.maxMoves)
  
  // Puzzle-specific logic
  switch (puzzleId) {
    case 'tutorial_001':
      return checkTutorial001Objective(board, puzzle)
    case 'tutorial_002':
      return checkTutorial002Objective(board, puzzle)
    case 'tutorial_003':
      return checkTutorial003Objective(board, puzzle)
    case 'tutorial_004':
      return checkTutorial004Objective(board, puzzle)
    case 'tutorial_005':
      return checkTutorial005Objective(board, puzzle)
    case 'tutorial_006':
      return checkTutorial006Objective(board, puzzle)
    case 'tactical_001':
      return checkTactical001Objective(board, puzzle)
    case 'tactical_002':
      return checkTactical002Objective(board, puzzle)
    default:
      return checkGenericObjective(board, puzzle)
  }
}

// Tutorial 001: "First Steps" - Create an explosion in 1 move
const checkTutorial001Objective = (board, puzzle) => {
  console.log('=== TUTORIAL 001 CHECK ===')
  
  // Get the puzzle store to check if explosions actually happened
  const puzzleStore = usePuzzleStore.getState()
  
  console.log('Local explosion history:', puzzleStore.explosionHistory)
  
  // Check if there were any explosions in the recent history
  if (puzzleStore.explosionHistory && puzzleStore.explosionHistory.length > 0) {
    console.log('✅ Explosion detected - Tutorial 001 PASSED')
    return true
  }
  
  console.log('❌ No explosion detected - Tutorial 001 FAILED')
  return false
}

// Tutorial 002: "Strategic Capture" - Capture exactly 3 opponent cells in 2 moves
const checkTutorial002Objective = (board, puzzle) => {
  console.log('=== TUTORIAL 002 CHECK ===')
  
  // For static puzzles, check objective after each move
  const puzzleStore = usePuzzleStore.getState()
  const currentMove = puzzleStore.currentMove
  
  console.log('Current move:', currentMove, 'Max moves:', puzzle.maxMoves)
  
  // Count opponent cells that were eliminated
  let opponentCellsRemaining = 0
  let playerCells = 0
  
  console.log('Board state after moves:')
  for (let y = 0; y < board.length; y++) {
    let row = ''
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 0) {
        row += `P${cell.orbs} `
        if (cell.orbs > 0) playerCells++
      } else if (cell.owner === 1) {
        row += `O${cell.orbs} `
        if (cell.orbs > 0) opponentCellsRemaining++
      } else {
        row += `_${cell.orbs} `
      }
    }
    console.log(`Row ${y}: ${row}`)
  }
  
  console.log('Player cells with orbs:', playerCells)
  console.log('Opponent cells remaining:', opponentCellsRemaining)
  
  // For "capture exactly 3 opponent cells", we need all opponent cells to be eliminated
  // (since the initial board had exactly 3 opponent cells)
  const result = opponentCellsRemaining === 0 && playerCells > 0
  
  if (result) {
    console.log('✅ All 3 opponent cells eliminated - Tutorial 002 PASSED')
  } else {
    console.log('❌ Not all opponent cells eliminated - Tutorial 002 FAILED')
    console.log('Expected: 0 opponent cells, got:', opponentCellsRemaining)
    console.log('Expected: >0 player cells, got:', playerCells)
  }
  
  return result
}

// Tutorial 003: "Somnia Reaction Mastery" - Create a chain reaction to eliminate all opponent cells in exactly 3 moves
const checkTutorial003Objective = (board, puzzle) => {
  console.log('=== TUTORIAL 003 CHECK ===')
  
  // For static puzzles, check objective after each move
  const puzzleStore = usePuzzleStore.getState()
  const currentMove = puzzleStore.currentMove
  
  console.log('Current move:', currentMove, 'Max moves:', puzzle.maxMoves)
  
  // Count opponent cells that were eliminated
  let opponentCellsRemaining = 0
  let playerCells = 0
  
  console.log('Board state after moves:')
  for (let y = 0; y < board.length; y++) {
    let row = ''
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 0) {
        row += `P${cell.orbs} `
        if (cell.orbs > 0) playerCells++
      } else if (cell.owner === 1) {
        row += `O${cell.orbs} `
        if (cell.orbs > 0) opponentCellsRemaining++
      } else {
        row += `_${cell.orbs} `
      }
    }
    console.log(`Row ${y}: ${row}`)
  }
  
  console.log('Player cells with orbs:', playerCells)
  console.log('Opponent cells remaining:', opponentCellsRemaining)
  
  // For "eliminate all opponent cells", we need all opponent cells to be eliminated
  const result = opponentCellsRemaining === 0 && playerCells > 0
  
  if (result) {
    console.log('✅ All opponent cells eliminated - Tutorial 003 PASSED')
  } else {
    console.log('❌ Not all opponent cells eliminated - Tutorial 003 FAILED')
    console.log('Expected: 0 opponent cells, got:', opponentCellsRemaining)
    console.log('Expected: >0 player cells, got:', playerCells)
  }
  
  return result
}

// Tutorial 004: "AI Challenge" - Defeat the AI opponent by eliminating all their cells in 4 moves
const checkTutorial004Objective = (board, puzzle) => {
  console.log('=== TUTORIAL 004 CHECK ===')
  
  // For AI opponent puzzles, check objective after each move
  const puzzleStore = usePuzzleStore.getState()
  const currentMove = puzzleStore.currentMove
  
  console.log('Current move:', currentMove, 'Max moves:', puzzle.maxMoves)
  console.log('Game status:', puzzleStore.gameStatus)
  
  // Count AI opponent cells that were eliminated
  let aiCellsRemaining = 0
  let playerCells = 0
  let totalAIOrbs = 0
  let totalPlayerOrbs = 0
  
  console.log('Board state after moves:')
  for (let y = 0; y < board.length; y++) {
    let row = ''
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 0) {
        row += `P${cell.orbs} `
        if (cell.orbs > 0) {
          playerCells++
          totalPlayerOrbs += cell.orbs
        }
      } else if (cell.owner === 1) {
        row += `AI${cell.orbs} `
        if (cell.orbs > 0) {
          aiCellsRemaining++
          totalAIOrbs += cell.orbs
        }
      } else {
        row += `_${cell.orbs} `
      }
    }
    console.log(`Row ${y}: ${row}`)
  }
  
  console.log('Player cells with orbs:', playerCells, 'Total player orbs:', totalPlayerOrbs)
  console.log('AI cells remaining:', aiCellsRemaining, 'Total AI orbs:', totalAIOrbs)
  
  // For "defeat AI opponent", we need all AI cells to be eliminated
  const result = aiCellsRemaining === 0 && playerCells > 0
  
  if (result) {
    console.log('✅ All AI cells eliminated - Tutorial 004 PASSED')
  } else {
    console.log('❌ Not all AI cells eliminated - Tutorial 004 FAILED')
    console.log('Expected: 0 AI cells, got:', aiCellsRemaining)
    console.log('Expected: >0 player cells, got:', playerCells)
  }
  
  return result
}

// Tutorial 005: "Somnia Reaction Mastery" - Create a chain reaction and eliminate at least 6 AI cells in 5 moves
const checkTutorial005Objective = (board, puzzle) => {
  console.log('=== TUTORIAL 005 CHECK ===')
  
  // For AI opponent puzzles, check objective after each move
  const puzzleStore = usePuzzleStore.getState()
  const currentMove = puzzleStore.currentMove
  
  console.log('Current move:', currentMove, 'Max moves:', puzzle.maxMoves)
  console.log('Game status:', puzzleStore.gameStatus)
  
  // Count AI opponent cells that were eliminated
  let aiCellsRemaining = 0
  let playerCells = 0
  let totalAIOrbs = 0
  let totalPlayerOrbs = 0
  
  console.log('Board state after moves:')
  for (let y = 0; y < board.length; y++) {
    let row = ''
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 0) {
        row += `P${cell.orbs} `
        if (cell.orbs > 0) {
          playerCells++
          totalPlayerOrbs += cell.orbs
        }
      } else if (cell.owner === 1) {
        row += `AI${cell.orbs} `
        if (cell.orbs > 0) {
          aiCellsRemaining++
          totalAIOrbs += cell.orbs
        }
      } else {
        row += `_${cell.orbs} `
      }
    }
    console.log(`Row ${y}: ${row}`)
  }
  
  console.log('Player cells with orbs:', playerCells, 'Total player orbs:', totalPlayerOrbs)
  console.log('AI cells remaining:', aiCellsRemaining, 'Total AI orbs:', totalAIOrbs)
  
  // Check for chain reaction in explosion history
  const hasChainReaction = checkChainReaction(board)
  console.log('Chain reaction detected:', hasChainReaction)
  
  // Calculate how many AI cells were eliminated (initial AI cells - remaining AI cells)
  const initialAICells = 12 // Based on the puzzle setup
  const aiCellsEliminated = initialAICells - aiCellsRemaining
  console.log('AI cells eliminated:', aiCellsEliminated, 'out of', initialAICells)
  
  // For "chain reaction mastery", we need chain reaction AND at least 6 AI cells eliminated
  const result = hasChainReaction && aiCellsEliminated >= 6 && playerCells > 0
  
  console.log('=== TUTORIAL 005 RESULT ===')
  console.log('Chain reaction requirement:', hasChainReaction, '(need: true)')
  console.log('AI cells eliminated requirement:', aiCellsEliminated >= 6, `(need: >=6, got: ${aiCellsEliminated})`)
  console.log('Player has cells requirement:', playerCells > 0, `(need: >0, got: ${playerCells})`)
  console.log('Final result:', result)
  
  if (result) {
    console.log('✅ Chain reaction created and at least 6 AI cells eliminated - Tutorial 005 PASSED')
  } else {
    console.log('❌ Tutorial 005 FAILED')
    console.log('Chain reaction occurred:', hasChainReaction)
    console.log('AI cells eliminated (need >=6):', aiCellsEliminated)
    console.log('Player has cells:', playerCells > 0)
  }
  
  return result
}

// Tutorial 006: "Grandmaster Challenge" - Control at least 3 corners and eliminate at least 8 AI cells in 6 moves
const checkTutorial006Objective = (board, puzzle) => {
  console.log('=== TUTORIAL 006 CHECK ===')
  
  // For AI opponent puzzles, check objective after each move
  const puzzleStore = usePuzzleStore.getState()
  const currentMove = puzzleStore.currentMove
  
  console.log('Current move:', currentMove, 'Max moves:', puzzle.maxMoves)
  console.log('Game status:', puzzleStore.gameStatus)
  
  // Count AI opponent cells that were eliminated
  let aiCellsRemaining = 0
  let playerCells = 0
  let totalAIOrbs = 0
  let totalPlayerOrbs = 0
  
  console.log('Board state after moves:')
  for (let y = 0; y < board.length; y++) {
    let row = ''
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 0) {
        row += `P${cell.orbs} `
        if (cell.orbs > 0) {
          playerCells++
          totalPlayerOrbs += cell.orbs
        }
      } else if (cell.owner === 1) {
        row += `AI${cell.orbs} `
        if (cell.orbs > 0) {
          aiCellsRemaining++
          totalAIOrbs += cell.orbs
        }
      } else {
        row += `_${cell.orbs} `
      }
    }
    console.log(`Row ${y}: ${row}`)
  }
  
  console.log('Player cells with orbs:', playerCells, 'Total player orbs:', totalPlayerOrbs)
  console.log('AI cells remaining:', aiCellsRemaining, 'Total AI orbs:', totalAIOrbs)
  
  // Check corner control
  const corners = [
    [0, 0], [9, 0], [0, 7], [9, 7] // All four corners
  ]
  const cornersControlled = corners.filter(([x, y]) => {
    const cell = board[y][x]
    return cell.owner === 0 && cell.orbs > 0
  }).length
  console.log('Corners controlled:', cornersControlled, 'out of 4')
  
  // Calculate how many AI cells were eliminated (initial AI cells - remaining AI cells)
  const initialAICells = 15 // Based on the updated puzzle setup (reduced from 16)
  const aiCellsEliminated = initialAICells - aiCellsRemaining
  console.log('AI cells eliminated:', aiCellsEliminated, 'out of', initialAICells)
  
  // For "grandmaster challenge", we need at least 2 corners controlled AND at least 6 AI cells eliminated
  const result = cornersControlled >= 2 && aiCellsEliminated >= 6 && playerCells > 0
  
  if (result) {
    console.log('✅ At least 2 corners controlled and at least 6 AI cells eliminated - Tutorial 006 PASSED')
  } else {
    console.log('❌ Tutorial 006 FAILED')
    console.log('Corners controlled (need >=2):', cornersControlled)
    console.log('AI cells eliminated (need >=6):', aiCellsEliminated)
    console.log('Player has cells:', playerCells > 0)
  }
  
  return result
}

// Tactical 001: "Corner Trap" - Eliminate all opponent cells in 4 moves
const checkTactical001Objective = (board, puzzle) => {
  console.log('=== TACTICAL 001 CHECK ===')
  
  const puzzleStore = usePuzzleStore.getState()
  const currentMove = puzzleStore.currentMove
  
  console.log('Current move:', currentMove, 'Max moves:', puzzle.maxMoves)
  
  // Count opponent cells that were eliminated
  let opponentCellsRemaining = 0
  let playerCells = 0
  
  console.log('Board state after moves:')
  for (let y = 0; y < board.length; y++) {
    let row = ''
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 0) {
        row += `P${cell.orbs} `
        if (cell.orbs > 0) playerCells++
      } else if (cell.owner === 1) {
        row += `O${cell.orbs} `
        if (cell.orbs > 0) opponentCellsRemaining++
      } else {
        row += `_${cell.orbs} `
      }
    }
    console.log(`Row ${y}: ${row}`)
  }
  
  console.log('Player cells with orbs:', playerCells)
  console.log('Opponent cells remaining:', opponentCellsRemaining)
  
  // For "eliminate all opponent cells", we need all opponent cells to be eliminated
  const result = opponentCellsRemaining === 0 && playerCells > 0
  
  if (result) {
    console.log('✅ All opponent cells eliminated - Tactical 001 PASSED')
  } else {
    console.log('❌ Not all opponent cells eliminated - Tactical 001 FAILED')
    console.log('Expected: 0 opponent cells, got:', opponentCellsRemaining)
    console.log('Expected: >0 player cells, got:', playerCells)
  }
  
  return result
}

// Tactical 002: "AI Counter-Attack" - Eliminate 6+ AI cells in 6 moves
const checkTactical002Objective = (board, puzzle) => {
  console.log('=== TACTICAL 002 CHECK ===')
  
  const puzzleStore = usePuzzleStore.getState()
  const currentMove = puzzleStore.currentMove
  
  console.log('Current move:', currentMove, 'Max moves:', puzzle.maxMoves)
  
  // Count AI cells that were eliminated
  let aiCellsRemaining = 0
  let playerCells = 0
  
  console.log('Board state after moves:')
  for (let y = 0; y < board.length; y++) {
    let row = ''
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 0) {
        row += `P${cell.orbs} `
        if (cell.orbs > 0) playerCells++
      } else if (cell.owner === 1) {
        row += `AI${cell.orbs} `
        if (cell.orbs > 0) aiCellsRemaining++
      } else {
        row += `_${cell.orbs} `
      }
    }
    console.log(`Row ${y}: ${row}`)
  }
  
  console.log('Player cells with orbs:', playerCells)
  console.log('AI cells remaining:', aiCellsRemaining)
  
  // The initial board had 12 AI cells (including corners)
  const initialAICells = 12
  const aiCellsEliminated = initialAICells - aiCellsRemaining
  
  console.log('AI cells eliminated:', aiCellsEliminated, 'out of', initialAICells)
  
  // For "eliminate 6+ AI cells", we need at least 6 AI cells to be eliminated
  const result = aiCellsEliminated >= 6 && playerCells > 0
  
  console.log('=== TACTICAL 002 RESULT ===')
  console.log('AI cells eliminated requirement:', aiCellsEliminated >= 6, `(need: >=6, got: ${aiCellsEliminated})`)
  console.log('Player has cells requirement:', playerCells > 0, `(need: >0, got: ${playerCells})`)
  console.log('Final result:', result)
  
  if (result) {
    console.log('✅ At least 6 AI cells eliminated - Tactical 002 PASSED')
  } else {
    console.log('❌ Tactical 002 FAILED')
    console.log('AI cells eliminated (need >=6):', aiCellsEliminated)
    console.log('Player has cells:', playerCells > 0)
  }
  
  return result
}

// Generic objective checker for other puzzles
const checkGenericObjective = (board, puzzle) => {
  const objective = puzzle.objective.toLowerCase()
  
  console.log('=== GENERIC OBJECTIVE CHECK ===')
  console.log('Objective:', objective)
  
  // For multi-move puzzles, we need to be more careful about when to complete
  if (puzzle.maxMoves > 1) {
    // Only check for elimination if the objective specifically asks for it
    if (objective.includes('eliminate') || objective.includes('defeat')) {
      const activePlayers = getActivePlayers(board)
      const opponentOrbs = getPlayerOrbCount(board, 1)
      const result = activePlayers.length === 1 && activePlayers[0] === 0 && opponentOrbs === 0
      console.log('Multi-move elimination check:', { activePlayers, opponentOrbs, result })
      return result
    }
    
    // For other multi-move objectives, don't complete until max moves reached
    console.log('Multi-move puzzle - not elimination objective, returning false')
    return false
  }
  
  // Single move puzzles - check specific objectives
  if (objective.includes('explosion') || objective.includes('explode')) {
    const result = checkExplosionOccurred(board)
    console.log('Explosion check:', result)
    return result
  }
  
  if (objective.includes('capture')) {
    const result = checkCaptureObjective(board, puzzle)
    console.log('Capture check:', result)
    return result
  }
  
  if (objective.includes('chain')) {
    const result = checkChainReaction(board)
    console.log('Chain reaction check:', result)
    return result
  }
  
  if (objective.includes('corner') || objective.includes('control')) {
    const result = checkCornerControl(board, 0)
    console.log('Corner control check:', result)
    return result
  }
  
  if (objective.includes('survive') || objective.includes('defensive')) {
    const activePlayers = getActivePlayers(board)
    const opponentOrbs = getPlayerOrbCount(board, 1)
    const result = activePlayers.includes(0) && opponentOrbs === 0
    console.log('Survival check:', { activePlayers, opponentOrbs, result })
    return result
  }
  
  // For single move puzzles with elimination objective
  if (objective.includes('eliminate') || objective.includes('defeat')) {
    const activePlayers = getActivePlayers(board)
    const opponentOrbs = getPlayerOrbCount(board, 1)
    const result = activePlayers.length === 1 && activePlayers[0] === 0 && opponentOrbs === 0
    console.log('Single-move elimination check:', { activePlayers, opponentOrbs, result })
    return result
  }
  
  // Default: don't complete unless explicitly specified
  console.log('No matching objective found, returning false')
  return false
}

const checkExplosionOccurred = (board) => {
  // Get the puzzle store to check if explosions actually happened
  const puzzleStore = usePuzzleStore.getState()
  
  console.log('=== EXPLOSION CHECK ===')
  console.log('Local explosion history:', puzzleStore.explosionHistory)
  console.log('Explosion history length:', puzzleStore.explosionHistory ? puzzleStore.explosionHistory.length : 0)
  
  // Check if there were any explosions in the recent history
  if (puzzleStore.explosionHistory && puzzleStore.explosionHistory.length > 0) {
    console.log('Explosion detected in history:', puzzleStore.explosionHistory)
    console.log('=== END EXPLOSION CHECK ===')
    return true
  }
  
  // Fallback: check if any explosions happened recently
  // This is a simplified check - in a real implementation, you'd track explosion history
  let explosionCount = 0
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 0 && cell.orbs >= cell.criticalMass) {
        explosionCount++
      }
    }
  }
  console.log('Fallback explosion check:', explosionCount)
  console.log('=== END EXPLOSION CHECK ===')
  return explosionCount > 0
}

const checkCaptureObjective = (board, puzzle) => {
  // Check if player captured the required number of cells
  let playerCells = 0
  let opponentCells = 0
  
  console.log('=== CAPTURE OBJECTIVE CHECK ===')
  console.log('Board state:')
  for (let y = 0; y < board.length; y++) {
    let row = ''
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 0) {
        row += `P${cell.orbs} `
      } else if (cell.owner === 1) {
        row += `O${cell.orbs} `
      } else {
        row += `_${cell.orbs} `
      }
    }
    console.log(`Row ${y}: ${row}`)
  }
  
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 0 && cell.orbs > 0) {
        playerCells++
      } else if (cell.owner === 1 && cell.orbs > 0) {
        opponentCells++
      }
    }
  }
  
  console.log('Capture check - Player cells:', playerCells, 'Opponent cells:', opponentCells)
  
  // If objective mentions capturing exactly 3 opponent cells, check that all opponent cells are eliminated
  if (puzzle.objective.toLowerCase().includes('3')) {
    // For "capture exactly 3 opponent cells", we need all opponent cells to be eliminated
    const result = opponentCells === 0 && playerCells > 0
    console.log('Capture 3 objective result:', result, '(all opponent cells eliminated)')
    console.log('=== END CAPTURE OBJECTIVE CHECK ===')
    return result
  }
  
  // For general capture objectives, check if player has more cells
  const result = playerCells > opponentCells
  console.log('General capture objective result:', result)
  console.log('=== END CAPTURE OBJECTIVE CHECK ===')
  return result
}

const getActivePlayers = (board) => {
  const players = new Set()
  
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner !== null && cell.orbs > 0) {
        players.add(cell.owner)
      }
    }
  }
  
  return Array.from(players)
}

const checkCornerControl = (board, playerIndex) => {
  const height = board.length
  const width = board[0].length
  const corners = [
    [0, 0],
    [0, height - 1],
    [width - 1, 0],
    [width - 1, height - 1]
  ]
  
  return corners.every(([x, y]) => {
    const cell = board[y][x]
    return cell.owner === playerIndex && cell.orbs > 0
  })
}

const checkChainReaction = (board) => {
  // Get the puzzle store to check if chain reactions actually happened
  const puzzleStore = usePuzzleStore.getState()
  
  console.log('=== CHAIN REACTION CHECK ===')
  console.log('Explosion history:', puzzleStore.explosionHistory)
  console.log('Explosion history length:', puzzleStore.explosionHistory ? puzzleStore.explosionHistory.length : 0)
  
  // Check if there were multiple rounds of explosions (chain reaction)
  if (puzzleStore.explosionHistory && puzzleStore.explosionHistory.length > 1) {
    console.log('✅ Chain reaction detected: Multiple rounds of explosions')
    console.log('=== END CHAIN REACTION CHECK ===')
    return true
  }
  
  // Check if there were multiple explosions in a single round
  if (puzzleStore.explosionHistory && puzzleStore.explosionHistory.length === 1) {
    const firstRound = puzzleStore.explosionHistory[0]
    console.log('First round explosions:', firstRound)
    if (firstRound && firstRound.length > 1) {
      console.log('✅ Chain reaction detected: Multiple explosions in single round')
      console.log('=== END CHAIN REACTION CHECK ===')
      return true
    }
  }
  
  // More flexible check: if there were any explosions at all, consider it a chain reaction for tutorial purposes
  if (puzzleStore.explosionHistory && puzzleStore.explosionHistory.length > 0) {
    console.log('✅ Chain reaction detected: Explosions occurred (flexible check)')
    console.log('=== END CHAIN REACTION CHECK ===')
    return true
  }
  
  console.log('❌ No chain reaction detected')
  console.log('=== END CHAIN REACTION CHECK ===')
  return false
}

const getPlayerOrbCount = (board, playerIndex) => {
  let count = 0
  
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === playerIndex) {
        count += cell.orbs
      }
    }
  }
  
  return count
}

const getValidMoves = (board, playerIndex) => {
  const moves = []
  
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      
      // Check if cell is empty or belongs to player
      if (cell.owner === null || cell.owner === playerIndex) {
        moves.push({ x, y })
      }
    }
  }
  
  return moves
}

// Puzzle-specific AI implementations
const getPuzzleSpecificAIMove = (board, puzzle) => {
  const puzzleId = puzzle.id
  
  switch (puzzleId) {
    case 'tutorial_004':
      return getTutorial004AIMove(board)
    case 'tutorial_005':
      return getTutorial005AIMove(board)
    case 'tutorial_006':
      return getTutorial006AIMove(board)
    case 'tactical_002':
      return getTactical002AIMove(board)
    default:
      return getDefaultAIMove(board)
  }
}

// Tutorial 004 AI: Defensive but beatable
const getTutorial004AIMove = (board) => {
  const validMoves = getValidMoves(board, 1)
  if (validMoves.length === 0) return null
  
  // Count AI cells and player cells
  let aiCells = 0
  let playerCells = 0
  
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 1 && cell.orbs > 0) aiCells++
      if (cell.owner === 0 && cell.orbs > 0) playerCells++
    }
  }
  
  // If AI has no cells left, don't make a move
  if (aiCells === 0) {
    console.log('AI has no cells left, skipping move')
    return null
  }
  
  // If AI is losing badly, be more aggressive
  if (aiCells <= 1) {
    // Try to capture empty cells aggressively
    for (const move of validMoves) {
      const cell = board[move.y][move.x]
      if (cell.owner === null) {
        return move
      }
    }
  }
  
  // Enhanced defensive strategy - be more aggressive in building up
  const defensiveMoves = []
  const aggressiveMoves = []
  const emptyMoves = []
  
  for (const move of validMoves) {
    const cell = board[move.y][move.x]
    
    if (cell.owner === 1 && cell.orbs < cell.criticalMass - 1) {
      defensiveMoves.push(move)
    } else if (cell.owner === null) {
      // Prioritize empty cells that are adjacent to AI cells
      const hasAdjacentAI = checkAdjacentAI(board, move.x, move.y)
      if (hasAdjacentAI) {
        aggressiveMoves.push(move)
      } else {
        emptyMoves.push(move)
      }
    }
  }
  
  // Strategy: prefer defensive moves, then aggressive adjacent moves, then other empty cells
  if (defensiveMoves.length > 0) {
    return defensiveMoves[Math.floor(Math.random() * defensiveMoves.length)]
  } else if (aggressiveMoves.length > 0) {
    return aggressiveMoves[Math.floor(Math.random() * aggressiveMoves.length)]
  } else if (emptyMoves.length > 0) {
    return emptyMoves[Math.floor(Math.random() * emptyMoves.length)]
  }
  
  return null
}

// Tutorial 005 AI: Somnia Reaction Challenge - Strategic but beatable
const getTutorial005AIMove = (board) => {
  const validMoves = getValidMoves(board, 1)
  if (validMoves.length === 0) return null
  
  // Count AI cells and player cells
  let aiCells = 0
  let playerCells = 0
  let aiOrbs = 0
  let playerOrbs = 0
  
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 1 && cell.orbs > 0) {
        aiCells++
        aiOrbs += cell.orbs
      }
      if (cell.owner === 0 && cell.orbs > 0) {
        playerCells++
        playerOrbs += cell.orbs
      }
    }
  }
  
  // If AI has no cells left, don't make a move
  if (aiCells === 0) {
    console.log('AI has no cells left, skipping move')
    return null
  }
  
  // If AI is losing badly, be more aggressive
  if (aiCells <= 2) {
    // Try to capture empty cells aggressively
    for (const move of validMoves) {
      const cell = board[move.y][move.x]
      if (cell.owner === null) {
        return move
      }
    }
  }
  
  // Enhanced strategic AI for chain reaction puzzle
  const defensiveMoves = []
  const chainSetupMoves = []
  const aggressiveMoves = []
  const emptyMoves = []
  
  for (const move of validMoves) {
    const cell = board[move.y][move.x]
    
    if (cell.owner === 1 && cell.orbs < cell.criticalMass - 1) {
      defensiveMoves.push(move)
    } else if (cell.owner === null) {
      // Check if this move could set up a chain reaction for AI
      const couldCreateChain = checkChainSetupPotential(board, move.x, move.y)
      if (couldCreateChain) {
        chainSetupMoves.push(move)
      } else {
        // Prioritize empty cells that are adjacent to AI cells
        const hasAdjacentAI = checkAdjacentAI(board, move.x, move.y)
        if (hasAdjacentAI) {
          aggressiveMoves.push(move)
        } else {
          emptyMoves.push(move)
        }
      }
    }
  }
  
  // Strategy: prefer chain setup, then defensive moves, then aggressive moves
  if (chainSetupMoves.length > 0) {
    return chainSetupMoves[Math.floor(Math.random() * chainSetupMoves.length)]
  } else if (defensiveMoves.length > 0) {
    return defensiveMoves[Math.floor(Math.random() * defensiveMoves.length)]
  } else if (aggressiveMoves.length > 0) {
    return aggressiveMoves[Math.floor(Math.random() * aggressiveMoves.length)]
  } else if (emptyMoves.length > 0) {
    return emptyMoves[Math.floor(Math.random() * emptyMoves.length)]
  }
  
  return null
}

// Helper function to check if a move could set up a chain reaction
const checkChainSetupPotential = (board, x, y) => {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  let adjacentAIWithOrbs = 0
  
  for (const [dx, dy] of directions) {
    const nx = x + dx
    const ny = y + dy
    
    if (nx >= 0 && nx < board[0].length && ny >= 0 && ny < board.length) {
      const cell = board[ny][nx]
      if (cell.owner === 1 && cell.orbs > 0) {
        adjacentAIWithOrbs++
      }
    }
  }
  
  // If placing here would connect multiple AI cells, it could create chain potential
  return adjacentAIWithOrbs >= 2
}

// Helper function to check if a cell is adjacent to AI cells
const checkAdjacentAI = (board, x, y) => {
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
  
  for (const [dx, dy] of directions) {
    const nx = x + dx
    const ny = y + dy
    
    if (nx >= 0 && nx < board[0].length && ny >= 0 && ny < board.length) {
      const cell = board[ny][nx]
      if (cell.owner === 1 && cell.orbs > 0) {
        return true
      }
    }
  }
  
  return false
}

// Default AI: Simple random move
const getDefaultAIMove = (board) => {
  const validMoves = getValidMoves(board, 1)
  if (validMoves.length === 0) return null
  
  return validMoves[Math.floor(Math.random() * validMoves.length)]
}

// Tutorial 006 AI: Grandmaster Challenge - Advanced strategic AI
const getTutorial006AIMove = (board) => {
  const validMoves = getValidMoves(board, 1)
  if (validMoves.length === 0) return null
  
  // Count AI cells and player cells
  let aiCells = 0
  let playerCells = 0
  let aiOrbs = 0
  let playerOrbs = 0
  
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 1 && cell.orbs > 0) {
        aiCells++
        aiOrbs += cell.orbs
      }
      if (cell.owner === 0 && cell.orbs > 0) {
        playerCells++
        playerOrbs += cell.orbs
      }
    }
  }
  
  // If AI has no cells left, don't make a move
  if (aiCells === 0) {
    console.log('AI has no cells left, skipping move')
    return null
  }
  
  // If AI is losing badly, be more aggressive
  if (aiCells <= 3) {
    // Try to capture empty cells aggressively
    for (const move of validMoves) {
      const cell = board[move.y][move.x]
      if (cell.owner === null) {
        return move
      }
    }
  }
  
  // Enhanced strategic AI for grandmaster puzzle
  const cornerMoves = []
  const defensiveMoves = []
  const chainSetupMoves = []
  const aggressiveMoves = []
  const emptyMoves = []
  
  for (const move of validMoves) {
    const cell = board[move.y][move.x]
    
    // Check if this is a corner move
    const isCorner = (move.x === 0 || move.x === 9) && (move.y === 0 || move.y === 7)
    
    if (isCorner) {
      cornerMoves.push(move)
    } else if (cell.owner === 1 && cell.orbs < cell.criticalMass - 1) {
      defensiveMoves.push(move)
    } else if (cell.owner === null) {
      // Check if this move could set up a chain reaction for AI
      const couldCreateChain = checkChainSetupPotential(board, move.x, move.y)
      if (couldCreateChain) {
        chainSetupMoves.push(move)
      } else {
        // Prioritize empty cells that are adjacent to AI cells
        const hasAdjacentAI = checkAdjacentAI(board, move.x, move.y)
        if (hasAdjacentAI) {
          aggressiveMoves.push(move)
        } else {
          emptyMoves.push(move)
        }
      }
    }
  }
  
  // Strategy: prefer corner control, then chain setup, then defensive moves
  if (cornerMoves.length > 0) {
    return cornerMoves[Math.floor(Math.random() * cornerMoves.length)]
  } else if (chainSetupMoves.length > 0) {
    return chainSetupMoves[Math.floor(Math.random() * chainSetupMoves.length)]
  } else if (defensiveMoves.length > 0) {
    return defensiveMoves[Math.floor(Math.random() * defensiveMoves.length)]
  } else if (aggressiveMoves.length > 0) {
    return aggressiveMoves[Math.floor(Math.random() * aggressiveMoves.length)]
  } else if (emptyMoves.length > 0) {
    return emptyMoves[Math.floor(Math.random() * emptyMoves.length)]
  }
  
  return null
}

// Tactical 002 AI: Counter-Attack - Balanced but challenging
const getTactical002AIMove = (board) => {
  const validMoves = getValidMoves(board, 1)
  if (validMoves.length === 0) return null
  
  // Count AI cells and player cells
  let aiCells = 0
  let playerCells = 0
  
  for (let y = 0; y < board.length; y++) {
    for (let x = 0; x < board[y].length; x++) {
      const cell = board[y][x]
      if (cell.owner === 1 && cell.orbs > 0) {
        aiCells++
      }
      if (cell.owner === 0 && cell.orbs > 0) {
        playerCells++
      }
    }
  }
  
  // If AI has no cells left, don't make a move
  if (aiCells === 0) {
    console.log('AI has no cells left, skipping move')
    return null
  }
  
  // Strategy: Defend AI cells and try to counter-attack
  const defensiveMoves = []
  const counterMoves = []
  const emptyMoves = []
  
  for (const move of validMoves) {
    const cell = board[move.y][move.x]
    
    if (cell.owner === 1 && cell.orbs < cell.criticalMass - 1) {
      defensiveMoves.push(move)
    } else if (cell.owner === null) {
      // Check if this move could counter player's position
      const isCounterMove = checkCounterMovePotential(board, move.x, move.y)
      if (isCounterMove) {
        counterMoves.push(move)
      } else {
        emptyMoves.push(move)
      }
    }
  }
  
  // Strategy: prefer defensive moves, then counter moves, then empty cells
  if (defensiveMoves.length > 0) {
    return defensiveMoves[Math.floor(Math.random() * defensiveMoves.length)]
  } else if (counterMoves.length > 0) {
    return counterMoves[Math.floor(Math.random() * counterMoves.length)]
  } else if (emptyMoves.length > 0) {
    return emptyMoves[Math.floor(Math.random() * emptyMoves.length)]
  }
  
  return null
}

// Helper function to check if a move could counter player's position
const checkCounterMovePotential = (board, x, y) => {
  // Check if this move is adjacent to player cells
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]]
  
  for (const [dx, dy] of directions) {
    const nx = x + dx
    const ny = y + dy
    
    if (nx >= 0 && nx < board[0].length && ny >= 0 && ny < board.length) {
      const neighbor = board[ny][nx]
      if (neighbor.owner === 0 && neighbor.orbs > 0) {
        return true
      }
    }
  }
  
  return false
}

// Load progress on store initialization
usePuzzleStore.getState().loadProgress() 