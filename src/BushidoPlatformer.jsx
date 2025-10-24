import React, { useEffect, useRef, useState } from 'react';
import { useMetaMask } from './MetaMaskContext';
import { ethers } from 'ethers';

const SPRITES = {
  idle: 'https://i.postimg.cc/HrGxtnSp/sprite-1.png',
  running: 'https://i.postimg.cc/zHBL4Qhs/running-sprite.png',
  jumping: 'https://i.postimg.cc/7CKwjZNJ/jump-sprite.png',
  dragon: 'https://i.postimg.cc/sGQnsTdW/dragon.png',
  enemyLeft: 'https://i.postimg.cc/K1HRgfdK/water-left.png',
  enemyRight: 'https://i.postimg.cc/21KVBGPL/water.png'
};

const LEADERBOARD_CONTRACT_ADDRESS = '0x8990bbf7ab7fe6bd146ddc066ca7c88773c1cc9b';
const LEADERBOARD_ABI = [
  {
    "inputs": [{"internalType": "address","name": "player","type": "address"}],
    "name": "recordWin",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "limit","type": "uint256"},{"internalType": "uint256","name": "offset","type": "uint256"}],
    "name": "getLeaderboard",
    "outputs": [{"internalType": "address[]","name": "","type": "address[]"},{"internalType": "uint256[]","name": "","type": "uint256[]"},{"internalType": "uint256[]","name": "","type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function BushidoPlatformer({ onBack }) {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const { account } = useMetaMask();
  const gameStateRef = useRef({
    player: {
      x: 100,
      y: 300,
      width: 40,
      height: 60,
      velocityX: 0,
      velocityY: 0,
      speed: 5,
      jumpPower: 15,
      onGround: false,
      facingRight: true,
      state: 'idle', // idle, running, jumping
      health: 5,
      maxHealth: 5,
      invincible: false,
      invincibleTimer: 0
    },
    camera: {
      x: 0,
      y: 0
    },
    keys: {},
    platforms: (() => {
      const platforms = [
        // Infinite ground - stone path
        { x: 0, y: 550, width: 50000, height: 50, color: '#5a5a5a', type: 'ground' }
      ];
      
      // Generate platforms procedurally every 200-300 pixels
      for (let x = 300; x < 50000; x += Math.random() * 100 + 200) {
        const heights = [250, 300, 350, 400, 450];
        const colors = ['#8B4513', '#D2691E', '#CD853F'];
        platforms.push({
          x: Math.floor(x),
          y: heights[Math.floor(Math.random() * heights.length)],
          width: Math.floor(Math.random() * 80 + 120), // 120-200 width
          height: 20,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: 'wood'
        });
      }
      
      return platforms;
    })(),
    coins: (() => {
      const coins = [];
      // Generate coins every 150-300 pixels
      for (let x = 200; x < 50000; x += Math.random() * 150 + 150) {
        const heights = [200, 250, 300, 350, 400, 480];
        coins.push({
          x: Math.floor(x),
          y: heights[Math.floor(Math.random() * heights.length)],
          collected: false
        });
      }
      return coins;
    })(),
    dragons: [],
    lastDragonSpawn: 0,
    enemies: (() => {
      const enemies = [];
      // Generate enemies every 800-1200 pixels on platforms
      for (let x = 500; x < 50000; x += Math.random() * 400 + 800) {
        const heights = [190, 240, 290];
        const platformWidths = [150, 160, 170, 180, 190, 200];
        const platformWidth = platformWidths[Math.floor(Math.random() * platformWidths.length)];
        enemies.push({
          x: Math.floor(x),
          y: heights[Math.floor(Math.random() * heights.length)],
          width: 40,
          height: 60,
          velocityX: 1,
          direction: 1,
          platformX: Math.floor(x),
          platformWidth: platformWidth
        });
      }
      return enemies;
    })(),
    score: 0,
    sprites: {},
    spritesLoaded: false
  });

  // Load sprites and remove white backgrounds
  useEffect(() => {
    const loadSprites = async () => {
      const sprites = {};
      const promises = Object.keys(SPRITES).map(key => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            // Create a temporary canvas to remove white background
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // Draw sprite to temp canvas
            tempCtx.drawImage(img, 0, 0);
            
            try {
              // Get image data and make white pixels transparent
              const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
              const data = imageData.data;
              
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // If pixel is very light (near white), make it transparent
                if (r > 240 && g > 240 && b > 240) {
                  data[i + 3] = 0; // Set alpha to 0
                }
              }
              
              tempCtx.putImageData(imageData, 0, 0);
            } catch (e) {
              console.warn('Could not process sprite for transparency:', e);
            }
            
            sprites[key] = tempCanvas;
            resolve();
          };
          img.onerror = () => {
            console.error(`Failed to load sprite: ${key}`);
            resolve();
          };
          img.crossOrigin = 'anonymous'; // Enable CORS for image processing
          img.src = SPRITES[key];
        });
      });

      await Promise.all(promises);
      gameStateRef.current.sprites = sprites;
      gameStateRef.current.spritesLoaded = true;
    };

    loadSprites();
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const gameState = gameStateRef.current;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Keyboard controls
    const handleKeyDown = (e) => {
      gameState.keys[e.key] = true;
      // Prevent default for arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      gameState.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop
    let animationId;
    let lastTime = 0;

    const gameLoop = (timestamp) => {
      const deltaTime = (timestamp - lastTime) / 16.67; // Normalize to 60fps
      lastTime = timestamp;

      const player = gameState.player;
      const camera = gameState.camera;

      // Draw anime-style Japanese sky (sunset gradient)
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#FFB6C1'); // Pink
      gradient.addColorStop(0.3, '#FFA07A'); // Light salmon
      gradient.addColorStop(0.6, '#FFD700'); // Gold
      gradient.addColorStop(1, '#FF8C69'); // Coral
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Mount Fuji-style mountains in background (repeating)
      ctx.save();
      ctx.translate(-camera.x * 0.3, 0);
      
      for (let mountainX = 0; mountainX < 60000; mountainX += 1500) {
        // Far mountain
        ctx.fillStyle = '#4B0082';
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(mountainX + 200, 400);
        ctx.lineTo(mountainX + 400, 200);
        ctx.lineTo(mountainX + 600, 400);
        ctx.closePath();
        ctx.fill();
        
        // Mount Fuji
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#2F4F4F';
        ctx.beginPath();
        ctx.moveTo(mountainX + 300, 450);
        ctx.lineTo(mountainX + 500, 150);
        ctx.lineTo(mountainX + 700, 450);
        ctx.closePath();
        ctx.fill();
        
        // Snow cap
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.moveTo(mountainX + 450, 200);
        ctx.lineTo(mountainX + 500, 150);
        ctx.lineTo(mountainX + 550, 200);
        ctx.lineTo(mountainX + 540, 220);
        ctx.lineTo(mountainX + 460, 220);
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
      ctx.restore();

      // Draw cherry blossom trees in background (extended throughout level)
      ctx.save();
      ctx.translate(-camera.x * 0.5, 0);
      
      // Generate trees every 300 pixels
      for (let treeX = 100; treeX < 60000; treeX += 300) {
        // Tree trunk
        ctx.fillStyle = '#654321';
        ctx.fillRect(treeX, 400, 20, 150);
        
        // Cherry blossom foliage
        ctx.fillStyle = '#FFB7C5';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(treeX + 10, 380, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(treeX - 20, 400, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(treeX + 40, 400, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      
      ctx.restore();

      // Draw falling cherry blossom petals (more petals for extended level)
      ctx.save();
      ctx.translate(-camera.x * 0.7, 0);
      
      const time = Date.now() / 1000;
      const viewportStart = Math.max(0, camera.x - 200);
      const viewportEnd = camera.x + canvas.width + 200;
      
      // Generate more petals spread across visible area
      for (let i = 0; i < 50; i++) {
        const petalBaseX = (i * 200) % 2000;
        const petalX = viewportStart + ((petalBaseX + Math.sin(time + i) * 50) % (viewportEnd - viewportStart));
        const petalY = ((time * 30 + i * 40) % 600);
        
        ctx.fillStyle = '#FFB7C5';
        ctx.globalAlpha = 0.7;
        ctx.save();
        ctx.translate(petalX, petalY);
        ctx.rotate(time + i);
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      
      ctx.globalAlpha = 1;
      ctx.restore();

      // Handle input
      player.velocityX = 0;
      
      if (gameState.keys['ArrowLeft'] || gameState.keys['a']) {
        player.velocityX = -player.speed;
        player.facingRight = false;
        if (player.onGround) player.state = 'running';
      }
      if (gameState.keys['ArrowRight'] || gameState.keys['d']) {
        player.velocityX = player.speed;
        player.facingRight = true;
        if (player.onGround) player.state = 'running';
      }
      if ((gameState.keys['ArrowUp'] || gameState.keys['w'] || gameState.keys[' ']) && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
        player.state = 'jumping';
      }

      // Apply gravity
      if (!player.onGround) {
        player.velocityY += 0.8 * deltaTime;
        player.state = 'jumping';
      }

      // Update player position
      player.x += player.velocityX * deltaTime;
      player.y += player.velocityY * deltaTime;

      // Check ground collision
      player.onGround = false;
      for (let platform of gameState.platforms) {
        if (
          player.x + player.width > platform.x &&
          player.x < platform.x + platform.width &&
          player.y + player.height >= platform.y &&
          player.y + player.height <= platform.y + platform.height &&
          player.velocityY >= 0
        ) {
          player.y = platform.y - player.height;
          player.velocityY = 0;
          player.onGround = true;
        }
      }

      // Update player state
      if (player.onGround && player.velocityX === 0) {
        player.state = 'idle';
      }

      // Update invincibility timer
      if (player.invincible) {
        player.invincibleTimer -= deltaTime;
        if (player.invincibleTimer <= 0) {
          player.invincible = false;
        }
      }

      // Prevent falling through bottom
      if (player.y > 600) {
        player.y = 300;
        player.x = 100;
        player.velocityY = 0;
      }

      // Spawn dragons randomly
      const currentTime = timestamp / 1000;
      if (currentTime - gameState.lastDragonSpawn > 5) { // Spawn every 5 seconds
        gameState.lastDragonSpawn = currentTime;
        const dragonY = Math.random() * 300 + 100; // Random height between 100-400
        const direction = Math.random() > 0.5 ? 1 : -1; // Random direction
        const startX = direction > 0 ? camera.x - 100 : camera.x + canvas.width + 100;
        
        gameState.dragons.push({
          x: startX,
          y: dragonY,
          width: 80,
          height: 60,
          velocityX: direction * 3,
          direction: direction
        });
      }

      // Update dragons
      for (let i = gameState.dragons.length - 1; i >= 0; i--) {
        const dragon = gameState.dragons[i];
        dragon.x += dragon.velocityX * deltaTime;
        
        // Add slight bobbing motion
        dragon.y += Math.sin(currentTime * 2 + i) * 0.5;
        
        // Check collision with player
        if (!player.invincible &&
            player.x + player.width > dragon.x &&
            player.x < dragon.x + dragon.width &&
            player.y + player.height > dragon.y &&
            player.y < dragon.y + dragon.height) {
          player.health -= 1;
          player.invincible = true;
          player.invincibleTimer = 60; // 1 second of invincibility (60 frames)
          
          if (player.health <= 0) {
            // Game over - stop the game
            setGameOver(true);
            setFinalScore(gameState.score);
            cancelAnimationFrame(animationId);
          }
        }
        
        // Remove dragons that are far off screen
        if (dragon.x < camera.x - 200 || dragon.x > camera.x + canvas.width + 200) {
          gameState.dragons.splice(i, 1);
        }
      }

      // Update ground enemies
      for (let enemy of gameState.enemies) {
        // Move enemy back and forth on platform
        enemy.x += enemy.velocityX * enemy.direction * deltaTime;
        
        // Check if enemy reached platform edge and turn around
        if (enemy.x <= enemy.platformX || enemy.x + enemy.width >= enemy.platformX + enemy.platformWidth) {
          enemy.direction *= -1;
          // Keep enemy within platform bounds
          enemy.x = Math.max(enemy.platformX, Math.min(enemy.x, enemy.platformX + enemy.platformWidth - enemy.width));
        }
        
        // Check collision with player
        if (!player.invincible &&
            player.x + player.width > enemy.x &&
            player.x < enemy.x + enemy.width &&
            player.y + player.height > enemy.y &&
            player.y < enemy.y + enemy.height) {
          player.health -= 1;
          player.invincible = true;
          player.invincibleTimer = 60; // 1 second of invincibility (60 frames)
          
          if (player.health <= 0) {
            // Game over - stop the game
            setGameOver(true);
            setFinalScore(gameState.score);
            cancelAnimationFrame(animationId);
          }
        }
      }

      // Update camera to follow player
      camera.x = player.x - canvas.width / 3;
      camera.x = Math.max(0, camera.x);
      camera.x = Math.min(camera.x, 50000 - canvas.width);

      // Draw platforms with Japanese wood texture
      ctx.save();
      ctx.translate(-camera.x, -camera.y);

      for (let platform of gameState.platforms) {
        if (platform.type === 'ground') {
          // Stone path ground
          ctx.fillStyle = platform.color;
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
          
          // Stone texture
          ctx.strokeStyle = '#404040';
          ctx.lineWidth = 2;
          for (let i = 0; i < platform.width; i += 50) {
            ctx.strokeRect(platform.x + i, platform.y, 50, platform.height);
          }
        } else {
          // Wooden platforms
          ctx.fillStyle = platform.color;
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
          
          // Wood grain texture
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 1;
          for (let i = 0; i < platform.width; i += 15) {
            ctx.beginPath();
            ctx.moveTo(platform.x + i, platform.y);
            ctx.lineTo(platform.x + i, platform.y + platform.height);
            ctx.stroke();
          }
          
          // Wood plank borders
          ctx.strokeStyle = '#654321';
          ctx.lineWidth = 2;
          ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        }
      }
      
      // Draw torii gates throughout the level
      for (let toriiX = 600; toriiX < 50000; toriiX += 800) {
        // Torii gate pillars
        ctx.fillStyle = '#CD5C5C';
        ctx.fillRect(toriiX, 450, 15, 100);
        ctx.fillRect(toriiX + 100, 450, 15, 100);
        
        // Top horizontal beam
        ctx.fillStyle = '#CD5C5C';
        ctx.fillRect(toriiX - 10, 440, 135, 12);
        
        // Second beam
        ctx.fillRect(toriiX + 5, 465, 105, 8);
        
        // Black caps
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(toriiX - 12, 436, 139, 6);
      }

      // Draw and collect Japanese-style coins
      for (let coin of gameState.coins) {
        if (!coin.collected) {
          // Check collision with player
          const coinSize = 20;
          if (
            player.x + player.width > coin.x &&
            player.x < coin.x + coinSize &&
            player.y + player.height > coin.y &&
            player.y < coin.y + coinSize
          ) {
            coin.collected = true;
            gameState.score += 10;
          }

          // Draw Japanese coin (koban style)
          ctx.save();
          const coinCenterX = coin.x + 10;
          const coinCenterY = coin.y + 10;
          
          // Outer gold circle
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(coinCenterX, coinCenterY, 10, 0, Math.PI * 2);
          ctx.fill();
          
          // Orange outline
          ctx.strokeStyle = '#FF8C00';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Square hole in middle (traditional Japanese coin style)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(coinCenterX - 3, coinCenterY - 3, 6, 6);
          
          // Gold shine
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(coinCenterX - 3, coinCenterY - 3, 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Floating animation
          const floatOffset = Math.sin(Date.now() / 300 + coin.x) * 3;
          ctx.restore();
          
          // Draw kanji "円" (yen) on coin
          ctx.save();
          ctx.translate(0, floatOffset);
          ctx.fillStyle = '#8B4513';
          ctx.font = 'bold 10px serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('¥', coinCenterX, coinCenterY);
          ctx.restore();
        }
      }

      // Draw dragons
      if (gameState.spritesLoaded && gameState.sprites.dragon) {
        for (let dragon of gameState.dragons) {
          ctx.save();
          ctx.translate(dragon.x + dragon.width / 2, dragon.y + dragon.height / 2);
          if (dragon.direction > 0) {
            ctx.scale(-1, 1);
          }
          ctx.drawImage(
            gameState.sprites.dragon,
            -dragon.width / 2,
            -dragon.height / 2,
            dragon.width,
            dragon.height
          );
          ctx.restore();
        }
      }

      // Draw ground enemies
      if (gameState.spritesLoaded && gameState.sprites.enemyLeft && gameState.sprites.enemyRight) {
        for (let enemy of gameState.enemies) {
          const enemySprite = enemy.direction > 0 ? gameState.sprites.enemyRight : gameState.sprites.enemyLeft;
          ctx.drawImage(
            enemySprite,
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
          );
        }
      }

      // Draw player (sprites are already processed with transparency)
      if (gameState.spritesLoaded) {
        const sprite = gameState.sprites[player.state] || gameState.sprites.idle;
        
        // Flashing effect when invincible
        if (player.invincible && Math.floor(timestamp / 100) % 2 === 0) {
          ctx.globalAlpha = 0.5;
        }
        
        ctx.save();
        ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        if (!player.facingRight) {
          ctx.scale(-1, 1);
        }
        ctx.drawImage(
          sprite,
          -player.width / 2,
          -player.height / 2,
          player.width,
          player.height
        );
        ctx.restore();
        
        ctx.globalAlpha = 1;
      } else {
        // Fallback rectangle if sprites not loaded
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(player.x, player.y, player.width, player.height);
      }

      ctx.restore();

      // Draw HUD
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 280, 70);
      
      // Draw hearts
      const heartSize = 30;
      for (let i = 0; i < player.maxHealth; i++) {
        const heartX = 20 + i * (heartSize + 8);
        const heartY = 25;
        
        if (i < player.health) {
          // Full heart (red)
          ctx.fillStyle = '#FF6B6B';
        } else {
          // Empty heart (gray)
          ctx.fillStyle = '#555';
        }
        
        // Draw heart shape
        ctx.save();
        ctx.translate(heartX, heartY);
        ctx.beginPath();
        ctx.moveTo(heartSize / 2, heartSize / 4);
        ctx.bezierCurveTo(heartSize / 2, 0, 0, 0, 0, heartSize / 3);
        ctx.bezierCurveTo(0, heartSize / 2, heartSize / 2, heartSize * 0.85, heartSize / 2, heartSize);
        ctx.bezierCurveTo(heartSize / 2, heartSize * 0.85, heartSize, heartSize / 2, heartSize, heartSize / 3);
        ctx.bezierCurveTo(heartSize, 0, heartSize / 2, 0, heartSize / 2, heartSize / 4);
        ctx.fill();
        
        // Heart outline
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }
      
      // Draw score below hearts
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 20px Arial';
      ctx.fillText(`¥${gameState.score}`, 20, 70);

      // Draw controls hint
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(10, canvas.height - 60, 300, 50);
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.fillText('← → or A/D: Move', 20, canvas.height - 35);
      ctx.fillText('↑ or W or Space: Jump', 20, canvas.height - 15);

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted]);

  const handleSubmitScore = async () => {
    if (!account) {
      alert('Please connect your wallet first!');
      return;
    }

    setSubmittingScore(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(LEADERBOARD_CONTRACT_ADDRESS, LEADERBOARD_ABI, signer);
      
      // Record wins based on score (each 100 points = 1 win for the platformer game)
      const wins = Math.floor(finalScore / 100) || 1; // At least 1 win for completing the game
      
      for (let i = 0; i < wins; i++) {
        const tx = await contract.recordWin(account);
        await tx.wait();
      }
      
      setScoreSubmitted(true);
      alert(`Score submitted successfully! ${wins} win(s) recorded on the blockchain! 🎉`);
    } catch (error) {
      console.error('Error submitting score:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setSubmittingScore(false);
    }
  };

  const handleRestart = () => {
    // Reset game state
    const gameState = gameStateRef.current;
    gameState.player.health = gameState.player.maxHealth;
    gameState.player.x = 100;
    gameState.player.y = 300;
    gameState.player.velocityX = 0;
    gameState.player.velocityY = 0;
    gameState.score = 0;
    gameState.camera.x = 0;
    gameState.camera.y = 0;
    
    // Reset coins
    for (let coin of gameState.coins) {
      coin.collected = false;
    }
    
    // Reset dragons
    gameState.dragons = [];
    
    setGameOver(false);
    setFinalScore(0);
    setScoreSubmitted(false);
    setGameStarted(true);
  };

  // Game Over screen
  if (gameOver) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.9)',
          padding: '60px 50px',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '600px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          border: '3px solid #e74c3c'
        }}>
          <h1 style={{
            fontSize: '4em',
            marginBottom: '20px',
            color: '#e74c3c',
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(231, 76, 60, 0.8)'
          }}>💀 GAME OVER 💀</h1>
          
          <div style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            padding: '30px',
            borderRadius: '15px',
            marginBottom: '30px',
            border: '3px solid #FF8C00'
          }}>
            <h2 style={{
              fontSize: '2em',
              color: '#000',
              marginBottom: '10px'
            }}>Final Score</h2>
            <p style={{
              fontSize: '4em',
              color: '#000',
              fontWeight: 'bold',
              margin: 0
            }}>¥{finalScore}</p>
          </div>

          <p style={{
            fontSize: '1.3em',
            color: '#fff',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            You collected <strong style={{ color: '#FFD700' }}>{finalScore}</strong> coins! 🪙
            <br />
            {account ? 'Submit your score to the blockchain leaderboard!' : 'Connect your wallet to submit your score!'}
          </p>

          {account && !scoreSubmitted && (
            <button
              onClick={handleSubmitScore}
              disabled={submittingScore}
              style={{
                width: '100%',
                fontSize: '1.5em',
                padding: '20px',
                background: submittingScore 
                  ? '#95a5a6' 
                  : 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                cursor: submittingScore ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 20px rgba(0, 212, 255, 0.4)',
                marginBottom: '15px',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => !submittingScore && (e.target.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => !submittingScore && (e.target.style.transform = 'scale(1)')}
            >
              {submittingScore ? '⏳ Submitting to Blockchain...' : '🏆 Submit Score to Leaderboard'}
            </button>
          )}

          {scoreSubmitted && (
            <div style={{
              background: 'rgba(46, 204, 113, 0.2)',
              border: '2px solid #2ecc71',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '15px',
              color: '#2ecc71',
              fontSize: '1.2em',
              fontWeight: 'bold'
            }}>
              ✅ Score Submitted Successfully!
            </div>
          )}

          <button
            onClick={handleRestart}
            style={{
              width: '100%',
              fontSize: '1.3em',
              padding: '15px',
              background: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(46, 204, 113, 0.4)',
              marginBottom: '15px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            🔄 Play Again
          </button>

          <button
            onClick={onBack}
            style={{
              width: '100%',
              fontSize: '1em',
              padding: '12px',
              background: '#95a5a6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '60px 50px',
          borderRadius: '20px',
          textAlign: 'center',
          maxWidth: '500px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <h1 style={{
            fontSize: '3em',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>🎮 Bushido Platformer</h1>
          
          <p style={{
            fontSize: '1.2em',
            color: '#555',
            marginBottom: '30px',
            lineHeight: '1.6'
          }}>
            Journey through ancient Japan! Jump across wooden platforms, collect golden coins beneath cherry blossoms, dodge fearsome dragons, and avoid patrolling enemies! You have 5 hearts - survive the gauntlet! 🐉⚔️❤️🌸
          </p>

          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>Controls & Info:</h3>
            <p style={{ margin: '10px 0', color: '#666' }}>⬅️ ➡️ or A/D - Move Left/Right</p>
            <p style={{ margin: '10px 0', color: '#666' }}>⬆️ or W or Space - Jump</p>
            <p style={{ margin: '10px 0', color: '#666' }}>❤️ You have 5 hearts - enemies take 1 heart!</p>
            <p style={{ margin: '10px 0', color: '#666' }}>🐉 Watch out for flying dragons!</p>
            <p style={{ margin: '10px 0', color: '#666' }}>⚔️ Avoid patrolling ground enemies!</p>
            <p style={{ margin: '10px 0', color: '#666' }}>¥ Collect golden yen coins for points!</p>
          </div>

          <button
            onClick={() => setGameStarted(true)}
            style={{
              width: '100%',
              fontSize: '1.5em',
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
              marginBottom: '15px',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            🚀 Start Game
          </button>

          <button
            onClick={onBack}
            style={{
              width: '100%',
              fontSize: '1em',
              padding: '12px',
              background: '#95a5a6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '800px',
        marginBottom: '20px'
      }}>
        <h2 style={{ color: '#fff', margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          🎮 Bushido Platformer
        </h2>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.3)';
            e.target.style.borderColor = 'rgba(255,255,255,0.5)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(255,255,255,0.2)';
            e.target.style.borderColor = 'rgba(255,255,255,0.3)';
          }}
        >
          ← Back to Menu
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          border: '4px solid rgba(205,92,92,0.6)',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          background: 'linear-gradient(180deg, #FFB6C1 0%, #FFA07A 50%, #FFD700 100%)'
        }}
      />
    </div>
  );
}

