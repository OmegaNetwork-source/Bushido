import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const COIN_CONTRACT_ADDRESS = '0x2d06d9568ae99f61f421ea99a46969878986fc2d';
const COIN_CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256","name": "limit","type": "uint256"}],
    "name": "getTopPlayers",
    "outputs": [{"internalType": "address[]","name": "topAddresses","type": "address[]"},{"internalType": "uint256[]","name": "topCoins","type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayerCount",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function CoinCollectorLeaderboard({ onClose }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const provider = new ethers.JsonRpcProvider('https://api.infra.mainnet.somnia.network/');
      const contract = new ethers.Contract(COIN_CONTRACT_ADDRESS, COIN_CONTRACT_ABI, provider);
      
      // Get top 100 players sorted by coins
      const [addresses, coins] = await contract.getTopPlayers(100);
      
      // Format data
      const formattedData = addresses.map((address, index) => ({
        rank: index + 1,
        address: address,
        coins: Number(coins[index])
      }));
      
      setLeaderboardData(formattedData);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const shortenAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        border: '3px solid #a855f7',
        borderRadius: '15px',
        padding: isMobile ? '20px' : '30px',
        maxWidth: isMobile ? '95%' : '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: '#ec4899',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 10px rgba(236, 72, 153, 0.5)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.background = '#db2777';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.background = '#ec4899';
          }}
        >
          ×
        </button>

        {/* Title */}
        <h2 style={{
          fontSize: isMobile ? '1.5em' : '2em',
          marginBottom: '20px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontFamily: '"Cinzel Decorative", serif'
        }}>
          🪙 Coin Collector Leaderboard
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#00d4ff',
          marginBottom: '20px',
          fontSize: isMobile ? '0.9em' : '1em'
        }}>
          Total Coins Collected (Cumulative)
        </p>

        {loading && (
          <div style={{ textAlign: 'center', color: 'white', padding: '20px' }}>
            Loading leaderboard...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', color: '#ec4899', padding: '20px' }}>
            {error}
            <br />
            <button
              onClick={fetchLeaderboard}
              style={{
                marginTop: '10px',
                padding: '10px 20px',
                background: '#a855f7',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && leaderboardData.length === 0 && (
          <div style={{ textAlign: 'center', color: 'white', padding: '20px' }}>
            No players yet. Be the first to collect some coins! 🪙
          </div>
        )}

        {!loading && !error && leaderboardData.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: isMobile ? '0.85em' : '1em'
            }}>
              <thead>
                <tr style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  borderBottom: '2px solid #a855f7'
                }}>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#00d4ff' }}>Rank</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#00d4ff' }}>Player</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: '#00d4ff' }}>Total Coins</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player) => (
                  <tr
                    key={player.address}
                    style={{
                      borderBottom: '1px solid rgba(168, 85, 247, 0.3)',
                      transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      fontSize: '1.2em'
                    }}>
                      {player.rank === 1 && <span>🥇</span>}
                      {player.rank === 2 && <span>🥈</span>}
                      {player.rank === 3 && <span>🥉</span>}
                      {player.rank > 3 && <span style={{ color: '#a855f7' }}>{player.rank}</span>}
                    </td>
                    <td style={{
                      padding: '12px',
                      color: 'white',
                      fontFamily: 'monospace',
                      fontSize: isMobile ? '0.9em' : '1em'
                    }}>
                      {isMobile ? shortenAddress(player.address) : player.address}
                    </td>
                    <td style={{
                      padding: '12px',
                      textAlign: 'center',
                      color: '#FFD700',
                      fontWeight: 'bold',
                      fontSize: '1.1em'
                    }}>
                      ¥{player.coins.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Refresh Button */}
        {!loading && !error && (
          <button
            onClick={fetchLeaderboard}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1em',
              display: 'block',
              margin: '20px auto 0',
              transition: 'transform 0.3s ease',
              boxShadow: '0 4px 10px rgba(168, 85, 247, 0.5)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            🔄 Refresh Leaderboard
          </button>
        )}
      </div>
    </div>
  );
}

