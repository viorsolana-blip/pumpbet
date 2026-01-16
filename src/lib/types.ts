// ============================================
// PUMPBET - Core Types
// ============================================

export interface User {
  id: string;
  walletAddress: string;
  createdAt: Date;
}

export interface KOLBet {
  id: string;
  creatorId: string;

  // KOL Info
  kolName: string;
  kolTicker: string;
  kolImage: string;
  kolTwitter?: string;

  // Bet Details
  title: string;
  description: string;
  category: 'kol' | 'crypto' | 'token' | 'other';

  // Resolution
  resolutionCriteria: string;
  resolutionSource?: string; // URL or method for verification
  endTime: Date;
  resolvedAt?: Date;
  outcome?: 'yes' | 'no' | 'cancelled';

  // Pool
  yesPool: number; // SOL
  noPool: number;  // SOL

  // Status
  status: 'active' | 'resolved' | 'cancelled';
  isLive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  id: string;
  odId: string;
  betId: string;
  side: 'yes' | 'no';
  amount: number; // SOL wagered
  shares: number; // Shares owned
  entryPrice: number; // Price at entry (0-100)
  createdAt: Date;
}

export interface PlaceBetInput {
  betId: string;
  odId: string;
  side: 'yes' | 'no';
  amount: number;
  walletAddress: string;
  signature: string; // Transaction signature
}

export interface CreateBetInput {
  kolName: string;
  kolTicker: string;
  kolImage: string;
  kolTwitter?: string;
  title: string;
  description: string;
  category: 'kol' | 'crypto' | 'token' | 'other';
  resolutionCriteria: string;
  resolutionSource?: string;
  endTime: Date;
  creatorWallet: string;
  initialYesPool?: number;
  initialNoPool?: number;
}

export interface BetWithPositions extends KOLBet {
  userPosition?: {
    yesShares: number;
    noShares: number;
    totalInvested: number;
    currentValue: number;
    pnl: number;
  };
}

// Pricing - Constant Product Market Maker (like Uniswap)
export function calculatePrice(yesPool: number, noPool: number): { yes: number; no: number } {
  const total = yesPool + noPool;
  if (total === 0) return { yes: 50, no: 50 };
  return {
    yes: (noPool / total) * 100,
    no: (yesPool / total) * 100,
  };
}

export function calculateShares(
  amount: number,
  side: 'yes' | 'no',
  yesPool: number,
  noPool: number
): { shares: number; newYesPool: number; newNoPool: number } {
  // Simple AMM: shares = amount / current price
  const prices = calculatePrice(yesPool, noPool);
  const price = side === 'yes' ? prices.yes : prices.no;
  const shares = (amount / price) * 100;

  return {
    shares,
    newYesPool: side === 'yes' ? yesPool + amount : yesPool,
    newNoPool: side === 'no' ? noPool + amount : noPool,
  };
}

export function calculatePayout(
  shares: number,
  side: 'yes' | 'no',
  outcome: 'yes' | 'no',
  totalPool: number,
  totalWinningShares: number
): number {
  if (side !== outcome) return 0;
  if (totalWinningShares === 0) return 0;
  return (shares / totalWinningShares) * totalPool;
}
