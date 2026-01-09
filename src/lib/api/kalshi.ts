// Kalshi API Service
// Uses the public API for market data

const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  volume: number;
  volume_24h: number;
  open_interest: number;
  status: string;
  result: string | null;
  expiration_time: string;
  close_time: string;
  category: string;
  rules_primary: string;
  yes_sub_title: string;
  no_sub_title: string;
}

export interface KalshiEvent {
  event_ticker: string;
  title: string;
  subtitle: string;
  category: string;
  markets: KalshiMarket[];
  mutually_exclusive: boolean;
  series_ticker: string;
  strike_date: string | null;
}

export interface KalshiMarketsResponse {
  markets: KalshiMarket[];
  cursor: string | null;
}

export interface KalshiEventsResponse {
  events: KalshiEvent[];
  cursor: string | null;
}

// Fetch markets from Kalshi
export async function fetchKalshiMarkets(options?: {
  limit?: number;
  cursor?: string;
  status?: string;
}): Promise<KalshiMarket[]> {
  try {
    const params = new URLSearchParams();
    params.append('limit', String(options?.limit || 50));
    if (options?.cursor) params.append('cursor', options.cursor);
    if (options?.status) params.append('status', options.status);

    const response = await fetch(`${KALSHI_API_BASE}/markets?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Kalshi API error: ${response.status}`);
    }

    const data: KalshiMarketsResponse = await response.json();
    return data.markets || [];
  } catch (error) {
    console.error('Error fetching Kalshi markets:', error);
    return [];
  }
}

// Fetch events from Kalshi
export async function fetchKalshiEvents(options?: {
  limit?: number;
  cursor?: string;
  status?: string;
  series_ticker?: string;
}): Promise<KalshiEvent[]> {
  try {
    const params = new URLSearchParams();
    params.append('limit', String(options?.limit || 50));
    if (options?.cursor) params.append('cursor', options.cursor);
    if (options?.status) params.append('status', options.status);
    if (options?.series_ticker) params.append('series_ticker', options.series_ticker);

    const response = await fetch(`${KALSHI_API_BASE}/events?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Kalshi API error: ${response.status}`);
    }

    const data: KalshiEventsResponse = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching Kalshi events:', error);
    return [];
  }
}

// Fetch a single market
export async function fetchKalshiMarket(ticker: string): Promise<KalshiMarket | null> {
  try {
    const response = await fetch(`${KALSHI_API_BASE}/markets/${ticker}`);

    if (!response.ok) {
      throw new Error(`Kalshi API error: ${response.status}`);
    }

    const data = await response.json();
    return data.market || null;
  } catch (error) {
    console.error('Error fetching Kalshi market:', error);
    return null;
  }
}

// Map Kalshi category
export function mapKalshiCategory(market: KalshiMarket | KalshiEvent): string {
  const category = ('category' in market ? market.category : '').toLowerCase();
  const title = market.title.toLowerCase();

  if (category.includes('crypto') || title.includes('bitcoin') || title.includes('ethereum')) {
    return 'crypto';
  }
  if (category.includes('sports') || title.includes('nfl') || title.includes('nba')) {
    return 'sports';
  }
  if (category.includes('politic') || category.includes('election') ||
      title.includes('trump') || title.includes('biden') || title.includes('congress')) {
    return 'politics';
  }
  if (category.includes('tech') || title.includes('ai') || title.includes('openai')) {
    return 'tech';
  }

  return 'other';
}
