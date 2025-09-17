# 🚀 Quick Start Guide - Somnia Testnet Deployment

## ✅ **What's Been Updated:**

### **1. Correct Somnia Testnet Configuration:**
- **Chain ID:** 50312 (0xC488 in hex)
- **Network Name:** Somnia Testnet
- **Token Symbol:** STT (Somnia Test Token)
- **RPC URL:** https://dream-rpc.somnia.network
- **Block Explorer:** https://somnia-devnet.socialscan.io

### **2. Files Created/Updated:**
- ✅ `src/config/blockchain.js` - Updated with correct network info
- ✅ `hardhat.config.js` - Configured for Somnia testnet
- ✅ `contracts/GameRegistry.sol` - Smart contract ready
- ✅ `scripts/deploy.js` - Deployment script updated
- ✅ `SMART_CONTRACT_DEPLOYMENT_GUIDE.md` - Complete step-by-step guide
- ✅ `env.example` - Environment template
- ✅ `setup-deployment.js` - Automated setup script

## 🎯 **Next Steps (Step-by-Step):**

### **Step 1: Add Somnia Testnet to MetaMask**
1. Open MetaMask
2. Click network dropdown → "Add network" → "Add network manually"
3. Fill in:
   - **Network Name:** Somnia Testnet
   - **RPC URL:** https://dream-rpc.somnia.network
   - **Chain ID:** 50312
   - **Currency Symbol:** STT
   - **Explorer:** https://somnia-devnet.socialscan.io

### **Step 2: Get Test Tokens**
- Ask in Somnia community for STT test tokens
- You need tokens for gas fees during deployment

### **Step 3: Prepare for Deployment**
```bash
# Edit .env file and add your private key
# IMPORTANT: Never share your private key!

# Install Hardhat dependencies (already done)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
```

### **Step 4: Deploy Smart Contract**
```bash
# Compile contracts
npx hardhat compile

# Deploy to Somnia testnet
npx hardhat run scripts/deploy.js --network somniaTestnet
```

### **Step 5: Update Frontend**
1. Copy the deployed contract address from the output
2. Update `src/config/blockchain.js`:
   ```javascript
   CONTRACTS: {
     GAME_REGISTRY: '0x...', // Your deployed address
   },
   ```

### **Step 6: Test the Application**
```bash
# Start the application
npm run dev

# Test features:
# - Connect MetaMask to Somnia Testnet
# - Register with a nickname
# - Test social features
# - Check achievements
```

## 🔧 **Troubleshooting:**

### **Common Issues:**
1. **"Insufficient Balance"** → Get more STT tokens
2. **"Network Not Supported"** → Make sure MetaMask is on Somnia Testnet
3. **"Contract Not Found"** → Check contract address in config
4. **"Transaction Failed"** → Check gas settings and try again

### **Debug Commands:**
```bash
# Check network status
npx hardhat console --network somniaTestnet

# View deployment info
cat ./deployments/deployment.json
```

## 📖 **Detailed Documentation:**
- **Complete Guide:** `SMART_CONTRACT_DEPLOYMENT_GUIDE.md`
- **Environment Setup:** `env.example`
- **Smart Contract:** `contracts/GameRegistry.sol`

## 🎉 **You're Ready!**

Your Chain Reaction game is now configured for **Somnia Testnet** with:
- ✅ Correct network configuration
- ✅ Smart contract ready for deployment
- ✅ Frontend integration complete
- ✅ Step-by-step deployment guide

**Happy deploying! 🚀⛓️** 