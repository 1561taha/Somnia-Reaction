import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import blockchainService from '../../services/blockchainService.js';
import { ERROR_MESSAGES } from '../../config/blockchain.js';

const UserRegistration = ({ onRegistrationComplete }) => {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  // Function to handle navigation back to homepage
  const handleBackToHomepage = () => {
    if (onRegistrationComplete) {
      onRegistrationComplete();
    } else {
      navigate('/');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    const status = blockchainService.getConnectionStatus();
    setIsConnected(status.isConnected);
    
    // If connected, check if user is already registered
    if (status.isConnected) {
      try {
        const isRegistered = await blockchainService.isUserRegistered();
        if (isRegistered) {
          // User is already registered, redirect back to main menu
          handleBackToHomepage();
        }
      } catch (error) {
        console.error('Failed to check registration status:', error);
      }
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const success = await blockchainService.initialize();
      if (success) {
        setIsConnected(true);
        blockchainService.setupEventListeners();
        
        // Check if user is already registered
        const isRegistered = await blockchainService.isUserRegistered();
        if (isRegistered) {
          // User is already registered, redirect back to main menu
          handleBackToHomepage();
        }
      } else {
        setError('Failed to connect to wallet');
      }
    } catch (error) {
      setError('Please install MetaMask and connect to Somnia Testnet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    if (nickname.length < 3 || nickname.length > 20) {
      setError('Nickname must be between 3 and 20 characters');
      return;
    }

    // Validate nickname format (letters, numbers, underscores only)
    const nicknameRegex = /^[a-zA-Z0-9_]+$/;
    if (!nicknameRegex.test(nickname)) {
      setError('Nickname can only contain letters, numbers, and underscores');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await blockchainService.registerUser(nickname);
      console.log('Registration result:', result);
      
      // Check if registration was successful
      if (result && result.status === 1) {
        console.log('Registration successful');
        setIsRegistrationComplete(true);
        setIsLoading(false);
        
        // Add a small delay to allow blockchain state to settle
        setTimeout(() => {
          handleBackToHomepage();
        }, 3000); // Increased delay to show completion state
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Check if it's a user rejection (don't show error for that)
      if (error.code === 'ACTION_REJECTED') {
        // User rejected the transaction, don't show error
        return;
      }
      
      if (error.message.includes('Nickname already taken')) {
        setError(ERROR_MESSAGES.NICKNAME_TAKEN);
      } else if (error.message.includes('User already registered')) {
        setError('You are already registered');
      } else if (error.message.includes('Transaction was rejected by user')) {
        // Don't show error for user rejection
        return;
      } else {
        setError(ERROR_MESSAGES.TRANSACTION_FAILED);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show completion state
  if (isRegistrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-lg shadow-xl p-8"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Registration Complete! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Welcome to Somnia Reaction, <span className="font-semibold text-blue-600">{nickname}</span>!
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleBackToHomepage}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Back to Homepage
              </button>
              
              <p className="text-xs text-gray-500">
                You'll be automatically redirected in a few seconds...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-lg shadow-xl p-8"
        >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 mb-6">
            Connect your MetaMask wallet to Somnia Testnet to start playing
          </p>
          
          <button
            onClick={handleConnect}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          
          {error && (
            <p className="text-red-500 text-sm mt-4">{error}</p>
          )}
        </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-lg shadow-xl p-8"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Create Your Profile
          </h2>
          <p className="text-gray-600 mb-6">
            Choose a unique nickname to start your Somnia Reaction journey
          </p>

        <form onSubmit={handleRegistration} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
              Nickname
            </label>
            <input
              type="text"
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Enter your nickname (3-20 characters)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              maxLength={20}
              disabled={isLoading || isRegistrationComplete}
            />
            <p className="text-xs text-gray-500 mt-1">
              Only letters, numbers, and underscores allowed
            </p>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading || !nickname.trim() || isRegistrationComplete}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {isLoading ? 'Registering...' : isRegistrationComplete ? 'Registration Complete' : 'Register'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">What happens next?</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Your nickname will be stored on the blockchain</li>
            <li>• You'll receive initial achievements</li>
            <li>• Start earning points in different game modes</li>
            <li>• Connect with friends and compete on leaderboards</li>
          </ul>
        </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserRegistration; 