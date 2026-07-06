import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { searchListings } from '@/lib/parser';
import { analyzeListing } from '@/lib/analyzer';

const DEFAULT_QUERIES = [
  { query: 'ремонт квартир', city: 'Москва' },
  { query: 'переезд', city: 'Москва' },
  { query: 'уборка квартир', city: 'Москва' },
  { query: 'ремонт квартир', city: 'Санкт-Петербург' },
  { query: 'установка дверей', city: 'Москва' },
];

export async function GET() {
  try {
    let totalParsed = 0;
    let totalNew = 0;

    for (const { query, city } of DEFAULT_QUERIES) {
      try {
        const result = await searchListings({
          query,
          city,
          page: 1,
        });

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

              totalNew++;
            }
          }

          totalParsed++;
        }
      } catch (error) {
        console.error(`Cron parse error for "${query}":`, error);
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    await getSupabase().from('search_queries').insert({
      query: 'cron_auto',
      city: 'all',
      category: 'Услуги',
      results_count: totalParsed,
    });

    return NextResponse.json({
      success: true,
      totalParsed,
      totalNew,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json(
      { error: 'Cron failed', details: String(error) },
      { status: 500 }
    );
  }
}
