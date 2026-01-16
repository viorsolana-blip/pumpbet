import { NextRequest, NextResponse } from 'next/server';
import { getBetById, getBetStats, resolveBet } from '@/lib/db';

// GET /api/bets/[id] - Get a specific bet
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bet = await getBetById(params.id);

    if (!bet) {
      return NextResponse.json(
        { success: false, error: 'Bet not found' },
        { status: 404 }
      );
    }

    const stats = await getBetStats(params.id);

    return NextResponse.json({
      success: true,
      bet,
      stats,
    });
  } catch (error) {
    console.error('Error fetching bet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bet' },
      { status: 500 }
    );
  }
}

// PATCH /api/bets/[id] - Resolve a bet (admin only in production)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if (!body.outcome || !['yes', 'no', 'cancelled'].includes(body.outcome)) {
      return NextResponse.json(
        { success: false, error: 'Invalid outcome. Must be yes, no, or cancelled' },
        { status: 400 }
      );
    }

    const bet = await resolveBet(params.id, body.outcome);

    if (!bet) {
      return NextResponse.json(
        { success: false, error: 'Bet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      bet,
    });
  } catch (error) {
    console.error('Error resolving bet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resolve bet' },
      { status: 500 }
    );
  }
}
