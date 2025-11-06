import React from 'react';

export default function GameHub({ onSelect }) {
  // Instead of auto-select, show a menu
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Montserrat, Arial',
      color: '#fff',
    }}>
      <h1 style={{ fontSize: '2.6em', marginBottom: 30 }}>Bushido Game Hub</h1>
      <div style={{ display: 'flex', gap: 32, marginBottom: 32 }}>
        <button onClick={() => onSelect('bushido-platformer')} style={{ fontSize: '1.25em', padding: '18px 32px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#ffd700 0%,#ffaa00 100%)', color:'#222', fontWeight:600 }}>Platformer</button>
        <button onClick={() => onSelect('bushido-duel')} style={{ fontSize: '1.25em', padding: '20px 36px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#fa6478 0%,#faa16a 100%)', color:'#fff', fontWeight:600 }}>Duel</button>
        <button onClick={() => onSelect('fruit-ninja')} style={{ fontSize: '1.25em', padding: '19px 34px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#73d3ff 0%,#779fff 100%)', color:'#fff', fontWeight:600 }}>Fruit Ninja</button>
      </div>
      <div style={{ fontSize: '1em', opacity:0.72 }}>Select a game mode above!</div>
    </div>
  );
}