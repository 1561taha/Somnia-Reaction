import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import blockchainService from '../../services/blockchainService.js';

const ProfileAndAchievements = () => {
  const [userData, setUserData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadData();
    
    // Refresh data when user returns to this tab (after playing games)
    const handleFocus = () => {
      loadData();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userDataResult, leaderboardResult] = await Promise.all([
        blockchainService.loadUserData(),
        loadLeaderboard(),
      ]);
      
      setUserData(userDataResult);
      setAchievements(userDataResult?.achievements || []);
      setLeaderboard(leaderboardResult);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      return await blockchainService.getLeaderboard();
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      return [];
    }
  };

  const handleRefresh = async () => {
    await loadData();
  };

  const getTierInfo = (points) => {
    if (points >= 10000) return { name: 'Grandmaster', color: 'purple', level: 5, nextPoints: null };
    if (points >= 5000) return { name: 'Master', color: 'blue', level: 4, nextPoints: 10000 };
    if (points >= 2000) return { name: 'Expert', color: 'green', level: 3, nextPoints: 5000 };
    if (points >= 500) return { name: 'Advanced', color: 'yellow', level: 2, nextPoints: 2000 };
    return { name: 'Beginner', color: 'gray', level: 1, nextPoints: 500 };
  };

  const getTierColor = (color) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[color] || colors.gray;
  };

  const getProgressPercentage = (current, next) => {
    if (!next) return 100;
    const previous = next === 10000 ? 5000 : next === 5000 ? 2000 : next === 2000 ? 500 : 0;
    return Math.min(100, ((current - previous) / (next - previous)) * 100);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getWinRate = () => {
    if (!userData || userData.gamesPlayed === 0) return 0;
    return ((userData.gamesWon / userData.gamesPlayed) * 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Please connect your wallet to view your profile</p>
      </div>
    );
  }

  const tierInfo = getTierInfo(userData.totalPoints);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{userData.nickname}</h2>
            <p className="text-sm text-gray-500">
              Member since {formatDate(userData.registrationTime)}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'profile'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'achievements'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Achievements ({achievements.filter(a => a.isUnlocked).length}/{achievements.length})
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'leaderboard'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Leaderboard
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Tier and Progress */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Current Tier</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(tierInfo.color)}`}>
                    {tierInfo.name}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">{userData.totalPoints.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Total Points</p>
                </div>
              </div>
              
              {tierInfo.nextPoints && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progress to next tier</span>
                    <span>{userData.totalPoints.toLocaleString()} / {tierInfo.nextPoints.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(userData.totalPoints, tierInfo.nextPoints)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">VS AI Points</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.vsAiPoints.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Multiplayer Points</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.multiplayerPoints.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Puzzle Points</p>
                    <p className="text-lg font-semibold text-gray-900">{userData.puzzlePoints.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Win Rate</p>
                    <p className="text-lg font-semibold text-gray-900">{getWinRate()}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Game Statistics */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Game Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{userData.gamesPlayed}</p>
                  <p className="text-sm text-gray-500">Games Played</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{userData.gamesWon}</p>
                  <p className="text-sm text-gray-500">Games Won</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{userData.gamesPlayed - userData.gamesWon}</p>
                  <p className="text-sm text-gray-500">Games Lost</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${
                    achievement.isUnlocked
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.isUnlocked
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {achievement.isUnlocked ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 className={`font-semibold ${
                          achievement.isUnlocked ? 'text-green-800' : 'text-gray-600'
                        }`}>
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-gray-500">{achievement.description}</p>
                        {achievement.isUnlocked && (
                          <p className="text-xs text-green-600">
                            Unlocked on {formatDate(achievement.unlockTime)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">+{achievement.points}</p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Global Leaderboard</h3>
              <div className="space-y-3">
                {leaderboard.length > 0 ? (
                  leaderboard.map((player, index) => (
                    <motion.div
                      key={player.nickname}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        index === 0 ? 'bg-yellow-100 border-2 border-yellow-300' : 
                        player.isCurrentUser ? 'bg-blue-100 border-2 border-blue-300' : 
                        'bg-white border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' : 
                          player.isCurrentUser ? 'bg-blue-400 text-blue-900' : 
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {player.rank}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-800">{player.nickname}</h4>
                            {player.isCurrentUser && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{player.tier}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800">{player.totalPoints}</div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No leaderboard data available yet.</p>
                    <p className="text-sm mt-2">Play games to see your ranking!</p>
                  </div>
                )}
              </div>
              
              {leaderboard.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 text-blue-800">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">
                      Note: Leaderboard shows current registered players. More players will appear as they join and play!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfileAndAchievements; 