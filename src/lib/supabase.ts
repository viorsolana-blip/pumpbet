import { createClient } from '@supabase/supabase-js';

// Database types
export interface DBUser {
  id: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
  total_wagered: number;
  total_winnings: number;
  is_banned: boolean;
}

export interface DBMarket {
  id: string;
  creator_id: string | null;
  kol_name: string;
  kol_ticker: string;
  kol_image: string;
  kol_twitter: string | null;
  title: string;
  description: string;
  category: 'kol' | 'crypto' | 'token' | 'other';
  resolution_criteria: string;
  resolution_source: string | null;
  end_time: string;
  resolved_at: string | null;
  outcome: 'yes' | 'no' | 'cancelled' | null;
  yes_pool: number;
  no_pool: number;
  total_lp_shares: number;
  status: 'active' | 'resolved' | 'cancelled';
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBPosition {
  id: string;
  user_id: string;
  market_id: string;
  side: 'yes' | 'no';
  amount: number;
  shares: number;
  entry_price: number;
  tx_signature: string;
  claimed: boolean;
  created_at: string;
}

export interface DBCoin {
  id: string;
  name: string;
  ticker: string;
  image: string | null;
  description: string;
  contract_address: string | null;
  website: string | null;
  twitter: string | null;
  category: 'memecoin' | 'defi' | 'gaming' | 'ai' | 'other';
  submitted_by: string;
  upvotes: number;
  downvotes: number;
  is_featured: boolean;
  market_id: string | null;
  created_at: string;
}

export interface DBVote {
  id: string;
  user_id: string;
  coin_id: string;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface DBLiquidityProvider {
  id: string;
  user_id: string;
  market_id: string;
  amount: number;
  shares: number;
  tx_signature: string;
  withdrawn_at: string | null;
  created_at: string;
}

export interface DBTransaction {
  id: string;
  user_id: string;
  market_id: string | null;
  type: 'deposit' | 'withdrawal' | 'bet' | 'payout' | 'refund' | 'liquidity_add' | 'liquidity_remove';
  amount: number;
  tx_signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
}

// Pending predictions (Launch zone) - awaiting 15 likes to graduate
export interface DBPendingPrediction {
  id: string;
  title: string;
  description: string;
  category: 'kol' | 'crypto' | 'token' | 'sports' | 'politics' | 'other';
  resolution_criteria: string;
  end_date: string;
  likes: number;
  created_by: string | null; // wallet address or null for anonymous
  is_graduated: boolean;
  graduated_market_id: string | null; // market ID once graduated
  created_at: string;
  image_url?: string | null; // optional logo/image for the prediction
}

// Track who liked what prediction (prevent duplicate likes)
export interface DBPredictionLike {
  id: string;
  prediction_id: string;
  user_identifier: string; // wallet address or IP/fingerprint for anonymous
  created_at: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Public client for client-side operations
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Check if Supabase is configured with valid JWT keys
export const isSupabaseConfigured = (): boolean => {
  // Keys must exist and be valid JWTs (start with eyJ)
  const hasValidUrl = !!supabaseUrl && supabaseUrl.includes('supabase.co');
  const hasValidAnonKey = !!supabaseAnonKey && supabaseAnonKey.startsWith('eyJ');
  return hasValidUrl && hasValidAnonKey;
};

// Helper to get the appropriate client
export const getSupabaseClient = (useAdmin = false) => {
  if (useAdmin && supabaseAdmin) {
    return supabaseAdmin;
  }
  if (supabase) {
    return supabase;
  }
  throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
};
