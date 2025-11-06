import React, { useEffect, useRef, useState } from 'react';
import { useMetaMask } from './MetaMaskContext';
import CoinCollectorLeaderboard from './CoinCollectorLeaderboard';
import { ethers } from 'ethers';

const SPRITES = {
  idle: 'https://i.postimg.cc/HrGxtnSp/sprite-1.png',
  running: 'https://i.postimg.cc/zHBL4Qhs/running-sprite.png',
  jumping: 'https://i.postimg.cc/7CKwjZNJ/jump-sprite.png',
  dragon: 'https://i.postimg.cc/sGQnsTdW/dragon.png',
  enemyLeft: 'https://i.postimg.cc/K1HRgfdK/water-left.png',
  enemyRight: 'https://i.postimg.cc/21KVBGPL/water.png',
  fireball_shoot: 'https://i.postimg.cc/308tVwLM/fireball-shoot.png',
  fireball_proj: 'https://i.postimg.cc/ZChbBzCH/fireball.png',
  sword_back: 'https://i.postimg.cc/ZCjGTG3v/sword-back.png',
  sword_hit: 'https://i.postimg.cc/5X0ZjsSb/sword-hit.png',
  explosion: 'https://i.postimg.cc/47gGKz3P/explosion.png',
};

// Coin Collector specific contract - tracks cumulative coins across all games
const COIN_CONTRACT_ADDRESS = '0x2d06d9568ae99f61f421ea99a46969878986fc2d';
const COIN_CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256","name": "coins","type": "uint256"}],
    "name": "addCoins",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true,"internalType": "address","name": "player","type": "address"},
      {"indexed": false,"internalType": "uint256","name": "coinsAdded","type": "uint256"},
      {"indexed": false,"internalType": "uint256","name": "newTotal","type": "uint256"}
    ],
    "name": "CoinsAdded",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "uint256","name": "limit","type": "uint256"},{"internalType": "uint256","name": "offset","type": "uint256"}],
    "name": "getLeaderboard",
    "outputs": [{"internalType": "address[]","name": "addresses","type": "address[]"},{"internalType": "uint256[]","name": "coins","type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "player","type": "address"}],
    "name": "getPlayerCoins",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayerCount",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "limit","type": "uint256"}],
    "name": "getTopPlayers",
    "outputs": [{"internalType": "address[]","name": "topAddresses","type": "address[]"},{"internalType": "uint256[]","name": "topCoins","type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "","type": "address"}],
    "name": "hasPlayed",
    "outputs": [{"internalType": "bool","name": "","type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "name": "players",
    "outputs": [{"internalType": "address","name": "","type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "","type": "address"}],
    "name": "totalCoins",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export default function BushidoPlatformer({ onBack }) {
  const canvasRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(true); // Start game immediately
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { account } = useMetaMask();
  const gameStateRef = useRef({
      player: {
      x: 100,
      y: 590, // Start on the ground
      width: 40,
      height: 60,
      velocityX: 0,
      velocityY: 0,
      speed: 5,
      jumpPower: 22, // Higher jump power for reaching spread out platforms
      onGround: false,
      facingRight: true,
      state: 'idle', // idle, running, jumping
      health: 5,
      maxHealth: 5,
      invincible: false,
      invincibleTimer: 0,
      dropping: false,
      dropTimer: 0,
      swordSwingTimer: 0,
      shootingTimer: 0,
      shooting: false,
      swordSwingStart: false,
      swordSwingHit: false,
      projectiles: []
    },
    camera: {
      x: 0,
      y: 0
    },
    keys: {},
    platforms: (() => {
      const platforms = [
        // Infinite ground - stone path (lowered for better gameplay)
        { x: 0, y: 650, width: 50000, height: 50, color: '#5a5a5a', type: 'ground' }
      ];
      
      // Generate platforms with varied heights spread across the screen (ground is at 650)
      let x = 400;
      while (x < 50000) {
        // Wide range of heights from high to low - creating a staircase effect
        const heights = [
          300, 320, 340, 360, 380, // High platforms
          400, 420, 440, 460, 480, // Upper-mid platforms
          500, 520, 540, 560, 580, // Lower-mid platforms
          600, 620 // Low platforms (close to ground)
        ];
        const colors = ['#8B4513', '#D2691E', '#CD853F'];
        
        // Varied platform sizes
        const width = Math.floor(Math.random() * 120 + 100); // 100-220 width
        
        // Pick random height for maximum variety
        const minPlatformY = 440;
        const y = Math.max(heights[Math.floor(Math.random() * heights.length)], minPlatformY);
        
        platforms.push({
          x: Math.floor(x),
          y: y,
          width: width,
          height: 20,
          color: colors[Math.floor(Math.random() * colors.length)],
          type: 'wood'
        });
        
        // Wider horizontal spacing for better spread
        const spacingType = Math.random();
        if (spacingType < 0.3) {
          // Close clusters
          x += Math.random() * 100 + 180; // 180-280 pixels
        } else if (spacingType < 0.6) {
          // Medium spacing
          x += Math.random() * 150 + 280; // 280-430 pixels
        } else {
          // Wide gaps for challenge
          x += Math.random() * 200 + 400; // 400-600 pixels
        }
      }
      
      return platforms;
    })(),
    coins: (() => {
      const coins = [];
      // Generate coins at varied heights throughout the level
      let x = 250;
      while (x < 50000) {
        // Coin heights matching the wide range of platform heights
        const heights = [
          280, 300, 320, 340, 360, 380, // High coins
          400, 420, 440, 460, 480, 500, // Mid-high coins
          520, 540, 560, 580, 600, 620, 640 // Mid-low coins
        ];
        const minCoinY = 120;
        const maxCoinY = 630;
        const coinY = Math.min(Math.max(heights[Math.floor(Math.random() * heights.length)], minCoinY), maxCoinY);
        coins.push({
          x: Math.floor(x),
          y: coinY,
          collected: false
        });
        
        // Varied coin spacing matching platform spread
        const spacingType = Math.random();
        if (spacingType < 0.3) {
          // Close together - trail of coins
          x += Math.random() * 100 + 120; // 120-220 pixels
        } else if (spacingType < 0.6) {
          // Medium spread
          x += Math.random() * 150 + 220; // 220-370 pixels
        } else {
          // Wide spread
          x += Math.random() * 200 + 350; // 350-550 pixels
        }
      }
      return coins;
    })(),
    dragons: [],
    lastDragonSpawn: 0,
    enemies: [],
    score: 0,
    sprites: {},
    spritesLoaded: false,
    gameTime: 0, // Track elapsed time in seconds for day/night cycle
    dayNightCycle: 0 // 0 = day, transitioning to 1 = night, back to 0
  });

  const prevKeysRef = useRef({});

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Auto-connect MetaMask and network on game mount
    (async () => {
      if (window.ethereum && !account) {
        try {
          // Request connection
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          // Try to switch to Somnia if not already connected
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          if (chainId !== '0x13A7') {
            try {
              await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x13A7' }] });
            } catch (switchError) {
              if (switchError.code === 4902) {
                await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{
                  chainId: '0x13A7',
                  chainName: 'Somnia Mainnet',
                  nativeCurrency: { name: 'SOMI', symbol: 'SOMI', decimals: 18 },
                  rpcUrls: ['https://api.infra.mainnet.somnia.network/'],
                  blockExplorerUrls: ['https://explorer.somnia.network']
                }] });
              }
            }
          }
        } catch (err) {
          // Optional: Show wallet connect/network error
        }
      }
    })();
  }, [account]);

  // Initialize enemies on platforms
  useEffect(() => {
    const gameState = gameStateRef.current;
    if (gameState.enemies.length === 0 && gameState.platforms.length > 0) {
      const enemies = [];
      const enemyHeight = 60;
      
      // For ground enemies: change i += 5 to i += 3 in the enemies placement loop
      for (let i = 1; i < gameState.platforms.length; i += 3) {
        const platform = gameState.platforms[i];
        if (platform && platform.type === 'wood') {
          enemies.push({
            x: platform.x + 10,
            y: platform.y - enemyHeight, // Place enemy on top of platform
            width: 40,
            height: enemyHeight,
            velocityX: 1,
            direction: 1,
            platformX: platform.x,
            platformWidth: platform.width,
            blink: 0,
            deathAnimFrames: 0
          });
        }
      }
      
      gameState.enemies = enemies;
    }
  }, []);

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

    // Set canvas size - much larger for better gameplay
    const maxWidth = Math.min(window.innerWidth - 40, 1600);
    const maxHeight = Math.min(window.innerHeight - 150, 900);
    canvas.width = maxWidth;
    canvas.height = maxHeight;

    // Keyboard controls - one-shot per keypress
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (!gameState.keys[key]) prevKeysRef.current[key] = false;
      gameState.keys[key] = true;
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "f", "g"].includes(key)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      gameState.keys[key] = false;
      prevKeysRef.current[key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Game loop
    let animationId;
    let lastTime = 0;

    const gameLoop = (timestamp) => {
      const deltaTime = (timestamp - lastTime) / 16.67; // Normalize to 60fps
      lastTime = timestamp;

      // Update game time for day/night cycle (60 seconds = 1 cycle phase)
      gameState.gameTime += deltaTime / 60; // Increment based on frames
      // Calculate day/night cycle: 0 = day, 0.5 = transition, 1 = night, 1.5 = transition, 2 = day (repeats)
      const cyclePhase = (gameState.gameTime / 60) % 2; // 2 minute cycle (1 min day, 1 min night)
      // Convert to smooth 0-1-0 pattern
      gameState.dayNightCycle = cyclePhase <= 1 ? cyclePhase : 2 - cyclePhase;

      const player = gameState.player;
      const camera = gameState.camera;
      
      // Helper function to interpolate colors
      const lerpColor = (color1, color2, t) => {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        return `rgb(${r},${g},${b})`;
      };

      // Day/night cycle colors
      const dayColors = ['#FFB6C1', '#FFA07A', '#FFD700', '#FF8C69']; // Pink, salmon, gold, coral
      const nightColors = ['#0a0e27', '#1a1a3e', '#2d2d5f', '#1a1a2e']; // Dark blue/purple night
      const cycle = gameState.dayNightCycle;

      // Draw sky with day/night transition
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, lerpColor(dayColors[0], nightColors[0], cycle));
      gradient.addColorStop(0.3, lerpColor(dayColors[1], nightColors[1], cycle));
      gradient.addColorStop(0.6, lerpColor(dayColors[2], nightColors[2], cycle));
      gradient.addColorStop(1, lerpColor(dayColors[3], nightColors[3], cycle));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Mount Fuji-style mountains in background (repeating)
      ctx.save();
      ctx.translate(-camera.x * 0.3, 0);
      
      for (let mountainX = 0; mountainX < 60000; mountainX += 1500) {
        // Far mountain (transitions color)
        ctx.fillStyle = lerpColor('#4B0082', '#1a1a2e', cycle);
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(mountainX + 200, 400);
        ctx.lineTo(mountainX + 400, 200);
        ctx.lineTo(mountainX + 600, 400);
        ctx.closePath();
        ctx.fill();
        
        // Mount Fuji (transitions color)
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = lerpColor('#2F4F4F', '#0f1f2f', cycle);
        ctx.beginPath();
        ctx.moveTo(mountainX + 300, 450);
        ctx.lineTo(mountainX + 500, 150);
        ctx.lineTo(mountainX + 700, 450);
        ctx.closePath();
        ctx.fill();
        
        // Snow cap (stays white but can dim slightly at night)
        ctx.fillStyle = lerpColor('#FFFFFF', '#b0b0c0', cycle);
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
        // Tree trunk (darkens at night)
        ctx.fillStyle = lerpColor('#654321', '#2d1810', cycle);
        ctx.fillRect(treeX, 500, 20, 150);
        
        // Cherry blossom foliage (darker at night)
        ctx.fillStyle = lerpColor('#FFB7C5', '#8B5A6B', cycle);
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(treeX + 10, 480, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(treeX - 20, 500, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(treeX + 40, 500, 40, 0, Math.PI * 2);
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
        
        ctx.fillStyle = lerpColor('#FFB7C5', '#8B5A6B', cycle);
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
      
      if (gameState.keys['arrowleft'] || gameState.keys['a']) {
        player.velocityX = -player.speed;
        player.facingRight = false;
        if (player.onGround) player.state = 'running';
      }
      if (gameState.keys['arrowright'] || gameState.keys['d']) {
        player.velocityX = player.speed;
        player.facingRight = true;
        if (player.onGround) player.state = 'running';
      }
      if ((gameState.keys['arrowup'] || gameState.keys['w']) && player.onGround) {
        player.velocityY = -player.jumpPower;
        player.onGround = false;
        player.state = 'jumping';
      }
      
      // Drop through platforms when pressing down
      if ((gameState.keys['arrowdown'] || gameState.keys['s']) && player.onGround && !player.dropping) {
        player.dropping = true;
        player.dropTimer = 15; // Drop for 15 frames
      }
      
      // Update drop timer
      if (player.dropping) {
        player.dropTimer -= deltaTime;
        if (player.dropTimer <= 0) {
          player.dropping = false;
        }
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
        // Skip wooden platforms when dropping
        if (player.dropping && platform.type === 'wood') {
          continue;
        }
        
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
      if (player.y > 700) {
        player.y = 590;
        player.x = 100;
        player.velocityY = 0;
      }

      // Spawn dragons randomly
      const currentTime = timestamp / 1000;
      // For dragon spawn: decrease spawn interval to 2.5 seconds
      if (currentTime - gameState.lastDragonSpawn > 2.5) {
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
          direction: direction,
          deathAnimFrames: 0 // Initialize death animation frames
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

      // 1. FIREBALL/SWORD: Remove player.onGround check, attacks usable in air.
      // 2. FIREBALL SPEED: 6px/frame instead of 12
      // 3. SWORD ANIMATION: 13 frames total, switch to sword_hit at 7, revert at 0

      // --- ATTACKS ---
      if (gameState.keys['f'] && !prevKeysRef.current['f']) {
        player.state = 'shooting';
        player.shooting = true;
        player.shootingTimer = 10;
        const projDir = player.facingRight ? 1 : -1;
        player.projectiles.push({
          x: player.x + (player.facingRight ? player.width : -18),
          y: player.y + player.height / 2 - 6,
          w: 30,
          h: 18,
          dx: 6 * projDir,
          facingRight: player.facingRight,
          alive: true,
          hitAnim: 0
        });
        prevKeysRef.current['f'] = true;
      }
      if (!gameState.keys['f']) prevKeysRef.current['f'] = false;

      if (gameState.keys['g'] && !prevKeysRef.current['g']) {
        player.state = 'swordSwingStart';
        player.swordSwingStart = true;
        player.swordSwingTimer = 13;
        player.swordSwingHit = false;
        prevKeysRef.current['g'] = true;
      }
      if (!gameState.keys['g']) prevKeysRef.current['g'] = false;

      // DRAW PROJECTILES (fireballs): use processed sprite; experiment with 'multiply' blend
      if (gameState.spritesLoaded && gameState.sprites.fireball_proj) {
        for (const proj of player.projectiles) {
          if (proj.alive) {
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(
              gameState.sprites.fireball_proj,
              proj.x, proj.y,
              proj.w, proj.h
            );
            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();
          } else if (proj.hitAnim > 0 && gameState.sprites.explosion) {
            ctx.drawImage(gameState.sprites.explosion, proj.x, proj.y, 36, 36);
          }
        }
      }

      // SWORD ANIMATION: 13 frames, display sword_back then sword_hit, then revert
      if (player.state === 'swordSwingStart') {
        player.swordSwingTimer--;
        if (player.swordSwingTimer < 7 && !player.swordSwingHit) {
          player.swordSwingHit = true;
          player.state = 'swordSwingHit';
        }
        if (player.swordSwingTimer <= 0) {
          player.state = player.onGround ? 'idle' : 'jumping';
        }
      } else if (player.state === 'swordSwingHit') {
        player.swordSwingTimer--;
        if (player.swordSwingTimer <= 0) {
          player.state = player.onGround ? 'idle' : 'jumping';
          player.swordSwingHit = false;
        }
        for (let enemy of gameState.enemies) {
          if (enemy && enemy.blink <= 0 &&
              Math.abs((player.x + (player.facingRight ? player.width : 0)) - enemy.x) < 48 &&
              Math.abs(player.y - enemy.y) < 35) {
            enemy.blink = 6;
            enemy.deathAnimFrames = 18;
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
          // Stone path ground with strong top border
          ctx.fillStyle = platform.color;
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
          
          // Stone texture
          ctx.strokeStyle = '#404040';
          ctx.lineWidth = 2;
          for (let i = 0; i < platform.width; i += 50) {
            ctx.strokeRect(platform.x + i, platform.y, 50, platform.height);
          }
          
          // Strong black top border for visibility
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(platform.x, platform.y);
          ctx.lineTo(platform.x + platform.width, platform.y);
          ctx.stroke();
        } else {
          // Wooden platforms with strong shadow for visibility
          // Drop shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(platform.x + 4, platform.y + 4, platform.width, platform.height);
          
          // Platform base
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
          
          // Strong black borders for visibility
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 3;
          ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
        }
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

      // DRAW PLAYER (handle ALL states)
      if (gameState.spritesLoaded) {
        let sprite;
        if (player.state === 'shooting') {
          sprite = gameState.sprites.fireball_shoot;
        } else if (player.state === 'swordSwingStart') {
          sprite = gameState.sprites.sword_back;
        } else if (player.state === 'swordSwingHit') {
          sprite = gameState.sprites.sword_hit;
        } else {
          sprite = gameState.sprites[player.state] || gameState.sprites.idle;
        }
        
        // Flashing effect when invincible
        if (player.invincible && Math.floor(timestamp / 100) % 2 === 0) {
          ctx.globalAlpha = 0.5;
        }
        
        // PLAYER DRAW: always use identical ctx.translate/calc for both directions
        ctx.save();
        ctx.translate(player.x + player.width / 2, player.y + player.height);
        if (!player.facingRight) {
          ctx.scale(-1, 1);
        }
        // Correction: When facing left, apply a 1px shift to anchor feet exactly
        ctx.drawImage(sprite, -player.width / 2, -player.height + 1, player.width, player.height);
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      // PROJECTILE LOGIC
      for (let i = player.projectiles.length - 1; i >= 0; i--) {
        const proj = player.projectiles[i];
        if (!proj.alive && proj.hitAnim <= 0) {
          player.projectiles.splice(i, 1); // Remove done
          continue;
        }
        if (!proj.alive) {
          proj.hitAnim--;
          continue;
        }
        proj.x += proj.dx;
        // Check offscreen
        if (proj.x < camera.x - 40 || proj.x > camera.x + canvas.width + 40) {
          player.projectiles.splice(i, 1);
          continue;
        }
        // Check hit on enemies
        for (let enemy of gameState.enemies) {
          if (enemy && proj.alive &&
              proj.x + proj.w > enemy.x && proj.x < enemy.x + enemy.width &&
              proj.y + proj.h > enemy.y && proj.y < enemy.y + enemy.height) {
            enemy.blink = 6;
            enemy.deathAnimFrames = 18;
            proj.alive = false;
            proj.hitAnim = 10;
          }
        }
      }

      // --- ENEMY EXPLOSION & DEATH (ground enemies and dragons) ---
      // Ground enemies (death animation/removal & explosion):
      for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        if (enemy.deathAnimFrames > 0) {
          enemy.deathAnimFrames--;
          enemy.blink = 0; // don't flash anymore
          if (gameState.spritesLoaded && gameState.sprites.explosion) {
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(gameState.sprites.explosion, enemy.x, enemy.y, enemy.width, enemy.height);
            ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
          }
          if (enemy.deathAnimFrames === 0) {
            gameState.enemies.splice(i, 1);
            continue;
          }
        }
      }
      // Dragons (death animation/removal & explosion):
      for (let i = gameState.dragons.length - 1; i >= 0; i--) {
        const dragon = gameState.dragons[i];
        if (dragon.deathAnimFrames > 0) {
          dragon.deathAnimFrames--;
          if (gameState.spritesLoaded && gameState.sprites.explosion) {
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(gameState.sprites.explosion, dragon.x, dragon.y, dragon.width, dragon.height);
            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();
          }
          if (dragon.deathAnimFrames === 0) {
            gameState.dragons.splice(i, 1);
            continue;
          }
        }
      }

      // DRAW PROJECTILES (fireballs): use processed sprite; experiment with 'multiply' blend
      if (gameState.spritesLoaded && gameState.sprites.fireball_proj) {
        for (const proj of player.projectiles) {
          if (proj.alive) {
            ctx.save();
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(
              gameState.sprites.fireball_proj,
              proj.x, proj.y,
              proj.w, proj.h
            );
            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();
          } else if (proj.hitAnim > 0 && gameState.sprites.explosion) {
            ctx.drawImage(gameState.sprites.explosion, proj.x, proj.y, 36, 36);
          }
        }
      }

      // SWORD ANIMATION: 13 frames, display sword_back then sword_hit, then revert
      if (player.state === 'swordSwingStart') {
        player.swordSwingTimer--;
        if (player.swordSwingTimer < 7 && !player.swordSwingHit) {
          player.swordSwingHit = true;
          player.state = 'swordSwingHit';
        }
        if (player.swordSwingTimer <= 0) {
          player.state = player.onGround ? 'idle' : 'jumping';
        }
      } else if (player.state === 'swordSwingHit') {
        player.swordSwingTimer--;
        if (player.swordSwingTimer <= 0) {
          player.state = player.onGround ? 'idle' : 'jumping';
          player.swordSwingHit = false;
        }
        for (let enemy of gameState.enemies) {
          if (enemy && enemy.blink <= 0 &&
              Math.abs((player.x + (player.facingRight ? player.width : 0)) - enemy.x) < 48 &&
              Math.abs(player.y - enemy.y) < 35) {
            enemy.blink = 6;
            enemy.deathAnimFrames = 18;
          }
        }
      }

      // Draw 5 clean hearts at fixed top left, always visible; remove all HP bar/background/text.
      ctx.setTransform(1,0,0,1,0,0); // Reset transform so coordinates are always screen-relative
        ctx.save();
      for (let i = 0; i < player.maxHealth; i++) {
        ctx.font = '29px Arial';
        ctx.lineWidth = 2.2;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        let heartX = 26 + i * 28;
        let heartY = 29;
        ctx.strokeStyle = '#fff';
        ctx.strokeText('♥', heartX, heartY);
        ctx.fillStyle = i < player.health ? '#ff4c48' : '#ebabb3';
        ctx.fillText('♥', heartX, heartY);
      }
        ctx.restore();

      // 2. Fix Dragon Death detection (in fireball and sword hit code):
      // Where fireball hits an enemy, also check and apply for all dragons.
      for (let proj of player.projectiles) {
        if (proj.alive) {
          for (let dragon of gameState.dragons) {
            if (dragon && !dragon.deathAnimFrames &&
                proj.x + proj.w > dragon.x && proj.x < dragon.x + dragon.width &&
                proj.y + proj.h > dragon.y && proj.y < dragon.y + dragon.height) {
              dragon.deathAnimFrames = 18;
              proj.alive = false;
              proj.hitAnim = 10;
            }
          }
        }
      }
      // Sword attack hits for dragons as well:
      if (player.state === 'swordSwingHit') {
        for (let dragon of gameState.dragons) {
          if (dragon && !dragon.deathAnimFrames &&
              Math.abs((player.x + (player.facingRight ? player.width : 0)) - dragon.x) < 60 &&
              Math.abs(player.y - dragon.y) < 38) {
            dragon.deathAnimFrames = 18;
          }
        }
      }

      // 3. Transparency patch for ALL sprites in loadSprites effect (see below for actual code; here is the intent annotation):
      // After obtaining imageData for each sprite (any key), for each pixel:
      // if (r > 170 && g > 170 && b > 170) -> set alpha to 0.

      ctx.restore();

      // Modern flexible layout for HUD
      ctx.save();
      const boxX = 22;
      const boxY = canvas.height - 65;
      const boxW = canvas.width - 42;
      const boxH = 57;
      ctx.fillStyle = '#2a2229ee';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.font = 'bold 25px Arial';
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      const lineY = boxY + 36;
      // Place each text at 1/8, 3/8, 5/8, 7/8 HUD box width for perfect spacing
      const n = 4;
      const col1 = boxX + boxW * (1 / (2*n));
      const col2 = boxX + boxW * (3 / (2*n));
      const col3 = boxX + boxW * (5 / (2*n));
      const col4 = boxX + boxW * (7 / (2*n));
      ctx.fillText('←→ A/D: Move', col1, lineY);
      ctx.fillText('Space/W/↑: Jump', col2, lineY);
      ctx.fillText('↓/S: Drop', col3, lineY);
      ctx.fillText('F: Fireball', col4, lineY);
      ctx.restore();

      // Add fixed session coin/token counter top right
      ctx.save();
      ctx.setTransform(1,0,0,1,0,0);
      ctx.font = 'bold 26px Arial';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fff';
      // Coin icon using emoji (🪙), fallback to circle if unsupported
      const coinIcon = '🪙';
      ctx.fillText(coinIcon + ' ' + gameState.score, canvas.width - 36, 34);
      ctx.restore();

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
      const contract = new ethers.Contract(COIN_CONTRACT_ADDRESS, COIN_CONTRACT_ABI, signer);
      
      // Get player's current total before adding
      const currentTotal = await contract.getPlayerCoins(account);
      
      // Add coins to player's cumulative total (single transaction)
      const tx = await contract.addCoins(finalScore);
      await tx.wait();
      
      // Calculate new total
      const newTotal = Number(currentTotal) + finalScore;
      
      setScoreSubmitted(true);
      alert(`🎉 Score submitted successfully!\n\nThis game: ${finalScore} coins\nYour total: ${newTotal} coins\n\nYour cumulative score has been recorded on the blockchain!`);
    } catch (error) {
      console.error('Error submitting score:', error);
      if (error.message.includes('user rejected')) {
        alert('Transaction cancelled.');
      } else {
        alert('Failed to submit score. Please try again.');
      }
    } finally {
      setSubmittingScore(false);
    }
  };

  const handleRestart = () => {
    // Reset game state
    const gameState = gameStateRef.current;
    gameState.player.health = gameState.player.maxHealth;
    gameState.player.x = 100;
    gameState.player.y = 590;
    gameState.player.velocityX = 0;
    gameState.player.velocityY = 0;
    gameState.player.dropping = false;
    gameState.player.dropTimer = 0;
    gameState.player.invincible = false;
    gameState.player.invincibleTimer = 0;
    gameState.player.swordSwingTimer = 0;
    gameState.player.shootingTimer = 0;
    gameState.player.shooting = false;
    gameState.player.swordSwingStart = false;
    gameState.player.swordSwingHit = false;
    gameState.player.projectiles = [];
    gameState.score = 0;
    gameState.camera.x = 0;
    gameState.camera.y = 0;
    gameState.gameTime = 0; // Reset day/night cycle
    gameState.dayNightCycle = 0;
    
    // Reset coins
    for (let coin of gameState.coins) {
      coin.collected = false;
    }
    
    // Reset dragons
    gameState.dragons = [];
    gameState.lastDragonSpawn = 0;
    
    // Reset enemies to their starting positions on platforms
    const enemies = [];
    const enemyHeight = 60;
    for (let i = 1; i < gameState.platforms.length; i += 3) {
      const platform = gameState.platforms[i];
      if (platform && platform.type === 'wood') {
        enemies.push({
          x: platform.x + 10,
          y: platform.y - enemyHeight,
          width: 40,
          height: enemyHeight,
          velocityX: 1,
          direction: 1,
          platformX: platform.x,
          platformWidth: platform.width,
          blink: 0,
          deathAnimFrames: 0
        });
      }
    }
    gameState.enemies = enemies;
    
    // Force restart by toggling gameStarted state
    setGameOver(false);
    setFinalScore(0);
    setScoreSubmitted(false);
    setGameStarted(false);
    
    // Restart game after a brief moment
    setTimeout(() => {
      setGameStarted(true);
    }, 10);
  };

  // Game Over screen
  if (gameOver) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(125deg, #161b29 0%, #572ad8 100%)',
        padding: 0,
        overflow: 'hidden',
        position: 'fixed',
        top: 0,
        left: 0
      }}>
        {/* Animated background blobs/particles - CSS only */}
        <div style={{
          position: 'absolute', zIndex: 0, inset: 0, overflow: 'hidden', pointerEvents: 'none',
        }}>
          <div style={{ position: 'absolute', top: 70, left: 55, width: 320, height: 320, borderRadius: 9999, background: 'radial-gradient(circle at 65% 40%, #009fffbb, #653be650 90%)', filter: 'blur(40px)', opacity: 0.7, animation: 'float 10s infinite alternate' }}></div>
          <div style={{ position: 'absolute', bottom: 65, right: 80, width: 210, height: 200, borderRadius: 9999, background: 'radial-gradient(circle at 40% 65%, #bbacefff, #fcf87840 95%)', filter: 'blur(38px)', opacity: 0.4, animation: 'float 14s infinite alternate-reverse' }}></div>
          <style>{`
            @keyframes float {
              from { transform: translateY(0px) scale(1) rotateZ(0deg); }
              to { transform: translateY(-34px) scale(1.03) rotateZ(6deg); }
            }
          `}</style>
        </div>
        {/* Frosted glass card */}
          <div style={{
          position: 'relative',
          zIndex: 2,
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px) saturate(180%)',
          borderRadius: 18,
          padding: '42px 34px 39px 34px',
          maxWidth: 410,
          minWidth: 332,
          boxShadow: '0 8px 64px 0 rgba(80,45,180,0.21), 0 1px 0px rgba(255,255,255,0.09) inset',
          border: '2.5px solid rgba(156, 75, 255, 0.13)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: -22
        }}>
          {/* GAME OVER Headline */}
          <div style={{ textAlign: 'center', marginBottom: 14 }}>
            <span style={{
              fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif',
              fontWeight: 800,
              fontSize: 44,
              color: '#eb3b62',
              letterSpacing: 0.5,
              background: 'linear-gradient(93deg, #f23a55 60%, #e0daff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.03,
              textShadow: 'none',
              textTransform: 'uppercase',
              filter: 'drop-shadow(0 0 6px #f4598637)'
            }}>GAME OVER</span>
          </div>
          {/* Crisp neon score in sharp gold disk */}
          <div style={{
            margin: '14px 0 19px 0',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 4
          }}>
            <div style={{
              width: 110, height: 110,
              background: 'radial-gradient(circle at 48% 48%, #fffbe5 51%, #ffce00 83%, #cc9200 100%)',
              borderRadius: '50%',
              boxShadow: '0 0 35px 0 #ffd80020, 0 1px 11px #f68d0020',
              border: '3.5px solid #f7b80cbb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif',
              fontSize: 42, fontWeight: 900, color: '#332001',
              letterSpacing: '-0.5px', filter:'none',textShadow:'none'
            }}>
              {finalScore}
            </div>
            <span style={{ fontSize: 17, color: '#fff', fontWeight: 700, letterSpacing: 0.7, fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif', marginTop: 7, textShadow: 'none', textTransform: 'uppercase' }}>
              Final Score
            </span>
          </div>
          {/* Submission panel/confirmation */}
          {!scoreSubmitted && (
            <button
              onClick={handleSubmitScore}
              disabled={submittingScore}
              style={{
                width: '100%',
                fontSize: '1.13em',
                padding: '16px',
                outline: 'none',
                background: submittingScore 
                  ? 'linear-gradient(84deg,#9d9d9d 0%,#c2c2c2 100%)'
                  : 'linear-gradient(91deg, #3175e8 0%, #9518f4 99%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontWeight: 800,
                fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif',
                boxShadow: submittingScore ? 'none':'0 2px 14px rgba(30,128,255,0.16)',
                cursor: submittingScore ? 'not-allowed' : 'pointer',
                marginBottom: 19,
                letterSpacing: 0.12,
                transition: 'background 0.18s, transform 0.18s, box-shadow 0.18s',
                transform: submittingScore ? 'none':'scale(1)',
              }}
              onMouseEnter={e => !submittingScore && (e.target.style.transform = 'scale(1.022)')}
              onMouseLeave={e => !submittingScore && (e.target.style.transform = 'scale(1)')}
            >
              {submittingScore ? 'Submitting to Blockchain...' : 'Submit Score to Leaderboard'}
            </button>
          )}
          {scoreSubmitted && (
            <div style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(90deg, #38ec97 0%, #b3ffd2 100%)',
              border: '1.2px solid #62dea8',
              borderRadius: 10,
              color: '#043c13',
              fontWeight: '900',
              fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif',
              fontSize: '1.07em',
              textAlign: 'center',
              marginBottom: 13,
              marginTop: -5,
              boxShadow: '0 1px 11px #73ffd160,0px 1px #aaf5c3',
              letterSpacing: 0.13
            }}>
              Score Submitted Successfully!
            </div>
          )}
          <div style={{
            padding: '14px', color: '#fff', textAlign: 'center', fontSize: '1.09em', letterSpacing: 0.08, lineHeight: 1.58, fontWeight: 500, margin: '4px 0 12px 0', borderRadius: 9,
            background: 'rgba(60, 65, 110, 0.17)',
          }}>
            You collected {finalScore} coins.<br/>
            {account ? 'Your score will appear in the leaderboard soon.' : 'Connect your wallet to submit your score.'}
          </div>
          {/* Modern primary buttons below */}
          <div style={{ display:'flex', flexDirection:'column', gap:15, width:'100%', marginTop: 9 }}>
          <button
            onClick={() => setShowLeaderboard(true)}
            style={{
                padding: '13px', fontSize: '1.09em', borderRadius: 10, fontWeight: 800,
                background: 'linear-gradient(92deg, #FFD700 0%, #ffbe40 99%)', color: '#333', border: 'none',
                letterSpacing: 0.09, cursor:'pointer', boxShadow: '0 1px 11px #ffd70030', fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif',
                transition:'transform 0.15s',
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.025)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              View Leaderboard
          </button>
          <button
            onClick={handleRestart}
            style={{
                padding: '13px', fontSize: '1.03em', borderRadius: 10, fontWeight: 800, marginBottom: 2,
                background: 'linear-gradient(96deg, #2ecc71 0%, #27ae60 100%)', color: '#fff', border: 'none',
                boxShadow: '0 1px 10px #49eac850', letterSpacing: 0.08,
                cursor:'pointer', fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif',
                transition:'transform 0.15s',
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              Play Again
          </button>
          <button
            onClick={() => window.location.href = 'https://somniaarcade.solarstudios.co/' }
            style={{
                padding: '11px', fontSize: '0.99em', borderRadius: 10, fontWeight: 700,
                background: 'rgba(128, 124, 140, 0.18)', color: '#e0e2ef', border: 'none', marginBottom: 1,
                cursor:'pointer', fontFamily: 'Montserrat, Inter, Rubik, Arial, sans-serif',
                backdropFilter: 'blur(3.5px)', letterSpacing:0.04,
                transition:'transform 0.13s',
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.015)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              Back to Menu
          </button>
          </div>
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
            onClick={() => window.location.href = 'https://somniaarcade.solarstudios.co/' }
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
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '10px',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '95%',
        maxWidth: '1600px',
        marginBottom: '10px'
      }}>
        <h2 style={{ color: '#fff', margin: 0, textShadow: '2px 2px 4px rgba(0,0,0,0.3)', fontSize: '1.8em' }}>
          Coin Collector コインコレクター
        </h2>
        <button
          onClick={onBack}
          style={{
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: '2px solid rgba(255,255,255,0.3)',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s',
            fontSize: '1.1em'
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
          background: 'linear-gradient(180deg, #FFB6C1 0%, #FFA07A 50%, #FFD700 100%)',
          display: 'block'
        }}
      />

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <CoinCollectorLeaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}

