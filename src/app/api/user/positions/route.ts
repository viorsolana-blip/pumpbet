import { NextRequest, NextResponse } from 'next/server';
import { getPositionsForUser, getUserStats, getBetById } from '@/lib/db';
import { calculatePrice } from '@/lib/types';
import {
  checkRateLimit,
  isValidSolanaAddress,
  getClientIdentifier,
  rateLimitError,
  validationError,
  addSecurityHeaders,
  RATE_LIMITS,
} from '@/lib/security';

// GET /api/user/positions - Get user's positions
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`user-positions:${clientId}`, RATE_LIMITS.read);
    if (!rateLimit.allowed) {
      return rateLimitError(rateLimit.resetIn);
    }

    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress) {
      return validationError('Wallet address is required');
    }

    // Validate wallet address format
    if (!isValidSolanaAddress(walletAddress)) {
      return validationError('Invalid Solana wallet address');
    }

    const positions = await getPositionsForUser(walletAddress);
    const stats = await getUserStats(walletAddress);

    // Enrich positions with bet info and current value
    const enrichedPositions = await Promise.all(
      positions.map(async (position) => {
        const bet = await getBetById(position.betId);
        if (!bet) return null;

        const prices = calculatePrice(bet.yesPool, bet.noPool);
        const currentPrice = position.side === 'yes' ? prices.yes : prices.no;
        const currentValue = (position.shares * currentPrice) / 100;
        const pnl = currentValue - position.amount;
        const pnlPercent = position.amount > 0 ? (pnl / position.amount) * 100 : 0;

        return {
          ...position,
          bet: {
            id: bet.id,
            title: bet.title,
            kolName: bet.kolName,
            kolImage: bet.kolImage,
            status: bet.status,
            outcome: bet.outcome,
            endTime: bet.endTime,
          },
          currentPrice,
          currentValue,
          pnl,
          pnlPercent,
        };
      })
    );

    const validPositions = enrichedPositions.filter(Boolean);

    const response = NextResponse.json({
      success: true,
      positions: validPositions,
      stats,
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
}
