import { create } from 'zustand';
import { fetchAllMarkets, generateFlowTrades, searchMarkets } from '@/lib/api/markets';

export type TabType = 'markets' | 'event' | 'flow' | 'research' | 'chat' | 'traders' | 'alerts' | 'portfolio' | 'wallet' | 'bonds' | 'calendar' | 'new';

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
  balance: number;
  isConnected: boolean;
  walletType: 'solana' | 'ethereum' | null;
  setWalletAddress: (address: string | null) => void;
  setBalance: (balance: number) => void;
  setIsConnected: (connected: boolean) => void;
  setWalletType: (type: 'solana' | 'ethereum' | null) => void;
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

export const useStore = create<AppState>((set, get) => ({
  // Tabs - Multi-panel default view: Markets, Whale Flow, Quick Chat
  tabs: [
    { id: 'tab-1', type: 'markets', title: 'Markets', color: '#ff0000' },
    { id: 'tab-2', type: 'flow', title: 'Whale Flow', color: '#22c55e' },
    { id: 'tab-3', type: 'chat', title: 'Quick Chat', color: '#f59e0b' },
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
  balance: 0,
  isConnected: false,
  walletType: null,
  setWalletAddress: (address) => set({ walletAddress: address }),
  setBalance: (balance) => set({ balance }),
  setIsConnected: (connected) => set({ isConnected: connected }),
  setWalletType: (type) => set({ walletType: type }),
}));
