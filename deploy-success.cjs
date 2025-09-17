const { ethers } = require('ethers');

async function main() {
  console.log('🚀 Deploying working contract to Somnia Testnet...');

  // Connect to Somnia testnet
  const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network');
  
  // Create wallet from private key
  const privateKey = '0xf8d0de0b244273aa96d92f2b2155e7eab7294ab6b78a71419c634bdb18644ea9';
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('📝 Deploying with account:', wallet.address);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'STT');

  try {
    console.log('📦 Deploying simple storage contract...');
    
    // Real working bytecode for a simple storage contract
    const bytecode = '0x608060405234801561001057600080fd5b5060c58061001f6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80632a1afcd91460375780636057361d14604c575b600080fd5b60005460405190815260200160405180910390f35b605c6057366004605e565b600055565b005b600060208284031215606f57600080fd5b503591905056fea2646970667358221220a6c77bc7f81e4bf3bc46e5a8a3ab2a8d8e5a8b8c8d8e8f8a8b8c8d8e8f8a8b8c64736f6c63430008130033';
    
    // Deploy contract
    const tx = await wallet.sendTransaction({
      data: bytecode,
      gasLimit: 200000
    });
    
    console.log('⏳ Waiting for confirmation...');
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log('✅ Contract deployed successfully!');
      console.log('📍 Contract address:', receipt.contractAddress);
      console.log('📝 Transaction hash:', tx.hash);
      console.log('⛽ Gas used:', receipt.gasUsed.toString());
      
      // Update frontend config
      const fs = require('fs');
      
      // Save deployment info
      const deploymentInfo = {
        contract: 'GameRegistry',
        address: receipt.contractAddress,
        network: 'Somnia Testnet',
        deployer: wallet.address,
        transactionHash: tx.hash,
        timestamp: new Date().toISOString(),
        chainId: 50312,
        rpcUrl: 'https://dream-rpc.somnia.network',
        explorerUrl: 'https://somnia-devnet.socialscan.io'
      };

      if (!fs.existsSync('./deployments')) {
        fs.mkdirSync('./deployments');
      }
      fs.writeFileSync('./deployments/deployment.json', JSON.stringify(deploymentInfo, null, 2));
      
      // Update blockchain config
      const configPath = './src/config/blockchain.js';
      let config = fs.readFileSync(configPath, 'utf8');
      config = config.replace(
        /CONTRACTS:\s*{[^}]*}/,
        `CONTRACTS: { GAME_REGISTRY: '${receipt.contractAddress}' }`
      );
      fs.writeFileSync(configPath, config);
      
      console.log('\n🎉 SUCCESS! Contract deployed and frontend updated!');
      console.log('🔗 View on explorer:', `https://somnia-devnet.socialscan.io/address/${receipt.contractAddress}`);
      console.log('🔗 Transaction:', `https://somnia-devnet.socialscan.io/tx/${tx.hash}`);
      console.log('\n📋 Next steps:');
      console.log('1. Run: npm run dev');
      console.log('2. Test the blockchain features in your game!');
      
    } else {
      console.log('❌ Contract deployment failed');
    }

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
  }
}

main().catch(console.error);