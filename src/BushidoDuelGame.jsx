import React, { useState } from 'react';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useWallet } from '@suiet/wallet-kit';

const SPRITES = {
  fireRight: 'https://i.postimg.cc/brgCtW68/fire-right-facing.png',
  fireLeft: 'https://i.postimg.cc/T3p7KknM/fire-left-facing.png',
  waterRight: 'https://i.postimg.cc/hPxwsZfL/water-right-facing.png',
  waterLeft: 'https://i.postimg.cc/k4pFPCh2/water-left-facing.png'
};

const PACKAGE_ID = '0x3fa742fea7561af7a5ea9b8f88f9fa4c55f6aca31dc938b380fc3c8381b135b8';
const MODULE = 'simple_leaderboard';
const FUNCTION = 'submit_score';
const LEADERBOARD_ID = '0x74924486f3fe198eff38e7a3920ffc81a5a8a4554fe8e5621df84e6f6be405cd';
const GAME_ID_BYTES = [98,117,115,104,105,100,111,95,100,117,101,108]; // "bushido_duel"

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function SubmitScoreButton({ score }) {
  const { account, signAndExecuteTransactionBlock } = useWallet();

  const handleSubmitScore = async () => {
    if (!account?.address) {
      alert('Please connect your Sui wallet first!');
      return;
    }

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE}::${FUNCTION}`,
      arguments: [
        tx.object(LEADERBOARD_ID),
        tx.pure(account.address),
        tx.pure(score),
      ],
    });

    try {
      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: { showEffects: true },
      });
      alert('Score submitted! Tx digest: ' + result.digest);
    } catch (e) {
      alert('Failed to submit score: ' + e.message);
    }
  };

  return (
    <button onClick={handleSubmitScore} style={{ marginTop: 10 }}>
      Submit Score On-Chain
    </button>
  );
}

export default function BushidoDuelGame() {
  const [clan, setClan] = useState(null); // 'fire' or 'water'
  const [player, setPlayer] = useState({ hp: 10, clan: "fire", name: "Fire Bushido" });
  const [enemy, setEnemy] = useState({ hp: 10, clan: "water", name: "Water Bushido" });
  const [playerTurn, setPlayerTurn] = useState(true);
  const [log, setLog] = useState(["The duel begins!"]);
  const [gameOver, setGameOver] = useState(false);
  const [finalMoveActive, setFinalMoveActive] = useState(false);

  // Animation state
  const [effect, setEffect] = useState({ show: false, emoji: "", target: "" }); // target: "player" or "enemy"

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

  function animateAttack(target, emoji) {
    setEffect({ show: true, emoji, target });
    setTimeout(() => {
      setEffect({ show: false, emoji: "", target: "" });
    }, 500);
  }

  function playerAct(action) {
    if (!playerTurn || gameOver) return;
    setPlayer(prevPlayer => {
      setEnemy(prevEnemy => {
        let p = { ...prevPlayer };
        let e = { ...prevEnemy };
        let msg = "";
        if (action === "slash") {
          const dmg = getRandomInt(1, 2);
          e.hp -= dmg;
          msg = `You slashed the enemy for ${dmg} damage.`;
          animateAttack("enemy", "⚔️");
        } else if (action === "heal") {
          const heal = getRandomInt(1, 2);
          p.hp = Math.min(10, p.hp + heal);
          msg = `You healed for ${heal} HP.`;
          animateAttack("player", "❤️");
        } else if (action === "beam") {
          const dmg = getRandomInt(1, 3);
          e.hp -= dmg;
          msg = `Your beam blast hit for ${dmg} damage.`;
          animateAttack("enemy", "💥");
        } else if (action === "kick") {
          e.hp -= 1;
          msg = `You kicked the enemy for 1 damage.`;
          animateAttack("enemy", "🔥");
        }
        logMsg(msg);
        updateHealth(p, e);
        setPlayerTurn(false);
        setTimeout(enemyTurn, 900);
        return p;
      });
      return prevPlayer;
    });
  }

  function enemyTurn() {
    if (enemy.hp <= 0 || player.hp <= 0) return;
    setPlayer(prevPlayer => {
      setEnemy(prevEnemy => {
        let p = { ...prevPlayer };
        let e = { ...prevEnemy };
        const actions = ["slash", "slash", "kick", "kick", "heal", "beam", "slash", "kick", "hesitate"];
        const action = actions[getRandomInt(0, actions.length - 1)];
        let msg = "";
        if (action === "hesitate") {
          msg = `Enemy hesitates...`;
          logMsg(msg);
          setTimeout(() => setPlayerTurn(true), 900);
          return e;
        } else if (action === "slash") {
          const dmg = getRandomInt(1, 2);
          p.hp -= dmg;
          msg = `Enemy slashed you for ${dmg} damage.`;
          animateAttack("player", "⚔️");
        } else if (action === "heal") {
          const heal = getRandomInt(1, 2);
          e.hp = Math.min(10, e.hp + heal);
          msg = `Enemy heals itself for ${heal} HP.`;
          animateAttack("enemy", "❤️");
        } else if (action === "beam") {
          const dmg = getRandomInt(1, 2);
          p.hp -= dmg;
          msg = `Enemy beam blast hit you for ${dmg} damage.`;
          animateAttack("player", "💥");
        } else if (action === "kick") {
          p.hp -= 1;
          msg = `Enemy kicked you for 1 damage.`;
          animateAttack("player", "🔥");
        }
        logMsg(msg);
        updateHealth(p, e);
        setTimeout(() => setPlayerTurn(true), 900);
        return e;
      });
      return prevPlayer;
    });
  }

  function executeFinalMove() {
    if (!playerTurn || gameOver) return;
    setFinalMoveActive(true);
    let e = { ...enemy };
    let count = 0;
    const interval = setInterval(() => {
      if (count >= 10 || e.hp <= 0) {
        clearInterval(interval);
        setFinalMoveActive(false);
        setPlayerTurn(false);
        setTimeout(enemyTurn, 900);
        return;
      }
      e.hp -= 1;
      logMsg("💥 Final Move! Enemy takes 1 damage.");
      setEnemy({ ...e });
      animateAttack("enemy", "💥");
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
      <div className="bushido-clan-select-container">
        <div className="bushido-clan-select-title">Choose your clan:</div>
        <div className="bushido-clan-select-btn-row">
          <button
            className="bushido-clan-select-btn fire"
            onClick={() => chooseClan("fire")}
          >🔥 Fire Bushido</button>
          <button
            className="bushido-clan-select-btn water"
            onClick={() => chooseClan("water")}
          >💧 Water Bushido</button>
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
      <h2 style={{ textAlign: 'center', color: '#fff', textShadow: '1px 1px 6px #000', marginBottom: 12 }}>Bushido Duel</h2>
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
          <div style={{ fontWeight: 'bold', color: '#fff', textShadow: '1px 1px 4px #000', marginBottom: 2 }}>{enemy.name}</div>
          <div style={{ width: 200, height: 18, background: '#222', borderRadius: 10, marginBottom: 2, float: 'right' }}>
            <div style={{ width: `${(enemy.hp / 10) * 100}%`, height: '100%', background: '#3498db', borderRadius: 10, transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: 13, color: '#fff', textShadow: '1px 1px 2px #000' }}>{enemy.hp}/10</div>
        </div>
        {/* Characters on ground */}
        <div style={{ position: 'absolute', left: 60, bottom: 24, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 60, height: 18, background: 'rgba(0,0,0,0.18)', borderRadius: '50%', filter: 'blur(1px)', marginBottom: -10 }} />
          <div style={{ position: 'relative', width: 90, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={playerImg} alt="player" className="bob" style={{ height: 120, maxWidth: '30vw' }} />
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
        <div style={{ position: 'absolute', right: 60, bottom: 24, zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 60, height: 18, background: 'rgba(0,0,0,0.18)', borderRadius: '50%', filter: 'blur(1px)', marginBottom: -10 }} />
          <div style={{ position: 'relative', width: 90, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={enemyImg} alt="enemy" className="bob" style={{ height: 120, maxWidth: '30vw' }} />
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
          <span style={{ fontSize: 28 }}>🔥</span> Kick
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
          <SubmitScoreButton score={player.hp > 0 ? 1 : 0} />
        </div>
      )}
    </div>
  );
}