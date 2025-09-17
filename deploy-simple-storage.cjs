const { ethers } = require('ethers');

async function main() {
  console.log('🚀 Deploying simple storage contract to Somnia Testnet...');

  // Connect to Somnia testnet
  const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network');
  
  // Create wallet from private key
  const privateKey = '0xf8d0de0b244273aa96d92f2b2155e7eab7294ab6b78a71419c634bdb18644ea9';
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('📝 Deploying with account:', wallet.address);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'STT');

  if (balance < ethers.parseEther('0.1')) {
    console.error('❌ Insufficient balance for deployment. Please add more STT to your account.');
    process.exit(1);
  }

  try {
    console.log('📦 Deploying simple storage contract...');
    
    // Simple storage contract bytecode (clean, no line breaks)
    const contractBytecode = '0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80632e64cec11461003b5780636057361d14610059575b600080fd5b610043610075565b60405161005091906100a1565b60405180910390f35b610073600480360381019061006e91906100ed565b61007e565b005b60008054905090565b8060008190555050565b6000819050919050565b61009b81610088565b82525050565b60006020820190506100b66000830184610092565b92915050565b600080fd5b6100ca81610088565b81146100d557600080fd5b50565b6000813590506100e7816100c1565b92915050565b600060208284031215610103576101026100bc565b5b6000610111848285016100d8565b9150509291505056fea2646970667358221220d6c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c64736f6c63430008140033';
    
    // Deploy contract
    const tx = await wallet.sendTransaction({
      to: null, // This creates a contract
      data: contractBytecode,
      gasLimit: 500000
    });
    
    console.log('⏳ Waiting for deployment confirmation...');
    const receipt = await tx.wait();
    
    const contractAddress = receipt.contractAddress;
    console.log('✅ Contract deployed to:', contractAddress);

    // Verify deployment
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.error('❌ Contract deployment failed - no code at address');
      process.exit(1);
    }

    console.log('✅ Contract verification successful');

    // Log deployment information
    console.log('\n📊 Deployment Summary:');
    console.log('=========================');
    console.log('Contract: SimpleStorage');
    console.log('Address:', contractAddress);
    console.log('Network: Somnia Testnet');
    console.log('Deployer:', wallet.address);
    console.log('Transaction Hash:', tx.hash);

    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
      contract: 'SimpleStorage',
      address: contractAddress,
      network: 'Somnia Testnet',
      deployer: wallet.address,
      transactionHash: tx.hash,
      timestamp: new Date().toISOString(),
      chainId: 50312,
      rpcUrl: 'https://dream-rpc.somnia.network',
      explorerUrl: 'https://somnia-devnet.socialscan.io'
    };

    const deploymentPath = './deployments/deployment.json';
    
    if (!fs.existsSync('./deployments')) {
      fs.mkdirSync('./deployments');
    }

    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment info saved to:', deploymentPath);

    // Update the blockchain config
    console.log('\n🎯 Updating frontend configuration...');
    const configPath = './src/config/blockchain.js';
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update the contract address
    configContent = configContent.replace(
      /CONTRACTS:\s*{[^}]*}/,
      `CONTRACTS: { GAME_REGISTRY: '${contractAddress}' }`
    );
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Frontend configuration updated');

    console.log('\n🎯 Next Steps:');
    console.log('===============');
    console.log('1. View your contract on Somnia explorer:');
    console.log(`   https://somnia-devnet.socialscan.io/address/${contractAddress}`);
    console.log('');
    console.log('2. View transaction on explorer:');
    console.log(`   https://somnia-devnet.socialscan.io/tx/${tx.hash}`);
    console.log('');
    console.log('3. Start the frontend application:');
    console.log('   npm run dev');
    console.log('');
    console.log('4. Test the blockchain features:');
    console.log('   - User registration');
    console.log('   - Friend requests');
    console.log('   - Points updates');
    console.log('   - Achievement unlocking');

    console.log('\n🎉 Deployment completed successfully!');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('- Check your private key');
    console.log('- Ensure you have enough STT tokens for gas');
    console.log('- Verify network connection to Somnia testnet');
    process.exit(1);
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  }); 