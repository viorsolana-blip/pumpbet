// ============================================
// PUMPBET - Database Layer
// Currently uses in-memory + localStorage simulation
// Swap this for Supabase/Postgres in production
// ============================================

import { KOLBet, Position, CreateBetInput, PlaceBetInput, calculateShares } from './types';

// In-memory store (would be replaced with actual DB)
let bets: Map<string, KOLBet> = new Map();
let positions: Map<string, Position> = new Map();

// Initialize with some sample data
// Today is January 16, 2026
function initializeSampleData() {
  const sampleBets: KOLBet[] = [
    {
      id: 'bet-1',
      creatorId: 'system',
      kolName: 'Alon',
      kolTicker: '$ALON',
      kolImage: '/kols/alon.jpeg',
      kolTwitter: '@aaborsh',
      title: '3 Main Tweets',
      description: 'Will Alon post more than 3 main tweets by end of January?',
      category: 'kol',
      resolutionCriteria: 'Count main timeline tweets (not replies) from @aaborsh',
      endTime: new Date('2026-01-31T23:59:59'),
      yesPool: 12.5,
      noPool: 8.3,
      status: 'active',
      isLive: true,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date(),
    },
    {
      id: 'bet-2',
      creatorId: 'system',
      kolName: 'White Whale',
      kolTicker: '$WHALE',
      kolImage: '/kols/whitewhale.jpeg',
      title: '$500M Market Cap',
      description: 'Will White Whale surpass $500M market cap by Feb 28?',
      category: 'kol',
      resolutionCriteria: 'Check DEXScreener for $WHALE market cap',
      resolutionSource: 'https://dexscreener.com',
      endTime: new Date('2026-02-28T23:59:59'),
      yesPool: 25.0,
      noPool: 45.0,
      status: 'active',
      isLive: true,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date(),
    },
    {
      id: 'bet-3',
      creatorId: 'system',
      kolName: 'Cented',
      kolTicker: '$CENTED',
      kolImage: '/kols/cented.png',
      kolTwitter: '@cikifriki_sol',
      title: '465k Followers',
      description: 'Will Cented reach 465k X followers by Jan 23?',
      category: 'kol',
      resolutionCriteria: 'Check @cikifriki_sol follower count on X',
      endTime: new Date('2026-01-23T23:59:59'),
      yesPool: 5.2,
      noPool: 3.8,
      status: 'active',
      isLive: true,
      createdAt: new Date('2026-01-14'),
      updatedAt: new Date(),
    },
    {
      id: 'bet-4',
      creatorId: 'system',
      kolName: 'Orangie',
      kolTicker: '$ORANGIE',
      kolImage: '/kols/orangie.jpeg',
      title: '3 Videos',
      description: 'Will Orangie Web3 release 3 videos by end of January?',
      category: 'kol',
      resolutionCriteria: 'Count YouTube uploads from Orangie Web3 channel',
      endTime: new Date('2026-01-31T23:59:59'),
      yesPool: 8.0,
      noPool: 6.0,
      status: 'active',
      isLive: true,
      createdAt: new Date('2026-01-08'),
      updatedAt: new Date(),
    },
    {
      id: 'bet-5',
      creatorId: 'system',
      kolName: 'Leck',
      kolTicker: '$LECK',
      kolImage: '/kols/leck.png',
      title: 'Top 10 PNL',
      description: 'Will Leck finish Top 10 monthly PNL on KOLscan for January?',
      category: 'kol',
      resolutionCriteria: 'Check KOLscan monthly leaderboard',
      resolutionSource: 'https://kolscan.io',
      endTime: new Date('2026-01-31T23:59:59'),
      yesPool: 15.0,
      noPool: 22.0,
      status: 'active',
      isLive: true,
      createdAt: new Date('2026-01-12'),
      updatedAt: new Date(),
    },
    {
      id: 'bet-6',
      creatorId: 'system',
      kolName: 'Cupsey',
      kolTicker: '$CUPSEY',
      kolImage: '/kols/cupsey.jpeg',
      title: '$675k PNL',
      description: 'Will Cupsey end January with $675k+ PNL?',
      category: 'kol',
      resolutionCriteria: 'Verify PNL on connected wallet tracker',
      endTime: new Date('2026-01-31T23:59:59'),
      yesPool: 10.0,
      noPool: 18.5,
      status: 'active',
      isLive: true,
      createdAt: new Date('2026-01-11'),
      updatedAt: new Date(),
    },
    {
      id: 'bet-7',
      creatorId: 'system',
      kolName: 'Bitcoin',
      kolTicker: '$BTC',
      kolImage: '/kols/bitcoin.webp',
      title: 'BTC $120k',
      description: 'Will Bitcoin surpass $120k by end of February?',
      category: 'crypto',
      resolutionCriteria: 'CoinGecko BTC/USD price',
      resolutionSource: 'https://coingecko.com',
      endTime: new Date('2026-02-28T23:59:59'),
      yesPool: 50.0,
      noPool: 35.0,
      status: 'active',
      isLive: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date(),
    },
    {
      id: 'bet-8',
      creatorId: 'system',
      kolName: 'Dingaling',
      kolTicker: '$DINGA',
      kolImage: '/kols/dingaling.jpeg',
      title: '1M Followers',
      description: 'Will Dingaling reach 1M X followers by end of Q1?',
      category: 'kol',
      resolutionCriteria: 'Check X follower count',
      endTime: new Date('2026-03-31T23:59:59'),
      yesPool: 30.0,
      noPool: 25.0,
      status: 'active',
      isLive: true,
      createdAt: new Date('2026-01-02'),
      updatedAt: new Date(),
    },
  ];

  sampleBets.forEach(bet => bets.set(bet.id, bet));
}

// Initialize on load
initializeSampleData();

// ============================================
// BET OPERATIONS
// ============================================

export async function getAllBets(): Promise<KOLBet[]> {
  return Array.from(bets.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}

export async function getBetById(id: string): Promise<KOLBet | null> {
  return bets.get(id) || null;
}

export async function getActiveBets(): Promise<KOLBet[]> {
  return Array.from(bets.values())
    .filter(bet => bet.status === 'active' && bet.endTime > new Date())
    .sort((a, b) => b.yesPool + b.noPool - (a.yesPool + a.noPool));
}

export async function createBet(input: CreateBetInput): Promise<KOLBet> {
  const id = `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const bet: KOLBet = {
    id,
    creatorId: input.creatorWallet,
    kolName: input.kolName,
    kolTicker: input.kolTicker,
    kolImage: input.kolImage,
    kolTwitter: input.kolTwitter,
    title: input.title,
    description: input.description,
    category: input.category,
    resolutionCriteria: input.resolutionCriteria,
    resolutionSource: input.resolutionSource,
    endTime: new Date(input.endTime),
    yesPool: input.initialYesPool || 0,
    noPool: input.initialNoPool || 0,
    status: 'active',
    isLive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  bets.set(id, bet);
  return bet;
}

export async function resolveBet(
  betId: string,
  outcome: 'yes' | 'no' | 'cancelled'
): Promise<KOLBet | null> {
  const bet = bets.get(betId);
  if (!bet) return null;

  bet.outcome = outcome;
  bet.status = outcome === 'cancelled' ? 'cancelled' : 'resolved';
  bet.resolvedAt = new Date();
  bet.updatedAt = new Date();
  bet.isLive = false;

  bets.set(betId, bet);
  return bet;
}

// ============================================
// POSITION OPERATIONS
// ============================================

export async function placeBet(input: PlaceBetInput): Promise<{ position: Position; bet: KOLBet } | null> {
  const bet = bets.get(input.betId);
  if (!bet || bet.status !== 'active') return null;

  // Calculate shares based on AMM
  const { shares, newYesPool, newNoPool } = calculateShares(
    input.amount,
    input.side,
    bet.yesPool,
    bet.noPool
  );

  // Update bet pools
  bet.yesPool = newYesPool;
  bet.noPool = newNoPool;
  bet.updatedAt = new Date();
  bets.set(bet.id, bet);

  // Create or update position
  const positionKey = `${input.walletAddress}-${input.betId}-${input.side}`;
  const existingPosition = positions.get(positionKey);

  const position: Position = existingPosition
    ? {
        ...existingPosition,
        amount: existingPosition.amount + input.amount,
        shares: existingPosition.shares + shares,
      }
    : {
        id: positionKey,
        odId: input.walletAddress,
        betId: input.betId,
        side: input.side,
        amount: input.amount,
        shares,
        entryPrice: input.side === 'yes'
          ? (bet.noPool / (bet.yesPool + bet.noPool)) * 100
          : (bet.yesPool / (bet.yesPool + bet.noPool)) * 100,
        createdAt: new Date(),
      };

  positions.set(positionKey, position);

  return { position, bet };
}

export async function getPositionsForUser(walletAddress: string): Promise<Position[]> {
  return Array.from(positions.values()).filter(p => p.odId === walletAddress);
}

export async function getPositionsForBet(betId: string): Promise<Position[]> {
  return Array.from(positions.values()).filter(p => p.betId === betId);
}

// ============================================
// AGGREGATIONS
// ============================================

export async function getBetStats(betId: string): Promise<{
  totalPool: number;
  yesPercent: number;
  noPercent: number;
  totalBettors: number;
  yesBettors: number;
  noBettors: number;
} | null> {
  const bet = bets.get(betId);
  if (!bet) return null;

  const betPositions = await getPositionsForBet(betId);
  const yesPositions = betPositions.filter(p => p.side === 'yes');
  const noPositions = betPositions.filter(p => p.side === 'no');

  const totalPool = bet.yesPool + bet.noPool;

  return {
    totalPool,
    yesPercent: totalPool > 0 ? (bet.noPool / totalPool) * 100 : 50,
    noPercent: totalPool > 0 ? (bet.yesPool / totalPool) * 100 : 50,
    totalBettors: new Set(betPositions.map(p => p.odId)).size,
    yesBettors: new Set(yesPositions.map(p => p.odId)).size,
    noBettors: new Set(noPositions.map(p => p.odId)).size,
  };
}

export async function getUserStats(walletAddress: string): Promise<{
  totalBets: number;
  totalInvested: number;
  activeBets: number;
  resolvedBets: number;
}> {
  const userPositions = await getPositionsForUser(walletAddress);
  const betIds = new Set(userPositions.map(p => p.betId));

  let activeBets = 0;
  let resolvedBets = 0;

  for (const betId of Array.from(betIds)) {
    const bet = bets.get(betId);
    if (bet?.status === 'active') activeBets++;
    else if (bet?.status === 'resolved') resolvedBets++;
  }

  return {
    totalBets: betIds.size,
    totalInvested: userPositions.reduce((sum, p) => sum + p.amount, 0),
    activeBets,
    resolvedBets,
  };
}
