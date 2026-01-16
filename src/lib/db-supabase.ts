import {
  supabaseAdmin,
  isSupabaseConfigured,
  DBUser,
  DBMarket,
  DBPosition,
  DBCoin,
  DBVote,
  DBLiquidityProvider,
  DBTransaction
} from './supabase';
import { Position } from './types';
import { KOLBet } from '@/store';

// ============ USER OPERATIONS ============

export async function getOrCreateUser(walletAddress: string): Promise<DBUser | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  // Try to get existing user
  const { data: existing } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (existing) return existing;

  // Create new user
  const { data: newUser, error } = await supabaseAdmin
    .from('users')
    .insert({ wallet_address: walletAddress })
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return newUser;
}

export async function getUserByWallet(walletAddress: string): Promise<DBUser | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (error) return null;
  return data;
}

// ============ MARKET (BET) OPERATIONS ============

export async function getAllMarkets(status?: string, category?: string): Promise<DBMarket[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return [];

  let query = supabaseAdmin.from('markets').select('*');

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching markets:', error);
    return [];
  }

  return data || [];
}

export async function getMarketById(id: string): Promise<DBMarket | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('markets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createMarket(market: {
  creator_id?: string;
  kol_name: string;
  kol_ticker: string;
  kol_image: string;
  kol_twitter?: string;
  title: string;
  description: string;
  category: string;
  resolution_criteria: string;
  resolution_source?: string;
  end_time: Date;
}): Promise<DBMarket | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('markets')
    .insert({
      ...market,
      end_time: market.end_time.toISOString(),
      yes_pool: 0,
      no_pool: 0,
      total_lp_shares: 0,
      status: 'active',
      is_featured: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating market:', error);
    return null;
  }

  return data;
}

export async function updateMarketPools(
  marketId: string,
  yesPoolDelta: number,
  noPoolDelta: number
): Promise<DBMarket | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  // Get current market
  const market = await getMarketById(marketId);
  if (!market) return null;

  const { data, error } = await supabaseAdmin
    .from('markets')
    .update({
      yes_pool: market.yes_pool + yesPoolDelta,
      no_pool: market.no_pool + noPoolDelta,
      updated_at: new Date().toISOString(),
    })
    .eq('id', marketId)
    .select()
    .single();

  if (error) {
    console.error('Error updating market pools:', error);
    return null;
  }

  return data;
}

export async function resolveMarket(
  marketId: string,
  outcome: 'yes' | 'no' | 'cancelled'
): Promise<DBMarket | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('markets')
    .update({
      status: outcome === 'cancelled' ? 'cancelled' : 'resolved',
      outcome,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', marketId)
    .select()
    .single();

  if (error) {
    console.error('Error resolving market:', error);
    return null;
  }

  return data;
}

// ============ POSITION OPERATIONS ============

export async function createPosition(position: {
  user_id: string;
  market_id: string;
  side: 'yes' | 'no';
  amount: number;
  shares: number;
  entry_price: number;
  tx_signature: string;
}): Promise<DBPosition | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('positions')
    .insert({
      ...position,
      claimed: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating position:', error);
    return null;
  }

  return data;
}

export async function getPositionsByUser(userId: string): Promise<DBPosition[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('positions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching positions:', error);
    return [];
  }

  return data || [];
}

export async function getPositionsByMarket(marketId: string): Promise<DBPosition[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('positions')
    .select('*')
    .eq('market_id', marketId);

  if (error) {
    console.error('Error fetching positions:', error);
    return [];
  }

  return data || [];
}

export async function markPositionClaimed(positionId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('positions')
    .update({ claimed: true })
    .eq('id', positionId);

  return !error;
}

// ============ COIN OPERATIONS ============

export async function getAllCoins(category?: string): Promise<DBCoin[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return [];

  let query = supabaseAdmin.from('coins').select('*');

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching coins:', error);
    return [];
  }

  return data || [];
}

export async function getCoinById(id: string): Promise<DBCoin | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('coins')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

export async function createCoin(coin: {
  name: string;
  ticker: string;
  image?: string;
  description: string;
  contract_address?: string;
  website?: string;
  twitter?: string;
  category: string;
  submitted_by: string;
}): Promise<DBCoin | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('coins')
    .insert({
      ...coin,
      upvotes: 0,
      downvotes: 0,
      is_featured: false,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating coin:', error);
    return null;
  }

  return data;
}

export async function updateCoinVotes(
  coinId: string,
  upvotesDelta: number,
  downvotesDelta: number
): Promise<DBCoin | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  const coin = await getCoinById(coinId);
  if (!coin) return null;

  const newUpvotes = coin.upvotes + upvotesDelta;
  const newDownvotes = coin.downvotes + downvotesDelta;

  const { data, error } = await supabaseAdmin
    .from('coins')
    .update({
      upvotes: newUpvotes,
      downvotes: newDownvotes,
    })
    .eq('id', coinId)
    .select()
    .single();

  if (error) {
    console.error('Error updating coin votes:', error);
    return null;
  }

  // Check for auto-promotion at 15 upvotes
  if (newUpvotes >= 15 && !data.is_featured) {
    await promoteCoin(coinId);
  }

  return data;
}

export async function promoteCoin(coinId: string): Promise<DBMarket | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  const coin = await getCoinById(coinId);
  if (!coin || coin.is_featured) return null;

  // Create a betting market for this coin
  const market = await createMarket({
    kol_name: coin.name,
    kol_ticker: coin.ticker,
    kol_image: coin.image || '/default-coin.png',
    title: `${coin.ticker} Price Milestone`,
    description: `Will ${coin.name} (${coin.ticker}) reach a significant price milestone? Community promoted coin with ${coin.upvotes} upvotes.`,
    category: 'token',
    resolution_criteria: 'Based on DEXScreener/CoinGecko price data',
    end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  if (market) {
    // Update coin as featured and link to market
    await supabaseAdmin
      .from('coins')
      .update({
        is_featured: true,
        market_id: market.id,
      })
      .eq('id', coinId);
  }

  return market;
}

// ============ VOTE OPERATIONS ============

export async function getUserVote(userId: string, coinId: string): Promise<DBVote | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('votes')
    .select('*')
    .eq('user_id', userId)
    .eq('coin_id', coinId)
    .single();

  if (error) return null;
  return data;
}

export async function createOrUpdateVote(
  userId: string,
  coinId: string,
  voteType: 'up' | 'down'
): Promise<{ vote: DBVote | null; previousVote: DBVote | null }> {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return { vote: null, previousVote: null };
  }

  const previousVote = await getUserVote(userId, coinId);

  if (previousVote) {
    if (previousVote.vote_type === voteType) {
      // Same vote - remove it (toggle off)
      await supabaseAdmin.from('votes').delete().eq('id', previousVote.id);

      // Update coin counts
      const delta = voteType === 'up' ? -1 : 0;
      const downDelta = voteType === 'down' ? -1 : 0;
      await updateCoinVotes(coinId, delta, downDelta);

      return { vote: null, previousVote };
    } else {
      // Different vote - update it
      const { data, error } = await supabaseAdmin
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', previousVote.id)
        .select()
        .single();

      if (!error) {
        // Update coin counts (swing vote)
        if (voteType === 'up') {
          await updateCoinVotes(coinId, 1, -1);
        } else {
          await updateCoinVotes(coinId, -1, 1);
        }
      }

      return { vote: data, previousVote };
    }
  }

  // New vote
  const { data, error } = await supabaseAdmin
    .from('votes')
    .insert({ user_id: userId, coin_id: coinId, vote_type: voteType })
    .select()
    .single();

  if (!error) {
    const upDelta = voteType === 'up' ? 1 : 0;
    const downDelta = voteType === 'down' ? 1 : 0;
    await updateCoinVotes(coinId, upDelta, downDelta);
  }

  return { vote: data, previousVote: null };
}

// ============ LIQUIDITY OPERATIONS ============

export async function addLiquidity(lp: {
  user_id: string;
  market_id: string;
  amount: number;
  shares: number;
  tx_signature: string;
}): Promise<DBLiquidityProvider | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('liquidity_providers')
    .insert(lp)
    .select()
    .single();

  if (error) {
    console.error('Error adding liquidity:', error);
    return null;
  }

  // Update market LP shares
  const market = await getMarketById(lp.market_id);
  if (market) {
    await supabaseAdmin
      .from('markets')
      .update({
        total_lp_shares: market.total_lp_shares + lp.shares,
        yes_pool: market.yes_pool + (lp.amount / 2),
        no_pool: market.no_pool + (lp.amount / 2),
      })
      .eq('id', lp.market_id);
  }

  return data;
}

export async function removeLiquidity(
  lpId: string,
  withdrawAmount: number
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('liquidity_providers')
    .update({ withdrawn_at: new Date().toISOString() })
    .eq('id', lpId);

  return !error;
}

export async function getLPPositionsByUser(userId: string): Promise<DBLiquidityProvider[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('liquidity_providers')
    .select('*')
    .eq('user_id', userId)
    .is('withdrawn_at', null);

  if (error) return [];
  return data || [];
}

export async function getLPPositionsByMarket(marketId: string): Promise<DBLiquidityProvider[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('liquidity_providers')
    .select('*')
    .eq('market_id', marketId)
    .is('withdrawn_at', null);

  if (error) return [];
  return data || [];
}

// ============ TRANSACTION OPERATIONS ============

export async function createTransaction(tx: {
  user_id: string;
  market_id?: string;
  type: string;
  amount: number;
  tx_signature: string;
  status?: string;
}): Promise<DBTransaction | null> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .insert({
      ...tx,
      status: tx.status || 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return null;
  }

  return data;
}

export async function updateTransactionStatus(
  txSignature: string,
  status: 'pending' | 'confirmed' | 'failed'
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return false;

  const { error } = await supabaseAdmin
    .from('transactions')
    .update({ status })
    .eq('tx_signature', txSignature);

  return !error;
}

export async function getTransactionsByUser(userId: string): Promise<DBTransaction[]> {
  if (!isSupabaseConfigured() || !supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data || [];
}

// ============ HELPER: Convert DB Market to KOLBet format ============

export function dbMarketToKOLBet(market: DBMarket): KOLBet {
  return {
    id: market.id,
    name: market.kol_name,
    ticker: market.kol_ticker,
    image: market.kol_image,
    category: market.category as 'kol' | 'crypto' | 'token',
    bannerColor: '#3B82F6',
    mainStat: market.title,
    description: market.description,
    endTime: new Date(market.end_time),
    yesPool: market.yes_pool,
    noPool: market.no_pool,
    userPosition: 0,
    userPnl: 'N/A',
    isLive: market.status === 'active',
  };
}

// ============ PLACE BET (FULL FLOW) ============

export async function placeBetWithTransaction(
  walletAddress: string,
  marketId: string,
  side: 'yes' | 'no',
  amount: number,
  txSignature: string
): Promise<{ success: boolean; message: string; position?: DBPosition }> {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return { success: false, message: 'Database not configured' };
  }

  // 1. Get or create user
  const user = await getOrCreateUser(walletAddress);
  if (!user) {
    return { success: false, message: 'Failed to get/create user' };
  }

  // 2. Get market
  const market = await getMarketById(marketId);
  if (!market) {
    return { success: false, message: 'Market not found' };
  }

  if (market.status !== 'active') {
    return { success: false, message: 'Market is not active' };
  }

  if (new Date(market.end_time) < new Date()) {
    return { success: false, message: 'Market has ended' };
  }

  // 3. Calculate shares using AMM
  const totalPool = market.yes_pool + market.no_pool;
  const price = side === 'yes'
    ? totalPool > 0 ? (market.yes_pool / totalPool) * 100 : 50
    : totalPool > 0 ? (market.no_pool / totalPool) * 100 : 50;
  const shares = (amount / price) * 100;

  // 4. Create transaction record
  const tx = await createTransaction({
    user_id: user.id,
    market_id: marketId,
    type: 'bet',
    amount,
    tx_signature: txSignature,
    status: 'confirmed',
  });

  if (!tx) {
    return { success: false, message: 'Failed to record transaction' };
  }

  // 5. Update market pools
  if (side === 'yes') {
    await updateMarketPools(marketId, amount, 0);
  } else {
    await updateMarketPools(marketId, 0, amount);
  }

  // 6. Create position
  const position = await createPosition({
    user_id: user.id,
    market_id: marketId,
    side,
    amount,
    shares,
    entry_price: price,
    tx_signature: txSignature,
  });

  if (!position) {
    return { success: false, message: 'Failed to create position' };
  }

  // 7. Update user stats
  await supabaseAdmin
    .from('users')
    .update({
      total_wagered: user.total_wagered + amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  return {
    success: true,
    message: `Successfully placed ${amount} SOL on ${side.toUpperCase()}`,
    position,
  };
}
