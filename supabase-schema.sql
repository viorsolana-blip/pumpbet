-- ============================================
-- PUMPBET.FUN - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT UNIQUE NOT NULL,
  total_wagered DECIMAL(20, 9) DEFAULT 0,
  total_winnings DECIMAL(20, 9) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_wallet ON users(wallet_address);

-- ============================================
-- MARKETS TABLE (KOL Bets)
-- ============================================
CREATE TABLE IF NOT EXISTS markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID REFERENCES users(id),

  -- KOL Info
  kol_name TEXT NOT NULL,
  kol_ticker TEXT NOT NULL,
  kol_image TEXT,
  kol_twitter TEXT,

  -- Market Details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'kol',

  -- Pools
  yes_pool DECIMAL(20, 9) DEFAULT 0,
  no_pool DECIMAL(20, 9) DEFAULT 0,
  total_lp_shares DECIMAL(20, 9) DEFAULT 0,

  -- Resolution
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  outcome TEXT CHECK (outcome IN ('yes', 'no', 'cancelled')),
  resolved_at TIMESTAMPTZ,

  -- Timestamps
  end_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_end_time ON markets(end_time);

-- ============================================
-- POSITIONS TABLE (User Bets)
-- ============================================
CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  market_id UUID REFERENCES markets(id) NOT NULL,

  side TEXT NOT NULL CHECK (side IN ('yes', 'no')),
  amount DECIMAL(20, 9) NOT NULL,
  shares DECIMAL(20, 9) NOT NULL,
  entry_price DECIMAL(10, 4) NOT NULL,

  tx_signature TEXT,
  claimed BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, market_id, side)
);

CREATE INDEX idx_positions_user ON positions(user_id);
CREATE INDEX idx_positions_market ON positions(market_id);

-- ============================================
-- COINS TABLE (Community Submitted)
-- ============================================
CREATE TABLE IF NOT EXISTS coins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL,
  ticker TEXT NOT NULL,
  description TEXT,
  image TEXT,
  category TEXT DEFAULT 'memecoin' CHECK (category IN ('memecoin', 'defi', 'gaming', 'ai', 'other')),

  contract_address TEXT,
  twitter TEXT,
  website TEXT,

  submitted_by UUID REFERENCES users(id),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,

  is_featured BOOLEAN DEFAULT FALSE,
  market_id UUID REFERENCES markets(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coins_featured ON coins(is_featured);
CREATE INDEX idx_coins_upvotes ON coins(upvotes DESC);

-- ============================================
-- VOTES TABLE (Coin Voting)
-- ============================================
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  coin_id UUID REFERENCES coins(id) NOT NULL,

  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, coin_id)
);

CREATE INDEX idx_votes_coin ON votes(coin_id);
CREATE INDEX idx_votes_user ON votes(user_id);

-- ============================================
-- LIQUIDITY_PROVIDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS liquidity_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  market_id UUID REFERENCES markets(id) NOT NULL,

  amount DECIMAL(20, 9) NOT NULL,
  shares DECIMAL(20, 9) NOT NULL,

  tx_signature TEXT,
  withdrawn_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lp_user ON liquidity_providers(user_id);
CREATE INDEX idx_lp_market ON liquidity_providers(market_id);

-- ============================================
-- TRANSACTIONS TABLE (All SOL Movements)
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  market_id UUID REFERENCES markets(id),

  type TEXT NOT NULL CHECK (type IN ('bet', 'liquidity_add', 'liquidity_remove', 'payout', 'resolution', 'lp_withdrawal')),
  amount DECIMAL(20, 9) NOT NULL,

  tx_signature TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tx_user ON transactions(user_id);
CREATE INDEX idx_tx_status ON transactions(status);

-- ============================================
-- SEED DATA: Sample KOL Markets
-- ============================================
INSERT INTO markets (kol_name, kol_ticker, kol_image, title, description, category, yes_pool, no_pool, end_time) VALUES
('Ansem', '@blknoiz06', '/kols/ansem.jpeg', 'Will Ansem hit 1M followers?', 'Prediction on whether Ansem will reach 1 million Twitter followers by end of Q1 2025', 'kol', 5.5, 4.5, NOW() + INTERVAL '30 days'),
('Cented', '@cikitweet', '/kols/cented.png', 'Will Cented call a 10x?', 'Will Cented successfully call a coin that does 10x within the next month?', 'kol', 3.2, 6.8, NOW() + INTERVAL '30 days'),
('WhiteWhale', '@WhaleChart', '/kols/whitewhale.jpeg', 'WhiteWhale portfolio up?', 'Will WhiteWhale''s public portfolio be up by end of month?', 'kol', 7.1, 2.9, NOW() + INTERVAL '14 days'),
('Orangie', '@orangie', '/kols/orangie.jpeg', 'Orangie 100K tweets?', 'Will Orangie reach 100,000 tweets lifetime?', 'kol', 4.0, 6.0, NOW() + INTERVAL '60 days');

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidity_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Public read access for markets and coins
CREATE POLICY "Markets are viewable by everyone" ON markets FOR SELECT USING (true);
CREATE POLICY "Coins are viewable by everyone" ON coins FOR SELECT USING (true);

-- Authenticated users can insert
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert positions" ON positions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert coins" ON coins FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert LP" ON liquidity_providers FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can insert transactions" ON transactions FOR INSERT WITH CHECK (true);

-- Service role bypass (for server-side operations)
CREATE POLICY "Service role full access users" ON users FOR ALL USING (true);
CREATE POLICY "Service role full access markets" ON markets FOR ALL USING (true);
CREATE POLICY "Service role full access positions" ON positions FOR ALL USING (true);
CREATE POLICY "Service role full access coins" ON coins FOR ALL USING (true);
CREATE POLICY "Service role full access votes" ON votes FOR ALL USING (true);
CREATE POLICY "Service role full access lp" ON liquidity_providers FOR ALL USING (true);
CREATE POLICY "Service role full access tx" ON transactions FOR ALL USING (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER markets_updated_at BEFORE UPDATE ON markets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-promote coins to featured when they hit 15 upvotes
CREATE OR REPLACE FUNCTION check_coin_promotion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.upvotes >= 15 AND NEW.is_featured = FALSE THEN
    NEW.is_featured = TRUE;

    -- Create a betting market for the coin
    INSERT INTO markets (kol_name, kol_ticker, kol_image, title, description, category, end_time)
    VALUES (
      NEW.name,
      NEW.ticker,
      NEW.image,
      'Will ' || NEW.ticker || ' 10x?',
      'Community prediction: Will ' || NEW.name || ' (' || NEW.ticker || ') do a 10x from current price?',
      'token',
      NOW() + INTERVAL '30 days'
    )
    RETURNING id INTO NEW.market_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coin_promotion_check BEFORE UPDATE ON coins
  FOR EACH ROW EXECUTE FUNCTION check_coin_promotion();

SELECT 'Schema created successfully!' AS status;
