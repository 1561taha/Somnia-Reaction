# 🚀 Smart Contract Deployment Guide - Somnia Testnet

## 📋 Prerequisites

### Required Tools
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension
- **A wallet with some STT tokens** for gas fees

### Development Environment Setup
```bash
# Install Hardhat and dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv

# Install additional dependencies if not already installed
npm install ethers@^6.8.1
```

## 🔧 Step 1: Environment Setup

### 1.1 Create Environment File
```bash
# Copy the example environment file
cp env.example .env
```

### 1.2 Edit .env File
Open `.env` and add your private key:
```env
# Somnia Network Configuration
SOMNIA_RPC_URL=https://dream-rpc.somnia.network
SOMNIA_EXPLORER_URL=https://somnia-devnet.socialscan.io

# Contract Address (will be updated after deployment)
GAME_REGISTRY_ADDRESS=0x0000000000000000000000000000000000000000

# Deployment Configuration (for Hardhat)
PRIVATE_KEY=your_deployment_wallet_private_key_here

# Network Details
CHAIN_ID=50312
NETWORK_NAME=Somnia Testnet
TOKEN_SYMBOL=STT
```

**⚠️ Important:** Never share your private key or commit it to version control!

## 🌐 Step 2: Add Somnia Testnet to MetaMask

### 2.1 Manual Network Addition
1. Open MetaMask
2. Click on the network dropdown (usually shows "Ethereum Mainnet")
3. Click "Add network" → "Add network manually"
4. Fill in the details:
   - **Network Name:** Somnia Testnet
   - **New RPC URL:** https://dream-rpc.somnia.network
   - **Chain ID:** 50312
   - **Currency Symbol:** STT
   - **Block Explorer URL:** https://somnia-devnet.socialscan.io

### 2.2 Get Test Tokens
- Visit the Somnia testnet faucet (if available)
- Or ask in the Somnia community for test tokens
- You need STT tokens to pay for gas fees

## 📦 Step 3: Deploy Smart Contract

### 3.1 Compile Contracts
```bash
# Compile the smart contracts
npx hardhat compile
```

### 3.2 Deploy to Somnia Testnet
```bash
# Deploy the GameRegistry contract
npx hardhat run scripts/deploy.js --network somniaTestnet
```

### 3.3 Expected Output
You should see something like:
```
🚀 Starting Chain Reaction Game deployment...
📝 Deploying contracts with account: 0x...
💰 Account balance: 1.5 STT
📦 Deploying GameRegistry contract...
⏳ Waiting for deployment confirmation...
✅ GameRegistry deployed to: 0x1234567890abcdef...
✅ Contract verification successful

📊 Deployment Summary:
=========================
Contract: GameRegistry
Address: 0x1234567890abcdef...
Network: somniaTestnet
Deployer: 0x...
Gas Used: 1234567

💾 Deployment info saved to: ./deployments/deployment.json

🎯 Next Steps:
===============
1. Update src/config/blockchain.js with the contract address
2. Verify the contract on Somnia explorer
3. Test the contract functions

🎉 Deployment completed successfully!
```

## 🔍 Step 4: Update Frontend Configuration

### 4.1 Update Contract Address
Open `src/config/blockchain.js` and update the contract address:
```javascript
CONTRACTS: {
  GAME_REGISTRY: '0x1234567890abcdef...', // Replace with your deployed address
},
```

### 4.2 Verify Configuration
Make sure the network configuration is correct:
```javascript
SOMNIA_TESTNET: {
  chainId: '0xC488', // 50312 in decimal
  chainName: 'Somnia Testnet',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: ['https://dream-rpc.somnia.network'],
  blockExplorerUrls: ['https://somnia-devnet.socialscan.io'],
},
```

## ✅ Step 5: Test the Deployment

### 5.1 Start the Application
```bash
npm run dev
```

### 5.2 Test User Registration
1. Open the application in your browser
2. Connect MetaMask to Somnia Testnet
3. Navigate to the registration page
4. Enter a nickname and register
5. Check the transaction on the block explorer

### 5.3 Test Social Features
1. Try sending friend requests
2. Test the achievement system
3. Verify points are being tracked

## 🔧 Step 6: Troubleshooting

### Common Issues

#### 1. "Insufficient Balance" Error
- **Solution:** Get more STT tokens from the faucet
- **Check:** Your wallet balance on the block explorer

#### 2. "Network Not Supported" Error
- **Solution:** Make sure MetaMask is connected to Somnia Testnet
- **Check:** Network configuration in MetaMask

#### 3. "Contract Not Found" Error
- **Solution:** Verify the contract address is correct
- **Check:** Update the address in `src/config/blockchain.js`

#### 4. "Transaction Failed" Error
- **Solution:** Check gas settings and try again
- **Check:** Network connection and RPC URL

### Debug Commands
```bash
# Check network status
npx hardhat console --network somniaTestnet

# Verify contract (if supported)
npx hardhat verify --network somniaTestnet CONTRACT_ADDRESS

# Check deployment info
cat ./deployments/deployment.json
```

## 📊 Step 7: Monitor and Maintain

### 7.1 Monitor Transactions
- Use the block explorer: https://somnia-devnet.socialscan.io
- Track your contract address
- Monitor gas usage

### 7.2 Update Gas Settings
If transactions are failing, you might need to adjust gas settings in `src/config/blockchain.js`:
```javascript
GAS_SETTINGS = {
  maxFeePerGas: '30000000000', // Increase if needed
  maxPriorityFeePerGas: '3000000000', // Increase if needed
  gasLimit: '600000', // Increase if needed
};
```

## 🎯 Next Steps

### After Successful Deployment:
1. **Test all features** thoroughly
2. **Document the contract address** for future reference
3. **Share with your team** for testing
4. **Monitor performance** and gas usage
5. **Plan for mainnet deployment** when ready

### Production Considerations:
- **Security audit** before mainnet
- **Gas optimization** for cost efficiency
- **Backup deployment** addresses
- **Monitoring and alerting** setup

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all configuration settings
3. Check the Somnia Network documentation
4. Join the Somnia community for help

**Happy deploying! 🚀⛓️** 