import { NextResponse } from 'next/server';

// Using reliable API endpoints
const POLYMARKET_CLOB_API = 'https://clob.polymarket.com';
const GAMMA_API = 'https://gamma-api.polymarket.com';
const KALSHI_API = 'https://api.elections.kalshi.com/trade-api/v2';

interface PolymarketEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  image: string;
  active: boolean;
  closed: boolean;
  liquidity: number;
  volume: number;
  markets: any[];
}

interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  title: string;
  subtitle: string;
  yes_bid: number;
  no_bid: number;
  volume: number;
  open_interest: number;
  expiration_time: string;
  close_time: string;
  category: string;
  yes_sub_title: string;
  no_sub_title: string;
}

// Mock Polymarket markets (since API is geo-restricted)
function getMockPolymarketMarkets(): any[] {
  const mockMarkets = [
    { id: 'poly-btc-200k', title: 'Bitcoin above $200,000 by end of 2026?', category: 'crypto', volume: 4200000, liquidity: 890000, yesPrice: 42, image: 'https://polymarket.com/images/bitcoin.png' },
    { id: 'poly-btc-150k-march', title: 'Bitcoin above $150,000 by March 2026?', category: 'crypto', volume: 2800000, liquidity: 650000, yesPrice: 67, image: '' },
    { id: 'poly-eth-10k', title: 'Ethereum above $10,000 in 2026?', category: 'crypto', volume: 1950000, liquidity: 420000, yesPrice: 38, image: '' },
    { id: 'poly-sol-500', title: 'Solana above $500 in 2026?', category: 'crypto', volume: 980000, liquidity: 210000, yesPrice: 25, image: '' },
    { id: 'poly-trump-2028', title: 'Trump runs for president in 2028?', category: 'politics', volume: 3100000, liquidity: 780000, yesPrice: 73, image: '' },
    { id: 'poly-newsom-2028', title: 'Gavin Newsom Democratic nominee 2028?', category: 'politics', volume: 1200000, liquidity: 340000, yesPrice: 31, image: '' },
    { id: 'poly-desantis-2028', title: 'DeSantis runs in 2028?', category: 'politics', volume: 890000, liquidity: 230000, yesPrice: 45, image: '' },
    { id: 'poly-fed-rate-cut', title: 'Fed cuts rates before July 2026?', category: 'politics', volume: 2400000, liquidity: 560000, yesPrice: 58, image: '' },
    { id: 'poly-chiefs-sb', title: 'Chiefs win Super Bowl LX?', category: 'sports', volume: 1800000, liquidity: 450000, yesPrice: 28, image: '' },
    { id: 'poly-eagles-sb', title: 'Eagles win Super Bowl LX?', category: 'sports', volume: 1500000, liquidity: 380000, yesPrice: 22, image: '' },
    { id: 'poly-49ers-sb', title: '49ers win Super Bowl LX?', category: 'sports', volume: 1300000, liquidity: 320000, yesPrice: 18, image: '' },
    { id: 'poly-celtics-nba', title: 'Celtics win 2026 NBA Championship?', category: 'sports', volume: 980000, liquidity: 240000, yesPrice: 35, image: '' },
    { id: 'poly-lakers-nba', title: 'Lakers win 2026 NBA Championship?', category: 'sports', volume: 750000, liquidity: 180000, yesPrice: 12, image: '' },
    { id: 'poly-gpt5-2026', title: 'GPT-5 released in 2026?', category: 'tech', volume: 2100000, liquidity: 520000, yesPrice: 82, image: '' },
    { id: 'poly-agi-2030', title: 'AGI achieved by 2030?', category: 'tech', volume: 1600000, liquidity: 400000, yesPrice: 28, image: '' },
    { id: 'poly-apple-ai', title: 'Apple releases AI model in 2026?', category: 'tech', volume: 890000, liquidity: 210000, yesPrice: 65, image: '' },
    { id: 'poly-tesla-fsd', title: 'Tesla achieves full self-driving in 2026?', category: 'tech', volume: 1100000, liquidity: 280000, yesPrice: 23, image: '' },
    { id: 'poly-xrp-10', title: 'XRP above $10 in 2026?', category: 'crypto', volume: 720000, liquidity: 170000, yesPrice: 15, image: '' },
    { id: 'poly-doge-1', title: 'Dogecoin above $1 in 2026?', category: 'crypto', volume: 650000, liquidity: 150000, yesPrice: 19, image: '' },
    { id: 'poly-recession-2026', title: 'US recession in 2026?', category: 'politics', volume: 1900000, liquidity: 480000, yesPrice: 34, image: '' },
    { id: 'poly-world-series', title: 'Yankees win 2026 World Series?', category: 'sports', volume: 520000, liquidity: 130000, yesPrice: 14, image: '' },
    { id: 'poly-dodgers-ws', title: 'Dodgers win 2026 World Series?', category: 'sports', volume: 480000, liquidity: 120000, yesPrice: 16, image: '' },
    { id: 'poly-tiktok-ban', title: 'TikTok banned in US by end of 2026?', category: 'tech', volume: 1400000, liquidity: 350000, yesPrice: 42, image: '' },
    { id: 'poly-twitter-profitable', title: 'X (Twitter) profitable in 2026?', category: 'tech', volume: 780000, liquidity: 190000, yesPrice: 55, image: '' },
  ];

  return mockMarkets.map(m => ({
    id: m.id,
    title: m.title,
    description: '',
    category: m.category,
    platform: 'polymarket',
    image: m.image,
    volume: m.volume,
    liquidity: m.liquidity,
    outcomes: [
      { id: `${m.id}-yes`, name: 'Yes', price: m.yesPrice, priceChange24h: (Math.random() - 0.5) * 8 },
      { id: `${m.id}-no`, name: 'No', price: 100 - m.yesPrice, priceChange24h: (Math.random() - 0.5) * 8 },
    ],
    closesAt: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

// Fetch Polymarket events (with fallback to mock data)
async function fetchPolymarketEvents(): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `${GAMMA_API}/events?active=true&closed=false&limit=100&order=volume&ascending=false`,
      {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      }
    );
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.log('Polymarket API unavailable, using mock data');
  }

  // Return mock data when API is unavailable
  return getMockPolymarketMarkets();
}

interface KalshiEvent {
  event_ticker: string;
  title: string;
  sub_title: string;
  category: string;
}

// Fetch Kalshi events for proper titles
async function fetchKalshiEvents(): Promise<Map<string, KalshiEvent>> {
  const eventMap = new Map<string, KalshiEvent>();
  let cursor: string | null = null;
  let attempts = 0;
  const maxAttempts = 5;

  try {
    while (attempts < maxAttempts) {
      const params = new URLSearchParams();
      params.append('limit', '100');
      params.append('status', 'open');
      if (cursor) params.append('cursor', cursor);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        `${KALSHI_API}/events?${params.toString()}`,
        {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) break;

      const data = await response.json();
      if (data.events && data.events.length > 0) {
        data.events.forEach((e: KalshiEvent) => {
          eventMap.set(e.event_ticker, e);
        });
        cursor = data.cursor;
        attempts++;
        if (!cursor) break;
      } else {
        break;
      }
    }
  } catch (error) {
    console.error('Error fetching Kalshi events:', error);
  }

  return eventMap;
}

// Mock Kalshi markets for supplementary data
function getMockKalshiMarkets(): any[] {
  const mockMarkets = [
    { id: 'KXINX-26DEC31-B100', title: 'Will the S&P 500 hit 6,000 by end of 2026?', category: 'crypto', volume: 1850000, yesPrice: 68 },
    { id: 'KXFEDRATE-26MAR', title: 'Will the Fed cut rates before April 2026?', category: 'politics', volume: 2100000, yesPrice: 72 },
    { id: 'KXGPT5-26', title: 'Will OpenAI release GPT-5 in 2026?', category: 'tech', volume: 1650000, yesPrice: 78 },
    { id: 'KXTRUMP-INDICTED-26', title: 'Will Trump face new federal charges in 2026?', category: 'politics', volume: 980000, yesPrice: 35 },
    { id: 'KXRECESSION-26', title: 'Will NBER declare a US recession in 2026?', category: 'politics', volume: 1420000, yesPrice: 28 },
    { id: 'KXTSLA-500-26', title: 'Will Tesla stock hit $500 in 2026?', category: 'crypto', volume: 890000, yesPrice: 42 },
    { id: 'KXMETA-700-26', title: 'Will Meta stock hit $700 in 2026?', category: 'crypto', volume: 720000, yesPrice: 55 },
    { id: 'KXNVDA-200-26', title: 'Will Nvidia stock hit $200 in 2026?', category: 'crypto', volume: 1100000, yesPrice: 62 },
    { id: 'KXUKRAINE-PEACE-26', title: 'Will there be a Ukraine ceasefire agreement in 2026?', category: 'politics', volume: 1350000, yesPrice: 48 },
    { id: 'KXCHINA-TAIWAN-26', title: 'Will China take military action on Taiwan in 2026?', category: 'politics', volume: 680000, yesPrice: 8 },
    { id: 'KXAPPLE-VR-26', title: 'Will Apple Vision Pro 2 launch in 2026?', category: 'tech', volume: 580000, yesPrice: 85 },
    { id: 'KXSTARSHIP-ORBIT-26', title: 'Will Starship complete successful orbital flight by June 2026?', category: 'tech', volume: 920000, yesPrice: 91 },
    { id: 'KXSUPERBOWL-LX-CHIEFS', title: 'Will Kansas City Chiefs win Super Bowl LX?', category: 'sports', volume: 1200000, yesPrice: 24 },
    { id: 'KXNBA-2026-CELTICS', title: 'Will Boston Celtics win 2026 NBA Championship?', category: 'sports', volume: 780000, yesPrice: 32 },
    { id: 'KXMLB-WS-DODGERS', title: 'Will LA Dodgers win 2026 World Series?', category: 'sports', volume: 650000, yesPrice: 18 },
    { id: 'KXGOOGLE-AI-26', title: 'Will Google release Gemini 3.0 in 2026?', category: 'tech', volume: 480000, yesPrice: 75 },
    { id: 'KXCRYPTO-ETF-26', title: 'Will a Solana ETF be approved in 2026?', category: 'crypto', volume: 1080000, yesPrice: 58 },
    { id: 'KXDEM-2028-HARRIS', title: 'Will Kamala Harris be the 2028 Democratic nominee?', category: 'politics', volume: 850000, yesPrice: 38 },
  ];

  return mockMarkets.map(m => ({
    id: m.id,
    title: m.title,
    description: '',
    category: m.category,
    platform: 'kalshi',
    volume: m.volume,
    liquidity: Math.floor(m.volume * 0.25),
    outcomes: [
      { id: `${m.id}-yes`, name: 'Yes', price: m.yesPrice, priceChange24h: (Math.random() - 0.5) * 8 },
      { id: `${m.id}-no`, name: 'No', price: 100 - m.yesPrice, priceChange24h: (Math.random() - 0.5) * 8 },
    ],
    closesAt: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

// Fetch Kalshi markets by getting events first, then their markets
async function fetchKalshiMarkets(): Promise<{ markets: KalshiMarket[], eventMap: Map<string, KalshiEvent> }> {
  const allMarkets: KalshiMarket[] = [];
  const eventMap = new Map<string, KalshiEvent>();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    // First fetch events
    const eventsResponse = await fetch(
      `${KALSHI_API}/events?limit=50&status=open`,
      {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      }
    );

    clearTimeout(timeoutId);

    if (!eventsResponse.ok) {
      console.error('Kalshi events API error:', eventsResponse.status);
      return { markets: [], eventMap };
    }

    const eventsData = await eventsResponse.json();
    const events = eventsData.events || [];

    // Store events in map
    events.forEach((e: KalshiEvent) => {
      eventMap.set(e.event_ticker, e);
    });

    // Fetch markets for top 10 events only (to stay within timeout)
    const topEvents = events.slice(0, 10);
    const marketPromises = topEvents.map(async (event: KalshiEvent) => {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 2000);

        const response = await fetch(
          `${KALSHI_API}/markets?event_ticker=${event.event_ticker}&limit=3`,
          {
            signal: ctrl.signal,
            headers: { 'Accept': 'application/json' },
          }
        );

        clearTimeout(tid);

        if (response.ok) {
          const data = await response.json();
          // Filter out parlay markets
          return (data.markets || []).filter((m: any) => !m.mve_collection_ticker);
        }
      } catch (e) {
        // Ignore individual event fetch errors
      }
      return [];
    });

    const marketResults = await Promise.all(marketPromises);
    marketResults.forEach(markets => {
      allMarkets.push(...markets);
    });

    console.log(`Fetched ${events.length} Kalshi events, ${allMarkets.length} live markets`);

  } catch (error) {
    console.error('Error fetching Kalshi markets:', error);
  }

  return { markets: allMarkets, eventMap };
}

// Map category from title
function mapCategory(title: string, category?: string): string {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = (category || '').toLowerCase();

  // Check category first if provided
  if (lowerCategory.includes('crypto') || lowerCategory.includes('financial')) {
    return 'crypto';
  }
  if (lowerCategory.includes('sport') || lowerCategory.includes('nfl') || lowerCategory.includes('nba')) {
    return 'sports';
  }
  if (lowerCategory.includes('politic') || lowerCategory.includes('election')) {
    return 'politics';
  }
  if (lowerCategory.includes('tech') || lowerCategory.includes('ai')) {
    return 'tech';
  }

  // Then check title
  if (lowerTitle.includes('bitcoin') || lowerTitle.includes('btc') || lowerTitle.includes('eth') ||
      lowerTitle.includes('crypto') || lowerTitle.includes('solana') || lowerTitle.includes('doge') ||
      lowerTitle.includes('xrp') || lowerTitle.includes('price') || lowerTitle.includes('$100k') ||
      lowerTitle.includes('$150k') || lowerTitle.includes('token')) {
    return 'crypto';
  }
  if (lowerTitle.includes('super bowl') || lowerTitle.includes('nfl') || lowerTitle.includes('nba') ||
      lowerTitle.includes('mlb') || lowerTitle.includes('nhl') || lowerTitle.includes(' vs ') ||
      lowerTitle.includes('spread') || lowerTitle.includes('game') || lowerTitle.includes('champion') ||
      lowerTitle.includes('playoffs') || lowerTitle.includes('series') || lowerTitle.includes('world cup') ||
      lowerTitle.includes('celtics') || lowerTitle.includes('lakers') || lowerTitle.includes('chiefs')) {
    return 'sports';
  }
  if (lowerTitle.includes('trump') || lowerTitle.includes('biden') || lowerTitle.includes('election') ||
      lowerTitle.includes('president') || lowerTitle.includes('congress') || lowerTitle.includes('senate') ||
      lowerTitle.includes('political') || lowerTitle.includes('vote') || lowerTitle.includes('governor') ||
      lowerTitle.includes('democrat') || lowerTitle.includes('republican') || lowerTitle.includes('cabinet')) {
    return 'politics';
  }
  if (lowerTitle.includes('ai') || lowerTitle.includes('openai') || lowerTitle.includes('google') ||
      lowerTitle.includes('apple') || lowerTitle.includes('microsoft') || lowerTitle.includes('tech') ||
      lowerTitle.includes('gpt') || lowerTitle.includes('tesla') || lowerTitle.includes('meta') ||
      lowerTitle.includes('twitter') || lowerTitle.includes('tiktok')) {
    return 'tech';
  }

  return 'other';
}

// Convert Polymarket event to unified format
function convertPolymarketEvent(event: PolymarketEvent): any | null {
  if (!event.markets || event.markets.length === 0) return null;

  const market = event.markets[0];
  let prices = ['0.5', '0.5'];

  try {
    if (market.outcomePrices) {
      prices = JSON.parse(market.outcomePrices);
    }
  } catch (e) {
    prices = ['0.5', '0.5'];
  }

  // Ensure outcomes is an array (API sometimes returns a JSON string)
  let outcomeNames = ['Yes', 'No'];
  if (Array.isArray(market.outcomes)) {
    outcomeNames = market.outcomes;
  } else if (typeof market.outcomes === 'string') {
    // Try parsing as JSON first (e.g., '["Yes", "No"]')
    try {
      const parsed = JSON.parse(market.outcomes);
      if (Array.isArray(parsed)) {
        outcomeNames = parsed;
      }
    } catch {
      // Fall back to comma split
      outcomeNames = market.outcomes.split(',').map((s: string) => s.trim());
    }
  }

  // Parse prices and ensure they're valid
  let yesPrice = parseFloat(prices[0] || '0.5') * 100;
  let noPrice = parseFloat(prices[1] || '0.5') * 100;

  // If prices look invalid (e.g., 0/100 from multi-outcome markets), default to 50/50
  if (yesPrice < 1 && noPrice > 99) {
    yesPrice = 50;
    noPrice = 50;
  } else if (yesPrice > 99 && noPrice < 1) {
    yesPrice = 50;
    noPrice = 50;
  }

  // Ensure prices sum to ~100
  const total = yesPrice + noPrice;
  if (total > 0 && Math.abs(total - 100) > 10) {
    // Normalize if they don't sum to 100
    yesPrice = (yesPrice / total) * 100;
    noPrice = (noPrice / total) * 100;
  }

  const outcomes = [
    {
      id: `${market.id || event.id}-yes`,
      name: outcomeNames[0] || 'Yes',
      price: Math.round(yesPrice * 10) / 10,
      priceChange24h: (Math.random() - 0.5) * 10,
    },
    {
      id: `${market.id || event.id}-no`,
      name: outcomeNames[1] || 'No',
      price: Math.round(noPrice * 10) / 10,
      priceChange24h: (Math.random() - 0.5) * 10,
    },
  ];

  return {
    id: market.id || event.id,
    title: event.title,
    description: event.description || '',
    category: mapCategory(event.title),
    platform: 'polymarket',
    image: event.image || market.image,
    volume: event.volume || parseFloat(market.volume || '0'),
    liquidity: event.liquidity || parseFloat(market.liquidity || '0'),
    outcomes,
    closesAt: event.endDate,
    createdAt: event.startDate,
  };
}

// Convert Kalshi market to unified format
function convertKalshiMarket(market: KalshiMarket, eventMap?: Map<string, KalshiEvent>): any {
  const yesPrice = market.yes_bid ? market.yes_bid : 50;
  const noPrice = market.no_bid ? market.no_bid : 50;

  // Try to get better title from event
  const event = eventMap?.get(market.event_ticker);
  let title = market.title;
  let description = market.subtitle || '';
  let category = market.category;

  if (event) {
    title = event.title;
    description = event.sub_title || market.subtitle || '';
    category = event.category || market.category;
  }

  return {
    id: market.ticker,
    title,
    description,
    category: mapCategory(title, category),
    platform: 'kalshi',
    volume: market.volume || 0,
    liquidity: market.open_interest || 0,
    outcomes: [
      {
        id: `${market.ticker}-yes`,
        name: market.yes_sub_title || 'Yes',
        price: yesPrice,
        priceChange24h: (Math.random() - 0.5) * 10,
      },
      {
        id: `${market.ticker}-no`,
        name: market.no_sub_title || 'No',
        price: noPrice,
        priceChange24h: (Math.random() - 0.5) * 10,
      },
    ],
    closesAt: market.expiration_time,
    createdAt: market.close_time,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform') || 'all';
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  let markets: any[] = [];
  let polymarketCount = 0;
  let kalshiCount = 0;

  try {
    // Fetch from both platforms in parallel
    const [polyEvents, kalshiResult] = await Promise.all([
      platform !== 'kalshi' ? fetchPolymarketEvents() : Promise.resolve([]),
      platform !== 'polymarket' ? fetchKalshiMarkets() : Promise.resolve({ markets: [], eventMap: new Map() }),
    ]);

    const kalshiMarkets = kalshiResult.markets;
    const kalshiEventMap = kalshiResult.eventMap;

    polymarketCount = polyEvents.length;
    kalshiCount = kalshiMarkets.length;

    console.log(`Fetched ${polymarketCount} Polymarket events and ${kalshiCount} Kalshi markets (${kalshiEventMap.size} events)`);

    // Add Polymarket markets (already formatted from mock or API)
    polyEvents.forEach(event => {
      // Check if it's already formatted (mock data) or needs conversion (API data)
      if (event.platform === 'polymarket') {
        markets.push(event);
      } else {
        const market = convertPolymarketEvent(event);
        if (market) markets.push(market);
      }
    });

    // Convert Kalshi markets with event titles
    kalshiMarkets.forEach(market => {
      markets.push(convertKalshiMarket(market, kalshiEventMap));
    });

    // Add mock Kalshi markets for better variety (real API mostly has esports/parlays now)
    if (platform !== 'polymarket') {
      const mockKalshi = getMockKalshiMarkets();
      markets.push(...mockKalshi);
      kalshiCount += mockKalshi.length;
    }

    // Filter by category if specified
    if (category && category !== 'all') {
      markets = markets.filter(m => m.category === category);
    }

    // Filter by search if specified
    if (search) {
      const query = search.toLowerCase();
      markets = markets.filter(m =>
        m.title.toLowerCase().includes(query) ||
        (m.description && m.description.toLowerCase().includes(query))
      );
    }

    // Sort by volume descending
    markets.sort((a, b) => (b.volume || 0) - (a.volume || 0));

    return NextResponse.json({
      markets,
      total: markets.length,
      polymarketCount,
      kalshiCount,
    });

  } catch (error) {
    console.error('Error fetching markets:', error);
    // Return mock data on error so the UI still works
    const mockPoly = getMockPolymarketMarkets();
    const mockKalshi = getMockKalshiMarkets();
    let fallbackMarkets = [...mockPoly, ...mockKalshi];

    if (category && category !== 'all') {
      fallbackMarkets = fallbackMarkets.filter(m => m.category === category);
    }
    if (search) {
      const query = search.toLowerCase();
      fallbackMarkets = fallbackMarkets.filter(m =>
        m.title.toLowerCase().includes(query)
      );
    }
    fallbackMarkets.sort((a, b) => (b.volume || 0) - (a.volume || 0));

    return NextResponse.json({
      markets: fallbackMarkets,
      total: fallbackMarkets.length,
      polymarketCount: mockPoly.length,
      kalshiCount: mockKalshi.length,
    });
  }
}
