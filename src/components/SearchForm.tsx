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

const SORT_OPTIONS = [
  { value: 'date', label: 'По дате' },
  { value: 'price_asc', label: 'Цена ↑' },
  { value: 'price_desc', label: 'Цена ↓' },
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
  const [onlyBusiness, setOnlyBusiness] = useState(false);
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
      onlyBusiness: onlyBusiness || undefined,
      keywords: keywords || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 24, marginBottom: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={{ display: 'block', fontSize: 13, color: '#a0a0b0', marginBottom: 6 }}>
            Поиск услуг
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Например: ремонт квартир, переезд..."
            className="input"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#a0a0b0', marginBottom: 6 }}>
            Город
          </label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="select"
            style={{ width: '100%' }}
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#a0a0b0', marginBottom: 6 }}>
            Сортировка
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="select"
            style={{ width: '100%' }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#a0a0b0', marginBottom: 6 }}>
            Цена от (₽)
          </label>
          <input
            type="number"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            placeholder="0"
            className="input"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#a0a0b0', marginBottom: 6 }}>
            Цена до (₽)
          </label>
          <input
            type="number"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            placeholder="∞"
            className="input"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#a0a0b0', marginBottom: 6 }}>
            Макс. страниц
          </label>
          <select
            value={maxPages}
            onChange={(e) => setMaxPages(parseInt(e.target.value))}
            className="select"
            style={{ width: '100%' }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#a0a0b0', marginBottom: 6 }}>
            Мин. рейтинг
          </label>
          <select
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            className="select"
            style={{ width: '100%' }}
          >
            <option value={0}>Все</option>
            <option value={1}>1+</option>
            <option value={2}>2+</option>
            <option value={3}>3+</option>
            <option value={4}>4+</option>
            <option value={5}>5</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#a0a0b0', marginBottom: 6 }}>
            Мин. просмотров
          </label>
          <select
            value={minViews}
            onChange={(e) => setMinViews(parseInt(e.target.value))}
            className="select"
            style={{ width: '100%' }}
          >
            <option value={0}>Все</option>
            <option value={10}>10+</option>
            <option value={50}>50+</option>
            <option value={100}>100+</option>
            <option value={500}>500+</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#a0a0b0', marginBottom: 6 }}>
            Мин. отзывов
          </label>
          <select
            value={minReviews}
            onChange={(e) => setMinReviews(parseInt(e.target.value))}
            className="select"
            style={{ width: '100%' }}
          >
            <option value={0}>Все</option>
            <option value={1}>1+</option>
            <option value={5}>5+</option>
            <option value={10}>10+</option>
            <option value={50}>50+</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, color: '#a0a0b0', marginBottom: 6 }}>
            Ключевые слова
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="Фильтр по словам..."
            className="input"
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#a0a0b0' }}>
            <input
              type="checkbox"
              checked={onlyWithPhotos}
              onChange={(e) => setOnlyWithPhotos(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            Только с фото
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#a0a0b0' }}>
            <input
              type="checkbox"
              checked={onlyBusiness}
              onChange={(e) => setOnlyBusiness(e.target.checked)}
              style={{ width: 16, height: 16 }}
            />
            Только бизнес
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Парсим...
              </>
            ) : (
              <>
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Найти
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
