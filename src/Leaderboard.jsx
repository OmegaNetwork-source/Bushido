import React from 'react';
import { ethers } from 'ethers';

const LEADERBOARD_CONTRACT_ADDRESS = '0x8990bbf7ab7fe6bd146ddc066ca7c88773c1cc9b';
const LEADERBOARD_ABI = [
  "function getLeaderboard(uint256 limit, uint256 offset) external view returns (address[] memory topPlayers, uint256[] memory wins, uint256[] memory losses)",
  "function getTotalPlayers() external view returns (uint256)"
];

export default function Leaderboard({ onClose }) {
  const [entries, setEntries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      
      try {
        // Connect to contract using read-only provider (ethers v6)
        const provider = new ethers.JsonRpcProvider('https://api.infra.mainnet.somnia.network/');
        const contract = new ethers.Contract(LEADERBOARD_CONTRACT_ADDRESS, LEADERBOARD_ABI, provider);
        
        // Fetch top 100 players
        const [addresses, wins, losses] = await contract.getLeaderboard(100, 0);
        
        // Format data (ethers v6 - BigInt support)
        const scores = addresses.map((address, i) => ({
          player: address,
          wins: Number(wins[i]),
          losses: Number(losses[i]),
          score: Number(wins[i]) // Display wins as score
        }));
        
        setEntries(scores);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
        setEntries([]);
      }
      
      setLoading(false);
    }
    fetchLeaderboard();
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'linear-gradient(135deg, #232526 0%, #414345 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      animation: 'fadeIn 0.2s'
    }}>
      <div style={{
        background: 'rgba(24,24,27,0.85)', color: '#fff', borderRadius: 24, padding: '32px 20px 28px 20px', 
        minWidth: window.innerWidth > 768 ? 550 : 320, 
        maxWidth: window.innerWidth > 768 ? 700 : '95vw',
        boxShadow: '0 8px 32px rgba(0,0,0,0.28)', position: 'relative', textAlign: 'center', backdropFilter: 'blur(8px)', border: '1.5px solid #333',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 18, background: 'rgba(40,40,40,0.85)', color: '#fff',
            border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 22, cursor: 'pointer', lineHeight: '36px',
            boxShadow: '0 2px 8px #0004', transition: 'background 0.15s'
          }}
          aria-label="Close"
        >&times;</button>
        <h2 style={{ margin: '0 0 22px 0', textAlign: 'center', letterSpacing: 1.5, fontWeight: 800, fontSize: 32, background: 'linear-gradient(90deg, #fff, #b3b3b3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Leaderboard</h2>
        {loading && <div style={{fontSize:18,opacity:0.8}}>Loading leaderboard...</div>}
        {!loading && !entries.length && <div style={{fontSize:18,opacity:0.8}}>No scores yet!</div>}
        {!loading && entries.length > 0 && (
          <table style={{ width: '100%', background: 'transparent', color: '#fff', borderRadius: 12, fontSize: 16, fontWeight: 500, borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #333' }}>
                <th style={{ textAlign: 'center', padding: window.innerWidth > 768 ? '12px 8px' : '10px 4px', fontWeight: 700, fontSize: window.innerWidth > 768 ? 14 : 12, letterSpacing: 1, color: '#aaa' }}>Rank</th>
                <th style={{ textAlign: 'left', padding: window.innerWidth > 768 ? '12px 8px' : '10px 4px', fontWeight: 700, fontSize: window.innerWidth > 768 ? 14 : 12, letterSpacing: 1, color: '#aaa' }}>Player</th>
                <th style={{ textAlign: 'center', padding: window.innerWidth > 768 ? '12px 8px' : '10px 4px', fontWeight: 700, fontSize: window.innerWidth > 768 ? 14 : 12, letterSpacing: 1, color: '#aaa' }}>W</th>
                {window.innerWidth > 768 && <th style={{ textAlign: 'center', padding: '12px 8px', fontWeight: 700, fontSize: 14, letterSpacing: 1, color: '#aaa' }}>L</th>}
                <th style={{ textAlign: 'center', padding: window.innerWidth > 768 ? '12px 8px' : '10px 4px', fontWeight: 700, fontSize: window.innerWidth > 768 ? 14 : 12, letterSpacing: 1, color: '#aaa' }}>W%</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                let rankColor = '#444';
                let rankEmoji = '';
                if (i === 0) { rankColor = 'linear-gradient(90deg,#ffd700,#fffbe6)'; rankEmoji = '🥇'; }
                else if (i === 1) { rankColor = 'linear-gradient(90deg,#c0c0c0,#f8f8f8)'; rankEmoji = '🥈'; }
                else if (i === 2) { rankColor = 'linear-gradient(90deg,#cd7f32,#ffe0b2)'; rankEmoji = '🥉'; }
                
                const totalGames = entry.wins + entry.losses;
                const winRate = totalGames > 0 ? ((entry.wins / totalGames) * 100).toFixed(0) : 0;
                
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
                      color: winRate >= 60 ? '#4ade80' : winRate >= 40 ? '#fbbf24' : '#f87171'
                    }}>
                      {winRate}%
                    </td>
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