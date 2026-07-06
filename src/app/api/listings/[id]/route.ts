import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await getSupabase()
      .from('listings')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const { data: priceHistory } = await getSupabase()
      .from('price_history')
      .select('*')
      .eq('listing_id', parseInt(id))
      .order('recorded_at', { ascending: true });

    return NextResponse.json({
      listing: data,
      priceHistory: priceHistory || [],
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    return NextResponse.json(
      { error: 'Failed to fetch listing' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await getSupabase()
      .from('listings')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ listing: data });
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: 'Failed to update listing' },
      { status: 500 }
    );
  }
}
