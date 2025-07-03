import React, { useRef, useEffect, useState } from 'react';

const PLAYER_EMOJI = "🥷";
const CANVAS_W = 400;
const CANVAS_H = 360;
const PLAYER_STEP = 32;
const PLAYER_Y = CANVAS_H - 40;
const SPOTLIGHT_WIDTH = 40; // much narrower
const SPOTLIGHT_SPEED = 0.6; // much slower

export default function StealthNinjaGame() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [playerX, setPlayerX] = useState(CANVAS_W / 2);
  const spotlightRef = useRef({
    x: 0, // will be set to start away from player
    dir: 1,
    speed: SPOTLIGHT_SPEED
  });
  const animationRef = useRef();
  const [countdown, setCountdown] = useState(2);
  const [showInstructions, setShowInstructions] = useState(true);

  // Responsive canvas
  const [dimensions, setDimensions] = useState({
    width: Math.min(window.innerWidth - 32, CANVAS_W),
    height: CANVAS_H
  });
  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: Math.min(window.innerWidth - 32, CANVAS_W),
        height: CANVAS_H
      });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Start spotlight away from player
  useEffect(() => {
    let startX = Math.random() * (dimensions.width - SPOTLIGHT_WIDTH);
    // Ensure spotlight doesn't start on player
    if (Math.abs(startX + SPOTLIGHT_WIDTH / 2 - playerX) < 80) {
      startX = (playerX < dimensions.width / 2)
        ? dimensions.width - SPOTLIGHT_WIDTH - 10
        : 10;
    }
    spotlightRef.current = {
      x: startX,
      dir: Math.random() > 0.5 ? 1 : -1,
      speed: SPOTLIGHT_SPEED
    };
  }, [dimensions, playerX]);

  // Countdown before game starts
  useEffect(() => {
    if (!showInstructions && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0 && !running && !gameOver) {
      setRunning(true);
    }
  }, [countdown, running, showInstructions, gameOver]);

  // Game loop
  useEffect(() => {
    if (!running) return;
    let lastScoreTime = Date.now();
    function gameLoop() {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Move spotlight
      let s = spotlightRef.current;
      s.x += s.dir * s.speed;
      if (s.x < 0) {
        s.x = 0;
        s.dir = 1;
      }
      if (s.x > dimensions.width - SPOTLIGHT_WIDTH) {
        s.x = dimensions.width - SPOTLIGHT_WIDTH;
        s.dir = -1;
      }

      // Draw cone of light
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(s.x, 0);
      ctx.lineTo(s.x + SPOTLIGHT_WIDTH, 0);
      ctx.lineTo(s.x + SPOTLIGHT_WIDTH / 2 + 40, dimensions.height);
      ctx.lineTo(s.x + SPOTLIGHT_WIDTH / 2 - 40, dimensions.height);
      ctx.closePath();
      ctx.fillStyle = "#ffff99";
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();

      // Draw player
      ctx.font = "2.5em serif";
      ctx.save();
      ctx.translate(playerX, PLAYER_Y);
      ctx.fillText(PLAYER_EMOJI, 0, 0);
      ctx.restore();

      // Draw player boundary
      ctx.save();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.strokeRect(20, PLAYER_Y - 30, dimensions.width - 40, 50);
      ctx.restore();

      // Collision detection: is player in the spotlight?
      let px = playerX;
      // Even more forgiving hitbox
      if (
        px > s.x + 15 &&
        px < s.x + SPOTLIGHT_WIDTH - 15
      ) {
        setGameOver(true);
        setRunning(false);
      }

      // Score increases every second
      if (Date.now() - lastScoreTime > 1000 && running) {
        setScore(s => s + 1);
        lastScoreTime = Date.now();
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    }
    gameLoop();
    return () => cancelAnimationFrame(animationRef.current);
    // eslint-disable-next-line
  }, [running, dimensions, playerX, score]);

  // Keyboard and mobile controls
  useEffect(() => {
    function handleKey(e) {
      if (!running) return;
      if (e.code === "ArrowLeft" || e.key === "a" || e.key === "A") {
        setPlayerX(x => Math.max(30, x - PLAYER_STEP));
      }
      if (e.code === "ArrowRight" || e.key === "d" || e.key === "D") {
        setPlayerX(x => Math.min(dimensions.width - 30, x + PLAYER_STEP));
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line
  }, [running, dimensions]);

  // On-screen mobile controls
  function moveLeft() {
    setPlayerX(x => Math.max(30, x - PLAYER_STEP));
  }
  function moveRight() {
    setPlayerX(x => Math.min(dimensions.width - 30, x + PLAYER_STEP));
  }

  function startGame() {
    setShowInstructions(false);
    setCountdown(2);
    setScore(0);
    setGameOver(false);
    setPlayerX(dimensions.width / 2);
    let startX = Math.random() * (dimensions.width - SPOTLIGHT_WIDTH);
    if (Math.abs(startX + SPOTLIGHT_WIDTH / 2 - playerX) < 80) {
      startX = (playerX < dimensions.width / 2)
        ? dimensions.width - SPOTLIGHT_WIDTH - 10
        : 10;
    }
    spotlightRef.current = {
      x: startX,
      dir: Math.random() > 0.5 ? 1 : -1,
      speed: SPOTLIGHT_SPEED
    };
  }

  function restart() {
    setCountdown(2);
    setScore(0);
    setGameOver(false);
    setPlayerX(dimensions.width / 2);
    let startX = Math.random() * (dimensions.width - SPOTLIGHT_WIDTH);
    if (Math.abs(startX + SPOTLIGHT_WIDTH / 2 - playerX) < 80) {
      startX = (playerX < dimensions.width / 2)
        ? dimensions.width - SPOTLIGHT_WIDTH - 10
        : 10;
    }
    spotlightRef.current = {
      x: startX,
      dir: Math.random() > 0.5 ? 1 : -1,
      speed: SPOTLIGHT_SPEED
    };
    setRunning(false);
    setShowInstructions(false);
  }

  return (
    <div className="game-area" style={{textAlign: "center"}}>
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          border: '2px solid #333',
          background: '#222',
          borderRadius: 10,
          touchAction: 'none',
          maxWidth: '100vw',
          display: 'block',
          margin: '0 auto'
        }}
      />
      <div className="score" style={{fontSize: "1.2em", marginTop: 10, color: "#fff"}}>
        Score: {score}
      </div>
      <div style={{margin: "10px 0"}}>
        <button onClick={moveLeft} style={{marginRight: 8}}>⬅️</button>
        <button onClick={moveRight}>➡️</button>
      </div>
      {(showInstructions || gameOver) && (
        <div style={{color: "#fff", fontWeight: "bold", fontSize: "1.1em", margin: "16px 0"}}>
          <div>Stay out of the light!</div>
          <div>Use arrow keys, A/D, or the buttons to move.</div>
          <div>Survive as long as you can.</div>
        </div>
      )}
      {!showInstructions && countdown > 0 && (
        <div style={{color: "#fff", fontWeight: "bold", fontSize: "2em", margin: "16px 0"}}>
          Get Ready! {countdown}
        </div>
      )}
      {gameOver && (
        <div style={{color: "#ffeb3b", fontWeight: "bold", fontSize: "1.3em", margin: "10px 0"}}>
          You were caught in the light!<br />Game Over!
        </div>
      )}
      {gameOver && (
        <button onClick={restart} style={{marginTop: 10}}>Restart</button>
      )}
      <div style={{fontSize: "0.9em", color: "#fff", marginTop: 6}}>
        Controls: Arrow keys or A/D to move
      </div>
    </div>
  );
}