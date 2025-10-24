// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CoinCollectorLeaderboard {
    // Mapping to track total coins collected by each player
    mapping(address => uint256) public totalCoins;
    
    // Array to track all players who have played
    address[] public players;
    
    // Mapping to check if a player has already been added to the players array
    mapping(address => bool) public hasPlayed;
    
    // Event emitted when coins are added
    event CoinsAdded(address indexed player, uint256 coinsAdded, uint256 newTotal);
    
    /**
     * @dev Add coins to a player's total
     * @param coins Number of coins to add to the player's total
     */
    function addCoins(uint256 coins) external {
        require(coins > 0, "Must add at least 1 coin");
        
        // If this is the player's first time, add them to the players array
        if (!hasPlayed[msg.sender]) {
            players.push(msg.sender);
            hasPlayed[msg.sender] = true;
        }
        
        // Add coins to player's total
        totalCoins[msg.sender] += coins;
        
        emit CoinsAdded(msg.sender, coins, totalCoins[msg.sender]);
    }
    
    /**
     * @dev Get a player's total coins
     * @param player Address of the player
     * @return Total coins collected by the player
     */
    function getPlayerCoins(address player) external view returns (uint256) {
        return totalCoins[player];
    }
    
    /**
     * @dev Get the total number of players
     * @return Number of unique players
     */
    function getPlayerCount() external view returns (uint256) {
        return players.length;
    }
    
    /**
     * @dev Get leaderboard data with pagination
     * @param limit Maximum number of results to return
     * @param offset Starting position in the players array
     * @return addresses Array of player addresses
     * @return coins Array of total coins for each player
     */
    function getLeaderboard(uint256 limit, uint256 offset) 
        external 
        view 
        returns (address[] memory addresses, uint256[] memory coins) 
    {
        uint256 playerCount = players.length;
        
        // Handle offset beyond array length
        if (offset >= playerCount) {
            return (new address[](0), new uint256[](0));
        }
        
        // Calculate actual size of arrays to return
        uint256 remaining = playerCount - offset;
        uint256 size = remaining < limit ? remaining : limit;
        
        addresses = new address[](size);
        coins = new uint256[](size);
        
        for (uint256 i = 0; i < size; i++) {
            address player = players[offset + i];
            addresses[i] = player;
            coins[i] = totalCoins[player];
        }
        
        return (addresses, coins);
    }
    
    /**
     * @dev Get top players sorted by coins (note: this is gas-intensive for large datasets)
     * @param limit Maximum number of top players to return
     * @return topAddresses Array of top player addresses
     * @return topCoins Array of coins for each top player
     */
    function getTopPlayers(uint256 limit) 
        external 
        view 
        returns (address[] memory topAddresses, uint256[] memory topCoins) 
    {
        uint256 playerCount = players.length;
        uint256 size = playerCount < limit ? playerCount : limit;
        
        topAddresses = new address[](size);
        topCoins = new uint256[](size);
        
        // Create temporary arrays with all player data
        address[] memory allAddresses = new address[](playerCount);
        uint256[] memory allCoins = new uint256[](playerCount);
        
        for (uint256 i = 0; i < playerCount; i++) {
            allAddresses[i] = players[i];
            allCoins[i] = totalCoins[players[i]];
        }
        
        // Simple selection sort to get top players
        for (uint256 i = 0; i < size; i++) {
            uint256 maxIndex = i;
            
            for (uint256 j = i + 1; j < playerCount; j++) {
                if (allCoins[j] > allCoins[maxIndex]) {
                    maxIndex = j;
                }
            }
            
            // Swap
            if (maxIndex != i) {
                (allAddresses[i], allAddresses[maxIndex]) = (allAddresses[maxIndex], allAddresses[i]);
                (allCoins[i], allCoins[maxIndex]) = (allCoins[maxIndex], allCoins[i]);
            }
            
            topAddresses[i] = allAddresses[i];
            topCoins[i] = allCoins[i];
        }
        
        return (topAddresses, topCoins);
    }
}

