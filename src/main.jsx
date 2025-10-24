import React from 'react';
import ReactDOM from 'react-dom/client';
import { MetaMaskProvider } from './MetaMaskContext';
import { MultiplayerProvider } from './MultiplayerContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <MetaMaskProvider>
    <MultiplayerProvider>
      <App />
    </MultiplayerProvider>
  </MetaMaskProvider>
);