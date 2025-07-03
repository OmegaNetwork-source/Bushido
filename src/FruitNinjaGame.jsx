import React, { useRef, useEffect, useState } from 'react';

const FRUITS = [
  { emoji: '🍉', color: '#e74c3c' },
  { emoji: '🍌', color: '#f1c40f' },
  { emoji: '🍎', color: '#c0392b' },
  { emoji: '🍓', color: '#e84393' },
  { emoji: '🍊', color: '#f39c12' },
  { emoji: '🍍', color: '#f7ca18' },
  { emoji: '🥝', color: '#27ae60' },
  { emoji: '🍒', color: '#c0392b' }
];

const SWORD_EMOJI = '⚔️';
const MAX_WIDTH = 400;
const MAX_HEIGHT = 500;

function randomFruit(width) {
  return {
    ...FRUITS[Math.floor(Math.random() * FRUITS.length)],
    x: Math.random() * (width - 60) + 30
  };
}

export default function FruitNinjaGame() {
  const canvasRef = useRef(null);
  const fruitsRef = useRef([]);
  const effectsRef = useRef([]);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);
  const [dimensions, setDimensions] = useState({
    width: Math.min(window.innerWidth - 32, MAX_WIDTH),
    height: Math.min(window.innerHeight * 0.7, MAX_HEIGHT)
  });
  const slicingRef = useRef(false);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);

  // Responsive canvas
  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: Math.min(window.innerWidth - 32, MAX_WIDTH),
        height: Math.min(window.innerHeight * 0.7, MAX_HEIGHT)
      });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add new fruit every 1.2s, much slower drop
  useEffect(() => {
    if (!running) return;
    if (!canvasRef.current) return;
    
    const interval = setInterval(() => {
      const fruit = randomFruit(dimensions.width);
      fruitsRef.current.push({
        x: fruit.x,
        y: -30,
        vy: 0.7 + Math.random() * 0.7 * (dimensions.height / MAX_HEIGHT),
        emoji: fruit.emoji,
        color: fruit.color,
        sliced: false,
        cutFrame: 0 // for animation
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [running, dimensions]);

  // Animate fruits and effects
  useEffect(() => {
    if (!running) return;
    if (!canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    let animation;
    function draw() {
      if (gameOver) return;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Move fruits
      for (let i = fruitsRef.current.length - 1; i >= 0; i--) {
        const fruit = fruitsRef.current[i];
        fruit.y += fruit.vy;
        if (!fruit.sliced && fruit.y > dimensions.height) {
          setLives(l => Math.max(0, l - 1));
          fruitsRef.current.splice(i, 1);
        }
      }

      // Remove off-screen or fully animated fruits
      fruitsRef.current = fruitsRef.current.filter(fruit =>
        fruit.y < dimensions.height && (fruit.cutFrame === 0 || fruit.cutFrame < 12)
      );

      // Draw fruits
      fruitsRef.current.forEach(fruit => {
        if (!fruit.sliced) {
          // Draw fruit emoji
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(fruit.emoji, fruit.x, fruit.y);
        } else {
          // Draw cut animation: halves move apart and fade out
          fruit.cutFrame++;
          ctx.globalAlpha = 1 - fruit.cutFrame / 12;
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(fruit.emoji, fruit.x - fruit.cutFrame * 2, fruit.y);
          ctx.fillText(fruit.emoji, fruit.x + fruit.cutFrame * 2, fruit.y);
          ctx.globalAlpha = 1;
        }
      });

      // Draw and update effects (optional: juice splash)
      effectsRef.current = effectsRef.current.filter(effect => {
        effect.life -= 1;
        if (effect.life > 0) {
          ctx.globalAlpha = effect.life / 10;
          ctx.font = '36px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💦', effect.x, effect.y);
          return true;
        }
        return false;
      });

      animation = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animation);
  }, [running, dimensions, gameOver]);

  // Helper: slice at a given x/y
  function sliceAt(x, y) {
    let sliced = false;
    fruitsRef.current.forEach(fruit => {
      const dx = x - fruit.x;
      const dy = y - fruit.y;
      // Even larger, more forgiving hitbox (true circle, radius 60)
      if (!fruit.sliced && Math.sqrt(dx * dx + dy * dy) < 60 * (dimensions.width / MAX_WIDTH)) {
        fruit.sliced = true;
        fruit.cutFrame = 1;
        sliced = true;
        // Add juice splash effect
        effectsRef.current.push({
          x: fruit.x,
          y: fruit.y,
          color: fruit.color,
          life: 10
        });
        // Vibration feedback
        if (window.navigator.vibrate) {
          window.navigator.vibrate(30);
        }
      }
    });
    if (sliced) setScore(score => score + 1);
  }

  // Mouse/touch event handlers for "swipe" slicing
  function handlePointerDown(e) {
    slicingRef.current = true;
    handlePointerMove(e);
  }
  function handlePointerUp() {
    slicingRef.current = false;
  }
  function handlePointerMove(e) {
    if (!slicingRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let x, y;
    if (e.touches && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else if (e.clientX !== undefined) {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    if (x !== undefined && y !== undefined) {
      sliceAt(x, y);
    }
    // Prevent scrolling on touch
    if (e.cancelable) e.preventDefault();
  }

  // Fullscreen support
  function goFullscreen() {
    const canvas = canvasRef.current;
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  }

  function restart() {
    setScore(0);
    setLives(3);
    setGameOver(false);
    fruitsRef.current = [];
    effectsRef.current = [];
    setRunning(true);
  }

  // End the game if lives reach zero
  useEffect(() => {
    if (lives <= 0 && !gameOver) {
      setGameOver(true);
      setRunning(false);
    }
  }, [lives, gameOver]);

  console.log('FruitNinjaGame rendering, dimensions:', dimensions, 'running:', running, 'gameOver:', gameOver);
  
  return (
    <div className="game-area">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          border: '2px solid #333',
          background: '#fafad2',
          borderRadius: 10,
          cursor: 'crosshair',
          touchAction: 'none',
          maxWidth: '100vw',
          maxHeight: '80vh',
          display: 'block'
        }}
        onMouseDown={handlePointerDown}
        onMouseUp={handlePointerUp}
        onMouseMove={handlePointerMove}
        onTouchStart={handlePointerDown}
        onTouchEnd={handlePointerUp}
        onTouchMove={handlePointerMove}
      />
      {gameOver && <div className="game-over-msg">Game Over!</div>}
      <div className="fruit-ninja-hud">
        <span>Score: {score}</span>
        <span>Lives: {lives}</span>
      </div>
      {gameOver ? (
        <button className="fruit-ninja-btn" onClick={restart}>Restart</button>
      ) : (
        <>
          <button className="fruit-ninja-btn" onClick={restart}>Restart</button>
          <button className="fruit-ninja-btn" onClick={goFullscreen}>Fullscreen</button>
        </>
      )}
    </div>
  );
}