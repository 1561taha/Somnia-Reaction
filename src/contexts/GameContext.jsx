import { createContext, useContext } from 'react'
import { create } from 'zustand'
import { useGameStore } from '../stores/gameStore'

const GameContext = createContext()

export function GameProvider({ children }) {
  return (
    <GameContext.Provider value={useGameStore}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context()
} 