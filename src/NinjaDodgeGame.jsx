import React, { useRef, useEffect, useState } from 'react';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useWallet } from '@suiet/wallet-kit';
import { SuiClient } from '@mysten/sui.js/client';

const OBSTACLE_EMOJI = "🪨";
const SPRITES = {
  fire: 'https://i.postimg.cc/brgCtW68/fire-right-facing.png',
  water: 'https://i.postimg.cc/hPxwsZfL/water-right-facing.png'
};

const GROUND_Y = 350;
const PLAYER_X = 60;
const JUMP_HEIGHT = 110;
const JUMP_DURATION = 500; // ms

const PACKAGE_ID = '0x3fa742fea7561af7a5ea9b8f88f9fa4c55f6aca31dc938b380fc3c8381b135b8';
const MODULE = 'simple_leaderboard';
const FUNCTION = 'submit_score';
const LEADERBOARD_ID = '0x74924486f3fe198eff38e7a3920ffc81a5a8a4554fe8e5621df84e6f6be405cd';
const GAME_ID_BYTES = [110,105,110,106,97,95,100,111,100,103,101]; // "ninja_dodge"

const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });

const BACKGROUND_IMG_URL = 'https://i.postimg.cc/d3TWz5MS/bamboo.png';
const backgroundImg = new window.Image();
backgroundImg.src = BACKGROUND_IMG_URL;

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

function Leaderboard() {
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
        // Sort descending by score
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

  if (loading) return <div>Loading leaderboard...</div>;
  if (error) return <div>{error}</div>;
  if (!entries.length) return <div>No scores yet!</div>;
  return (
    <div style={{ marginTop: 20 }}>
      <h3>Leaderboard</h3>
      <table style={{ width: '100%', background: '#222', color: '#fff', borderRadius: 8 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: 8 }}>Rank</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Wallet</th>
            <th style={{ textAlign: 'left', padding: 8 }}>Score</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={entry.player}>
              <td style={{ padding: 8 }}>{i + 1}</td>
              <td style={{ padding: 8 }}>{entry.player.slice(0, 6)}...{entry.player.slice(-4)}</td>
              <td style={{ padding: 8 }}>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BushidoDodgeGame() {
  const [clan, setClan] = useState(null); // 'fire' or 'water'
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const playerYRef = useRef(GROUND_Y);
  const jumpingRef = useRef(false);
  const obstaclesRef = useRef([]);
  const animationRef = useRef();

  // Responsive canvas
  const [dimensions, setDimensions] = useState({
    width: Math.min(window.innerWidth - 32, 400),
    height: 360
  });
  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: Math.min(window.innerWidth - 32, 400),
        height: 360
      });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Game loop
  useEffect(() => {
    if (!running) return;
    function gameLoop() {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw background
      ctx.drawImage(backgroundImg, 0, 0, dimensions.width, dimensions.height);

      // Draw ground
      ctx.fillStyle = "#b2a16b";
      ctx.fillRect(0, GROUND_Y + 30, dimensions.width, 20);

      // Draw player (Bushido) with bob effect
      if (clan) {
        const img = new window.Image();
        img.src = SPRITES[clan];
        // Bob effect: only when not jumping
        let bobOffset = 0;
        if (!jumpingRef.current && playerYRef.current === GROUND_Y) {
          bobOffset = Math.sin(Date.now() / 300) * 6;
        }
        ctx.save();
        ctx.translate(PLAYER_X, playerYRef.current + bobOffset);
        ctx.drawImage(img, -30, -70, 60, 70);
        ctx.restore();
      }

      // Move and draw obstacles
      obstaclesRef.current.forEach(ob => {
        ob.x -= ob.speed;
        ctx.save();
        ctx.font = "2.5em serif";
        ctx.translate(ob.x, GROUND_Y);
        ctx.fillText(OBSTACLE_EMOJI, 0, 0);
        ctx.restore();
      });

      // Remove off-screen obstacles
      obstaclesRef.current = obstaclesRef.current.filter(ob => ob.x > -40);

      // Collision detection
      obstaclesRef.current.forEach(ob => {
        if (
          ob.x < PLAYER_X + 30 &&
          ob.x > PLAYER_X - 30 &&
          playerYRef.current > GROUND_Y - 30 // not jumping
        ) {
          setRunning(false);
          setGameOver(true);
        }
      });

      // Score for dodged obstacles
      obstaclesRef.current.forEach(ob => {
        if (!ob.scored && ob.x < PLAYER_X - 30) {
          ob.scored = true;
          setScore(s => s + 1);
        }
      });

      animationRef.current = requestAnimationFrame(gameLoop);
    }
    gameLoop();
    return () => cancelAnimationFrame(animationRef.current);
    // eslint-disable-next-line
  }, [running, dimensions, clan]);

  // Spawn obstacles (SLOWER rocks)
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      obstaclesRef.current.push({
        x: dimensions.width + 40,
        speed: 1.7 + Math.random() * 1.2,
        scored: false
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [running, dimensions]);

  // Jump logic
  function jump() {
    if (jumpingRef.current || !running) return;
    jumpingRef.current = true;
    const start = Date.now();
    function animateJump() {
      const elapsed = Date.now() - start;
      if (elapsed < JUMP_DURATION / 2) {
        // Going up
        playerYRef.current = GROUND_Y - (JUMP_HEIGHT * (elapsed / (JUMP_DURATION / 2)));
      } else if (elapsed < JUMP_DURATION) {
        // Going down
        playerYRef.current = GROUND_Y - (JUMP_HEIGHT * (1 - (elapsed - JUMP_DURATION / 2) / (JUMP_DURATION / 2)));
      } else {
        playerYRef.current = GROUND_Y;
        jumpingRef.current = false;
        return;
      }
      requestAnimationFrame(animateJump);
    }
    animateJump();
  }

  // Keyboard and touch controls
  useEffect(() => {
    function handleKey(e) {
      if (e.code === "Space" || e.key === " " || e.key === "ArrowUp") {
        jump();
      }
    }
    function handleTouch(e) {
      jump();
      if (e.cancelable) e.preventDefault();
    }
    window.addEventListener("keydown", handleKey);
    const canvas = canvasRef.current;
    if (canvas) canvas.addEventListener("touchstart", handleTouch, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleKey);
      if (canvas) canvas.removeEventListener("touchstart", handleTouch);
    };
    // eslint-disable-next-line
  }, [running]);

  function startGame(selectedClan) {
    setClan(selectedClan);
    setScore(0);
    setGameOver(false);
    obstaclesRef.current = [];
    playerYRef.current = GROUND_Y;
    setRunning(true);
  }

  // --- CLAN SELECTION UI ---
  if (!clan) {
    return (
      <div className="bushido-clan-select-container">
        <div className="bushido-clan-select-title">Choose your clan:</div>
        <div className="bushido-clan-select-btn-row">
          <button
            className="bushido-clan-select-btn fire"
            onClick={() => startGame("fire")}
          >🔥 Fire Bushido</button>
          <button
            className="bushido-clan-select-btn water"
            onClick={() => startGame("water")}
          >💧 Water Bushido</button>
        </div>
      </div>
    );
  }

  // --- REST OF THE GAME RENDER ---
  return (
    <div className="game-area" style={{textAlign: "center"}}>
      <h2>Jump</h2>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          border: '2px solid #333',
          background: '#fafad2',
          borderRadius: 10,
          touchAction: 'none',
          maxWidth: '100vw',
          display: 'block',
          margin: '0 auto'
        }}
        onClick={jump}
      />
      <div className="score" style={{fontSize: "1.2em", marginTop: 10}}>Score: {score}</div>
      {gameOver && (
        <>
          <div style={{color: "#b30000", fontWeight: "bold", fontSize: "1.3em", margin: "10px 0"}}>Game Over!</div>
          <button onClick={() => startGame(clan)} style={{marginTop: 10}}>Restart</button>
          <SubmitScoreButton score={score} />
          <Leaderboard />
        </>
      )}
      <div style={{ color: '#333', marginTop: 16, fontSize: 16, fontWeight: 'bold' }}>
        Press <b>Space</b> to jump (or swipe up on mobile)
      </div>
    </div>
  );
}