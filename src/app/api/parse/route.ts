import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { searchListings, parseAll } from '@/lib/parser';
import { analyzeListing } from '@/lib/analyzer';

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

    let savedCount = 0;
    let newCount = 0;

    for (const listing of result.listings) {
      const { data: existing } = await getSupabase()
        .from('listings')
        .select('id, price')
        .eq('avito_id', listing.avito_id)
        .single();

      if (existing) {
        if (existing.price !== listing.price) {
          await getSupabase().from('price_history').insert({
            listing_id: existing.id,
            price: listing.price,
          });

          await getSupabase()
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
        const { data: inserted } = await getSupabase()
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
          const analysis = analyzeListing(listing);
          await getSupabase()
            .from('listings')
            .update({
              text_quality_score: analysis.text_quality_score,
              image_quality_score: analysis.image_quality_score,
              overall_score: analysis.overall_score,
            })
            .eq('id', inserted.id);

          await getSupabase().from('price_history').insert({
            listing_id: inserted.id,
            price: listing.price,
          });

          newCount++;
        }
      }
    }

    await getSupabase().from('search_queries').insert({
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
    });
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'Parse failed', details: String(error) },
      { status: 500 }
    );
  }
}
