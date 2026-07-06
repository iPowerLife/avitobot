'use client';

import { useState } from 'react';
import { SearchParams } from '@/lib/types';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

const CITIES = [
  'Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург',
  'Казань', 'Нижний Новгород', 'Челябинск', 'Самара',
  'Омск', 'Ростов-на-Дону', 'Уфа', 'Красноярск',
  'Воронеж', 'Пермь', 'Волгоград',
];

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Москва');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState<'date' | 'price_asc' | 'price_desc'>('date');
  const [maxPages, setMaxPages] = useState(3);
  const [minRating, setMinRating] = useState(0);
  const [minViews, setMinViews] = useState(0);
  const [minReviews, setMinReviews] = useState(0);
  const [onlyWithPhotos, setOnlyWithPhotos] = useState(false);
  const [sellerType, setSellerType] = useState<'all' | 'private' | 'business'>('all');
  const [keywords, setKeywords] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch({
      query: query.trim(),
      city,
      priceMin: priceMin ? parseInt(priceMin) * 100 : undefined,
      priceMax: priceMax ? parseInt(priceMax) * 100 : undefined,
      sort,
      page: 1,
      maxPages,
      minRating: minRating || undefined,
      minViews: minViews || undefined,
      minReviews: minReviews || undefined,
      onlyWithPhotos: onlyWithPhotos || undefined,
      sellerType: sellerType !== 'all' ? sellerType : undefined,
      keywords: keywords || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 24, marginBottom: 24 }}>
      {/* Main row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Запрос</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ремонт квартир, переезд..."
            className="input"
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Город</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="select" style={{ width: '100%' }}>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Цена от</label>
          <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="0" className="input" style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Цена до</label>
          <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="∞" className="input" style={{ width: '100%' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Страниц</label>
          <select value={maxPages} onChange={(e) => setMaxPages(parseInt(e.target.value))} className="select" style={{ width: '100%' }}>
            {[1, 2, 3, 5, 7, 10].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Исполнитель</label>
          <select value={sellerType} onChange={(e) => setSellerType(e.target.value as typeof sellerType)} className="select">
            <option value="all">Все</option>
            <option value="private">Частный исполнитель</option>
            <option value="business">Компания / Команда</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Мин. рейтинг</label>
          <select value={minRating} onChange={(e) => setMinRating(parseFloat(e.target.value))} className="select">
            <option value={0}>Любой</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={4.5}>4.5+</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Мин. отзывов</label>
          <select value={minReviews} onChange={(e) => setMinReviews(parseInt(e.target.value))} className="select">
            <option value={0}>Любые</option>
            <option value={1}>1+</option>
            <option value={5}>5+</option>
            <option value={10}>10+</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 12, color: '#5a5a6a', marginBottom: 4 }}>Ключевые слова</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="забор, каркас..."
            className="input"
            style={{ width: 160 }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#a0a0b0', paddingBottom: 2 }}>
          <input
            type="checkbox"
            checked={onlyWithPhotos}
            onChange={(e) => setOnlyWithPhotos(e.target.checked)}
            style={{ width: 16, height: 16 }}
          />
          С фото
        </label>

        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}
        >
          {isLoading ? (
            <>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Парсим...
            </>
          ) : (
            <>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Найти
            </>
          )}
        </button>
      </div>
    </form>
  );
}
