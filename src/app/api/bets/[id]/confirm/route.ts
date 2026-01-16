import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction } from '@/lib/solana/treasury';
import { confirmTransaction, isValidSignature } from '@/lib/solana/transactions';
import { isValidSolanaAddress } from '@/lib/solana/config';
import { placeBetWithTransaction, getMarketById } from '@/lib/db-supabase';
import { getBetById, placeBet } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import { securityHeaders, getRateLimiter } from '@/lib/security';

const rateLimiter = getRateLimiter('placeBet');

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!rateLimiter.check(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429, headers: securityHeaders }
      );
    }

    const body = await request.json();
    const { signature, side, amount, walletAddress } = body;
    const betId = params.id;

    // Validate inputs
    if (!signature || !isValidSignature(signature)) {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction signature' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (!side || !['yes', 'no'].includes(side)) {
      return NextResponse.json(
        { success: false, error: 'Invalid side' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Get bet/market to verify it exists and is active
    let bet;
    if (isSupabaseConfigured()) {
      bet = await getMarketById(betId);
    } else {
      bet = await getBetById(betId);
    }

    if (!bet) {
      return NextResponse.json(
        { success: false, error: 'Bet not found' },
        { status: 404, headers: securityHeaders }
      );
    }

    // Wait for transaction confirmation on Solana
    const confirmation = await confirmTransaction(signature, 'confirmed', 30000);
    if (!confirmation.confirmed) {
      return NextResponse.json(
        { success: false, error: confirmation.error || 'Transaction not confirmed' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Verify the transaction details
    const verification = await verifyTransaction(signature, amount, walletAddress);
    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Transaction verification failed' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Record the bet in database
    let result;
    if (isSupabaseConfigured()) {
      result = await placeBetWithTransaction(walletAddress, betId, side, amount, signature);
    } else {
      // Fallback to in-memory database
      const betResult = await placeBet({
        betId,
        odId: walletAddress,
        side,
        amount,
        walletAddress,
        signature,
      });
      result = betResult ? { success: true, position: betResult.position, message: 'Bet placed successfully' } : { success: false, message: 'Failed to place bet' };
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message || 'Failed to record bet' },
        { status: 500, headers: securityHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      signature,
      position: result.position,
    }, { headers: securityHeaders });
  } catch (error) {
    console.error('Error confirming bet:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}
