import { create } from 'zustand';
import { fetchAllMarkets, generateFlowTrades, searchMarkets } from '@/lib/api/markets';

export type TabType = 'markets' | 'event' | 'flow' | 'research' | 'chat' | 'traders' | 'alerts' | 'portfolio' | 'wallet' | 'bonds' | 'calendar' | 'kols' | 'trenches' | 'coins' | 'launch' | 'new';

export interface Tab {
  id: string;
  type: TabType;
  title: string;
  eventId?: string;
  color?: string;
}

export interface Market {
  id: string;
  title: string;
  description?: string;
  category: string;
  platform: 'polymarket' | 'kalshi';
  image?: string;
  volume: number;
  liquidity: number;
  outcomes: Outcome[];
  closesAt?: string;
  createdAt: string;
}

export interface Outcome {
  id: string;
  name: string;
  price: number;
  priceChange24h?: number;
}

export interface Position {
  id: string;
  marketId: string;
  marketTitle: string;
  outcomeId: string;
  outcomeName: string;
  shares: number;
  avgPrice: number;
  side: 'yes' | 'no';
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export interface Trade {
  id: string;
  time: Date;
  marketId: string;
  marketTitle: string;
  outcomeId: string;
  outcomeName: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  shares: number;
  status: 'pending' | 'filled' | 'cancelled';
}

export interface FlowTrade {
  id: string;
  time: Date;
  marketId: string;
  marketTitle: string;
  marketImage?: string;
  side: 'buy' | 'sell';
  outcome: 'yes' | 'no' | string;
  size: number;
  price: number;
  multiplier: number;
  wallet: string;
  isNew?: boolean;
}

export interface PriceLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderBook {
  bids: PriceLevel[];
  asks: PriceLevel[];
}

export interface Settings {
  polymarketEnabled: boolean;
  kalshiEnabled: boolean;
  darkMode: boolean;
}

export interface KOLBet {
  id: string;
  name: string;
  ticker: string;
  image: string;
  category: 'kol' | 'crypto' | 'token';
  bannerColor: string;
  mainStat: string;
  description: string;
  endTime: Date;
  yesPool: number;
  noPool: number;
  userPosition: number;
  userPnl: string;
  isLive: boolean;
}

// Coin types for community submissions
export interface Coin {
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

// Transaction types for tracking SOL movements
export interface PendingTransaction {
  id: string;
  signature: string;
  type: 'bet' | 'liquidity_add' | 'liquidity_remove' | 'payout';
  amount: number;
  status: 'pending' | 'confirming' | 'confirmed' | 'failed';
  betId?: string;
  side?: 'yes' | 'no';
  createdAt: Date;
}

// Liquidity position types
export interface LiquidityPosition {
  id: string;
  marketId: string;
  amount: number;
  shares: number;
  createdAt: string;
}

// Pending prediction (awaiting 15 likes to graduate)
export interface PendingPrediction {
  id: string;
  title: string;
  description: string;
  category: 'kol' | 'crypto' | 'token' | 'sports' | 'politics' | 'other';
  resolutionCriteria: string;
  endDate: string;
  likes: number;
  createdBy: string | null; // wallet address or null for anonymous
  createdAt: string;
  isGraduated: boolean;
  imageUrl?: string | null; // optional logo/image for the prediction
}

interface AppState {
  // Tabs
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Omit<Tab, 'id'>) => string;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;

  // Split view
  splitView: boolean;
  splitPanels: string[];
  setSplitView: (split: boolean) => void;
  setSplitPanels: (panels: string[]) => void;

  // Markets
  markets: Market[];
  marketsLoading: boolean;
  marketsError: string | null;
  selectedMarket: Market | null;
  selectedOutcome: string | null;
  setMarkets: (markets: Market[]) => void;
  setSelectedMarket: (market: Market | null) => void;
  setSelectedOutcome: (outcomeId: string | null) => void;
  fetchMarkets: () => Promise<void>;
  searchMarkets: (query: string) => Promise<void>;

  // Trading
  orderSide: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  limitPrice: number;
  orderAmount: number;
  setOrderSide: (side: 'buy' | 'sell') => void;
  setOrderType: (type: 'market' | 'limit') => void;
  setLimitPrice: (price: number) => void;
  setOrderAmount: (amount: number) => void;

  // Positions and Trades
  positions: Position[];
  trades: Trade[];
  executeTrade: (trade: Omit<Trade, 'id' | 'time' | 'status'>) => void;
  updatePositions: () => void;

  // Flow
  flowTrades: FlowTrade[];
  flowFilters: {
    minSize: number;
    priceMin: number;
    priceMax: number;
    side: 'all' | 'buy' | 'sell';
    outcome: 'all' | 'yes' | 'no';
    newWalletsOnly: boolean;
  };
  setFlowFilter: (key: string, value: any) => void;
  addFlowTrade: (trade: FlowTrade) => void;
  setFlowTrades: (trades: FlowTrade[]) => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;

  // Modals
  showSettings: boolean;
  showOnboarding: boolean;
  showTutorial: boolean;
  setShowSettings: (show: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setShowTutorial: (show: boolean) => void;

  // Wallet
  walletAddress: string | null;
  walletAddressFull: string | null;
  balance: number;
  isConnected: boolean;
  walletType: 'solana' | 'ethereum' | null;
  setWalletAddress: (address: string | null, full?: string | null) => void;
  setBalance: (balance: number) => void;
  setIsConnected: (connected: boolean) => void;
  setWalletType: (type: 'solana' | 'ethereum' | null) => void;

  // KOL Bets
  kolBets: KOLBet[];
  kolBetsLoading: boolean;
  selectedKolBet: KOLBet | null;
  setSelectedKolBet: (bet: KOLBet | null) => void;
  fetchKolBets: () => Promise<void>;
  placeBet: (betId: string, side: 'yes' | 'no', amount: number) => Promise<{ success: boolean; message: string }>;

  // User Positions
  userPositions: any[];
  fetchUserPositions: () => Promise<void>;

  // Coins (community submissions)
  coins: Coin[];
  coinsLoading: boolean;
  fetchCoins: (category?: string) => Promise<void>;
  submitCoin: (coin: Omit<Coin, 'id' | 'upvotes' | 'downvotes' | 'is_featured' | 'market_id' | 'created_at'>) => Promise<{ success: boolean; message: string }>;
  voteCoin: (coinId: string, voteType: 'up' | 'down') => Promise<{ success: boolean; upvotes: number; downvotes: number; isFeatured: boolean }>;

  // Pending Transactions
  pendingTransactions: PendingTransaction[];
  addPendingTransaction: (tx: PendingTransaction) => void;
  updateTransactionStatus: (signature: string, status: PendingTransaction['status']) => void;
  removePendingTransaction: (signature: string) => void;

  // Liquidity Positions
  userLPPositions: LiquidityPosition[];
  fetchUserLPPositions: () => Promise<void>;
  addLiquidity: (marketId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  removeLiquidity: (marketId: string) => Promise<{ success: boolean; message: string }>;

  // Pending Predictions (Launch zone)
  pendingPredictions: PendingPrediction[];
  pendingPredictionsLoading: boolean;
  fetchPendingPredictions: () => Promise<void>;
  createPendingPrediction: (prediction: Omit<PendingPrediction, 'id' | 'likes' | 'createdAt' | 'isGraduated'>) => Promise<{ success: boolean; message: string; prediction?: PendingPrediction }>;
  likePendingPrediction: (predictionId: string) => Promise<{ success: boolean; likes: number; isGraduated: boolean }>;
}

// Mock data
const mockMarkets: Market[] = [
  {
    id: '1',
    title: 'Los Angeles R',
    category: 'sports',
    platform: 'polymarket',
    volume: 2800000,
    liquidity: 150000,
    outcomes: [
      { id: '1a', name: 'Yes', price: 17.8, priceChange24h: 2.3 },
      { id: '1b', name: 'No', price: 82.2, priceChange24h: -2.3 },
    ],
    closesAt: '2026-02-09',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    title: 'Seattle',
    category: 'sports',
    platform: 'polymarket',
    volume: 3300000,
    liquidity: 200000,
    outcomes: [
      { id: '2a', name: 'Yes', price: 10.95, priceChange24h: 1.5 },
      { id: '2b', name: 'No', price: 89.05, priceChange24h: -1.5 },
    ],
    closesAt: '2026-02-09',
    createdAt: '2024-01-01',
  },
  {
    id: '3',
    title: 'Buffalo',
    category: 'sports',
    platform: 'polymarket',
    volume: 2400000,
    liquidity: 180000,
    outcomes: [
      { id: '3a', name: 'Yes', price: 9.8, priceChange24h: -0.5 },
      { id: '3b', name: 'No', price: 90.2, priceChange24h: 0.5 },
    ],
    closesAt: '2026-02-09',
    createdAt: '2024-01-01',
  },
  {
    id: '4',
    title: 'Green Bay',
    category: 'sports',
    platform: 'polymarket',
    volume: 2100000,
    liquidity: 120000,
    outcomes: [
      { id: '4a', name: 'Yes', price: 9.3, priceChange24h: 0.8 },
      { id: '4b', name: 'No', price: 90.7, priceChange24h: -0.8 },
    ],
    closesAt: '2026-02-09',
    createdAt: '2024-01-01',
  },
  {
    id: '5',
    title: 'Super Bowl Champion 2026',
    category: 'sports',
    platform: 'polymarket',
    image: '/nfl.png',
    volume: 12500000,
    liquidity: 500000,
    outcomes: [
      { id: '5a', name: 'Los Angeles R', price: 18, priceChange24h: 3.2 },
      { id: '5b', name: 'Buffalo', price: 10, priceChange24h: -1.5 },
      { id: '5c', name: 'Seattle', price: 10, priceChange24h: 0.5 },
    ],
    closesAt: '2026-02-09',
    createdAt: '2024-01-01',
  },
  {
    id: '6',
    title: 'Bitcoin Up or Down - January 7, 7:15PM-7:30PM ET',
    category: 'crypto',
    platform: 'polymarket',
    volume: 46000,
    liquidity: 15000,
    outcomes: [
      { id: '6a', name: 'Up', price: 10, priceChange24h: -39 },
      { id: '6b', name: 'Down', price: 91, priceChange24h: 39 },
    ],
    closesAt: '2026-01-07',
    createdAt: '2024-01-01',
  },
  {
    id: '7',
    title: 'Will Bitcoin dip to $85,000 in January?',
    category: 'crypto',
    platform: 'polymarket',
    volume: 250000,
    liquidity: 45000,
    outcomes: [
      { id: '7a', name: 'Yes', price: 60.3, priceChange24h: 5.2 },
      { id: '7b', name: 'No', price: 39.7, priceChange24h: -5.2 },
    ],
    closesAt: '2026-01-31',
    createdAt: '2024-01-01',
  },
  {
    id: '8',
    title: 'OpenAI announces AGI before 2027?',
    category: 'tech',
    platform: 'polymarket',
    volume: 12000,
    liquidity: 8000,
    outcomes: [
      { id: '8a', name: 'Yes', price: 8.5, priceChange24h: 0.3 },
      { id: '8b', name: 'No', price: 91.5, priceChange24h: -0.3 },
    ],
    closesAt: '2027-01-01',
    createdAt: '2024-01-01',
  },
  {
    id: '9',
    title: 'Who will Trump nominate?',
    category: 'politics',
    platform: 'polymarket',
    volume: 12500000,
    liquidity: 800000,
    outcomes: [
      { id: '9a', name: 'Option A', price: 35, priceChange24h: 2.1 },
      { id: '9b', name: 'Option B', price: 28, priceChange24h: -1.5 },
      { id: '9c', name: 'Other', price: 37, priceChange24h: -0.6 },
    ],
    closesAt: '2026-03-01',
    createdAt: '2024-01-01',
  },
  {
    id: '10',
    title: 'Wizards vs. 76ers',
    category: 'sports',
    platform: 'polymarket',
    volume: 1000000,
    liquidity: 50000,
    outcomes: [
      { id: '10a', name: '76ERS', price: 71, priceChange24h: 8 },
      { id: '10b', name: 'WIZARDS', price: 40, priceChange24h: -8 },
    ],
    closesAt: '2026-01-10',
    createdAt: '2024-01-01',
  },
  {
    id: '11',
    title: 'Spread: Wizards -13.5',
    category: 'sports',
    platform: 'polymarket',
    volume: 16000,
    liquidity: 8000,
    outcomes: [
      { id: '11a', name: 'Yes', price: 50, priceChange24h: 0 },
      { id: '11b', name: 'No', price: 50, priceChange24h: 0 },
    ],
    closesAt: '2026-01-10',
    createdAt: '2024-01-01',
  },
  {
    id: '12',
    title: 'Cardinals vs. Rams',
    category: 'sports',
    platform: 'polymarket',
    volume: 136000,
    liquidity: 25000,
    outcomes: [
      { id: '12a', name: 'Cardinals', price: 13, priceChange24h: -2 },
      { id: '12b', name: 'Rams', price: 87, priceChange24h: 2 },
    ],
    closesAt: '2026-01-12',
    createdAt: '2024-01-01',
  },
  {
    id: '13',
    title: 'Will China invade Taiwan by end of 2026?',
    category: 'politics',
    platform: 'polymarket',
    volume: 447000,
    liquidity: 120000,
    outcomes: [
      { id: '13a', name: 'Yes', price: 11.7, priceChange24h: 0.5 },
      { id: '13b', name: 'No', price: 88.3, priceChange24h: -0.5 },
    ],
    closesAt: '2026-12-31',
    createdAt: '2024-01-01',
  },
  {
    id: '14',
    title: 'Celtics vs. Clippers: O/U 219.5',
    category: 'sports',
    platform: 'polymarket',
    volume: 184000,
    liquidity: 35000,
    outcomes: [
      { id: '14a', name: 'Over', price: 51, priceChange24h: 1.2 },
      { id: '14b', name: 'Under', price: 49, priceChange24h: -1.2 },
    ],
    closesAt: '2026-01-11',
    createdAt: '2024-01-01',
  },
  {
    id: '15',
    title: 'Spread: Celtics (-2.5)',
    category: 'sports',
    platform: 'polymarket',
    volume: 418000,
    liquidity: 45000,
    outcomes: [
      { id: '15a', name: 'Celtics', price: 42, priceChange24h: -3.5 },
      { id: '15b', name: 'Clippers', price: 58, priceChange24h: 3.5 },
    ],
    closesAt: '2026-01-11',
    createdAt: '2024-01-01',
  },
  {
    id: '16',
    title: 'Spread: Warriors (-12.5)',
    category: 'sports',
    platform: 'polymarket',
    volume: 943000,
    liquidity: 85000,
    outcomes: [
      { id: '16a', name: 'Warriors', price: 52.9, priceChange24h: 2.1 },
      { id: '16b', name: 'Jazz', price: 47.1, priceChange24h: -2.1 },
    ],
    closesAt: '2026-01-11',
    createdAt: '2024-01-01',
  },
];

const mockFlowTrades: FlowTrade[] = [
  {
    id: '1',
    time: new Date(Date.now() - 6 * 60000),
    marketId: '7',
    marketTitle: 'Will Bitcoin dip to $85,000 in J...',
    side: 'buy',
    outcome: 'N',
    size: 25000,
    price: 60.3,
    multiplier: 1.7,
    wallet: '0x635c...45c6',
    isNew: true,
  },
  {
    id: '2',
    time: new Date(Date.now() - 20 * 60000),
    marketId: '12',
    marketTitle: 'Cardinals vs. Rams',
    side: 'buy',
    outcome: 'R',
    size: 13600,
    price: 87,
    multiplier: 1.1,
    wallet: '0x0d16...d24d',
  },
  {
    id: '3',
    time: new Date(Date.now() - 41 * 60000),
    marketId: '14',
    marketTitle: 'Celtics vs. Clippers: O/U 219.5',
    side: 'buy',
    outcome: 'O',
    size: 18400,
    price: 51,
    multiplier: 2.0,
    wallet: '0x68dd...f0b2',
    isNew: true,
  },
  {
    id: '4',
    time: new Date(Date.now() - 41 * 60000),
    marketId: '14',
    marketTitle: 'Celtics vs. Clippers: O/U 219.5',
    side: 'buy',
    outcome: 'U',
    size: 10400,
    price: 49,
    multiplier: 2.0,
    wallet: '0xbf42...d698',
    isNew: true,
  },
  {
    id: '5',
    time: new Date(Date.now() - 41 * 60000),
    marketId: '14',
    marketTitle: 'Celtics vs. Clippers: O/U 219.5',
    side: 'buy',
    outcome: 'U',
    size: 24500,
    price: 49,
    multiplier: 2.0,
    wallet: '0xbf42...d698',
    isNew: true,
  },
  {
    id: '6',
    time: new Date(Date.now() - 45 * 60000),
    marketId: '13',
    marketTitle: 'Will China invade Taiwan by en...',
    side: 'buy',
    outcome: 'N',
    size: 10000,
    price: 88,
    multiplier: 1.1,
    wallet: '0x2fcb...e48f',
  },
  {
    id: '7',
    time: new Date(Date.now() - 45 * 60000),
    marketId: '13',
    marketTitle: 'Will China invade Taiwan by en...',
    side: 'buy',
    outcome: 'N',
    size: 44700,
    price: 88,
    multiplier: 1.1,
    wallet: '0xb9d8...275a',
  },
  {
    id: '8',
    time: new Date(Date.now() - 46 * 60000),
    marketId: '13',
    marketTitle: 'Will China invade Taiwan by en...',
    side: 'buy',
    outcome: 'Y',
    size: 17500,
    price: 11.7,
    multiplier: 8.5,
    wallet: '0x9026...d7e4',
    isNew: true,
  },
  {
    id: '9',
    time: new Date(Date.now() - 49 * 60000),
    marketId: '15',
    marketTitle: 'Spread: Celtics (-2.5)',
    side: 'buy',
    outcome: 'C',
    size: 41800,
    price: 42,
    multiplier: 2.4,
    wallet: '0xbf42...d698',
    isNew: true,
  },
  {
    id: '10',
    time: new Date(Date.now() - 50 * 60000),
    marketId: '10',
    marketTitle: 'Celtics vs. Clippers',
    side: 'buy',
    outcome: 'C',
    size: 10100,
    price: 48,
    multiplier: 2.1,
    wallet: '0xe6a3...2f0d',
    isNew: true,
  },
  {
    id: '11',
    time: new Date(Date.now() - 59 * 60000),
    marketId: '16',
    marketTitle: 'Spread: Warriors (-12.5)',
    side: 'buy',
    outcome: 'W',
    size: 94300,
    price: 52.9,
    multiplier: 1.9,
    wallet: '0x3c3a...8679',
  },
  {
    id: '12',
    time: new Date(Date.now() - 59 * 60000),
    marketId: '16',
    marketTitle: 'Spread: Warriors (-12.5)',
    side: 'buy',
    outcome: 'J',
    size: 54300,
    price: 47,
    multiplier: 2.1,
    wallet: '0xe90b...5da2',
  },
];

// Mock KOL bets data
const mockKOLBets: KOLBet[] = [
  {
    id: 'kol-1',
    name: 'Alon',
    ticker: '$ALON',
    image: '/kols/alon.jpeg',
    category: 'kol',
    bannerColor: '#3B82F6',
    mainStat: '3 Main Tweets',
    description: 'Will Alon have More than 3 Main Tweets This Month',
    endTime: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    yesPool: 0,
    noPool: 0,
    userPosition: 0,
    userPnl: 'N/A',
    isLive: true,
  },
  {
    id: 'kol-2',
    name: 'White Whale',
    ticker: '$WHALE',
    image: '/kols/whitewhale.jpeg',
    category: 'kol',
    bannerColor: '#3B82F6',
    mainStat: '$500 Million',
    description: 'Will the White Whale surpass $500 Million Market Cap By February',
    endTime: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    yesPool: 0.01,
    noPool: 0.05,
    userPosition: 0,
    userPnl: 'N/A',
    isLive: true,
  },
  {
    id: 'kol-3',
    name: 'Cented',
    ticker: '$CENTED',
    image: '/kols/cented.png',
    category: 'kol',
    bannerColor: '#3B82F6',
    mainStat: '465k Followers',
    description: 'Will Cented reach 465k X Followers in the Next 7 Days',
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 16 * 60 * 60 * 1000),
    yesPool: 0,
    noPool: 0,
    userPosition: 0,
    userPnl: 'N/A',
    isLive: true,
  },
  {
    id: 'kol-4',
    name: 'Orangie',
    ticker: '$ORANGIE',
    image: '/kols/orangie.jpeg',
    category: 'kol',
    bannerColor: '#3B82F6',
    mainStat: '3 Posts',
    description: 'Will Orangie Web3 Release 3 Videos This January',
    endTime: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    yesPool: 0,
    noPool: 0,
    userPosition: 0,
    userPnl: 'N/A',
    isLive: true,
  },
  {
    id: 'kol-5',
    name: 'Leck',
    ticker: '$LECK',
    image: '/kols/leck.png',
    category: 'kol',
    bannerColor: '#3B82F6',
    mainStat: 'Top 10',
    description: 'Will Leck Finish Top 10 Monthly PNL on KOL scan',
    endTime: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    yesPool: 0,
    noPool: 0,
    userPosition: 0,
    userPnl: 'N/A',
    isLive: true,
  },
  {
    id: 'kol-6',
    name: 'Cupsey',
    ticker: '$CUPSEY',
    image: '/kols/cupsey.jpeg',
    category: 'kol',
    bannerColor: '#3B82F6',
    mainStat: '$675k PNL',
    description: 'Will Cupsey end January with a $675k PNL',
    endTime: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    yesPool: 0,
    noPool: 0.13,
    userPosition: 0,
    userPnl: 'N/A',
    isLive: true,
  },
  {
    id: 'kol-7',
    name: 'Bitcoin',
    ticker: '$BITCOIN',
    image: '/kols/bitcoin.webp',
    category: 'crypto',
    bannerColor: '#3B82F6',
    mainStat: '$100k',
    description: 'Will Bitcoin Surpass $100k By February',
    endTime: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    yesPool: 0,
    noPool: 0,
    userPosition: 0,
    userPnl: 'N/A',
    isLive: true,
  },
  {
    id: 'kol-8',
    name: 'Dingaling',
    ticker: '$DINGALING',
    image: '/kols/dingaling.jpeg',
    category: 'kol',
    bannerColor: '#3B82F6',
    mainStat: '1M Followers',
    description: 'Will Dingaling reach 1M X Followers This Quarter',
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    yesPool: 0.5,
    noPool: 0.25,
    userPosition: 0,
    userPnl: 'N/A',
    isLive: true,
  },
];

export const useStore = create<AppState>((set, get) => ({
  // Tabs - Multi-panel default view: Trenches (KOL+Markets), Whale Flow, Chat
  tabs: [
    { id: 'tab-1', type: 'trenches', title: 'Trenches', color: '#3B82F6' },
    { id: 'tab-2', type: 'flow', title: 'Whale Flow', color: '#22c55e' },
    { id: 'tab-3', type: 'chat', title: 'Chat', color: '#f59e0b' },
  ],
  activeTabId: 'tab-1',

  // Split view mode - shows multiple panels side by side
  splitView: true,
  splitPanels: ['tab-1', 'tab-2', 'tab-3'] as string[],

  addTab: (tab) => {
    const id = `tab-${Date.now()}`;
    set((state) => ({
      tabs: [...state.tabs, { ...tab, id }],
      activeTabId: id,
    }));
    return id;
  },

  removeTab: (id) => {
    set((state) => {
      const newTabs = state.tabs.filter((t) => t.id !== id);
      let newActiveId = state.activeTabId;
      if (state.activeTabId === id) {
        const idx = state.tabs.findIndex((t) => t.id === id);
        newActiveId = newTabs[Math.min(idx, newTabs.length - 1)]?.id || null;
      }
      return { tabs: newTabs, activeTabId: newActiveId };
    });
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  // Split view setters
  setSplitView: (split) => set({ splitView: split }),
  setSplitPanels: (panels) => set({ splitPanels: panels }),

  // Markets
  markets: mockMarkets,
  marketsLoading: false,
  marketsError: null,
  selectedMarket: null,
  selectedOutcome: null,
  setMarkets: (markets) => set({ markets }),
  setSelectedMarket: (market) => set({ selectedMarket: market, selectedOutcome: market?.outcomes[0]?.id || null }),
  setSelectedOutcome: (outcomeId) => set({ selectedOutcome: outcomeId }),

  fetchMarkets: async () => {
    const { settings } = get();
    set({ marketsLoading: true, marketsError: null });
    try {
      // Build platform filter
      let platform = 'all';
      if (settings.polymarketEnabled && !settings.kalshiEnabled) {
        platform = 'polymarket';
      } else if (!settings.polymarketEnabled && settings.kalshiEnabled) {
        platform = 'kalshi';
      }

      // Fetch from server-side API route to avoid CORS
      const response = await fetch(`/api/markets?platform=${platform}`);
      const data = await response.json();

      if (data.markets && data.markets.length > 0) {
        // Generate flow trades from real market data
        const flowTrades = generateFlowTrades(data.markets);
        set({ markets: data.markets, flowTrades, marketsLoading: false });
        console.log(`Loaded ${data.total} markets (Polymarket: ${data.polymarketCount}, Kalshi: ${data.kalshiCount})`);
      } else {
        // Fallback to mock data if API fails
        set({ markets: mockMarkets, marketsLoading: false });
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
      set({ markets: mockMarkets, marketsError: 'Failed to load markets', marketsLoading: false });
    }
  },

  searchMarkets: async (query: string) => {
    if (!query.trim()) {
      get().fetchMarkets();
      return;
    }
    set({ marketsLoading: true, marketsError: null });
    try {
      // Search through server API
      const response = await fetch(`/api/markets?search=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.markets && data.markets.length > 0) {
        set({ markets: data.markets, marketsLoading: false });
      } else {
        set({ markets: [], marketsLoading: false });
      }
    } catch (error) {
      console.error('Error searching markets:', error);
      set({ marketsError: 'Search failed', marketsLoading: false });
    }
  },

  // Trading
  orderSide: 'buy',
  orderType: 'limit',
  limitPrice: 50,
  orderAmount: 0,
  setOrderSide: (side) => set({ orderSide: side }),
  setOrderType: (type) => set({ orderType: type }),
  setLimitPrice: (price) => set({ limitPrice: price }),
  setOrderAmount: (amount) => set({ orderAmount: amount }),

  // Positions and Trades
  positions: [],
  trades: [],
  executeTrade: (tradeData) => {
    const trade: Trade = {
      ...tradeData,
      id: `trade-${Date.now()}`,
      time: new Date(),
      status: 'filled',
    };

    set((state) => {
      const newTrades = [trade, ...state.trades];

      // Update or create position
      const existingPositionIdx = state.positions.findIndex(
        (p) => p.marketId === trade.marketId && p.outcomeId === trade.outcomeId
      );

      let newPositions = [...state.positions];
      const shares = trade.amount / (trade.price / 100);

      if (existingPositionIdx >= 0) {
        const existingPos = newPositions[existingPositionIdx];
        if (trade.side === 'buy') {
          const totalShares = existingPos.shares + shares;
          const avgPrice = ((existingPos.avgPrice * existingPos.shares) + (trade.price * shares)) / totalShares;
          newPositions[existingPositionIdx] = {
            ...existingPos,
            shares: totalShares,
            avgPrice,
            currentPrice: trade.price,
            pnl: (trade.price - avgPrice) * totalShares / 100,
            pnlPercent: ((trade.price - avgPrice) / avgPrice) * 100,
          };
        } else {
          const remainingShares = existingPos.shares - shares;
          if (remainingShares <= 0) {
            newPositions = newPositions.filter((_, idx) => idx !== existingPositionIdx);
          } else {
            newPositions[existingPositionIdx] = {
              ...existingPos,
              shares: remainingShares,
              pnl: (trade.price - existingPos.avgPrice) * remainingShares / 100,
              pnlPercent: ((trade.price - existingPos.avgPrice) / existingPos.avgPrice) * 100,
            };
          }
        }
      } else if (trade.side === 'buy') {
        newPositions.push({
          id: `pos-${Date.now()}`,
          marketId: trade.marketId,
          marketTitle: trade.marketTitle,
          outcomeId: trade.outcomeId,
          outcomeName: trade.outcomeName,
          shares,
          avgPrice: trade.price,
          side: 'yes',
          currentPrice: trade.price,
          pnl: 0,
          pnlPercent: 0,
        });
      }

      // Update balance
      const newBalance = trade.side === 'buy'
        ? state.balance - trade.amount
        : state.balance + trade.amount;

      return {
        trades: newTrades,
        positions: newPositions,
        balance: Math.max(0, newBalance),
        orderAmount: 0, // Reset order amount after trade
      };
    });
  },
  updatePositions: () => {
    set((state) => {
      const { markets, positions } = state;
      const updatedPositions = positions.map((pos) => {
        const market = markets.find((m) => m.id === pos.marketId);
        const outcome = market?.outcomes.find((o) => o.id === pos.outcomeId);
        const currentPrice = outcome?.price || pos.currentPrice;
        return {
          ...pos,
          currentPrice,
          pnl: (currentPrice - pos.avgPrice) * pos.shares / 100,
          pnlPercent: ((currentPrice - pos.avgPrice) / pos.avgPrice) * 100,
        };
      });
      return { positions: updatedPositions };
    });
  },

  // Flow
  flowTrades: mockFlowTrades,
  flowFilters: {
    minSize: 10000,
    priceMin: 1,
    priceMax: 90,
    side: 'all',
    outcome: 'all',
    newWalletsOnly: false,
  },
  setFlowFilter: (key, value) => set((state) => ({
    flowFilters: { ...state.flowFilters, [key]: value },
  })),
  addFlowTrade: (trade) => set((state) => ({
    flowTrades: [trade, ...state.flowTrades].slice(0, 100), // Keep max 100 trades
  })),
  setFlowTrades: (trades) => set({ flowTrades: trades }),

  // Settings
  settings: {
    polymarketEnabled: true,
    kalshiEnabled: true,
    darkMode: true,
  },
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
  })),

  // Modals
  showSettings: false,
  showOnboarding: false,
  showTutorial: true, // Show by default, will be hidden after first view
  setShowSettings: (show) => set({ showSettings: show }),
  setShowOnboarding: (show) => set({ showOnboarding: show }),
  setShowTutorial: (show) => set({ showTutorial: show }),

  // Wallet
  walletAddress: null,
  walletAddressFull: null,
  balance: 0,
  isConnected: false,
  walletType: null,
  setWalletAddress: (address, full) => set({ walletAddress: address, walletAddressFull: full ?? address }),
  setBalance: (balance) => set({ balance }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setWalletType: (type) => set({ walletType: type }),

  // KOL Bets
  kolBets: mockKOLBets,
  kolBetsLoading: false,
  selectedKolBet: null,
  setSelectedKolBet: (bet) => set({ selectedKolBet: bet }),

  fetchKolBets: async () => {
    set({ kolBetsLoading: true });
    try {
      const response = await fetch('/api/bets?status=active');
      const data = await response.json();

      if (data.success && data.bets) {
        // Transform API bets to match the KOLBet interface
        const transformedBets: KOLBet[] = data.bets.map((bet: any) => ({
          id: bet.id,
          name: bet.kolName,
          ticker: bet.kolTicker,
          image: bet.kolImage,
          category: bet.category,
          bannerColor: '#3B82F6',
          mainStat: bet.title,
          description: bet.description,
          endTime: new Date(bet.endTime),
          yesPool: bet.yesPool,
          noPool: bet.noPool,
          userPosition: 0,
          userPnl: 'N/A',
          isLive: bet.status === 'active',
        }));
        set({ kolBets: transformedBets, kolBetsLoading: false });
      } else {
        set({ kolBetsLoading: false });
      }
    } catch (error) {
      console.error('Error fetching KOL bets:', error);
      set({ kolBetsLoading: false });
    }
  },

  placeBet: async (betId, side, amount) => {
    const { walletAddressFull, isConnected, walletType, addPendingTransaction, updateTransactionStatus, removePendingTransaction } = get();

    if (!isConnected || !walletAddressFull) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    if (amount <= 0) {
      return { success: false, message: 'Amount must be greater than 0' };
    }

    // For Solana wallet - use real SOL transfer
    if (walletType === 'solana') {
      const phantom = (window as any).phantom?.solana;
      if (!phantom) {
        return { success: false, message: 'Phantom wallet not found' };
      }

      try {
        // Step 1: Prepare the transaction on the server
        const prepareResponse = await fetch(`/api/bets/${betId}/prepare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            side,
            amount,
            walletAddress: walletAddressFull,
          }),
        });

        const prepareData = await prepareResponse.json();

        if (!prepareData.success) {
          return { success: false, message: prepareData.error || 'Failed to prepare transaction' };
        }

        // Step 2: Deserialize and sign the transaction
        const { Transaction, VersionedTransaction } = await import('@solana/web3.js');
        const transactionBuffer = Buffer.from(prepareData.transaction, 'base64');

        let signedTransaction;
        try {
          // Try versioned transaction first
          const transaction = VersionedTransaction.deserialize(transactionBuffer);
          signedTransaction = await phantom.signTransaction(transaction);
        } catch {
          // Fallback to legacy transaction
          const transaction = Transaction.from(transactionBuffer);
          signedTransaction = await phantom.signTransaction(transaction);
        }

        // Step 3: Send the signed transaction
        const { Connection } = await import('@solana/web3.js');
        const connection = new Connection(
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
          'confirmed'
        );

        const rawTransaction = signedTransaction.serialize();
        const signature = await connection.sendRawTransaction(rawTransaction, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });

        // Add to pending transactions
        const txId = `tx-${Date.now()}`;
        addPendingTransaction({
          id: txId,
          signature,
          type: 'bet',
          amount,
          status: 'confirming',
          betId,
          side,
          createdAt: new Date(),
        });

        // Step 4: Confirm the transaction with the server
        const confirmResponse = await fetch(`/api/bets/${betId}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signature,
            side,
            amount,
            walletAddress: walletAddressFull,
          }),
        });

        const confirmData = await confirmResponse.json();

        if (confirmData.success) {
          updateTransactionStatus(signature, 'confirmed');
          // Remove from pending after a short delay to show success state
          setTimeout(() => removePendingTransaction(signature), 5000);

          // Deduct from balance locally
          set((state) => ({ balance: Math.max(0, state.balance - amount) }));
          // Refresh bets to get updated pools
          get().fetchKolBets();
          get().fetchUserPositions();
          return {
            success: true,
            message: `Bet placed successfully! TX: ${signature.slice(0, 8)}...`
          };
        } else {
          updateTransactionStatus(signature, 'failed');
          return { success: false, message: confirmData.error || 'Transaction verification failed' };
        }
      } catch (error: any) {
        console.error('Error placing bet:', error);
        if (error.code === 4001 || error.message?.includes('rejected')) {
          return { success: false, message: 'Transaction rejected by user' };
        }
        if (error.message?.includes('insufficient')) {
          return { success: false, message: 'Insufficient SOL balance' };
        }
        return { success: false, message: error.message || 'Failed to process transaction' };
      }
    }

    // Fallback for non-Solana wallets or demo mode
    try {
      const response = await fetch(`/api/bets/${betId}/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          side,
          amount,
          walletAddress: walletAddressFull,
        }),
      });

      const data = await response.json();

      if (data.success) {
        get().fetchKolBets();
        get().fetchUserPositions();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Failed to place bet' };
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // User Positions
  userPositions: [],
  fetchUserPositions: async () => {
    const { walletAddress, isConnected } = get();

    if (!isConnected || !walletAddress) {
      set({ userPositions: [] });
      return;
    }

    try {
      const response = await fetch(`/api/user/positions?wallet=${walletAddress}`);
      const data = await response.json();

      if (data.success) {
        set({ userPositions: data.positions });
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  },

  // Coins (community submissions)
  coins: [],
  coinsLoading: false,

  fetchCoins: async (category?: string) => {
    set({ coinsLoading: true });
    try {
      const url = category && category !== 'all'
        ? `/api/coins?category=${category}`
        : '/api/coins';
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.coins) {
        set({ coins: data.coins, coinsLoading: false });
      } else {
        set({ coinsLoading: false });
      }
    } catch (error) {
      console.error('Error fetching coins:', error);
      set({ coinsLoading: false });
    }
  },

  submitCoin: async (coin) => {
    const { walletAddressFull, isConnected } = get();

    if (!isConnected || !walletAddressFull) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    try {
      const response = await fetch('/api/coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...coin,
          walletAddress: walletAddressFull,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Refresh coins list
        get().fetchCoins();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Failed to submit coin' };
      }
    } catch (error) {
      console.error('Error submitting coin:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  voteCoin: async (coinId, voteType) => {
    const { walletAddressFull, isConnected } = get();

    if (!isConnected || !walletAddressFull) {
      return { success: false, upvotes: 0, downvotes: 0, isFeatured: false };
    }

    try {
      const response = await fetch(`/api/coins/${coinId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voteType,
          walletAddress: walletAddressFull,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update coin in local state
        set((state) => ({
          coins: state.coins.map((c) =>
            c.id === coinId
              ? {
                  ...c,
                  upvotes: data.upvotes,
                  downvotes: data.downvotes,
                  is_featured: data.isFeatured,
                  market_id: data.marketId || c.market_id,
                }
              : c
          ),
        }));

        // If coin was just promoted, refresh KOL bets
        if (data.wasPromoted) {
          get().fetchKolBets();
        }

        return {
          success: true,
          upvotes: data.upvotes,
          downvotes: data.downvotes,
          isFeatured: data.isFeatured,
        };
      } else {
        return { success: false, upvotes: 0, downvotes: 0, isFeatured: false };
      }
    } catch (error) {
      console.error('Error voting on coin:', error);
      return { success: false, upvotes: 0, downvotes: 0, isFeatured: false };
    }
  },

  // Pending Transactions
  pendingTransactions: [],

  addPendingTransaction: (tx) => {
    set((state) => ({
      pendingTransactions: [tx, ...state.pendingTransactions],
    }));
  },

  updateTransactionStatus: (idOrSignature, status) => {
    set((state) => ({
      pendingTransactions: state.pendingTransactions.map((tx) =>
        (tx.id === idOrSignature || tx.signature === idOrSignature) ? { ...tx, status } : tx
      ),
    }));
  },

  removePendingTransaction: (idOrSignature) => {
    set((state) => ({
      pendingTransactions: state.pendingTransactions.filter(
        (tx) => tx.id !== idOrSignature && tx.signature !== idOrSignature
      ),
    }));
  },

  // Liquidity Positions
  userLPPositions: [],

  fetchUserLPPositions: async () => {
    const { walletAddressFull, isConnected, kolBets } = get();

    if (!isConnected || !walletAddressFull) {
      set({ userLPPositions: [] });
      return;
    }

    try {
      // Fetch LP positions for each market
      const lpPositions: LiquidityPosition[] = [];

      for (const bet of kolBets) {
        const response = await fetch(
          `/api/markets/${bet.id}/liquidity?wallet=${walletAddressFull}`
        );
        const data = await response.json();

        if (data.success && data.userPosition) {
          lpPositions.push({
            id: data.userPosition.id,
            marketId: bet.id,
            amount: data.userPosition.amount,
            shares: data.userPosition.shares,
            createdAt: data.userPosition.createdAt,
          });
        }
      }

      set({ userLPPositions: lpPositions });
    } catch (error) {
      console.error('Error fetching LP positions:', error);
    }
  },

  addLiquidity: async (marketId, amount) => {
    const { walletAddressFull, isConnected, walletType, addPendingTransaction, updateTransactionStatus, removePendingTransaction } = get();

    if (!isConnected || !walletAddressFull) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    if (amount <= 0) {
      return { success: false, message: 'Amount must be greater than 0' };
    }

    // For Solana wallet - use real SOL transfer
    if (walletType === 'solana') {
      const phantom = (window as any).phantom?.solana;
      if (!phantom) {
        return { success: false, message: 'Phantom wallet not found' };
      }

      try {
        // Step 1: Prepare the transaction
        const prepareResponse = await fetch(`/api/markets/${marketId}/liquidity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'prepare',
            amount,
            walletAddress: walletAddressFull,
          }),
        });

        const prepareData = await prepareResponse.json();

        if (!prepareData.success) {
          return { success: false, message: prepareData.error || 'Failed to prepare transaction' };
        }

        // Demo mode check
        if (prepareData.isDemo) {
          // Skip actual transaction signing in demo mode
          const addResponse = await fetch(`/api/markets/${marketId}/liquidity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'add',
              amount,
              walletAddress: walletAddressFull,
            }),
          });

          const addData = await addResponse.json();

          if (addData.success) {
            get().fetchUserLPPositions();
            get().fetchKolBets();
            return { success: true, message: addData.message };
          } else {
            return { success: false, message: addData.error || 'Failed to add liquidity' };
          }
        }

        // Step 2: Sign and send transaction
        const { Transaction, VersionedTransaction, Connection } = await import('@solana/web3.js');
        const transactionBuffer = Buffer.from(prepareData.transaction, 'base64');

        let signedTransaction;
        try {
          const transaction = VersionedTransaction.deserialize(transactionBuffer);
          signedTransaction = await phantom.signTransaction(transaction);
        } catch {
          const transaction = Transaction.from(transactionBuffer);
          signedTransaction = await phantom.signTransaction(transaction);
        }

        const connection = new Connection(
          process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
          'confirmed'
        );

        const rawTransaction = signedTransaction.serialize();
        const signature = await connection.sendRawTransaction(rawTransaction, {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        });

        // Add to pending transactions
        addPendingTransaction({
          id: `lp-${Date.now()}`,
          signature,
          type: 'liquidity_add',
          amount,
          status: 'confirming',
          betId: marketId,
          createdAt: new Date(),
        });

        // Step 3: Confirm with server
        const confirmResponse = await fetch(`/api/markets/${marketId}/liquidity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add',
            amount,
            walletAddress: walletAddressFull,
            signature,
          }),
        });

        const confirmData = await confirmResponse.json();

        if (confirmData.success) {
          updateTransactionStatus(signature, 'confirmed');
          setTimeout(() => removePendingTransaction(signature), 5000);

          get().fetchUserLPPositions();
          get().fetchKolBets();
          return {
            success: true,
            message: `Added ${amount} SOL liquidity! TX: ${signature.slice(0, 8)}...`
          };
        } else {
          updateTransactionStatus(signature, 'failed');
          return { success: false, message: confirmData.error || 'Failed to confirm liquidity' };
        }
      } catch (error: any) {
        console.error('Error adding liquidity:', error);
        if (error.code === 4001 || error.message?.includes('rejected')) {
          return { success: false, message: 'Transaction rejected by user' };
        }
        return { success: false, message: error.message || 'Failed to add liquidity' };
      }
    }

    // Demo mode fallback
    try {
      const response = await fetch(`/api/markets/${marketId}/liquidity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          amount,
          walletAddress: walletAddressFull,
        }),
      });

      const data = await response.json();

      if (data.success) {
        get().fetchUserLPPositions();
        get().fetchKolBets();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Failed to add liquidity' };
      }
    } catch (error) {
      console.error('Error adding liquidity:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  removeLiquidity: async (marketId) => {
    const { walletAddressFull, isConnected, userLPPositions } = get();

    if (!isConnected || !walletAddressFull) {
      return { success: false, message: 'Please connect your wallet first' };
    }

    const lpPosition = userLPPositions.find(lp => lp.marketId === marketId);
    if (!lpPosition) {
      return { success: false, message: 'No liquidity position found for this market' };
    }

    try {
      const response = await fetch(`/api/markets/${marketId}/liquidity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          walletAddress: walletAddressFull,
          lpPositionId: lpPosition.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        get().fetchUserLPPositions();
        get().fetchKolBets();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.error || 'Failed to remove liquidity' };
      }
    } catch (error) {
      console.error('Error removing liquidity:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  // Pending Predictions (Launch zone)
  pendingPredictions: [],
  pendingPredictionsLoading: false,

  fetchPendingPredictions: async () => {
    set({ pendingPredictionsLoading: true });
    try {
      const response = await fetch('/api/launch');
      const data = await response.json();

      if (data.success && data.predictions) {
        // Transform snake_case API fields to camelCase for frontend
        const transformedPredictions: PendingPrediction[] = data.predictions.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          category: p.category,
          resolutionCriteria: p.resolution_criteria || p.resolutionCriteria,
          endDate: p.end_date || p.endDate,
          likes: p.likes,
          createdBy: p.created_by || p.createdBy,
          createdAt: p.created_at || p.createdAt,
          isGraduated: p.is_graduated || p.isGraduated || false,
          imageUrl: p.image_url || p.imageUrl || null,
        }));
        set({ pendingPredictions: transformedPredictions, pendingPredictionsLoading: false });
      } else {
        set({ pendingPredictionsLoading: false });
      }
    } catch (error) {
      console.error('Error fetching pending predictions:', error);
      set({ pendingPredictionsLoading: false });
    }
  },

  createPendingPrediction: async (prediction) => {
    try {
      const response = await fetch('/api/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prediction),
      });

      const data = await response.json();

      if (data.success) {
        get().fetchPendingPredictions();
        return { success: true, message: 'Prediction created!', prediction: data.prediction };
      } else {
        return { success: false, message: data.error || 'Failed to create prediction' };
      }
    } catch (error) {
      console.error('Error creating prediction:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  likePendingPrediction: async (predictionId) => {
    try {
      const response = await fetch(`/api/launch/${predictionId}/like`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        set((state) => ({
          pendingPredictions: state.pendingPredictions.map((p) =>
            p.id === predictionId
              ? { ...p, likes: data.likes, isGraduated: data.isGraduated }
              : p
          ).filter((p) => !p.isGraduated), // Remove graduated ones
        }));

        // If graduated, refresh KOL bets
        if (data.isGraduated) {
          get().fetchKolBets();
        }

        return { success: true, likes: data.likes, isGraduated: data.isGraduated };
      } else {
        return { success: false, likes: 0, isGraduated: false };
      }
    } catch (error) {
      console.error('Error liking prediction:', error);
      return { success: false, likes: 0, isGraduated: false };
    }
  },
}));
