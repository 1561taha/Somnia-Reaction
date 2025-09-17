const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Chain Reaction Game deployment to Somnia Testnet...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Check deployer balance
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "STT");

  if (balance.lt(ethers.utils.parseEther("0.1"))) {
    console.error("❌ Insufficient balance for deployment. Please add more STT to your account.");
    console.log("💡 You can get test tokens from the Somnia testnet faucet.");
    process.exit(1);
  }

  try {
    // Deploy GameRegistry contract
    console.log("📦 Deploying GameRegistry contract...");
    const GameRegistry = await ethers.getContractFactory("GameRegistry");
    const gameRegistry = await GameRegistry.deploy();

    console.log("⏳ Waiting for deployment confirmation...");
    await gameRegistry.deployed();

    console.log("✅ GameRegistry deployed to:", gameRegistry.address);

    // Verify deployment
    console.log("🔍 Verifying deployment...");
    const code = await deployer.provider.getCode(gameRegistry.address);
    if (code === "0x") {
      console.error("❌ Contract deployment failed - no code at address");
      process.exit(1);
    }

    console.log("✅ Contract verification successful");

    // Log deployment information
    console.log("\n📊 Deployment Summary:");
    console.log("=========================");
    console.log("Contract: GameRegistry");
    console.log("Address:", gameRegistry.address);
    console.log("Network: Somnia Testnet");
    console.log("Deployer:", deployer.address);
    console.log("Gas Used:", (await gameRegistry.deployTransaction.wait()).gasUsed.toString());

    // Save deployment info
    const deploymentInfo = {
      contract: "GameRegistry",
      address: gameRegistry.address,
      network: "Somnia Testnet",
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      chainId: 50312,
      rpcUrl: "https://dream-rpc.somnia.network",
      explorerUrl: "https://somnia-devnet.socialscan.io"
    };

    // Write to deployment file
    const fs = require("fs");
    const deploymentPath = "./deployments/deployment.json";
    
    // Create deployments directory if it doesn't exist
    if (!fs.existsSync("./deployments")) {
      fs.mkdirSync("./deployments");
    }

    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentPath);

    // Instructions for next steps
    console.log("\n🎯 Next Steps:");
    console.log("===============");
    console.log("1. Update src/config/blockchain.js with the contract address:");
    console.log(`   CONTRACTS: { GAME_REGISTRY: '${gameRegistry.address}' }`);
    console.log("");
    console.log("2. View your contract on Somnia explorer:");
    console.log(`   https://somnia-devnet.socialscan.io/address/${gameRegistry.address}`);
    console.log("");
    console.log("3. Test the contract functions:");
    console.log("   - User registration");
    console.log("   - Friend requests");
    console.log("   - Points updates");
    console.log("   - Achievement unlocking");
    console.log("");
    console.log("4. Start the frontend application:");
    console.log("   npm run dev");

    console.log("\n🎉 Deployment completed successfully!");

  } catch (error) {
    console.error("❌ Deployment failed:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("- Check your private key in .env file");
    console.log("- Ensure you have enough STT tokens for gas");
    console.log("- Verify network connection to Somnia testnet");
    process.exit(1);
  }
}

// Handle errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unhandled error:", error);
    process.exit(1);
  }); 