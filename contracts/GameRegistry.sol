// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GameRegistry {
    struct User {
        string nickname;
        uint256 registrationTime;
        uint256 totalPoints;
        uint256 vsAiPoints;
        uint256 multiplayerPoints;
        uint256 puzzlePoints;
        uint256 gamesPlayed;
        uint256 gamesWon;
        uint256 chainReactions;
        uint256 eliminations;
        uint256 longestChain;
        uint256 perfectGames;
        bool isRegistered;
    }

    struct FriendRequest {
        address from;
        uint256 timestamp;
        bool isActive;
    }

    struct GameStats {
        uint256 gamesPlayed;
        uint256 gamesWon;
        uint256 chainReactions;
        uint256 eliminations;
        uint256 longestChain;
        uint256 perfectGames;
    }

    struct LeaderboardEntry {
        address user;
        uint256 points;
    }

    struct Achievement {
        string name;
        string description;
        uint256 points;
        bool isUnlocked;
        uint256 unlockTime;
    }

    // State variables
    mapping(address => User) public users;
    mapping(string => address) public nicknameToAddress;
    mapping(address => address[]) public friends;
    mapping(address => mapping(address => bool)) public isFriend;
    mapping(address => FriendRequest[]) public friendRequests;
    mapping(address => Achievement[]) public achievements;
    mapping(address => uint256) public userTier;
    
    // Leaderboard tracking
    address[] public allUsers;
    mapping(address => uint256) public userIndex;

    // Events
    event UserRegistered(address indexed user, string nickname);
    event FriendRequestSent(address indexed from, address indexed to);
    event FriendRequestAccepted(address indexed from, address indexed to);
    event FriendRequestRejected(address indexed from, address indexed to);
    event PointsUpdated(address indexed user, uint256 totalPoints, uint256 vsAiPoints, uint256 multiplayerPoints, uint256 puzzlePoints);
    event AchievementUnlocked(address indexed user, string achievementName);
    event TierUpgraded(address indexed user, uint256 newTier);

    // Modifiers
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }

    modifier nicknameAvailable(string memory _nickname) {
        require(nicknameToAddress[_nickname] == address(0), "Nickname already taken");
        _;
    }

    modifier validNickname(string memory _nickname) {
        require(bytes(_nickname).length >= 3 && bytes(_nickname).length <= 20, "Nickname must be 3-20 characters");
        require(isValidNickname(_nickname), "Nickname contains invalid characters");
        _;
    }

    // Core functions
    function registerUser(string memory _nickname) external validNickname(_nickname) nicknameAvailable(_nickname) {
        require(!users[msg.sender].isRegistered, "User already registered");
        
        users[msg.sender] = User({
            nickname: _nickname,
            registrationTime: block.timestamp,
            totalPoints: 0,
            vsAiPoints: 0,
            multiplayerPoints: 0,
            puzzlePoints: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            chainReactions: 0,
            eliminations: 0,
            longestChain: 0,
            perfectGames: 0,
            isRegistered: true
        });

        nicknameToAddress[_nickname] = msg.sender;
        
        // Add to leaderboard tracking
        allUsers.push(msg.sender);
        userIndex[msg.sender] = allUsers.length - 1;
        userTier[msg.sender] = 1;

        // Initialize default achievements
        initializeAchievements(msg.sender);

        emit UserRegistered(msg.sender, _nickname);
    }

    function sendFriendRequest(address _to) external onlyRegistered {
        require(_to != msg.sender, "Cannot send request to yourself");
        require(users[_to].isRegistered, "User not registered");
        require(!isFriend[msg.sender][_to], "Already friends");
        require(!hasActiveRequest(msg.sender, _to), "Request already sent");

        friendRequests[_to].push(FriendRequest({
            from: msg.sender,
            timestamp: block.timestamp,
            isActive: true
        }));

        emit FriendRequestSent(msg.sender, _to);
    }

    function acceptFriendRequest(address _from) external onlyRegistered {
        require(hasActiveRequest(_from, msg.sender), "No active request from this user");
        
        // Remove the request
        removeFriendRequest(_from, msg.sender);
        
        // Add to friends list
        friends[msg.sender].push(_from);
        friends[_from].push(msg.sender);
        isFriend[msg.sender][_from] = true;
        isFriend[_from][msg.sender] = true;

        emit FriendRequestAccepted(_from, msg.sender);
    }

    function rejectFriendRequest(address _from) external onlyRegistered {
        require(hasActiveRequest(_from, msg.sender), "No active request from this user");
        
        removeFriendRequest(_from, msg.sender);
        emit FriendRequestRejected(_from, msg.sender);
    }

    function removeFriend(address _friend) external onlyRegistered {
        require(isFriend[msg.sender][_friend], "Not friends");
        
        // Remove from both friends lists
        removeFromFriendsList(msg.sender, _friend);
        removeFromFriendsList(_friend, msg.sender);
        
        isFriend[msg.sender][_friend] = false;
        isFriend[_friend][msg.sender] = false;
    }

    function updatePoints(uint256 _vsAiPoints, uint256 _multiplayerPoints, uint256 _puzzlePoints) external onlyRegistered {
        User storage user = users[msg.sender]; // Cache storage variable
        user.vsAiPoints = _vsAiPoints;
        user.multiplayerPoints = _multiplayerPoints;
        user.puzzlePoints = _puzzlePoints;
        
        unchecked {
            user.totalPoints = _vsAiPoints + _multiplayerPoints + _puzzlePoints;
        }

        // Update tier based on total points
        updateTier(msg.sender, user.totalPoints);

        emit PointsUpdated(msg.sender, user.totalPoints, _vsAiPoints, _multiplayerPoints, _puzzlePoints);
    }

    function updateGameStats(uint256 _gamesPlayed, uint256 _gamesWon) external onlyRegistered {
        User storage user = users[msg.sender];
        user.gamesPlayed = _gamesPlayed;
        user.gamesWon = _gamesWon;
    }

    // Update detailed game statistics (using struct to reduce stack usage)
    function updateGameStats(GameStats calldata stats) external onlyRegistered {
        User storage user = users[msg.sender];
        user.gamesPlayed = stats.gamesPlayed;
        user.gamesWon = stats.gamesWon;
        user.chainReactions = stats.chainReactions;
        user.eliminations = stats.eliminations;
        user.longestChain = stats.longestChain;
        user.perfectGames = stats.perfectGames;
    }

    // Legacy function for backward compatibility
    function updateGameStatsDetailed(
        uint256 _gamesPlayed,
        uint256 _gamesWon,
        uint256 _chainReactions,
        uint256 _eliminations,
        uint256 _longestChain,
        uint256 _perfectGames
    ) external onlyRegistered {
        GameStats memory stats = GameStats({
            gamesPlayed: _gamesPlayed,
            gamesWon: _gamesWon,
            chainReactions: _chainReactions,
            eliminations: _eliminations,
            longestChain: _longestChain,
            perfectGames: _perfectGames
        });
        this.updateGameStats(stats);
    }

    // Internal helper functions to reduce stack usage
    function _updateGamesPlayed(User storage user, uint256 value) internal {
        user.gamesPlayed = value;
    }
    
    function _updateGamesWon(User storage user, uint256 value) internal {
        user.gamesWon = value;
    }
    
    function _updateChainReactions(User storage user, uint256 value) internal {
        user.chainReactions = value;
    }
    
    function _updateEliminations(User storage user, uint256 value) internal {
        user.eliminations = value;
    }
    
    function _updateLongestChain(User storage user, uint256 value) internal {
        user.longestChain = value;
    }
    
    function _updatePerfectGames(User storage user, uint256 value) internal {
        user.perfectGames = value;
    }

    function unlockAchievement(string memory _achievementName) external onlyRegistered {
        Achievement[] storage userAchievements = achievements[msg.sender];
        
        for (uint i = 0; i < userAchievements.length; i++) {
            if (keccak256(bytes(userAchievements[i].name)) == keccak256(bytes(_achievementName))) {
                if (!userAchievements[i].isUnlocked) {
                    userAchievements[i].isUnlocked = true;
                    userAchievements[i].unlockTime = block.timestamp;
                    
                    // Add achievement points to total
                    users[msg.sender].totalPoints += userAchievements[i].points;
                    
                    emit AchievementUnlocked(msg.sender, _achievementName);
                }
                break;
            }
        }
    }

    // View functions
    function getUser(address _user) external view returns (User memory) {
        return users[_user];
    }

    function getUserByNickname(string memory _nickname) external view returns (User memory) {
        address userAddress = nicknameToAddress[_nickname];
        require(userAddress != address(0), "User not found");
        return users[userAddress];
    }

    function getFriends(address _user) external view returns (address[] memory) {
        return friends[_user];
    }

    function getFriendRequests(address _user) external view returns (FriendRequest[] memory) {
        return friendRequests[_user];
    }

    function getAchievements(address _user) external view returns (Achievement[] memory) {
        return achievements[_user];
    }

    function searchUsersByNickname(string memory _partialNickname) external view returns (address[] memory) {
        // This is a simplified search - in production, you might want to use events or off-chain indexing
        address[] memory results = new address[](10); // Limit to 10 results
        uint256 resultCount = 0;
        
        // Note: This is not efficient for large datasets. In production, use events or off-chain indexing
        // This is just a placeholder implementation
        return results;
    }

    // Helper functions
    function hasActiveRequest(address _from, address _to) internal view returns (bool) {
        FriendRequest[] storage requests = friendRequests[_to];
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].from == _from && requests[i].isActive) {
                return true;
            }
        }
        return false;
    }

    function removeFriendRequest(address _from, address _to) internal {
        FriendRequest[] storage requests = friendRequests[_to];
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i].from == _from && requests[i].isActive) {
                requests[i].isActive = false;
                break;
            }
        }
    }

    function removeFromFriendsList(address _user, address _friend) internal {
        address[] storage userFriends = friends[_user];
        for (uint i = 0; i < userFriends.length; i++) {
            if (userFriends[i] == _friend) {
                userFriends[i] = userFriends[userFriends.length - 1];
                userFriends.pop();
                break;
            }
        }
    }

    function updateTier(address _user, uint256 _totalPoints) internal {
        uint256 newTier = 1;
        unchecked { // Safe because _totalPoints is bounded by uint256
            if (_totalPoints >= 10000) newTier = 5;
            else if (_totalPoints >= 5000) newTier = 4;
            else if (_totalPoints >= 2000) newTier = 3;
            else if (_totalPoints >= 500) newTier = 2;
        }

        if (newTier > userTier[_user]) {
            userTier[_user] = newTier;
            emit TierUpgraded(_user, newTier);
        }
    }

    function initializeAchievements(address _user) internal {
        Achievement[] storage userAchievements = achievements[_user];
        
        userAchievements.push(Achievement({
            name: "First Steps",
            description: "Register your account",
            points: 10,
            isUnlocked: true,
            unlockTime: block.timestamp
        }));

        userAchievements.push(Achievement({
            name: "Social Butterfly",
            description: "Add your first friend",
            points: 50,
            isUnlocked: false,
            unlockTime: 0
        }));

        userAchievements.push(Achievement({
            name: "Puzzle Master",
            description: "Complete 10 puzzles",
            points: 100,
            isUnlocked: false,
            unlockTime: 0
        }));

        userAchievements.push(Achievement({
            name: "Multiplayer Champion",
            description: "Win 10 multiplayer games",
            points: 200,
            isUnlocked: false,
            unlockTime: 0
        }));

        userAchievements.push(Achievement({
            name: "AI Destroyer",
            description: "Win 50 games against AI",
            points: 150,
            isUnlocked: false,
            unlockTime: 0
        }));
    }

    function isValidNickname(string memory _nickname) internal pure returns (bool) {
        bytes memory nicknameBytes = bytes(_nickname);
        for (uint i = 0; i < nicknameBytes.length; i++) {
            bytes1 char = nicknameBytes[i];
            if (!((char >= 0x30 && char <= 0x39) || // 0-9
                  (char >= 0x41 && char <= 0x5A) || // A-Z
                  (char >= 0x61 && char <= 0x7A) || // a-z
                  char == 0x5F)) { // underscore
                return false;
            }
        }
        return true;
    }

    // Simple leaderboard functions to avoid stack too deep
    function getLeaderboardCount() external view returns (uint256) {
        return allUsers.length;
    }
    
    // Get a single user by index (for frontend to build leaderboard)
    function getUserByIndex(uint256 _index) external view returns (address, string memory, uint256) {
        require(_index < allUsers.length, "Index out of bounds");
        address userAddr = allUsers[_index];
        User memory user = users[userAddr];
        return (userAddr, user.nickname, user.totalPoints);
    }

    // Get leaderboard data in chunks (optimized for pagination)
    function getLeaderboardChunk(uint256 _startIndex, uint256 _chunkSize) external view returns (LeaderboardEntry[] memory) {
        require(_startIndex + _chunkSize <= allUsers.length, "Index out of bounds");
        require(_chunkSize > 0 && _chunkSize <= 20, "Invalid chunk size"); // Limit to 20 users per call
        
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](_chunkSize);

        for (uint256 i = 0; i < _chunkSize; i++) {
            address userAddr = allUsers[_startIndex + i];
            entries[i] = LeaderboardEntry(userAddr, users[userAddr].totalPoints);
        }
        
        return entries;
    }

    // Get all registered users
    function getAllUsers() external view returns (address[] memory) {
        return allUsers;
    }

    // Get user count
    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }

    // Get top user (optimized to avoid stack issues)
    function getTopUser() external view returns (address, string memory, uint256) {
        if (allUsers.length == 0) {
            return (address(0), "", 0);
        }
        
        address topUser = allUsers[0];
        uint256 topPoints = users[topUser].totalPoints;
        
        for (uint256 i = 1; i < allUsers.length; i++) {
            address currentUser = allUsers[i];
            uint256 currentPoints = users[currentUser].totalPoints;
            if (currentPoints > topPoints) {
                topUser = currentUser;
                topPoints = currentPoints;
            }
        }
        
        return (topUser, users[topUser].nickname, topPoints);
    }
} 