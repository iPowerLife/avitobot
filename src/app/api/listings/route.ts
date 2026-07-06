import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const sort = searchParams.get('sort') || 'date_parsed';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status') || 'active';
    const search = searchParams.get('search');
    const minRating = searchParams.get('minRating');
    const minViews = searchParams.get('minViews');
    const minReviews = searchParams.get('minReviews');

    let query = getSupabase()
      .from('listings')
      .select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (city) query = query.ilike('city', `%${city}%`);
    if (category) query = query.ilike('category', `%${category}%`);
    if (priceMin) query = query.gte('price', parseInt(priceMin));
    if (priceMax) query = query.lte('price', parseInt(priceMax));
    if (minRating) query = query.gte('seller_rating', parseFloat(minRating));
    if (minViews) query = query.gte('views_count', parseInt(minViews));
    if (minReviews) query = query.gte('seller_reviews_count', parseInt(minReviews));
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Determine sort column
    let sortColumn = 'date_parsed';
    let ascending = false;
    if (sort === 'price_asc') { sortColumn = 'price'; ascending = true; }
    else if (sort === 'price_desc') { sortColumn = 'price'; ascending = false; }
    else if (sort === 'overall_score') { sortColumn = 'overall_score'; ascending = false; }
    else if (sort === 'views_count') { sortColumn = 'views_count'; ascending = false; }
    else if (sort === 'date_parsed') { sortColumn = 'date_parsed'; ascending = false; }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .order(sortColumn, { ascending })
      .range(from, to);

    if (error) throw error;

    return NextResponse.json({
      listings: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    // Delete all listings
    if (all === 'true') {
      const { error } = await getSupabase()
        .from('listings')
        .delete()
        .neq('id', 0); // Delete all rows

      if (error) throw error;

      // Also delete price history
      await getSupabase()
        .from('price_history')
        .delete()
        .neq('id', 0);

      return NextResponse.json({ success: true, deleted: 'all' });
    }

    // Delete single listing
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const { error } = await getSupabase()
      .from('listings')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting listing:', error);
    return NextResponse.json(
      { error: 'Failed to delete listing' },
      { status: 500 }
    );
  }
}
