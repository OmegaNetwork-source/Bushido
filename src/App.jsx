import { useState } from 'react';
import { useMetaMask } from './MetaMaskContext';
import Landing from './Landing';
import GameHub from './GameHub';
import BushidoDuelGame from './BushidoDuelGame';
import BushidoPlatformer from './BushidoPlatformer';
import Leaderboard from './Leaderboard';
import MultiplayerLobby from './MultiplayerLobby';
import MultiplayerGame from './MultiplayerGame';

function ConnectButton() {
  const { account, connectWallet, disconnect, connecting } = useMetaMask();

  if (account) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        background: 'rgba(0,0,0,0.05)',
        padding: '8px 16px',
        borderRadius: '10px'
      }}>
        <span style={{ 
          fontSize: '14px',
          fontFamily: 'monospace',
          fontWeight: '600',
          color: '#333'
        }}>
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
        <button 
          onClick={disconnect} 
          style={{ 
            padding: '6px 14px',
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#c0392b'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#e74c3c'}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={connectWallet} 
      disabled={connecting}
      style={{ 
        padding: '10px 20px',
        background: '#3498db',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: connecting ? 'not-allowed' : 'pointer',
        opacity: connecting ? 0.7 : 1,
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => !connecting && (e.currentTarget.style.background = '#2980b9')}
      onMouseLeave={(e) => !connecting && (e.currentTarget.style.background = '#3498db')}
    >
      {connecting ? 'Connecting...' : '🦊 Connect MetaMask'}
    </button>
  );
}

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [multiplayerMode, setMultiplayerMode] = useState(null); // null, 'lobby', or 'game'

  // Handle Battle Mode selection
  function handleBattleMode(mode) {
    if (mode === 'single') {
      setSelectedGame('bushido-duel');
      setShowLanding(false);
    } else if (mode === 'multi') {
      setShowLanding(false);
      setMultiplayerMode('lobby');
    }
  }

  // Show landing page first
  if (showLanding) {
    return <Landing 
      onEnterGame={() => setShowLanding(false)}
      onSelectGame={(game) => {
        setSelectedGame(game);
        setShowLanding(false);
      }}
      onBattleMode={handleBattleMode} // pass new handler
    />;
  }

  function renderGame() {
    if (multiplayerMode === 'lobby') {
      return <MultiplayerLobby 
        onStartGame={() => setMultiplayerMode('game')} 
        onBack={() => setMultiplayerMode(null)}
      />;
    }
    if (multiplayerMode === 'game') {
      return <MultiplayerGame onExit={() => setMultiplayerMode(null)} />;
    }
    if (selectedGame === 'bushido-duel') return <BushidoDuelGame />;
    if (selectedGame === 'bushido-platformer') {
      return <BushidoPlatformer onBack={() => setSelectedGame(null)} />;
    }
    return <GameHub onSelect={setSelectedGame} />;
  }

  // Hide header/nav when in multiplayer
  if (multiplayerMode) {
    return renderGame();
  }

  return (
    <div className="container">
      <header>
        <h1>Bushido Battle</h1>
        <ConnectButton />
      </header>
      <nav
        style={{
          margin: '16px 0',
          display: 'flex',
          justifyContent: 'center',
          gap: '12px'
        }}
      >
        <button onClick={() => setShowLanding(true)}>
          Home
        </button>
        <button onClick={() => setMultiplayerMode('lobby')}>
          Multiplayer
        </button>
        <button onClick={() => setShowLeaderboard(true)}>
          Leaderboard
        </button>
      </nav>
      {renderGame()}
      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}