import { useEffect, useRef, useState } from 'react';
import './App.css';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { useWallet } from '@suiet/wallet-kit';
import { SuiClient } from '@mysten/sui.js/client';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const LEVEL_WIDTH = 7000; // Even longer level
const GROUND_Y = 340;
const PLAYER_SIZE = 40;
const GRAVITY = 0.6;
const JUMP_VELOCITY = -12;
const MOVE_SPEED = 4; // Faster movement
const ENEMY_SIZE = 36;
const COIN_SIZE = 24;
const PLATFORM_HEIGHT = 16;
const INITIAL_LIVES = 3;
const FPS = 30;

const PACKAGE_ID = '0x3fa742fea7561af7a5ea9b8f88f9fa4c55f6aca31dc938b380fc3c8381b135b8';
const MODULE = 'simple_leaderboard';
const FUNCTION = 'submit_score';
const LEADERBOARD_ID = '0x74924486f3fe198eff38e7a3920ffc81a5a8a4554fe8e5621df84e6f6be405cd';
const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });

const LEVEL = [
  { x: 0, y: GROUND_Y, width: LEVEL_WIDTH },
  { x: 180, y: 260, width: 120 },
  { x: 400, y: 200, width: 100 },
  { x: 600, y: 300, width: 80 },
  { x: 900, y: 250, width: 120 },
  { x: 1200, y: 180, width: 100 },
  { x: 1400, y: 320, width: 80 },
  { x: 1700, y: 260, width: 120 },
  { x: 2000, y: 200, width: 100 },
  { x: 2200, y: 300, width: 80 },
  { x: 2500, y: 220, width: 140 },
  { x: 2800, y: 180, width: 100 },
  { x: 3100, y: 320, width: 120 },
  { x: 3400, y: 260, width: 100 },
  { x: 3700, y: 200, width: 120 },
  { x: 4000, y: 300, width: 80 },
  { x: 4200, y: 250, width: 120 },
  { x: 4500, y: 180, width: 100 },
  { x: 4700, y: 320, width: 80 },
  { x: 5000, y: 220, width: 140 },
  { x: 5300, y: 180, width: 100 },
  { x: 5600, y: 320, width: 120 },
  { x: 5900, y: 260, width: 100 },
  { x: 6200, y: 200, width: 120 },
  { x: 6500, y: 300, width: 80 },
  { x: 6700, y: 250, width: 120 },
  { x: 6900, y: 180, width: 100 },
  { x: 7100, y: 320, width: 120 },
  { x: 7400, y: 260, width: 100 },
  { x: 7700, y: 200, width: 120 },
  { x: 8000, y: 300, width: 80 },
  { x: 8200, y: 250, width: 120 },
  { x: 8500, y: 180, width: 100 },
  { x: 8700, y: 320, width: 80 },
  { x: 9000, y: 220, width: 140 },
  { x: 9300, y: 180, width: 100 },
  { x: 9600, y: 320, width: 120 },
  { x: 9900, y: 260, width: 100 },
  { x: 10200, y: 200, width: 120 },
  { x: 10500, y: 300, width: 80 },
  { x: 10700, y: 250, width: 120 },
];

const ENEMIES = [
  { x: 320, y: GROUND_Y - ENEMY_SIZE, dir: 1 },
  { x: 650, y: GROUND_Y - ENEMY_SIZE, dir: -1 },
  { x: 950, y: GROUND_Y - ENEMY_SIZE, dir: 1 },
  { x: 1250, y: 180 - ENEMY_SIZE, dir: -1 },
  { x: 1450, y: 320 - ENEMY_SIZE, dir: 1 },
  { x: 1750, y: 260 - ENEMY_SIZE, dir: -1 },
  { x: 2100, y: GROUND_Y - ENEMY_SIZE, dir: 1 },
  { x: 2550, y: 220 - ENEMY_SIZE, dir: -1 },
  { x: 2850, y: 180 - ENEMY_SIZE, dir: 1 },
  { x: 3150, y: 320 - ENEMY_SIZE, dir: -1 },
  { x: 3450, y: 260 - ENEMY_SIZE, dir: 1 },
  { x: 3750, y: 200 - ENEMY_SIZE, dir: -1 },
  { x: 4100, y: GROUND_Y - ENEMY_SIZE, dir: 1 },
  { x: 4250, y: 250 - ENEMY_SIZE, dir: -1 },
  { x: 4550, y: 180 - ENEMY_SIZE, dir: 1 },
  { x: 4750, y: 320 - ENEMY_SIZE, dir: -1 },
  { x: 800, y: 300 - ENEMY_SIZE, dir: 1 },
  { x: 1600, y: 320 - ENEMY_SIZE, dir: -1 },
  { x: 2200, y: 200 - ENEMY_SIZE, dir: 1 },
  { x: 3600, y: 320 - ENEMY_SIZE, dir: -1 },
  { x: 4800, y: 320 - ENEMY_SIZE, dir: 1 },
  { x: 7000, y: 180 - ENEMY_SIZE, dir: 1 },
  { x: 7200, y: 320 - ENEMY_SIZE, dir: -1 },
  { x: 7500, y: 260 - ENEMY_SIZE, dir: 1 },
  { x: 7800, y: 200 - ENEMY_SIZE, dir: -1 },
  { x: 8100, y: 300 - ENEMY_SIZE, dir: 1 },
  { x: 8300, y: 250 - ENEMY_SIZE, dir: -1 },
  { x: 8600, y: 180 - ENEMY_SIZE, dir: 1 },
  { x: 8800, y: 320 - ENEMY_SIZE, dir: -1 },
  { x: 9100, y: 220 - ENEMY_SIZE, dir: 1 },
  { x: 9400, y: 180 - ENEMY_SIZE, dir: -1 },
  { x: 9700, y: 320 - ENEMY_SIZE, dir: 1 },
  { x: 10000, y: 260 - ENEMY_SIZE, dir: -1 },
  { x: 10300, y: 200 - ENEMY_SIZE, dir: 1 },
  { x: 10600, y: 300 - ENEMY_SIZE, dir: -1 },
  { x: 10800, y: 250 - ENEMY_SIZE, dir: 1 },
];

const COINS = [
  { x: 200, y: 220 },
  { x: 430, y: 160 },
  { x: 620, y: 260 },
  { x: 950, y: 210 },
  { x: 1230, y: 140 },
  { x: 1450, y: 280 },
  { x: 1750, y: 220 },
  { x: 2000, y: 160 },
  { x: 2250, y: 260 },
  { x: 2550, y: 180 },
  { x: 2850, y: 140 },
  { x: 3150, y: 280 },
  { x: 3450, y: 220 },
  { x: 3750, y: 180 },
  { x: 4000, y: 260 },
  { x: 4250, y: 210 },
  { x: 4550, y: 140 },
  { x: 4750, y: 280 },
  { x: 4900, y: 220 },
  { x: 4950, y: 160 },
  { x: 7100, y: 320 },
  { x: 7200, y: 260 },
  { x: 7300, y: 200 },
  { x: 7400, y: 180 },
  { x: 7500, y: 320 },
  { x: 7600, y: 250 },
  { x: 7700, y: 220 },
  { x: 7800, y: 180 },
  { x: 7900, y: 320 },
  { x: 8000, y: 260 },
  { x: 8100, y: 200 },
  { x: 8200, y: 180 },
  { x: 8300, y: 320 },
  { x: 8400, y: 250 },
  { x: 8500, y: 220 },
  { x: 8600, y: 180 },
  { x: 8700, y: 320 },
  { x: 8800, y: 260 },
  { x: 8900, y: 200 },
  { x: 9000, y: 180 },
  { x: 9100, y: 320 },
  { x: 9200, y: 250 },
  { x: 9300, y: 220 },
  { x: 9400, y: 180 },
  { x: 9500, y: 320 },
  { x: 9600, y: 260 },
  { x: 9700, y: 200 },
  { x: 9800, y: 180 },
  { x: 9900, y: 320 },
  { x: 10000, y: 250 },
  { x: 10100, y: 220 },
  { x: 10200, y: 180 },
  { x: 10300, y: 320 },
  { x: 10400, y: 260 },
  { x: 10500, y: 200 },
  { x: 10600, y: 180 },
  { x: 10700, y: 320 },
  { x: 10800, y: 250 },
];

// Falling rocks
const ROCK_EMOJI = '🪨';
const ROCK_SIZE = 32;
const ROCK_SPAWN_INTERVAL = 1200;
const ROCK_FALL_SPEED = 3.2;

function rectsCollide(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function SubmitScoreButton({ score }) {
  const { account, signAndExecuteTransactionBlock } = useWallet();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitScore = async () => {
    if (!account?.address) {
      alert('Please connect your Sui wallet first!');
      return;
    }
    setSubmitting(true);
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
    setSubmitting(false);
  };

  return (
    <button onClick={handleSubmitScore} disabled={submitting} style={{ marginTop: 10 }}>
      {submitting ? 'Submitting...' : 'Submit Score On-Chain'}
    </button>
  );
}

export default function MarioPlatformerGame() {
  const [player, setPlayer] = useState({ x: 60, y: GROUND_Y - PLAYER_SIZE, vx: 0, vy: 0, onGround: false, facing: 'right' });
  const [prevPlayer, setPrevPlayer] = useState({ x: 60, y: GROUND_Y - PLAYER_SIZE });
  const [enemies, setEnemies] = useState(JSON.parse(JSON.stringify(ENEMIES)));
  const [coins, setCoins] = useState(JSON.parse(JSON.stringify(COINS)));
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const keys = useRef({});
  const gameRef = useRef();
  const lastTime = useRef(0);
  const [attacking, setAttacking] = useState(false);
  const slashAudioRef = useRef(null);
  const [largeScreen, setLargeScreen] = useState(false);
  const GAME_WIDTH = largeScreen ? 1440 : 800;
  const GAME_HEIGHT = largeScreen ? 720 : 400;

  // Camera logic
  const cameraX = Math.max(0, Math.min(player.x + PLAYER_SIZE / 2 - GAME_WIDTH / 2, LEVEL_WIDTH - GAME_WIDTH));

  // Keyboard controls
  useEffect(() => {
    const handleDown = (e) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyD' && keys.current['KeyD']) {
        keys.current['KeyD_run'] = true;
      }
    };
    const handleUp = (e) => {
      keys.current[e.code] = false;
      if (e.code === 'KeyD') {
        keys.current['KeyD_run'] = false;
      }
    };
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  // Add rock state
  const [rocks, setRocks] = useState([]);
  const rocksRef = useRef([]);

  // Rock spawn effect
  useEffect(() => {
    if (gameOver || win) return;
    const interval = setInterval(() => {
      const rx = Math.random() * (LEVEL_WIDTH - ROCK_SIZE);
      rocksRef.current = [
        ...rocksRef.current,
        { x: rx, y: -ROCK_SIZE, vy: ROCK_FALL_SPEED + Math.random() * 1.5 }
      ];
      setRocks([...rocksRef.current]);
    }, ROCK_SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [gameOver, win]);

  // Main game loop (animation frame)
  useEffect(() => {
    if (gameOver || win) return;
    let anim;
    function loop(currentTime) {
      if (currentTime - lastTime.current < 1000 / FPS) {
        anim = requestAnimationFrame(loop);
        return;
      }
      lastTime.current = currentTime;

      setPrevPlayer(player); // Save previous player position for stomp logic

      setPlayer((prev) => {
        let { x, y, vx, vy, onGround, facing } = prev;
        let run = keys.current['ShiftLeft'] || keys.current['ShiftRight'] || (keys.current['KeyD'] && keys.current['KeyD_run']);
        let moveSpeed = run ? MOVE_SPEED * 1.7 : MOVE_SPEED;
        if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
          vx = -moveSpeed;
          facing = 'left';
        } else if (keys.current['ArrowRight'] || keys.current['KeyD']) {
          vx = moveSpeed;
          facing = 'right';
        } else {
          vx = 0;
        }
        if ((keys.current['ArrowUp'] || keys.current['Space'] || keys.current['KeyW']) && onGround) {
          vy = JUMP_VELOCITY;
          onGround = false;
        }
        vy += GRAVITY;
        let nextX = x + vx;
        let nextY = y + vy;
        let nextOnGround = false;
        for (const plat of LEVEL) {
          if (
            nextX + PLAYER_SIZE > plat.x &&
            nextX < plat.x + plat.width &&
            y + PLAYER_SIZE <= plat.y &&
            nextY + PLAYER_SIZE >= plat.y
          ) {
            nextY = plat.y - PLAYER_SIZE;
            vy = 0;
            nextOnGround = true;
          }
        }
        if (nextX < 0) nextX = 0;
        if (nextX > LEVEL_WIDTH - PLAYER_SIZE) nextX = LEVEL_WIDTH - PLAYER_SIZE;
        if (nextY > GROUND_Y - PLAYER_SIZE) {
          nextY = GROUND_Y - PLAYER_SIZE;
          vy = 0;
          nextOnGround = true;
        }
        return { x: nextX, y: nextY, vx, vy, onGround: nextOnGround, facing };
      });
      // Enemies move
      setEnemies((prev) =>
        prev.map((e) => {
          let plat = LEVEL.find(
            (p) =>
              e.x + ENEMY_SIZE / 2 >= p.x &&
              e.x + ENEMY_SIZE / 2 <= p.x + p.width &&
              e.y + ENEMY_SIZE === p.y
          );
          if (!plat) {
            return { ...e, y: Math.min(e.y + GRAVITY * 4, GROUND_Y - ENEMY_SIZE) };
          }
          let nextX = e.x + e.dir * 0.8;
          let atEdge =
            nextX < plat.x ||
            nextX + ENEMY_SIZE > plat.x + plat.width;
          if (atEdge) {
            return { ...e, dir: -e.dir };
          }
          return { ...e, x: nextX };
        })
      );

      // --- Rock movement and collision ---
      // Move rocks
      rocksRef.current = rocksRef.current.map(rock => ({ ...rock, y: rock.y + rock.vy }));
      // Remove off-screen rocks
      rocksRef.current = rocksRef.current.filter(rock => rock.y < GAME_HEIGHT);
      setRocks([...rocksRef.current]);
      // Rock collision
      rocksRef.current.forEach(rock => {
        const overlap =
          player.x < rock.x + ROCK_SIZE &&
          player.x + PLAYER_SIZE > rock.x &&
          player.y < rock.y + ROCK_SIZE &&
          player.y + PLAYER_SIZE > rock.y;
        if (overlap) {
          setLives(l => l - 1);
          setPlayer(p => ({ ...p, x: 60, y: GROUND_Y - PLAYER_SIZE, vy: 0 }));
        }
      });

      // --- Collision checks every frame ---
      // Coin collection
      setCoins((currentCoins) => {
        let collected = false;
        const newCoins = currentCoins.filter((coin) => {
          // AABB collision
          const overlap =
            player.x < coin.x + COIN_SIZE &&
            player.x + PLAYER_SIZE > coin.x &&
            player.y < coin.y + COIN_SIZE &&
            player.y + PLAYER_SIZE > coin.y;
          if (overlap) {
            collected = true;
            return false;
          }
          return true;
        });
        if (collected) setScore((s) => s + 10);
        return newCoins;
      });
      // Enemy collision
      setEnemies((currentEnemies) => {
        let hit = false;
        let stompedIdx = -1;
        currentEnemies.forEach((enemy, idx) => {
          // AABB collision
          const overlap =
            player.x < enemy.x + ENEMY_SIZE &&
            player.x + PLAYER_SIZE > enemy.x &&
            player.y < enemy.y + ENEMY_SIZE &&
            player.y + PLAYER_SIZE > enemy.y;
          if (overlap) {
            // Stomp check: previous bottom above enemy top, and moving down
            const prevBottom = prevPlayer.y + PLAYER_SIZE;
            const enemyTop = enemy.y;
            if (player.vy > 0 && prevBottom <= enemyTop + 4) {
              stompedIdx = idx;
            } else {
              hit = true;
            }
          }
        });
        if (stompedIdx !== -1) {
          setPlayer((p) => ({ ...p, vy: JUMP_VELOCITY / 1.5 }));
          return currentEnemies.filter((_, i) => i !== stompedIdx);
        }
        if (hit) {
          setLives((l) => l - 1);
          setPlayer((p) => ({ ...p, x: 60, y: GROUND_Y - PLAYER_SIZE, vy: 0 }));
        }
        return currentEnemies;
      });

      // If attacking, remove any enemy in front of the player
      setEnemies((currentEnemies) => {
        if (!attacking) return currentEnemies;
        return currentEnemies.filter((enemy) => {
          // Only check in facing direction
          if (player.facing === 'right') {
            const inFront =
              enemy.x > player.x + PLAYER_SIZE * 0.7 &&
              enemy.x < player.x + PLAYER_SIZE * 1.2 &&
              Math.abs(enemy.y - player.y) < PLAYER_SIZE * 0.7;
            return !inFront;
          } else {
            const inFront =
              enemy.x + ENEMY_SIZE < player.x + PLAYER_SIZE * 0.3 &&
              enemy.x + ENEMY_SIZE > player.x - PLAYER_SIZE * 0.2 &&
              Math.abs(enemy.y - player.y) < PLAYER_SIZE * 0.7;
            return !inFront;
          }
        });
      });

      anim = requestAnimationFrame(loop);
    }
    anim = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(anim);
  }, [player, prevPlayer, gameOver, win]);

  useEffect(() => {
    if (coins.length === 0) setWin(true);
    if (lives <= 0) setGameOver(true);
  }, [coins.length, lives]);

  function handleRestart() {
    setPlayer({ x: 60, y: GROUND_Y - PLAYER_SIZE, vx: 0, vy: 0, onGround: false, facing: 'right' });
    setEnemies(JSON.parse(JSON.stringify(ENEMIES)));
    setCoins(JSON.parse(JSON.stringify(COINS)));
    setScore(0);
    setLives(INITIAL_LIVES);
    setGameOver(false);
    setWin(false);
    rocksRef.current = [];
    setRocks([]);
  }

  // Choose sprite based on facing
  const playerSprite = player.facing === 'left' ? '/fire-left-facing.png' : '/fire-right-facing.png';

  // Attack handler
  function handleAttack() {
    if (attacking) return;
    setAttacking(true);
    if (slashAudioRef.current) {
      slashAudioRef.current.currentTime = 0;
      slashAudioRef.current.play();
    }
    setTimeout(() => setAttacking(false), 200);
  }

  // Keyboard shortcut for attack (F)
  useEffect(() => {
    function onKeyDown(e) {
      if (e.code === 'KeyF') handleAttack();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [attacking]);

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <audio ref={slashAudioRef} src="/slash.ogg" preload="auto" />
      <div
        ref={gameRef}
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          background: '#000',
          border: '3px solid #222',
          borderRadius: 16,
          margin: '32px 0',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 4px 24px #0002',
          display: 'block',
        }}
        tabIndex={0}
      >
        {/* Camera-scrolling game world */}
        <div
          style={{
            width: LEVEL_WIDTH,
            height: GAME_HEIGHT,
            position: 'absolute',
            left: -cameraX,
            top: 0,
            transition: 'left 0.1s linear',
            backgroundImage: "url('https://i.postimg.cc/3xT81zhc/Chat-GPT-Image-Jul-2-2025-06-44-16-PM.png')",
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'center',
            backgroundSize: 'auto 100%',
          }}
        >
          {/* Platforms */}
          {LEVEL.map((plat, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: plat.x,
                top: plat.y,
                width: plat.width,
                height: PLATFORM_HEIGHT,
                background: '#3a6ea5',
                border: '2px solid #111',
                borderRadius: 8,
              }}
            />
          ))}
          {/* Coins */}
          {coins.map((coin, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: coin.x,
                top: coin.y,
                width: COIN_SIZE,
                height: COIN_SIZE,
                fontSize: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
              }}
            >
              🪙
            </div>
          ))}
          {/* Player */}
          <div
            style={{
              position: 'absolute',
              left: player.x,
              top: player.y,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              backgroundImage: `url(${playerSprite})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              userSelect: 'none',
              zIndex: 2,
            }}
          >
            {/* Swosh visual when attacking */}
            {attacking && (
              <span
                style={{
                  position: 'absolute',
                  left: player.facing === 'right' ? PLAYER_SIZE * 0.7 : -PLAYER_SIZE * 0.7,
                  top: PLAYER_SIZE * 0.2,
                  fontSize: 32,
                  color: '#ff4500',
                  filter: 'drop-shadow(0 0 8px #ffb300)',
                  pointerEvents: 'none',
                  zIndex: 3,
                  transition: 'left 0.1s',
                }}
              >
                🔥
              </span>
            )}
          </div>
          {/* Enemies */}
          {enemies.map((enemy, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: enemy.x,
                top: enemy.y,
                width: ENEMY_SIZE,
                height: ENEMY_SIZE,
                backgroundImage: `url(${enemy.dir > 0 ? 'https://i.postimg.cc/c4m3Q7yw/Chat-GPT-Image-Jul-2-2025-07-49-15-PM.png' : 'https://i.postimg.cc/0NpPwfhq/Chat-GPT-Image-Jul-2-2025-07-56-13-PM.png'})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                userSelect: 'none',
                zIndex: 2,
              }}
            />
          ))}
          {/* Rocks */}
          {rocks.map((rock, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: rock.x,
                top: rock.y,
                width: ROCK_SIZE,
                height: ROCK_SIZE,
                fontSize: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                userSelect: 'none',
                zIndex: 2,
              }}
            >
              {ROCK_EMOJI}
            </div>
          ))}
        </div>
        {/* HUD (fixed to screen) */}
        <div style={{
          position: 'absolute',
          top: 12,
          left: 24,
          right: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 20,
          fontWeight: 'bold',
          color: '#222',
          background: '#fff8',
          borderRadius: 8,
          padding: '8px 16px',
          zIndex: 10
        }}>
          <div>
            <span style={{ marginRight: 24 }}>Score: {score}</span>
            <span>Lives: {'❤️'.repeat(lives)}</span>
          </div>
          <button
            style={{
              fontSize: 16,
              padding: '6px 16px',
              borderRadius: 8,
              border: '2px solid #333',
              background: '#fafad2',
              cursor: 'pointer',
              fontWeight: 'bold',
              color: '#111',
            }}
            onClick={handleRestart}
          >
            Restart
          </button>
        </div>
        {/* Game Over / Win */}
        {(gameOver || win) && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: '#fff9',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 'bold',
              zIndex: 20,
            }}
          >
            {win ? '🎉 You Win! 🎉' : 'Game Over'}
            <button
              style={{
                marginTop: 24,
                fontSize: 22,
                padding: '10px 32px',
                borderRadius: 12,
                border: '2px solid #333',
                background: '#fafad2',
                cursor: 'pointer',
                fontWeight: 'bold',
                color: '#111',
              }}
              onClick={handleRestart}
            >
              Restart
            </button>
            <SubmitScoreButton score={score} />
          </div>
        )}
        {/* Controls hint (fixed to screen) */}
        <div style={{
          position: 'absolute',
          bottom: 8,
          left: 0,
          width: '100%',
          textAlign: 'center',
          fontSize: 16,
          color: '#fff',
          zIndex: 10
        }}>
          Controls: ← → to move, ↑/W/Space to jump, F = fire
        </div>
      </div>
    </div>
  );
} 