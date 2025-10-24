# Universal Leaderboard Smart Contract - Deployment Guide

## 📋 Overview
This smart contract provides a universal leaderboard system that tracks wins and losses for multiple games on Somnia Network.

## ✨ Features
- ✅ Track wallet addresses, wins, and losses
- ✅ Universal design - works with multiple games
- ✅ Authorization system for game contracts
- ✅ Leaderboard with pagination
- ✅ Win rate calculation
- ✅ Player ranking system
- ✅ Gas-optimized

## 🚀 Deployment via Remix

### Step 1: Open Remix
1. Go to [https://remix.ethereum.org](https://remix.ethereum.org)
2. Create a new file called `UniversalLeaderboard.sol`
3. Copy and paste the contract code from `UniversalLeaderboard.sol`

### Step 2: Compile
1. Click on the "Solidity Compiler" tab (left sidebar)
2. Select compiler version `0.8.0` or higher
3. Click "Compile UniversalLeaderboard.sol"
4. Ensure there are no errors

### Step 3: Deploy to Somnia Network
1. Click on the "Deploy & Run Transactions" tab
2. In "Environment", select "Injected Provider - MetaMask"
3. Make sure MetaMask is connected to **Somnia Mainnet**:
   - Network Name: `Somnia Mainnet`
   - RPC URL: `https://api.infra.mainnet.somnia.network/`
   - Chain ID: `5071`
   - Currency Symbol: `SOMI`
   - Block Explorer: `https://explorer.somnia.network`
4. Select `UniversalLeaderboard` from the contract dropdown
5. Click "Deploy"
6. Confirm the transaction in MetaMask
7. **SAVE THE CONTRACT ADDRESS!** You'll need it to interact with the contract

## 📝 Contract Functions

### For Game Integration

#### `recordWin(address player)`
Records a win for the specified player address.
```solidity
recordWin(0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb)
```

#### `recordLoss(address player)`
Records a loss for the specified player address.
```solidity
recordLoss(0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb)
```

#### `recordGame(address player, bool won)`
Records a game result in one call.
```solidity
recordGame(0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb, true)  // Win
recordGame(0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb, false) // Loss
```

### For Leaderboard Display

#### `getPlayerStats(address player)`
Get stats for a specific player.
```solidity
getPlayerStats(0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb)
// Returns: (wins, losses, totalGames, lastUpdated)
```

#### `getLeaderboard(uint256 limit, uint256 offset)`
Get top players (paginated).
```solidity
getLeaderboard(10, 0)  // Get top 10 players
getLeaderboard(10, 10) // Get players 11-20
// Returns: (addresses[], wins[], losses[])
```

#### `getPlayerRank(address player)`
Get a player's rank.
```solidity
getPlayerRank(0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb)
// Returns: 1 (for 1st place), 2 (for 2nd), etc.
```

#### `getWinRate(address player)`
Get a player's win rate (percentage * 100).
```solidity
getWinRate(0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb)
// Returns: 7500 (means 75% win rate)
```

### For Contract Management

#### `authorizeGame(address gameContract)`
Authorize a game contract to update the leaderboard (owner only).
```solidity
authorizeGame(0xYourGameContractAddress)
```

#### `deauthorizeGame(address gameContract)`
Remove authorization from a game contract (owner only).
```solidity
deauthorizeGame(0xYourGameContractAddress)
```

#### `isAuthorized(address gameContract)`
Check if a contract is authorized.
```solidity
isAuthorized(0xYourGameContractAddress)
// Returns: true or false
```

## 🎮 Integrating with Your Game

### Option 1: Direct Contract Calls (Frontend)
Use ethers.js or web3.js to call the contract from your frontend:

```javascript
import { ethers } from 'ethers';

const LEADERBOARD_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS';
const LEADERBOARD_ABI = [/* ABI from compilation */];

// Connect to contract
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const leaderboard = new ethers.Contract(LEADERBOARD_ADDRESS, LEADERBOARD_ABI, signer);

// Record a win
async function recordWin(playerAddress) {
  const tx = await leaderboard.recordWin(playerAddress);
  await tx.wait();
  console.log('Win recorded!');
}

// Get leaderboard
async function getLeaderboard() {
  const [addresses, wins, losses] = await leaderboard.getLeaderboard(10, 0);
  return addresses.map((addr, i) => ({
    address: addr,
    wins: wins[i].toNumber(),
    losses: losses[i].toNumber()
  }));
}
```

### Option 2: Via Relayer (Recommended for Better UX)
Use a backend relayer to record wins/losses without requiring users to sign transactions:

```javascript
// Backend relayer
app.post('/api/record-win', async (req, res) => {
  const { playerAddress } = req.body;
  
  // Your relayer wallet
  const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
  const leaderboard = new ethers.Contract(LEADERBOARD_ADDRESS, LEADERBOARD_ABI, wallet);
  
  const tx = await leaderboard.recordWin(playerAddress);
  await tx.wait();
  
  res.json({ success: true });
});
```

## 🔐 Security Notes

1. **Authorization**: Only the contract owner and authorized game contracts can record wins/losses
2. **Owner Responsibilities**: The deployer is the initial owner. Use `authorizeGame()` to allow your game contracts to update stats
3. **Ownership Transfer**: Use `transferOwnership()` if you need to change the owner

## 📊 Gas Estimates

- Deploy Contract: ~2,500,000 gas
- Record Win/Loss: ~80,000 gas (first time), ~60,000 gas (subsequent)
- Get Player Stats: Free (view function)
- Get Leaderboard: Free (view function)

## 🛠️ Next Steps

1. Deploy the contract via Remix
2. Save the contract address
3. Authorize your game contract or relayer wallet using `authorizeGame()`
4. Update your frontend to interact with the contract
5. Test with a few transactions
6. Monitor on Somnia block explorer

## 💡 Tips

- For testing, you can call `recordWin()` and `recordLoss()` directly from Remix
- The owner is automatically authorized, so you can test immediately after deployment
- Use the block explorer to verify transactions: https://explorer.somnia.network
- Consider using a relayer for better UX (users don't need to sign every game result)

## 📞 Support

If you encounter any issues:
1. Check that MetaMask is connected to Somnia Mainnet
2. Ensure you have enough SOMI for gas fees
3. Verify the contract is deployed correctly on the block explorer
4. Check that your game contract is authorized using `isAuthorized()`

