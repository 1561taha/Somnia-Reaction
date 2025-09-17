import { create } from 'zustand'
import { createGameEngine } from '../utils/gameEngine'
import { createAIEngine } from '../utils/aiEngine'

// Helper function to count corners controlled by a player
const countCornersControlled = (board, boardSize, playerIndex) => {
  const corners = [
    [0, 0], // top-left
    [0, boardSize.height - 1], // bottom-left
    [boardSize.width - 1, 0], // top-right
    [boardSize.width - 1, boardSize.height - 1] // bottom-right
  ]
  
  return corners.filter(([x, y]) => {
    const cell = board[y][x]
    return cell.owner === playerIndex && cell.orbs > 0
  }).length
}

// Helper function to analyze board state for commentary
const analyzeBoardState = (board, boardSize, currentPlayer, players) => {
  const analysis = {
    cornerOpportunity: false,
    edgeOpportunity: false,
    defensiveMove: false,
    chainSetup: false,
    territoryControl: false,
    lateGame: false
  }
  
  // Check for corner opportunities
  const corners = [
    [0, 0], [0, boardSize.height - 1], 
    [boardSize.width - 1, 0], [boardSize.width - 1, boardSize.height - 1]
  ]
  
  const availableCorners = corners.filter(([x, y]) => {
    const cell = board[y][x]
    return cell.owner === null || cell.owner === currentPlayer
  })
  
  if (availableCorners.length > 0) {
    analysis.cornerOpportunity = true
  }
  
  // Check for edge opportunities
  const edges = []
  for (let x = 0; x < boardSize.width; x++) {
    for (let y = 0; y < boardSize.height; y++) {
      const isEdge = (x === 0 || x === boardSize.width - 1 || y === 0 || y === boardSize.height - 1)
      const isCorner = (x === 0 || x === boardSize.width - 1) && (y === 0 || y === boardSize.height - 1)
      if (isEdge && !isCorner) {
        edges.push([x, y])
      }
    }
  }
  
  const availableEdges = edges.filter(([x, y]) => {
    const cell = board[y][x]
    return cell.owner === null || cell.owner === currentPlayer
  })
  
  if (availableEdges.length > 2) {
    analysis.edgeOpportunity = true
  }
  
  // Check for defensive needs
  const opponent = currentPlayer === 0 ? 1 : 0
  let opponentStrongPositions = 0
  
  for (let y = 0; y < boardSize.height; y++) {
    for (let x = 0; x < boardSize.width; x++) {
      const cell = board[y][x]
      if (cell.owner === opponent && cell.orbs >= cell.criticalMass - 1) {
        opponentStrongPositions++
      }
    }
  }
  
  if (opponentStrongPositions >= 2) {
    analysis.defensiveMove = true
  }
  
  // Check for chain reaction opportunities
  let chainPotential = 0
  for (let y = 0; y < boardSize.height; y++) {
    for (let x = 0; x < boardSize.width; x++) {
      const cell = board[y][x]
      if (cell.owner === currentPlayer && cell.orbs >= cell.criticalMass - 1) {
        // Check if neighbors are also close to explosion
        const neighbors = getNeighbors(x, y, boardSize)
        const neighborChainPotential = neighbors.filter(({ nx, ny }) => {
          const neighborCell = board[ny][nx]
          return neighborCell.owner === currentPlayer && neighborCell.orbs >= neighborCell.criticalMass - 1
        }).length
        chainPotential += neighborChainPotential
      }
    }
  }
  
  if (chainPotential >= 3) {
    analysis.chainSetup = true
  }
  
  // Check for territory control opportunities
  let playerTerritory = 0
  let totalCells = boardSize.width * boardSize.height
  
  for (let y = 0; y < boardSize.height; y++) {
    for (let x = 0; x < boardSize.width; x++) {
      const cell = board[y][x]
      if (cell.owner === currentPlayer) {
        playerTerritory++
      }
    }
  }
  
  if (playerTerritory >= totalCells * 0.3) {
    analysis.territoryControl = true
  }
  
  // Check if it's late game
  const totalOrbs = board.flat().reduce((sum, cell) => sum + cell.orbs, 0)
  if (totalOrbs >= boardSize.width * boardSize.height * 2) {
    analysis.lateGame = true
  }
  
  return analysis
}

// Helper function to generate completion messages
const generateCompletionMessage = (learningLevel, learningStats) => {
  const messages = {
    1: `🎉 Beginner Basics Complete! You've mastered the fundamentals of Somnia Reaction! 
    You created ${learningStats.explosionsCreated} explosions and triggered ${learningStats.chainReactionsTriggered} chain reactions. 
    Ready for the next challenge!`,
    
    2: `🏆 Territory Control Mastered! You've learned to control the board strategically! 
    You controlled ${learningStats.cornersControlled}/4 corners and achieved a maximum chain of ${learningStats.maxChainLength} explosions. 
    Your defensive skills are developing well!`,
    
    3: `⚡ Somnia Reaction Master! You've become a chain reaction expert! 
    You triggered ${learningStats.chainReactionsTriggered} chain reactions with a maximum length of ${learningStats.maxChainLength}. 
    Your timing and setup skills are excellent!`,
    
    4: `🧠 Strategic Thinking Achieved! You've developed advanced strategic thinking! 
    You executed complex strategies with ${learningStats.explosionsCreated} explosions and ${learningStats.chainReactionsTriggered} chain reactions. 
    You're thinking like a true master!`,
    
    5: `👑 Grandmaster Status! You've achieved the ultimate mastery of Somnia Reaction! 
    You completed the challenge in ${learningStats.movesPlayed} moves with ${learningStats.explosionsCreated} explosions. 
    You are now a Somnia Reaction Grandmaster!`
  }
  
  return messages[learningLevel.id] || "🎉 Level completed! Excellent work!"
}

// Helper function to create a deep copy of game state
const createGameStateSnapshot = (state) => ({
  board: state.board.map(row => row.map(cell => ({ ...cell }))),
  players: state.players.map(player => ({ ...player })),
  currentPlayer: state.currentPlayer,
  turn: state.turn,
  gameStatus: state.gameStatus,
  winner: state.winner,
  learningStats: state.learningStats ? { ...state.learningStats } : null,
  levelProgress: state.levelProgress ? { ...state.levelProgress } : null
})

export const useGameStore = create((set, get) => ({
  // Game state
  gameMode: null, // 'local', 'ai', 'online', 'learn'
  gameStatus: 'menu', // 'menu', 'playing', 'paused', 'gameOver'
  board: [],
  boardSize: { width: 8, height: 6 },
  explosionCapacity: 4,
  currentPlayer: 0,
  players: [],
  turn: 1,
  winner: null,
  lastMoveTimestamp: 0, // Add timestamp to force re-renders
  aiMoveIndicator: null, // Add AI move indicator state
  explosionHistory: [], // Add explosion history for atom transitions
  
  // Learning mode specific state
  learningLevel: null,
  learningStats: {
    explosionsCreated: 0,
    chainReactionsTriggered: 0,
    cornersControlled: 0,
    maxChainLength: 0,
    movesPlayed: 0
  },
  commentary: {
    currentTip: null,
    showCommentary: false,
    tipIndex: 0
  },
  levelProgress: {
    objectivesCompleted: [],
    levelCompleted: false,
    completionMessage: null
  },
  levelCompletionScreen: {
    show: false,
    levelId: null,
    stats: null
  },
  
  // UI state
  settings: {
    soundEnabled: true,
    musicEnabled: false,
    animationsEnabled: true,
    darkMode: true,
  },
  
  // Game engines
  gameEngine: null,
  aiEngine: null,
  
  // Undo functionality
  gameHistory: [],
  maxHistorySize: 10, // Keep last 10 moves for undo
  
  // Actions
  initializeGame: (config) => {
    const { gameMode, boardSize, explosionCapacity, players, learningLevel } = config
    
    const gameEngine = createGameEngine(boardSize, explosionCapacity)
    let aiEngine = null
    
    // Create AI engine with appropriate difficulty
    if (gameMode === 'ai') {
      aiEngine = createAIEngine(3) // Default difficulty for regular AI mode
    } else if (gameMode === 'learn' && learningLevel) {
      aiEngine = createAIEngine(learningLevel.aiStrength) // Use learning level difficulty
    }
    
    set({
      gameMode,
      gameStatus: 'playing',
      boardSize,
      explosionCapacity,
      players: players.map(player => ({ ...player, eliminated: false })),
      board: gameEngine.createBoard(),
      currentPlayer: 0,
      turn: 1,
      winner: null,
      gameEngine,
      aiEngine,
      lastMoveTimestamp: Date.now(),
      explosionHistory: [], // Clear explosion history for new game
      learningLevel: learningLevel || null,
      learningStats: {
        explosionsCreated: 0,
        chainReactionsTriggered: 0,
        cornersControlled: 0,
        maxChainLength: 0,
        movesPlayed: 0
      },
      commentary: {
        currentTip: null,
        showCommentary: false,
        tipIndex: 0
      },
      levelProgress: {
        objectivesCompleted: [],
        levelCompleted: false,
        completionMessage: null
      },
      levelCompletionScreen: {
        show: false,
        levelId: null,
        stats: null
      }
    })
    
    // Show initial commentary for learning mode
    if (gameMode === 'learn' && learningLevel) {
      setTimeout(() => {
        get().showNextCommentary()
      }, 1000) // Show commentary 1 second after game starts
    }
  },
  
  placeOrb: async (x, y, playerIndex = null) => {
    const { gameEngine, currentPlayer, players, board, gameMode, gameStatus } = get()
    
    // Use provided playerIndex or fall back to currentPlayer
    const activePlayer = playerIndex !== null ? playerIndex : currentPlayer
    
    if (gameStatus !== 'playing') return false
    if (!gameEngine.canPlaceOrb(board, x, y, activePlayer)) return false
    
    // Check if current player is eliminated - they shouldn't be able to play
    if (players[activePlayer]?.eliminated) return false
    
    // Save current game state for undo (only for human players, not AI)
    if (gameMode !== 'learn' && activePlayer === 0) {
      get().saveGameState()
    }
    
    // Hide commentary when player makes a move
    if (gameMode === 'learn') {
      get().hideCommentary()
    }
    
    // Place the orb
    const newBoard = gameEngine.placeOrb(board, x, y, activePlayer)
    
    // Update board immediately to show the placed orb
    set({
      board: newBoard,
      lastMoveTimestamp: Date.now(),
    })
    
    // Process explosions step-by-step with visual feedback
    let currentExplosionHistory = []
    console.log('🎯 About to call processExplosions with board:', newBoard)
    
    const explosionResult = await gameEngine.processExplosions(newBoard, (boardState, explosions, round) => {
      console.log('🔥 Explosion callback triggered! Round:', round, 'Explosions:', explosions)
      
      // Add current explosions to history
      if (explosions && explosions.length > 0) {
        currentExplosionHistory.push(explosions)
        console.log('🔥 Explosion detected! Round:', round, 'Explosions:', explosions.length)
      }
      
      // Update board state during each explosion round for visual feedback
      set({
        board: boardState,
        lastMoveTimestamp: Date.now(),
        explosionHistory: currentExplosionHistory, // Update with accumulated history
      })
    })
    
    console.log('🎯 Explosion result:', explosionResult)
    
    const { updatedBoard, explosions, chainReactions, explosionHistory } = explosionResult
    
    // CRITICAL FIX: Check for player elimination IMMEDIATELY after explosions
    const eliminatedPlayers = gameEngine.checkPlayerElimination(updatedBoard, players)
    const updatedPlayers = players.map((player, index) => ({
      ...player,
      eliminated: eliminatedPlayers.includes(index),
    }))
    
    // Count remaining active players AFTER elimination check
    const activePlayers = updatedPlayers.filter(player => !player.eliminated)
    
    // CRITICAL FIX: Game over if only 1 or 0 players remain
    let gameStatusNew = 'playing'
    let winner = null
    let nextPlayer = currentPlayer
    
    if (activePlayers.length <= 1) {
      gameStatusNew = 'gameOver'
      winner = activePlayers.length === 1 ? activePlayers[0] : null
    } else {
      // For puzzle mode, always keep player 0 as current player
      if (gameMode === 'puzzle') {
        nextPlayer = 0
      } else {
        // Find next non-eliminated player
        let attempts = 0
        do {
          nextPlayer = (nextPlayer + 1) % players.length
          attempts++
        } while (updatedPlayers[nextPlayer]?.eliminated && attempts < players.length)
        
        // Safety check
        if (attempts >= players.length || updatedPlayers[nextPlayer]?.eliminated) {
          gameStatusNew = 'gameOver'
          winner = null
        }
      }
    }
    
    // Update final state
    set({
      board: updatedBoard,
      currentPlayer: nextPlayer,
      turn: get().turn + 1,
      gameStatus: gameStatusNew,
      winner,
      players: updatedPlayers,
      lastMoveTimestamp: Date.now(),
      explosionHistory: explosions ? explosionHistory : [], // Only store history if there were explosions
      learningStats: get().gameMode === 'learn' ? {
        ...get().learningStats,
        explosionsCreated: get().learningStats.explosionsCreated + (explosions ? 1 : 0),
        chainReactionsTriggered: get().learningStats.chainReactionsTriggered + (chainReactions ? 1 : 0),
        maxChainLength: Math.max(get().learningStats.maxChainLength, explosionResult.totalRounds || 0),
        movesPlayed: get().learningStats.movesPlayed + 1,
        cornersControlled: get().gameMode === 'learn' ? countCornersControlled(updatedBoard, get().boardSize, 0) : get().learningStats.cornersControlled
      } : get().learningStats
    })
    
    // Clear explosion history after a delay to allow final animations to complete
    // BUT only clear it if we're not in puzzle mode, since puzzle mode needs to accumulate history
    if (explosions && gameMode !== 'puzzle') {
      setTimeout(() => {
        set({
          explosionHistory: []
        })
      }, 3000) // Wait 3 seconds before clearing to allow animations to complete
    }
    
    // Check level objectives in learning mode
    if (gameMode === 'learn') {
      const objectiveResult = get().checkLevelObjectives()
      
      // If objectives were just completed, show immediate feedback
      if (objectiveResult && objectiveResult.levelCompleted) {
        // Show completion commentary immediately
        setTimeout(() => {
          get().showLevelCompletion()
        }, 500)
      }
    }
    
    // If AI mode or learning mode and it's AI's turn and game is still playing, make AI move after delay
    if ((gameMode === 'ai' || gameMode === 'learn') && nextPlayer === 1 && gameStatusNew === 'playing' && !updatedPlayers[1]?.eliminated) {
      console.log('AI move scheduled:', { gameMode, nextPlayer, gameStatusNew, aiEliminated: updatedPlayers[1]?.eliminated })
      setTimeout(() => {
        const currentState = get()
        if (currentState.gameStatus === 'playing' && currentState.currentPlayer === 1 && !currentState.players[1]?.eliminated) {
          console.log('AI move executing...')
          get().makeAIMove()
        } else {
          console.log('AI move cancelled:', { gameStatus: currentState.gameStatus, currentPlayer: currentState.currentPlayer, aiEliminated: currentState.players[1]?.eliminated })
        }
      }, 800)
    }
    
    // Show commentary before player's turn in learning mode
    if (gameMode === 'learn' && nextPlayer === 0 && gameStatusNew === 'playing' && !updatedPlayers[0]?.eliminated) {
      setTimeout(() => {
        const currentState = get()
        if (currentState.gameStatus === 'playing' && currentState.currentPlayer === 0 && !currentState.players[0]?.eliminated) {
          get().showNextCommentary()
        }
      }, 1000) // Show commentary 1 second after AI move completes
    }
    
    return { explosions, chainReactions, explosionHistory }
  },
  
  makeAIMove: async () => {
    const { aiEngine, board, players, boardSize, gameStatus, currentPlayer, gameEngine, gameMode, learningLevel } = get()
    
    if (gameStatus !== 'playing' || !aiEngine || currentPlayer !== 1 || players[1]?.eliminated) {
      console.log('AI move skipped:', { gameStatus, hasAI: !!aiEngine, currentPlayer, aiEliminated: players[1]?.eliminated })
      return
    }
    
    // Set AI thinking indicator
    set({ aiMoveIndicator: { type: 'thinking' } })
    
    // Small delay to show thinking
    await new Promise(resolve => setTimeout(resolve, 400))
    
    try {
      const move = aiEngine.calculateMove(board, players, boardSize, gameEngine)
      console.log('🤖 AI calculated move:', move)
      
      if (move) {
        // Show AI move position
        console.log('🤖 Setting AI move indicator to:', { type: 'move', position: move })
        set({ aiMoveIndicator: { type: 'move', position: move } })
        
        // Wait to show the move indicator
        await new Promise(resolve => setTimeout(resolve, 600))
        
        // Make the AI move
        console.log('🤖 Executing AI move at:', move.x, move.y)
        await get().placeOrb(move.x, move.y)
      } else {
        // Fallback: try to find any valid move
        const validMoves = []
        for (let y = 0; y < boardSize.height; y++) {
          for (let x = 0; x < boardSize.width; x++) {
            const cell = board[y][x]
            if (cell.orbs === 0 || cell.owner === 1) {
              validMoves.push({ x, y })
            }
          }
        }
        
        if (validMoves.length > 0) {
          const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
          console.log('🤖 AI fallback random move:', randomMove)
          
          // Show AI move position
          set({ aiMoveIndicator: { type: 'move', position: randomMove } })
          
          // Wait to show the move indicator
          await new Promise(resolve => setTimeout(resolve, 600))
          
          // Make the AI move
          await get().placeOrb(randomMove.x, randomMove.y)
        }
      }
    } catch (error) {
      console.error('AI move error:', error)
      // If AI calculation fails, make a simple random move
      const validMoves = []
      for (let y = 0; y < boardSize.height; y++) {
        for (let x = 0; x < boardSize.width; x++) {
          const cell = board[y][x]
          if (cell.orbs === 0 || cell.owner === 1) {
            validMoves.push({ x, y })
          }
        }
      }
      
      if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)]
        await get().placeOrb(randomMove.x, randomMove.y)
      }
    } finally {
      // Clear AI indicator
      set({ aiMoveIndicator: null })
    }
  },
  
  pauseGame: () => {
    set({ gameStatus: 'paused' })
  },
  
  resumeGame: () => {
    set({ gameStatus: 'playing' })
  },
  
  restartGame: () => {
    const { gameEngine, players, boardSize, explosionCapacity, gameMode, learningLevel } = get()
    
    if (!gameEngine) return
    
    const resetPlayers = players.map(player => ({ ...player, eliminated: false }))
    
    set({
      board: gameEngine.createBoard(),
      currentPlayer: 0,
      turn: 1,
      winner: null,
      gameStatus: 'playing',
      players: resetPlayers,
      lastMoveTimestamp: Date.now(),
      commentary: {
        currentTip: null,
        showCommentary: false,
        tipIndex: 0
      },
      levelProgress: {
        objectivesCompleted: [],
        levelCompleted: false,
        completionMessage: null
      },
      levelCompletionScreen: {
        show: false,
        levelId: null,
        stats: null
      }
    })
    
    // Show initial commentary for learning mode after restart
    if (gameMode === 'learn' && learningLevel) {
      setTimeout(() => {
        get().showNextCommentary()
      }, 1000)
    }
  },
  
  resetGame: () => {
    set({
      gameMode: null,
      gameStatus: 'menu',
      board: [],
      currentPlayer: 0,
      players: [],
      turn: 1,
      winner: null,
      gameEngine: null,
      aiEngine: null,
      lastMoveTimestamp: 0,
      aiMoveIndicator: null,
      learningLevel: null,
      learningStats: {
        explosionsCreated: 0,
        chainReactionsTriggered: 0,
        cornersControlled: 0,
        maxChainLength: 0,
        movesPlayed: 0
      },
      commentary: {
        currentTip: null,
        showCommentary: false,
        tipIndex: 0
      },
      levelProgress: {
        objectivesCompleted: [],
        levelCompleted: false,
        completionMessage: null
      },
      levelCompletionScreen: {
        show: false,
        levelId: null,
        stats: null
      }
    })
  },
  
  updateSettings: (newSettings) => {
    set({ settings: { ...get().settings, ...newSettings } })
  },

  // Commentary system for learning mode
  generateCommentary: () => {
    const { board, boardSize, currentPlayer, players, learningLevel, turn, gameMode, learningStats, levelProgress } = get()
    
    if (gameMode !== 'learn' || !learningLevel) return null
    
    const objectives = learningLevel.objectives
    const completedObjectives = levelProgress.objectivesCompleted || []
    
    // Find incomplete objectives
    const incompleteObjectives = objectives.filter((_, index) => !completedObjectives.includes(index))
    
    // If all objectives are completed, show completion message
    if (incompleteObjectives.length === 0) {
      return {
        tip: "🎉 All objectives completed! You've mastered this level!",
        tipIndex: 999,
        analysis: { allCompleted: true }
      }
    }
    
    // Generate contextual advice based on incomplete objectives
    let contextualTip = ""
    let priority = 0
    
    // Check each incomplete objective and provide specific guidance
    incompleteObjectives.forEach((objective, index) => {
      let currentPriority = 0
      let tip = ""
      
      if (objective.includes('first explosion')) {
        if (learningStats.explosionsCreated === 0) {
          tip = "💥 Create your first explosion! Place orbs in cells until they reach critical mass (2 for corners, 3 for edges, 4 for center)."
          currentPriority = 10
        }
      } else if (objective.includes('chain reactions work')) {
        if (learningStats.chainReactionsTriggered === 0) {
          tip = "⚡ Trigger a chain reaction! When one cell explodes, it can cause neighboring cells to explode too. Try setting up multiple cells near critical mass."
          currentPriority = 9
        }
      } else if (objective.includes('critical mass')) {
        if (learningStats.explosionsCreated === 0) {
          tip = "🎯 Understand critical mass! Corner cells explode with 2 orbs, edge cells with 3 orbs, and center cells with 4 orbs."
          currentPriority = 8
        }
      } else if (objective.includes('3 corners')) {
        const cornersNeeded = 3 - learningStats.cornersControlled
        if (cornersNeeded > 0) {
          tip = `🏰 Control ${cornersNeeded} more corner${cornersNeeded > 1 ? 's' : ''}! Corners are strategic positions that only need 2 orbs to explode.`
          currentPriority = 7
        }
      } else if (objective.includes('5+ explosions')) {
        if (learningStats.maxChainLength < 5) {
          tip = "🔥 Create a chain of 5+ explosions! Plan your moves to create cascading explosions that sweep across the board."
          currentPriority = 6
        }
      } else if (objective.includes('defend against AI')) {
        if (learningStats.movesPlayed < 5) {
          tip = "🛡️ Play at least 5 moves to learn defensive strategies! Focus on blocking the AI's potential explosions."
          currentPriority = 5
        } else if (players[0]?.eliminated) {
          tip = "⚠️ You were eliminated! Try to stay alive longer by being more defensive and strategic."
          currentPriority = 9
        }
      } else if (objective.includes('8+ cells')) {
        if (learningStats.maxChainLength < 8) {
          tip = "🌟 Create a massive chain reaction of 8+ cells! This requires careful planning and setup."
          currentPriority = 4
        }
      } else if (objective.includes('only chain reactions')) {
        if (learningStats.chainReactionsTriggered < 3) {
          tip = `⚡ Trigger ${3 - learningStats.chainReactionsTriggered} more chain reaction${3 - learningStats.chainReactionsTriggered > 1 ? 's' : ''}! Focus on creating cascading explosions.`
          currentPriority = 3
        }
      } else if (objective.includes('losing position')) {
        if (learningStats.movesPlayed < 10) {
          tip = "📚 Play at least 10 moves to learn how to handle difficult situations and losing positions."
          currentPriority = 2
        }
      } else if (objective.includes('consistently')) {
        if (learningStats.movesPlayed < 15) {
          tip = "🎯 Play at least 15 moves to demonstrate consistent strategic thinking and execution."
          currentPriority = 1
        }
      } else if (objective.includes('multi-step strategies')) {
        if (learningStats.chainReactionsTriggered < 2 || learningStats.maxChainLength < 6) {
          tip = "🧠 Execute multi-step strategies! Plan several moves ahead to create complex chain reactions of 6+ cells."
          currentPriority = 3
        }
      } else if (objective.includes('all previous concepts')) {
        if (learningStats.explosionsCreated < 5 || learningStats.chainReactionsTriggered < 3) {
          tip = "🎓 Master all concepts! Create 5+ explosions and 3+ chain reactions to demonstrate complete understanding."
          currentPriority = 2
        }
      } else if (objective.includes('under 30 moves')) {
        if (turn > 30) {
          tip = "⏱️ Complete the level in under 30 moves! Be more efficient and strategic with your moves."
          currentPriority = 8
        }
      } else if (objective.includes('true mastery')) {
        if (learningStats.explosionsCreated < 8 || learningStats.chainReactionsTriggered < 5) {
          tip = "👑 Achieve true mastery! Create 8+ explosions and 5+ chain reactions to prove your expertise."
          currentPriority = 1
        }
      }
      
      // Update if this objective has higher priority
      if (currentPriority > priority) {
        priority = currentPriority
        contextualTip = tip
      }
    })
    
    // If no specific tip was generated, provide general guidance
    if (!contextualTip) {
      const analysis = analyzeBoardState(board, boardSize, currentPlayer, players)
      
      if (analysis.cornerOpportunity) {
        contextualTip = "🎯 Corner opportunity! Place an orb in a corner cell - they only need 2 orbs to explode."
      } else if (analysis.edgeOpportunity) {
        contextualTip = "📐 Edge advantage! Edge cells need only 3 orbs to explode. Look for edge positions."
      } else if (analysis.defensiveMove) {
        contextualTip = "🛡️ Defensive play needed! The AI is building up a strong position. Consider blocking their potential explosions."
      } else if (analysis.chainSetup) {
        contextualTip = "⚡ Chain reaction setup! Position your orbs to create cascading explosions."
      } else if (turn <= 3) {
        contextualTip = "🚀 Early game strategy: Start by claiming corners and edges. They're easier to explode."
      } else {
        contextualTip = "🎯 Focus on completing your remaining objectives! Check the sidebar to see what you still need to achieve."
      }
    }
    
    return {
      tip: contextualTip,
      tipIndex: get().commentary.tipIndex,
      analysis: { incompleteObjectives: incompleteObjectives.length }
    }
  },

  showNextCommentary: () => {
    const commentary = get().generateCommentary()
    if (commentary) {
      set({
        commentary: {
          currentTip: commentary.tip,
          showCommentary: true,
          tipIndex: commentary.tipIndex
        }
      })
    }
  },

  hideCommentary: () => {
    set({
      commentary: {
        ...get().commentary,
        showCommentary: false
      }
    })
  },

  // Level completion system
  checkLevelObjectives: () => {
    const { board, boardSize, learningLevel, learningStats, turn, gameStatus, players, gameMode } = get()
    
    if (!learningLevel || gameStatus !== 'playing') return
    
    const objectives = learningLevel.objectives
    const completedObjectives = []
    let allCompleted = true
    
    // Check each objective
    objectives.forEach((objective, index) => {
      let completed = false
      
      if (objective.includes('first explosion')) {
        completed = learningStats.explosionsCreated >= 1
      } else if (objective.includes('chain reactions work')) {
        completed = learningStats.chainReactionsTriggered >= 1
      } else if (objective.includes('critical mass')) {
        completed = learningStats.explosionsCreated >= 1
      } else if (objective.includes('3 corners')) {
        completed = learningStats.cornersControlled >= 3
      } else if (objective.includes('5+ explosions')) {
        completed = learningStats.chainReactionsTriggered >= 1 && learningStats.maxChainLength >= 5
      } else if (objective.includes('defend against AI')) {
        completed = learningStats.movesPlayed >= 5 && !players[0]?.eliminated
      } else if (objective.includes('8+ cells')) {
        completed = learningStats.maxChainLength >= 8
      } else if (objective.includes('only chain reactions')) {
        completed = learningStats.chainReactionsTriggered >= 3
      } else if (objective.includes('losing position')) {
        completed = learningStats.movesPlayed >= 10 && !players[0]?.eliminated
      } else if (objective.includes('consistently')) {
        completed = learningStats.movesPlayed >= 15 && !players[0]?.eliminated
      } else if (objective.includes('multi-step strategies')) {
        completed = learningStats.chainReactionsTriggered >= 2 && learningStats.maxChainLength >= 6
      } else if (objective.includes('all previous concepts')) {
        completed = learningStats.explosionsCreated >= 5 && learningStats.chainReactionsTriggered >= 3
      } else if (objective.includes('under 30 moves')) {
        completed = turn <= 30 && !players[0]?.eliminated
      } else if (objective.includes('true mastery')) {
        completed = learningStats.explosionsCreated >= 8 && learningStats.chainReactionsTriggered >= 5
      }
      
      if (completed) {
        completedObjectives.push(index)
      } else {
        allCompleted = false
      }
    })
    
    // Check if level is completed (all objectives met)
    const levelCompleted = allCompleted && players[0] && !players[0].eliminated
    
    set({
      levelProgress: {
        objectivesCompleted: completedObjectives,
        levelCompleted,
        completionMessage: levelCompleted ? generateCompletionMessage(learningLevel, learningStats) : null
      }
    })
    
    // If level is completed, show completion screen immediately
    if (levelCompleted && !get().levelCompletionScreen.show) {
      setTimeout(() => {
        get().showLevelCompletionScreen()
      }, 1000) // Show completion screen 1 second after objectives are met
    }
    
    // Update commentary to reflect new objective progress
    if (gameMode === 'learn' && get().commentary.showCommentary) {
      setTimeout(() => {
        get().showNextCommentary()
      }, 500) // Update commentary 0.5 seconds after objective check
    }
    
    return { completedObjectives, allCompleted, levelCompleted }
  },

  showLevelCompletion: () => {
    const { levelProgress } = get()
    if (levelProgress.levelCompleted && levelProgress.completionMessage) {
      // Show completion message in commentary
      set({
        commentary: {
          currentTip: levelProgress.completionMessage,
          showCommentary: true,
          tipIndex: 999 // Special index for completion message
        }
      })
    }
  },

  showLevelCompletionScreen: () => {
    const { learningLevel, learningStats, levelProgress } = get()
    if (levelProgress.levelCompleted) {
      set({
        levelCompletionScreen: {
          show: true,
          levelId: learningLevel?.id || 1,
          stats: { ...learningStats }
        }
      })
    }
  },

  hideLevelCompletionScreen: () => {
    set({
      levelCompletionScreen: {
        show: false,
        levelId: null,
        stats: null
      }
    })
  },
  
  // Getters
  getCurrentPlayer: () => {
    const { players, currentPlayer } = get()
    return players[currentPlayer]
  },
  
  getActivePlayers: () => {
    const { players } = get()
    return players.filter(player => !player.eliminated)
  },
  
  getPlayerScore: (playerIndex) => {
    const { board, boardSize } = get()
    let score = 0
    
    for (let y = 0; y < boardSize.height; y++) {
      for (let x = 0; x < boardSize.width; x++) {
        const cell = board[y][x]
        if (cell.owner === playerIndex && cell.orbs > 0) {
          score += cell.orbs
        }
      }
    }
    
    return score
  },
  
  canPlaceOrb: (x, y) => {
    const { gameEngine, board, currentPlayer, players, gameStatus, gameMode } = get()
    if (!gameEngine || gameStatus !== 'playing') return false
    if (players[currentPlayer]?.eliminated) return false
    
    // Prevent human player from making moves during AI's turn
    if ((gameMode === 'ai' || gameMode === 'learn') && currentPlayer === 1) {
      // This is AI's turn - only allow AI to make moves, not human
      return false
    }
    
    return gameEngine.canPlaceOrb(board, x, y, currentPlayer)
  },

  setBoard: (newBoard) => {
    set({
      board: newBoard,
      lastMoveTimestamp: Date.now()
    })
  },

  // Undo functionality
  saveGameState: () => {
    const state = get()
    const snapshot = createGameStateSnapshot(state)
    const { gameHistory, maxHistorySize } = state
    
    // Add current state to history
    const newHistory = [...gameHistory, snapshot]
    
    // Keep only the last maxHistorySize states
    if (newHistory.length > maxHistorySize) {
      newHistory.shift() // Remove oldest state
    }
    
    set({ gameHistory: newHistory })
  },

  undo: () => {
    const { gameHistory, gameMode } = get()
    
    if (gameHistory.length === 0) {
      console.log('No moves to undo')
      return false
    }
    
    // Don't allow undo in learning mode to prevent cheating
    if (gameMode === 'learn') {
      console.log('Undo not allowed in learning mode')
      return false
    }
    
    // Get the previous state
    const previousState = gameHistory[gameHistory.length - 1]
    const newHistory = gameHistory.slice(0, -1) // Remove the last state
    
    // Restore the previous state
    set({
      board: previousState.board,
      players: previousState.players,
      currentPlayer: previousState.currentPlayer,
      turn: previousState.turn,
      gameStatus: previousState.gameStatus,
      winner: previousState.winner,
      learningStats: previousState.learningStats,
      levelProgress: previousState.levelProgress,
      gameHistory: newHistory,
      lastMoveTimestamp: Date.now()
    })
    
    console.log('Undo successful - restored to previous state')
    return true
  },

  canUndo: () => {
    const { gameHistory, gameMode } = get()
    return gameHistory.length > 0 && gameMode !== 'learn'
  },
})) 