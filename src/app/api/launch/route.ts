import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured, DBPendingPrediction } from '@/lib/supabase';
import { inMemoryPredictions } from '@/lib/launch-store';

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
