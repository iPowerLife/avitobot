import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { analyzeListing } from '@/lib/analyzer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listing_id } = body;

    if (!listing_id) {
      return NextResponse.json({ error: 'listing_id required' }, { status: 400 });
    }

    const { data: listing, error: fetchError } = await getSupabase()
      .from('listings')
      .select('*')
      .eq('id', listing_id)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const { data: allListings } = await getSupabase()
      .from('listings')
      .select('price')
      .eq('status', 'active')
      .eq('city', listing.city);

    const avgPrice = allListings && allListings.length > 0
      ? allListings.reduce((a, b) => a + b.price, 0) / allListings.length
      : listing.price;

    const analysis = analyzeListing(listing, avgPrice);

    const { error: updateError } = await getSupabase()
      .from('listings')
      .update({
        text_quality_score: analysis.text_quality_score,
        uniqueness_score: analysis.uniqueness_score,
        image_quality_score: analysis.image_quality_score,
        overall_score: analysis.overall_score,
        updated_at: new Date().toISOString(),
      })
      .eq('id', listing_id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      analysis: {
        text_quality_score: analysis.text_quality_score,
        image_quality_score: analysis.image_quality_score,
        overall_score: analysis.overall_score,
        word_count: analysis.word_count,
        has_structure: analysis.has_structure,
        keywords: analysis.keywords,
      },
    });
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
