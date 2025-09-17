import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Import the optimized configuration
import { BLOCKCHAIN_CONFIG, CONTRACTS, GAS_SETTINGS, GAME_REGISTRY_ABI } from '../config/blockchainOptimized.js';

class BlockchainServiceOptimized {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.gameRegistry = null;
    this.userData = null;
  }

  async initialize() {
    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed');
      }

      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      
      // Check if we're on the correct network
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== BLOCKCHAIN_CONFIG.chainId) {
        await this.switchToSomniaNetwork();
      }

      // Initialize contract
      this.gameRegistry = new ethers.Contract(
        CONTRACTS.GAME_REGISTRY,
        GAME_REGISTRY_ABI,
        this.signer
      );

      console.log('Blockchain service initialized with optimized contract');
      return true;
    } catch (error) {
      console.error('Failed to initialize blockchain service:', error);
      this.handleError(error);
      return false;
    }
  }

  async switchToSomniaNetwork() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BLOCKCHAIN_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        // Network doesn't exist, add it
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [BLOCKCHAIN_CONFIG],
        });
      } else {
        throw switchError;
      }
    }
  }

  async registerUser(nickname) {
    try {
      if (!nickname || nickname.trim().length === 0) {
        throw new Error('Nickname cannot be empty');
      }

      let tx;
      try {
        tx = await this.gameRegistry.registerUser(nickname);
        console.log('Registration sent with auto gas:', tx.hash);
      } catch (gasError) {
        console.log('Auto gas failed, trying with low gas:', gasError);
        tx = await this.gameRegistry.registerUser(nickname, {
          gasLimit: 300000,
        });
        console.log('Registration sent with low gas:', tx.hash);
      }

      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        toast.success('Registration successful!');
        
        // Add registration points and unlock achievement
        await this.addPoints(0, 0, 10);
        await this.unlockAchievement('REGISTRATION');
        
        // Load user data
        await this.loadUserData();
        return receipt;
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      this.handleError(error);
      throw error;
    }
  }

  async loadUserData() {
    try {
      if (!this.signer) return null;
      
      const address = await this.signer.getAddress();
      
      // Check if user is registered
      const isRegistered = await this.gameRegistry.isUserRegistered(address);
      if (!isRegistered) {
        this.userData = null;
        return null;
      }

      // Get user data using optimized getters
      const [basic, points, stats, achievements] = await Promise.all([
        this.gameRegistry.getUserBasic(address),
        this.gameRegistry.getUserPoints(address),
        this.gameRegistry.getUserStats(address),
        this.gameRegistry.getUserAchievements(address)
      ]);

      this.userData = {
        address,
        nickname: basic.nickname,
        registrationTime: Number(basic.registrationTime),
        totalPoints: Number(points.totalPoints),
        vsAiPoints: Number(points.vsAiPoints),
        multiplayerPoints: Number(points.multiplayerPoints),
        puzzlePoints: Number(points.puzzlePoints),
        gamesPlayed: Number(stats.gamesPlayed),
        gamesWon: Number(stats.gamesWon),
        chainReactions: Number(stats.chainReactions),
        eliminations: Number(stats.eliminations),
        longestChain: Number(stats.longestChain),
        perfectGames: Number(stats.perfectGames),
        achievements: achievements.map(achievement => ({
          name: achievement.name,
          description: achievement.description,
          points: Number(achievement.points),
          isUnlocked: achievement.isUnlocked,
          unlockTime: Number(achievement.unlockTime)
        })),
        tier: this.getTierFromPoints(Number(points.totalPoints)),
        isRegistered: true
      };

      return this.userData;
    } catch (error) {
      console.error('Failed to load user data:', error);
      return null;
    }
  }

  async isUserRegistered() {
    try {
      if (!this.signer) return false;
      const address = await this.signer.getAddress();
      return await this.gameRegistry.isUserRegistered(address);
    } catch (error) {
      console.error('Failed to check registration:', error);
      return false;
    }
  }

  async updatePoints(vsAiPoints, multiplayerPoints, puzzlePoints) {
    try {
      let tx;
      try {
        tx = await this.gameRegistry.updatePoints(vsAiPoints, multiplayerPoints, puzzlePoints);
        console.log('Points update sent with auto gas:', tx.hash);
      } catch (gasError) {
        console.log('Auto gas failed for points update, trying with low gas:', gasError);
        tx = await this.gameRegistry.updatePoints(vsAiPoints, multiplayerPoints, puzzlePoints, {
          gasLimit: 200000,
        });
        console.log('Points update sent with low gas:', tx.hash);
      }

      await tx.wait();
      await this.loadUserData(); // Refresh user data
      return tx;
    } catch (error) {
      console.error('Failed to update points:', error);
      this.handleError(error);
      throw error;
    }
  }

  async addPoints(vsAiPoints, multiplayerPoints, puzzlePoints) {
    try {
      let tx;
      try {
        tx = await this.gameRegistry.addPoints(vsAiPoints, multiplayerPoints, puzzlePoints);
        console.log('Points add sent with auto gas:', tx.hash);
      } catch (gasError) {
        console.log('Auto gas failed for points add, trying with low gas:', gasError);
        tx = await this.gameRegistry.addPoints(vsAiPoints, multiplayerPoints, puzzlePoints, {
          gasLimit: 200000,
        });
        console.log('Points add sent with low gas:', tx.hash);
      }

      await tx.wait();
      await this.loadUserData(); // Refresh user data
      return tx;
    } catch (error) {
      console.error('Failed to add points:', error);
      this.handleError(error);
      throw error;
    }
  }

  async updateGameStats(gamesPlayed, gamesWon) {
    try {
      let tx;
      try {
        tx = await this.gameRegistry.updateGameStats(gamesPlayed, gamesWon);
        console.log('Game stats update sent with auto gas:', tx.hash);
      } catch (gasError) {
        console.log('Auto gas failed for game stats update, trying with low gas:', gasError);
        tx = await this.gameRegistry.updateGameStats(gamesPlayed, gamesWon, {
          gasLimit: 150000,
        });
        console.log('Game stats update sent with low gas:', tx.hash);
      }

      await tx.wait();
      await this.loadUserData(); // Refresh user data
      return tx;
    } catch (error) {
      console.error('Failed to update game stats:', error);
      this.handleError(error);
      throw error;
    }
  }

  async updateAdvancedStats(chainReactions, eliminations, longestChain, perfectGames) {
    try {
      let tx;
      try {
        tx = await this.gameRegistry.updateAdvancedStats(chainReactions, eliminations, longestChain, perfectGames);
        console.log('Advanced stats update sent with auto gas:', tx.hash);
      } catch (gasError) {
        console.log('Auto gas failed for advanced stats update, trying with low gas:', gasError);
        tx = await this.gameRegistry.updateAdvancedStats(chainReactions, eliminations, longestChain, perfectGames, {
          gasLimit: 200000,
        });
        console.log('Advanced stats update sent with low gas:', tx.hash);
      }

      await tx.wait();
      await this.loadUserData(); // Refresh user data
      return tx;
    } catch (error) {
      console.error('Failed to update advanced stats:', error);
      this.handleError(error);
      throw error;
    }
  }

  async unlockAchievement(achievementName) {
    try {
      let tx;
      try {
        tx = await this.gameRegistry.unlockAchievement(achievementName);
        console.log('Achievement unlock sent with auto gas:', tx.hash);
      } catch (gasError) {
        console.log('Auto gas failed for achievement unlock, trying with low gas:', gasError);
        tx = await this.gameRegistry.unlockAchievement(achievementName, {
          gasLimit: 150000,
        });
        console.log('Achievement unlock sent with low gas:', tx.hash);
      }

      await tx.wait();
      await this.loadUserData(); // Refresh user data
      return tx;
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      this.handleError(error);
      throw error;
    }
  }

  async getLeaderboard() {
    try {
      const userCount = await this.gameRegistry.getUserCount();
      
      if (userCount === 0) {
        return [];
      }

      // Get current user for highlighting
      const currentUser = await this.loadUserData();
      
      // Use chunked approach for better performance
      const maxUsers = Math.min(Number(userCount), 10);
      const [users, nicknames, points] = await this.gameRegistry.getLeaderboardChunk(0, maxUsers);
      
      // Create leaderboard data
      const leaderboard = [];
      for (let i = 0; i < users.length; i++) {
        if (users[i] !== '0x0000000000000000000000000000000000000000') {
          leaderboard.push({
            rank: i + 1,
            nickname: nicknames[i],
            totalPoints: Number(points[i]),
            tier: this.getTierFromPoints(Number(points[i])),
            isCurrentUser: currentUser && nicknames[i] === currentUser.nickname,
            address: users[i]
          });
        }
      }

      // Sort by points (descending) on the frontend
      leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
      
      // Update ranks after sorting
      leaderboard.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      return leaderboard;
    } catch (error) {
      console.error('Failed to get leaderboard:', error);
      this.handleError(error);
      return [];
    }
  }

  getTierFromPoints(totalPoints) {
    if (totalPoints >= 10000) return 5;
    if (totalPoints >= 5000) return 4;
    if (totalPoints >= 2000) return 3;
    if (totalPoints >= 500) return 2;
    return 1;
  }

  handleError(error) {
    console.error('Blockchain error:', error);
    
    if (error.code === 4001) {
      toast.error('Transaction rejected by user');
    } else if (error.code === -32603) {
      toast.error('Internal JSON-RPC error');
    } else if (error.message.includes('insufficient funds')) {
      toast.error('Insufficient funds for gas');
    } else if (error.message.includes('nonce')) {
      toast.error('Transaction nonce error - please try again');
    } else {
      toast.error(`Blockchain error: ${error.message}`);
    }
  }

  async disconnect() {
    this.provider = null;
    this.signer = null;
    this.gameRegistry = null;
    this.userData = null;
  }

  getConnectionStatus() {
    return {
      isConnected: !!this.provider,
      isRegistered: !!this.userData?.isRegistered,
      userData: this.userData
    };
  }
}

export default new BlockchainServiceOptimized();

