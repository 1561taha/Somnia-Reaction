import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import blockchainService from '../../services/blockchainService.js';

const SocialFeatures = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [friendsData, requestsData, userData] = await Promise.all([
        blockchainService.getFriends(),
        blockchainService.getFriendRequests(),
        blockchainService.loadUserData(),
      ]);
      
      setFriends(friendsData);
      setFriendRequests(requestsData);
      setUserData(userData);
    } catch (error) {
      console.error('Failed to load social data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const user = await blockchainService.getUserByNickname(searchQuery);
      if (user) {
        setSearchResults([user]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async (address) => {
    try {
      await blockchainService.sendFriendRequest(address);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const handleAcceptRequest = async (fromAddress) => {
    try {
      await blockchainService.acceptFriendRequest(fromAddress);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleRejectRequest = async (fromAddress) => {
    try {
      await blockchainService.rejectFriendRequest(fromAddress);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    }
  };

  const handleRemoveFriend = async (friendAddress) => {
    try {
      await blockchainService.removeFriend(friendAddress);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTierColor = (points) => {
    if (points >= 10000) return 'text-purple-600';
    if (points >= 5000) return 'text-blue-600';
    if (points >= 2000) return 'text-green-600';
    if (points >= 500) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getTierName = (points) => {
    if (points >= 10000) return 'Grandmaster';
    if (points >= 5000) return 'Master';
    if (points >= 2000) return 'Expert';
    if (points >= 500) return 'Advanced';
    return 'Beginner';
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Social Hub</h2>
        {userData && (
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <p className="text-sm text-gray-600">
                Welcome back, <span className="font-semibold">{userData.nickname}</span>
              </p>
              <p className="text-xs text-gray-500">
                Tier: <span className={getTierColor(userData.totalPoints)}>{getTierName(userData.totalPoints)}</span> • 
                Points: {userData.totalPoints.toLocaleString()}
              </p>
            </div>
            <button
              onClick={loadData}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'friends'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Friends ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'requests'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Requests ({friendRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'search'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Find Players
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800">Your Friends</h3>
              {friends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No friends yet. Search for players to add them!</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {friends.map((friend) => (
                    <div
                      key={friend.address}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {friend.nickname.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{friend.nickname}</p>
                          <p className="text-sm text-gray-500">
                            {formatAddress(friend.address)} • {friend.totalPoints.toLocaleString()} points
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleRemoveFriend(friend.address)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800">Friend Requests</h3>
              {friendRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No pending friend requests</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {friendRequests.map((request) => (
                    <div
                      key={request.from}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold">
                            {request.nickname.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{request.nickname}</p>
                          <p className="text-sm text-gray-500">
                            {formatAddress(request.from)} • {new Date(request.timestamp * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRequest(request.from)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.from)}
                          className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-gray-800">Find Players</h3>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter player nickname"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isLoading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid gap-4">
                  {searchResults.map((user) => (
                    <div
                      key={user.address}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {user.nickname.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.nickname}</p>
                          <p className="text-sm text-gray-500">
                            {formatAddress(user.address)} • {user.totalPoints.toLocaleString()} points
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendFriendRequest(user.address)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Add Friend
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && !isLoading && (
                <div className="text-center py-8 text-gray-500">
                  <p>No players found with that nickname</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SocialFeatures; 