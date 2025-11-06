import React, { useState } from 'react';
import { useMultiplayer } from './MultiplayerContext';

export default function MultiplayerLobby({ onStartGame, onBack }) {
  const { peerId, isHost, connected, opponentId, createRoom, joinRoom, disconnect, sendData, setMessageHandler } = useMultiplayer();
  const [roomCode, setRoomCode] = useState('');
  const [myRoomCode, setMyRoomCode] = useState(null);
  const [mode, setMode] = useState(null); // 'create' or 'join'

  // Listen for game start signal from host
  React.useEffect(() => {
    setMessageHandler((data) => {
      if (data.type === 'gameStart') {
        console.log('Received game start signal from host');
        onStartGame();
      }
    });
  }, [setMessageHandler, onStartGame]);

  const handleCreateRoom = () => {
    const code = createRoom();
    if (code) {
      setMyRoomCode(code);
      setMode('create');
    }
  };

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      joinRoom(roomCode.trim());
      setMode('join');
    } else {
      alert('Please enter a room code');
    }
  };

  const handleStartGame = () => {
    if (connected && opponentId) {
      // If host, notify guest to start game
      if (isHost) {
        sendData({ type: 'gameStart' });
      }
      onStartGame();
    }
  };

  const handleCopyCode = () => {
    if (myRoomCode) {
      navigator.clipboard.writeText(myRoomCode);
      alert('Room code copied to clipboard!');
    }
  };

  const handleBackToMenu = () => {
    disconnect();
    setMode(null);
    setMyRoomCode(null);
    setRoomCode('');
  };

  if (!mode) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'linear-gradient(110deg, #181d31 0%, #2b2d42 100%)',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3a245d 0%, #432371 38%, #2980b9 100%)',
          borderRadius: '26px',
          padding: window.innerWidth > 800 ? '58px 56px 42px' : '34px 17px 28px',
          maxWidth: 510,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 8px 54px 0 #201153b0, 0 0 0 2px #a855f754',
          border: '2.5px solid #a855f7',
          position: 'relative',
        }}>
          <div style={{ fontSize: '2.7em', color: '#fff', fontWeight: 900, letterSpacing: 2, fontFamily: 'Montserrat, Inter, Arial', textTransform: 'uppercase', marginBottom: 8, textShadow: '0 2px 16px #533483aa' }}>Multiplayer</div>
          <p style={{ color: '#aacfff', margin: '0 0 40px 0', fontSize: '1.19em', fontWeight: 600, letterSpacing: 0.6, textShadow: '0 1px 7px #16213e90' }}>
            Play against a friend in real-time!
          </p>

          {!peerId ? (
            <div>
              <div style={{ fontSize: '1.2em', color: '#d3d9f1', marginBottom: '20px', fontWeight: 700 }}>
                Connecting to network...
              </div>
              <p style={{ fontSize: '0.98em', color: '#9cbcf0', marginBottom: 0 }}>
                This may take a few seconds. If it takes longer than 10 seconds, try refreshing the page.
              </p>
            </div>
          ) : peerId === 'initializing-failed' ? (
            <div>
              <div style={{ fontSize: '1.16em', color: '#fd6c6c', marginBottom: '20px', fontWeight: 'bold' }}>
                Connection failed
              </div>
              <p style={{ fontSize: '1em', color: '#d3d9f1', marginBottom: '23px' }}>
                Unable to connect to the multiplayer network. This could be due to a firewall or network issue.
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '16px 36px',
                  background: 'linear-gradient(90deg, #ff757c 0%, #6bbfff 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.13em',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 16px #5c258dd0',
                  cursor: 'pointer',
                  letterSpacing: 1,
                  marginBottom: 4,
                }}
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleCreateRoom}
                style={{
                  width: '100%',
                  fontSize: '1.22em',
                  padding: '22px',
                  marginBottom: '20px',
                  background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '13px',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  cursor: 'pointer',
                  boxShadow: '0 5px 14px #a855f74a',
                  transition: 'all 0.22s',
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.023)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >
                Create Room
              </button>

              <div style={{ margin: '30px 0', color: '#dfa8ff', fontSize: '1.15em', fontWeight: 'bold', letterSpacing: 3, textTransform: 'uppercase', textShadow: '0 0 7px #a855f744' }}>
                OR
              </div>

              <input
                type="text"
                placeholder="Enter room code..."
                value={roomCode}
                onChange={e => setRoomCode(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleJoinRoom()}
                style={{
                  width: '100%',
                  fontSize: '1.01em',
                  padding: '15px',
                  marginBottom: '16px',
                  border: '2px solid #cfbafb',
                  borderRadius: '11px',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  background:'#27315c',
                  color: '#fff',
                  fontFamily: 'Montserrat, Arial, sans-serif',
                  fontWeight: 600,
                  outline: 'none',
                  letterSpacing: 0.7,
                }}
              />

              <button
                onClick={handleJoinRoom}
                style={{
                  width: '100%',
                  fontSize: '1.22em',
                  padding: '22px',
                  background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '13px',
                  fontWeight: 'bold',
                  letterSpacing: 1,
                  cursor: 'pointer',
                  boxShadow: '0 5px 14px #3b238e38',
                  marginBottom: 6,
                  transition: 'all 0.22s',
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.023)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >
                Join Room
              </button>
            </>
          )}

          <button
            onClick={() => window.location.href = 'https://bushidogame.solarstudios.co/' }
            style={{
              width: '100%',
              fontSize: '1.1em',
              padding: '14px',
              marginTop: '30px',
              background: 'linear-gradient(90deg, #aaaabb 0%, #bdbdbd 100%)',
              color: '#32234c',
              fontWeight: 'bold',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              letterSpacing: 1.5,
              transition: 'all 0.22s',
              boxShadow: '0 2px 12px #2b2d4244',
            }}
            onMouseEnter={e => e.target.style.background = 'linear-gradient(90deg, #d3d3e4 0%, #bdbdbd 100%)'}
            onMouseLeave={e => e.target.style.background = 'linear-gradient(90deg, #aaaabb 0%, #bdbdbd 100%)'}
          >
            ← Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Waiting room
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
        background: 'rgba(255,255,255,0.95)',
        padding: '50px 40px',
        borderRadius: '20px',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
      }}>
        {mode === 'create' && !connected && (
          <>
            <h2 style={{ fontSize: '2em', marginBottom: '20px', color: '#333' }}>
              🎮 Room Created!
            </h2>
            <p style={{ color: '#666', marginBottom: '30px', fontSize: '1.1em' }}>
              Share this code with your friend:
            </p>
            <div style={{
              background: '#f8f9fa',
              padding: '25px',
              borderRadius: '15px',
              marginBottom: '25px',
              border: '3px dashed #3498db'
            }}>
              <div style={{
                fontSize: '2.5em',
                fontWeight: 'bold',
                color: '#2c3e50',
                letterSpacing: '5px',
                fontFamily: 'monospace',
                marginBottom: '15px',
                wordBreak: 'break-all'
              }}>
                {myRoomCode}
              </div>
              <button
                onClick={handleCopyCode}
                style={{
                  padding: '12px 30px',
                  background: '#3498db',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.1em',
                  fontWeight: 'bold'
                }}
              >
                📋 Copy Code
              </button>
            </div>
            <div style={{
              fontSize: '1.2em',
              color: '#7f8c8d',
              animation: 'pulse 2s infinite'
            }}>
              ⏳ Waiting for opponent to join...
            </div>
          </>
        )}

        {mode === 'join' && !connected && (
          <>
            <h2 style={{ fontSize: '2em', marginBottom: '20px', color: '#333' }}>
              🔗 Joining Room...
            </h2>
            <div style={{
              fontSize: '1.2em',
              color: '#7f8c8d',
              animation: 'pulse 2s infinite'
            }}>
              ⏳ Connecting to host...
            </div>
          </>
        )}

        {connected && (
          <>
            <h2 style={{ fontSize: '2em', marginBottom: '20px', color: '#27ae60' }}>
              ✅ Connected!
            </h2>
            <p style={{ fontSize: '1.2em', color: '#666', marginBottom: '30px' }}>
              Opponent found. Ready to battle!
            </p>
            <button
              onClick={handleStartGame}
              style={{
                width: '100%',
                fontSize: '1.5em',
                padding: '25px',
                background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 5px 15px rgba(39,174,96,0.4)',
                transition: 'all 0.3s',
                marginBottom: '15px'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              ⚔️ Start Battle!
            </button>
          </>
        )}

        <button
          onClick={() => window.location.href = 'https://bushidogame.solarstudios.co/' }
          style={{
            width: '100%',
            fontSize: '1em',
            padding: '12px',
            marginTop: '20px',
            background: '#95a5a6',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Back
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

