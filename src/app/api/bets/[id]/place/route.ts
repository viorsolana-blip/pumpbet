import { NextRequest, NextResponse } from 'next/server';
import { placeBet, getBetById } from '@/lib/db';
import { PlaceBetInput } from '@/lib/types';
import {
  checkRateLimit,
  validateBetPlacement,
  verifySignature,
  getClientIdentifier,
  rateLimitError,
  validationError,
  addSecurityHeaders,
  RATE_LIMITS,
} from '@/lib/security';

// POST /api/bets/[id]/place - Place a bet
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`place-bet:${clientId}`, RATE_LIMITS.placeBet);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.resetIn);
    }

    // 2. Parse and validate input
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return validationError('Invalid JSON body');
    }

    const validation = validateBetPlacement(body);
    if (!validation.valid) {
      return validationError(validation.error || 'Invalid input');
    }

    const { side, amount, walletAddress, signature } = validation.sanitizedData!;

    // 3. Verify signature (ensures user owns the wallet)
    const betId = params.id;
    const message = `PumpBet: Place ${amount} SOL on ${side} for bet ${betId}`;
    const sigVerification = verifySignature(message, signature as string, walletAddress as string);

    if (!sigVerification.valid && process.env.NODE_ENV === 'production') {
      return validationError(sigVerification.error || 'Invalid signature');
    }

    // 4. Check if bet exists and is active
    const existingBet = await getBetById(betId);
    if (!existingBet) {
      return NextResponse.json(
        { success: false, error: 'Bet not found' },
        { status: 404 }
      );
    }

    if (existingBet.status !== 'active') {
      return validationError('Bet is no longer active');
    }

    if (existingBet.endTime <= new Date()) {
      return validationError('Bet has expired');
    }

    // 5. Place the bet
    const input: PlaceBetInput = {
      betId,
      odId: walletAddress as string,
      side: side as 'yes' | 'no',
      amount: amount as number,
      walletAddress: walletAddress as string,
      signature: (signature as string) || '',
    };

    const result = await placeBet(input);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to place bet' },
        { status: 500 }
      );
    }

    // 6. Return success with security headers
    const response = NextResponse.json({
      success: true,
      position: result.position,
      bet: result.bet,
      message: `Successfully bet ${amount} SOL on ${(side as string).toUpperCase()}`,
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error placing bet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to place bet' },
      { status: 500 }
    );
  }
}
