import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import Papa from 'papaparse';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const format = searchParams.get('format') || 'csv';
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const limit = parseInt(searchParams.get('limit') || '1000');

    let query = getSupabase()
      .from('listings')
      .select('*')
      .eq('status', 'active')
      .order('overall_score', { ascending: false })
      .limit(limit);

    if (city) query = query.ilike('city', `%${city}%`);
    if (category) query = query.ilike('category', `%${category}%`);
    if (priceMin) query = query.gte('price', parseInt(priceMin));
    if (priceMax) query = query.lte('price', parseInt(priceMax));

    const { data: listings, error } = await query;

    if (error) throw error;

    if (!listings || listings.length === 0) {
      return NextResponse.json({ error: 'No data to export' }, { status: 404 });
    }

    if (format === 'json') {
      const jsonData = listings.map((l) => ({
        id: l.avito_id,
        title: l.title,
        description: l.description,
        price: l.price / 100,
        price_formatted: l.price_formatted,
        city: l.city,
        district: l.district,
        category: l.category,
        seller_name: l.seller_name,
        seller_type: l.seller_type,
        url: l.url,
        images: l.images?.length || 0,
        date_created: l.date_created,
        overall_score: l.overall_score,
        text_quality: l.text_quality_score,
        image_quality: l.image_quality_score,
      }));

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="avito_export_${Date.now()}.json"`,
        },
      });
    }

    const csvData = listings.map((l) => ({
      ID: l.avito_id,
      'Заголовок': l.title,
      'Описание': l.description?.substring(0, 200),
      'Цена (₽)': l.price / 100,
      'Город': l.city,
      'Район': l.district,
      'Категория': l.category,
      'Продавец': l.seller_name,
      'Тип продавца': l.seller_type === 'business' ? 'Бизнес' : 'Частное',
      'Ссылка': l.url,
      'Кол-во фото': l.images?.length || 0,
      'Дата создания': l.date_created,
      'Оценка': l.overall_score,
    }));

    const csv = Papa.unparse(csvData, { delimiter: ';' });

    return new NextResponse('\uFEFF' + csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="avito_export_${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}
