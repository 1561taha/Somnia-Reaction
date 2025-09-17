// Puzzle Types and Categories for Somnia Reaction Game

export const PUZZLE_CATEGORIES = {
  TUTORIAL: 'tutorial',
  TACTICAL: 'tactical',
  STRATEGIC: 'strategic',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
}

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
}

export const OBJECTIVE_TYPES = {
  ELIMINATE_OPPONENT: 'eliminate_opponent',
  CONTROL_TERRITORY: 'control_territory',
  CHAIN_REACTION: 'chain_reaction',
  SURVIVAL: 'survival'
}

// Category display information
export const CATEGORY_INFO = {
  [PUZZLE_CATEGORIES.TUTORIAL]: {
    name: 'Tutorial',
    description: 'Learn the basics of Somnia Reaction',
    icon: '🎓',
    color: '#10b981'
  },
  [PUZZLE_CATEGORIES.TACTICAL]: {
    name: 'Tactical',
    description: 'Quick strategic thinking challenges',
    icon: '⚔️',
    color: '#f59e0b'
  },
  [PUZZLE_CATEGORIES.STRATEGIC]: {
    name: 'Strategic',
    description: 'Long-term planning puzzles',
    icon: '🧠',
    color: '#3b82f6'
  },
  [PUZZLE_CATEGORIES.ADVANCED]: {
    name: 'Advanced',
    description: 'Complex multi-step challenges',
    icon: '🔥',
    color: '#ef4444'
  },
  [PUZZLE_CATEGORIES.EXPERT]: {
    name: 'Expert',
    description: 'Master-level puzzles',
    icon: '👑',
    color: '#8b5cf6'
  }
}
