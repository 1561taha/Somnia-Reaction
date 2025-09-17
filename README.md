# 🎮 Somnia Reaction Game

A complete blockchain-integrated strategy game built with React, featuring multiplayer gameplay, AI opponents, puzzle challenges, and on-chain leaderboards powered by Somnia Testnet.

![Somnia Reaction Game](https://img.shields.io/badge/Game-Somnia%20Reaction-blue)
![Blockchain](https://img.shields.io/badge/Blockchain-Somnia%20Testnet-green)
![React](https://img.shields.io/badge/Framework-React-61dafb)
![Solidity](https://img.shields.io/badge/Smart%20Contract-Solidity-363636)

## 🚀 Features

### 🎯 Core Gameplay
- **Strategic Board Game**: Classic chain reaction mechanics with modern UI
- **Multiple Game Modes**: VS AI, Local Multiplayer, Online Multiplayer, Puzzle Mode
- **Progressive Difficulty**: 5 learning levels with adaptive AI
- **Real-time Statistics**: Track explosions, chain reactions, and performance

### 🔗 Blockchain Integration
- **Somnia Testnet**: Fully integrated with Somnia blockchain
- **Smart Contracts**: Deployed on-chain leaderboard and user management
- **User Registration**: Unique nickname system with blockchain verification
- **Achievement System**: On-chain achievements and point tracking
- **Real Leaderboard**: Live ranking system with all players

### 🧩 Puzzle System
- **Multiple Categories**: Elimination, Territory Control, Chain Reactions, Survival
- **Difficulty Levels**: Beginner to Expert challenges
- **Dynamic Generation**: Procedurally generated puzzles
- **Progress Tracking**: Detailed statistics and completion tracking

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered transitions
- **Dark Theme**: Beautiful gradient-based design
- **Interactive Elements**: Hover effects and visual feedback

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Zustand** - Lightweight state management

### Blockchain
- **Ethers.js** - Ethereum/Somnia blockchain interaction
- **Solidity** - Smart contract development
- **MetaMask** - Wallet integration
- **Somnia Testnet** - Blockchain network

### Smart Contracts
- **GameRegistry.sol** - Main game contract with user management
- **GameRegistryOptimized.sol** - Optimized version with advanced features
- **On-chain Leaderboard** - Real-time player rankings
- **Achievement System** - Blockchain-based achievements

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MetaMask wallet
- Somnia Testnet STT tokens (for gas fees)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/somnia-reaction-game.git
   cd somnia-reaction-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Blockchain Setup

1. **Add Somnia Testnet to MetaMask**
   - Network Name: Somnia Testnet
   - RPC URL: https://testnet.somnia.network
   - Chain ID: 50312
   - Currency Symbol: STT

2. **Get Testnet Tokens**
   - Visit Somnia testnet faucet
   - Request STT tokens for gas fees

3. **Connect Wallet**
   - Click "Connect Wallet" in the game
   - Register with a unique nickname
   - Start playing and earning points!

## 🎮 How to Play

### Basic Rules
1. **Place Orbs**: Click on empty cells to place your colored orbs
2. **Critical Mass**: When a cell reaches its critical mass, it explodes
3. **Chain Reactions**: Explosions can trigger more explosions
4. **Win Condition**: Eliminate all opponent orbs to win

### Game Modes

#### 🎯 VS AI
- Play against intelligent AI opponents
- 5 difficulty levels from Beginner to Grandmaster
- Earn points and unlock achievements
- Track your progress and statistics

#### 👥 Local Multiplayer
- Play with friends on the same device
- Take turns placing orbs
- Perfect for local gaming sessions

#### 🌐 Online Multiplayer
- Play with players worldwide
- Real-time multiplayer experience
- Global leaderboard integration

#### 🧩 Puzzle Mode
- Strategic challenges and scenarios
- Multiple categories and difficulty levels
- Learn advanced strategies
- Earn puzzle-specific achievements

## 📊 Blockchain Features

### User System
- **Unique Nicknames**: Register with a custom nickname
- **On-chain Profile**: Your stats stored on blockchain
- **Achievement Tracking**: Unlock and display achievements
- **Point System**: Earn points for different game modes

### Leaderboard
- **Real-time Rankings**: Live leaderboard with all players
- **Multiple Categories**: VS AI, Puzzle, Total points
- **Global Competition**: Compete with players worldwide
- **Achievement Display**: Show off your accomplishments

### Smart Contract Functions
- `registerUser(nickname)` - Register with unique nickname
- `updatePoints(vsAi, multiplayer, puzzle)` - Update point totals
- `updateGameStats(gamesPlayed, gamesWon, ...)` - Track game statistics
- `unlockAchievement(achievementType)` - Unlock achievements
- `getLeaderboard()` - Fetch current leaderboard

## 🏗️ Project Structure

```
somnia-reaction-game/
├── contracts/                 # Smart contracts
│   ├── GameRegistry.sol      # Main game contract
│   └── GameRegistryOptimized.sol
├── src/
│   ├── components/           # React components
│   │   ├── blockchain/      # Blockchain-related components
│   │   ├── puzzles/         # Puzzle game components
│   │   └── ...
│   ├── config/              # Configuration files
│   ├── services/            # Blockchain service
│   ├── stores/              # State management
│   ├── utils/               # Utility functions
│   └── ...
├── docs/                    # Documentation
└── README.md
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Smart Contract Development
- Contracts are deployed on Somnia Testnet
- Use Remix IDE for contract development
- Contract address: `0x9D46AC88c047F899c188eBdECdaF74C8C2564412`

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📱 Screenshots

### Main Menu
- Beautiful gradient design
- Blockchain connection status
- User statistics display

### Game Board
- Interactive game board
- Real-time statistics
- Smooth animations

### Leaderboard
- Live player rankings
- Achievement display
- User profile integration

## 🎯 Roadmap

### Completed ✅
- [x] Core game mechanics
- [x] Blockchain integration
- [x] User registration system
- [x] On-chain leaderboard
- [x] Achievement system
- [x] Puzzle mode
- [x] AI opponents
- [x] Responsive design

### In Progress 🚧
- [ ] Advanced AI strategies
- [ ] Tournament system
- [ ] Social features
- [ ] Mobile app

### Planned 📋
- [ ] Cross-chain compatibility
- [ ] NFT integration
- [ ] Advanced analytics
- [ ] Community features

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Somnia Network** - For providing the blockchain infrastructure
- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Framer Motion** - For smooth animations
- **Ethers.js** - For blockchain interaction

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/somnia-reaction-game/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/somnia-reaction-game/discussions)
- **Discord**: [Join our Discord](https://discord.gg/somnia-reaction)

---

**Made with ❤️ for the Somnia ecosystem**

*Experience the future of gaming with blockchain integration!*