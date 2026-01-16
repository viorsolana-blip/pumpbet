import { Connection, PublicKey, clusterApiUrl, Cluster } from '@solana/web3.js';

// Network configuration
export const NETWORK: Cluster = (process.env.NEXT_PUBLIC_SOLANA_NETWORK as Cluster) || 'devnet';

export const RPC_URL = process.env.SOLANA_RPC_URL || clusterApiUrl(NETWORK);

// Treasury wallet configuration
export const TREASURY_PUBLIC_KEY = process.env.TREASURY_PUBLIC_KEY
  ? new PublicKey(process.env.TREASURY_PUBLIC_KEY)
  : null;

// Get connection instance (singleton pattern for client-side)
let connectionInstance: Connection | null = null;

export function getConnection(): Connection {
  if (!connectionInstance) {
    connectionInstance = new Connection(RPC_URL, 'confirmed');
  }
  return connectionInstance;
}

// Get a fresh connection (for server-side)
export function createConnection(): Connection {
  return new Connection(RPC_URL, 'confirmed');
}

// Validate Solana address
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

// Convert lamports to SOL
export function lamportsToSol(lamports: number): number {
  return lamports / 1e9;
}

// Convert SOL to lamports
export function solToLamports(sol: number): number {
  return Math.floor(sol * 1e9);
}

// Format SOL amount for display
export function formatSol(lamports: number, decimals = 4): string {
  const sol = lamportsToSol(lamports);
  return sol.toFixed(decimals);
}

// Get explorer URL for transaction
export function getExplorerUrl(signature: string, type: 'tx' | 'address' = 'tx'): string {
  const base = NETWORK === 'mainnet-beta'
    ? 'https://explorer.solana.com'
    : `https://explorer.solana.com?cluster=${NETWORK}`;

  return type === 'tx'
    ? `${base}/tx/${signature}`
    : `${base}/address/${signature}`;
}

// Check if treasury is configured
export function isTreasuryConfigured(): boolean {
  return TREASURY_PUBLIC_KEY !== null;
}

// Platform fee (1%)
export const PLATFORM_FEE_PERCENT = 1;

// Minimum bet amount (0.01 SOL)
export const MIN_BET_AMOUNT = 0.01;

// Maximum bet amount (100 SOL)
export const MAX_BET_AMOUNT = 100;

// Admin wallet for resolution (can be set via env var)
export const ADMIN_WALLET = process.env.ADMIN_WALLET || null;
