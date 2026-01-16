import { DBPosition, DBMarket, DBLiquidityProvider } from './supabase';

export interface PayoutCalculation {
  positionId: string;
  userId: string;
  walletAddress: string;
  amount: number; // Original amount bet
  shares: number;
  side: 'yes' | 'no';
  payout: number; // Amount to pay out
  profit: number; // payout - amount
}

export interface LPPayoutCalculation {
  lpId: string;
  userId: string;
  walletAddress: string;
  originalAmount: number;
  shares: number;
  payout: number;
  profit: number;
}

/**
 * Calculate payouts for all winning positions in a resolved market
 */
export function calculatePositionPayouts(
  positions: DBPosition[],
  market: DBMarket,
  outcome: 'yes' | 'no'
): PayoutCalculation[] {
  const totalPool = market.yes_pool + market.no_pool;

  // Only winning side gets paid
  const winningPositions = positions.filter(p => p.side === outcome);

  // Total shares on winning side
  const totalWinningShares = winningPositions.reduce((sum, p) => sum + p.shares, 0);

  if (totalWinningShares === 0 || totalPool === 0) {
    return [];
  }

  // Each winner gets proportional share of total pool
  return winningPositions.map(position => {
    const shareOfPool = position.shares / totalWinningShares;
    const payout = totalPool * shareOfPool;

    return {
      positionId: position.id,
      userId: position.user_id,
      walletAddress: '', // Will be filled in by caller
      amount: position.amount,
      shares: position.shares,
      side: position.side,
      payout: Math.round(payout * 1000000) / 1000000, // Round to 6 decimal places
      profit: Math.round((payout - position.amount) * 1000000) / 1000000,
    };
  });
}

/**
 * Calculate refunds for a cancelled market
 */
export function calculateCancelledPayouts(
  positions: DBPosition[]
): PayoutCalculation[] {
  // Everyone gets their original bet back
  return positions.map(position => ({
    positionId: position.id,
    userId: position.user_id,
    walletAddress: '',
    amount: position.amount,
    shares: position.shares,
    side: position.side,
    payout: position.amount, // Full refund
    profit: 0,
  }));
}

/**
 * Calculate LP payouts when market resolves
 * LPs get remaining pool after winners are paid, proportional to their shares
 */
export function calculateLPPayouts(
  lpPositions: DBLiquidityProvider[],
  market: DBMarket,
  totalWinnerPayouts: number
): LPPayoutCalculation[] {
  // After paying winners, what's left goes to LPs
  const totalPool = market.yes_pool + market.no_pool;
  const remainingPool = Math.max(0, totalPool - totalWinnerPayouts);

  const totalLPShares = market.total_lp_shares;

  if (totalLPShares === 0) {
    return [];
  }

  return lpPositions.map(lp => {
    const shareOfRemaining = lp.shares / totalLPShares;
    const payout = remainingPool * shareOfRemaining;

    return {
      lpId: lp.id,
      userId: lp.user_id,
      walletAddress: '',
      originalAmount: lp.amount,
      shares: lp.shares,
      payout: Math.round(payout * 1000000) / 1000000,
      profit: Math.round((payout - lp.amount) * 1000000) / 1000000,
    };
  });
}

/**
 * Calculate LP refunds for cancelled market
 */
export function calculateLPCancelledPayouts(
  lpPositions: DBLiquidityProvider[]
): LPPayoutCalculation[] {
  return lpPositions.map(lp => ({
    lpId: lp.id,
    userId: lp.user_id,
    walletAddress: '',
    originalAmount: lp.amount,
    shares: lp.shares,
    payout: lp.amount, // Full refund
    profit: 0,
  }));
}

/**
 * Summary of a market resolution
 */
export interface ResolutionSummary {
  marketId: string;
  outcome: 'yes' | 'no' | 'cancelled';
  totalPool: number;
  totalPositions: number;
  totalWinners: number;
  totalLosers: number;
  totalWinnerPayouts: number;
  totalLPPayouts: number;
  positionPayouts: PayoutCalculation[];
  lpPayouts: LPPayoutCalculation[];
}

export function createResolutionSummary(
  market: DBMarket,
  positions: DBPosition[],
  lpPositions: DBLiquidityProvider[],
  outcome: 'yes' | 'no' | 'cancelled'
): ResolutionSummary {
  const totalPool = market.yes_pool + market.no_pool;

  let positionPayouts: PayoutCalculation[];
  let lpPayouts: LPPayoutCalculation[];

  if (outcome === 'cancelled') {
    positionPayouts = calculateCancelledPayouts(positions);
    lpPayouts = calculateLPCancelledPayouts(lpPositions);
  } else {
    positionPayouts = calculatePositionPayouts(positions, market, outcome);
    const totalWinnerPayouts = positionPayouts.reduce((sum, p) => sum + p.payout, 0);
    lpPayouts = calculateLPPayouts(lpPositions, market, totalWinnerPayouts);
  }

  const totalWinnerPayouts = positionPayouts.reduce((sum, p) => sum + p.payout, 0);
  const totalLPPayouts = lpPayouts.reduce((sum, p) => sum + p.payout, 0);

  return {
    marketId: market.id,
    outcome,
    totalPool,
    totalPositions: positions.length,
    totalWinners: positionPayouts.length,
    totalLosers: positions.length - positionPayouts.length,
    totalWinnerPayouts,
    totalLPPayouts,
    positionPayouts,
    lpPayouts,
  };
}
