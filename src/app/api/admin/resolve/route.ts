import { NextRequest, NextResponse } from 'next/server';
import {
  getMarketById,
  getPositionsByMarket,
  getLPPositionsByMarket,
  resolveMarket,
  markPositionClaimed,
  removeLiquidity,
  createTransaction,
  getUserByWallet,
  getOrCreateUser,
} from '@/lib/db-supabase';
import { createResolutionSummary, ResolutionSummary } from '@/lib/payouts';
import { sendBatchPayouts } from '@/lib/solana/treasury';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isValidSolanaAddress, ADMIN_WALLET } from '@/lib/solana/config';
import { securityHeaders } from '@/lib/security';

// In-memory storage for demo mode resolutions
const demoResolutions = new Map<string, ResolutionSummary>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketId, outcome, adminWallet, signature } = body;

    // Validate inputs
    if (!marketId) {
      return NextResponse.json(
        { success: false, error: 'Market ID required' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (!outcome || !['yes', 'no', 'cancelled'].includes(outcome)) {
      return NextResponse.json(
        { success: false, error: 'Outcome must be "yes", "no", or "cancelled"' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (!adminWallet || !isValidSolanaAddress(adminWallet)) {
      return NextResponse.json(
        { success: false, error: 'Valid admin wallet address required' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Verify admin wallet (in production, check against list of approved admins)
    if (ADMIN_WALLET && adminWallet !== ADMIN_WALLET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Not an admin wallet' },
        { status: 403, headers: securityHeaders }
      );
    }

    if (isSupabaseConfigured()) {
      // Get market
      const market = await getMarketById(marketId);
      if (!market) {
        return NextResponse.json(
          { success: false, error: 'Market not found' },
          { status: 404, headers: securityHeaders }
        );
      }

      if (market.status !== 'active') {
        return NextResponse.json(
          { success: false, error: 'Market is not active' },
          { status: 400, headers: securityHeaders }
        );
      }

      // Get all positions and LP positions
      const positions = await getPositionsByMarket(marketId);
      const lpPositions = await getLPPositionsByMarket(marketId);

      // Calculate payouts
      const summary = createResolutionSummary(market, positions, lpPositions, outcome);

      // Resolve market in database
      const resolvedMarket = await resolveMarket(marketId, outcome);
      if (!resolvedMarket) {
        return NextResponse.json(
          { success: false, error: 'Failed to resolve market' },
          { status: 500, headers: securityHeaders }
        );
      }

      // In production with treasury configured, we would process payouts here
      // For now, mark payouts as pending for users to claim

      // Record resolution transaction
      const admin = await getOrCreateUser(adminWallet);
      if (admin) {
        await createTransaction({
          user_id: admin.id,
          market_id: marketId,
          type: 'resolution',
          amount: 0,
          tx_signature: signature || 'manual-resolution',
          status: 'confirmed',
        });
      }

      return NextResponse.json({
        success: true,
        message: `Market resolved as ${outcome.toUpperCase()}`,
        summary: {
          marketId: summary.marketId,
          outcome: summary.outcome,
          totalPool: summary.totalPool,
          totalPositions: summary.totalPositions,
          totalWinners: summary.totalWinners,
          totalLosers: summary.totalLosers,
          totalWinnerPayouts: summary.totalWinnerPayouts,
          totalLPPayouts: summary.totalLPPayouts,
        },
        resolvedAt: resolvedMarket.resolved_at,
      }, { headers: securityHeaders });
    } else {
      // Demo mode
      // Simulate resolution
      const summary: ResolutionSummary = {
        marketId,
        outcome,
        totalPool: 10, // Demo values
        totalPositions: 5,
        totalWinners: 3,
        totalLosers: 2,
        totalWinnerPayouts: 8,
        totalLPPayouts: 2,
        positionPayouts: [],
        lpPayouts: [],
      };

      demoResolutions.set(marketId, summary);

      return NextResponse.json({
        success: true,
        message: `Market resolved as ${outcome.toUpperCase()} (demo mode)`,
        summary,
        isDemo: true,
      }, { headers: securityHeaders });
    }
  } catch (error) {
    console.error('Error resolving market:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// GET - Get resolution status for a market
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const marketId = searchParams.get('marketId');

    if (!marketId) {
      return NextResponse.json(
        { success: false, error: 'Market ID required' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (isSupabaseConfigured()) {
      const market = await getMarketById(marketId);
      if (!market) {
        return NextResponse.json(
          { success: false, error: 'Market not found' },
          { status: 404, headers: securityHeaders }
        );
      }

      if (market.status === 'active') {
        return NextResponse.json({
          success: true,
          resolved: false,
          status: 'active',
        }, { headers: securityHeaders });
      }

      const positions = await getPositionsByMarket(marketId);
      const lpPositions = await getLPPositionsByMarket(marketId);

      const summary = createResolutionSummary(
        market,
        positions,
        lpPositions,
        market.outcome as 'yes' | 'no' | 'cancelled'
      );

      return NextResponse.json({
        success: true,
        resolved: true,
        status: market.status,
        outcome: market.outcome,
        resolvedAt: market.resolved_at,
        summary: {
          totalPool: summary.totalPool,
          totalPositions: summary.totalPositions,
          totalWinners: summary.totalWinners,
          totalWinnerPayouts: summary.totalWinnerPayouts,
          totalLPPayouts: summary.totalLPPayouts,
        },
      }, { headers: securityHeaders });
    } else {
      // Demo mode
      const resolution = demoResolutions.get(marketId);
      if (resolution) {
        return NextResponse.json({
          success: true,
          resolved: true,
          status: 'resolved',
          outcome: resolution.outcome,
          summary: resolution,
          isDemo: true,
        }, { headers: securityHeaders });
      }

      return NextResponse.json({
        success: true,
        resolved: false,
        status: 'active',
        isDemo: true,
      }, { headers: securityHeaders });
    }
  } catch (error) {
    console.error('Error getting resolution:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}
