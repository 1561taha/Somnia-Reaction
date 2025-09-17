import { createGameEngine } from '../../utils/gameEngine'

export class PuzzleEngine {
  constructor(boardSize, explosionCapacity = 4) {
    this.gameEngine = createGameEngine(boardSize, explosionCapacity)
    this.boardSize = boardSize
    this.explosionCapacity = explosionCapacity
  }

  // Validate a move in the context of a puzzle
  validateMove(board, move, puzzle) {
    const { x, y } = move
    
    // Check if coordinates are valid
    if (x < 0 || x >= this.boardSize.width || y < 0 || y >= this.boardSize.height) {
      return { valid: false, reason: 'Invalid coordinates' }
    }

    const cell = board[y][x]
    
    // Check if cell belongs to current player
    if (cell.owner !== null && cell.owner !== 0) {
      return { valid: false, reason: 'Cell belongs to opponent' }
    }

    // Check if move is within puzzle constraints
    if (puzzle.maxMoves && puzzle.currentMove >= puzzle.maxMoves) {
      return { valid: false, reason: 'Maximum moves reached' }
    }

    return { valid: true }
  }

  // Execute a move and return the new board state
  async executeMove(board, move, currentPlayer) {
    const { x, y } = move
    const newBoard = JSON.parse(JSON.stringify(board)) // Deep copy
    
    // Add orb to the cell
    newBoard[y][x].orbs++
    newBoard[y][x].owner = currentPlayer

    // Process explosions
    const explosionResult = await this.gameEngine.processExplosions(newBoard, (boardState, explosions, round) => {
      // Update board with explosion results
      Object.assign(newBoard, boardState)
    })

    return {
      board: newBoard,
      explosions: explosionResult?.explosions || [],
      chainReaction: explosionResult?.chainReaction || false
    }
  }

  // Execute static opponent move
  executeStaticMove(board, puzzle, currentTurn) {
    const opponentMove = puzzle.opponentMoves.find(move => move.turn === currentTurn)
    
    if (!opponentMove) {
      return { board, move: null }
    }

    // Execute opponent move
    const { x, y } = opponentMove
    const newBoard = JSON.parse(JSON.stringify(board))
    newBoard[y][x].orbs++
    newBoard[y][x].owner = 1 // Opponent

    // Process explosions for opponent
    return this.gameEngine.processExplosionsSync(newBoard)
  }

  // AI opponent logic
  async executeAIMove(board, puzzle, playerMoves) {
    const aiConfig = puzzle.aiConfig
    const difficulty = aiConfig.difficulty || 3
    const strategy = aiConfig.strategy || 'balanced'
    
    // Get all valid moves for AI
    const validMoves = this.getValidMoves(board, 1) // AI is player 1
    
    if (validMoves.length === 0) {
      return { board, move: null }
    }

    // AI decision making based on difficulty and strategy
    const bestMove = this.selectAIMove(board, validMoves, difficulty, strategy, playerMoves)
    
    if (!bestMove) {
      return { board, move: null }
    }

    // Execute AI move
    const result = await this.executeMove(board, bestMove, 1)
    
    return {
      board: result.board,
      move: bestMove,
      explosions: result.explosions
    }
  }

  // Get all valid moves for a player
  getValidMoves(board, playerIndex) {
    const moves = []
    
    for (let y = 0; y < this.boardSize.height; y++) {
      for (let x = 0; x < this.boardSize.width; x++) {
        const cell = board[y][x]
        
        // Check if cell is empty or belongs to player
        if (cell.owner === null || cell.owner === playerIndex) {
          moves.push({ x, y })
        }
      }
    }
    
    return moves
  }

  // AI move selection logic
  selectAIMove(board, validMoves, difficulty, strategy, playerMoves) {
    // Simple AI for now - can be enhanced later
    const moveScores = validMoves.map(move => {
      return {
        move,
        score: this.evaluateMove(board, move, difficulty, strategy)
      }
    })

    // Sort by score (higher is better)
    moveScores.sort((a, b) => b.score - a.score)

    // Add randomness based on difficulty
    const randomness = (6 - difficulty) * 0.2 // Higher difficulty = less random
    const randomIndex = Math.floor(Math.random() * Math.min(3, moveScores.length))
    
    // Sometimes pick a random move instead of the best one
    if (Math.random() < randomness) {
      return moveScores[randomIndex].move
    }

    return moveScores[0].move
  }

  // Evaluate a move for AI
  evaluateMove(board, move, difficulty, strategy) {
    const { x, y } = move
    let score = 0

    // Base score for the move
    score += this.evaluatePosition(board, x, y)
    
    // Strategy-based scoring
    if (strategy === 'aggressive') {
      score += this.evaluateAggressiveMove(board, x, y)
    } else if (strategy === 'defensive') {
      score += this.evaluateDefensiveMove(board, x, y)
    } else {
      // Balanced strategy
      score += this.evaluateBalancedMove(board, x, y)
    }

    // Difficulty affects scoring precision
    score *= (difficulty / 5)

    return score
  }

  // Evaluate position value
  evaluatePosition(board, x, y) {
    let score = 0
    
    // Corners are valuable
    const isCorner = (x === 0 || x === this.boardSize.width - 1) && 
                     (y === 0 || y === this.boardSize.height - 1)
    if (isCorner) score += 10

    // Edges are good
    const isEdge = (x === 0 || x === this.boardSize.width - 1 || 
                   y === 0 || y === this.boardSize.height - 1)
    if (isEdge && !isCorner) score += 5

    // Center control
    const centerX = Math.floor(this.boardSize.width / 2)
    const centerY = Math.floor(this.boardSize.height / 2)
    const distanceFromCenter = Math.abs(x - centerX) + Math.abs(y - centerY)
    score += (10 - distanceFromCenter)

    return score
  }

  // Evaluate aggressive move
  evaluateAggressiveMove(board, x, y) {
    let score = 0
    
    // Look for opportunities to create explosions
    const cell = board[y][x]
    const criticalMass = this.getCriticalMass(x, y)
    
    if (cell.orbs + 1 >= criticalMass) {
      score += 20 // High value for explosion potential
    }

    // Look for chain reaction opportunities
    const neighbors = this.getNeighbors(x, y)
    neighbors.forEach(({ nx, ny }) => {
      const neighbor = board[ny][nx]
      if (neighbor.owner === 1 && neighbor.orbs + 1 >= this.getCriticalMass(nx, ny)) {
        score += 15 // Chain reaction potential
      }
    })

    return score
  }

  // Evaluate defensive move
  evaluateDefensiveMove(board, x, y) {
    let score = 0
    
    // Protect own cells
    const neighbors = this.getNeighbors(x, y)
    neighbors.forEach(({ nx, ny }) => {
      const neighbor = board[ny][nx]
      if (neighbor.owner === 1) {
        score += 10 // Protect own territory
      }
    })

    // Avoid dangerous positions
    const cell = board[y][x]
    const criticalMass = this.getCriticalMass(x, y)
    
    if (cell.orbs + 1 >= criticalMass) {
      score -= 5 // Be cautious about explosions
    }

    return score
  }

  // Evaluate balanced move
  evaluateBalancedMove(board, x, y) {
    return (this.evaluateAggressiveMove(board, x, y) + 
            this.evaluateDefensiveMove(board, x, y)) / 2
  }

  // Get neighboring cells
  getNeighbors(x, y) {
    const neighbors = []
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ]

    directions.forEach(([dx, dy]) => {
      const nx = x + dx
      const ny = y + dy
      
      if (nx >= 0 && nx < this.boardSize.width && 
          ny >= 0 && ny < this.boardSize.height) {
        neighbors.push({ nx, ny })
      }
    })

    return neighbors
  }

  // Get critical mass for a cell
  getCriticalMass(x, y) {
    const isCorner = (x === 0 || x === this.boardSize.width - 1) && 
                     (y === 0 || y === this.boardSize.height - 1)
    const isEdge = (x === 0 || x === this.boardSize.width - 1 || 
                   y === 0 || y === this.boardSize.height - 1)
    
    if (isCorner) return 2
    if (isEdge) return 3
    return 4
  }

  // Check if puzzle objective is achieved
  checkObjective(board, puzzle) {
    const objective = puzzle.objective.toLowerCase()
    
    // Check for elimination objective
    if (objective.includes('eliminate')) {
      const activePlayers = this.getActivePlayers(board)
      return activePlayers.length === 1 && activePlayers[0] === 0
    }
    
    // Check for corner control objective
    if (objective.includes('corner')) {
      return this.checkCornerControl(board, 0)
    }
    
    // Check for chain reaction objective
    if (objective.includes('chain')) {
      return this.checkChainReaction(board)
    }
    
    // Default: check if player has more orbs
    return this.getPlayerOrbCount(board, 0) > this.getPlayerOrbCount(board, 1)
  }

  // Get active players
  getActivePlayers(board) {
    const players = new Set()
    
    for (let y = 0; y < this.boardSize.height; y++) {
      for (let x = 0; x < this.boardSize.width; x++) {
        const cell = board[y][x]
        if (cell.owner !== null && cell.orbs > 0) {
          players.add(cell.owner)
        }
      }
    }
    
    return Array.from(players)
  }

  // Check corner control
  checkCornerControl(board, playerIndex) {
    const corners = [
      [0, 0],
      [0, this.boardSize.height - 1],
      [this.boardSize.width - 1, 0],
      [this.boardSize.width - 1, this.boardSize.height - 1]
    ]
    
    return corners.every(([x, y]) => {
      const cell = board[y][x]
      return cell.owner === playerIndex && cell.orbs > 0
    })
  }

  // Check chain reaction
  checkChainReaction(board) {
    // This would need more sophisticated logic
    // For now, just check if there are multiple explosions
    return true // Placeholder
  }

  // Get player orb count
  getPlayerOrbCount(board, playerIndex) {
    let count = 0
    
    for (let y = 0; y < this.boardSize.height; y++) {
      for (let x = 0; x < this.boardSize.width; x++) {
        const cell = board[y][x]
        if (cell.owner === playerIndex) {
          count += cell.orbs
        }
      }
    }
    
    return count
  }
} 