// Integration Example for Bushido Duel Game
// This shows how to connect the UniversalLeaderboard contract to your game

import { ethers } from 'ethers';

// Deployed contract address on Somnia Mainnet
const LEADERBOARD_CONTRACT_ADDRESS = '0x8990bbf7ab7fe6bd146ddc066ca7c88773c1cc9b';

// ABI for the leaderboard contract
const LEADERBOARD_ABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "gameContract",
				"type": "address"
			}
		],
		"name": "authorizeGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "gameContract",
				"type": "address"
			}
		],
		"name": "deauthorizeGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "won",
				"type": "bool"
			}
		],
		"name": "recordGame",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "recordLoss",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "recordWin",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "authorizedGames",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "limit",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "offset",
				"type": "uint256"
			}
		],
		"name": "getLeaderboard",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "topPlayers",
				"type": "address[]"
			},
			{
				"internalType": "uint256[]",
				"name": "wins",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "losses",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "getPlayerRank",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "rank",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "getPlayerStats",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "wins",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "losses",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalGames",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastUpdated",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTotalPlayers",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "player",
				"type": "address"
			}
		],
		"name": "getWinRate",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "winRate",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "gameContract",
				"type": "address"
			}
		],
		"name": "isAuthorized",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "players",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "playerStats",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "wins",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "losses",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalGames",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "lastUpdated",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// =======================
// FRONTEND INTEGRATION
// =======================

// Initialize contract connection (Ethers v6)
export async function initLeaderboardContract() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const leaderboard = new ethers.Contract(
    LEADERBOARD_CONTRACT_ADDRESS,
    LEADERBOARD_ABI,
    signer
  );
  return leaderboard;
}

// Record a win (user pays gas)
export async function recordWinOnChain(playerAddress) {
  try {
    const leaderboard = await initLeaderboardContract();
    const tx = await leaderboard.recordWin(playerAddress);
    console.log('Recording win... Transaction hash:', tx.hash);
    await tx.wait();
    console.log('Win recorded successfully!');
    return true;
  } catch (error) {
    console.error('Error recording win:', error);
    return false;
  }
}

// Record a loss (user pays gas)
export async function recordLossOnChain(playerAddress) {
  try {
    const leaderboard = await initLeaderboardContract();
    const tx = await leaderboard.recordLoss(playerAddress);
    console.log('Recording loss... Transaction hash:', tx.hash);
    await tx.wait();
    console.log('Loss recorded successfully!');
    return true;
  } catch (error) {
    console.error('Error recording loss:', error);
    return false;
  }
}

// Get player stats (Ethers v6)
export async function getPlayerStats(playerAddress) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const leaderboard = new ethers.Contract(
      LEADERBOARD_CONTRACT_ADDRESS,
      LEADERBOARD_ABI,
      provider
    );
    
    const [wins, losses, totalGames, lastUpdated] = await leaderboard.getPlayerStats(playerAddress);
    
    return {
      wins: Number(wins),
      losses: Number(losses),
      totalGames: Number(totalGames),
      lastUpdated: Number(lastUpdated),
      winRate: Number(totalGames) > 0 
        ? ((Number(wins) / Number(totalGames)) * 100).toFixed(1)
        : 0
    };
  } catch (error) {
    console.error('Error getting player stats:', error);
    return { wins: 0, losses: 0, totalGames: 0, lastUpdated: 0, winRate: 0 };
  }
}

// Get leaderboard (top 10) (Ethers v6)
export async function getLeaderboard(limit = 10, offset = 0) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const leaderboard = new ethers.Contract(
      LEADERBOARD_CONTRACT_ADDRESS,
      LEADERBOARD_ABI,
      provider
    );
    
    const [addresses, wins, losses] = await leaderboard.getLeaderboard(limit, offset);
    
    return addresses.map((address, i) => ({
      rank: offset + i + 1,
      address: address,
      wins: Number(wins[i]),
      losses: Number(losses[i]),
      totalGames: Number(wins[i]) + Number(losses[i]),
      winRate: (Number(wins[i]) + Number(losses[i])) > 0
        ? ((Number(wins[i]) / (Number(wins[i]) + Number(losses[i]))) * 100).toFixed(1)
        : 0
    }));
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return [];
  }
}

// Get player rank (Ethers v6)
export async function getPlayerRank(playerAddress) {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const leaderboard = new ethers.Contract(
      LEADERBOARD_CONTRACT_ADDRESS,
      LEADERBOARD_ABI,
      provider
    );
    
    const rank = await leaderboard.getPlayerRank(playerAddress);
    return Number(rank);
  } catch (error) {
    console.error('Error getting player rank:', error);
    return 0;
  }
}

// =======================
// USAGE IN BUSHIDO DUEL GAME
// =======================

// Example: Update BushidoDuelGame.jsx

/*
import { recordWinOnChain, getPlayerStats, getLeaderboard } from './contracts/IntegrationExample';

// After player wins the game
const handleGameWin = async () => {
  const { account } = useMetaMask();
  
  // Record win on blockchain
  const success = await recordWinOnChain(account);
  
  if (success) {
    console.log('Victory recorded on blockchain!');
    // Update UI
    const stats = await getPlayerStats(account);
    console.log('Your stats:', stats);
  }
};

// Display leaderboard
const LeaderboardComponent = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  
  useEffect(() => {
    async function loadLeaderboard() {
      const data = await getLeaderboard(10, 0);
      setLeaderboardData(data);
    }
    loadLeaderboard();
  }, []);
  
  return (
    <div>
      <h2>🏆 Leaderboard</h2>
      {leaderboardData.map(player => (
        <div key={player.address}>
          #{player.rank} - {player.address.slice(0, 6)}...{player.address.slice(-4)} 
          - Wins: {player.wins} - Losses: {player.losses} - Win Rate: {player.winRate}%
        </div>
      ))}
    </div>
  );
};
*/

// =======================
// BACKEND RELAYER (OPTIONAL - Better UX)
// =======================

// If you want users to NOT pay gas for every game:
// 1. Deploy a backend server (Node.js/Express)
// 2. Use a relayer wallet to submit transactions
// 3. Users play games for free, relayer pays gas

/*
// relayer-server.js (Backend)
const express = require('express');
const { ethers } = require('ethers');
const app = express();

app.use(express.json());

const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY;
const provider = new ethers.providers.JsonRpcProvider('https://api.infra.mainnet.somnia.network/');
const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);

const leaderboard = new ethers.Contract(
  LEADERBOARD_CONTRACT_ADDRESS,
  LEADERBOARD_ABI,
  relayerWallet
);

// Record win via relayer
app.post('/api/leaderboard/record-win', async (req, res) => {
  try {
    const { playerAddress } = req.body;
    
    // Validate address
    if (!ethers.utils.isAddress(playerAddress)) {
      return res.status(400).json({ error: 'Invalid address' });
    }
    
    // Submit transaction
    const tx = await leaderboard.recordWin(playerAddress);
    await tx.wait();
    
    res.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error('Error recording win:', error);
    res.status(500).json({ error: error.message });
  }
});

// Record loss via relayer
app.post('/api/leaderboard/record-loss', async (req, res) => {
  try {
    const { playerAddress } = req.body;
    
    if (!ethers.utils.isAddress(playerAddress)) {
      return res.status(400).json({ error: 'Invalid address' });
    }
    
    const tx = await leaderboard.recordLoss(playerAddress);
    await tx.wait();
    
    res.json({ success: true, txHash: tx.hash });
  } catch (error) {
    console.error('Error recording loss:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Relayer server running on port 3001');
});
*/

// =======================
// NOTES
// =======================

/*
IMPORTANT STEPS AFTER DEPLOYMENT:

1. Deploy the contract via Remix
2. Copy the deployed contract address
3. Replace 'YOUR_CONTRACT_ADDRESS_HERE' in this file
4. In Remix, call authorizeGame(YOUR_WALLET_ADDRESS) to authorize yourself
   OR authorize your relayer wallet address if using a backend
5. Test by calling recordWin with your address
6. Integrate into your game components
7. (Optional) Set up a backend relayer for better UX

GAS COSTS ON SOMNIA:
- First win/loss record: ~80,000 gas
- Subsequent records: ~60,000 gas
- View functions (getPlayerStats, getLeaderboard): FREE

RECOMMENDED APPROACH:
- Use a backend relayer so users don't pay gas for every game
- Only the relayer (your backend) needs authorization
- Users just play games, relayer records results
- Much better user experience!
*/

export default {
  initLeaderboardContract,
  recordWinOnChain,
  recordLossOnChain,
  getPlayerStats,
  getLeaderboard,
  getPlayerRank
};

