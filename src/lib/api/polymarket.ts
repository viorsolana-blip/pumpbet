// Polymarket API Service
// Uses the public Gamma API for market data

const GAMMA_API_BASE = 'https://gamma-api.polymarket.com';

export interface PolymarketEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string;
  icon: string;
  active: boolean;
  closed: boolean;
  archived: boolean;
  new: boolean;
  featured: boolean;
  restricted: boolean;
  liquidity: number;
  volume: number;
  openInterest: number;
  competitionId?: string;
  markets: PolymarketMarket[];
}

export interface PolymarketMarket {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  endDate: string;
  liquidity: string;
  startDate: string;
  image: string;
  icon: string;
  description: string;
  outcomes: string[];
  outcomePrices: string[];
  volume: string;
  active: boolean;
  closed: boolean;
  marketType: string;
  groupItemTitle?: string;
  groupItemThreshold?: string;
}

export interface PolymarketApiResponse {
  data: PolymarketEvent[];
  next_cursor?: string;
}

// Fetch markets from Polymarket
export async function fetchPolymarketMarkets(options?: {
  limit?: number;
  active?: boolean;
  closed?: boolean;
  tag?: string;
}): Promise<PolymarketEvent[]> {
  try {
    const params = new URLSearchParams();
    params.append('limit', String(options?.limit || 50));
    if (options?.active !== undefined) params.append('active', String(options.active));
    if (options?.closed !== undefined) params.append('closed', String(options.closed));
    if (options?.tag) params.append('tag', options.tag);

    const response = await fetch(`${GAMMA_API_BASE}/events?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const data = await response.json();
    return data || [];
  } catch (error) {
    console.error('Error fetching Polymarket markets:', error);
    return [];
  }
}

// Fetch a single event by slug
export async function fetchPolymarketEvent(slug: string): Promise<PolymarketEvent | null> {
  try {
    const response = await fetch(`${GAMMA_API_BASE}/events/${slug}`);

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Polymarket event:', error);
    return null;
  }
}

// Search markets
export async function searchPolymarketMarkets(query: string): Promise<PolymarketEvent[]> {
  try {
    const response = await fetch(
      `${GAMMA_API_BASE}/events?title_contains=${encodeURIComponent(query)}&limit=20`
    );

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    return await response.json() || [];
  } catch (error) {
    console.error('Error searching Polymarket markets:', error);
    return [];
  }
}

// Fetch trending/popular markets
export async function fetchTrendingMarkets(): Promise<PolymarketEvent[]> {
  try {
    const response = await fetch(
      `${GAMMA_API_BASE}/events?active=true&closed=false&order=volume&ascending=false&limit=30`
    );

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    return await response.json() || [];
  } catch (error) {
    console.error('Error fetching trending markets:', error);
    return [];
  }
}

// Map category from Polymarket tags
export function mapPolymarketCategory(event: PolymarketEvent): string {
  const title = event.title.toLowerCase();

  if (title.includes('bitcoin') || title.includes('btc') || title.includes('eth') ||
      title.includes('crypto') || title.includes('solana')) {
    return 'crypto';
  }
  if (title.includes('super bowl') || title.includes('nfl') || title.includes('nba') ||
      title.includes('vs.') || title.includes('spread') || title.includes('game') ||
      title.includes('champion')) {
    return 'sports';
  }
  if (title.includes('trump') || title.includes('biden') || title.includes('election') ||
      title.includes('president') || title.includes('congress') || title.includes('senate') ||
      title.includes('political')) {
    return 'politics';
  }
  if (title.includes('ai') || title.includes('openai') || title.includes('google') ||
      title.includes('apple') || title.includes('microsoft') || title.includes('tech')) {
    return 'tech';
  }

  return 'other';
}
