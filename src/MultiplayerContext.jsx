import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Peer from 'peerjs';

const MultiplayerContext = createContext(null);

export const MultiplayerProvider = ({ children }) => {
  const [peer, setPeer] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [opponentId, setOpponentId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [connected, setConnected] = useState(false);
  const messageHandlerRef = useRef(null);

  // Initialize peer
  useEffect(() => {
    console.log('Initializing PeerJS...');
    
    const newPeer = new Peer(undefined, {
      debug: 2, // Enable debug logging
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      }
    });

    // Timeout to detect initialization failures
    let isInitialized = false;
    const timeout = setTimeout(() => {
      if (!isInitialized) {
        console.warn('PeerJS initialization timeout');
        setPeerId('initializing-failed');
      }
    }, 10000);

    newPeer.on('open', (id) => {
      console.log('✅ PeerJS connected! My peer ID:', id);
      isInitialized = true;
      clearTimeout(timeout);
      setPeerId(id);
    });

    newPeer.on('connection', (conn) => {
      console.log('📥 Incoming connection from:', conn.peer);
      setConnection(conn);
      setOpponentId(conn.peer);
      setupConnectionHandlers(conn);
    });

    newPeer.on('disconnected', () => {
      console.warn('⚠️ Peer disconnected, attempting to reconnect...');
      newPeer.reconnect();
    });

    newPeer.on('error', (err) => {
      console.error('❌ Peer error:', err);
      isInitialized = true; // Prevent timeout from also showing error
      clearTimeout(timeout);
      if (err.type === 'peer-unavailable') {
        alert('Room code not found. Please check the code and try again.');
      } else if (err.type === 'network') {
        alert('Network error. Please check your internet connection.');
        setPeerId('initializing-failed');
      } else if (err.type === 'unavailable-id') {
        // Peer ID already taken, will auto-retry
        console.log('Peer ID unavailable, retrying...');
      } else if (err.type === 'server-error') {
        alert('PeerJS server error. Please try again later.');
        setPeerId('initializing-failed');
      } else {
        alert('Connection error: ' + err.type);
      }
    });

    setPeer(newPeer);

    return () => {
      clearTimeout(timeout);
      if (newPeer) {
        newPeer.destroy();
      }
    };
  }, []);

  const setupConnectionHandlers = useCallback((conn) => {
    conn.on('open', () => {
      console.log('Connection established');
      setConnected(true);
    });

    conn.on('data', (data) => {
      console.log('Received data:', data);
      if (messageHandlerRef.current) {
        messageHandlerRef.current(data);
      }
    });

    conn.on('close', () => {
      console.log('Connection closed');
      setConnected(false);
      setConnection(null);
      setOpponentId(null);
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
    });
  }, []);

  // Create room (host)
  const createRoom = useCallback(() => {
    if (!peerId) {
      alert('Peer not ready yet, please wait...');
      return null;
    }
    setIsHost(true);
    return peerId; // This is the room code
  }, [peerId]);

  // Join room (guest)
  const joinRoom = useCallback((roomCode) => {
    if (!peer) {
      alert('Peer not ready yet, please wait...');
      return;
    }

    console.log('Attempting to connect to:', roomCode);
    const conn = peer.connect(roomCode, { reliable: true });
    
    conn.on('open', () => {
      console.log('Connected to host');
      setConnection(conn);
      setOpponentId(roomCode);
      setIsHost(false);
      setupConnectionHandlers(conn);
    });

    conn.on('error', (err) => {
      console.error('Failed to connect:', err);
      alert('Failed to connect to room. Please check the room code.');
    });
  }, [peer, setupConnectionHandlers]);

  // Send data to opponent
  const sendData = useCallback((data) => {
    if (connection && connection.open) {
      console.log('Sending data:', data);
      connection.send(data);
      return true;
    } else {
      console.warn('Connection not ready');
      return false;
    }
  }, [connection]);

  // Set message handler
  const setMessageHandler = useCallback((handler) => {
    messageHandlerRef.current = handler;
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    if (connection) {
      connection.close();
    }
    setConnection(null);
    setOpponentId(null);
    setConnected(false);
    setIsHost(false);
    setGameState(null);
  }, [connection]);

  return (
    <MultiplayerContext.Provider
      value={{
        peerId,
        isHost,
        connected,
        opponentId,
        gameState,
        createRoom,
        joinRoom,
        sendData,
        disconnect,
        setMessageHandler,
        setGameState
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
};

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within MultiplayerProvider');
  }
  return context;
};

