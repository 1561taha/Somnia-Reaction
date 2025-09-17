# 🧪 Testing Guide - New Optimized Contract

## ✅ **Contract Successfully Deployed!**
**Address**: `0x9D46AC88c047F899c188eBdECdaF74C8C2564412`

## 🚀 **Quick Test in Remix:**

### **1. Test User Registration:**
```solidity
// Function: registerUser
// Parameter: "testuser"
// Expected: Transaction success, UserRegistered event
```

### **2. Test Points System:**
```solidity
// Function: updatePoints
// Parameters: 100, 50, 25
// Expected: Points updated, PointsUpdated event

// Function: addPoints  
// Parameters: 10, 5, 15
// Expected: Points added to existing values
```

### **3. Test Game Stats:**
```solidity
// Function: updateGameStats
// Parameters: 5, 3
// Expected: Basic stats updated

// Function: updateAdvancedStats
// Parameters: 2, 8, 5, 1
// Expected: Advanced stats updated
```

### **4. Test Achievements:**
```solidity
// Function: unlockAchievement
// Parameter: "FIRST_WIN"
// Expected: Achievement unlocked, AchievementUnlocked event
```

### **5. Test Leaderboard:**
```solidity
// Function: getUserCount
// Expected: Returns total number of users

// Function: getTopUser
// Expected: Returns top user's address, nickname, and points

// Function: getLeaderboardChunk
// Parameters: 0, 5
// Expected: Returns first 5 users with addresses, nicknames, points
```

## 🔧 **Integration Steps:**

### **Step 1: Update Frontend to Use Optimized Service**
```javascript
// In your components, import the optimized service:
import blockchainService from '../services/blockchainServiceOptimized.js';
```

### **Step 2: Update Function Calls**
The new service has simplified function names:

**Old → New:**
- `updateGameStatsDetailed()` → `updateGameStats()` + `updateAdvancedStats()`
- `getLeaderboardRaw()` → `getLeaderboardChunk()`
- `getUser()` → `getUserBasic()`, `getUserPoints()`, `getUserStats()`

### **Step 3: Test Integration**
1. **Registration**: Try registering a new user
2. **Points**: Test adding/updating points
3. **Stats**: Test game statistics updates
4. **Achievements**: Test unlocking achievements
5. **Leaderboard**: Test leaderboard display

## 📊 **Expected Results:**

### **Registration:**
- ✅ User registered successfully
- ✅ 10 points added automatically
- ✅ "REGISTRATION" achievement unlocked

### **Points System:**
- ✅ Points update correctly
- ✅ Points add to existing values
- ✅ Total points calculated automatically

### **Game Stats:**
- ✅ Basic stats (games played/won) update
- ✅ Advanced stats (chain reactions, eliminations) update
- ✅ All stats persist correctly

### **Leaderboard:**
- ✅ Shows all registered users
- ✅ Sorted by total points
- ✅ Current user highlighted
- ✅ Ranks displayed correctly

## 🐛 **Troubleshooting:**

### **If Registration Fails:**
- Check MetaMask connection
- Ensure sufficient gas
- Verify network (Somnia Testnet)

### **If Points Don't Update:**
- Check transaction receipt
- Verify function parameters
- Check for gas errors

### **If Leaderboard Empty:**
- Ensure users are registered
- Check `getUserCount()` returns > 0
- Verify `getLeaderboardChunk()` parameters

## 🎯 **Next Steps:**

1. **Test All Functions** in Remix first
2. **Update Frontend** to use optimized service
3. **Test Integration** with game logic
4. **Implement Chain Reaction Tracking**
5. **Add Advanced Point System**

## 📝 **Function Reference:**

| Function | Parameters | Description |
|----------|------------|-------------|
| `registerUser` | nickname | Register new user |
| `updatePoints` | vsAi, multiplayer, puzzle | Set points |
| `addPoints` | vsAi, multiplayer, puzzle | Add to existing points |
| `updateGameStats` | gamesPlayed, gamesWon | Update basic stats |
| `updateAdvancedStats` | chainReactions, eliminations, longestChain, perfectGames | Update advanced stats |
| `unlockAchievement` | name | Unlock achievement |
| `getUserCount` | - | Get total users |
| `getTopUser` | - | Get top user |
| `getLeaderboardChunk` | startIndex, count | Get leaderboard chunk |
| `getUserBasic` | address | Get basic user info |
| `getUserPoints` | address | Get user points |
| `getUserStats` | address | Get user stats |
| `getUserAchievements` | address | Get user achievements |

**The optimized contract is ready for testing!** 🎉

