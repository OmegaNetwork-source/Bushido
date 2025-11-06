import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useMetaMask } from './MetaMaskContext';

const SPRITES = {
  fireRight: 'https://i.postimg.cc/brgCtW68/fire-right-facing.png',
  fireLeft: 'https://i.postimg.cc/T3p7KknM/fire-left-facing.png',
  waterRight: 'https://i.postimg.cc/hPxwsZfL/water-right-facing.png',
  waterLeft: 'https://i.postimg.cc/k4pFPCh2/water-left-facing.png'
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function SubmitScoreButton({ score, playerAddress }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitScore = async () => {
    if (!playerAddress) {
      alert('Please connect your MetaMask wallet first!');
      return;
    }

    setSubmitting(true);
    try {
      // Ethers v6 syntax
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const LEADERBOARD_CONTRACT_ADDRESS = '0x8990bbf7ab7fe6bd146ddc066ca7c88773c1cc9b';
      const LEADERBOARD_ABI = [
        "function recordWin(address player) external"
      ];
      
      const contract = new ethers.Contract(LEADERBOARD_CONTRACT_ADDRESS, LEADERBOARD_ABI, signer);
      
      // Record win on blockchain
      const tx = await contract.recordWin(playerAddress);
      console.log('Recording win... Transaction hash:', tx.hash);
      
      await tx.wait();
      console.log('Win recorded successfully!');
      
      alert('🎉 Victory recorded on Somnia blockchain! Check the leaderboard to see your rank!');
    } catch (error) {
      console.error('Error recording win:', error);
      alert('Failed to record win on blockchain. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button 
      onClick={handleSubmitScore} 
      disabled={submitting}
      style={{ 
        marginTop: 10, 
        fontSize: 18, 
        padding: '10px 32px', 
        borderRadius: 10, 
        border: '2px solid #333', 
        background: submitting ? '#666' : '#4CAF50', 
        color: '#fff', 
        fontWeight: 'bold',
        cursor: submitting ? 'wait' : 'pointer',
        opacity: submitting ? 0.7 : 1
      }}
    >
      {submitting ? '⏳ Recording...' : '✅ Submit Victory'}
    </button>
  );
}

export default function BushidoDuelGame() {
  const { account } = useMetaMask();
  const [clan, setClan] = useState(null); // 'fire' or 'water'
  useEffect(() => { setClan(null); }, []); // Always clear clan on entry
  const [player, setPlayer] = useState({ hp: 10, clan: "fire", name: "Fire Bushido" });
  const [enemy, setEnemy] = useState({ hp: 10, clan: "water", name: "Water Bushido" });
  const [playerTurn, setPlayerTurn] = useState(true);
  const [log, setLog] = useState(["The duel begins!"]);
  const [gameOver, setGameOver] = useState(false);
  const [finalMoveActive, setFinalMoveActive] = useState(false);

  // Animation state
  const [effect, setEffect] = useState({ show: false, emoji: "", target: "" }); // target: "player" or "enemy"
  const [attackingPlayer, setAttackingPlayer] = useState(null); // "player" or "enemy" when attacking

  // Character image logic
  let playerImg, enemyImg;
  if (clan === "fire") {
    playerImg = SPRITES.fireRight;
    enemyImg = SPRITES.waterLeft;
  } else {
    playerImg = SPRITES.waterRight;
    enemyImg = SPRITES.fireLeft;
  }

  // Action handlers
  function logMsg(msg) {
    setLog(l => [...l, msg]);
  }

  function updateHealth(p, e) {
    setPlayer(p);
    setEnemy(e);
    if (e.hp <= 0) {
      setGameOver(true);
      logMsg("You are victorious!");
    } else if (p.hp <= 0) {
      setGameOver(true);
      logMsg("You have been defeated.");
    }
  }

  function animateAttack(target, emoji, attacker) {
    setEffect({ show: true, emoji, target });
    setAttackingPlayer(attacker); // Trigger movement animation
    setTimeout(() => {
      setEffect({ show: false, emoji: "", target: "" });
      setAttackingPlayer(null); // Reset position
    }, 600);
  }

  function playerAct(action) {
    if (!playerTurn || gameOver) return;
    
    let p = { ...player };
    let e = { ...enemy };
    let msg = "";
    
    if (action === "slash") {
      const dmg = getRandomInt(1, 2);
      e.hp -= dmg;
      msg = `You slashed the enemy for ${dmg} damage.`;
      animateAttack("enemy", "⚔️", "player");
    } else if (action === "heal") {
      const heal = getRandomInt(1, 2);
      p.hp = Math.min(10, p.hp + heal);
      msg = `You healed for ${heal} HP.`;
      animateAttack("player", "❤️", null); // No movement for heal
    } else if (action === "beam") {
      const dmg = getRandomInt(1, 3);
      e.hp -= dmg;
      msg = `Your beam blast hit for ${dmg} damage.`;
      animateAttack("enemy", "💥", "player");
    } else if (action === "kick") {
      e.hp -= 1;
      msg = `You kicked the enemy for 1 damage.`;
      animateAttack("enemy", "🔥", "player");
    }
    
    logMsg(msg);
    updateHealth(p, e);
    setPlayerTurn(false);
    
    // Trigger enemy turn after a delay, passing updated health values
    if (e.hp > 0) {
      setTimeout(() => enemyTurn(p, e), 900);
    }
  }

  function enemyTurn(currentPlayer, currentEnemy) {
    // Use passed parameters if available, otherwise fall back to state
    let p = currentPlayer ? { ...currentPlayer } : { ...player };
    let e = currentEnemy ? { ...currentEnemy } : { ...enemy };
    
    if (e.hp <= 0 || p.hp <= 0) return;
    
    const actions = ["slash", "slash", "kick", "kick", "heal", "beam", "slash", "kick", "hesitate"];
    const action = actions[getRandomInt(0, actions.length - 1)];
    let msg = "";
    
    if (action === "hesitate") {
      msg = `Enemy hesitates...`;
      logMsg(msg);
      setTimeout(() => setPlayerTurn(true), 900);
      return;
    } else if (action === "slash") {
      const dmg = getRandomInt(1, 2);
      p.hp -= dmg;
      msg = `Enemy slashed you for ${dmg} damage.`;
      animateAttack("player", "⚔️", "enemy");
    } else if (action === "heal") {
      const heal = getRandomInt(1, 2);
      e.hp = Math.min(10, e.hp + heal);
      msg = `Enemy heals itself for ${heal} HP.`;
      animateAttack("enemy", "❤️", null); // No movement for heal
    } else if (action === "beam") {
      const dmg = getRandomInt(1, 2);
      p.hp -= dmg;
      msg = `Enemy beam blast hit you for ${dmg} damage.`;
      animateAttack("player", "💥", "enemy");
    } else if (action === "kick") {
      p.hp -= 1;
      msg = `Enemy kicked you for 1 damage.`;
      animateAttack("player", "🔥", "enemy");
    }
    
    logMsg(msg);
    updateHealth(p, e);
    setTimeout(() => setPlayerTurn(true), 900);
  }

  function executeFinalMove() {
    if (!playerTurn || gameOver) return;
    setFinalMoveActive(true);
    let p = { ...player };
    let e = { ...enemy };
    let count = 0;
    const interval = setInterval(() => {
      if (count >= 10 || e.hp <= 0) {
        clearInterval(interval);
        setFinalMoveActive(false);
        setPlayerTurn(false);
        if (e.hp > 0) {
          setTimeout(() => enemyTurn(p, e), 900);
        }
        return;
      }
      e.hp -= 1;
      logMsg("💥 Final Move! Enemy takes 1 damage.");
      setEnemy({ ...e });
      animateAttack("enemy", "💥", "player");
      count++;
      if (e.hp <= 0) {
        setGameOver(true);
        logMsg("You are victorious!");
        clearInterval(interval);
        setFinalMoveActive(false);
      }
    }, 120);
  }

  function chooseClan(selectedClan) {
    setClan(selectedClan);
    setPlayer({ hp: 10, clan: selectedClan, name: selectedClan === "fire" ? "Fire Bushido" : "Water Bushido" });
    setEnemy({ hp: 10, clan: selectedClan === "fire" ? "water" : "fire", name: selectedClan === "fire" ? "Water Bushido" : "Fire Bushido" });
    setPlayerTurn(true);
    setLog(["The duel begins!"]);
    setGameOver(false);
    setFinalMoveActive(false);
  }

  if (!clan) {
    return (
      <div style={{
        minHeight: '100vh',
        minWidth: '100vw',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(110deg, #181d31 0%, #2b2d42 100%)',
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 10,
      }}>
        <div style={{
          width: '100%',
          maxWidth: 1800,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        }}>
          <div style={{
            fontSize: window.innerWidth > 768 ? '4.2em' : '2em',
            letterSpacing: window.innerWidth > 768 ? 6 : 3,
            color: '#fff',
            fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif',
            fontWeight: 900,
            textShadow: '0 8px 34px #401d2e70, 0 1.5px 0 #ffe',
            padding: 0,
            marginBottom: 0,
            textAlign: 'center',
          }}>武士道</div>
          <div style={{
            fontSize: window.innerWidth > 768 ? '2.05em' : '1.3em',
            color: '#fdc268',
            fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: 2.3,
            marginTop: 0,
            textShadow: '0 1.5px 0 #451',
            marginBottom: 10,
            textAlign: 'center',
          }}>BUSHIDO BATTLE</div>
          <div style={{
            fontSize: window.innerWidth > 768 ? '1.40em' : '1.09em',
            color: '#fdc268',
            fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 2.3,
            textShadow: '0 1.5px 0 #451',
            marginBottom: 42,
            textAlign: 'center',
          }}>CHOOSE YOUR CLAN</div>

          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth > 900 ? 'row' : 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: window.innerWidth > 900 ? 62 : 30,
            width: '100%',
            flex: 'none',
            margin: 0,
            padding: 0,
          }}>
            {/* Fire Clan Card */}
            <div
              onClick={() => chooseClan('fire')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.037)';
                e.currentTarget.style.boxShadow = '0 8px 44px 0 #ff3b3455, 0 0 0 3px #ff2820c6';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 20px #c0392b70, 0 0 0 3px #c94b2850';
              }}
              style={{
                background: 'rgba(25,12,12,0.44)',
                border: '2.5px solid #ff2820c6',
                borderRadius: 14,
                boxShadow: '0 2px 20px #c0392b70, 0 0 0 3px #c94b2850',
                padding: '36px 22px 34px 22px',
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(.71,.42,.42,1.01)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                userSelect: 'none',
                position: 'relative',
                minWidth: 210,
                flex: 1,
                minHeight: 298,
                marginBottom: window.innerWidth > 900 ? 0 : 18,
                maxWidth: 390,
              }}
            >
              <img
                src="https://i.postimg.cc/P50z5f6k/fire.png"
                alt="Fire Bushido"
                style={{
                  width: 120,
                  height: 120,
                  marginBottom: 17,
                  filter: 'drop-shadow(0 0 14px #ef5a42cc)',
                  borderRadius: 10,
                }}
              />
              <div style={{
                color: '#fff',
                fontSize: 27,
                fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif',
                fontWeight: 900,
                letterSpacing: 0.55,
                textTransform: 'uppercase',
                marginBottom: 7,
                marginTop: -3,
              }}>
                FIRE BUSHIDO
              </div>
              <div style={{
                color: '#fdc268',
                fontFamily: 'Inter, Arial, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                OFFENSE / POWER
              </div>
              <div style={{
                color: '#ffeeee',
                fontFamily: 'Inter, Arial, sans-serif',
                fontWeight: 500,
                fontSize: 15,
                lineHeight: 1.6,
                maxWidth: 215,
                margin: '9px auto 0 auto',
                letterSpacing: 0.13,
              }}>
                Masters of aggression and raw power. Strike with the fury of volcanic flame!
              </div>
            </div>
            {/* Water Clan Card */}
            <div
              onClick={() => chooseClan('water')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.037)';
                e.currentTarget.style.boxShadow = '0 8px 44px 0 #22eaff70, 0 0 0 3px #1c87e1c6';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 2px 20px #2c8ed6aa, 0 0 0 3px #12c1e250';
              }}
              style={{
                background: 'rgba(16,28,41,0.44)',
                border: '2.5px solid #1c87e1c6',
                borderRadius: 14,
                boxShadow: '0 2px 20px #2c8ed6aa, 0 0 0 3px #12c1e250',
                padding: '36px 22px 34px 22px',
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(.71,.42,.42,1.01)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                userSelect: 'none',
                position: 'relative',
                minWidth: 210,
                flex: 1,
                minHeight: 298,
                maxWidth: 390,
              }}
            >
              <img
                src="https://i.postimg.cc/VvFDSyJW/water.png"
                alt="Water Bushido"
                style={{
                  width: 120,
                  height: 120,
                  marginBottom: 17,
                  filter: 'drop-shadow(0 0 17px #34e7ffce)',
                  borderRadius: 10,
                }}
              />
              <div style={{
                color: '#dce9fd',
                fontSize: 27,
                fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif',
                fontWeight: 900,
                letterSpacing: 0.55,
                textTransform: 'uppercase',
                marginBottom: 7,
                marginTop: -3,
              }}>
                WATER BUSHIDO
              </div>
              <div style={{
                color: '#7de8ff',
                fontFamily: 'Inter, Arial, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}>
                DEFENSE / FLOW
              </div>
              <div style={{
                color: '#e6f7ff',
                fontFamily: 'Inter, Arial, sans-serif',
                fontWeight: 500,
                fontSize: 15,
                lineHeight: 1.6,
                maxWidth: 215,
                margin: '9px auto 0 auto',
                letterSpacing: 0.13,
              }}>
                Flow like water, strike like a tidal wave. Patience refined into overwhelming force!
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- REST OF THE GAME RENDER ---
  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: 0,
      background: 'none',
      width: '100%',
    }}>
      {/* Remove the Bushido Duel <h2> header here, just keep the rest of the battle UI */}
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
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
      }}>
        {/* HP Bars at top */}
        <div style={{
          position: 'absolute',
          top: 16,
          left: 24,
          width: 220,
          zIndex: 2,
        }}>
          <div style={{ fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 4px #000', marginBottom: 2 }}>{player.name}</div>
          <div style={{ width: 200, height: 18, background: '#222', borderRadius: 10, marginBottom: 2 }}>
            <div style={{ width: `${(player.hp / 10) * 100}%`, height: '100%', background: clan === 'fire' ? '#e74c3c' : '#3498db', borderRadius: 10, transition: 'width 0.3s' }} />
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
          <div style={{ fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 4px #000', marginBottom: 2 }}>{enemy.name}</div>
          <div style={{ width: 200, height: 18, background: '#222', borderRadius: 10, marginBottom: 2, float: 'right' }}>
            <div style={{ width: `${(enemy.hp / 10) * 100}%`, height: '100%', background: clan === 'fire' ? '#3498db' : '#e74c3c', borderRadius: 10, transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: 13, color: '#fff', textShadow: '1px 1px 2px #000' }}>{enemy.hp}/10</div>
        </div>
        {/* Characters on ground */}
        <div style={{ position: 'absolute', left: 60, bottom: 24, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }} className={attackingPlayer === 'player' ? 'attacking-player' : ''}>
          <div style={{ width: 60, height: 18, background: 'rgba(0,0,0,0.18)', borderRadius: '50%', filter: 'blur(1px)', marginBottom: -10 }} />
          <div style={{ position: 'relative', width: 90, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={playerImg} alt="player" className="bob" style={{ height: 120, maxWidth: '30vw', animationDelay: '0s' }} />
            {effect.show && effect.target === 'player' && (
              <span className="attack-emoji" style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 100,
                pointerEvents: 'none',
                zIndex: 10,
                textShadow: '2px 2px 8px #0008',
              }}>{effect.emoji}</span>
            )}
          </div>
        </div>
        <div style={{ position: 'absolute', right: 60, bottom: 24, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }} className={attackingPlayer === 'enemy' ? 'attacking-enemy' : ''}>
          <div style={{ width: 60, height: 18, background: 'rgba(0,0,0,0.18)', borderRadius: '50%', filter: 'blur(1px)', marginBottom: -10 }} />
          <div style={{ position: 'relative', width: 90, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={enemyImg} alt="enemy" className="bob" style={{ height: 120, maxWidth: '30vw', animationDelay: '1s' }} />
            {effect.show && effect.target === 'enemy' && (
              <span className="attack-emoji" style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: 100,
                pointerEvents: 'none',
                zIndex: 10,
                textShadow: '2px 2px 8px #0008',
              }}>{effect.emoji}</span>
            )}
          </div>
        </div>
      </div>
      {/* Action log below battle scene */}
      <div style={{ background: '#fff', border: '1px solid #ccc', borderRadius: 10, padding: 12, height: 80, overflowY: 'auto', fontSize: 15, margin: '18px 0 10px 0', boxShadow: '0 2px 8px #0001' }}>
        {log.map((msg, i) => <div key={i}>{msg}</div>)}
      </div>
      {/* Action buttons in 2x2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, margin: '0 auto', maxWidth: 500 }}>
        <button disabled={!playerTurn || gameOver} onClick={() => playerAct('slash')} style={{ fontSize: 22, padding: '18px 0', background: '#222', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 28 }}>⚔️</span> Slash
        </button>
        <button disabled={!playerTurn || gameOver} onClick={() => playerAct('heal')} style={{ fontSize: 22, padding: '18px 0', background: '#222', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 28 }}>❤️</span> Heal
        </button>
        <button disabled={!playerTurn || gameOver} onClick={() => playerAct('beam')} style={{ fontSize: 22, padding: '18px 0', background: '#222', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 28 }}>💥</span> Beam Blast
        </button>
        <button disabled={!playerTurn || gameOver} onClick={() => playerAct('kick')} style={{ fontSize: 22, padding: '18px 0', background: '#222', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 'bold', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 28 }}>🔥</span> Fire Kick
        </button>
      </div>
      {/* Final Move button if available */}
      {enemy.hp > 0 && enemy.hp <= 3 && (
        <button disabled={!playerTurn || gameOver} onClick={executeFinalMove} style={{ fontSize: 22, padding: '18px 0', background: '#b30000', color: '#fff', borderRadius: 10, border: 'none', fontWeight: 'bold', display: 'block', width: '100%', margin: '18px auto 0 auto', maxWidth: 500 }}>
          <span style={{ fontSize: 28 }}>💥</span> Final Move
        </button>
      )}
      {/* Game Over actions */}
      {gameOver && (
        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <button onClick={() => chooseClan(clan)} style={{ fontSize: 18, padding: '10px 32px', borderRadius: 10, border: '2px solid #333', background: '#fafad2', color: '#111', fontWeight: 'bold', marginBottom: 10 }}>Restart</button>
          {player.hp > 0 && <SubmitScoreButton score={1} playerAddress={account} />}
          <button onClick={() => window.location.href = 'https://bushidogame.solarstudios.co/'} style={{ fontSize: 18, padding: '10px 32px', borderRadius: 10, border: '2px solid #333', background: '#3498db', color: '#fff', fontWeight: 'bold', marginLeft: 10 }}>Home</button>
        </div>
      )}
    </div>
  );
}