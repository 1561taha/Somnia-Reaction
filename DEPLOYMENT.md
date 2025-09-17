# 🚀 Chain Reaction Game - Blockchain Deployment Guide

## 📋 Prerequisites

### Required Tools
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **Hardhat** (for smart contract deployment)
- **Somnia Network Testnet** access

### Development Environment Setup
```bash
# Install dependencies
npm install

# Install Hardhat for smart contract deployment
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Initialize Hardhat
npx hardhat init
```

## 🔧 Smart Contract Deployment

### 1. Configure Hardhat

Create `hardhat.config.js` in the root directory:

```javascript
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    somniaTestnet: {
      url: "https://testnet-rpc.somnia.com", // Replace with actual RPC URL
      chainId: 436,
      accounts: [process.env.PRIVATE_KEY], // Your deployment wallet private key
      gasPrice: 20000000000, // 20 gwei
    },
  },
};
```

### 2. Environment Variables

Create `.env` file in the root directory:

```env
PRIVATE_KEY=your_deployment_wallet_private_key_here
SOMNIA_RPC_URL=https://testnet-rpc.somnia.com
SOMNIA_EXPLORER_URL=https://testnet-explorer.somnia.com
```

### 3. Deploy Smart Contract

```bash
# Compile contracts
npx hardhat compile

# Deploy to Somnia testnet
npx hardhat run scripts/deploy.js --network somniaTestnet
```

### 4. Update Contract Address

After deployment, update the contract address in `src/config/blockchain.js`:

```javascript
CONTRACTS: {
  GAME_REGISTRY: '0x...', // Replace with deployed contract address
},
```

## 🌐 Frontend Configuration

### 1. Update Network Configuration

Update the RPC URLs and explorer URLs in `src/config/blockchain.js`:

```javascript
SOMNIA_TESTNET: {
  chainId: '0x1B4', // 436 in decimal
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'SOM',
    symbol: 'SOM',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-rpc.somnia.com'], // Actual RPC URL
  blockExplorerUrls: ['https://testnet-explorer.somnia.com'], // Actual explorer URL
},
```

### 2. Web3Modal Configuration

Get a project ID from [WalletConnect Cloud](https://cloud.walletconnect.com/) and update:

```javascript
WEB3MODAL_CONFIG = {
  projectId: 'YOUR_ACTUAL_PROJECT_ID',
  // ... rest of config
};
```

## 🚀 Deployment Steps

### 1. Smart Contract Deployment

```bash
# 1. Set up environment
cp .env.example .env
# Edit .env with your private key and RPC URLs

# 2. Deploy contract
npx hardhat run scripts/deploy.js --network somniaTestnet

# 3. Copy deployed contract address
# Update src/config/blockchain.js with the new address
```

### 2. Frontend Deployment

```bash
# Build the application
npm run build

# Deploy to your preferred hosting service
# Examples: Vercel, Netlify, GitHub Pages, etc.
```

### 3. Verify Smart Contract

```bash
# Verify contract on Somnia explorer
npx hardhat verify --network somniaTestnet DEPLOYED_CONTRACT_ADDRESS
```

## 🔍 Testing

### 1. Local Testing

```bash
# Start development server
npm run dev

# Test smart contract functions
npx hardhat test
```

### 2. Testnet Testing

1. **Connect MetaMask** to Somnia testnet
2. **Get test tokens** from faucet (if available)
3. **Test user registration**
4. **Test friend system**
5. **Test achievements and points**

## 📝 Configuration Files

### Smart Contract Addresses
- **Main Contract**: `GameRegistry.sol`
- **Deployed Address**: Update in `src/config/blockchain.js`

### Network Configuration
- **Chain ID**: 436 (Somnia testnet)
- **Currency**: SOM
- **Block Time**: ~2 seconds (estimated)

### Gas Settings
- **Max Fee Per Gas**: 20 gwei
- **Max Priority Fee Per Gas**: 2 gwei
- **Gas Limit**: 500,000 (default)

## 🛠️ Troubleshooting

### Common Issues

1. **MetaMask Connection Failed**
   - Ensure MetaMask is installed
   - Add Somnia testnet to MetaMask
   - Check RPC URL configuration

2. **Transaction Failed**
   - Check gas settings
   - Ensure sufficient balance
   - Verify network connection

3. **Contract Not Found**
   - Verify contract address
   - Check network configuration
   - Ensure contract is deployed

4. **User Registration Failed**
   - Check nickname availability
   - Verify nickname format (3-20 chars, alphanumeric + underscore)
   - Ensure wallet is connected

### Debug Commands

```bash
# Check contract deployment
npx hardhat console --network somniaTestnet

# Verify contract
npx hardhat verify --network somniaTestnet CONTRACT_ADDRESS

# Check network status
npx hardhat node --network somniaTestnet
```

## 🔐 Security Considerations

1. **Private Key Security**
   - Never commit private keys to version control
   - Use environment variables
   - Consider using hardware wallets for production

2. **Contract Security**
   - Audit smart contracts before deployment
   - Test thoroughly on testnet
   - Consider bug bounty programs

3. **Frontend Security**
   - Validate all user inputs
   - Implement proper error handling
   - Use HTTPS in production

## 📊 Monitoring

### Smart Contract Events
Monitor these events for game activity:
- `UserRegistered`
- `FriendRequestSent`
- `FriendRequestAccepted`
- `PointsUpdated`
- `AchievementUnlocked`
- `TierUpgraded`

### Performance Metrics
- Transaction success rate
- Gas usage optimization
- User registration rate
- Friend request activity

## 🎯 Next Steps

1. **Production Deployment**
   - Deploy to Somnia mainnet
   - Implement additional security measures
   - Set up monitoring and analytics

2. **Feature Enhancements**
   - Tournament system
   - NFT integration
   - Advanced achievements
   - Cross-chain compatibility

3. **Community Features**
   - Leaderboards
   - Guilds/clans
   - Social features
   - Marketplace

## 📞 Support

For deployment issues or questions:
1. Check the troubleshooting section
2. Review Somnia Network documentation
3. Contact the development team
4. Join community Discord/Telegram

---

**Note**: This deployment guide assumes you have access to Somnia Network testnet. Please refer to official Somnia documentation for the most up-to-date information. 