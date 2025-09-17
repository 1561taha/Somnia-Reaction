// Somnia Reaction Game Engine - Proper Implementation
export function createGameEngine(boardSize, explosionCapacity = 4) {
  const getCriticalMass = (x, y) => {
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
  }

  return {
    createBoard() {
      const board = []
      for (let y = 0; y < boardSize.height; y++) {
        const row = []
        for (let x = 0; x < boardSize.width; x++) {
          row.push({
            orbs: 0,
            owner: null,
            criticalMass: getCriticalMass(x, y),
            exploding: false,
            chainLevel: 0 // Track chain reaction depth for visual effects
          })
        }
        board.push(row)
      }
      return board
    },

    getCriticalMass(x, y) {
      return getCriticalMass(x, y)
    },

    canPlaceOrb(board, x, y, playerIndex) {
      if (x < 0 || x >= boardSize.width || y < 0 || y >= boardSize.height) {
        return false
      }
      
      const cell = board[y][x]
      // Can place in empty cell or cell owned by same player
      return cell.orbs === 0 || cell.owner === playerIndex
    },

    placeOrb(board, x, y, playerIndex) {
      const newBoard = board.map(row => row.map(cell => ({ ...cell })))
      const cell = newBoard[y][x]
      
      cell.orbs++
      cell.owner = playerIndex
      
      // Don't process explosions here - let the calling code handle it
      // This allows for proper animation callbacks and visual feedback
      return newBoard
    },

    // FIXED: Process explosions step-by-step with delays for visual feedback
    async processExplosions(board, onStepCallback = null) {
      console.log('🚀 processExplosions called with board:', board)
      console.log('📏 Board dimensions:', boardSize.width, 'x', boardSize.height)
      console.log('🔍 Sample cell data:', board[0]?.[0])
      
      let newBoard = board.map(row => row.map(cell => ({ 
        ...cell, 
        exploding: false, 
        chainLevel: 0 
      })))
      
      let hasExplosions = true
      let explosionRound = 0
      let totalChainLevel = 0
      const maxExplosions = 50 // Prevent infinite loops
      const explosionHistory = [] // Array of rounds, each round is an array of explosions
      
      // Process explosions in rounds for visual effect
      while (hasExplosions && explosionRound < maxExplosions) {
        hasExplosions = false
        explosionRound++
        totalChainLevel++
        
        console.log(`🔍 Checking for explosions in round ${explosionRound}`)
        
        // Find cells that should explode in this round
        const currentExplosions = []
        for (let y = 0; y < boardSize.height; y++) {
          for (let x = 0; x < boardSize.width; x++) {
            const cell = newBoard[y][x]
            console.log(`🔍 Cell (${x}, ${y}): orbs=${cell.orbs}, criticalMass=${cell.criticalMass}, exploding=${cell.exploding}, owner=${cell.owner}`)
            
            if (cell.orbs >= cell.criticalMass && cell.orbs > 0 && !cell.exploding) {
              console.log(`💥 Found explosion at (${x}, ${y}) with ${cell.orbs} orbs, critical mass: ${cell.criticalMass}`)
              currentExplosions.push({ 
                x, 
                y, 
                owner: cell.owner, 
                orbs: cell.orbs,
                chainLevel: totalChainLevel,
                round: explosionRound
              })
              hasExplosions = true
            }
          }
        }
        
        console.log(`📊 Round ${explosionRound}: ${currentExplosions.length} explosions found`)
        
        if (currentExplosions.length > 0) {
          explosionHistory.push(currentExplosions) // Push the round as an array
          
          // Mark cells as exploding for visual feedback
          currentExplosions.forEach(explosion => {
            const { x, y } = explosion
            const cell = newBoard[y][x]
            cell.exploding = true
            cell.chainLevel = totalChainLevel
          })
          
          // Call step callback for visual updates
          if (onStepCallback) {
            console.log(`📞 Calling onStepCallback with ${currentExplosions.length} explosions`)
            onStepCallback(newBoard, currentExplosions, explosionRound)
          }
          
          // Wait for visual effect - smoother timing for better animation flow
          await new Promise(resolve => setTimeout(resolve, 150)) // Reduced for better responsiveness
          
          // Process the explosions
          currentExplosions.forEach(explosion => {
            const { x, y, owner } = explosion
            const cell = newBoard[y][x]
            
            // Clear the exploding cell
            cell.orbs = 0
            cell.owner = null
            cell.exploding = false
            cell.chainLevel = 0
            
            // Distribute orbs to neighbors
            const neighbors = this.getNeighbors(x, y)
            neighbors.forEach(({ nx, ny }) => {
              const neighborCell = newBoard[ny][nx]
              neighborCell.orbs++
              neighborCell.owner = owner // Convert to exploding player's color
            })
          })
        }
      }
      
      console.log(`✅ Explosion processing complete. Total rounds: ${explosionRound}, Total explosions: ${explosionHistory.length}`)
      
      // Final cleanup: ensure all explosion flags are cleared
      for (let y = 0; y < boardSize.height; y++) {
        for (let x = 0; x < boardSize.width; x++) {
          newBoard[y][x].exploding = false
          newBoard[y][x].chainLevel = 0
        }
      }
      
      return {
        updatedBoard: newBoard,
        explosions: explosionRound > 1,
        chainReactions: explosionRound > 2,
        explosionHistory: explosionHistory,
        maxChainLevel: totalChainLevel,
        totalRounds: explosionRound
      }
    },

    // Synchronous version for AI calculations
    processExplosionsSync(board) {
      let newBoard = board.map(row => row.map(cell => ({ 
        ...cell, 
        exploding: false, 
        chainLevel: 0 
      })))
      
      let hasExplosions = true
      let explosionCount = 0
      let chainLevel = 0
      const maxExplosions = 100
      
      while (hasExplosions && explosionCount < maxExplosions) {
        hasExplosions = false
        explosionCount++
        chainLevel++
        
        const explosions = []
        for (let y = 0; y < boardSize.height; y++) {
          for (let x = 0; x < boardSize.width; x++) {
            const cell = newBoard[y][x]
            if (cell.orbs >= cell.criticalMass && cell.orbs > 0 && !cell.exploding) {
              explosions.push({ x, y, owner: cell.owner })
              hasExplosions = true
            }
          }
        }
        
        explosions.forEach(explosion => {
          const { x, y, owner } = explosion
          const cell = newBoard[y][x]
          
          // Clear the exploding cell
          cell.orbs = 0
          cell.owner = null
          cell.exploding = false
          cell.chainLevel = 0
          
          const neighbors = this.getNeighbors(x, y)
          neighbors.forEach(({ nx, ny }) => {
            const neighborCell = newBoard[ny][nx]
            neighborCell.orbs++
            neighborCell.owner = owner
          })
        })
      }
      
      // Final cleanup: ensure all explosion flags are cleared
      for (let y = 0; y < boardSize.height; y++) {
        for (let x = 0; x < boardSize.width; x++) {
          newBoard[y][x].exploding = false
          newBoard[y][x].chainLevel = 0
        }
      }
      
      return {
        updatedBoard: newBoard,
        explosions: explosionCount > 0,
        chainReactions: explosionCount > 1
      }
    },

    getNeighbors(x, y) {
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

    checkPlayerElimination(board, players) {
      const eliminatedPlayers = []
      
      // Count total orbs on board to determine game phase
      const totalOrbs = board.flat().reduce((sum, cell) => sum + cell.orbs, 0)
      const isVeryEarlyGame = totalOrbs < players.length // Only protect in very early game
      
      players.forEach((player, playerIndex) => {
        if (player.eliminated) return
        
        let hasOrbs = false
        let canMove = false
        
        // Check if player has any orbs on the board
        for (let y = 0; y < boardSize.height; y++) {
          for (let x = 0; x < boardSize.width; x++) {
            const cell = board[y][x]
            if (cell.owner === playerIndex && cell.orbs > 0) {
              hasOrbs = true
              break
            }
          }
          if (hasOrbs) break
        }
        
        // Only check for moves if they have no orbs (to see if they can re-enter)
        if (!hasOrbs && isVeryEarlyGame) {
          for (let y = 0; y < boardSize.height; y++) {
            for (let x = 0; x < boardSize.width; x++) {
              if (this.canPlaceOrb(board, x, y, playerIndex)) {
                canMove = true
                break
              }
            }
            if (canMove) break
          }
        }
        
        // CORE CHAIN REACTION RULE: If a player has no orbs on the board, they're eliminated
        // Exception: Very early game (before each player has placed at least one orb)
        if (!hasOrbs) {
          if (isVeryEarlyGame && !canMove) {
            // Only eliminate in very early game if they also can't move
            eliminatedPlayers.push(playerIndex)
            console.log(`Player ${playerIndex} (${players[playerIndex]?.name}) eliminated: no orbs and no moves in very early game`)
          } else if (!isVeryEarlyGame) {
            // After early game, eliminate immediately if no orbs
            eliminatedPlayers.push(playerIndex)
            console.log(`Player ${playerIndex} (${players[playerIndex]?.name}) eliminated: no orbs on board`)
          }
        }
      })
      
      return eliminatedPlayers
    },

    getValidMoves(board, playerIndex) {
      const moves = []
      
      for (let y = 0; y < boardSize.height; y++) {
        for (let x = 0; x < boardSize.width; x++) {
          if (this.canPlaceOrb(board, x, y, playerIndex)) {
            moves.push({ x, y })
          }
        }
      }
      
      return moves
    },

    evaluatePosition(board, playerIndex) {
      let score = 0
      
      for (let y = 0; y < boardSize.height; y++) {
        for (let x = 0; x < boardSize.width; x++) {
          const cell = board[y][x]
          if (cell.owner === playerIndex) {
            score += cell.orbs
            
            // Bonus for cells close to explosion
            if (cell.orbs === cell.criticalMass - 1) {
              score += 5
            }
            
            // Bonus for corner and edge control
            if (cell.criticalMass === 2) score += 3 // corners
            else if (cell.criticalMass === 3) score += 2 // edges
          }
        }
      }
      
      return score
    },

    getGameStatus(board, players) {
      const eliminatedPlayers = this.checkPlayerElimination(board, players)
      const activePlayers = players.filter((_, index) => 
        !eliminatedPlayers.includes(index)
      )
      
      if (activePlayers.length <= 1) {
        return {
          gameOver: true,
          winner: activePlayers[0] || null,
          winnerIndex: activePlayers.length === 1 ? players.indexOf(activePlayers[0]) : null
        }
      }
      
      return {
        gameOver: false,
        winner: null,
        winnerIndex: null
      }
    }
  }
} 