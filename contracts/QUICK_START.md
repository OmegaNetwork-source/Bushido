# 🚀 Quick Start Guide - Universal Leaderboard

## Step-by-Step Deployment & Integration

### 1️⃣ Deploy via Remix (5 minutes)

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create new file: `UniversalLeaderboard.sol`
3. Copy code from `contracts/UniversalLeaderboard.sol`
4. Compile with Solidity 0.8.0+
5. Deploy to **Somnia Mainnet** via MetaMask
6. **COPY THE CONTRACT ADDRESS** 📋

### 2️⃣ Configure Contract (2 minutes)

After deployment, in Remix:

```solidity
// Option A: Authorize your wallet (for direct calls)
authorizeGame("YOUR_WALLET_ADDRESS")

// Option B: Authorize a relayer wallet (recommended)
authorizeGame("YOUR_RELAYER_WALLET_ADDRESS")
```

### 3️⃣ Test It Works (1 minute)

In Remix, test the contract:

```solidity
// Record a test win
recordWin("YOUR_WALLET_ADDRESS")

// Check stats
getPlayerStats("YOUR_WALLET_ADDRESS")
// Should return: (1, 0, 1, timestamp)

// Check leaderboard
getLeaderboard(10, 0)
// Should show your address with 1 win
```

### 4️⃣ Integrate with Your Game

#### Update `IntegrationExample.js`:
```javascript
const LEADERBOARD_CONTRACT_ADDRESS = '0xYOUR_DEPLOYED_ADDRESS';
```

#### Update `BushidoDuelGame.jsx`:

Add imports at top:
```javascript
import { recordWinOnChain, getPlayerStats } from '../contracts/IntegrationExample';
```

Replace the localStorage-based submit score button with blockchain:
```javascript
// Find the SubmitScoreButton component
// Replace with:
const SubmitScoreButton = ({ player, account }) => {
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    if (!account || player.hp <= 0) return;
    
    setSubmitting(true);
    try {
      const success = await recordWinOnChain(account);
      if (success) {
        alert('Victory recorded on blockchain! 🎉');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to record win. Please try again.');
    }
    setSubmitting(false);
  };
  
  return (
    <button 
      onClick={handleSubmit}
      disabled={submitting}
      style={{
        padding: '12px 24px',
        fontSize: '1.1em',
        background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
        border: 'none',
        borderRadius: '8px',
        cursor: submitting ? 'wait' : 'pointer',
        fontWeight: 'bold',
        color: '#000'
      }}
    >
      {submitting ? '⏳ Recording...' : '✅ Submit Victory'}
    </button>
  );
};
```

Update `Leaderboard.jsx` to fetch from blockchain:
```javascript
import { getLeaderboard } from '../contracts/IntegrationExample';

// In fetchLeaderboard function:
async function fetchLeaderboard() {
  try {
    setLoading(true);
    const data = await getLeaderboard(10, 0);
    setLeaderboardData(data);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
  } finally {
    setLoading(false);
  }
}
```

### 5️⃣ Test in Your Game

1. Start your dev server: `npm run dev`
2. Connect wallet
3. Play a game and win
4. Click "Submit Victory"
5. Approve MetaMask transaction
6. Check leaderboard to see your win! 🏆

---

## 🎯 Two Integration Options

### Option A: Direct Calls (Simple, but users pay gas)
- Users pay gas for each win/loss (~60k gas)
- Immediate blockchain recording
- No backend needed
- Users need SOMI tokens

**Use this if:**
- Quick testing
- Small player base
- Players okay with gas fees

### Option B: Backend Relayer (Better UX) ⭐ RECOMMENDED
- Users play for FREE
- Your relayer pays gas
- Better user experience
- Requires backend setup

**Use this if:**
- Larger player base
- Want professional UX
- Can host a backend server

---

## 📊 Expected Results

After integration, you'll have:

✅ Wins recorded on Somnia blockchain  
✅ Losses tracked automatically  
✅ Real-time leaderboard from smart contract  
✅ Player rankings  
✅ Win rates calculated  
✅ Universal system for all your games  

---

## 🛠️ Troubleshooting

**"Transaction failed"**
- Check you have SOMI for gas
- Verify contract address is correct
- Ensure wallet is authorized

**"Function not found"**
- Check ABI matches deployed contract
- Verify contract address in code

**"Not authorized"**
- Call `authorizeGame(yourAddress)` in Remix
- Check authorization with `isAuthorized(yourAddress)`

**"Leaderboard empty"**
- Play at least one game
- Check blockchain explorer for transactions
- Verify contract address is correct

---

## 🎮 Next Steps

1. ✅ Deploy contract
2. ✅ Test with your wallet
3. ✅ Integrate into game
4. ⬜ Test gameplay
5. ⬜ Deploy to production
6. ⬜ (Optional) Add backend relayer
7. ⬜ Add more games to the same leaderboard!

---

## 📞 Need Help?

- Check `DEPLOYMENT_GUIDE.md` for detailed instructions
- See `IntegrationExample.js` for code examples
- View transactions on: https://explorer.somnia.network
- Test contract calls in Remix IDE

Good luck! 🎮⚔️🏆

