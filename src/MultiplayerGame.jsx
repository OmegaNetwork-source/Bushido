import React, { useState, useEffect } from 'react';
import { useMultiplayer } from './MultiplayerContext';

const SPRITES = {
  fireRight: 'https://i.postimg.cc/brgCtW68/fire-right-facing.png',
  fireLeft: 'https://i.postimg.cc/T3p7KknM/fire-left-facing.png',
  waterRight: 'https://i.postimg.cc/hPxwsZfL/water-right-facing.png',
  waterLeft: 'https://i.postimg.cc/k4pFPCh2/water-left-facing.png'
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function MultiplayerGame({ onExit }) {
  const { isHost, sendData, setMessageHandler, disconnect } = useMultiplayer();
  
  const [clan, setClan] = useState(null);
  const [opponentClan, setOpponentClan] = useState(null);
  const [player, setPlayer] = useState({ hp: 10, name: "You" });
  const [opponent, setOpponent] = useState({ hp: 10, name: "Opponent" });
  const [myTurn, setMyTurn] = useState(isHost); // Host goes first
  const [log, setLog] = useState(["The multiplayer duel begins!"]);
  const [gameOver, setGameOver] = useState(false);
  const [effect, setEffect] = useState({ show: false, emoji: "", target: "" });
  const [attackingPlayer, setAttackingPlayer] = useState(null);

  // Set up message handler for receiving opponent's moves
  useEffect(() => {
    setMessageHandler((data) => {
      console.log('Received move from opponent:', data);
      
      if (data.type === 'clanSelect') {
        setOpponentClan(data.clan);
        logMsg(`Opponent chose ${data.clan === 'fire' ? 'Fire' : 'Water'} Bushido!`);
      } else if (data.type === 'attack') {
        handleOpponentAttack(data);
      }
    });
  }, [setMessageHandler]);

  function logMsg(msg) {
    setLog(l => [...l, msg]);
  }

  function animateAttack(target, emoji, attacker) {
    setEffect({ show: true, emoji, target });
    setAttackingPlayer(attacker);
    setTimeout(() => {
      setEffect({ show: false, emoji: "", target: "" });
      setAttackingPlayer(null);
    }, 600);
  }

  function chooseClan(selectedClan) {
    setClan(selectedClan);
    sendData({ type: 'clanSelect', clan: selectedClan });
    logMsg(`You chose ${selectedClan === 'fire' ? 'Fire' : 'Water'} Bushido!`);
  }

  function playerAct(action) {
    if (!myTurn || gameOver || !clan || !opponentClan) return;

    let damage = 0;
    let heal = 0;
    let msg = "";
    let emoji = "";

    if (action === "slash") {
      damage = getRandomInt(1, 2);
      msg = `You slashed for ${damage} damage!`;
      emoji = "⚔️";
      animateAttack("opponent", emoji, "player");
    } else if (action === "heal") {
      heal = getRandomInt(1, 2);
      const newHp = Math.min(10, player.hp + heal);
      setPlayer({ ...player, hp: newHp });
      msg = `You healed for ${heal} HP!`;
      emoji = "❤️";
      animateAttack("player", emoji, null);
    } else if (action === "beam") {
      damage = getRandomInt(1, 3);
      msg = `Your beam blast hit for ${damage} damage!`;
      emoji = "💥";
      animateAttack("opponent", emoji, "player");
    } else if (action === "kick") {
      damage = 1;
      msg = `You kicked for 1 damage!`;
      emoji = "🔥";
      animateAttack("opponent", emoji, "player");
    }

    logMsg(msg);

    // Send move to opponent
    sendData({
      type: 'attack',
      action,
      damage,
      heal
    });

    // Update opponent's HP locally
    if (damage > 0) {
      const newHp = Math.max(0, opponent.hp - damage);
      setOpponent({ ...opponent, hp: newHp });
      if (newHp <= 0) {
        setGameOver(true);
        logMsg("🎉 Victory! You win!");
      }
    }

    setMyTurn(false);
  }

  function handleOpponentAttack(data) {
    const { action, damage, heal } = data;
    let msg = "";
    let emoji = "";

    if (action === "slash") {
      const newHp = Math.max(0, player.hp - damage);
      setPlayer({ ...player, hp: newHp });
      msg = `Opponent slashed you for ${damage} damage!`;
      emoji = "⚔️";
      animateAttack("player", emoji, "opponent");
      
      if (newHp <= 0) {
        setGameOver(true);
        logMsg("💀 Defeat! Opponent wins!");
      }
    } else if (action === "heal") {
      const newHp = Math.min(10, opponent.hp + heal);
      setOpponent({ ...opponent, hp: newHp });
      msg = `Opponent healed for ${heal} HP!`;
      emoji = "❤️";
      animateAttack("opponent", emoji, null);
    } else if (action === "beam") {
      const newHp = Math.max(0, player.hp - damage);
      setPlayer({ ...player, hp: newHp });
      msg = `Opponent's beam blast hit you for ${damage} damage!`;
      emoji = "💥";
      animateAttack("player", emoji, "opponent");
      
      if (newHp <= 0) {
        setGameOver(true);
        logMsg("💀 Defeat! Opponent wins!");
      }
    } else if (action === "kick") {
      const newHp = Math.max(0, player.hp - damage);
      setPlayer({ ...player, hp: newHp });
      msg = `Opponent kicked you for ${damage} damage!`;
      emoji = "🔥";
      animateAttack("player", emoji, "opponent");
      
      if (newHp <= 0) {
        setGameOver(true);
        logMsg("💀 Defeat! Opponent wins!");
      }
    }

    logMsg(msg);
    setMyTurn(true);
  }

  function handleExit() {
    disconnect();
    onExit();
  }

  // Determine sprites
  let playerImg, opponentImg;
  if (clan && opponentClan) {
    if (clan === "fire") {
      playerImg = SPRITES.fireRight;
      opponentImg = SPRITES.waterLeft;
    } else {
      playerImg = SPRITES.waterRight;
      opponentImg = SPRITES.fireLeft;
    }
  }

  // Clan selection screen
  if (!clan || !opponentClan) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'linear-gradient(90deg, #2d0a0a 0%, #0a0a2e 50%, #0a1a2d 100%)'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1100px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: window.innerWidth > 768 ? '4em' : '2.5em',
            color: '#fff',
            marginBottom: '15px',
            textShadow: '3px 3px 10px rgba(0,0,0,0.9)',
            fontFamily: 'Georgia, serif',
            fontWeight: 'bold'
          }}>武士道 PvP</h1>
          
          {!clan ? (
            <>
              <h2 style={{
                color: '#fbc88d',
                marginBottom: '60px',
                fontSize: window.innerWidth > 768 ? '2.2em' : '1.5em',
                textShadow: '2px 2px 6px rgba(0,0,0,0.8)',
                fontFamily: 'Georgia, serif',
                fontWeight: '300',
                letterSpacing: '2px'
              }}>Choose Your Clan</h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
                gap: window.innerWidth > 768 ? '50px' : '30px',
                maxWidth: '900px',
                margin: '0 auto'
              }}>
                <div
                  onClick={() => chooseClan('fire')}
                  style={{
                    background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                    padding: '40px 30px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '4px solid rgba(255,107,53,0.6)',
                    boxShadow: '0 10px 35px rgba(255,107,53,0.5)'
                  }}
                >
                  <img
                    src="https://i.postimg.cc/P50z5f6k/fire.png"
                    style={{ width: '150px', height: '150px', marginBottom: '20px' }}
                    alt="Fire"
                  />
                  <h3 style={{ color: '#fff', fontSize: '2em', margin: '15px 0' }}>🔥 Fire Bushido</h3>
                </div>

                <div
                  onClick={() => chooseClan('water')}
                  style={{
                    background: 'linear-gradient(135deg, #2980b9 0%, #3498db 100%)',
                    padding: '40px 30px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '4px solid rgba(52,152,219,0.6)',
                    boxShadow: '0 10px 35px rgba(52,152,219,0.5)'
                  }}
                >
                  <img
                    src="https://i.postimg.cc/VvFDSyJW/water.png"
                    style={{ width: '150px', height: '150px', marginBottom: '20px' }}
                    alt="Water"
                  />
                  <h3 style={{ color: '#fff', fontSize: '2em', margin: '15px 0' }}>💧 Water Bushido</h3>
                </div>
              </div>
            </>
          ) : (
            <h2 style={{
              color: '#fbc88d',
              fontSize: '2em',
              animation: 'pulse 2s infinite'
            }}>
              ⏳ Waiting for opponent to choose...
            </h2>
          )}

          <button
            onClick={handleExit}
            style={{
              marginTop: '40px',
              padding: '12px 30px',
              background: '#95a5a6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.1em'
            }}
          >
            ← Exit
          </button>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(90deg, #2d0a0a 0%, #0a0a2e 50%, #0a1a2d 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: 0,
        width: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ color: '#fff', textShadow: '1px 1px 6px #000' }}>Multiplayer Duel</h2>
          <button
            onClick={handleExit}
            style={{
              padding: '8px 16px',
              background: '#95a5a6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Exit
          </button>
        </div>

        {/* Battle Scene */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: 700,
          aspectRatio: '2/1',
          minHeight: 220,
          margin: '0 auto',
          backgroundImage: "url('https://i.postimg.cc/sDB8KtPX/background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 16,
          boxShadow: '0 0 10px #0002',
          overflow: 'hidden'
        }}>
          {/* HP Bars */}
          <div style={{
            position: 'absolute',
            top: 16,
            left: 24,
            width: 220,
            zIndex: 2,
          }}>
            <div style={{ fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 4px #000', marginBottom: 2 }}>{player.name}</div>
            <div style={{ width: 200, height: 18, background: '#222', borderRadius: 10, marginBottom: 2 }}>
              <div style={{ width: `${(player.hp / 10) * 100}%`, height: '100%', background: '#e74c3c', borderRadius: 10, transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: 13, color: '#fff', textShadow: '1px 1px 2px #000' }}>{player.hp}/10</div>
          </div>
          <div style={{
            position: 'absolute',
            top: 16,
            right: 24,
            width: 220,
            zIndex: 2,
            textAlign: 'right',
          }}>
            <div style={{ fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 4px #000', marginBottom: 2 }}>{opponent.name}</div>
            <div style={{ width: 200, height: 18, background: '#222', borderRadius: 10, marginBottom: 2, float: 'right' }}>
              <div style={{ width: `${(opponent.hp / 10) * 100}%`, height: '100%', background: '#3498db', borderRadius: 10, transition: 'width 0.3s' }} />
            </div>
            <div style={{ fontSize: 13, color: '#fff', textShadow: '1px 1px 2px #000' }}>{opponent.hp}/10</div>
          </div>

          {/* Characters */}
          <div style={{ position: 'absolute', left: 60, bottom: 24, zIndex: 2 }} className={attackingPlayer === 'player' ? 'attacking-player' : ''}>
            <div style={{ width: 60, height: 18, background: 'rgba(0,0,0,0.18)', borderRadius: '50%', filter: 'blur(1px)', marginBottom: -10 }} />
            <div style={{ position: 'relative', width: 90, height: 120 }}>
              <img src={playerImg} alt="player" className="bob" style={{ height: 120, animationDelay: '0s' }} />
              {effect.show && effect.target === 'player' && (
                <span className="attack-emoji" style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 100,
                  zIndex: 10,
                  textShadow: '2px 2px 8px #0008',
                }}>{effect.emoji}</span>
              )}
            </div>
          </div>
          <div style={{ position: 'absolute', right: 60, bottom: 24, zIndex: 2 }} className={attackingPlayer === 'opponent' ? 'attacking-enemy' : ''}>
            <div style={{ width: 60, height: 18, background: 'rgba(0,0,0,0.18)', borderRadius: '50%', filter: 'blur(1px)', marginBottom: -10 }} />
            <div style={{ position: 'relative', width: 90, height: 120 }}>
              <img src={opponentImg} alt="opponent" className="bob" style={{ height: 120, animationDelay: '1s' }} />
              {effect.show && effect.target === 'opponent' && (
                <span className="attack-emoji" style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 100,
                  zIndex: 10,
                  textShadow: '2px 2px 8px #0008',
                }}>{effect.emoji}</span>
              )}
            </div>
          </div>
        </div>

        {/* Turn indicator */}
        <div style={{
          textAlign: 'center',
          padding: '12px',
          marginTop: '18px',
          background: myTurn ? 'rgba(39,174,96,0.2)' : 'rgba(231,76,60,0.2)',
          border: `2px solid ${myTurn ? '#27ae60' : '#e74c3c'}`,
          borderRadius: '10px',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1.2em'
        }}>
          {myTurn ? '✅ Your Turn!' : '⏳ Opponent\'s Turn...'}
        </div>

        {/* Action log */}
        <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 10, padding: 12, height: 80, overflowY: 'auto', fontSize: 15, margin: '18px 0 10px 0', boxShadow: '0 2px 8px #0001' }}>
          {log.map((msg, i) => <div key={i}>{msg}</div>)}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, margin: '0 auto', maxWidth: 500 }}>
          <button disabled={!myTurn || gameOver} onClick={() => playerAct('slash')} style={{ fontSize: 22, padding: '18px 0', background: myTurn && !gameOver ? '#222' : '#95a5a6', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 'bold', cursor: myTurn && !gameOver ? 'pointer' : 'not-allowed' }}>
            <span style={{ fontSize: 28 }}>⚔️</span><br/>Slash
          </button>
          <button disabled={!myTurn || gameOver} onClick={() => playerAct('heal')} style={{ fontSize: 22, padding: '18px 0', background: myTurn && !gameOver ? '#222' : '#95a5a6', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 'bold', cursor: myTurn && !gameOver ? 'pointer' : 'not-allowed' }}>
            <span style={{ fontSize: 28 }}>❤️</span><br/>Heal
          </button>
          <button disabled={!myTurn || gameOver} onClick={() => playerAct('beam')} style={{ fontSize: 22, padding: '18px 0', background: myTurn && !gameOver ? '#222' : '#95a5a6', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 'bold', cursor: myTurn && !gameOver ? 'pointer' : 'not-allowed' }}>
            <span style={{ fontSize: 28 }}>💥</span><br/>Beam Blast
          </button>
          <button disabled={!myTurn || gameOver} onClick={() => playerAct('kick')} style={{ fontSize: 22, padding: '18px 0', background: myTurn && !gameOver ? '#222' : '#95a5a6', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 'bold', cursor: myTurn && !gameOver ? 'pointer' : 'not-allowed' }}>
            <span style={{ fontSize: 28 }}>🔥</span><br/>Fire Kick
          </button>
        </div>

        {gameOver && (
          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <button onClick={handleExit} style={{ fontSize: 18, padding: '10px 32px', borderRadius: 10, border: '2px solid #333', background: '#3498db', color: '#fff', fontWeight: 'bold' }}>
              Back to Lobby
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

