'use client';

import { FC, ReactNode, useMemo, useEffect } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { useStore } from '@/store';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Wallet state sync component
function WalletStateSync({ children }: { children: ReactNode }) {
  const { publicKey, connected, connecting } = useWallet();
  const { setWalletAddress, setBalance, setIsConnected, setWalletType } = useStore();

  // Sync wallet state to store
  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toBase58();
      const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
      setWalletAddress(shortAddress, address); // Pass both short and full address
      setIsConnected(true);
      setWalletType('solana');

      // Fetch real balance
      const fetchBalance = async () => {
        try {
          const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
          const balance = await connection.getBalance(publicKey);
          setBalance(balance / 1e9); // Convert lamports to SOL
        } catch (error) {
          console.error('Failed to fetch balance:', error);
          setBalance(0);
        }
      };

      fetchBalance();

      // Set up balance polling
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    } else {
      setIsConnected(false);
      if (!connecting) {
        setWalletAddress(null, null);
        setBalance(0);
      }
    }
  }, [connected, publicKey, connecting, setWalletAddress, setBalance, setIsConnected, setWalletType]);

  return <>{children}</>;
}

interface Props {
  children: ReactNode;
}

export const WalletProvider: FC<Props> = ({ children }) => {
  // Use devnet for testing, switch to mainnet-beta for production
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);

  // Configure wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletStateSync>
            {children}
          </WalletStateSync>
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

// Hook to get wallet connection helpers
export function useWalletConnection() {
  const { publicKey, connected, disconnect, connecting, wallet } = useWallet();

  return {
    publicKey,
    connected,
    disconnect,
    connecting,
    wallet,
    address: publicKey?.toBase58() || null,
    shortAddress: publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : null,
  };
}
