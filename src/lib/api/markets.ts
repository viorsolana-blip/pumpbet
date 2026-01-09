// Unified Markets API Service
// Combines Polymarket and Kalshi data into a unified format

import { Market, Outcome, FlowTrade } from '@/store';
import {
  fetchPolymarketMarkets,
  fetchTrendingMarkets,
  searchPolymarketMarkets,
  mapPolymarketCategory,
  PolymarketEvent,
} from './polymarket';
import {
  fetchKalshiMarkets,
  fetchKalshiEvents,
  mapKalshiCategory,
  KalshiMarket,
  KalshiEvent,
} from './kalshi';

// Convert Polymarket event to unified Market format
function polymarketEventToMarket(event: PolymarketEvent): Market[] {
  // Each market in the event becomes a separate Market
  return event.markets.map((market, idx) => {
    const prices = market.outcomePrices
      ? (typeof market.outcomePrices === 'string' ? JSON.parse(market.outcomePrices) : market.outcomePrices)
      : ['0.5', '0.5'];
    const outcomes: Outcome[] = (market.outcomes || ['Yes', 'No']).map((name, i) => ({
      id: `${market.id}-${i}`,
      name,
      price: parseFloat(prices[i] || '0.5') * 100,
      priceChange24h: Math.random() * 10 - 5, // API doesn't provide this, using random for now
    }));

    return {
      id: market.id || `pm-${event.id}-${idx}`,
      title: market.question || market.groupItemTitle || event.title,
      description: market.description || event.description,
      category: mapPolymarketCategory(event),
      platform: 'polymarket' as const,
      image: market.image || event.image,
      volume: parseFloat(market.volume || '0'),
      liquidity: parseFloat(market.liquidity || '0'),
      outcomes,
      closesAt: market.endDate || event.endDate,
      createdAt: market.startDate || event.startDate,
    };
  });
}

// Convert Polymarket event with single market
function polymarketEventToSingleMarket(event: PolymarketEvent): Market | null {
  if (!event.markets || event.markets.length === 0) {
    return null;
  }

  const market = event.markets[0];
  const prices = market.outcomePrices
    ? (typeof market.outcomePrices === 'string' ? JSON.parse(market.outcomePrices) : market.outcomePrices)
    : ['0.5', '0.5'];
  const outcomes: Outcome[] = (market.outcomes || ['Yes', 'No']).map((name, i) => ({
    id: `${market.id}-${i}`,
    name,
    price: parseFloat(prices[i] || '0.5') * 100,
    priceChange24h: Math.random() * 10 - 5,
  }));

  return {
    id: market.id || event.id,
    title: event.title,
    description: event.description,
    category: mapPolymarketCategory(event),
    platform: 'polymarket' as const,
    image: event.image,
    volume: event.volume || parseFloat(market.volume || '0'),
    liquidity: event.liquidity || parseFloat(market.liquidity || '0'),
    outcomes,
    closesAt: event.endDate,
    createdAt: event.startDate,
  };
}

// Convert Kalshi market to unified Market format
function kalshiMarketToMarket(market: KalshiMarket): Market {
  const yesPrice = market.yes_bid ? market.yes_bid / 100 : 0.5;
  const noPrice = market.no_bid ? market.no_bid / 100 : 0.5;

  const outcomes: Outcome[] = [
    {
      id: `${market.ticker}-yes`,
      name: market.yes_sub_title || 'Yes',
      price: yesPrice * 100,
      priceChange24h: Math.random() * 10 - 5,
    },
    {
      id: `${market.ticker}-no`,
      name: market.no_sub_title || 'No',
      price: noPrice * 100,
      priceChange24h: Math.random() * 10 - 5,
    },
  ];

  return {
    id: market.ticker,
    title: market.title,
    description: market.subtitle,
    category: mapKalshiCategory(market),
    platform: 'kalshi' as const,
    volume: market.volume || 0,
    liquidity: market.open_interest || 0,
    outcomes,
    closesAt: market.expiration_time,
    createdAt: market.close_time,
  };
}

// Fetch all markets from both platforms
export async function fetchAllMarkets(options?: {
  polymarketEnabled?: boolean;
  kalshiEnabled?: boolean;
  limit?: number;
}): Promise<Market[]> {
  const markets: Market[] = [];
  const promises: Promise<void>[] = [];

  // Fetch from Polymarket
  if (options?.polymarketEnabled !== false) {
    promises.push(
      fetchTrendingMarkets().then((events) => {
        events.forEach((event) => {
          const market = polymarketEventToSingleMarket(event);
          if (market) {
            markets.push(market);
          }
        });
      })
    );
  }

  // Fetch from Kalshi
  if (options?.kalshiEnabled !== false) {
    promises.push(
      fetchKalshiMarkets({ limit: options?.limit || 30, status: 'open' }).then((kalshiMarkets) => {
        kalshiMarkets.forEach((market) => {
          markets.push(kalshiMarketToMarket(market));
        });
      })
    );
  }

  await Promise.all(promises);

  // Sort by volume descending
  return markets.sort((a, b) => b.volume - a.volume);
}

// Search markets across both platforms
export async function searchMarkets(query: string): Promise<Market[]> {
  const markets: Market[] = [];

  // Search Polymarket
  const polyEvents = await searchPolymarketMarkets(query);
  polyEvents.forEach((event) => {
    const market = polymarketEventToSingleMarket(event);
    if (market) {
      markets.push(market);
    }
  });

  return markets.sort((a, b) => b.volume - a.volume);
}

// Generate mock flow trades from market data
export function generateFlowTrades(markets: Market[]): FlowTrade[] {
  const trades: FlowTrade[] = [];
  const now = Date.now();

  // Generate random trades from the markets
  markets.slice(0, 15).forEach((market, idx) => {
    const trade: FlowTrade = {
      id: `flow-${now}-${idx}`,
      time: new Date(now - Math.random() * 3600000), // Random time in last hour
      marketId: market.id,
      marketTitle: market.title.length > 30 ? market.title.slice(0, 30) + '...' : market.title,
      marketImage: market.image,
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      outcome: market.outcomes[0]?.name?.charAt(0) || 'Y',
      size: Math.floor(Math.random() * 90000) + 10000, // $10K - $100K
      price: market.outcomes[0]?.price || 50,
      multiplier: 1 + Math.random() * 2,
      wallet: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
      isNew: Math.random() > 0.7,
    };
    trades.push(trade);
  });

  return trades.sort((a, b) => b.time.getTime() - a.time.getTime());
}

// Generate a single flow trade from a random market
export function generateSingleFlowTrade(markets: Market[]): FlowTrade | null {
  if (markets.length === 0) return null;

  const market = markets[Math.floor(Math.random() * Math.min(markets.length, 20))];
  const outcome = market.outcomes[Math.floor(Math.random() * market.outcomes.length)];
  const isNewWallet = Math.random() > 0.7;
  const isBuy = Math.random() > 0.3; // More buys than sells typically

  // Generate whale-sized trades
  const sizeMultiplier = Math.random();
  let size: number;
  if (sizeMultiplier > 0.95) {
    size = Math.floor(Math.random() * 400000) + 100000; // $100K - $500K mega whale
  } else if (sizeMultiplier > 0.8) {
    size = Math.floor(Math.random() * 80000) + 50000; // $50K - $130K large whale
  } else {
    size = Math.floor(Math.random() * 40000) + 10000; // $10K - $50K standard whale
  }

  return {
    id: `flow-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    time: new Date(),
    marketId: market.id,
    marketTitle: market.title.length > 30 ? market.title.slice(0, 30) + '...' : market.title,
    marketImage: market.image,
    side: isBuy ? 'buy' : 'sell',
    outcome: outcome?.name?.charAt(0) || 'Y',
    size,
    price: outcome?.price || 50,
    multiplier: Number((100 / (outcome?.price || 50)).toFixed(1)),
    wallet: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
    isNew: isNewWallet,
  };
}
