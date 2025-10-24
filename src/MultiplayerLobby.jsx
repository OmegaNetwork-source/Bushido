import React, { useState } from 'react';
import { useMultiplayer } from './MultiplayerContext';

export default function MultiplayerLobby({ onStartGame, onBack }) {
  const { peerId, isHost, connected, opponentId, createRoom, joinRoom, disconnect } = useMultiplayer();
  const [roomCode, setRoomCode] = useState('');
  const [myRoomCode, setMyRoomCode] = useState(null);
  const [mode, setMode] = useState(null); // 'create' or 'join'

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
        background: 'linear-gradient(90deg, #2d0a0a 0%, #0a0a2e 50%, #0a1a2d 100%)'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          padding: '50px 40px',
          borderRadius: '20px',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
        }}>
          <h1 style={{ fontSize: '2.5em', marginBottom: '10px', color: '#333' }}>⚔️ Multiplayer</h1>
          <p style={{ color: '#666', marginBottom: '40px', fontSize: '1.1em' }}>
            Play against a friend in real-time!
          </p>

          {!peerId ? (
            <div>
              <div style={{ fontSize: '1.2em', color: '#666', marginBottom: '20px' }}>
                🔄 Connecting to network...
              </div>
              <p style={{ fontSize: '0.9em', color: '#999' }}>
                This may take a few seconds. If it takes longer than 10 seconds, try refreshing the page.
              </p>
            </div>
          ) : peerId === 'initializing-failed' ? (
            <div>
              <div style={{ fontSize: '1.2em', color: '#e74c3c', marginBottom: '20px' }}>
                ❌ Connection failed
              </div>
              <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '20px' }}>
                Unable to connect to the multiplayer network. This could be due to a firewall or network issue.
              </p>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '15px 30px',
                  background: '#3498db',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1.1em',
                  fontWeight: 'bold'
                }}
              >
                🔄 Retry Connection
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleCreateRoom}
                style={{
                  width: '100%',
                  fontSize: '1.3em',
                  padding: '20px',
                  marginBottom: '20px',
                  background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 5px 15px rgba(231,76,60,0.4)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🎮 Create Room
              </button>

              <div style={{ margin: '30px 0', color: '#999', fontSize: '1.1em', fontWeight: 'bold' }}>
                OR
              </div>

              <input
                type="text"
                placeholder="Enter room code..."
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                style={{
                  width: '100%',
                  fontSize: '1.1em',
                  padding: '15px',
                  marginBottom: '15px',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              />

              <button
                onClick={handleJoinRoom}
                style={{
                  width: '100%',
                  fontSize: '1.3em',
                  padding: '20px',
                  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 5px 15px rgba(52,152,219,0.4)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🔗 Join Room
              </button>
            </>
          )}

          <button
            onClick={onBack}
            style={{
              width: '100%',
              fontSize: '1em',
              padding: '12px',
              marginTop: '30px',
              background: '#95a5a6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
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
          onClick={handleBackToMenu}
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

