// Optimized Blockchain Configuration
export const BLOCKCHAIN_CONFIG = {
  chainId: 50312,
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: ['https://dream-rpc.somnia.network'],
  blockExplorerUrls: ['https://somnia-devnet.socialscan.io'],
};

export const CONTRACTS = {
  GAME_REGISTRY: '0x9D46AC88c047F899c188eBdECdaF74C8C2564412',
};

export const GAS_SETTINGS = {
  maxFeePerGas: '1000000000', // 1 gwei
  maxPriorityFeePerGas: '1000000000', // 1 gwei
  gasLimit: 500000,
};

// Error messages for user-friendly error handling
export const ERROR_MESSAGES = {
  METAMASK_NOT_INSTALLED: 'MetaMask is not installed. Please install MetaMask to continue.',
  TRANSACTION_REJECTED: 'Transaction was rejected by user.',
  INSUFFICIENT_FUNDS: 'Insufficient funds for gas.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  INVALID_NICKNAME: 'Invalid nickname. Please use 1-32 characters.',
  USER_ALREADY_REGISTERED: 'User is already registered.',
  BLOCKCHAIN_NOT_CONNECTED: 'Blockchain not connected. Please connect your wallet.',
};

// Optimized ABI - Only essential functions
export const GAME_REGISTRY_ABI = [
  // User Registration
  {
    "inputs": [{"internalType": "string", "name": "_nickname", "type": "string"}],
    "name": "registerUser",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "isUserRegistered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Points Management
  {
    "inputs": [
      {"internalType": "uint256", "name": "_vsAi", "type": "uint256"},
      {"internalType": "uint256", "name": "_multiplayer", "type": "uint256"},
      {"internalType": "uint256", "name": "_puzzle", "type": "uint256"}
    ],
    "name": "updatePoints",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_vsAi", "type": "uint256"},
      {"internalType": "uint256", "name": "_multiplayer", "type": "uint256"},
      {"internalType": "uint256", "name": "_puzzle", "type": "uint256"}
    ],
    "name": "addPoints",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Stats Management
  {
    "inputs": [
      {"internalType": "uint256", "name": "_gamesPlayed", "type": "uint256"},
      {"internalType": "uint256", "name": "_gamesWon", "type": "uint256"}
    ],
    "name": "updateGameStats",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_chainReactions", "type": "uint256"},
      {"internalType": "uint256", "name": "_eliminations", "type": "uint256"},
      {"internalType": "uint256", "name": "_longestChain", "type": "uint256"},
      {"internalType": "uint256", "name": "_perfectGames", "type": "uint256"}
    ],
    "name": "updateAdvancedStats",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Achievements
  {
    "inputs": [{"internalType": "string", "name": "_name", "type": "string"}],
    "name": "unlockAchievement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Leaderboard
  {
    "inputs": [],
    "name": "getUserCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTopUser",
    "outputs": [
      {"internalType": "address", "name": "", "type": "address"},
      {"internalType": "string", "name": "", "type": "string"},
      {"internalType": "uint256", "name": "", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_startIndex", "type": "uint256"},
      {"internalType": "uint256", "name": "_count", "type": "uint256"}
    ],
    "name": "getLeaderboardChunk",
    "outputs": [
      {"internalType": "address[]", "name": "users", "type": "address[]"},
      {"internalType": "string[]", "name": "nicknames", "type": "string[]"},
      {"internalType": "uint256[]", "name": "points", "type": "uint256[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Getters
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserBasic",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "nickname", "type": "string"},
          {"internalType": "uint256", "name": "registrationTime", "type": "uint256"},
          {"internalType": "bool", "name": "isRegistered", "type": "bool"}
        ],
        "internalType": "struct GameRegistryOptimized.UserBasic",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserPoints",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "totalPoints", "type": "uint256"},
          {"internalType": "uint256", "name": "vsAiPoints", "type": "uint256"},
          {"internalType": "uint256", "name": "multiplayerPoints", "type": "uint256"},
          {"internalType": "uint256", "name": "puzzlePoints", "type": "uint256"}
        ],
        "internalType": "struct GameRegistryOptimized.UserPoints",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserStats",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "gamesPlayed", "type": "uint256"},
          {"internalType": "uint256", "name": "gamesWon", "type": "uint256"},
          {"internalType": "uint256", "name": "chainReactions", "type": "uint256"},
          {"internalType": "uint256", "name": "eliminations", "type": "uint256"},
          {"internalType": "uint256", "name": "longestChain", "type": "uint256"},
          {"internalType": "uint256", "name": "perfectGames", "type": "uint256"}
        ],
        "internalType": "struct GameRegistryOptimized.UserStats",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserAchievements",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "name", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "uint256", "name": "points", "type": "uint256"},
          {"internalType": "bool", "name": "isUnlocked", "type": "bool"},
          {"internalType": "uint256", "name": "unlockTime", "type": "uint256"}
        ],
        "internalType": "struct GameRegistryOptimized.Achievement[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];