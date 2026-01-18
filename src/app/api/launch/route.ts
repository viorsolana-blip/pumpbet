import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured, DBPendingPrediction } from '@/lib/supabase';

// In-memory storage for when Supabase is not configured
// Note: image_url is null for mock data - cards will show category icons instead
// Exported so the like route can access the same data
export const inMemoryPredictions: DBPendingPrediction[] = [
  {
    id: 'pred-1',
    title: 'Will PEPE hit $10B market cap?',
    description: 'Predicting if PEPE memecoin will reach $10 billion market cap before Q2 2026',
    category: 'crypto',
    resolution_criteria: 'CoinGecko market cap data on the specified date',
    end_date: '2026-06-30T00:00:00.000Z',
    likes: 12,
    created_by: null,
    is_graduated: false,
    graduated_market_id: null,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: null,
  },
  {
    id: 'pred-2',
    title: 'Ansem tweets 5 times about SOL this week',
    description: 'Will Ansem post at least 5 tweets mentioning SOL/Solana on his main account this week?',
    category: 'kol',
    resolution_criteria: 'Count tweets from @blknoiz06 mentioning SOL/Solana',
    end_date: '2026-01-25T00:00:00.000Z',
    likes: 8,
    created_by: 'Ank8...x9Pz',
    is_graduated: false,
    graduated_market_id: null,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: null,
  },
  {
    id: 'pred-3',
    title: 'Trump mentions crypto in State of Union',
    description: 'Will Trump mention cryptocurrency, Bitcoin, or blockchain in the 2026 State of the Union address?',
    category: 'politics',
    resolution_criteria: 'Official transcript of the State of the Union address',
    end_date: '2026-03-01T00:00:00.000Z',
    likes: 14,
    created_by: null,
    is_graduated: false,
    graduated_market_id: null,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: null,
  },
  {
    id: 'pred-4',
    title: 'New AI token launches and 10x in 24h',
    description: 'Will any new AI-related token launched this month achieve 10x gains within 24 hours of launch?',
    category: 'token',
    resolution_criteria: 'DEXScreener data for new AI token launches',
    end_date: '2026-01-31T00:00:00.000Z',
    likes: 5,
    created_by: 'BrX2...m4Kp',
    is_graduated: false,
    graduated_market_id: null,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    image_url: null,
  },
  {
    id: 'pred-5',
    title: 'Chiefs win Super Bowl LX',
    description: 'Will the Kansas City Chiefs win Super Bowl LX?',
    category: 'sports',
    resolution_criteria: 'Official NFL Super Bowl results',
    end_date: '2026-02-10T00:00:00.000Z',
    likes: 3,
    created_by: null,
    is_graduated: false,
    graduated_market_id: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    image_url: null,
  },
];

export const inMemoryLikes: Set<string> = new Set(); // "predictionId:userIdentifier"

// GET - Fetch all pending predictions
export async function GET(request: NextRequest) {
  try {
    // Try Supabase first
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('pending_predictions')
        .select('*')
        .eq('is_graduated', false)
        .order('likes', { ascending: false });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        predictions: data || [],
      });
    }

    // Fallback to in-memory
    const activePredictions = inMemoryPredictions.filter(p => !p.is_graduated);
    activePredictions.sort((a, b) => b.likes - a.likes);

    return NextResponse.json({
      success: true,
      predictions: activePredictions,
    });
  } catch (error) {
    console.error('Error fetching pending predictions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}

// POST - Create a new pending prediction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, resolutionCriteria, endDate, createdBy, imageUrl } = body;

    // Validate required fields
    if (!title || !description || !category || !resolutionCriteria || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate title length
    if (title.length < 10 || title.length > 200) {
      return NextResponse.json(
        { success: false, error: 'Title must be between 10 and 200 characters' },
        { status: 400 }
      );
    }

    // Validate end date is in the future
    const endDateTime = new Date(endDate);
    if (endDateTime <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'End date must be in the future' },
        { status: 400 }
      );
    }

    const newPrediction: DBPendingPrediction = {
      id: `pred-${Date.now()}`,
      title,
      description,
      category,
      resolution_criteria: resolutionCriteria,
      end_date: endDateTime.toISOString(),
      likes: 0,
      created_by: createdBy || null,
      is_graduated: false,
      graduated_market_id: null,
      created_at: new Date().toISOString(),
      image_url: imageUrl || null,
    };

    // Try Supabase first
    if (isSupabaseConfigured() && supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('pending_predictions')
        .insert({
          title: newPrediction.title,
          description: newPrediction.description,
          category: newPrediction.category,
          resolution_criteria: newPrediction.resolution_criteria,
          end_date: newPrediction.end_date,
          likes: 0,
          created_by: newPrediction.created_by,
          is_graduated: false,
          image_url: newPrediction.image_url,
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        prediction: data,
        message: 'Prediction created! Get 15 likes to go live.',
      });
    }

    // Fallback to in-memory
    inMemoryPredictions.unshift(newPrediction);

    return NextResponse.json({
      success: true,
      prediction: newPrediction,
      message: 'Prediction created! Get 15 likes to go live.',
    });
  } catch (error) {
    console.error('Error creating prediction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create prediction' },
      { status: 500 }
    );
  }
}
