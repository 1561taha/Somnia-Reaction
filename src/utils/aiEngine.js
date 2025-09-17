// AI Engine for Somnia Reaction - Territory Control Strategy
export function createAIEngine(difficulty = 3) {
  // Adjust AI parameters based on difficulty level
  const getAIParameters = (level) => {
    switch(level) {
      case 1: // Beginner
        return {
          maxDepth: 2,
          randomness: 0.3, // 30% chance of suboptimal moves
          aggressiveness: 0.3,
          territoryWeight: 0.5,
          mistakes: 0.4 // 40% chance of making mistakes
        }
      case 2: // Easy  
        return {
          maxDepth: 2,
          randomness: 0.2,
          aggressiveness: 0.5,
          territoryWeight: 0.7,
          mistakes: 0.2
        }
      case 3: // Medium (default)
        return {
          maxDepth: 3,
          randomness: 0.1,
          aggressiveness: 0.7,
          territoryWeight: 1.0,
          mistakes: 0.1
        }
      case 4: // Hard
        return {
          maxDepth: 4,
          randomness: 0.05,
          aggressiveness: 0.9,
          territoryWeight: 1.2,
          mistakes: 0.05
        }
      case 5: // Expert
        return {
          maxDepth: 5,
          randomness: 0.0,
          aggressiveness: 1.0,
          territoryWeight: 1.5,
          mistakes: 0.0
        }
      default:
        return {
          maxDepth: 3,
          randomness: 0.1,
          aggressiveness: 0.7,
          territoryWeight: 1.0,
          mistakes: 0.1
        }
    }
  }

  const aiParams = getAIParameters(difficulty)

  return {
    difficulty,
    
    calculateMove(board, players, boardSize, gameEngine, depth = aiParams.maxDepth) {
      const validMoves = this.getValidMoves(board, 1, boardSize) // AI is player 1
      
      if (validMoves.length === 0) {
        return null
      }

      // Add randomness for learning mode - sometimes make suboptimal moves
      if (Math.random() < aiParams.randomness) {
        const randomIndex = Math.floor(Math.random() * validMoves.length)
        return validMoves[randomIndex]
      }

      // Occasionally make mistakes for educational purposes
      if (Math.random() < aiParams.mistakes) {
        // Choose a decent but not optimal move
        const orderedMoves = this.orderMoves(validMoves, board, boardSize)
        const suboptimalIndex = Math.min(orderedMoves.length - 1, Math.floor(validMoves.length * 0.3))
        return orderedMoves[suboptimalIndex] || orderedMoves[0]
      }
      
      let bestMove = null
      let bestScore = -Infinity
      
      // Order moves for better alpha-beta pruning
      const orderedMoves = this.orderMoves(validMoves, board, boardSize)
      
      for (const move of orderedMoves) {
        const newBoard = this.makeMove(board, move, 1)
        // Use gameEngine's sync method for AI calculations
        const { updatedBoard } = gameEngine ? 
          gameEngine.processExplosionsSync(newBoard) : 
          this.processExplosions(newBoard, boardSize)
        const score = this.minimax(updatedBoard, depth - 1, false, -Infinity, Infinity, boardSize, gameEngine)
        
        if (score > bestScore) {
          bestScore = score
          bestMove = move
        }
      }
      
      return bestMove
    },

    minimax(board, depth, isMaximizing, alpha, beta, boardSize, gameEngine) {
      // Terminal conditions
      if (depth === 0 || this.isTerminalState(board, boardSize)) {
        return this.evaluatePosition(board, 1, boardSize) // AI is player 1
      }
      
      if (isMaximizing) {
        let maxScore = -Infinity
        const validMoves = this.getValidMoves(board, 1, boardSize)
        
        for (const move of validMoves) {
          const newBoard = this.makeMove(board, move, 1)
          const { updatedBoard } = gameEngine ? 
            gameEngine.processExplosionsSync(newBoard) : 
            this.processExplosions(newBoard, boardSize)
          const score = this.minimax(updatedBoard, depth - 1, false, alpha, beta, boardSize, gameEngine)
          maxScore = Math.max(maxScore, score)
          alpha = Math.max(alpha, score)
          
          if (beta <= alpha) break // Alpha-beta pruning
        }
        
        return maxScore
      } else {
        let minScore = Infinity
        const validMoves = this.getValidMoves(board, 0, boardSize) // Human is player 0
        
        for (const move of validMoves) {
          const newBoard = this.makeMove(board, move, 0)
          const { updatedBoard } = gameEngine ? 
            gameEngine.processExplosionsSync(newBoard) : 
            this.processExplosions(newBoard, boardSize)
          const score = this.minimax(updatedBoard, depth - 1, true, alpha, beta, boardSize, gameEngine)
          minScore = Math.min(minScore, score)
          beta = Math.min(beta, score)
          
          if (beta <= alpha) break // Alpha-beta pruning
        }
        
        return minScore
      }
    },

    getValidMoves(board, playerIndex, boardSize) {
      const moves = []
      
      for (let y = 0; y < boardSize.height; y++) {
        for (let x = 0; x < boardSize.width; x++) {
          if (this.canPlaceOrb(board, x, y, playerIndex, boardSize)) {
            moves.push({ x, y })
          }
        }
      }
      
      return moves
    },

    canPlaceOrb(board, x, y, playerIndex, boardSize) {
      if (x < 0 || x >= boardSize.width || y < 0 || y >= boardSize.height) {
        return false
      }
      
      const cell = board[y][x]
      return cell.orbs === 0 || cell.owner === playerIndex
    },

    makeMove(board, move, playerIndex) {
      const newBoard = board.map(row => row.map(cell => ({ ...cell })))
      const cell = newBoard[move.y][move.x]
      
      cell.orbs++
      cell.owner = playerIndex
      
      return newBoard
    },

    processExplosions(board, boardSize) {
      let newBoard = board.map(row => row.map(cell => ({ ...cell })))
      let hasExplosions = true
      let explosionCount = 0
      const maxExplosions = 50 // Prevent infinite loops in AI simulation
      
      while (hasExplosions && explosionCount < maxExplosions) {
        hasExplosions = false
        explosionCount++
        
        // Find cells that should explode
        const explosions = []
        for (let y = 0; y < boardSize.height; y++) {
          for (let x = 0; x < boardSize.width; x++) {
            const cell = newBoard[y][x]
            const criticalMass = this.getCriticalMass(x, y, boardSize)
            if (cell.orbs >= criticalMass && cell.orbs > 0) {
              explosions.push({ x, y, owner: cell.owner })
              hasExplosions = true
            }
          }
        }
        
        // Process all explosions simultaneously
        explosions.forEach(explosion => {
          const { x, y, owner } = explosion
          const cell = newBoard[y][x]
          
          // Clear the exploding cell
          cell.orbs = 0
          cell.owner = null
          
          // Distribute orbs to neighbors
          const neighbors = this.getNeighbors(x, y, boardSize)
          neighbors.forEach(({ nx, ny }) => {
            const neighborCell = newBoard[ny][nx]
            neighborCell.orbs++
            neighborCell.owner = owner // Convert to exploding player's color
          })
        })
      }
      
      return { updatedBoard: newBoard, explosions: explosionCount }
    },

    getCriticalMass(x, y, boardSize) {
      // Corner cells: 2 neighbors
      if ((x === 0 || x === boardSize.width - 1) && 
          (y === 0 || y === boardSize.height - 1)) {
        return 2
      }
      // Edge cells: 3 neighbors  
      if (x === 0 || x === boardSize.width - 1 || 
          y === 0 || y === boardSize.height - 1) {
        return 3
      }
      // Center cells: 4 neighbors
      return 4
    },

    getNeighbors(x, y, boardSize) {
      const neighbors = []
      const directions = [
        { dx: -1, dy: 0 }, // left
        { dx: 1, dy: 0 },  // right
        { dx: 0, dy: -1 }, // up
        { dx: 0, dy: 1 },  // down
      ]
      
      directions.forEach(({ dx, dy }) => {
        const nx = x + dx
        const ny = y + dy
        
        if (nx >= 0 && nx < boardSize.width && ny >= 0 && ny < boardSize.height) {
          neighbors.push({ nx, ny })
        }
      })
      
      return neighbors
    },

    orderMoves(moves, board, boardSize) {
      return moves.sort((a, b) => {
        const scoreA = this.getMoveScore(a, board, boardSize)
        const scoreB = this.getMoveScore(b, board, boardSize)
        return scoreB - scoreA
      })
    },

    getMoveScore(move, board, boardSize) {
      let score = 0
      const cell = board[move.y][move.x]
      const criticalMass = this.getCriticalMass(move.x, move.y, boardSize)
      
      // Massive bonus for moves that cause immediate explosion
      if (cell.orbs === criticalMass - 1) {
        score += 1000
        
        // Extra bonus if explosion will convert enemy territory
        const neighbors = this.getNeighbors(move.x, move.y, boardSize)
        neighbors.forEach(({ nx, ny }) => {
          const neighbor = board[ny][nx]
          if (neighbor.owner === 0 && neighbor.orbs > 0) { // Enemy territory
            score += 500
          }
        })
      }
      
      // Bonus for capturing empty territory
      if (cell.orbs === 0) {
        score += 100
      }
      
      // Bonus for corner and edge positions (easier to defend)
      if (criticalMass === 2) score += 150 // corners
      else if (criticalMass === 3) score += 100 // edges
      else score += 50 // center
      
      // Bonus for moves that build up strong positions
      if (cell.owner === 1) {
        score += cell.orbs * 10
      }
      
      // Penalty for moves that help opponent
      const neighbors = this.getNeighbors(move.x, move.y, boardSize)
      neighbors.forEach(({ nx, ny }) => {
        const neighbor = board[ny][nx]
        if (neighbor.owner === 0 && neighbor.orbs === this.getCriticalMass(nx, ny, boardSize) - 1) {
          score -= 200 // Don't help opponent explode
        }
      })
      
      return score
    },

    evaluatePosition(board, playerIndex, boardSize) {
      let score = 0
      let aiOrbs = 0
      let humanOrbs = 0
      let aiCells = 0
      let humanCells = 0
      
      // Count territory and orbs
      for (let y = 0; y < boardSize.height; y++) {
        for (let x = 0; x < boardSize.width; x++) {
          const cell = board[y][x]
          const criticalMass = this.getCriticalMass(x, y, boardSize)
          
          if (cell.owner === playerIndex) { // AI
            aiOrbs += cell.orbs
            aiCells++
            score += cell.orbs * (15 * aiParams.aggressiveness)
            
            // Bonus for cells close to explosion
            if (cell.orbs === criticalMass - 1) {
              score += 100 * aiParams.aggressiveness
            }
            
            // Strategic position bonuses (scaled by difficulty)
            if (criticalMass === 2) score += 50 * aiParams.territoryWeight // corners
            else if (criticalMass === 3) score += 30 * aiParams.territoryWeight // edges
            
          } else if (cell.owner === 0) { // Human
            humanOrbs += cell.orbs
            humanCells++
            score -= cell.orbs * (15 * aiParams.aggressiveness)
            
            // Penalty for opponent's strong positions
            if (cell.orbs === criticalMass - 1) {
              score -= 100 * aiParams.aggressiveness
            }
          }
        }
      }
      
      // Major bonus for territory control (scaled by difficulty)
      score += (aiCells - humanCells) * (25 * aiParams.territoryWeight)
      
      // Major bonus for orb advantage (scaled by difficulty)
      score += (aiOrbs - humanOrbs) * (10 * aiParams.territoryWeight)
      
      // Win/lose conditions
      if (humanOrbs === 0 && humanCells === 0) {
        score += 10000 // AI wins
      } else if (aiOrbs === 0 && aiCells === 0) {
        score -= 10000 // AI loses
      }
      
      return score
    },

    isTerminalState(board, boardSize) {
      let player0HasOrbs = false
      let player1HasOrbs = false
      
      for (let y = 0; y < boardSize.height; y++) {
        for (let x = 0; x < boardSize.width; x++) {
          const cell = board[y][x]
          if (cell.orbs > 0) {
            if (cell.owner === 0) player0HasOrbs = true
            if (cell.owner === 1) player1HasOrbs = true
          }
        }
      }
      
      return !player0HasOrbs || !player1HasOrbs
    },
  }
} 