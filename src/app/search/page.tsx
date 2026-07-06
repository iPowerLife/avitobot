'use client';

import { useState } from 'react';
import SearchForm from '@/components/SearchForm';
import ListingCard from '@/components/ListingCard';
import { Listing, SearchParams } from '@/lib/types';
import { saveListings } from '@/lib/storage';

export default function SearchPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultInfo, setResultInfo] = useState<{ total: number; new: number; updated: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSearch(params: SearchParams) {
    setIsLoading(true);
    setError(null);
    setResultInfo(null);
    setListings([]);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ошибка парсинга');
      }

      setResultInfo({
        total: data.total,
        new: data.new,
        updated: data.updated,
      });

      const resultListings = data.listings || [];

      if (resultListings.length > 0) {
        // Assign IDs for localStorage storage
        const listingsWithIds = resultListings.map((l: Listing, i: number) => ({
          ...l,
          id: l.id || Date.now() + i,
        }));
        setListings(listingsWithIds);
        // Save to localStorage for listings/analytics pages
        saveListings(listingsWithIds);
      } else {
        // Fallback: fetch from database
        const listingsRes = await fetch(
          `/api/listings?search=${encodeURIComponent(params.query)}&city=${params.city || ''}&limit=50`
        );
        const listingsData = await listingsRes.json();
        setListings(listingsData.listings || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0f0f5', marginBottom: 8 }}>Поиск объявлений</h1>
      <p style={{ color: '#a0a0b0', marginBottom: 24 }}>
        Введите запрос для парсинга объявлений Авито
      </p>

      <SearchForm onSearch={handleSearch} isLoading={isLoading} />

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '12px 16px',
          borderRadius: 10,
          marginBottom: 24,
        }}>
          {error}
        </div>
      )}

      {resultInfo && (
        <div style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#22c55e',
          padding: '12px 16px',
          borderRadius: 10,
          marginBottom: 24,
        }}>
          <strong>Результат:</strong> Найдено {resultInfo.total} объявлений.{' '}
          Сохранено: {resultInfo.new + resultInfo.updated}
        </div>
      )}

      {listings.length > 0 && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#f0f0f5', marginBottom: 16 }}>
            Результаты ({listings.length})
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {listings.map((listing) => (
              <ListingCard
                key={listing.avito_id || listing.id}
                listing={listing}
                onClick={() => listing.url ? window.open(listing.url, '_blank') : null}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && listings.length === 0 && !resultInfo && !error && (
        <div style={{ textAlign: 'center', padding: '64px 0', color: '#5a5a6a' }}>
          <svg width="64" height="64" fill="none" stroke="#2a2a3a" viewBox="0 0 24 24" style={{ margin: '0 auto 16px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Введите запрос и нажмите «Найти»</p>
        </div>
      )}
    </div>
  );
}
