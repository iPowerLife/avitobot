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
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'active';
    const search = searchParams.get('search');

    let query = getSupabase()
      .from('listings')
      .select('*', { count: 'exact' });

    if (status) query = query.eq('status', status);
    if (city) query = query.ilike('city', `%${city}%`);
    if (category) query = query.ilike('category', `%${category}%`);
    if (priceMin) query = query.gte('price', parseInt(priceMin));
    if (priceMax) query = query.lte('price', parseInt(priceMax));
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, count, error } = await query
      .order(sort === 'date' ? 'date_parsed' : sort === 'price_asc' || sort === 'price_desc' ? 'price' : 'overall_score', {
        ascending: sort === 'price_asc',
      })
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
