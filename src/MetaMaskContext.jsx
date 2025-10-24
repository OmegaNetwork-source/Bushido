import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const MetaMaskContext = createContext();

// Somnia Mainnet Configuration
const SOMNIA_NETWORK = {
  chainId: '0x13A7', // 5031 in hex
  chainName: 'Somnia Mainnet',
  nativeCurrency: {
    name: 'SOMI',
    symbol: 'SOMI',
    decimals: 18
  },
  rpcUrls: ['https://api.infra.mainnet.somnia.network/'],
  blockExplorerUrls: ['https://explorer.somnia.network']
};

export function MetaMaskProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Check if already connected
    if (window.ethereum) {
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);

      window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            ethersProvider.getSigner().then(setSigner);
          }
        });

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          ethersProvider.getSigner().then(setSigner);
        } else {
          setAccount(null);
          setSigner(null);
        }
      });

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not found. Please install MetaMask to play!');
      return;
    }

    setConnecting(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);

      // Check if connected to Somnia Network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      if (chainId !== SOMNIA_NETWORK.chainId) {
        // Try to switch to Somnia Network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SOMNIA_NETWORK.chainId }],
          });
        } catch (switchError) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [SOMNIA_NETWORK],
            });
          } else {
            throw switchError;
          }
        }
      }

      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      const ethersSigner = await ethersProvider.getSigner();
      setProvider(ethersProvider);
      setSigner(ethersSigner);
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      alert('Failed to connect wallet: ' + err.message);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setSigner(null);
  };

  const value = {
    account,
    provider,
    signer,
    connecting,
    connectWallet,
    disconnect,
    connected: !!account
  };

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  );
}

export function useMetaMask() {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error('useMetaMask must be used within MetaMaskProvider');
  }
  return context;
}

