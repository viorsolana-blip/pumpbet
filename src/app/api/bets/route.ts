import { NextRequest, NextResponse } from 'next/server';
import { getAllBets, getActiveBets, createBet } from '@/lib/db';
import { CreateBetInput } from '@/lib/types';
import {
  checkRateLimit,
  validateBetCreation,
  validateCategory,
  getClientIdentifier,
  rateLimitError,
  validationError,
  addSecurityHeaders,
  sanitizeString,
  RATE_LIMITS,
} from '@/lib/security';

// GET /api/bets - Get all bets or active bets
export async function GET(request: NextRequest) {
  try {
    // Rate limiting for reads
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`get-bets:${clientId}`, RATE_LIMITS.read);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.resetIn);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Validate category if provided
    if (category && category !== 'all' && !validateCategory(category)) {
      return validationError('Invalid category');
    }

    let bets = status === 'active' ? await getActiveBets() : await getAllBets();

    // Filter by category if specified
    if (category && category !== 'all') {
      bets = bets.filter(bet => bet.category === category);
    }

    const response = NextResponse.json({
      success: true,
      bets,
      count: bets.length,
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bets' },
      { status: 500 }
    );
  }
}

// POST /api/bets - Create a new bet
export async function POST(request: NextRequest) {
  try {
    // Strict rate limiting for bet creation
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`create-bet:${clientId}`, RATE_LIMITS.createBet);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.resetIn);
    }

    // Parse body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return validationError('Invalid JSON body');
    }

    // Validate and sanitize input
    const validation = validateBetCreation(body);
    if (!validation.valid) {
      return validationError(validation.error || 'Invalid input');
    }

    const sanitized = validation.sanitizedData!;

    const input: CreateBetInput = {
      kolName: sanitized.kolName as string,
      kolTicker: sanitized.kolTicker as string,
      kolImage: sanitized.kolImage as string,
      kolTwitter: sanitized.kolTwitter as string | undefined,
      title: sanitized.title as string,
      description: sanitized.description as string,
      category: sanitized.category as 'kol' | 'crypto' | 'token' | 'other',
      resolutionCriteria: sanitized.resolutionCriteria as string,
      resolutionSource: sanitized.resolutionSource as string | undefined,
      endTime: sanitized.endTime as Date,
      creatorWallet: sanitized.creatorWallet as string,
      initialYesPool: (sanitized.initialYesPool as number) || 0,
      initialNoPool: (sanitized.initialNoPool as number) || 0,
    };

    const bet = await createBet(input);

    const response = NextResponse.json({
      success: true,
      bet,
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error creating bet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create bet' },
      { status: 500 }
    );
  }
}
