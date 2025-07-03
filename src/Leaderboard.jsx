import React from 'react';
import { SuiClient } from '@mysten/sui.js/client';

const LEADERBOARD_ID = '0x74924486f3fe198eff38e7a3920ffc81a5a8a4554fe8e5621df84e6f6be405cd';
const MAINNET_RPC = 'https://fullnode.mainnet.sui.io';
const client = new SuiClient({ url: MAINNET_RPC });

export default function Leaderboard({ onClose }) {
  const [entries, setEntries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true);
        setError(null);
        const object = await client.getObject({
          id: LEADERBOARD_ID,
          options: { showContent: true },
        });
        const rawEntries = object.data.content.fields.entries;
        const parsed = rawEntries.map(e => ({
          player: e.fields.player,
          score: Number(e.fields.score),
        }));
        parsed.sort((a, b) => b.score - a.score);
        setEntries(parsed);
      } catch (err) {
        setError('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
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
        background: 'rgba(24,24,27,0.85)', color: '#fff', borderRadius: 24, padding: '32px 20px 28px 20px', minWidth: 320, maxWidth: 420,
        boxShadow: '0 8px 32px rgba(0,0,0,0.28)', position: 'relative', textAlign: 'center', backdropFilter: 'blur(8px)', border: '1.5px solid #333',
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
        {error && <div style={{color:'#ff6b6b',fontWeight:600}}>{error}</div>}
        {!loading && !error && !entries.length && <div style={{fontSize:18,opacity:0.8}}>No scores yet!</div>}
        {!loading && !error && entries.length > 0 && (
          <table style={{ width: '100%', background: 'transparent', color: '#fff', borderRadius: 12, fontSize: 18, fontWeight: 500, borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'center', padding: 10, fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>Rank</th>
                <th style={{ textAlign: 'center', padding: 10, fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>Wallet</th>
                <th style={{ textAlign: 'center', padding: 10, fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                let rankColor = '#444';
                if (i === 0) rankColor = 'linear-gradient(90deg,#ffd700,#fffbe6)'; // gold
                else if (i === 1) rankColor = 'linear-gradient(90deg,#c0c0c0,#f8f8f8)'; // silver
                else if (i === 2) rankColor = 'linear-gradient(90deg,#cd7f32,#ffe0b2)'; // bronze
                return (
                  <tr key={entry.player} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                    <td style={{ padding: 10, textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        minWidth: 36,
                        padding: '4px 0',
                        borderRadius: 16,
                        fontWeight: 700,
                        fontSize: 17,
                        background: rankColor,
                        color: i < 3 ? '#222' : '#fff',
                        boxShadow: i < 3 ? '0 2px 8px #0002' : undefined,
                        border: i < 3 ? '1.5px solid #fff8' : undefined,
                        letterSpacing: 1
                      }}>{i + 1}</span>
                    </td>
                    <td style={{ padding: 10, textAlign: 'center', fontFamily: 'monospace', fontSize: 16, letterSpacing: 0.5 }}>{entry.player.slice(0, 6)}...{entry.player.slice(-4)}</td>
                    <td style={{ padding: 10, textAlign: 'center', fontWeight: 700 }}>{entry.score}</td>
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