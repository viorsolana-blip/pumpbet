import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured, DBPendingPrediction } from '@/lib/supabase';
import { headers } from 'next/headers';
import { inMemoryPredictions, inMemoryLikes } from '@/lib/launch-store';

const GRADUATION_THRESHOLD = 15;

// Helper to get user identifier from request
function getUserIdentifier(request: NextRequest): string {
  const headersList = headers();
  const walletAddress = request.headers.get('x-wallet-address');

  if (walletAddress) {
    return walletAddress;
  }

  // Fallback to IP + user agent fingerprint for anonymous users
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  // Create a simple hash
  const identifier = `anon:${ip}:${userAgent.slice(0, 50)}`;
  return identifier;
}

// Graduate a prediction to become a live market
async function graduatePrediction(prediction: DBPendingPrediction): Promise<string | null> {
  try {
    const marketData = {
      creator_id: prediction.created_by,
      kol_name: prediction.title.split(' ')[0] || 'Community',
      kol_ticker: '$' + prediction.category.toUpperCase().slice(0, 4),
      kol_image: `/brand/mascot.png`, // Default image
      title: prediction.title,
      description: prediction.description,
      category: prediction.category as 'kol' | 'crypto' | 'token' | 'other',
      resolution_criteria: prediction.resolution_criteria,
      end_time: prediction.end_date,
      yes_pool: 0,
      no_pool: 0,
      status: 'active' as const,
      is_featured: false,
    };

    if (isSupabaseConfigured() && supabaseAdmin) {
      // Create the market in Supabase
      const { data: market, error } = await supabaseAdmin
        .from('markets')
        .insert(marketData)
        .select()
        .single();

      if (error) {
        console.error('Error creating graduated market:', error);
        return null;
      }

      // Update the prediction as graduated
      await supabaseAdmin
        .from('pending_predictions')
        .update({
          is_graduated: true,
          graduated_market_id: market.id,
        })
        .eq('id', prediction.id);

      return market.id;
    }

    // For in-memory, just mark as graduated
    return `market-${Date.now()}`;
  } catch (error) {
    console.error('Error graduating prediction:', error);
    return null;
  }
}

// POST - Like a prediction
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const predictionId = params.id;
    const userIdentifier = getUserIdentifier(request);
    const likeKey = `${predictionId}:${userIdentifier}`;

    // Try Supabase first
    if (isSupabaseConfigured() && supabaseAdmin) {
      // Check if already liked
      const { data: existingLike } = await supabaseAdmin
        .from('prediction_likes')
        .select('id')
        .eq('prediction_id', predictionId)
        .eq('user_identifier', userIdentifier)
        .single();

      if (existingLike) {
        return NextResponse.json(
          { success: false, error: 'Already liked this prediction' },
          { status: 400 }
        );
      }

      // Get current prediction
      const { data: prediction, error: fetchError } = await supabaseAdmin
        .from('pending_predictions')
        .select('*')
        .eq('id', predictionId)
        .single();

      if (fetchError || !prediction) {
        return NextResponse.json(
          { success: false, error: 'Prediction not found' },
          { status: 404 }
        );
      }

      if (prediction.is_graduated) {
        return NextResponse.json(
          { success: false, error: 'Prediction already graduated' },
          { status: 400 }
        );
      }

      // Add the like
      await supabaseAdmin
        .from('prediction_likes')
        .insert({
          prediction_id: predictionId,
          user_identifier: userIdentifier,
        });

      // Increment likes count
      const newLikes = prediction.likes + 1;
      await supabaseAdmin
        .from('pending_predictions')
        .update({ likes: newLikes })
        .eq('id', predictionId);

      // Check if should graduate
      let isGraduated = false;
      if (newLikes >= GRADUATION_THRESHOLD) {
        const marketId = await graduatePrediction({ ...prediction, likes: newLikes });
        isGraduated = !!marketId;
      }

      return NextResponse.json({
        success: true,
        likes: newLikes,
        isGraduated,
        message: isGraduated
          ? '🎉 Prediction graduated to live market!'
          : `${GRADUATION_THRESHOLD - newLikes} more likes to go live!`,
      });
    }

    // Fallback to in-memory
    if (inMemoryLikes.has(likeKey)) {
      return NextResponse.json(
        { success: false, error: 'Already liked this prediction' },
        { status: 400 }
      );
    }

    // Find prediction in the shared array
    const predictionIndex = inMemoryPredictions.findIndex(p => p.id === predictionId);

    if (predictionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Prediction not found' },
        { status: 404 }
      );
    }

    const prediction = inMemoryPredictions[predictionIndex];

    if (prediction.is_graduated) {
      return NextResponse.json(
        { success: false, error: 'Prediction already graduated' },
        { status: 400 }
      );
    }

    // Add the like
    inMemoryLikes.add(likeKey);

    // Update the likes count directly in the shared array
    const newLikes = prediction.likes + 1;
    inMemoryPredictions[predictionIndex] = {
      ...prediction,
      likes: newLikes,
    };

    // Check if should graduate
    let isGraduated = false;
    if (newLikes >= GRADUATION_THRESHOLD) {
      inMemoryPredictions[predictionIndex].is_graduated = true;
      isGraduated = true;
    }

    return NextResponse.json({
      success: true,
      likes: newLikes,
      isGraduated,
      message: isGraduated
        ? '🎉 Prediction graduated to live market!'
        : `${GRADUATION_THRESHOLD - newLikes} more likes to go live!`,
    });
  } catch (error) {
    console.error('Error liking prediction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to like prediction' },
      { status: 500 }
    );
  }
}

// GET - Check if user already liked
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const predictionId = params.id;
    const userIdentifier = getUserIdentifier(request);
    const likeKey = `${predictionId}:${userIdentifier}`;

    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data: existingLike } = await supabaseAdmin
        .from('prediction_likes')
        .select('id')
        .eq('prediction_id', predictionId)
        .eq('user_identifier', userIdentifier)
        .single();

      return NextResponse.json({
        success: true,
        hasLiked: !!existingLike,
      });
    }

    return NextResponse.json({
      success: true,
      hasLiked: inMemoryLikes.has(likeKey),
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      hasLiked: false,
    });
  }
}
