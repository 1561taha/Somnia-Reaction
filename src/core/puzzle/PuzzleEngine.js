// Core Puzzle Engine for Somnia Reaction
export class PuzzleEngine {
  constructor() {
    this.objectiveTypes = {
      ELIMINATE_OPPONENT: 'eliminate_opponent',
      CONTROL_TERRITORY: 'control_territory',
      CREATE_CHAIN: 'create_chain',
      SURVIVE_TURNS: 'survive_turns',
      EFFICIENCY: 'efficiency',
      TIMING: 'timing',
      CAPTURE_CORNERS: 'capture_corners',
      MAXIMIZE_EXPLOSIONS: 'maximize_explosions'
    }
  }

  // Validate if puzzle objective is completed
  validateObjective(board, players, objective, gameState) {
    // Defensive checks
    if (!board || !Array.isArray(board)) {
      console.error('❌ validateObjective: board is undefined or not an array:', board)
      return false
    }
    
    if (!objective || !objective.type) {
      console.error('❌ validateObjective: objective is undefined or missing type:', objective)
      return false
    }
    
    switch (objective.type) {
      case this.objectiveTypes.ELIMINATE_OPPONENT:
        return this.validateElimination(board, players, objective)
      
      case this.objectiveTypes.CONTROL_TERRITORY:
        return this.validateTerritoryControl(board, objective)
      
      case this.objectiveTypes.CREATE_CHAIN:
        return this.validateChainReaction(gameState, objective)
      
      case this.objectiveTypes.SURVIVE_TURNS:
        return this.validateSurvival(gameState, objective)
      
      case this.objectiveTypes.EFFICIENCY:
        return this.validateEfficiency(gameState, objective)
      
      case this.objectiveTypes.TIMING:
        return this.validateTiming(gameState, objective)
      
      case this.objectiveTypes.CAPTURE_CORNERS:
        return this.validateCornerCapture(board, objective)
      
      case this.objectiveTypes.MAXIMIZE_EXPLOSIONS:
        return this.validateExplosionCount(gameState, objective)
      
      default:
        console.warn('⚠️ validateObjective: Unknown objective type:', objective.type)
        return false
    }
  }

  // Validate opponent elimination
  validateElimination(board, players, objective) {
    // Defensive checks
    if (!board || !Array.isArray(board)) {
      console.error('❌ validateElimination: board is undefined or not an array:', board)
      return false
    }
    
    const targetPlayer = objective.targetPlayer || objective.target || 1 // Default to AI opponent (player 1)
    
    // Check if the target player has any orbs on the board
    let hasOrbs = false
    let totalOrbs = 0
    
    try {
      board.forEach(row => {
        if (!Array.isArray(row)) {
          console.error('❌ validateElimination: row is not an array:', row)
          return
        }
        
        row.forEach(cell => {
          if (cell && cell.owner === targetPlayer && cell.orbs > 0) {
            hasOrbs = true
            totalOrbs += cell.orbs
          }
        })
      })
    } catch (error) {
      console.error('❌ validateElimination error:', error)
      return false
    }
    
    console.log(`🔍 Elimination check for player ${targetPlayer}: hasOrbs=${hasOrbs}, totalOrbs=${totalOrbs}`)
    
    // Player is eliminated if they have no orbs
    // But don't consider them eliminated if they have orbs
    return !hasOrbs && totalOrbs === 0
  }

  // Validate territory control percentage
  validateTerritoryControl(board, objective) {
    // Defensive checks
    if (!board || !Array.isArray(board)) {
      console.error('❌ validateTerritoryControl: board is undefined or not an array:', board)
      return false
    }
    
    const targetPercentage = objective.target || 50
    const playerIndex = objective.player || 0
    
    let totalCells = 0
    let controlledCells = 0
    
    try {
      board.forEach(row => {
        if (!Array.isArray(row)) {
          console.error('❌ validateTerritoryControl: row is not an array:', row)
          return
        }
        
        row.forEach(cell => {
          if (cell) {
            totalCells++
            if (cell.owner === playerIndex) {
              controlledCells++
            }
          }
        })
      })
    } catch (error) {
      console.error('❌ validateTerritoryControl error:', error)
      return false
    }
    
    const percentage = (controlledCells / totalCells) * 100
    return percentage >= targetPercentage
  }

  // Validate chain reaction length
  validateChainReaction(gameState, objective) {
    const targetLength = objective.target || 3
    const maxChainLength = gameState.maxChainLength || 0
    return maxChainLength >= targetLength
  }

  // Validate survival turns
  validateSurvival(gameState, objective) {
    const targetTurns = objective.target || 5
    const currentTurn = gameState.turn || 0
    return currentTurn >= targetTurns
  }

  // Validate efficiency (moves used vs optimal)
  validateEfficiency(gameState, objective) {
    const maxMoves = objective.maxMoves || 10
    const movesUsed = gameState.movesUsed || 0
    return movesUsed <= maxMoves
  }

  // Validate timing objectives
  validateTiming(gameState, objective) {
    const targetTurn = objective.targetTurn || 3
    const currentTurn = gameState.turn || 0
    return currentTurn <= targetTurn
  }

  // Validate corner capture
  validateCornerCapture(board, objective) {
    // Defensive checks
    if (!board || !Array.isArray(board) || board.length === 0) {
      console.error('❌ validateCornerCapture: board is undefined, not an array, or empty:', board)
      return false
    }
    
    const targetCorners = objective.target || 2
    const playerIndex = objective.player || 0
    const boardSize = { width: board[0].length, height: board.length }
    
    let cornersControlled = 0
    const cornerPositions = [
      { x: 0, y: 0 },
      { x: boardSize.width - 1, y: 0 },
      { x: 0, y: boardSize.height - 1 },
      { x: boardSize.width - 1, y: boardSize.height - 1 }
    ]
    
    try {
      cornerPositions.forEach(({ x, y }) => {
        if (board[y] && board[y][x] && board[y][x].owner === playerIndex) {
          cornersControlled++
        }
      })
    } catch (error) {
      console.error('❌ validateCornerCapture error:', error)
      return false
    }
    
    return cornersControlled >= targetCorners
  }

  // Validate explosion count
  validateExplosionCount(gameState, objective) {
    const targetExplosions = objective.target || 5
    const explosionCount = gameState.explosionCount || 0
    return explosionCount >= targetExplosions
  }

  // Check if puzzle is completed
  isPuzzleCompleted(board, players, objectives, gameState) {
    // Defensive checks
    if (!objectives || !Array.isArray(objectives)) {
      console.error('❌ isPuzzleCompleted: objectives is undefined or not an array:', objectives)
      return false
    }
    
    if (objectives.length === 0) {
      return true // No objectives means puzzle is complete
    }
    
    return objectives.every(objective => 
      this.validateObjective(board, players, objective, gameState)
    )
  }

  // Calculate puzzle progress (0-100%)
  calculateProgress(board, players, objectives, gameState) {
    if (objectives.length === 0) return 100
    
    const completedObjectives = objectives.filter(objective =>
      this.validateObjective(board, players, objective, gameState)
    )
    
    return (completedObjectives.length / objectives.length) * 100
  }

  // Get next objective hint
  getNextObjectiveHint(objectives, gameState) {
    const incompleteObjectives = objectives.filter(objective => {
      // This would need the actual board state to validate
      // For now, return a generic hint
      return true
    })
    
    if (incompleteObjectives.length === 0) {
      return "All objectives completed! Great job!"
    }
    
    const nextObjective = incompleteObjectives[0]
    return this.getObjectiveHint(nextObjective)
  }

  // Get hint for specific objective
  getObjectiveHint(objective) {
    switch (objective.type) {
      case this.objectiveTypes.ELIMINATE_OPPONENT:
        return "Focus on creating chain reactions to eliminate your opponent's orbs"
      
      case this.objectiveTypes.CONTROL_TERRITORY:
        return `Try to control at least ${objective.target}% of the board`
      
      case this.objectiveTypes.CREATE_CHAIN:
        return `Create a chain reaction of at least ${objective.target} explosions`
      
      case this.objectiveTypes.SURVIVE_TURNS:
        return `Survive for ${objective.target} turns by maintaining territory control`
      
      case this.objectiveTypes.EFFICIENCY:
        return `Complete the objective using ${objective.maxMoves} moves or fewer`
      
      case this.objectiveTypes.TIMING:
        return `Complete the objective by turn ${objective.targetTurn}`
      
      case this.objectiveTypes.CAPTURE_CORNERS:
        return `Capture at least ${objective.target} corner positions`
      
      case this.objectiveTypes.MAXIMIZE_EXPLOSIONS:
        return `Trigger at least ${objective.target} explosions`
      
      default:
        return "Think strategically about your next move"
    }
  }

  // Calculate puzzle difficulty score
  calculateDifficulty(objectives, boardSize, moveLimit) {
    let score = 0
    
    // Base score from objectives
    score += objectives.length * 10
    
    // Board size factor
    score += (boardSize.width * boardSize.height) * 0.5
    
    // Move limit factor (fewer moves = harder)
    if (moveLimit) {
      score += (50 - moveLimit) * 2
    }
    
    // Objective type complexity
    objectives.forEach(objective => {
      switch (objective.type) {
        case this.objectiveTypes.ELIMINATE_OPPONENT:
          score += 15
          break
        case this.objectiveTypes.CONTROL_TERRITORY:
          score += 10
          break
        case this.objectiveTypes.CREATE_CHAIN:
          score += 20
          break
        case this.objectiveTypes.SURVIVE_TURNS:
          score += 12
          break
        case this.objectiveTypes.EFFICIENCY:
          score += 25
          break
        case this.objectiveTypes.TIMING:
          score += 18
          break
        case this.objectiveTypes.CAPTURE_CORNERS:
          score += 8
          break
        case this.objectiveTypes.MAXIMIZE_EXPLOSIONS:
          score += 15
          break
      }
    })
    
    return Math.min(100, Math.max(1, score))
  }

  // Get difficulty level from score
  getDifficultyLevel(score) {
    if (score <= 20) return 'beginner'
    if (score <= 40) return 'easy'
    if (score <= 60) return 'medium'
    if (score <= 80) return 'hard'
    return 'expert'
  }
} 