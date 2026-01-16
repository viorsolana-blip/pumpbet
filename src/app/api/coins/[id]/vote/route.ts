import { NextRequest, NextResponse } from 'next/server';
import {
  getCoinById,
  getOrCreateUser,
  getUserVote,
  createOrUpdateVote,
} from '@/lib/db-supabase';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isValidSolanaAddress } from '@/lib/solana/config';
import { securityHeaders, getRateLimiter } from '@/lib/security';

const rateLimiter = getRateLimiter('placeBet'); // Using same rate limit as betting

// In-memory vote storage for demo mode
const mockVotes = new Map<string, Map<string, 'up' | 'down'>>();
const mockCoinVotes = new Map<string, { upvotes: number; downvotes: number }>();

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
    const { voteType, walletAddress } = body;
    const coinId = params.id;

    // Validate inputs
    if (!voteType || !['up', 'down'].includes(voteType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid vote type. Must be "up" or "down"' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Valid wallet address required to vote' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (isSupabaseConfigured()) {
      // Get coin
      const coin = await getCoinById(coinId);
      if (!coin) {
        return NextResponse.json(
          { success: false, error: 'Coin not found' },
          { status: 404, headers: securityHeaders }
        );
      }

      // Get or create user
      const user = await getOrCreateUser(walletAddress);
      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Failed to verify user' },
          { status: 500, headers: securityHeaders }
        );
      }

      // Cast or update vote
      const { vote, previousVote } = await createOrUpdateVote(user.id, coinId, voteType);

      // Get updated coin
      const updatedCoin = await getCoinById(coinId);

      let message;
      if (!vote && previousVote) {
        message = 'Vote removed';
      } else if (previousVote && previousVote.vote_type !== voteType) {
        message = `Changed vote to ${voteType}vote`;
      } else {
        message = `${voteType === 'up' ? 'Upvoted' : 'Downvoted'} successfully`;
      }

      // Check if coin was just promoted
      const wasPromoted = !coin.is_featured && updatedCoin?.is_featured;

      return NextResponse.json({
        success: true,
        message,
        vote: vote ? { type: vote.vote_type } : null,
        upvotes: updatedCoin?.upvotes || coin.upvotes,
        downvotes: updatedCoin?.downvotes || coin.downvotes,
        isFeatured: updatedCoin?.is_featured || false,
        wasPromoted,
        marketId: updatedCoin?.market_id,
      }, { headers: securityHeaders });
    } else {
      // Demo mode with in-memory storage
      // Initialize coin votes if not exists
      if (!mockCoinVotes.has(coinId)) {
        mockCoinVotes.set(coinId, { upvotes: 0, downvotes: 0 });
      }

      // Initialize user votes for this coin if not exists
      if (!mockVotes.has(coinId)) {
        mockVotes.set(coinId, new Map());
      }

      const coinVotesMap = mockVotes.get(coinId)!;
      const currentVote = coinVotesMap.get(walletAddress);
      const votes = mockCoinVotes.get(coinId)!;

      let message;

      if (currentVote === voteType) {
        // Remove vote (toggle off)
        coinVotesMap.delete(walletAddress);
        if (voteType === 'up') {
          votes.upvotes = Math.max(0, votes.upvotes - 1);
        } else {
          votes.downvotes = Math.max(0, votes.downvotes - 1);
        }
        message = 'Vote removed';
      } else if (currentVote) {
        // Change vote
        if (currentVote === 'up') {
          votes.upvotes = Math.max(0, votes.upvotes - 1);
          votes.downvotes++;
        } else {
          votes.downvotes = Math.max(0, votes.downvotes - 1);
          votes.upvotes++;
        }
        coinVotesMap.set(walletAddress, voteType);
        message = `Changed vote to ${voteType}vote`;
      } else {
        // New vote
        coinVotesMap.set(walletAddress, voteType);
        if (voteType === 'up') {
          votes.upvotes++;
        } else {
          votes.downvotes++;
        }
        message = `${voteType === 'up' ? 'Upvoted' : 'Downvoted'} successfully`;
      }

      const isFeatured = votes.upvotes >= 15;
      const wasPromoted = votes.upvotes === 15;

      return NextResponse.json({
        success: true,
        message: message + (wasPromoted ? ' - Coin has been promoted!' : ' (demo mode)'),
        vote: coinVotesMap.has(walletAddress) ? { type: coinVotesMap.get(walletAddress) } : null,
        upvotes: votes.upvotes,
        downvotes: votes.downvotes,
        isFeatured,
        wasPromoted,
        marketId: null,
      }, { headers: securityHeaders });
    }
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// GET - Check user's vote on a coin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet');
    const coinId = params.id;

    if (!walletAddress || !isValidSolanaAddress(walletAddress)) {
      return NextResponse.json({
        success: true,
        vote: null,
      }, { headers: securityHeaders });
    }

    if (isSupabaseConfigured()) {
      const user = await getOrCreateUser(walletAddress);
      if (!user) {
        return NextResponse.json({
          success: true,
          vote: null,
        }, { headers: securityHeaders });
      }

      const vote = await getUserVote(user.id, coinId);

      return NextResponse.json({
        success: true,
        vote: vote ? { type: vote.vote_type } : null,
      }, { headers: securityHeaders });
    } else {
      // Demo mode
      const coinVotesMap = mockVotes.get(coinId);
      const userVote = coinVotesMap?.get(walletAddress);

      return NextResponse.json({
        success: true,
        vote: userVote ? { type: userVote } : null,
      }, { headers: securityHeaders });
    }
  } catch (error) {
    console.error('Error checking vote:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: securityHeaders }
    );
  }
}
