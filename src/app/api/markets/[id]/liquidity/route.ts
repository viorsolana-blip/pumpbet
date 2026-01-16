import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { createBetTransaction, verifyTransaction } from '@/lib/solana/treasury';
import { confirmTransaction } from '@/lib/solana/transactions';
import { isValidSolanaAddress, MIN_BET_AMOUNT, MAX_BET_AMOUNT } from '@/lib/solana/config';
import {
  getMarketById,
  getOrCreateUser,
  addLiquidity,
  getLPPositionsByUser,
  getLPPositionsByMarket,
  removeLiquidity,
} from '@/lib/db-supabase';
import { isSupabaseConfigured } from '@/lib/supabase';
import { securityHeaders, getRateLimiter } from '@/lib/security';

const rateLimiter = getRateLimiter('placeBet');

// In-memory LP storage for demo mode
const mockLPPositions = new Map<string, {
  id: string;
  userId: string;
  marketId: string;
  amount: number;
  shares: number;
  createdAt: Date;
}[]>();

// GET - Get LP positions for a market or user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const marketId = params.id;

    if (isSupabaseConfigured()) {
      const market = await getMarketById(marketId);
      if (!market) {
        return NextResponse.json(
          { success: false, error: 'Market not found' },
          { status: 404, headers: securityHeaders }
        );
      }

      const lpPositions = await getLPPositionsByMarket(marketId);

      // If wallet specified, get user's specific position
      let userPosition = null;
      if (walletAddress && isValidSolanaAddress(walletAddress)) {
        const user = await getOrCreateUser(walletAddress);
        if (user) {
          const userLPs = await getLPPositionsByUser(user.id);
          userPosition = userLPs.find(lp => lp.market_id === marketId);
        }
      }

      const totalLiquidity = lpPositions.reduce((sum, lp) => sum + lp.amount, 0);

      return NextResponse.json({
        success: true,
        marketId,
        totalLiquidity,
        totalShares: market.total_lp_shares,
        lpCount: lpPositions.length,
        userPosition: userPosition ? {
          id: userPosition.id,
          amount: userPosition.amount,
          shares: userPosition.shares,
          createdAt: userPosition.created_at,
        } : null,
      }, { headers: securityHeaders });
    } else {
      // Demo mode
      const positions = mockLPPositions.get(marketId) || [];
      const totalLiquidity = positions.reduce((sum, lp) => sum + lp.amount, 0);
      const totalShares = positions.reduce((sum, lp) => sum + lp.shares, 0);

      let userPosition = null;
      if (walletAddress) {
        const userLPs = positions.filter(p => p.userId === walletAddress);
        if (userLPs.length > 0) {
          const totalUserAmount = userLPs.reduce((sum, lp) => sum + lp.amount, 0);
          const totalUserShares = userLPs.reduce((sum, lp) => sum + lp.shares, 0);
          userPosition = {
            id: userLPs[0].id,
            amount: totalUserAmount,
            shares: totalUserShares,
            createdAt: userLPs[0].createdAt,
          };
        }
      }

      return NextResponse.json({
        success: true,
        marketId,
        totalLiquidity,
        totalShares,
        lpCount: positions.length,
        userPosition,
        isDemo: true,
      }, { headers: securityHeaders });
    }
  } catch (error) {
    console.error('Error getting liquidity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// POST - Add liquidity (prepare transaction)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter.check(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: securityHeaders }
      );
    }

    const body = await request.json();
    const { action, amount, walletAddress, signature } = body;
    const marketId = params.id;

    // Validate inputs
    if (!action || !['add', 'remove', 'prepare'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "add", "remove", or "prepare"' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400, headers: securityHeaders }
      );
    }

    // For add action, validate amount
    if (action === 'add' || action === 'prepare') {
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid amount' },
          { status: 400, headers: securityHeaders }
        );
      }

      if (amount < MIN_BET_AMOUNT) {
        return NextResponse.json(
          { success: false, error: `Minimum liquidity is ${MIN_BET_AMOUNT} SOL` },
          { status: 400, headers: securityHeaders }
        );
      }

      if (amount > MAX_BET_AMOUNT * 10) { // Higher limit for liquidity
        return NextResponse.json(
          { success: false, error: `Maximum liquidity is ${MAX_BET_AMOUNT * 10} SOL` },
          { status: 400, headers: securityHeaders }
        );
      }
    }

    if (isSupabaseConfigured()) {
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

      if (action === 'prepare') {
        // Create unsigned transaction for adding liquidity
        // Note: We use 'yes' as the side since it's just a transfer to treasury - the side is tracked separately for LP
        const userPubkey = new PublicKey(walletAddress);
        const result = await createBetTransaction(userPubkey, amount, marketId, 'yes');

        if (!result) {
          return NextResponse.json(
            { success: false, error: 'Failed to create transaction. Treasury may not be configured.' },
            { status: 500, headers: securityHeaders }
          );
        }

        // Calculate expected LP shares
        const totalPool = market.yes_pool + market.no_pool;
        const expectedShares = totalPool > 0
          ? (amount / totalPool) * market.total_lp_shares
          : amount * 100; // Initial LP gets 100 shares per SOL

        return NextResponse.json({
          success: true,
          transaction: result.serialized,
          marketId,
          amount,
          expectedShares: Math.round(expectedShares * 100) / 100,
          currentTotalLiquidity: totalPool,
          message: 'Sign the transaction to add liquidity',
        }, { headers: securityHeaders });
      }

      if (action === 'add') {
        // Confirm and record liquidity addition
        if (!signature) {
          return NextResponse.json(
            { success: false, error: 'Transaction signature required' },
            { status: 400, headers: securityHeaders }
          );
        }

        // Verify transaction
        const confirmation = await confirmTransaction(signature, 'confirmed', 30000);
        if (!confirmation.confirmed) {
          return NextResponse.json(
            { success: false, error: confirmation.error || 'Transaction not confirmed' },
            { status: 400, headers: securityHeaders }
          );
        }

        const verification = await verifyTransaction(signature, amount, walletAddress);
        if (!verification.success) {
          return NextResponse.json(
            { success: false, error: verification.error || 'Transaction verification failed' },
            { status: 400, headers: securityHeaders }
          );
        }

        const user = await getOrCreateUser(walletAddress);
        if (!user) {
          return NextResponse.json(
            { success: false, error: 'Failed to verify user' },
            { status: 500, headers: securityHeaders }
          );
        }

        // Calculate LP shares
        const totalPool = market.yes_pool + market.no_pool;
        const shares = totalPool > 0
          ? (amount / totalPool) * market.total_lp_shares
          : amount * 100;

        const lpPosition = await addLiquidity({
          user_id: user.id,
          market_id: marketId,
          amount,
          shares,
          tx_signature: signature,
        });

        if (!lpPosition) {
          return NextResponse.json(
            { success: false, error: 'Failed to record liquidity position' },
            { status: 500, headers: securityHeaders }
          );
        }

        return NextResponse.json({
          success: true,
          message: `Successfully added ${amount} SOL liquidity`,
          position: {
            id: lpPosition.id,
            shares: lpPosition.shares,
            amount: lpPosition.amount,
          },
          signature,
        }, { headers: securityHeaders });
      }

      if (action === 'remove') {
        // For remove, we need the LP position ID
        const { lpPositionId } = body;
        if (!lpPositionId) {
          return NextResponse.json(
            { success: false, error: 'LP position ID required' },
            { status: 400, headers: securityHeaders }
          );
        }

        // TODO: Implement withdraw transaction and payout
        // For now, just mark as withdrawn
        const success = await removeLiquidity(lpPositionId, 0);

        if (!success) {
          return NextResponse.json(
            { success: false, error: 'Failed to remove liquidity' },
            { status: 500, headers: securityHeaders }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Liquidity withdrawal initiated. You will receive your share when the market resolves.',
        }, { headers: securityHeaders });
      }
    } else {
      // Demo mode
      if (action === 'prepare') {
        return NextResponse.json({
          success: true,
          transaction: 'demo-transaction',
          marketId,
          amount,
          expectedShares: amount * 100,
          currentTotalLiquidity: 0,
          message: 'Demo mode - no real transaction needed',
          isDemo: true,
        }, { headers: securityHeaders });
      }

      if (action === 'add') {
        const lpId = `lp-${Date.now()}`;
        const shares = amount * 100;

        if (!mockLPPositions.has(marketId)) {
          mockLPPositions.set(marketId, []);
        }

        mockLPPositions.get(marketId)!.push({
          id: lpId,
          userId: walletAddress,
          marketId,
          amount,
          shares,
          createdAt: new Date(),
        });

        return NextResponse.json({
          success: true,
          message: `Added ${amount} SOL liquidity (demo mode)`,
          position: {
            id: lpId,
            shares,
            amount,
          },
          isDemo: true,
        }, { headers: securityHeaders });
      }

      if (action === 'remove') {
        const positions = mockLPPositions.get(marketId) || [];
        const userPositions = positions.filter(p => p.userId === walletAddress);

        if (userPositions.length === 0) {
          return NextResponse.json(
            { success: false, error: 'No liquidity position found' },
            { status: 404, headers: securityHeaders }
          );
        }

        // Remove user's positions
        mockLPPositions.set(
          marketId,
          positions.filter(p => p.userId !== walletAddress)
        );

        return NextResponse.json({
          success: true,
          message: 'Liquidity removed (demo mode)',
          isDemo: true,
        }, { headers: securityHeaders });
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400, headers: securityHeaders }
    );
  } catch (error) {
    console.error('Error processing liquidity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}
