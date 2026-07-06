import { NextRequest, NextResponse } from 'next/server';
import { searchListings } from '@/lib/parser';
import { analyzeListing } from '@/lib/analyzer';

function isSupabaseConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, city, priceMin, priceMax, sort, maxPages = 3 } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    const result = await searchListings({
      query,
      city: city || 'Москва',
      priceMin,
      priceMax,
      sort: sort || 'date',
      page: 1,
    });

    // Analyze each listing
    const analyzedListings = result.listings.map((listing) => {
      const analysis = analyzeListing(listing);
      return {
        ...listing,
        text_quality_score: analysis.text_quality_score,
        image_quality_score: analysis.image_quality_score,
        overall_score: analysis.overall_score,
      };
    });

    // If Supabase is configured, save to database
    if (isSupabaseConfigured()) {
      try {
        const { getSupabase } = await import('@/lib/db');
        const supabase = getSupabase();

        let savedCount = 0;
        let newCount = 0;

        for (const listing of analyzedListings) {
          const { data: existing } = await supabase
            .from('listings')
            .select('id, price')
            .eq('avito_id', listing.avito_id)
            .single();

          if (existing) {
            if (existing.price !== listing.price) {
              await supabase.from('price_history').insert({
                listing_id: existing.id,
                price: listing.price,
              });

              await supabase
                .from('listings')
                .update({
                  price: listing.price,
                  price_formatted: listing.price_formatted,
                  date_updated: new Date().toISOString(),
                })
                .eq('id', existing.id);
            }
            savedCount++;
          } else {
            const { data: inserted } = await supabase
              .from('listings')
              .insert({
                ...listing,
                image_count: listing.images?.length || 0,
                date_parsed: new Date().toISOString(),
                date_updated: new Date().toISOString(),
              })
              .select()
              .single();

            if (inserted) {
              const listingAnalysis = analyzeListing(listing);
              await supabase
                .from('listings')
                .update({
                  text_quality_score: listingAnalysis.text_quality_score,
                  image_quality_score: listingAnalysis.image_quality_score,
                  overall_score: listingAnalysis.overall_score,
                })
                .eq('id', inserted.id);

              await supabase.from('price_history').insert({
                listing_id: inserted.id,
                price: listing.price,
              });

              newCount++;
            }
          }
        }

        await supabase.from('search_queries').insert({
          query,
          city: city || 'Москва',
          category: 'Услуги',
          results_count: result.listings.length,
        });

        return NextResponse.json({
          success: true,
          total: result.listings.length,
          new: newCount,
          updated: savedCount,
          hasMore: result.hasMore,
          listings: analyzedListings,
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        // Fall through to return listings without saving
      }
    }

    // Return listings without saving to database
    return NextResponse.json({
      success: true,
      total: result.listings.length,
      new: result.listings.length,
      updated: 0,
      hasMore: result.hasMore,
      listings: analyzedListings,
    });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'Parse failed', details: String(error) },
      { status: 500 }
    );
  }
}
