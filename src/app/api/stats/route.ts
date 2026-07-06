import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { median, calculateTrend } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const period = searchParams.get('period') || '30d';

    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '365d': 365,
    };
    const days = daysMap[period] || 30;
    const dateFrom = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    let query = getSupabase()
      .from('listings')
      .select('price, city, category, date_parsed')
      .eq('status', 'active')
      .gte('date_parsed', dateFrom);

    if (city) query = query.ilike('city', `%${city}%`);
    if (category) query = query.ilike('category', `%${category}%`);

    const { data: listings, error } = await query;

    if (error) throw error;

    if (!listings || listings.length === 0) {
      return NextResponse.json({
        avg_price: 0,
        min_price: 0,
        max_price: 0,
        median_price: 0,
        total_listings: 0,
        trend: 'stable',
        price_history: [],
      });
    }

    const prices = listings.map((l) => l.price).filter((p) => p > 0);
    const avg_price = prices.length > 0
      ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
      : 0;

    const priceByDate: Record<string, number[]> = {};
    listings.forEach((l) => {
      if (l.price > 0) {
        const date = l.date_parsed.split('T')[0];
        if (!priceByDate[date]) priceByDate[date] = [];
        priceByDate[date].push(l.price);
      }
    });

    const price_history = Object.entries(priceByDate)
      .map(([date, p]) => ({
        date,
        price: Math.round(p.reduce((a, b) => a + b, 0) / p.length),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const trend = calculateTrend(price_history);

    return NextResponse.json({
      avg_price,
      min_price: Math.min(...prices),
      max_price: Math.max(...prices),
      median_price: median(prices),
      total_listings: listings.length,
      trend,
      price_history,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
