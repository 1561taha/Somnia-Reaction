// Puzzle Generator - Automatically creates new puzzles
import { createPuzzleTemplate } from './PuzzleTypes'
import { PuzzleEngine } from '../../core/puzzle/PuzzleEngine'

const puzzleEngine = new PuzzleEngine()

export class PuzzleGenerator {
  constructor() {
    this.difficultyConfigs = {
      beginner: {
        boardSizes: [{ width: 4, height: 4 }, { width: 5, height: 4 }],
        moveLimits: [3, 4, 5],
        objectiveCounts: [1, 2],
        objectiveTypes: ['elimination', 'territory', 'corners']
      },
      easy: {
        boardSizes: [{ width: 5, height: 4 }, { width: 6, height: 4 }, { width: 5, height: 5 }],
        moveLimits: [5, 6, 7, 8],
        objectiveCounts: [2, 3],
        objectiveTypes: ['chain_reaction', 'efficiency', 'territory', 'elimination']
      },
      medium: {
        boardSizes: [{ width: 6, height: 5 }, { width: 6, height: 6 }, { width: 7, height: 5 }],
        moveLimits: [8, 10, 12],
        objectiveCounts: [3, 4],
        objectiveTypes: ['mixed', 'survival', 'timing', 'chain_reaction', 'territory']
      },
      hard: {
        boardSizes: [{ width: 7, height: 6 }, { width: 8, height: 6 }, { width: 7, height: 7 }],
        moveLimits: [12, 15, 18],
        objectiveCounts: [4, 5],
        objectiveTypes: ['chain_reaction', 'explosions', 'mixed', 'efficiency', 'timing']
      },
      expert: {
        boardSizes: [{ width: 8, height: 8 }, { width: 9, height: 8 }, { width: 8, height: 9 }],
        moveLimits: [18, 20, 25],
        objectiveCounts: [5, 6, 7],
        objectiveTypes: ['mixed']
      }
    }
  }

  // Generate a random puzzle
  generatePuzzle(difficulty = 'medium', category = null) {
    const config = this.difficultyConfigs[difficulty]
    if (!config) {
      throw new Error(`Invalid difficulty: ${difficulty}`)
    }

    // Random board size
    const boardSize = config.boardSizes[Math.floor(Math.random() * config.boardSizes.length)]
    
    // Random move limit
    const moveLimit = config.moveLimits[Math.floor(Math.random() * config.moveLimits.length)]
    
    // Random objective count
    const objectiveCount = config.objectiveCounts[Math.floor(Math.random() * config.objectiveCounts.length)]
    
    // Generate objectives
    const objectives = this.generateObjectives(difficulty, objectiveCount, category)
    
    // Generate board layout
    const initialBoard = this.generateBoardLayout(boardSize, difficulty, objectives)
    
    // Generate players
    const players = this.generatePlayers(difficulty, objectives)
    
    // Generate hints
    const hints = this.generateHints(objectives, difficulty)
    
    // Generate solution (simplified)
    const solution = this.generateSolution(objectives, boardSize)
    
    // Generate title and description
    const { title, description } = this.generatePuzzleInfo(difficulty, objectives, category)
    
    // Generate tags
    const tags = this.generateTags(difficulty, objectives, category)
    
    return createPuzzleTemplate({
      id: this.generatePuzzleId(),
      title,
      description,
      category: category || this.selectRandomCategory(objectives),
      difficulty,
      boardSize,
      moveLimit,
      objectives,
      initialBoard,
      players,
      hints,
      solution,
      tags
    })
  }

  // Generate objectives based on difficulty
  generateObjectives(difficulty, count, category) {
    const objectives = []
    const config = this.difficultyConfigs[difficulty]
    
    for (let i = 0; i < count; i++) {
      const objectiveType = category || config.objectiveTypes[Math.floor(Math.random() * config.objectiveTypes.length)]
      const objective = this.createObjective(objectiveType, difficulty)
      objectives.push(objective)
    }
    
    return objectives
  }

  // Create a specific objective
  createObjective(type, difficulty) {
    switch (type) {
      case 'elimination':
        return {
          type: puzzleEngine.objectiveTypes.ELIMINATE_OPPONENT,
          description: 'Eliminate the opponent',
          target: 1
        }
      
      case 'territory':
        const targetPercentage = difficulty === 'beginner' ? 40 : 
                                difficulty === 'easy' ? 50 :
                                difficulty === 'medium' ? 60 :
                                difficulty === 'hard' ? 70 : 80
        return {
          type: puzzleEngine.objectiveTypes.CONTROL_TERRITORY,
          description: `Control ${targetPercentage}% of the board`,
          target: targetPercentage,
          player: 0
        }
      
      case 'chain_reaction':
        const chainLength = difficulty === 'beginner' ? 2 :
                           difficulty === 'easy' ? 3 :
                           difficulty === 'medium' ? 5 :
                           difficulty === 'hard' ? 8 : 12
        return {
          type: puzzleEngine.objectiveTypes.CREATE_CHAIN,
          description: `Create a chain reaction of ${chainLength} explosions`,
          target: chainLength
        }
      
      case 'survival':
        const survivalTurns = difficulty === 'beginner' ? 3 :
                             difficulty === 'easy' ? 5 :
                             difficulty === 'medium' ? 8 :
                             difficulty === 'hard' ? 12 : 15
        return {
          type: puzzleEngine.objectiveTypes.SURVIVE_TURNS,
          description: `Survive for ${survivalTurns} turns`,
          target: survivalTurns
        }
      
      case 'efficiency':
        const maxMoves = difficulty === 'beginner' ? 3 :
                        difficulty === 'easy' ? 5 :
                        difficulty === 'medium' ? 8 :
                        difficulty === 'hard' ? 12 : 15
        return {
          type: puzzleEngine.objectiveTypes.EFFICIENCY,
          description: `Complete in ${maxMoves} moves or fewer`,
          maxMoves
        }
      
      case 'timing':
        const targetTurn = difficulty === 'beginner' ? 2 :
                          difficulty === 'easy' ? 3 :
                          difficulty === 'medium' ? 5 :
                          difficulty === 'hard' ? 8 : 10
        return {
          type: puzzleEngine.objectiveTypes.TIMING,
          description: `Complete by turn ${targetTurn}`,
          targetTurn
        }
      
      case 'corners':
        const cornerCount = difficulty === 'beginner' ? 2 :
                           difficulty === 'easy' ? 3 :
                           difficulty === 'medium' ? 3 :
                           difficulty === 'hard' ? 4 : 4
        return {
          type: puzzleEngine.objectiveTypes.CAPTURE_CORNERS,
          description: `Capture ${cornerCount} corner positions`,
          target: cornerCount,
          player: 0
        }
      
      case 'explosions':
        const explosionCount = difficulty === 'beginner' ? 3 :
                              difficulty === 'easy' ? 5 :
                              difficulty === 'medium' ? 8 :
                              difficulty === 'hard' ? 12 : 15
        return {
          type: puzzleEngine.objectiveTypes.MAXIMIZE_EXPLOSIONS,
          description: `Trigger ${explosionCount} explosions`,
          target: explosionCount
        }
      
      default:
        return {
          type: puzzleEngine.objectiveTypes.ELIMINATE_OPPONENT,
          description: 'Eliminate the opponent',
          target: 1
        }
    }
  }

  // Generate board layout
  generateBoardLayout(boardSize, difficulty, objectives) {
    const board = []
    const { width, height } = boardSize
    
    // Determine player distribution based on objectives
    const hasElimination = objectives.some(obj => obj.type === puzzleEngine.objectiveTypes.ELIMINATE_OPPONENT)
    const hasTerritory = objectives.some(obj => obj.type === puzzleEngine.objectiveTypes.CONTROL_TERRITORY)
    
    for (let y = 0; y < height; y++) {
      const row = []
      for (let x = 0; x < width; x++) {
        const isCorner = (x === 0 || x === width - 1) && (y === 0 || y === height - 1)
        const isEdge = !isCorner && (x === 0 || x === width - 1 || y === 0 || y === height - 1)
        
        // Generate cell content based on difficulty and objectives
        let orbs = 0
        let owner = null
        
        if (hasElimination && Math.random() < 0.3) {
          // Place some initial orbs for elimination puzzles
          orbs = Math.floor(Math.random() * 2) + 1
          owner = Math.random() < 0.5 ? 0 : 1
        } else if (hasTerritory && Math.random() < 0.2) {
          // Place some initial territory for territory puzzles
          orbs = 1
          owner = 0
        }
        
        row.push({
          orbs,
          owner,
          criticalMass: isCorner ? 2 : isEdge ? 3 : 4,
          exploding: false
        })
      }
      board.push(row)
    }
    
    return board
  }

  // Generate players
  generatePlayers(difficulty, objectives) {
    const players = [
      { name: 'Player', color: 'blue', isAI: false }
    ]
    
    // Add AI opponent if needed
    const needsOpponent = objectives.some(obj => 
      obj.type === puzzleEngine.objectiveTypes.ELIMINATE_OPPONENT ||
      obj.type === puzzleEngine.objectiveTypes.SURVIVE_TURNS
    )
    
    if (needsOpponent) {
      const aiNames = ['AI Opponent', 'Computer', 'Challenger', 'Adversary']
      const aiName = aiNames[Math.floor(Math.random() * aiNames.length)]
      players.push({ name: aiName, color: 'red', isAI: true })
    }
    
    return players
  }

  // Generate hints
  generateHints(objectives, difficulty) {
    const hints = []
    
    objectives.forEach(objective => {
      const hint = puzzleEngine.getObjectiveHint(objective)
      if (hint && !hints.includes(hint)) {
        hints.push(hint)
      }
    })
    
    // Add difficulty-specific hints
    if (difficulty === 'beginner') {
      hints.push('Take your time to understand the mechanics')
    } else if (difficulty === 'easy') {
      hints.push('Plan your moves ahead')
    } else if (difficulty === 'medium') {
      hints.push('Balance multiple objectives')
    } else if (difficulty === 'hard') {
      hints.push('Think several moves ahead')
    } else if (difficulty === 'expert') {
      hints.push('This is a master-level challenge')
    }
    
    return hints.slice(0, 3) // Limit to 3 hints
  }

  // Generate solution (simplified)
  generateSolution(objectives, boardSize) {
    const solution = []
    const { width, height } = boardSize
    
    // Generate a basic solution path
    const steps = Math.min(5, Math.floor((width * height) / 4))
    
    for (let i = 0; i < steps; i++) {
      const x = Math.floor(Math.random() * width)
      const y = Math.floor(Math.random() * height)
      
      solution.push({
        x,
        y,
        description: `Step ${i + 1}: Strategic placement`
      })
    }
    
    return solution
  }

  // Generate puzzle info
  generatePuzzleInfo(difficulty, objectives, category) {
    const titles = {
      beginner: ['First Steps', 'Learning Curve', 'Basic Training', 'Getting Started'],
      easy: ['Simple Strategy', 'Easy Challenge', 'Basic Puzzle', 'Entry Level'],
      medium: ['Strategic Thinking', 'Balanced Challenge', 'Intermediate Puzzle', 'Skill Test'],
      hard: ['Advanced Tactics', 'Complex Challenge', 'Expert Puzzle', 'Master Test'],
      expert: ['Ultimate Challenge', 'Master Puzzle', 'Expert Test', 'Final Challenge']
    }
    
    const descriptions = {
      beginner: 'Learn the basics of Somnia Reaction',
      easy: 'Simple strategic puzzle to improve your skills',
      medium: 'Intermediate puzzle requiring strategic thinking',
      hard: 'Advanced puzzle testing your mastery',
      expert: 'Ultimate test of Somnia Reaction expertise'
    }
    
    const title = titles[difficulty][Math.floor(Math.random() * titles[difficulty].length)]
    const description = descriptions[difficulty]
    
    return { title, description }
  }

  // Generate tags
  generateTags(difficulty, objectives, category) {
    const tags = [difficulty]
    
    objectives.forEach(objective => {
      const type = objective.type.replace('_', '-')
      if (!tags.includes(type)) {
        tags.push(type)
      }
    })
    
    if (category) {
      tags.push(category)
    }
    
    tags.push('generated')
    
    return tags
  }

  // Generate unique puzzle ID
  generatePuzzleId() {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `generated_${timestamp}_${random}`
  }

  // Select random category
  selectRandomCategory(objectives) {
    const categories = ['elimination', 'territory', 'chain_reaction', 'survival', 'efficiency', 'timing', 'corners', 'explosions', 'mixed']
    return categories[Math.floor(Math.random() * categories.length)]
  }

  // Generate multiple puzzles
  generatePuzzleSet(count = 10, difficulty = 'medium') {
    const puzzles = []
    
    for (let i = 0; i < count; i++) {
      const puzzle = this.generatePuzzle(difficulty)
      puzzles.push(puzzle)
    }
    
    return puzzles
  }

  // Generate puzzles for all difficulties
  generateCompleteSet() {
    const puzzles = []
    
    Object.keys(this.difficultyConfigs).forEach(difficulty => {
      const count = difficulty === 'beginner' ? 20 :
                   difficulty === 'easy' ? 25 :
                   difficulty === 'medium' ? 25 :
                   difficulty === 'hard' ? 20 : 10
      
      const difficultyPuzzles = this.generatePuzzleSet(count, difficulty)
      puzzles.push(...difficultyPuzzles)
    })
    
    return puzzles
  }
}

// Export singleton instance
export const puzzleGenerator = new PuzzleGenerator() 