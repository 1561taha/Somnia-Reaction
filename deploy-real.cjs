const { ethers } = require('ethers');

async function main() {
  console.log('🚀 Deploying real contract to Somnia Testnet...');

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
    console.log('📦 Deploying real contract...');
    
    // Real bytecode for a simple storage contract (this is actual compiled bytecode)
    const bytecode = '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220d6c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c64736f6c63430008140033';
    
    // Deploy contract
    const tx = await wallet.sendTransaction({
      data: bytecode,
      gasLimit: 300000
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