const { ethers } = require('ethers');

async function main() {
  console.log('🚀 Testing Somnia Testnet connection...');

  // Connect to Somnia testnet
  const provider = new ethers.JsonRpcProvider('https://dream-rpc.somnia.network');
  
  // Create wallet from private key
  const privateKey = '0xf8d0de0b244273aa96d92f2b2155e7eab7294ab6b78a71419c634bdb18644ea9';
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log('📝 Testing with account:', wallet.address);

  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'STT');

  if (balance < ethers.parseEther('0.1')) {
    console.error('❌ Insufficient balance for testing. Please add more STT to your account.');
    process.exit(1);
  }

  try {
    console.log('📦 Testing network connection...');
    
    // Get current block number
    const blockNumber = await provider.getBlockNumber();
    console.log('📊 Current block number:', blockNumber);
    
    // Get network details
    const network = await provider.getNetwork();
    console.log('🌐 Network chain ID:', network.chainId);
    
    console.log('✅ Network connection successful!');
    
    // Test a simple transaction (send 0.001 STT to yourself)
    console.log('🧪 Testing transaction...');
    const tx = await wallet.sendTransaction({
      to: wallet.address,
      value: ethers.parseEther('0.001'),
      gasLimit: 21000
    });
    
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    
    console.log('✅ Transaction successful!');
    console.log('📝 Transaction hash:', tx.hash);
    console.log('⛽ Gas used:', receipt.gasUsed.toString());

    // Log test information
    console.log('\n📊 Test Summary:');
    console.log('=================');
    console.log('Network: Somnia Testnet');
    console.log('Account:', wallet.address);
    console.log('Balance:', ethers.formatEther(balance), 'STT');
    console.log('Block Number:', blockNumber);
    console.log('Chain ID:', network.chainId);
    console.log('Transaction Hash:', tx.hash);

    // Save test info
    const fs = require('fs');
    const testInfo = {
      network: 'Somnia Testnet',
      account: wallet.address,
      balance: ethers.formatEther(balance),
      blockNumber: blockNumber,
      chainId: network.chainId,
      transactionHash: tx.hash,
      timestamp: new Date().toISOString(),
      rpcUrl: 'https://dream-rpc.somnia.network',
      explorerUrl: 'https://somnia-devnet.socialscan.io'
    };

    const testPath = './deployments/test.json';
    
    if (!fs.existsSync('./deployments')) {
      fs.mkdirSync('./deployments');
    }

    fs.writeFileSync(testPath, JSON.stringify(testInfo, null, 2));
    console.log('💾 Test info saved to:', testPath);

    console.log('\n🎯 Next Steps:');
    console.log('===============');
    console.log('1. View your transaction on Somnia explorer:');
    console.log(`   https://somnia-devnet.socialscan.io/tx/${tx.hash}`);
    console.log('');
    console.log('2. Network is ready for contract deployment!');

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
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