// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title UniversalLeaderboard
 * @dev A universal leaderboard contract that tracks wins and losses for multiple games
 * @notice This contract can be used across multiple games on Somnia Network
 */
contract UniversalLeaderboard {
    
    // Struct to store player statistics
    struct PlayerStats {
        uint256 wins;
        uint256 losses;
        uint256 totalGames;
        uint256 lastUpdated;
        bool exists;
    }
    
    // Mapping from player address to their stats
    mapping(address => PlayerStats) public playerStats;
    
    // Array to track all players for leaderboard pagination
    address[] public players;
    
    // Mapping to check if address is already in players array
    mapping(address => bool) private playerExists;
    
    // Mapping of authorized game contracts
    mapping(address => bool) public authorizedGames;
    
    // Contract owner
    address public owner;
    
    // Events
    event WinRecorded(address indexed player, uint256 newWinCount, uint256 timestamp);
    event LossRecorded(address indexed player, uint256 newLossCount, uint256 timestamp);
    event GameAuthorized(address indexed gameContract);
    event GameDeauthorized(address indexed gameContract);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            authorizedGames[msg.sender] || msg.sender == owner,
            "Only authorized games or owner can call this function"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
        // Authorize the deployer by default
        authorizedGames[msg.sender] = true;
    }
    
    /**
     * @dev Record a win for a player
     * @param player The address of the player
     */
    function recordWin(address player) external onlyAuthorized {
        require(player != address(0), "Invalid player address");
        
        if (!playerStats[player].exists) {
            _addNewPlayer(player);
        }
        
        playerStats[player].wins += 1;
        playerStats[player].totalGames += 1;
        playerStats[player].lastUpdated = block.timestamp;
        
        emit WinRecorded(player, playerStats[player].wins, block.timestamp);
    }
    
    /**
     * @dev Record a loss for a player
     * @param player The address of the player
     */
    function recordLoss(address player) external onlyAuthorized {
        require(player != address(0), "Invalid player address");
        
        if (!playerStats[player].exists) {
            _addNewPlayer(player);
        }
        
        playerStats[player].losses += 1;
        playerStats[player].totalGames += 1;
        playerStats[player].lastUpdated = block.timestamp;
        
        emit LossRecorded(player, playerStats[player].losses, block.timestamp);
    }
    
    /**
     * @dev Record a game result (win or loss)
     * @param player The address of the player
     * @param won True if player won, false if lost
     */
    function recordGame(address player, bool won) external onlyAuthorized {
        require(player != address(0), "Invalid player address");
        
        if (!playerStats[player].exists) {
            _addNewPlayer(player);
        }
        
        if (won) {
            playerStats[player].wins += 1;
            emit WinRecorded(player, playerStats[player].wins, block.timestamp);
        } else {
            playerStats[player].losses += 1;
            emit LossRecorded(player, playerStats[player].losses, block.timestamp);
        }
        
        playerStats[player].totalGames += 1;
        playerStats[player].lastUpdated = block.timestamp;
    }
    
    /**
     * @dev Internal function to add a new player
     * @param player The address of the player
     */
    function _addNewPlayer(address player) internal {
        if (!playerExists[player]) {
            players.push(player);
            playerExists[player] = true;
        }
        playerStats[player].exists = true;
        playerStats[player].lastUpdated = block.timestamp;
    }
    
    /**
     * @dev Get stats for a specific player
     * @param player The address of the player
     * @return wins Number of wins
     * @return losses Number of losses
     * @return totalGames Total games played
     * @return lastUpdated Last update timestamp
     */
    function getPlayerStats(address player) 
        external 
        view 
        returns (
            uint256 wins,
            uint256 losses,
            uint256 totalGames,
            uint256 lastUpdated
        ) 
    {
        PlayerStats memory stats = playerStats[player];
        return (stats.wins, stats.losses, stats.totalGames, stats.lastUpdated);
    }
    
    /**
     * @dev Get win rate for a player (returns percentage * 100)
     * @param player The address of the player
     * @return winRate Win rate as percentage * 100 (e.g., 7500 = 75%)
     */
    function getWinRate(address player) external view returns (uint256 winRate) {
        PlayerStats memory stats = playerStats[player];
        if (stats.totalGames == 0) return 0;
        return (stats.wins * 10000) / stats.totalGames;
    }
    
    /**
     * @dev Get total number of players
     * @return Total number of players
     */
    function getTotalPlayers() external view returns (uint256) {
        return players.length;
    }
    
    /**
     * @dev Get leaderboard (top players by wins)
     * @param limit Maximum number of players to return
     * @param offset Starting index for pagination
     * @return topPlayers Array of player addresses sorted by wins
     * @return wins Array of win counts
     * @return losses Array of loss counts
     */
    function getLeaderboard(uint256 limit, uint256 offset) 
        external 
        view 
        returns (
            address[] memory topPlayers,
            uint256[] memory wins,
            uint256[] memory losses
        ) 
    {
        uint256 totalPlayers = players.length;
        require(offset < totalPlayers, "Offset exceeds total players");
        
        uint256 count = limit;
        if (offset + limit > totalPlayers) {
            count = totalPlayers - offset;
        }
        
        topPlayers = new address[](count);
        wins = new uint256[](count);
        losses = new uint256[](count);
        
        // Create a temporary array for sorting
        address[] memory sortedPlayers = new address[](totalPlayers);
        for (uint256 i = 0; i < totalPlayers; i++) {
            sortedPlayers[i] = players[i];
        }
        
        // Simple bubble sort by wins (descending)
        for (uint256 i = 0; i < totalPlayers; i++) {
            for (uint256 j = i + 1; j < totalPlayers; j++) {
                if (playerStats[sortedPlayers[i]].wins < playerStats[sortedPlayers[j]].wins) {
                    address temp = sortedPlayers[i];
                    sortedPlayers[i] = sortedPlayers[j];
                    sortedPlayers[j] = temp;
                }
            }
        }
        
        // Fill return arrays
        for (uint256 i = 0; i < count; i++) {
            address playerAddr = sortedPlayers[offset + i];
            topPlayers[i] = playerAddr;
            wins[i] = playerStats[playerAddr].wins;
            losses[i] = playerStats[playerAddr].losses;
        }
        
        return (topPlayers, wins, losses);
    }
    
    /**
     * @dev Authorize a game contract to update leaderboard
     * @param gameContract Address of the game contract
     */
    function authorizeGame(address gameContract) external onlyOwner {
        require(gameContract != address(0), "Invalid game contract address");
        authorizedGames[gameContract] = true;
        emit GameAuthorized(gameContract);
    }
    
    /**
     * @dev Deauthorize a game contract
     * @param gameContract Address of the game contract
     */
    function deauthorizeGame(address gameContract) external onlyOwner {
        authorizedGames[gameContract] = false;
        emit GameDeauthorized(gameContract);
    }
    
    /**
     * @dev Check if an address is an authorized game
     * @param gameContract Address to check
     * @return True if authorized
     */
    function isAuthorized(address gameContract) external view returns (bool) {
        return authorizedGames[gameContract];
    }
    
    /**
     * @dev Transfer ownership of the contract
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }
    
    /**
     * @dev Get player rank by address
     * @param player Address of the player
     * @return rank Player's rank (1-based, 0 if not found)
     */
    function getPlayerRank(address player) external view returns (uint256 rank) {
        uint256 playerWins = playerStats[player].wins;
        if (!playerStats[player].exists) return 0;
        
        rank = 1;
        for (uint256 i = 0; i < players.length; i++) {
            if (players[i] != player && playerStats[players[i]].wins > playerWins) {
                rank++;
            }
        }
        return rank;
    }
}

