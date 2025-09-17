# Chain Reaction Game

A modern, responsive Chain Reaction game built with React and blockchain technology, featuring local multiplayer, advanced AI opponents, social features, and beautiful animations.

![Chain Reaction Game](https://img.shields.io/badge/React-18.2.0-blue) ![Vite](https://img.shields.io/badge/Vite-4.1.0-purple) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.2.7-cyan) ![Blockchain](https://img.shields.io/badge/Blockchain-Somnia%20Network-green) ![Solidity](https://img.shields.io/badge/Solidity-0.8.19-orange)

## 🎮 Features

### Core Gameplay
- **Classic Chain Reaction mechanics** - Place orbs, trigger explosions, create chain reactions
- **Multiplayer support** - 2-8 players on the same device
- **Advanced AI opponent** - Chess-like strategic thinking with minimax algorithm
- **Flexible board sizes** - From small (6×8) to extra large (12×10)
- **Customizable explosion capacity** - 3, 4, or 5 orbs per cell
- **Real-time scoring** - Track territory control and player statistics

### 🚀 Blockchain Integration
- **User Registration** - Unique nickname registration on Somnia Network
- **Social System** - Friend requests, user search, and friend management
- **Achievement System** - Unlock achievements and earn points
- **Tier Progression** - 5-tier system based on total points
- **Separate Point Systems** - VS AI, Multiplayer, and Puzzle mode points
- **Profile Management** - View stats, achievements, and game history

### Modern UI/UX
- **Responsive design** - Works perfectly on mobile, tablet, and desktop
- **Smooth animations** - Powered by Framer Motion
- **Glassmorphism aesthetic** - Modern, beautiful interface
- **Dark theme** - Easy on the eyes
- **Accessible controls** - Keyboard and touch support

### Game Modes
- **Local Multiplayer** - Play with friends on the same device
- **VS AI** - Challenge our advanced AI with three difficulty levels
- **Online Multiplayer** - Play with registered players worldwide
- **Puzzle Mode** - Solve strategic puzzles and challenges
- **Social Hub** - Connect with friends and find new players

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- MetaMask browser extension
- Somnia Network testnet access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chain-reaction-game
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure blockchain (optional)**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your configuration
   # See DEPLOYMENT.md for details
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 🔗 Blockchain Features

### User Registration
- Connect MetaMask wallet to Somnia testnet
- Register with a unique nickname (3-20 characters)
- Nicknames are stored on-chain and globally unique
- Automatic achievement unlocking upon registration

### Social System
- **Friend Requests** - Send and receive friend requests
- **User Search** - Find players by nickname
- **Friend Management** - Accept, reject, or remove friends
- **Friend Activity** - View friend stats and achievements

### Achievement System
- **First Steps** - Register your account (10 points)
- **Social Butterfly** - Add your first friend (50 points)
- **Puzzle Master** - Complete 10 puzzles (100 points)
- **Multiplayer Champion** - Win 10 multiplayer games (200 points)
- **AI Destroyer** - Win 50 games against AI (150 points)

### Tier System
- **Beginner** (0-499 points)
- **Advanced** (500-1,999 points)
- **Expert** (2,000-4,999 points)
- **Master** (5,000-9,999 points)
- **Grandmaster** (10,000+ points)

### Point Categories
- **VS AI Points** - Earned by playing against AI
- **Multiplayer Points** - Earned in online multiplayer games
- **Puzzle Points** - Earned by solving puzzles
- **Total Points** - Sum of all point categories

## 🎯 How to Play

### Objective
Eliminate all other players by controlling territory and triggering chain reactions. The last player standing wins!

### Basic Rules
1. **Place orbs** by clicking on empty cells or your own territory
2. **Explosions occur** when a cell reaches its capacity (3-5 orbs)
3. **Chain reactions** happen when explosions trigger more explosions
4. **Capture territory** by placing orbs on enemy cells
5. **Elimination** occurs when a player loses all territory and valid moves

### Controls
- **Mouse/Touch**: Click to place orbs
- **P**: Pause/Resume game
- **R**: Restart current game
- **Esc**: Return to main menu

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── MainMenu.jsx    # Main menu interface
│   ├── LocalGame.jsx   # Local multiplayer setup and game
│   ├── AIGame.jsx      # AI opponent setup and game
│   ├── OnlineGame.jsx  # Online multiplayer
│   ├── GameBoard.jsx   # Game grid and orb rendering
│   ├── GameUI.jsx      # Game interface and controls
│   ├── Settings.jsx    # Game settings and preferences
│   ├── Help.jsx        # Rules and strategy guide
│   └── blockchain/     # Blockchain-related components
│       ├── UserRegistration.jsx
│       ├── SocialFeatures.jsx
│       └── ProfileAndAchievements.jsx
├── contexts/           # React context providers
│   └── GameContext.jsx # Game state management
├── stores/             # State management
│   └── gameStore.js    # Zustand store for game logic
├── services/           # Service layer
│   └── blockchainService.js # Blockchain interaction service
├── config/             # Configuration files
│   └── blockchain.js   # Blockchain configuration
├── utils/              # Utility functions
│   ├── gameEngine.js   # Core game mechanics
│   └── aiEngine.js     # AI opponent logic
└── contracts/          # Smart contracts
    └── GameRegistry.sol # Main game contract

contracts/
└── GameRegistry.sol    # Smart contract for user management

scripts/
└── deploy.js          # Deployment script

deployments/
└── deployment.json    # Deployment information
```

## 🔧 Smart Contract

### GameRegistry.sol
The main smart contract that handles:
- User registration and nickname management
- Friend system (requests, acceptance, removal)
- Point tracking and tier progression
- Achievement system
- Event emission for frontend integration

### Key Functions
- `registerUser(string nickname)` - Register with unique nickname
- `sendFriendRequest(address to)` - Send friend request
- `acceptFriendRequest(address from)` - Accept friend request
- `updatePoints(uint256 vsAi, uint256 multiplayer, uint256 puzzle)` - Update points
- `unlockAchievement(string name)` - Unlock achievement

## 🚀 Deployment

### Smart Contract Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Steps
```bash
# Install Hardhat
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Configure environment
cp .env.example .env
# Edit .env with your private key and RPC URLs

# Deploy contract
npx hardhat run scripts/deploy.js --network somniaTestnet

# Update contract address in src/config/blockchain.js
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

### Adding New Features
1. **Smart Contract Changes** - Update `contracts/GameRegistry.sol`
2. **Frontend Integration** - Update `src/services/blockchainService.js`
3. **UI Components** - Add components in `src/components/blockchain/`
4. **Configuration** - Update `src/config/blockchain.js`

## 🔐 Security

### Smart Contract Security
- Input validation for all user inputs
- Access control for sensitive functions
- Event emission for transparency
- Gas optimization for cost efficiency

### Frontend Security
- Input sanitization and validation
- Secure wallet connection handling
- Error handling and user feedback
- HTTPS enforcement in production

## 📊 Monitoring

### Smart Contract Events
Monitor these events for game activity:
- `UserRegistered` - New user registration
- `FriendRequestSent` - Friend request sent
- `FriendRequestAccepted` - Friend request accepted
- `PointsUpdated` - Points updated
- `AchievementUnlocked` - Achievement unlocked
- `TierUpgraded` - Tier progression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions

## 🎉 Acknowledgments

- **Somnia Network** for blockchain infrastructure
- **React Team** for the amazing framework
- **Framer Motion** for smooth animations
- **Tailwind CSS** for beautiful styling
- **Ethers.js** for Web3 integration

---

**Built with ❤️ using React, Solidity, and Somnia Network** 