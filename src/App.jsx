import { useState } from 'react';
import { ConnectButton } from '@suiet/wallet-kit';
import GameHub from './GameHub';
import FruitNinjaGame from './FruitNinjaGame';
import NinjaDodgeGame from './NinjaDodgeGame';
import BushidoDuelGame from './BushidoDuelGame';
import Leaderboard from './Leaderboard';
import MarioPlatformerGame from './MarioPlatformerGame';

export default function App() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  function renderGame() {
    console.log('App renderGame called, selectedGame:', selectedGame);
    if (selectedGame === 'fruit-ninja') return <FruitNinjaGame />;
    if (selectedGame === 'ninja-dodge') return <NinjaDodgeGame />;
    if (selectedGame === 'bushido-duel') return <BushidoDuelGame />;
    if (selectedGame === 'mario-platformer') return <MarioPlatformerGame />;
    return <GameHub onSelect={setSelectedGame} />;
  }

  return (
    <div className="container">
      <header>
        <h1>Bushido Arcade</h1>
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
        <button onClick={() => setSelectedGame(null)}>
          Arcade Hub
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