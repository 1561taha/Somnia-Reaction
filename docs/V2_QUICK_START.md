# Chain Reaction V2 - Quick Start Guide

## 🚀 **Getting Started with V2 Development**

This guide will help you implement the first V2 feature: the **Power-up System**. This serves as a template for implementing other V2 features while maintaining our clean, decoupled architecture.

## 📋 **Prerequisites**

- V1 codebase is stable and working
- Understanding of current architecture
- Basic knowledge of React, Zustand, and Framer Motion

## 🎯 **Step 1: Create Power-up System Foundation**

### **1.1 Create Power-up Engine**

Create `src/core/engine/PowerUpEngine.js`:

```javascript
export class PowerUpEngine {
  constructor() {
    this.powerUpTypes = {
      SHIELD: 'shield',
      BOMB: 'bomb',
      TELEPORT: 'teleport',
      FREEZE: 'freeze',
      CHAIN_BOOSTER: 'chain_booster'
    }
    
    this.powerUpConfig = {
      [this.powerUpTypes.SHIELD]: {
        name: 'Shield',
        description: 'Protects a cell from explosion for one turn',
        cost: 2,
        duration: 1,
        icon: '🛡️',
        color: '#3b82f6'
      },
      [this.powerUpTypes.BOMB]: {
        name: 'Bomb',
        description: 'Explodes immediately regardless of critical mass',
        cost: 3,
        duration: 0,
        icon: '💣',
        color: '#ef4444'
      },
      // ... other power-ups
    }
  }

  // Spawn power-ups randomly on the board
  spawnPowerUps(board, spawnRate = 0.1) {
    const newBoard = board.map(row => [...row])
    
    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const cell = newBoard[y][x]
        
        // Only spawn on empty cells
        if (cell.orbs === 0 && cell.owner === null && !cell.powerUp) {
          if (Math.random() < spawnRate) {
            const powerUpType = this.getRandomPowerUpType()
            cell.powerUp = {
              type: powerUpType,
              config: this.powerUpConfig[powerUpType],
              collected: false
            }
          }
        }
      }
    }
    
    return newBoard
  }

  // Collect power-up when orb is placed
  collectPowerUp(board, x, y, playerIndex) {
    const cell = board[y][x]
    
    if (cell.powerUp && !cell.powerUp.collected) {
      const powerUp = { ...cell.powerUp }
      cell.powerUp.collected = true
      
      return {
        type: powerUp.type,
        config: powerUp.config,
        playerIndex
      }
    }
    
    return null
  }

  // Apply power-up effects
  applyPowerUp(board, powerUp, targetX, targetY) {
    const cell = board[targetY][targetX]
    
    switch (powerUp.type) {
      case this.powerUpTypes.SHIELD:
        cell.shielded = true
        cell.shieldDuration = powerUp.config.duration
        break
        
      case this.powerUpTypes.BOMB:
        // Trigger immediate explosion
        return this.triggerBombExplosion(board, targetX, targetY, cell.owner)
        
      case this.powerUpTypes.FREEZE:
        cell.frozen = true
        cell.freezeDuration = powerUp.config.duration
        break
        
      // ... other power-up effects
    }
    
    return board
  }

  // Get random power-up type
  getRandomPowerUpType() {
    const types = Object.values(this.powerUpTypes)
    return types[Math.floor(Math.random() * types.length)]
  }

  // Update power-up durations
  updatePowerUpDurations(board) {
    return board.map(row => 
      row.map(cell => {
        if (cell.shielded && cell.shieldDuration > 0) {
          cell.shieldDuration--
          if (cell.shieldDuration === 0) {
            cell.shielded = false
          }
        }
        
        if (cell.frozen && cell.freezeDuration > 0) {
          cell.freezeDuration--
          if (cell.freezeDuration === 0) {
            cell.frozen = false
          }
        }
        
        return cell
      })
    )
  }
}
```

### **1.2 Create Power-up Store Slice**

Create `src/stores/powerUpStore.js`:

```javascript
import { create } from 'zustand'
import { PowerUpEngine } from '../core/engine/PowerUpEngine'

export const usePowerUpStore = create((set, get) => ({
  // State
  powerUpEngine: new PowerUpEngine(),
  playerPowerUps: {}, // { playerIndex: [powerUps] }
  activeEffects: {}, // { cellId: { effect, duration } }
  
  // Actions
  initializePlayerPowerUps: (players) => {
    const playerPowerUps = {}
    players.forEach((_, index) => {
      playerPowerUps[index] = []
    })
    set({ playerPowerUps })
  },

  addPowerUpToPlayer: (playerIndex, powerUp) => {
    const { playerPowerUps } = get()
    const updatedPowerUps = { ...playerPowerUps }
    
    if (!updatedPowerUps[playerIndex]) {
      updatedPowerUps[playerIndex] = []
    }
    
    updatedPowerUps[playerIndex].push({
      ...powerUp,
      id: Date.now() + Math.random(),
      collectedAt: Date.now()
    })
    
    set({ playerPowerUps: updatedPowerUps })
  },

  usePowerUp: (playerIndex, powerUpId, targetX, targetY) => {
    const { playerPowerUps, powerUpEngine } = get()
    const playerPowerUpsList = playerPowerUps[playerIndex] || []
    
    const powerUpIndex = playerPowerUpsList.findIndex(p => p.id === powerUpId)
    if (powerUpIndex === -1) return false
    
    const powerUp = playerPowerUpsList[powerUpIndex]
    
    // Remove power-up from inventory
    const updatedPowerUps = { ...playerPowerUps }
    updatedPowerUps[playerIndex] = playerPowerUpsList.filter((_, index) => index !== powerUpIndex)
    
    set({ playerPowerUps: updatedPowerUps })
    
    // Return power-up data for application
    return {
      type: powerUp.type,
      config: powerUp.config,
      targetX,
      targetY
    }
  },

  clearPlayerPowerUps: (playerIndex) => {
    const { playerPowerUps } = get()
    const updatedPowerUps = { ...playerPowerUps }
    updatedPowerUps[playerIndex] = []
    set({ playerPowerUps: updatedPowerUps })
  },

  // Getters
  getPlayerPowerUps: (playerIndex) => {
    const { playerPowerUps } = get()
    return playerPowerUps[playerIndex] || []
  },

  hasPowerUp: (playerIndex, powerUpType) => {
    const powerUps = get().getPlayerPowerUps(playerIndex)
    return powerUps.some(p => p.type === powerUpType)
  }
}))
```

### **1.3 Create Power-up UI Component**

Create `src/components/features/PowerUpPanel.jsx`:

```javascript
import { motion, AnimatePresence } from 'framer-motion'
import { usePowerUpStore } from '../../stores/powerUpStore'

const PowerUpPanel = ({ currentPlayer, onUsePowerUp }) => {
  const { getPlayerPowerUps, usePowerUp } = usePowerUpStore()
  const playerPowerUps = getPlayerPowerUps(currentPlayer)

  const handlePowerUpClick = (powerUp) => {
    // This will trigger a selection mode in the game board
    onUsePowerUp(powerUp)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="card"
    >
      <h3 className="text-lg font-bold mb-4 text-gradient">Power-ups</h3>
      
      <div className="space-y-2">
        <AnimatePresence>
          {playerPowerUps.map((powerUp) => (
            <motion.div
              key={powerUp.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-600/40 transition-colors"
              onClick={() => handlePowerUpClick(powerUp)}
            >
              <div 
                className="text-2xl"
                style={{ color: powerUp.config.color }}
              >
                {powerUp.config.icon}
              </div>
              
              <div className="flex-1">
                <div className="font-semibold text-white text-sm">
                  {powerUp.config.name}
                </div>
                <div className="text-xs text-slate-400">
                  {powerUp.config.description}
                </div>
              </div>
              
              <div className="text-xs text-slate-500">
                Cost: {powerUp.config.cost}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {playerPowerUps.length === 0 && (
          <div className="text-center text-slate-500 text-sm py-4">
            No power-ups available
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default PowerUpPanel
```

## 🎮 **Step 2: Integrate with Game Engine**

### **2.1 Update Game Engine**

Modify `src/utils/gameEngine.js` to integrate power-ups:

```javascript
// Add to existing gameEngine.js
import { PowerUpEngine } from '../core/engine/PowerUpEngine'

export function createGameEngine(boardSize, explosionCapacity = 4) {
  const powerUpEngine = new PowerUpEngine()
  
  return {
    // ... existing methods ...
    
    // Add power-up support to placeOrb
    placeOrb(board, x, y, playerIndex) {
      const newBoard = board.map(row => [...row])
      const cell = newBoard[y][x]
      
      // Check if cell has power-up
      const collectedPowerUp = powerUpEngine.collectPowerUp(newBoard, x, y, playerIndex)
      
      // Place orb
      if (cell.owner === null || cell.owner === playerIndex) {
        cell.orbs++
        cell.owner = playerIndex
      }
      
      // Check for explosion (consider shields)
      if (cell.orbs >= cell.criticalMass && !cell.shielded) {
        cell.exploding = true
      }
      
      return {
        board: newBoard,
        collectedPowerUp
      }
    },
    
    // Add power-up spawning
    spawnPowerUps(board) {
      return powerUpEngine.spawnPowerUps(board)
    },
    
    // Update power-up durations
    updatePowerUpDurations(board) {
      return powerUpEngine.updatePowerUpDurations(board)
    }
  }
}
```

### **2.2 Update Game Store**

Modify `src/stores/gameStore.js` to integrate power-ups:

```javascript
// Add to existing gameStore.js
import { usePowerUpStore } from './powerUpStore'

export const useGameStore = create((set, get) => ({
  // ... existing state ...
  
  // Add power-up related state
  powerUpSelectionMode: false,
  selectedPowerUp: null,
  
  // ... existing actions ...
  
  // Modify placeOrb to handle power-ups
  placeOrb: async (x, y) => {
    const { gameEngine, currentPlayer, players, board, gameMode, gameStatus } = get()
    
    if (gameStatus !== 'playing') return false
    if (!gameEngine.canPlaceOrb(board, x, y, currentPlayer)) return false
    
    // Save game state for undo
    if (gameMode !== 'learn' && currentPlayer === 0) {
      get().saveGameState()
    }
    
    // Place orb and check for power-up collection
    const result = gameEngine.placeOrb(board, x, y, currentPlayer)
    const { board: newBoard, collectedPowerUp } = result
    
    // Add power-up to player inventory
    if (collectedPowerUp) {
      const { addPowerUpToPlayer } = usePowerUpStore.getState()
      addPowerUpToPlayer(currentPlayer, collectedPowerUp)
    }
    
    // Update board
    set({
      board: newBoard,
      lastMoveTimestamp: Date.now(),
    })
    
    // ... rest of existing placeOrb logic ...
  },
  
  // Add power-up usage
  usePowerUp: (powerUp) => {
    set({
      powerUpSelectionMode: true,
      selectedPowerUp: powerUp
    })
  },
  
  // Apply power-up to target cell
  applyPowerUp: (targetX, targetY) => {
    const { selectedPowerUp, currentPlayer, board, gameEngine } = get()
    
    if (!selectedPowerUp) return false
    
    const { usePowerUp } = usePowerUpStore.getState()
    const powerUpData = usePowerUp(currentPlayer, selectedPowerUp.id, targetX, targetY)
    
    if (powerUpData) {
      const newBoard = gameEngine.applyPowerUp(board, powerUpData, targetX, targetY)
      
      set({
        board: newBoard,
        powerUpSelectionMode: false,
        selectedPowerUp: null,
        lastMoveTimestamp: Date.now()
      })
      
      return true
    }
    
    return false
  },
  
  // Cancel power-up selection
  cancelPowerUpSelection: () => {
    set({
      powerUpSelectionMode: false,
      selectedPowerUp: null
    })
  }
}))
```

## 🎨 **Step 3: Update UI Components**

### **3.1 Update GameUI**

Modify `src/components/GameUI.jsx` to include power-up panel:

```javascript
// Add to imports
import PowerUpPanel from './features/PowerUpPanel'

const GameUI = () => {
  // ... existing code ...
  
  const {
    // ... existing destructuring ...
    powerUpSelectionMode,
    usePowerUp,
    cancelPowerUpSelection
  } = useGame()
  
  // ... existing code ...
  
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* ... existing layout ... */}
      
      {/* Sidebar */}
      <div className="w-full lg:w-80 bg-gradient-to-b from-slate-800/60 to-slate-900/60 backdrop-blur-md border-l border-slate-700/50 p-6 overflow-y-auto">
        {/* ... existing sidebar content ... */}
        
        {/* Power-up Panel */}
        <PowerUpPanel 
          currentPlayer={currentPlayer}
          onUsePowerUp={usePowerUp}
        />
      </div>
      
      {/* Power-up Selection Overlay */}
      {powerUpSelectionMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card max-w-md"
          >
            <h3 className="text-xl font-bold mb-4 text-gradient">
              Select Target for {selectedPowerUp?.config?.name}
            </h3>
            <p className="text-slate-300 mb-6">
              Click on a cell to apply the power-up effect
            </p>
            <button
              onClick={cancelPowerUpSelection}
              className="btn btn-secondary w-full"
            >
              Cancel
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
```

### **3.2 Update GameBoard**

Modify `src/components/GameBoard.jsx` to handle power-up selection:

```javascript
const GameBoard = () => {
  // ... existing code ...
  
  const {
    // ... existing destructuring ...
    powerUpSelectionMode,
    applyPowerUp
  } = useGame()
  
  const handleCellClick = async (x, y) => {
    if (gameStatus !== 'playing') return
    
    // Handle power-up selection mode
    if (powerUpSelectionMode) {
      const success = applyPowerUp(x, y)
      if (success) {
        // Power-up was applied successfully
        return
      }
    }
    
    // ... existing cell click logic ...
  }
  
  // ... rest of component ...
}
```

## 🧪 **Step 4: Testing**

### **4.1 Test Power-up Spawning**

```javascript
// Test in browser console
const gameStore = useGameStore.getState()
const board = gameStore.board
const gameEngine = gameStore.gameEngine

// Spawn power-ups
const newBoard = gameEngine.spawnPowerUps(board)
gameStore.set({ board: newBoard })
```

### **4.2 Test Power-up Collection**

1. Start a new game
2. Look for power-up icons on empty cells
3. Place an orb on a power-up cell
4. Check if power-up appears in the sidebar

### **4.3 Test Power-up Usage**

1. Collect a power-up
2. Click on the power-up in the sidebar
3. Select a target cell
4. Verify the power-up effect is applied

## 🎯 **Next Steps**

Once the power-up system is working:

1. **Add Visual Effects**: Create animations for power-up collection and usage
2. **Balance Power-ups**: Adjust costs and effects for game balance
3. **Add More Power-ups**: Implement additional power-up types
4. **Power-up Combinations**: Allow multiple power-ups to be used together
5. **Power-up Strategy**: Add AI logic for power-up usage

## 🔧 **Troubleshooting**

### **Common Issues**

1. **Power-ups not spawning**
   - Check spawn rate in PowerUpEngine
   - Verify board state is correct
   - Check console for errors

2. **Power-ups not collecting**
   - Verify placeOrb integration
   - Check power-up store state
   - Ensure UI updates properly

3. **Power-up effects not working**
   - Check applyPowerUp logic
   - Verify game engine integration
   - Test individual power-up types

### **Debug Commands**

```javascript
// Check power-up store state
console.log(usePowerUpStore.getState())

// Check game store state
console.log(useGameStore.getState())

// Force power-up spawn
const gameStore = useGameStore.getState()
const newBoard = gameStore.gameEngine.spawnPowerUps(gameStore.board, 0.5)
gameStore.set({ board: newBoard })
```

This quick start guide provides a foundation for implementing the power-up system. Once this is working, you can use the same pattern to implement other V2 features while maintaining the clean, decoupled architecture. 