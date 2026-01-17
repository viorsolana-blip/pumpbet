import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { createBetTransaction } from '@/lib/solana/treasury';
import { isValidSolanaAddress, MIN_BET_AMOUNT, MAX_BET_AMOUNT } from '@/lib/solana/config';
import { getMarketById } from '@/lib/db-supabase';
import { getBetById } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { side, amount, walletAddress } = body;
    const betId = params.id;

    // Validate inputs
    if (!side || !['yes', 'no'].includes(side)) {
      return NextResponse.json(
        { success: false, error: 'Invalid side. Must be "yes" or "no"' },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (amount < MIN_BET_AMOUNT) {
      return NextResponse.json(
        { success: false, error: `Minimum bet is ${MIN_BET_AMOUNT} SOL` },
        { status: 400 }
      );
    }

    if (amount > MAX_BET_AMOUNT) {
      return NextResponse.json(
        { success: false, error: `Maximum bet is ${MAX_BET_AMOUNT} SOL` },
        { status: 400 }
      );
    }

    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400 }
      );
    }

    // Get bet/market - try multiple sources
    let bet = null;
    let yesPool = 50;
    let noPool = 50;

    // Try Supabase first if configured
    if (isSupabaseConfigured()) {
      try {
        bet = await getMarketById(betId);
      } catch (e) {
        console.log('Supabase not available, trying in-memory db');
      }
    }

    // Fallback to in-memory db
    if (!bet) {
      bet = await getBetById(betId);
    }

    // If found in our databases, validate it
    if (bet) {
      const status = 'status' in bet ? bet.status : (bet as any).status;
      if (status !== 'active') {
        return NextResponse.json(
          { success: false, error: 'Bet is not active' },
          { status: 400 }
        );
      }

      const endTime = 'end_time' in bet ? new Date(bet.end_time) : (bet as any).endTime;
      if (endTime < new Date()) {
        return NextResponse.json(
          { success: false, error: 'Bet has ended' },
          { status: 400 }
        );
      }

      yesPool = 'yes_pool' in bet ? bet.yes_pool : (bet as any).yesPool || 50;
      noPool = 'no_pool' in bet ? bet.no_pool : (bet as any).noPool || 50;
    }
    // For external markets (polymarket, kalshi), allow betting without local record

    // Create unsigned transaction
    const userPubkey = new PublicKey(walletAddress);
    const result = await createBetTransaction(userPubkey, amount, betId, side);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to create transaction. Treasury may not be configured.' },
        { status: 500 }
      );
    }

    // Calculate expected shares (for display)
    const totalPool = yesPool + noPool;
    const price = side === 'yes'
      ? totalPool > 0 ? (yesPool / totalPool) * 100 : 50
      : totalPool > 0 ? (noPool / totalPool) * 100 : 50;
    const expectedShares = (amount / price) * 100;

    return NextResponse.json({
      success: true,
      transaction: result.serialized,
      betId,
      side,
      amount,
      expectedShares: Math.round(expectedShares * 100) / 100,
      currentPrice: Math.round(price * 10) / 10,
      message: 'Sign the transaction with your wallet to place the bet',
    });
  } catch (error) {
    console.error('Error preparing bet transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
