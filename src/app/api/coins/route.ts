import { NextRequest, NextResponse } from 'next/server';
import { getAllCoins, createCoin, getOrCreateUser, getUserByWallet } from '@/lib/db-supabase';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isValidSolanaAddress } from '@/lib/solana/config';
import { securityHeaders, getRateLimiter, sanitizeString } from '@/lib/security';

const readLimiter = getRateLimiter('read');
const createLimiter = getRateLimiter('createBet');

// Mock coins for when Supabase is not configured
const mockCoins = [
  {
    id: 'coin-1',
    name: 'Bonk',
    ticker: '$BONK',
    image: '/coins/bonk.png',
    description: 'The first Solana dog coin. Much wow, very community.',
    contract_address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    website: 'https://bonkcoin.com',
    twitter: '@bonaborito',
    category: 'memecoin' as const,
    submitted_by: 'community',
    upvotes: 42,
    downvotes: 5,
    is_featured: true,
    market_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'coin-2',
    name: 'Popcat',
    ticker: '$POPCAT',
    image: '/coins/popcat.png',
    description: 'Pop pop pop! The viral meme turned Solana token.',
    contract_address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    website: null,
    twitter: '@Popcatsolana',
    category: 'memecoin' as const,
    submitted_by: 'community',
    upvotes: 28,
    downvotes: 3,
    is_featured: true,
    market_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'coin-3',
    name: 'AI16Z',
    ticker: '$AI16Z',
    image: '/coins/ai16z.png',
    description: 'AI venture fund on Solana. Investing in the future of AI.',
    contract_address: 'HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC',
    website: 'https://ai16z.ai',
    twitter: '@ai16zdao',
    category: 'ai' as const,
    submitted_by: 'community',
    upvotes: 35,
    downvotes: 8,
    is_featured: true,
    market_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'coin-4',
    name: 'Fartcoin',
    ticker: '$FARTCOIN',
    image: '/coins/fartcoin.png',
    description: 'The loudest memecoin on Solana. Let it rip!',
    contract_address: '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump',
    website: null,
    twitter: '@fikiiiieee',
    category: 'memecoin' as const,
    submitted_by: 'community',
    upvotes: 12,
    downvotes: 4,
    is_featured: false,
    market_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'coin-5',
    name: 'Griffain',
    ticker: '$GRIFFAIN',
    image: '/coins/griffain.png',
    description: 'AI agent ecosystem token. Powering autonomous AI on Solana.',
    contract_address: 'KENJSUYLASHUMfHyy5o4Hp2FdNqZg1AsUPhfH2kYvEP',
    website: 'https://griffain.com',
    twitter: '@griffaindotcom',
    category: 'ai' as const,
    submitted_by: 'community',
    upvotes: 8,
    downvotes: 2,
    is_featured: false,
    market_id: null,
    created_at: new Date().toISOString(),
  },
];

// GET - List all coins
export async function GET(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!readLimiter.check(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests' },
        { status: 429, headers: securityHeaders }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';

    let coins;
    if (isSupabaseConfigured()) {
      coins = await getAllCoins(category);
    } else {
      // Use mock data
      coins = category === 'all'
        ? mockCoins
        : mockCoins.filter(c => c.category === category);
    }

    // Sort by upvotes descending
    coins.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));

    return NextResponse.json({
      success: true,
      coins,
      total: coins.length,
    }, { headers: securityHeaders });
  } catch (error) {
    console.error('Error fetching coins:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// POST - Submit a new coin
export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!createLimiter.check(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many submissions. Please try again later.' },
        { status: 429, headers: securityHeaders }
      );
    }

    const body = await request.json();
    const {
      name,
      ticker,
      description,
      category,
      walletAddress,
      image,
      contractAddress,
      website,
      twitter,
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { success: false, error: 'Name must be 2-50 characters' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (!ticker || typeof ticker !== 'string' || ticker.length < 2 || ticker.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Ticker must be 2-10 characters' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (!description || typeof description !== 'string' || description.length < 10 || description.length > 500) {
      return NextResponse.json(
        { success: false, error: 'Description must be 10-500 characters' },
        { status: 400, headers: securityHeaders }
      );
    }

    const validCategories = ['memecoin', 'defi', 'gaming', 'ai', 'other'];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required to submit coins' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeString(name);
    const sanitizedTicker = sanitizeString(ticker).toUpperCase();
    const sanitizedDescription = sanitizeString(description);

    if (isSupabaseConfigured()) {
      // Get or create user
      const user = await getOrCreateUser(walletAddress);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Failed to verify user' },
          { status: 500, headers: securityHeaders }
        );
      }

      // Create coin
      const coin = await createCoin({
        name: sanitizedName,
        ticker: sanitizedTicker.startsWith('$') ? sanitizedTicker : `$${sanitizedTicker}`,
        description: sanitizedDescription,
        category,
        submitted_by: user.id,
        image: image || null,
        contract_address: contractAddress || null,
        website: website || null,
        twitter: twitter || null,
      });

      if (!coin) {
        return NextResponse.json(
          { success: false, error: 'Failed to create coin' },
          { status: 500, headers: securityHeaders }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Coin submitted successfully! Get 15 upvotes to become featured.',
        coin,
      }, { headers: securityHeaders });
    } else {
      // Mock response for development
      const mockCoin = {
        id: `coin-${Date.now()}`,
        name: sanitizedName,
        ticker: sanitizedTicker.startsWith('$') ? sanitizedTicker : `$${sanitizedTicker}`,
        description: sanitizedDescription,
        category,
        submitted_by: walletAddress,
        image: image || null,
        contract_address: contractAddress || null,
        website: website || null,
        twitter: twitter || null,
        upvotes: 0,
        downvotes: 0,
        is_featured: false,
        market_id: null,
        created_at: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        message: 'Coin submitted (demo mode - not persisted)',
        coin: mockCoin,
      }, { headers: securityHeaders });
    }
  } catch (error) {
    console.error('Error creating coin:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}
