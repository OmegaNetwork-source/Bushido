import React from 'react';
import { ethers } from 'ethers';

const BATTLE_CONTRACT_ADDRESS = '0x8990bbf7ab7fe6bd146ddc066ca7c88773c1cc9b';
const BATTLE_ABI = [
  "function getLeaderboard(uint256 limit, uint256 offset) external view returns (address[] memory topPlayers, uint256[] memory wins, uint256[] memory losses)",
  "function getTotalPlayers() external view returns (uint256)"
];

const COIN_CONTRACT_ADDRESS = '0x2d06d9568ae99f61f421ea99a46969878986fc2d';
const COIN_ABI = [
  "function getTopPlayers(uint256 limit) external view returns (address[] memory topAddresses, uint256[] memory topCoins)",
  "function getPlayerCount() external view returns (uint256)"
];

export default function Leaderboard({ onClose }) {
  const [activeTab, setActiveTab] = React.useState('battle'); // 'battle' or 'coins'
  const [entries, setEntries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      
      try {
        const provider = new ethers.JsonRpcProvider('https://api.infra.mainnet.somnia.network/');
        
        if (activeTab === 'battle') {
          // Fetch Battle leaderboard (wins/losses)
          const contract = new ethers.Contract(BATTLE_CONTRACT_ADDRESS, BATTLE_ABI, provider);
          const [addresses, wins, losses] = await contract.getLeaderboard(100, 0);
          
          const scores = addresses.map((address, i) => ({
            player: address,
            wins: Number(wins[i]),
            losses: Number(losses[i]),
            type: 'battle'
          }));
          
          setEntries(scores);
        } else {
          // Fetch Coin Collector leaderboard (cumulative coins)
          const contract = new ethers.Contract(COIN_CONTRACT_ADDRESS, COIN_ABI, provider);
          const [addresses, coins] = await contract.getTopPlayers(100);
          
          const scores = addresses.map((address, i) => ({
            player: address,
            coins: Number(coins[i]),
            type: 'coins'
          }));
          
          setEntries(scores);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setEntries([]);
      }
      
      setLoading(false);
    }
    fetchLeaderboard();
  }, [activeTab]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0, 0, 0, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
      animation: 'fadeIn 0.2s',
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', 
        color: '#fff', 
        borderRadius: 24, 
        padding: '32px 20px 28px 20px', 
        minWidth: window.innerWidth > 768 ? 550 : 320, 
        maxWidth: window.innerWidth > 768 ? 700 : '95vw',
        width: '100%',
        boxShadow: '0 8px 32px rgba(168, 85, 247, 0.5), 0 0 0 2px rgba(168, 85, 247, 0.3)', 
        position: 'relative', 
        textAlign: 'center', 
        border: '2px solid #a855f7',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 18, 
            background: '#ec4899', 
            color: '#fff',
            border: 'none', 
            borderRadius: '50%', 
            width: 40, 
            height: 40, 
            fontSize: 24, 
            cursor: 'pointer', 
            lineHeight: '40px',
            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.5)', 
            transition: 'all 0.2s',
            fontWeight: 'bold'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.background = '#db2777';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = '#ec4899';
          }}
          aria-label="Close"
        >&times;</button>
        <h2 style={{ margin: '0 0 18px 0', textAlign: 'center', letterSpacing: 1.5, fontWeight: 800, fontSize: 32, background: 'linear-gradient(90deg, #fff, #b3b3b3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Leaderboard</h2>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '22px' }}>
          <button
            onClick={() => setActiveTab('battle')}
            style={{
              padding: '10px 24px',
              background: activeTab === 'battle' ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' : 'rgba(40,40,40,0.5)',
              color: '#fff',
              border: activeTab === 'battle' ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'battle' ? '0 4px 12px rgba(168, 85, 247, 0.4)' : 'none'
            }}
          >
            ⚔️ Battle
          </button>
          <button
            onClick={() => setActiveTab('coins')}
            style={{
              padding: '10px 24px',
              background: activeTab === 'coins' ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : 'rgba(40,40,40,0.5)',
              color: activeTab === 'coins' ? '#000' : '#fff',
              border: activeTab === 'coins' ? '2px solid #FFD700' : '2px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: activeTab === 'coins' ? '0 4px 12px rgba(255, 215, 0, 0.4)' : 'none'
            }}
          >
            🪙 Coin Collector
          </button>
        </div>
        {loading && (
          <div style={{
            fontSize: 20, 
            color: '#00d4ff', 
            padding: '40px 20px',
            fontWeight: 600
          }}>
            ⏳ Loading leaderboard...
          </div>
        )}
        {!loading && !entries.length && (
          <div style={{
            fontSize: 20, 
            color: '#a855f7', 
            padding: '40px 20px',
            fontWeight: 600,
            background: 'rgba(168, 85, 247, 0.1)',
            borderRadius: '12px',
            border: '2px solid rgba(168, 85, 247, 0.3)'
          }}>
            🎮 No scores yet! Be the first to play!
          </div>
        )}
        {!loading && entries.length > 0 && (
          <table style={{ width: '100%', background: 'transparent', color: '#fff', borderRadius: 12, fontSize: 16, fontWeight: 500, borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333' }}>
                <th style={{ textAlign: 'center', padding: window.innerWidth > 768 ? '12px 8px' : '10px 4px', fontWeight: 700, fontSize: window.innerWidth > 768 ? 14 : 12, letterSpacing: 1, color: '#aaa' }}>Rank</th>
                <th style={{ textAlign: 'left', padding: window.innerWidth > 768 ? '12px 8px' : '10px 4px', fontWeight: 700, fontSize: window.innerWidth > 768 ? 14 : 12, letterSpacing: 1, color: '#aaa' }}>Player</th>
                {activeTab === 'battle' ? (
                  <>
                    <th style={{ textAlign: 'center', padding: window.innerWidth > 768 ? '12px 8px' : '10px 4px', fontWeight: 700, fontSize: window.innerWidth > 768 ? 14 : 12, letterSpacing: 1, color: '#aaa' }}>W</th>
                    {window.innerWidth > 768 && <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 700, fontSize: 14, letterSpacing: 1, color: '#aaa' }}>L</th>}
                    <th style={{ textAlign: 'center', padding: window.innerWidth > 768 ? '12px 8px' : '10px 4px', fontWeight: 700, fontSize: window.innerWidth > 768 ? 14 : 12, letterSpacing: 1, color: '#aaa' }}>W%</th>
                  </>
                ) : (
                  <th style={{ textAlign: 'center', padding: window.innerWidth > 768 ? '12px 8px' : '10px 4px', fontWeight: 700, fontSize: window.innerWidth > 768 ? 14 : 12, letterSpacing: 1, color: '#aaa' }}>Total Coins</th>
                )}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                let rankColor = '#444';
                let rankEmoji = '';
                if (i === 0) { rankColor = 'linear-gradient(90deg,#ffd700,#fffbe6)'; rankEmoji = '🥇'; }
                else if (i === 1) { rankColor = 'linear-gradient(90deg,#c0c0c0,#f8f8f8)'; rankEmoji = '🥈'; }
                else if (i === 2) { rankColor = 'linear-gradient(90deg,#cd7f32,#ffe0b2)'; rankEmoji = '🥉'; }
                
                const isMobile = window.innerWidth <= 768;
                
                return (
                  <tr key={entry.player} style={{ 
                    background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <td style={{ padding: isMobile ? '10px 4px' : '12px 8px', textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        minWidth: isMobile ? 28 : 32,
                        padding: isMobile ? '2px 6px' : '4px 8px',
                        borderRadius: 12,
                        fontWeight: 700,
                        fontSize: isMobile ? 13 : 15,
                        background: rankColor,
                        color: i < 3 ? '#222' : '#fff',
                        boxShadow: i < 3 ? '0 2px 8px rgba(0,0,0,0.2)' : undefined,
                        border: i < 3 ? '1.5px solid rgba(255,255,255,0.5)' : undefined,
                      }}>
                        {rankEmoji || (i + 1)}
                      </span>
                    </td>
                    <td style={{ 
                      padding: isMobile ? '10px 4px' : '12px 8px', 
                      textAlign: 'left', 
                      fontFamily: 'monospace', 
                      fontSize: isMobile ? 12 : 14, 
                      letterSpacing: 0.5,
                      color: '#fff'
                    }}>
                      {isMobile ? `${entry.player.slice(0, 4)}...${entry.player.slice(-3)}` : `${entry.player.slice(0, 6)}...${entry.player.slice(-4)}`}
                    </td>
                    
                    {activeTab === 'battle' ? (
                      <>
                        <td style={{ 
                          padding: isMobile ? '10px 4px' : '12px 8px', 
                          textAlign: 'center', 
                          fontWeight: 700,
                          color: '#4ade80',
                          fontSize: isMobile ? 14 : 16
                        }}>
                          {entry.wins}
                        </td>
                        {!isMobile && (
                          <td style={{ 
                            padding: '12px 8px', 
                            textAlign: 'center', 
                            fontWeight: 700,
                            color: '#f87171',
                            fontSize: 16
                          }}>
                            {entry.losses}
                          </td>
                        )}
                        <td style={{ 
                          padding: isMobile ? '10px 4px' : '12px 8px', 
                          textAlign: 'center', 
                          fontWeight: 600,
                          fontSize: isMobile ? 12 : 14,
                          color: ((entry.wins / (entry.wins + entry.losses)) * 100) >= 60 ? '#4ade80' : ((entry.wins / (entry.wins + entry.losses)) * 100) >= 40 ? '#fbbf24' : '#f87171'
                        }}>
                          {entry.wins + entry.losses > 0 ? ((entry.wins / (entry.wins + entry.losses)) * 100).toFixed(0) : 0}%
                        </td>
                      </>
                    ) : (
                      <td style={{ 
                        padding: isMobile ? '10px 4px' : '12px 8px', 
                        textAlign: 'center', 
                        fontWeight: 700,
                        color: '#FFD700',
                        fontSize: isMobile ? 14 : 16
                      }}>
                        ¥{entry.coins.toLocaleString()}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <style>
        {`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}
      </style>
    </div>
  );
} 