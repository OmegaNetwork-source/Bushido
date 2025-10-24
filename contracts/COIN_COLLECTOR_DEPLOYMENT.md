# Coin Collector Leaderboard Deployment Guide

## Contract Overview
This smart contract tracks **cumulative coins** collected by players across all game sessions. Every time a player submits their score, it **adds** to their existing total.

## Features
- ✅ Cumulative coin tracking (adds to existing total)
- ✅ Leaderboard with pagination
- ✅ Top players query (sorted by coins)
- ✅ Individual player stats
- ✅ Event logging for transparency

## Deployment Steps

### 1. Copy the Contract
Copy the contents of `CoinCollectorLeaderboard.sol`

### 2. Open Remix IDE
Go to [https://remix.ethereum.org](https://remix.ethereum.org)

### 3. Create New File
- Click "Create New File"
- Name it: `CoinCollectorLeaderboard.sol`
- Paste the contract code

### 4. Compile
- Click "Solidity Compiler" (left sidebar)
- Select compiler version: `0.8.0` or higher
- Click "Compile CoinCollectorLeaderboard.sol"
- Should compile successfully ✅

### 5. Deploy to Somnia Mainnet

#### A. Configure MetaMask for Somnia
- Network Name: `Somnia Mainnet`
- RPC URL: `https://api.infra.mainnet.somnia.network/`
- Chain ID: `5063` (hex: `0x13A7`)
- Currency Symbol: `SOMI`
- Block Explorer: `https://explorer.somnia.network`

#### B. Deploy Contract
- Click "Deploy & Run Transactions" (left sidebar)
- Environment: Select "Injected Provider - MetaMask"
- Ensure you're connected to **Somnia Mainnet**
- Click "Deploy"
- Confirm transaction in MetaMask
- Wait for confirmation

### 6. Get Contract Address
After deployment, copy the contract address from the "Deployed Contracts" section in Remix.

### 7. Verify Contract (Optional)
- Go to [Somnia Explorer](https://explorer.somnia.network)
- Search for your contract address
- Click "Verify & Publish"
- Select Solidity version and paste contract code
- Submit for verification

## Contract Functions

### Player Functions
- **`addCoins(uint256 coins)`** - Add coins to your total (called by frontend)
- **`getPlayerCoins(address player)`** - Get total coins for a specific player

### Leaderboard Functions
- **`getLeaderboard(uint256 limit, uint256 offset)`** - Get paginated leaderboard
  - Returns arrays of addresses and their total coins
  - Example: `getLeaderboard(100, 0)` gets top 100 starting from position 0

- **`getTopPlayers(uint256 limit)`** - Get top players sorted by coins
  - Returns sorted arrays of addresses and coins
  - Example: `getTopPlayers(10)` gets top 10 players

- **`getPlayerCount()`** - Get total number of unique players

## Integration with Frontend

After deployment, update `BushidoPlatformer.jsx`:

```javascript
const COIN_CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
const COIN_CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256","name": "coins","type": "uint256"}],
    "name": "addCoins",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "limit","type": "uint256"},{"internalType": "uint256","name": "offset","type": "uint256"}],
    "name": "getTopPlayers",
    "outputs": [{"internalType": "address[]","name": "","type": "address[]"},{"internalType": "uint256[]","name": "","type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];
```

## How It Works

### Game Flow
1. Player plays Coin Collector game
2. Player collects 100 coins and dies
3. Player clicks "Submit Score to Blockchain"
4. Contract adds 100 to their existing total
5. Player plays again, collects 20 coins
6. Player submits again, contract adds 20 to their total
7. **Player's total is now 120 coins!** ✅

### Example
```
Game 1: 100 coins → Total: 100
Game 2: 20 coins  → Total: 120
Game 3: 50 coins  → Total: 170
Game 4: 5 coins   → Total: 175
```

## Gas Optimization Notes
- ✅ Only pays gas when submitting score
- ✅ Single transaction per submission
- ✅ No loops in `addCoins` function
- ⚠️ `getTopPlayers` is gas-intensive for large datasets (use `getLeaderboard` for better performance)

## Testing
After deployment, test with small amounts:
1. Call `addCoins(10)` - should add 10 coins
2. Call `getPlayerCoins(YOUR_ADDRESS)` - should return 10
3. Call `addCoins(15)` - should add 15 more
4. Call `getPlayerCoins(YOUR_ADDRESS)` - should return 25 ✅

## Support
If you encounter issues:
- Check MetaMask is on Somnia Mainnet
- Ensure you have SOMI for gas fees
- Verify contract compiled without errors
- Check block explorer for transaction status

