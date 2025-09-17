import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../stores/gameStore'
import { useState, useEffect } from 'react'

const GameBoard = ({ board, boardSize, currentPlayer, players, onCellClick, gameMode }) => {
  const {
    canPlaceOrb,
    gameStatus,
    lastMoveTimestamp,
    explosionHistory,
    aiMoveIndicator,
  } = useGameStore()

  const [glowEffect, setGlowEffect] = useState(null)

  // Force re-render when lastMoveTimestamp changes (after AI moves)
  useEffect(() => {
    // This effect ensures the component re-renders when the timestamp updates
    // which happens after every move including AI moves
  }, [lastMoveTimestamp])

  const handleCellClick = async (x, y) => {
    if (gameStatus !== 'playing') return
    
    const currentPlayerData = players[currentPlayer]
    if (currentPlayerData?.eliminated) return
    
    if (canPlaceOrb(x, y)) {
      // Add click effect
      setGlowEffect({ x, y, color: getPlayerColor(currentPlayer) })
      setTimeout(() => setGlowEffect(null), 600)
      
      // Call the parent's onCellClick handler
      if (onCellClick) {
        onCellClick(x, y)
      }
    }
  }

  const getPlayerColor = (owner) => {
    if (owner === null) return null
    
    const colors = [
      { 
        bg: 'bg-red-500', 
        border: 'border-red-400', 
        glow: 'shadow-red-400/50',
        hex: '#ef4444',
        light: '#f87171'
      },
      { 
        bg: 'bg-blue-500', 
        border: 'border-blue-400', 
        glow: 'shadow-blue-400/50',
        hex: '#3b82f6',
        light: '#60a5fa'
      },
      { 
        bg: 'bg-green-500', 
        border: 'border-green-400', 
        glow: 'shadow-green-400/50',
        hex: '#10b981',
        light: '#34d399'
      },
      { 
        bg: 'bg-yellow-500', 
        border: 'border-yellow-400', 
        glow: 'shadow-yellow-400/50',
        hex: '#f59e0b',
        light: '#fbbf24'
      },
      { 
        bg: 'bg-purple-500', 
        border: 'border-purple-400', 
        glow: 'shadow-purple-400/50',
        hex: '#8b5cf6',
        light: '#a78bfa'
      },
      { 
        bg: 'bg-pink-500', 
        border: 'border-pink-400', 
        glow: 'shadow-pink-400/50',
        hex: '#ec4899',
        light: '#f472b6'
      },
      { 
        bg: 'bg-orange-500', 
        border: 'border-orange-400', 
        glow: 'shadow-orange-400/50',
        hex: '#f97316',
        light: '#fb923c'
      },
      { 
        bg: 'bg-cyan-500', 
        border: 'border-cyan-400', 
        glow: 'shadow-cyan-400/50',
        hex: '#06b6d4',
        light: '#22d3ee'
      }
    ]
    
    return colors[owner % colors.length] || colors[0]
  }

  const getCellBackground = (cell, x, y) => {
    const isCorner = (x === 0 || x === boardSize.width - 1) && (y === 0 || y === boardSize.height - 1)
    const isEdge = !isCorner && (x === 0 || x === boardSize.width - 1 || y === 0 || y === boardSize.height - 1)
    
    let baseClass = 'relative overflow-hidden '
    
    // Base gradient background
    if (cell.owner !== null) {
      const color = getPlayerColor(cell.owner)
      baseClass += `bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 `
    } else {
      baseClass += 'bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/70 '
    }
    
    // Border styling
    if (cell.owner !== null) {
      const color = getPlayerColor(cell.owner)
      baseClass += `border-2 ${color.border} shadow-lg `
    } else if (isHoverable(x, y)) {
      baseClass += 'border-2 border-blue-400/60 hover:border-blue-400 '
    } else {
      baseClass += 'border border-slate-600/30 '
    }
    
    // Critical mass warning
    if (cell.orbs === cell.criticalMass - 1 && cell.orbs > 0) {
      baseClass += 'animate-pulse ring-2 ring-red-500/60 '
    }
    
    return baseClass
  }

  const isHoverable = (x, y) => {
    return gameStatus === 'playing' && 
           !players[currentPlayer]?.eliminated && 
           canPlaceOrb(x, y) &&
           // Prevent hover effects during AI's turn
           !((gameMode === 'ai' || gameMode === 'learn') && currentPlayer === 1)
  }

  const renderOrbs = (cell, x, y) => {
    if (cell.orbs === 0) return null

    const color = getPlayerColor(cell.owner)
    const positions = getOrbPositions(cell.orbs, cell.criticalMass)
    
    return positions.map((position, index) => (
      <motion.div
        key={`orb-${x}-${y}-${index}-${lastMoveTimestamp}`}
        className="absolute rounded-full border-2 shadow-lg"
        style={{
          left: position.x,
          top: position.y,
          width: position.size,
          height: position.size,
          background: `radial-gradient(circle at 30% 30%, ${color.light}, ${color.hex})`,
          borderColor: color.hex,
          boxShadow: `
            0 0 ${position.size/4}px ${color.hex}80,
            0 2px 4px rgba(0,0,0,0.3)
          `
        }}
        initial={{ scale: 0, opacity: 0, rotate: 0 }}
        animate={{ 
          scale: cell.exploding ? [1, 1.8, 0] : [0, 1.2, 1], 
          opacity: cell.exploding ? [1, 1, 0] : [0, 1, 1],
          rotate: cell.exploding ? [0, 720] : 360 // Simple continuous rotation like original
        }}
        transition={{ 
          duration: cell.exploding ? 0.6 : 0.4,
          delay: index * 0.1,
          ease: cell.exploding ? "easeOut" : "backOut",
          rotate: {
            duration: 2, // Fast rotation like original
            repeat: Infinity,
            ease: "linear"
          }
        }}
      >
        {/* Simple highlight like original */}
        <div 
          className="absolute bg-white/60 rounded-full"
          style={{
            width: Math.max(2, position.size * 0.15),
            height: Math.max(2, position.size * 0.15),
            top: '25%',
            left: '30%',
          }}
        />

        {/* Critical mass warning pulse */}
        {cell.orbs === cell.criticalMass - 1 && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-400"
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </motion.div>
    ))
  }

  const getOrbPositions = (orbCount, criticalMass) => {
    // Use responsive cell size instead of fixed 64
    const cellSize = Math.min(48, Math.max(24, window.innerWidth * 0.06)) // Responsive cell size
    const baseSize = Math.min(12, cellSize / (orbCount + 1))
    const center = cellSize / 2
    
    // Dynamic orb sizing based on count
    const orbSize = baseSize + (criticalMass - orbCount) * 1.5
    const halfOrb = orbSize / 2
    
    switch (orbCount) {
      case 1:
        return [{ 
          x: center - halfOrb, 
          y: center - halfOrb, 
          size: orbSize 
        }]
      
      case 2:
        if (criticalMass === 2) { // corner cell
          return [
            { x: center - halfOrb - 4, y: center - halfOrb, size: orbSize },
            { x: center - halfOrb + 4, y: center - halfOrb, size: orbSize }
          ]
        } else { // edge or center cell
          return [
            { x: center - halfOrb, y: center - halfOrb - 4, size: orbSize },
            { x: center - halfOrb, y: center - halfOrb + 4, size: orbSize }
          ]
        }
      
      case 3:
        if (criticalMass === 3) { // edge cell about to explode
          return [
            { x: center - halfOrb, y: center - halfOrb - 6, size: orbSize },
            { x: center - halfOrb - 5, y: center - halfOrb + 3, size: orbSize },
            { x: center - halfOrb + 5, y: center - halfOrb + 3, size: orbSize }
          ]
        } else { // center cell
          return [
            { x: center - halfOrb - 6, y: center - halfOrb - 3, size: orbSize },
            { x: center - halfOrb + 6, y: center - halfOrb - 3, size: orbSize },
            { x: center - halfOrb, y: center - halfOrb + 5, size: orbSize }
          ]
        }
      
      case 4:
      default:
        return [
          { x: center - halfOrb - 6, y: center - halfOrb - 6, size: orbSize },
          { x: center - halfOrb + 6, y: center - halfOrb - 6, size: orbSize },
          { x: center - halfOrb - 6, y: center - halfOrb + 6, size: orbSize },
          { x: center - halfOrb + 6, y: center - halfOrb + 6, size: orbSize }
        ]
    }
  }

  const renderExplosionEffect = (cell, x, y) => {
    if (!cell.exploding) return null
    
    return (
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: [0, 1, 0], 
          scale: [0, 1.2, 1.5],
        }}
        transition={{ 
          duration: 0.4, 
          ease: "easeOut"
        }}
      >
        {/* Simple explosion ring */}
        <motion.div 
          className="absolute inset-0 rounded-full border-3 border-yellow-400"
          animate={{ 
            scale: [0, 1, 1.8], 
            opacity: [1, 0.8, 0]
          }}
          transition={{ 
            duration: 0.4, 
            ease: "easeOut"
          }}
        />
        
        {/* Simple particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full"
            style={{
              left: '50%',
              top: '50%',
            }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos(i * Math.PI / 3) * 20,
              y: Math.sin(i * Math.PI / 3) * 20
            }}
            transition={{
              duration: 0.4,
              delay: 0.05,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>
    )
  }

  const renderCriticalMassIndicator = (cell) => {
    if (cell.orbs > 0) return null
    
    const positions = getOrbPositions(cell.criticalMass, cell.criticalMass)
    
    return positions.map((position, index) => (
      <div
        key={`indicator-${index}`}
        className="absolute w-1 h-1 bg-slate-500/20 rounded-full border border-slate-400/10"
        style={{
          left: position.x + position.size/2 - 2,
          top: position.y + position.size/2 - 2,
        }}
      />
    ))
  }

  const renderAtomTransitions = () => {
    console.log('🎯 GameBoard explosionHistory:', explosionHistory)
    
    if (!explosionHistory || explosionHistory.length === 0) {
      return null
    }
    
    const transitions = []
    
    // Process all explosion rounds
    explosionHistory.forEach((explosionRound, roundIndex) => {
      if (!Array.isArray(explosionRound)) return
      
      explosionRound.forEach((explosion, explosionIndex) => {
        const { x, y, owner } = explosion
        const color = getPlayerColor(owner)
        const neighbors = getNeighborPositions(x, y)
        
        neighbors.forEach((neighbor, neighborIndex) => {
          transitions.push(
            <motion.div
              key={`atom-transition-${x}-${y}-${neighbor.x}-${neighbor.y}-${roundIndex}-${explosionIndex}-${neighborIndex}`}
              className="absolute pointer-events-none z-20"
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: color.hex,
                border: `1px solid ${color.hex}`
              }}
              initial={{ 
                x: `calc(50% - ${boardSize.width * 24}px / 2 + ${x * 26}px + 10px)`,
                y: `calc(50% - ${boardSize.height * 24}px / 2 + ${y * 26}px + 10px)`,
                scale: 0,
                opacity: 0
              }}
              animate={{ 
                x: `calc(50% - ${boardSize.width * 24}px / 2 + ${neighbor.x * 26}px + 10px)`,
                y: `calc(50% - ${boardSize.height * 24}px / 2 + ${neighbor.y * 26}px + 10px)`,
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 0.4,
                delay: roundIndex * 0.2 + (explosionIndex * 0.05),
                ease: "easeOut"
              }}
            />
          )
        })
      })
    })
    
    return transitions
  }

  const getNeighborPositions = (x, y) => {
    const neighbors = []
    const directions = [
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 },  // right
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 }   // down
    ]
    
    directions.forEach(({ dx, dy }) => {
      const nx = x + dx
      const ny = y + dy
      
      if (nx >= 0 && nx < boardSize.width && ny >= 0 && ny < boardSize.height) {
        neighbors.push({ x: nx, y: ny })
      }
    })
    
    return neighbors
  }

  const renderAIMoveIndicator = () => {
    if (!aiMoveIndicator) return null
    
    if (aiMoveIndicator.type === 'thinking') {
      return (
        <motion.div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 px-4 py-2 bg-blue-600/90 backdrop-blur-md rounded-lg border border-blue-400/50 shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-center gap-2 text-white text-sm font-medium">
            <motion.div
              className="w-2 h-2 bg-blue-300 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span>AI is thinking...</span>
          </div>
        </motion.div>
      )
    }
    
    return null
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full p-1 sm:p-2 lg:p-4 overflow-hidden">
      {/* Game Board Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* AI Move Indicator - positioned relative to board */}
        {renderAIMoveIndicator()}
        
        {/* Atom Transitions */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <AnimatePresence>
            {renderAtomTransitions()}
          </AnimatePresence>
        </div>
        
        <div 
          className="grid gap-0.5 p-1 sm:p-2 lg:p-4 rounded-2xl lg:rounded-3xl bg-gradient-to-br from-slate-800/40 via-slate-900/60 to-slate-800/40 backdrop-blur-xl border border-slate-700/30 shadow-2xl relative"
          style={{
            gridTemplateColumns: `repeat(${boardSize.width}, clamp(24px, 6vw, 48px))`,
            gridTemplateRows: `repeat(${boardSize.height}, clamp(24px, 6vw, 48px))`,
            maxWidth: 'min(95vw, 95vh)',
            maxHeight: 'min(95vw, 95vh)',
            background: `
              linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4)),
              radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1), transparent),
              radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1), transparent)
            `,
          }}
        >
          {/* Glow Effect - positioned relative to grid */}
          {glowEffect && (
            <motion.div
              className="absolute pointer-events-none z-30"
              style={{
                gridColumn: glowEffect.x + 1,
                gridRow: glowEffect.y + 1,
                width: 'clamp(24px, 6vw, 48px)',
                height: 'clamp(24px, 6vw, 48px)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.8 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div 
                className="w-full h-full rounded-lg"
                style={{
                  background: `radial-gradient(circle, ${glowEffect.color.light}40, transparent)`,
                  boxShadow: `0 0 20px ${glowEffect.color.hex}80`
                }}
              />
            </motion.div>
          )}
          
          {/* AI Move Indicator - positioned relative to grid */}
          {aiMoveIndicator && aiMoveIndicator.type === 'move' && aiMoveIndicator.position && (
            <motion.div
              className="absolute pointer-events-none z-30"
              style={{
                gridColumn: aiMoveIndicator.position.x + 1,
                gridRow: aiMoveIndicator.position.y + 1,
                width: 'clamp(24px, 6vw, 48px)',
                height: 'clamp(24px, 6vw, 48px)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 1], 
                opacity: [0, 1, 0.8] 
              }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-full h-full rounded-lg border-2 border-blue-400 bg-blue-400/20 flex items-center justify-center">
                <span className="text-blue-100 font-bold text-xs">AI</span>
              </div>
            </motion.div>
          )}
          
          {board.map((row, y) =>
            row.map((cell, x) => (
              <motion.div
                key={`${x}-${y}-${lastMoveTimestamp}`} // Include timestamp to force re-render
                className={`
                  flex items-center justify-center cursor-pointer rounded-lg lg:rounded-xl transition-all duration-300
                  ${getCellBackground(cell, x, y)}
                  ${isHoverable(x, y) ? 'hover:scale-105 hover:shadow-xl hover:z-10' : ''}
                `}
                style={{
                  width: 'clamp(24px, 6vw, 48px)',
                  height: 'clamp(24px, 6vw, 48px)',
                }}
                onClick={() => handleCellClick(x, y)}
                whileHover={isHoverable(x, y) ? { scale: 1.05, zIndex: 10 } : {}}
                whileTap={isHoverable(x, y) ? { scale: 0.95 } : {}}
                animate={cell.exploding ? { 
                  scale: [1, 1.1, 1],
                  rotate: [0, 2, -2, 0]
                } : {}}
                transition={{ 
                  duration: 0.3,
                  ease: "easeOut"
                }}
              >
                {/* Background pattern */}
                <div className="absolute inset-0 rounded-lg lg:rounded-xl opacity-10">
                  <div className="absolute inset-1 lg:inset-2 rounded-md lg:rounded-lg border border-white/5" />
                </div>
                
                {/* Critical mass indicator for empty cells */}
                {renderCriticalMassIndicator(cell)}
                
                {/* Orbs */}
                {renderOrbs(cell, x, y)}
                
                {/* Explosion effect */}
                <AnimatePresence>
                  {renderExplosionEffect(cell, x, y)}
                </AnimatePresence>
                
                {/* Cell type indicator */}
                {cell.orbs === 0 && (
                  <div className={`absolute bottom-0.5 right-0.5 text-xs font-bold opacity-20 ${
                    cell.criticalMass === 2 ? 'text-red-300' :
                    cell.criticalMass === 3 ? 'text-yellow-300' : 'text-green-300'
                  }`}>
                    {cell.criticalMass}
                  </div>
                )}
                
                {/* Orb count display */}
                {cell.orbs > 0 && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 text-xs font-bold text-white bg-black/80 rounded-full w-3 h-3 lg:w-4 lg:h-4 flex items-center justify-center border border-white/30 shadow-lg"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    {cell.orbs}
                  </motion.div>
                )}
                
                {/* Hover indicator */}
                {isHoverable(x, y) && (
                  <motion.div
                    className="absolute inset-0 rounded-lg lg:rounded-xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="absolute inset-0 rounded-lg lg:rounded-xl bg-gradient-to-br from-blue-400/20 via-transparent to-blue-400/10 border border-blue-400/40" />
                    <div className="absolute inset-1 rounded-md lg:rounded-lg bg-gradient-to-br from-blue-400/10 to-transparent" />
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default GameBoard