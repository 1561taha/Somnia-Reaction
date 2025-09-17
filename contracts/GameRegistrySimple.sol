// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract GameRegistrySimple {
    struct User {
        string nickname;
        uint256 registrationTime;
        uint256 totalPoints;
        uint256 vsAiPoints;
        uint256 multiplayerPoints;
        uint256 puzzlePoints;
        uint256 gamesPlayed;
        uint256 gamesWon;
        bool isRegistered;
    }

    struct GameStats {
        uint256 gamesPlayed;
        uint256 gamesWon;
        uint256 chainReactions;
        uint256 eliminations;
        uint256 longestChain;
        uint256 perfectGames;
    }

    // State variables
    mapping(address => User) public users;
    mapping(address => bool) public userTier;
    address[] public allUsers;
    mapping(address => uint256) public userIndex;

    // Events
    event UserRegistered(address indexed user, string nickname);
    event PointsUpdated(address indexed user, uint256 totalPoints);
    event GameStatsUpdated(address indexed user);

    // Modifiers
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }

    // Register a new user
    function registerUser(string memory _nickname) external {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(bytes(_nickname).length > 0, "Nickname cannot be empty");
        require(bytes(_nickname).length <= 32, "Nickname too long");

        users[msg.sender] = User({
            nickname: _nickname,
            registrationTime: block.timestamp,
            totalPoints: 0,
            vsAiPoints: 0,
            multiplayerPoints: 0,
            puzzlePoints: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            isRegistered: true
        });

        allUsers.push(msg.sender);
        userIndex[msg.sender] = allUsers.length - 1;
        userTier[msg.sender] = 1;

        emit UserRegistered(msg.sender, _nickname);
    }

    // Update points (simplified)
    function updatePoints(uint256 _vsAiPoints, uint256 _multiplayerPoints, uint256 _puzzlePoints) external onlyRegistered {
        User storage user = users[msg.sender];
        user.vsAiPoints = _vsAiPoints;
        user.multiplayerPoints = _multiplayerPoints;
        user.puzzlePoints = _puzzlePoints;
        user.totalPoints = _vsAiPoints + _multiplayerPoints + _puzzlePoints;
        
        emit PointsUpdated(msg.sender, user.totalPoints);
    }

    // Update game stats using struct
    function updateGameStats(GameStats calldata stats) external onlyRegistered {
        User storage user = users[msg.sender];
        user.gamesPlayed = stats.gamesPlayed;
        user.gamesWon = stats.gamesWon;
        
        emit GameStatsUpdated(msg.sender);
    }

    // Get user data
    function getUser(address _user) external view returns (User memory) {
        return users[_user];
    }

    // Get user count
    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }

    // Get user by index
    function getUserByIndex(uint256 _index) external view returns (address, string memory, uint256) {
        require(_index < allUsers.length, "Index out of bounds");
        address userAddr = allUsers[_index];
        User memory user = users[userAddr];
        return (userAddr, user.nickname, user.totalPoints);
    }

    // Get top user
    function getTopUser() external view returns (address, string memory, uint256) {
        if (allUsers.length == 0) return (address(0), "", 0);

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
