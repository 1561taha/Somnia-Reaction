// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GameRegistryOptimized {
    // ============ STRUCTS ============
    
    struct UserBasic {
        string nickname;
        uint256 registrationTime;
        bool isRegistered;
    }
    
    struct UserPoints {
        uint256 totalPoints;
        uint256 vsAiPoints;
        uint256 multiplayerPoints;
        uint256 puzzlePoints;
    }
    
    struct UserStats {
        uint256 gamesPlayed;
        uint256 gamesWon;
        uint256 chainReactions;
        uint256 eliminations;
        uint256 longestChain;
        uint256 perfectGames;
    }
    
    struct Achievement {
        string name;
        string description;
        uint256 points;
        bool isUnlocked;
        uint256 unlockTime;
    }
    
    // ============ STATE VARIABLES ============
    
    mapping(address => UserBasic) public userBasic;
    mapping(address => UserPoints) public userPoints;
    mapping(address => UserStats) public userStats;
    mapping(address => Achievement[]) public userAchievements;
    mapping(address => uint256) public userTier;
    
    // Leaderboard tracking
    address[] public allUsers;
    mapping(address => uint256) public userIndex;
    
    // ============ EVENTS ============
    
    event UserRegistered(address indexed user, string nickname);
    event PointsUpdated(address indexed user, uint256 totalPoints);
    event StatsUpdated(address indexed user);
    event AchievementUnlocked(address indexed user, string achievement);
    event TierUpgraded(address indexed user, uint256 newTier);
    
    // ============ MODIFIERS ============
    
    modifier onlyRegistered() {
        require(userBasic[msg.sender].isRegistered, "User not registered");
        _;
    }
    
    // ============ USER REGISTRATION ============
    
    function registerUser(string memory _nickname) external {
        require(!userBasic[msg.sender].isRegistered, "User already registered");
        require(bytes(_nickname).length > 0 && bytes(_nickname).length <= 32, "Invalid nickname");
        
        userBasic[msg.sender] = UserBasic({
            nickname: _nickname,
            registrationTime: block.timestamp,
            isRegistered: true
        });
        
        userPoints[msg.sender] = UserPoints({
            totalPoints: 0,
            vsAiPoints: 0,
            multiplayerPoints: 0,
            puzzlePoints: 0
        });
        
        userStats[msg.sender] = UserStats({
            gamesPlayed: 0,
            gamesWon: 0,
            chainReactions: 0,
            eliminations: 0,
            longestChain: 0,
            perfectGames: 0
        });
        
        allUsers.push(msg.sender);
        userIndex[msg.sender] = allUsers.length - 1;
        userTier[msg.sender] = 1;
        
        emit UserRegistered(msg.sender, _nickname);
    }
    
    // ============ POINTS MANAGEMENT ============
    
    function updatePoints(uint256 _vsAi, uint256 _multiplayer, uint256 _puzzle) external onlyRegistered {
        UserPoints storage points = userPoints[msg.sender];
        points.vsAiPoints = _vsAi;
        points.multiplayerPoints = _multiplayer;
        points.puzzlePoints = _puzzle;
        points.totalPoints = _vsAi + _multiplayer + _puzzle;
        
        _updateTier(msg.sender, points.totalPoints);
        emit PointsUpdated(msg.sender, points.totalPoints);
    }
    
    function addPoints(uint256 _vsAi, uint256 _multiplayer, uint256 _puzzle) external onlyRegistered {
        UserPoints storage points = userPoints[msg.sender];
        points.vsAiPoints += _vsAi;
        points.multiplayerPoints += _multiplayer;
        points.puzzlePoints += _puzzle;
        points.totalPoints = points.vsAiPoints + points.multiplayerPoints + points.puzzlePoints;
        
        _updateTier(msg.sender, points.totalPoints);
        emit PointsUpdated(msg.sender, points.totalPoints);
    }
    
    // ============ STATS MANAGEMENT ============
    
    function updateGameStats(
        uint256 _gamesPlayed,
        uint256 _gamesWon
    ) external onlyRegistered {
        UserStats storage stats = userStats[msg.sender];
        stats.gamesPlayed = _gamesPlayed;
        stats.gamesWon = _gamesWon;
        emit StatsUpdated(msg.sender);
    }
    
    function updateAdvancedStats(
        uint256 _chainReactions,
        uint256 _eliminations,
        uint256 _longestChain,
        uint256 _perfectGames
    ) external onlyRegistered {
        UserStats storage stats = userStats[msg.sender];
        stats.chainReactions = _chainReactions;
        stats.eliminations = _eliminations;
        stats.longestChain = _longestChain;
        stats.perfectGames = _perfectGames;
        emit StatsUpdated(msg.sender);
    }
    
    // ============ ACHIEVEMENTS ============
    
    function unlockAchievement(string memory _name) external onlyRegistered {
        require(bytes(_name).length > 0, "Invalid achievement name");
        
        Achievement[] storage achievements = userAchievements[msg.sender];
        
        // Check if already unlocked
        for (uint256 i = 0; i < achievements.length; i++) {
            if (keccak256(bytes(achievements[i].name)) == keccak256(bytes(_name))) {
                return; // Already unlocked
            }
        }
        
        // Add new achievement
        achievements.push(Achievement({
            name: _name,
            description: _getAchievementDescription(_name),
            points: _getAchievementPoints(_name),
            isUnlocked: true,
            unlockTime: block.timestamp
        }));
        
        emit AchievementUnlocked(msg.sender, _name);
    }
    
    // ============ LEADERBOARD ============
    
    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }
    
    function getTopUser() external view returns (address, string memory, uint256) {
        if (allUsers.length == 0) return (address(0), "", 0);
        
        address topUser = allUsers[0];
        uint256 topPoints = userPoints[topUser].totalPoints;
        
        for (uint256 i = 1; i < allUsers.length; i++) {
            address currentUser = allUsers[i];
            uint256 currentPoints = userPoints[currentUser].totalPoints;
            if (currentPoints > topPoints) {
                topUser = currentUser;
                topPoints = currentPoints;
            }
        }
        
        return (topUser, userBasic[topUser].nickname, topPoints);
    }
    
    function getLeaderboardChunk(uint256 _startIndex, uint256 _count) external view returns (
        address[] memory users,
        string[] memory nicknames,
        uint256[] memory points
    ) {
        require(_startIndex < allUsers.length, "Start index out of bounds");
        require(_count > 0 && _count <= 20, "Invalid count");
        
        uint256 endIndex = _startIndex + _count;
        if (endIndex > allUsers.length) {
            endIndex = allUsers.length;
        }
        
        uint256 actualCount = endIndex - _startIndex;
        users = new address[](actualCount);
        nicknames = new string[](actualCount);
        points = new uint256[](actualCount);
        
        for (uint256 i = 0; i < actualCount; i++) {
            address userAddr = allUsers[_startIndex + i];
            users[i] = userAddr;
            nicknames[i] = userBasic[userAddr].nickname;
            points[i] = userPoints[userAddr].totalPoints;
        }
    }
    
    // ============ GETTERS ============
    
    function getUserBasic(address _user) external view returns (UserBasic memory) {
        return userBasic[_user];
    }
    
    function getUserPoints(address _user) external view returns (UserPoints memory) {
        return userPoints[_user];
    }
    
    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }
    
    function getUserAchievements(address _user) external view returns (Achievement[] memory) {
        return userAchievements[_user];
    }
    
    function isUserRegistered(address _user) external view returns (bool) {
        return userBasic[_user].isRegistered;
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _updateTier(address _user, uint256 _totalPoints) internal {
        uint256 newTier;
        
        if (_totalPoints >= 10000) newTier = 5;
        else if (_totalPoints >= 5000) newTier = 4;
        else if (_totalPoints >= 2000) newTier = 3;
        else if (_totalPoints >= 500) newTier = 2;
        else newTier = 1;
        
        if (newTier > userTier[_user]) {
            userTier[_user] = newTier;
            emit TierUpgraded(_user, newTier);
        }
    }
    
    function _getAchievementDescription(string memory _name) internal pure returns (string memory) {
        if (keccak256(bytes(_name)) == keccak256(bytes("REGISTRATION"))) {
            return "Welcome to the game!";
        } else if (keccak256(bytes(_name)) == keccak256(bytes("FIRST_WIN"))) {
            return "Win your first game";
        } else if (keccak256(bytes(_name)) == keccak256(bytes("CHAIN_MASTER"))) {
            return "Create a 5+ chain reaction";
        } else {
            return "Achievement unlocked!";
        }
    }
    
    function _getAchievementPoints(string memory _name) internal pure returns (uint256) {
        if (keccak256(bytes(_name)) == keccak256(bytes("REGISTRATION"))) {
            return 10;
        } else if (keccak256(bytes(_name)) == keccak256(bytes("FIRST_WIN"))) {
            return 50;
        } else if (keccak256(bytes(_name)) == keccak256(bytes("CHAIN_MASTER"))) {
            return 100;
        } else {
            return 25;
        }
    }
}
