import { NextRequest, NextResponse } from 'next/server';
import {
  getMarketById,
  getPositionsByUser,
  getLPPositionsByUser,
  getUserByWallet,
  getOrCreateUser,
  markPositionClaimed,
  removeLiquidity,
  createTransaction,
} from '@/lib/db-supabase';
import { calculatePositionPayouts, calculateCancelledPayouts, calculateLPPayouts, calculateLPCancelledPayouts } from '@/lib/payouts';
import { sendPayout } from '@/lib/solana/treasury';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isValidSolanaAddress } from '@/lib/solana/config';
import { securityHeaders, getRateLimiter } from '@/lib/security';

const rateLimiter = getRateLimiter('placeBet');

// In-memory claims for demo mode
const demoClaims = new Map<string, { positionId: string; amount: number; claimedAt: Date }[]>();

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter.check(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: securityHeaders }
      );
    }

    const body = await request.json();
    const { walletAddress, positionId, lpPositionId } = body;

    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (!positionId && !lpPositionId) {
      return NextResponse.json(
        { success: false, error: 'Position ID or LP position ID required' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (isSupabaseConfigured()) {
      const user = await getUserByWallet(walletAddress);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404, headers: securityHeaders }
        );
      }

      if (positionId) {
        // Claim betting position winnings
        const userPositions = await getPositionsByUser(user.id);
        const position = userPositions.find(p => p.id === positionId);

        if (!position) {
          return NextResponse.json(
            { success: false, error: 'Position not found or not owned by user' },
            { status: 404, headers: securityHeaders }
          );
        }

        if (position.claimed) {
          return NextResponse.json(
            { success: false, error: 'Position already claimed' },
            { status: 400, headers: securityHeaders }
          );
        }

        const market = await getMarketById(position.market_id);
        if (!market) {
          return NextResponse.json(
            { success: false, error: 'Market not found' },
            { status: 404, headers: securityHeaders }
          );
        }

        if (market.status !== 'resolved' && market.status !== 'cancelled') {
          return NextResponse.json(
            { success: false, error: 'Market not yet resolved' },
            { status: 400, headers: securityHeaders }
          );
        }

        // Calculate payout
        let payoutAmount = 0;

        if (market.status === 'cancelled') {
          // Full refund
          payoutAmount = position.amount;
        } else if (position.side === market.outcome) {
          // Winner - calculate share of pool
          const allPositions = await import('@/lib/db-supabase').then(m => m.getPositionsByMarket(position.market_id));
          const payouts = calculatePositionPayouts(allPositions, market, market.outcome as 'yes' | 'no');
          const userPayout = payouts.find(p => p.positionId === positionId);
          payoutAmount = userPayout?.payout || 0;
        } else {
          // Loser - no payout
          return NextResponse.json(
            { success: false, error: 'Position did not win' },
            { status: 400, headers: securityHeaders }
          );
        }

        // Process payout
        // In production, this would send SOL to the user's wallet
        const payoutResult = await sendPayout(walletAddress, payoutAmount);

        if (!payoutResult.success) {
          // Mark as claimable for manual processing
          return NextResponse.json({
            success: false,
            error: 'Automated payout failed. Please contact support.',
            payoutAmount,
            canManualClaim: true,
          }, { status: 500, headers: securityHeaders });
        }

        // Mark position as claimed
        await markPositionClaimed(positionId);

        // Record transaction
        await createTransaction({
          user_id: user.id,
          market_id: position.market_id,
          type: 'payout',
          amount: payoutAmount,
          tx_signature: payoutResult.signature || 'pending',
          status: payoutResult.signature ? 'confirmed' : 'pending',
        });

        return NextResponse.json({
          success: true,
          message: `Successfully claimed ${payoutAmount.toFixed(4)} SOL`,
          amount: payoutAmount,
          signature: payoutResult.signature,
        }, { headers: securityHeaders });
      }

      if (lpPositionId) {
        // Claim LP position
        const lpPositions = await getLPPositionsByUser(user.id);
        const lpPosition = lpPositions.find(lp => lp.id === lpPositionId);

        if (!lpPosition) {
          return NextResponse.json(
            { success: false, error: 'LP position not found or not owned by user' },
            { status: 404, headers: securityHeaders }
          );
        }

        if (lpPosition.withdrawn_at) {
          return NextResponse.json(
            { success: false, error: 'LP position already withdrawn' },
            { status: 400, headers: securityHeaders }
          );
        }

        const market = await getMarketById(lpPosition.market_id);
        if (!market) {
          return NextResponse.json(
            { success: false, error: 'Market not found' },
            { status: 404, headers: securityHeaders }
          );
        }

        if (market.status !== 'resolved' && market.status !== 'cancelled') {
          return NextResponse.json(
            { success: false, error: 'Market not yet resolved' },
            { status: 400, headers: securityHeaders }
          );
        }

        // Calculate LP payout
        let payoutAmount = 0;

        if (market.status === 'cancelled') {
          payoutAmount = lpPosition.amount;
        } else {
          // Calculate remaining pool for LPs
          const allPositions = await import('@/lib/db-supabase').then(m => m.getPositionsByMarket(lpPosition.market_id));
          const allLPs = await import('@/lib/db-supabase').then(m => m.getLPPositionsByMarket(lpPosition.market_id));
          const positionPayouts = calculatePositionPayouts(allPositions, market, market.outcome as 'yes' | 'no');
          const totalWinnerPayouts = positionPayouts.reduce((sum, p) => sum + p.payout, 0);
          const lpPayouts = calculateLPPayouts(allLPs, market, totalWinnerPayouts);
          const userLPPayout = lpPayouts.find(lp => lp.lpId === lpPositionId);
          payoutAmount = userLPPayout?.payout || 0;
        }

        // Process payout
        const payoutResult = await sendPayout(walletAddress, payoutAmount);

        if (!payoutResult.success) {
          return NextResponse.json({
            success: false,
            error: 'Automated payout failed. Please contact support.',
            payoutAmount,
            canManualClaim: true,
          }, { status: 500, headers: securityHeaders });
        }

        // Mark LP position as withdrawn
        await removeLiquidity(lpPositionId, payoutAmount);

        // Record transaction
        await createTransaction({
          user_id: user.id,
          market_id: lpPosition.market_id,
          type: 'lp_withdrawal',
          amount: payoutAmount,
          tx_signature: payoutResult.signature || 'pending',
          status: payoutResult.signature ? 'confirmed' : 'pending',
        });

        return NextResponse.json({
          success: true,
          message: `Successfully withdrew ${payoutAmount.toFixed(4)} SOL`,
          amount: payoutAmount,
          signature: payoutResult.signature,
        }, { headers: securityHeaders });
      }
    } else {
      // Demo mode
      const claimAmount = 0.5; // Demo amount

      const userClaims = demoClaims.get(walletAddress) || [];
      const alreadyClaimed = userClaims.some(c => c.positionId === (positionId || lpPositionId));

      if (alreadyClaimed) {
        return NextResponse.json(
          { success: false, error: 'Already claimed (demo mode)' },
          { status: 400, headers: securityHeaders }
        );
      }

      userClaims.push({
        positionId: positionId || lpPositionId,
        amount: claimAmount,
        claimedAt: new Date(),
      });
      demoClaims.set(walletAddress, userClaims);

      return NextResponse.json({
        success: true,
        message: `Claimed ${claimAmount} SOL (demo mode)`,
        amount: claimAmount,
        isDemo: true,
      }, { headers: securityHeaders });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400, headers: securityHeaders }
    );
  } catch (error) {
    console.error('Error claiming payout:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// GET - Get claimable positions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');

    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (isSupabaseConfigured()) {
      const user = await getUserByWallet(walletAddress);
      if (!user) {
        return NextResponse.json({
          success: true,
          claimablePositions: [],
          claimableLPPositions: [],
          totalClaimable: 0,
        }, { headers: securityHeaders });
      }

      const positions = await getPositionsByUser(user.id);
      const lpPositions = await getLPPositionsByUser(user.id);

      const claimablePositions = [];
      const claimableLPPositions = [];

      for (const position of positions) {
        if (position.claimed) continue;

        const market = await getMarketById(position.market_id);
        if (!market) continue;
        if (market.status !== 'resolved' && market.status !== 'cancelled') continue;

        let payoutAmount = 0;

        if (market.status === 'cancelled') {
          payoutAmount = position.amount;
        } else if (position.side === market.outcome) {
          const allPositions = await import('@/lib/db-supabase').then(m => m.getPositionsByMarket(position.market_id));
          const payouts = calculatePositionPayouts(allPositions, market, market.outcome as 'yes' | 'no');
          const payout = payouts.find(p => p.positionId === position.id);
          payoutAmount = payout?.payout || 0;
        }

        if (payoutAmount > 0) {
          claimablePositions.push({
            positionId: position.id,
            marketId: position.market_id,
            side: position.side,
            originalAmount: position.amount,
            payoutAmount,
            profit: payoutAmount - position.amount,
          });
        }
      }

      for (const lpPosition of lpPositions) {
        if (lpPosition.withdrawn_at) continue;

        const market = await getMarketById(lpPosition.market_id);
        if (!market) continue;
        if (market.status !== 'resolved' && market.status !== 'cancelled') continue;

        let payoutAmount = 0;

        if (market.status === 'cancelled') {
          payoutAmount = lpPosition.amount;
        } else {
          const allPositions = await import('@/lib/db-supabase').then(m => m.getPositionsByMarket(lpPosition.market_id));
          const allLPs = await import('@/lib/db-supabase').then(m => m.getLPPositionsByMarket(lpPosition.market_id));
          const positionPayouts = calculatePositionPayouts(allPositions, market, market.outcome as 'yes' | 'no');
          const totalWinnerPayouts = positionPayouts.reduce((sum, p) => sum + p.payout, 0);
          const lpPayouts = calculateLPPayouts(allLPs, market, totalWinnerPayouts);
          const payout = lpPayouts.find(lp => lp.lpId === lpPosition.id);
          payoutAmount = payout?.payout || 0;
        }

        if (payoutAmount > 0) {
          claimableLPPositions.push({
            lpPositionId: lpPosition.id,
            marketId: lpPosition.market_id,
            originalAmount: lpPosition.amount,
            payoutAmount,
            profit: payoutAmount - lpPosition.amount,
          });
        }
      }

      const totalClaimable =
        claimablePositions.reduce((sum, p) => sum + p.payoutAmount, 0) +
        claimableLPPositions.reduce((sum, p) => sum + p.payoutAmount, 0);

      return NextResponse.json({
        success: true,
        claimablePositions,
        claimableLPPositions,
        totalClaimable,
      }, { headers: securityHeaders });
    } else {
      // Demo mode
      return NextResponse.json({
        success: true,
        claimablePositions: [],
        claimableLPPositions: [],
        totalClaimable: 0,
        isDemo: true,
      }, { headers: securityHeaders });
    }
  } catch (error) {
    console.error('Error getting claimable positions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}
